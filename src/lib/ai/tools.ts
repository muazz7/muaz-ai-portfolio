/**
 * Tool definitions.
 *
 * These are the "generative UI" hooks. When the model calls one, two things
 * happen: the compact JSON result goes back into the conversation so the model
 * can talk about it, and the tool *name* is streamed to the browser, which
 * mounts a real React component in place of the raw payload.
 *
 * Adding a tool = add a schema here, add a case in `components/chat/tool-renderer`.
 *
 * Every tool takes an optional `focus`. A narrow question ("what's your WhatsApp
 * number?") should pass it, and then both halves of the answer narrow with it:
 * the payload carries only the requested slice, and the component renders only
 * that slice. `focus` is echoed back in the result so the browser can mirror the
 * model's choice without re-parsing arguments.
 */

import {
  CONTACT_CHANNEL_IDS,
  CONTACT_CHANNELS,
  PROFILE,
  findChannel,
} from '@/lib/data/profile';
import { PROJECTS, FEATURED_PROJECTS, PROJECT_SLUGS, findProject } from '@/lib/data/projects';
import { SKILL_FOCUS_IDS, SKILL_GROUPS, LEARNING_NOW, findSkillGroup } from '@/lib/data/skills';
import type { ToolName } from './protocol';

export interface ToolSchema {
  type: 'function';
  function: {
    name: ToolName;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required: string[];
      additionalProperties: false;
    };
  };
}

const noArgs = {
  type: 'object' as const,
  properties: {},
  required: [] as string[],
  additionalProperties: false as const,
};

/** Shorthand for the common "one optional enum-constrained focus" parameter. */
function focusArg(values: readonly string[], description: string) {
  return {
    type: 'object' as const,
    properties: {
      focus: { type: 'string', enum: [...values], description },
    },
    required: [] as string[],
    additionalProperties: false as const,
  };
}

const RESUME_FOCUS = ['education', 'roles'] as const;
const INTERNSHIP_FOCUS = ['lookingFor', 'workStyle', 'startDate', 'focusAreas'] as const;
const SPORTS_FOCUS = ['hobbies', 'interests'] as const;

export const TOOL_SCHEMAS: ToolSchema[] = [
  {
    type: 'function',
    function: {
      name: 'getPresentation',
      description:
        "Show Muaz's personal introduction card. Call this only for a genuinely broad question about him - \"who are you\", \"introduce yourself\", \"tell me about yourself\". For a single fact (where he lives, what he studies, his name) just answer in text; do not mount the whole card.",
      parameters: noArgs,
    },
  },
  {
    type: 'function',
    function: {
      name: 'getProjects',
      description:
        "Show Muaz's work on screen. Pass `focus` with a project's slug whenever the question is about ONE project - then only that project is rendered. Omit `focus` only when the visitor wants the whole portfolio ('what have you built', 'show me your projects'), which renders the full gallery.",
      parameters: focusArg(
        PROJECT_SLUGS,
        'Slug of the single project the visitor is asking about. Renders that project alone instead of the gallery. Must be one of the listed slugs - never a title.',
      ),
    },
  },
  {
    type: 'function',
    function: {
      name: 'getSkills',
      description:
        "Show Muaz's technical skills. Pass `focus` with one group when the question is about one area or one technology - 'do you know Flutter' is mobile, 'what do you use for animation' is styling, 'what are you learning' is learning. Omit `focus` only for a broad 'what's your stack' question, which renders the whole board.",
      parameters: focusArg(
        SKILL_FOCUS_IDS,
        'The one skill group the question is about. Renders that group alone instead of all six.',
      ),
    },
  },
  {
    type: 'function',
    function: {
      name: 'getResume',
      description:
        "Show Muaz's resume card. Pass `focus: 'education'` for questions only about his degree or schooling, or `focus: 'roles'` for questions only about his work history. Omit `focus` for a broad resume or CV request.",
      parameters: focusArg(RESUME_FOCUS, 'Render only one section of the resume.'),
    },
  },
  {
    type: 'function',
    function: {
      name: 'getContact',
      description:
        "Show how to reach Muaz. Pass `focus` with ONE channel whenever the visitor asks for one specific thing - 'what's your WhatsApp number' is whatsapp, 'what's your email' is email, 'are you on Instagram' is instagram. Then only that one detail is shown. Omit `focus` only for a broad 'how do I get in touch' question.",
      parameters: focusArg(
        CONTACT_CHANNEL_IDS,
        'The single contact channel the visitor asked for. Renders only that detail instead of every channel.',
      ),
    },
  },
  {
    type: 'function',
    function: {
      name: 'getSports',
      description:
        "Show what Muaz does away from the keyboard. Pass `focus: 'hobbies'` for what he does in his free time, or `focus: 'interests'` for what holds his attention. Omit `focus` for a broad 'what do you do outside code' question.",
      parameters: focusArg(SPORTS_FOCUS, 'Render only one half of the off-keyboard card.'),
    },
  },
  {
    type: 'function',
    function: {
      name: 'getCrazy',
      description:
        "Show the fun / surprising side of Muaz. Pass `limit: 1` when the visitor asked for ONE thing ('tell me a fun fact', 'what's the craziest thing you've built'). Omit `limit` only when they want the whole list.",
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 6,
            description: 'How many fun facts to show. Use 1 when the visitor asked for a single one.',
          },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getInternship',
      description:
        "Show Muaz's availability. Pass `focus` when the question is about one thing only - 'when can you start' is startDate, 'do you work remote' is workStyle, 'what roles do you want' is lookingFor. Omit `focus` for a broad 'are you open to work' question.",
      parameters: focusArg(INTERNSHIP_FOCUS, 'Render only the one availability detail that was asked about.'),
    },
  },
];

/** Reads a string `focus` argument, ignoring anything else the model sent. */
function readFocusArg(args: Record<string, unknown>): string | null {
  return typeof args.focus === 'string' && args.focus.trim() ? args.focus.trim() : null;
}

/**
 * Executes a tool. Payloads are intentionally compact - the browser already has
 * the full dataset bundled, so we only send the model what it needs to narrate.
 *
 * When a tool is focused the payload contains ONLY the focused slice. That is
 * deliberate: if the model cannot see the other channels or groups, it will not
 * start listing them.
 */
export function executeTool(name: ToolName, args: Record<string, unknown> = {}): unknown {
  const focusArgValue = readFocusArg(args);

  switch (name) {
    case 'getPresentation':
      return {
        name: PROFILE.fullName,
        goesBy: PROFILE.name,
        title: PROFILE.title,
        location: PROFILE.location,
        from: PROFILE.hometown,
        studying: `${PROFILE.education[0].credential} at ${PROFILE.education[0].institution}`,
        headline: PROFILE.headline,
        summary: PROFILE.story.short,
      };

    case 'getProjects': {
      // `focus` should already be a slug, but resolve loosely so a title or a
      // near-miss still lands on the right project instead of silently falling
      // back to the whole gallery.
      const highlighted = findProject(focusArgValue);

      if (highlighted) {
        return {
          focus: highlighted.slug,
          highlighted: {
            slug: highlighted.slug,
            title: highlighted.title,
            tagline: highlighted.tagline,
            description: highlighted.description,
            tech: highlighted.tech,
            live: highlighted.live,
            repo: highlighted.repo,
            status: highlighted.status,
            year: highlighted.year,
          },
          note: `Only ${highlighted.title} is on screen. Talk about this one project - do not list others unless the visitor asks.`,
        };
      }

      return {
        focus: null,
        total: PROJECTS.length,
        featured: FEATURED_PROJECTS.map((p) => ({
          slug: p.slug,
          title: p.title,
          tagline: p.tagline,
          tech: p.tech,
          live: p.live,
          status: p.status,
        })),
        note: 'The full interactive gallery is now rendered on screen for the visitor.',
      };
    }

    case 'getSkills': {
      const group = findSkillGroup(focusArgValue);

      if (group === 'learning') {
        return {
          focus: 'learning',
          learningNow: LEARNING_NOW,
          note: 'Only the "levelling up" list is on screen. Stick to what he is currently learning.',
        };
      }

      if (group) {
        return {
          focus: group.id,
          group: { title: group.title, skills: group.skills },
          note: `Only the ${group.title} group is on screen. Talk about these skills, not the rest of the stack.`,
        };
      }

      return {
        focus: null,
        groups: SKILL_GROUPS.map((g) => ({ title: g.title, skills: g.skills })),
        learningNow: LEARNING_NOW,
      };
    }

    case 'getResume': {
      const focus = focusArgValue === 'education' || focusArgValue === 'roles' ? focusArgValue : null;
      const education = PROFILE.education.map((e) => ({
        period: e.period,
        credential: e.credential,
        institution: e.institution,
      }));
      const roles = PROFILE.roles.map((r) => ({ role: r.role, org: r.org, period: r.period }));

      if (focus === 'education') {
        return { focus, education, note: 'Only the education section is on screen.' };
      }
      if (focus === 'roles') {
        return { focus, roles, note: 'Only the roles section is on screen.' };
      }

      return {
        focus: null,
        name: PROFILE.fullName,
        title: PROFILE.title,
        location: PROFILE.location,
        email: PROFILE.email,
        education,
        roles,
        highlights: [
          '17 public repositories on GitHub',
          'Seven websites shipped for other people',
          'Five portfolios live on my own domain, muaz.pro',
        ],
      };
    }

    case 'getContact': {
      const channel = findChannel(focusArgValue);

      if (channel) {
        return {
          focus: channel.id,
          [channel.id]: channel.value,
          link: channel.href,
          note: `Only ${channel.label} is on screen. Give the visitor this one detail - do not list the other channels.`,
        };
      }

      return {
        focus: null,
        channels: CONTACT_CHANNELS.map((c) => ({ label: c.label, value: c.value })),
        location: PROFILE.location,
        responseTime: 'Usually within a day, faster on WhatsApp.',
      };
    }

    case 'getSports': {
      const focus = focusArgValue === 'hobbies' || focusArgValue === 'interests' ? focusArgValue : null;

      if (focus === 'hobbies') {
        return { focus, items: PROFILE.offKeyboard.items, caveat: PROFILE.offKeyboard.note };
      }
      if (focus === 'interests') {
        return { focus, interests: PROFILE.interests };
      }

      return {
        focus: null,
        headline: PROFILE.offKeyboard.headline,
        items: PROFILE.offKeyboard.items,
        interests: PROFILE.interests,
        caveat: PROFILE.offKeyboard.note,
      };
    }

    case 'getCrazy': {
      const raw = typeof args.limit === 'number' ? Math.floor(args.limit) : null;
      const limit = raw && raw > 0 ? Math.min(raw, PROFILE.funFacts.length) : null;
      const funFacts = limit ? PROFILE.funFacts.slice(0, limit) : PROFILE.funFacts;

      return {
        limit,
        funFacts,
        // Without this the model picks a different fact than the card shows.
        ...(limit
          ? {
              note: `Only the ${limit === 1 ? 'single fact' : `${limit} facts`} listed in funFacts is on screen. Talk about exactly that - do not substitute a different fact or recite the others.`,
            }
          : {}),
      };
    }

    case 'getInternship': {
      const { availability } = PROFILE;
      const single: Record<string, string> = {
        lookingFor: availability.lookingFor,
        workStyle: availability.workStyle,
        startDate: availability.startDate,
        focusAreas: availability.focus,
      };

      if (focusArgValue && focusArgValue in single) {
        return {
          focus: focusArgValue,
          open: availability.open,
          [focusArgValue]: single[focusArgValue],
          note: 'Only this one detail is on screen. Answer just that.',
        };
      }

      return {
        focus: null,
        open: availability.open,
        lookingFor: availability.lookingFor,
        workStyle: availability.workStyle,
        startDate: availability.startDate,
        focus_areas: availability.focus,
        email: PROFILE.email,
      };
    }

    default:
      return { error: `Unknown tool: ${String(name)}` };
  }
}
