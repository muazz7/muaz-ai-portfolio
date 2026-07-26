/**
 * Provider resolution.
 *
 * Every provider here speaks the OpenAI Chat Completions dialect, so the whole
 * app has exactly one code path for streaming and tool calling. Switching from
 * Gemini to Groq to OpenAI is two lines in `.env.local`.
 */

export type ProviderId = 'google' | 'groq' | 'xai' | 'openai' | 'openrouter' | 'deepseek' | 'custom';

interface ProviderPreset {
  baseUrl: string;
  /**
   * Ordered candidate models. The agent walks this list when a model is
   * unavailable or out of quota, which matters a lot on free tiers where a
   * single model can be capped at a few dozen requests per day.
   */
  defaultModel: string;
  label: string;
  /** Some gateways want extra headers to attribute traffic. */
  extraHeaders?: Record<string, string>;
}

const PRESETS: Record<Exclude<ProviderId, 'custom'>, ProviderPreset> = {
  google: {
    label: 'Google Gemini',
    // Google's OpenAI-compatible surface.
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    // Lite first: ~1s replies versus ~15s for full flash, which thinks before
    // it speaks. The heavier models are kept as quota fallbacks.
    // gemini-2.5-flash is deliberately absent - it is closed to new API keys.
    defaultModel: 'gemini-3.5-flash-lite,gemini-flash-lite-latest,gemini-3.5-flash,gemini-flash-latest',
  },
  groq: {
    label: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    // Groq keys start with `gsk_`. Not to be confused with xAI (`xai-`).
    // llama-3.3-70b-versatile was deprecated for free/developer tiers in June
    // 2026 and is scheduled to stop serving on 2026-08-16, so the gpt-oss
    // models lead here. The llama entry stays last as a stopgap for accounts
    // that can still reach it.
    defaultModel: 'openai/gpt-oss-120b,openai/gpt-oss-20b,llama-3.3-70b-versatile',
  },
  xai: {
    label: 'xAI Grok',
    baseUrl: 'https://api.x.ai/v1',
    // xAI has no free tier - the team needs purchased credits or every request
    // comes back `permission-denied` regardless of model.
    defaultModel: 'grok-4-fast-non-reasoning,grok-3-mini',
  },
  openai: {
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4.1-mini',
  },
  openrouter: {
    label: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-2.0-flash-001',
    extraHeaders: { 'X-Title': 'Muaz AI Portfolio' },
  },
  deepseek: {
    label: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
  },
};

export interface ResolvedProvider {
  id: ProviderId;
  label: string;
  baseUrl: string;
  /** Primary model - always `models[0]`. Kept for labels and error messages. */
  model: string;
  /** Primary plus ordered fallbacks, from a comma-separated `AI_MODEL`. */
  models: string[];
  apiKey: string;
  extraHeaders: Record<string, string>;
}

/** Splits a comma-separated model list, dropping blanks and duplicates. */
function parseModels(raw: string): string[] {
  const seen = new Set<string>();
  for (const part of raw.split(',')) {
    const name = part.trim();
    if (name) seen.add(name);
  }
  return [...seen];
}

/** Provider-specific env var names, checked when building the backup chain. */
const KEY_ENV: Record<Exclude<ProviderId, 'custom'>, string[]> = {
  google: ['GOOGLE_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY', 'GEMINI_API_KEY'],
  groq: ['GROQ_API_KEY'],
  xai: ['XAI_API_KEY', 'GROK_API_KEY'],
  openai: ['OPENAI_API_KEY'],
  openrouter: ['OPENROUTER_API_KEY'],
  deepseek: ['DEEPSEEK_API_KEY'],
};

function firstEnv(names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return '';
}

function build(id: ProviderId, apiKey: string, modelOverride?: string): ResolvedProvider | null {
  if (id === 'custom') {
    const baseUrl = process.env.AI_BASE_URL?.trim();
    if (!baseUrl) return null;
    const models = parseModels(modelOverride || 'gpt-4o-mini');
    return {
      id,
      label: 'Custom endpoint',
      baseUrl: baseUrl.replace(/\/$/, ''),
      model: models[0],
      models,
      apiKey,
      extraHeaders: {},
    };
  }

  const preset = PRESETS[id as Exclude<ProviderId, 'custom'>] ?? PRESETS.google;
  const models = parseModels(modelOverride || preset.defaultModel);

  return {
    id,
    label: preset.label,
    baseUrl: preset.baseUrl,
    model: models[0],
    models,
    apiKey,
    extraHeaders: preset.extraHeaders ?? {},
  };
}

/**
 * Returns every usable provider, best first.
 *
 * The primary comes from `AI_PROVIDER` + `AI_API_KEY`. Any *other* provider with
 * its own key in the environment is appended as a backup, because free tiers are
 * metered per provider as well as per model - when Gemini's daily allowance is
 * gone, a second provider keeps the site answering fluently instead of dropping
 * to the local retrieval engine.
 *
 * An empty array is not an error: the route uses the local engine, so the site
 * works with zero configuration.
 */
export function resolveProviders(): ResolvedProvider[] {
  const chain: ResolvedProvider[] = [];
  const used = new Set<ProviderId>();

  // --- Primary, as configured ----------------------------------------------
  const primaryKey = process.env.AI_API_KEY?.trim() || '';
  if (primaryKey) {
    const id = (process.env.AI_PROVIDER?.trim().toLowerCase() || inferProvider(primaryKey)) as ProviderId;
    const provider = build(id, primaryKey, process.env.AI_MODEL?.trim());
    if (provider) {
      chain.push(provider);
      used.add(id);
    }
  }

  // --- Backups, from provider-specific keys --------------------------------
  for (const [id, names] of Object.entries(KEY_ENV) as [Exclude<ProviderId, 'custom'>, string[]][]) {
    if (used.has(id)) continue;
    const key = firstEnv(names);
    if (!key) continue;
    // A backup never inherits AI_MODEL - that belongs to the primary provider.
    const provider = build(id, key);
    if (provider) {
      chain.push(provider);
      used.add(id);
    }
  }

  return chain;
}

/**
 * Best-guess provider when AI_PROVIDER is unset. Key prefixes are distinctive
 * enough to identify, and getting this right avoids pointing a key at the wrong
 * endpoint - the failure mode there is a confusing 401.
 */
function inferProvider(apiKey: string): ProviderId {
  if (apiKey.startsWith('gsk_')) return 'groq';
  if (apiKey.startsWith('xai-')) return 'xai';
  if (apiKey.startsWith('sk-or-')) return 'openrouter';
  if (apiKey.startsWith('sk-')) return 'openai';
  return 'google';
}
