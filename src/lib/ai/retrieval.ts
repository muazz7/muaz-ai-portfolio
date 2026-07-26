/**
 * Lexical retrieval (Okapi BM25) over the knowledge corpus.
 *
 * Why BM25 and not embeddings? The corpus is a few dozen short chunks about one
 * person. BM25 is exact, instant, free, needs no external service, and adds
 * zero cold-start latency on a serverless function. Embeddings would be more
 * machinery for a measurably worse trade-off at this size.
 */

import { KNOWLEDGE, type KnowledgeChunk } from '@/lib/data/knowledge';

const K1 = 1.5;
const B = 0.75;

const STOPWORDS = new Set([
  'a','about','above','after','again','all','am','an','and','any','are','as','at','be','because','been','before',
  'being','below','between','both','but','by','can','did','do','does','doing','down','during','each','few','for',
  'from','further','had','has','have','having','he','her','here','hers','him','his','how','i','if','in','into','is',
  'it','its','just','me','more','most','my','no','nor','not','now','of','off','on','once','only','or','other','our',
  'out','over','own','same','she','should','so','some','such','than','that','the','their','them','then','there',
  'these','they','this','those','through','to','too','under','until','up','very','was','we','were','what','when',
  'where','which','while','who','whom','why','will','with','would','you','your','yours','tell','give','show','know',
  'like','want','get','got','also','really','please','could','make','made',
]);

/** Cheap suffix stripping - enough to match "projects"/"project", "built"/"build". */
function stem(word: string): string {
  if (word.length <= 3) return word;
  for (const suffix of ['ingly', 'edly', 'ing', 'ies', 'ied', 'ers', 'er', 'ed', 'es', 's']) {
    if (word.length - suffix.length >= 3 && word.endsWith(suffix)) {
      const base = word.slice(0, -suffix.length);
      return suffix === 'ies' || suffix === 'ied' ? `${base}y` : base;
    }
  }
  return word;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/[\s\-.]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem);
}

interface IndexedDoc {
  chunk: KnowledgeChunk;
  termFreq: Map<string, number>;
  length: number;
}

/** Built once per server instance at module load. */
const INDEX: {
  docs: IndexedDoc[];
  docFreq: Map<string, number>;
  avgLength: number;
} = (() => {
  const docs: IndexedDoc[] = KNOWLEDGE.map((chunk) => {
    // Weight topic and tags more heavily by repeating them - a crude but very
    // effective field boost without needing a multi-field scorer.
    const raw = `${chunk.topic} ${chunk.topic} ${chunk.tags.join(' ')} ${chunk.tags.join(' ')} ${chunk.text}`;
    const tokens = tokenize(raw);
    const termFreq = new Map<string, number>();
    for (const token of tokens) termFreq.set(token, (termFreq.get(token) ?? 0) + 1);
    return { chunk, termFreq, length: tokens.length };
  });

  const docFreq = new Map<string, number>();
  for (const doc of docs) {
    for (const term of doc.termFreq.keys()) docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
  }

  const avgLength = docs.reduce((sum, d) => sum + d.length, 0) / Math.max(1, docs.length);
  return { docs, docFreq, avgLength };
})();

export interface RetrievalHit {
  chunk: KnowledgeChunk;
  score: number;
}

/** Every term the corpus knows about - used to spot off-topic questions. */
export const CORPUS_TERMS: ReadonlySet<string> = new Set(INDEX.docFreq.keys());

/**
 * Fraction of a query's content words that exist anywhere in the corpus.
 * Near zero means the visitor asked about something unrelated to Muaz.
 */
export function topicality(query: string): number {
  const terms = tokenize(query);
  if (terms.length === 0) return 0;
  const known = terms.filter((t) => CORPUS_TERMS.has(t)).length;
  return known / terms.length;
}

/** Fraction of a query's terms that the given chunk actually contains. */
export function coverage(query: string, chunk: KnowledgeChunk): number {
  const terms = tokenize(query);
  if (terms.length === 0) return 0;
  const doc = INDEX.docs.find((d) => d.chunk.id === chunk.id);
  if (!doc) return 0;
  const hit = terms.filter((t) => doc.termFreq.has(t)).length;
  return hit / terms.length;
}

export function chunkById(id: string): KnowledgeChunk | undefined {
  return KNOWLEDGE.find((c) => c.id === id);
}

/** Top-k knowledge chunks for a query, best first. Empty when nothing matches. */
export function retrieve(query: string, k = 8): RetrievalHit[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const N = INDEX.docs.length;
  const hits: RetrievalHit[] = [];

  for (const doc of INDEX.docs) {
    let score = 0;

    for (const term of terms) {
      const tf = doc.termFreq.get(term);
      if (!tf) continue;
      const df = INDEX.docFreq.get(term) ?? 0;
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      const norm = tf + K1 * (1 - B + (B * doc.length) / INDEX.avgLength);
      score += idf * ((tf * (K1 + 1)) / norm);
    }

    if (score > 0) hits.push({ chunk: doc.chunk, score });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, k);
}

/**
 * Formats hits for injection into the system prompt. Always returns something
 * useful: if retrieval finds nothing we fall back to the core identity chunks
 * so the model is never left guessing.
 */
export function buildContext(query: string, k = 8): { text: string; ids: string[] } {
  let hits = retrieve(query, k);

  if (hits.length === 0) {
    const fallbackIds = ['who-am-i', 'stack', 'projects-overview', 'contact'];
    hits = KNOWLEDGE.filter((c) => fallbackIds.includes(c.id)).map((chunk) => ({ chunk, score: 0 }));
  }

  const text = hits.map((h) => `- [${h.chunk.topic}] ${h.chunk.text}`).join('\n');
  return { text, ids: hits.map((h) => h.chunk.id) };
}
