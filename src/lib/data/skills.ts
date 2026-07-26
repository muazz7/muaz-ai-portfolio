/**
 * Skill groups. The first three groups mirror "The Stack" on portfolio.muaz.pro;
 * the rest are inferred from the languages across your 17 public repos.
 */

export interface SkillGroup {
  id: string;
  title: string;
  /** Tailwind-safe hex used for the group accent. */
  color: string;
  icon: 'code' | 'sparkles' | 'wrench' | 'smartphone' | 'server' | 'brain';
  skills: string[];
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    color: '#0171E3',
    icon: 'code',
    skills: ['React', 'TypeScript', 'JavaScript ES6+', 'Next.js', 'HTML5', 'CSS3'],
  },
  {
    id: 'styling',
    title: 'Styling & Motion',
    color: '#B95F9D',
    icon: 'sparkles',
    skills: ['Tailwind CSS', 'Framer Motion', 'GSAP', 'Responsive design', 'UI & interaction'],
  },
  {
    id: 'tooling',
    title: 'Tooling & Deploy',
    color: '#3E9858',
    icon: 'wrench',
    skills: ['Vite', 'Node.js', 'Git', 'GitHub', 'Vercel', 'Render'],
  },
  {
    id: 'mobile',
    title: 'Mobile & Cross-platform',
    color: '#856ED9',
    icon: 'smartphone',
    skills: ['Flutter', 'Dart', 'Flutter Web'],
  },
  {
    id: 'backend',
    title: 'Backend & Data',
    color: '#C19433',
    icon: 'server',
    skills: ['Node.js', 'Express', 'Socket.IO', 'Python', 'Firebase', 'REST APIs'],
  },
  {
    id: 'soft',
    title: 'How I work',
    color: '#329696',
    icon: 'brain',
    skills: ['Quick learner', 'Deadline driven', 'Initiative taker', 'Team player', 'Client communication'],
  },
];

/** Currently levelling up. Honest about what is in progress. */
export const LEARNING_NOW = [
  'Flutter for production mobile apps',
  'AI-assisted product engineering',
  'Backend architecture beyond CRUD',
];

export const ALL_SKILLS = SKILL_GROUPS.flatMap((g) => g.skills);

/** Valid `focus` values for the skills tool - the groups plus the learning list. */
export const SKILL_FOCUS_IDS = [...SKILL_GROUPS.map((g) => g.id), 'learning'];

/** Group ids visitors describe in other words. */
const GROUP_ALIASES: Record<string, string> = {
  front: 'frontend',
  'front end': 'frontend',
  ui: 'frontend',
  web: 'frontend',
  css: 'styling',
  style: 'styling',
  motion: 'styling',
  animation: 'styling',
  design: 'styling',
  tooling: 'tooling',
  tools: 'tooling',
  deploy: 'tooling',
  deployment: 'tooling',
  devops: 'tooling',
  mobile: 'mobile',
  app: 'mobile',
  android: 'mobile',
  ios: 'mobile',
  back: 'backend',
  'back end': 'backend',
  server: 'backend',
  database: 'backend',
  api: 'backend',
  soft: 'soft',
  'soft skills': 'soft',
  learning: 'learning',
  studying: 'learning',
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+#. ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function hasPhrase(haystack: string, phrase: string): boolean {
  if (phrase.length < 2) return false;
  return new RegExp(`(?:^| )${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?: |$)`).test(haystack);
}

/**
 * Resolves a group id, an alias, a named technology, or a whole question down to
 * one skill group. Returns null when the question is broad ("what's your stack")
 * so the full board renders.
 */
export function findSkillGroup(query: string | null | undefined): SkillGroup | 'learning' | null {
  if (!query) return null;
  const q = normalize(query);
  if (!q) return null;

  if (q === 'learning') return 'learning';
  const exact = SKILL_GROUPS.find((g) => g.id === q || normalize(g.title) === q);
  if (exact) return exact;

  const alias = GROUP_ALIASES[q];
  if (alias) return alias === 'learning' ? 'learning' : (SKILL_GROUPS.find((g) => g.id === alias) ?? null);

  // Phrase search over group names, the technologies inside each group, and the
  // aliases. Longest match wins, so a named technology ("do you know Flutter?")
  // beats a vague one ("web"). This is what the offline engine relies on, since
  // it only ever sees the raw question.
  const candidates: { phrase: string; id: string }[] = [];
  for (const group of SKILL_GROUPS) {
    candidates.push({ phrase: group.id, id: group.id });
    candidates.push({ phrase: normalize(group.title), id: group.id });
    for (const skill of group.skills) candidates.push({ phrase: normalize(skill), id: group.id });
  }
  for (const [phrase, id] of Object.entries(GROUP_ALIASES)) candidates.push({ phrase, id });
  candidates.sort((a, b) => b.phrase.length - a.phrase.length);

  for (const candidate of candidates) {
    if (!hasPhrase(q, candidate.phrase)) continue;
    if (candidate.id === 'learning') return 'learning';
    return SKILL_GROUPS.find((g) => g.id === candidate.id) ?? null;
  }

  return null;
}
