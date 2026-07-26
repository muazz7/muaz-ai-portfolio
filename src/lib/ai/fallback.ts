/**
 * The no-API-key engine.
 *
 * The site is fully usable before you configure a provider: this module answers
 * from the knowledge corpus directly using BM25 retrieval plus a keyword intent
 * classifier, and streams it with the same protocol so the UI cannot tell the
 * difference. Answers are less fluent than a real model, but they are never
 * wrong - every sentence is text you wrote yourself.
 */

import { CONTACT_CHANNELS, PROFILE, findChannel } from '@/lib/data/profile';
import { findProject } from '@/lib/data/projects';
import { SKILL_GROUPS, findSkillGroup } from '@/lib/data/skills';
import { chunkById, coverage, retrieve, topicality } from './retrieval';
import { executeTool } from './tools';
import type { StreamEvent, ToolName } from './protocol';

/**
 * When intent is clear but wording is too thin for BM25 (for example "who are
 * you?", which is entirely stopwords), answer from the tool's canonical chunk.
 */
const TOOL_CHUNK: Record<ToolName, string> = {
  getPresentation: 'who-am-i',
  getProjects: 'projects-overview',
  getSkills: 'stack',
  getResume: 'resume-cv',
  getContact: 'contact',
  getSports: 'off-keyboard',
  getCrazy: 'fun-facts',
  getInternship: 'hire-me',
};

/** Tuned against the real corpus - see the checks in the README. */
const STRONG_SCORE = 2.5;
const STRONG_COVERAGE = 0.6;
const VERY_STRONG_SCORE = 5;
const ON_TOPIC = 0.6;

/** Ordered rules - first match wins, so put the specific ones first. */
const INTENT_RULES: { tool: ToolName; patterns: RegExp[] }[] = [
  {
    tool: 'getInternship',
    patterns: [
      /\b(hire|hiring|hire you|available|availability|internship|intern|job|vacancy|opportunit|freelance|open to work|looking for work|rate|rates|price|cost|charge|budget|quote|salary)\b/i,
      /\b(work (with|for) (you|us)|can you work|collaborat)\b/i,
      // Availability specifics. Kept tight so "how did you start coding" does not
      // get read as a question about a start date.
      /\b(when can you|when could you|when would you|can you start|start date|notice period|how soon)\b/i,
      /\b(remote|on-?site|hybrid|relocat)\b/i,
    ],
  },
  {
    tool: 'getContact',
    patterns: [
      /\b(contact|email|e-mail|reach|reach out|get in touch|phone|number|whatsapp|dm|message you|socials?|linkedin|instagram|facebook|twitter)\b/i,
    ],
  },
  {
    tool: 'getResume',
    patterns: [/\b(resume|cv|curriculum|qualification|credential|transcript|education|degree|university|studied|college|school)\b/i],
  },
  {
    tool: 'getSkills',
    patterns: [
      /\b(skill|skills|stack|tech|technolog|framework|language|tool|tooling|proficien|expert|know how|capable|good at|strong)\b/i,
    ],
  },
  {
    tool: 'getCrazy',
    patterns: [/\b(crazy|craziest|weird|weirdest|fun fact|funny|surprising|surprise|random|strange|wild|secret)\b/i],
  },
  {
    tool: 'getSports',
    patterns: [
      /\b(hobby|hobbies|free time|spare time|sport|sports|football|soccer|downtime|relax|fun outside)\b/i,
      /\b(outside|away from|apart from|other than|besides|when you'?re not)\b[^?.]{0,24}\b(cod(e|ing)|work|keyboard|screen|programming|dev)\b/i,
    ],
  },
  {
    tool: 'getProjects',
    patterns: [
      /\b(project|projects|portfolio|built|build|made|ship|shipped|repo|repos|github|work|works|app|apps|website|site|game|show me)\b/i,
      /\b(muaz ?os|research ?tech|leviro|moodo|ludo|garage|wrapper|wrapped|chat room|nahid|khan|zarifa|imtiaz|morsad|ratul)\b/i,
    ],
  },
  {
    tool: 'getPresentation',
    patterns: [
      /\b(who are you|who is|about you|about yourself|introduce|introduction|tell me about|your story|background|bio|yourself)\b/i,
    ],
  },
];

export function classifyTool(query: string): ToolName | null {
  for (const rule of INTENT_RULES) {
    if (rule.patterns.some((p) => p.test(query))) return rule.tool;
  }

  // No keyword rule fired, but the question names a technology Muaz works with
  // ("do you know Flutter?"). That is a skills question.
  if (findSkillGroup(query)) return 'getSkills';

  return null;
}

/** Small talk that should never trigger a tool or a retrieval answer. */
const SMALL_TALK: { patterns: RegExp[]; reply: string }[] = [
  {
    patterns: [/^\s*(hi|hey|hello|yo|salam|assalamu|good (morning|evening|afternoon))\b/i],
    reply: `Hey! I'm ${PROFILE.name}. Ask me about my projects, my stack, or whether I'm free for work - whatever you actually care about.`,
  },
  {
    patterns: [/\bhow are you\b/i, /\bhow'?s it going\b/i, /\bwhat'?s up\b/i],
    reply: `Doing well - somewhere between a commit and a deadline, as usual. What do you want to know?`,
  },
  {
    patterns: [/\b(thanks|thank you|thx|appreciate)\b/i],
    reply: `Anytime. Ask me anything else, or just email me at ${PROFILE.email}.`,
  },
  {
    patterns: [/\b(bye|goodbye|see you|later)\b/i],
    reply: `Good talking to you. ${PROFILE.email} if you ever want to pick this back up.`,
  },
];

function smallTalk(query: string): string | null {
  const trimmed = query.trim();
  if (trimmed.length > 60) return null;
  for (const rule of SMALL_TALK) {
    if (rule.patterns.some((p) => p.test(trimmed))) return rule.reply;
  }
  return null;
}

/**
 * Stitches the best-matching knowledge chunks into a readable reply.
 *
 * The ordering matters. A single incidental word match is not evidence that a
 * chunk answers the question, so a weak retrieval hit loses to a clear intent
 * signal, and both lose to admitting we do not know.
 */
/**
 * A one-detail question deserves a one-line answer, even here. The stored chunks
 * are paragraphs, so for the narrowest asks we answer straight from the data
 * instead - otherwise "what's your WhatsApp number?" gets a wall of contact prose.
 */
function directAnswer(tool: ToolName | null, args: Record<string, unknown> | undefined): string | null {
  if (!tool) return null;
  const focus = typeof args?.focus === 'string' ? args.focus : null;

  if (tool === 'getContact' && focus) {
    const channel = CONTACT_CHANNELS.find((c) => c.id === focus);
    if (!channel) return null;
    if (channel.id === 'whatsapp') return `My WhatsApp is ${channel.value} - message me any time.`;
    if (channel.id === 'email') return `My email is ${channel.value}. That's the fastest way to reach me.`;
    return `I'm ${channel.value} on ${channel.label}.`;
  }

  if (tool === 'getCrazy' && args?.limit === 1) {
    return PROFILE.funFacts[0];
  }

  if (tool === 'getInternship' && focus) {
    const { availability } = PROFILE;
    if (focus === 'startDate') return `${availability.startDate}.`;
    if (focus === 'workStyle') return `${availability.workStyle}.`;
    if (focus === 'lookingFor') return `I'm looking for ${availability.lookingFor}.`;
    if (focus === 'focusAreas') return `My focus is ${availability.focus.toLowerCase()}.`;
  }

  if (tool === 'getSkills' && focus && focus !== 'learning') {
    const group = SKILL_GROUPS.find((g) => g.id === focus);
    if (group) return `Yes - on the ${group.title.toLowerCase()} side I work with ${group.skills.join(', ')}.`;
  }

  return null;
}

/**
 * @param narrow The question was about one specific thing, so the answer should
 *   stay at one thought rather than stitching a second chunk on the end.
 */
function composeAnswer(
  query: string,
  tool: ToolName | null,
  args?: Record<string, unknown>,
  narrow = false,
): string {
  const canned = smallTalk(query);
  if (canned) return canned;

  const direct = directAnswer(tool, args);
  if (direct) return direct;

  const hits = retrieve(query, 3);
  const best = hits[0];

  const strong =
    best !== undefined &&
    ((best.score >= STRONG_SCORE && coverage(query, best.chunk) >= STRONG_COVERAGE) ||
      best.score >= VERY_STRONG_SCORE);

  let primary: string | null = null;
  let secondary: string | null = null;

  if (strong && best) {
    primary = best.chunk.text;
    const next = hits[1];
    if (!narrow && next && next.score > best.score * 0.55) secondary = next.chunk.text;
  } else if (tool) {
    primary = chunkById(TOOL_CHUNK[tool])?.text ?? null;
  }

  if (!primary) {
    // Nothing relevant and no intent - be honest about which kind of gap it is.
    // Note this engine answers from stored text only, so it cannot take on a
    // task (write code, solve a problem) the way the model-backed path can.
    // Saying so plainly beats pretending the request was off-topic.
    return topicality(query) < ON_TOPIC
      ? `I'm running on my offline brain at the moment, so I can only pull from notes I've already written - I can't take that one on properly right now. Ask me about my projects, my stack, or whether I'm free for work and I'll have plenty to say. For anything else, try again in a bit or email me at ${PROFILE.email}.`
      : `I haven't put that anywhere public, so I'd rather not guess. What I can tell you: ${PROFILE.story.short} If it matters, email me at ${PROFILE.email} and I'll answer properly.`;
  }

  const parts = [primary];
  if (secondary && primary.length < 420) parts.push(secondary);
  // Only point at the card when it holds more than the answer already covered.
  if (tool && !narrow) parts.push('Full details are on screen above.');

  return parts.join(' ');
}

/**
 * Yields the same event stream as `runAgent`, so the route and the client hook
 * are completely unaware of which engine produced the answer.
 */
export async function* runFallback(
  messages: { role: 'user' | 'assistant'; content: string }[],
  /** Why we are here - the agent passes a quota reason when a key exists. */
  label = 'Local knowledge base (no API key set)',
): AsyncGenerator<StreamEvent> {
  const query = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

  yield { type: 'start', model: label, grounded: [] };

  const tool = smallTalk(query) ? null : classifyTool(query);
  const args = tool ? toolArgs(tool, query) : undefined;
  const narrow = args !== undefined && Object.keys(args).length > 0;

  if (tool) {
    const id = `local_${Date.now().toString(36)}`;
    yield { type: 'tool', id, name: tool };
    yield { type: 'tool-result', id, name: tool, result: executeTool(tool, args) };
  }

  const answer = composeAnswer(query, tool, args, narrow);

  // Chunk on word boundaries so it reads like typing rather than a paste.
  const words = answer.split(' ');
  for (let i = 0; i < words.length; i += 2) {
    const delta = words.slice(i, i + 2).join(' ') + (i + 2 < words.length ? ' ' : '');
    yield { type: 'text', delta };
    await sleep(18);
  }

  yield { type: 'done', reason: 'stop' };
}

/**
 * Asked for exactly one thing. Note "fun facts" (plural) deliberately does not
 * match - that is a request for the list.
 */
const SINGLE_ITEM = /\b(fun fact|craziest|weirdest|strangest|wildest|most surprising)\b/i;

/** Narrow questions that only want the roles half of the CV. */
const ROLE_ONLY = /\b(experience|work history|jobs?|roles?|employment|worked)\b/i;
const EDUCATION_ONLY = /\b(education|degree|university|college|school|studying|studied|major|cgpa|hsc|ssc)\b/i;

const INTERNSHIP_FOCUS: { id: string; pattern: RegExp }[] = [
  { id: 'startDate', pattern: /\b(when|start|notice period|joining|immediately|available from)\b/i },
  { id: 'workStyle', pattern: /\b(remote|onsite|on-site|hybrid|relocat|office|where would you work)\b/i },
  { id: 'focusAreas', pattern: /\b(focus|specialis|specializ|what kind of work|area)\b/i },
  { id: 'lookingFor', pattern: /\b(looking for|what role|what kind of role|want|seeking)\b/i },
];

/**
 * The model normally chooses tool arguments. This engine has no model, so it
 * derives the same narrowing from the raw question - otherwise the offline path
 * would dump a full panel where the agent path shows one row.
 */
function toolArgs(tool: ToolName, query: string): Record<string, unknown> | undefined {
  switch (tool) {
    case 'getProjects': {
      const slug = findProject(query)?.slug;
      return slug ? { focus: slug } : undefined;
    }
    case 'getContact': {
      const channel = findChannel(query);
      return channel ? { focus: channel.id } : undefined;
    }
    case 'getSkills': {
      const group = findSkillGroup(query);
      if (!group) return undefined;
      return { focus: group === 'learning' ? 'learning' : group.id };
    }
    case 'getResume': {
      // Only narrow when the question leans one way and not the other.
      const wantsRoles = ROLE_ONLY.test(query);
      const wantsEducation = EDUCATION_ONLY.test(query);
      if (wantsRoles && !wantsEducation) return { focus: 'roles' };
      if (wantsEducation && !wantsRoles) return { focus: 'education' };
      return undefined;
    }
    case 'getInternship': {
      const match = INTERNSHIP_FOCUS.find((rule) => rule.pattern.test(query));
      return match ? { focus: match.id } : undefined;
    }
    case 'getCrazy':
      return SINGLE_ITEM.test(query) ? { limit: 1 } : undefined;
    case 'getSports':
      return /\b(interest|interested|attention|curious about)\b/i.test(query) ? { focus: 'interests' } : undefined;
    default:
      return undefined;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
