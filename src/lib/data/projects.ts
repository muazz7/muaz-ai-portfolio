/**
 * Every project below is a real public repo on github.com/muazz7.
 * Titles and one-liners match how you describe them on portfolio.muaz.pro.
 */

export type ProjectCategory = 'apps'//
  | 'clients';

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  /** Longer description used by the AI when someone asks about this project. */
  description: string;
  category: ProjectCategory;
  status: 'live' | 'wip' | 'archived';
  tech: string[];
  repo: string;
  live: string | null;
  /** Higher = shown first. */
  weight: number;
  featured: boolean;
  year: string;
}

export const PROJECTS: Project[] = [
  {
    slug: 'muaz-os',
    title: 'Muaz OS',
    tagline: 'A portfolio that boots like Windows XP',
    description:
      "My personal portfolio built as a working Windows XP desktop. You navigate it exactly like the real thing - double-click icons, open and drag windows, browse folders - and my projects, skills and experience are the files inside. It is the most-starred thing I have made and it lives at muaz.pro. Built with React, TypeScript and Vite.",
    category: 'apps',
    status: 'live',
    tech: ['TypeScript', 'React', 'Vite', 'CSS'],
    repo: 'https://github.com/muazz7/muaz-xp',
    live: 'https://muaz.pro',
    weight: 100,
    featured: true,
    year: '2025',
  },
  {
    slug: 'research-tech',
    title: 'Research Tech',
    tagline: 'Flutter Web portal connecting students to faculty research',
    description:
      'A Flutter Web portal for university students to browse faculty research proposals, submit interest requests, and collaborate with professors in real time. This is the project where I moved from "I know some Dart" to actually shipping a Flutter web app with real data flow and role-based views.',
    category: 'apps',
    status: 'live',
    tech: ['Dart', 'Flutter', 'Firebase'],
    repo: 'https://github.com/muazz7/researchtech',
    live: 'https://researchtech-gray.vercel.app',
    weight: 95,
    featured: true,
    year: '2026',
  },
  {
    slug: 'leviro',
    title: 'Leviro',
    tagline: 'A fully functional e-commerce store',
    description:
      'A complete e-commerce website - product catalogue, cart, checkout flow, the whole loop, not just a pretty storefront. I built it to understand what actually goes into commerce: state that survives navigation, price maths you cannot get wrong, and an admin view that does not fight you.',
    category: 'apps',
    status: 'live',
    tech: ['JavaScript', 'React', 'Node.js'],
    repo: 'https://github.com/muazz7/Leviro',
    live: 'https://leviro.vercel.app',
    weight: 90,
    featured: true,
    year: '2026',
  },
  {
    slug: 'muazs-wrapper',
    title: "Muaz's Wrapper",
    tagline: 'An AI chat wrapper in plain HTML, CSS and JS',
    description:
      'A stripped-down version of my Wrapped It project, rebuilt with nothing but HTML, CSS and vanilla JavaScript for a university assignment. Doing it without a framework was the point - it forced me to understand streaming responses and DOM updates properly instead of letting React hide them.',
    category: 'apps',
    status: 'live',
    tech: ['HTML', 'CSS', 'JavaScript'],
    repo: 'https://github.com/muazz7/muazs-wrapper',
    live: 'https://wrapper.muaz.pro',
    weight: 80,
    featured: true,
    year: '2026',
  },
  {
    slug: 'wrapped-it',
    title: 'Wrapped It',
    tagline: 'Playing with APIs to see what breaks',
    description:
      'A test site where I poked at APIs and explored what I could wire together. Not everything I build is meant to ship - some of it exists purely so I understand a thing well enough to use it somewhere real later.',
    category: 'apps',
    status: 'live',
    tech: ['TypeScript', 'Next.js', 'APIs'],
    repo: 'https://github.com/muazz7/Muaz_Wrapped_It',
    live: 'https://muaz-wrapped-it.vercel.app',
    weight: 70,
    featured: false,
    year: '2026',
  },
  {
    slug: 'chat-room',
    title: 'Chat Room',
    tagline: 'Real-time chat built for one specific friend',
    description:
      'A personalised real-time chat system I built for my friend Antor. Websockets, live presence, the works. It started as "can you make us a chat" and turned into a proper little product.',
    category: 'apps',
    status: 'live',
    tech: ['JavaScript', 'Node.js', 'Socket.IO'],
    repo: 'https://github.com/muazz7/chat-room',
    live: 'https://antor-chat.onrender.com/',
    weight: 65,
    featured: false,
    year: '2026',
  },
  {
    slug: 'moodo',
    title: 'Moodo',
    tagline: 'An online Ludo game (still ongoing)',
    description:
      'My attempt at a multiplayer Ludo game in Flutter. Board state, turn logic and dice are the easy part - making it feel good over a network is the hard part. Still marked ongoing, and I am honest about that.',
    category: 'apps',
    status: 'wip',
    tech: ['Dart', 'Flutter'],
    repo: 'https://github.com/muazz7/moodo',
    live: 'https://moodo.vercel.app',
    weight: 60,
    featured: false,
    year: '2026',
  },
  {
    slug: 'muazs-garage',
    title: "Muaz's Garage",
    tagline: 'A scroll-driven playground - "The Garage Tour"',
    description:
      'My personal playground where I try interaction ideas that are too weird for a client site: scroll-driven animation, keyboard-triggered scenes, motion experiments. If something on one of my portfolios feels unusual, it probably got prototyped here first.',
    category: 'apps',
    status: 'live',
    tech: ['JavaScript', 'GSAP', 'CSS'],
    repo: 'https://github.com/muazz7/muazsgarage',
    live: 'https://garage.muaz.pro',
    weight: 55,
    featured: false,
    year: '2026',
  },
  {
    slug: 'sec-portfolio',
    title: 'SEC Portfolio',
    tagline: 'My second portfolio - "SEC" is just short for second',
    description:
      'My second portfolio, and the most conventional one I have: name, traits, contact details, laid out the way people actually expect a portfolio to look. Python with plain HTML and CSS, deployed on my own domain at sec-portfolio.muaz.pro. The name trips people up - SEC means second, nothing more than that.',
    category: 'apps',
    status: 'live',
    tech: ['Python', 'HTML', 'CSS'],
    repo: 'https://github.com/muazz7/sec-portfolio',
    live: 'https://sec-portfolio.muaz.pro',
    weight: 50,
    featured: false,
    year: '2026',
  },
  {
    slug: 'editorial-portfolio',
    title: 'Editorial Portfolio',
    tagline: 'The quiet, typographic version of my portfolio',
    description:
      'A calm, editorial take on my portfolio - numbered sections, generous type, no gimmicks. It pulls every public project straight from GitHub and groups them by kind. Proof that I can do restrained as well as playful.',
    category: 'apps',
    status: 'live',
    tech: ['CSS', 'HTML', 'GitHub API'],
    repo: 'https://github.com/muazz7/portfolio',
    live: 'https://portfolio.muaz.pro',
    weight: 45,
    featured: false,
    year: '2026',
  },

  // --- Sites built for other people ----------------------------------------
  {
    slug: 'nahid',
    title: 'Nahid For You',
    tagline: 'An "asking someone out" site hidden behind a fake portfolio',
    description:
      'A friend asked me to build him a way to ask someone out. So I built an interactive site and hid it behind what looks like an ordinary portfolio. It worked as a piece of software. I make no claims about the rest.',
    category: 'clients',
    status: 'live',
    tech: ['TypeScript', 'Next.js', 'Framer Motion'],
    repo: 'https://github.com/muazz7/gmnahid',
    live: 'https://nahidforyou.online',
    weight: 40,
    featured: true,
    year: '2026',
  },
  {
    slug: 'khan-filling-station',
    title: 'Khan Filling Station',
    tagline: 'A business landing page I built out of boredom',
    description:
      'A landing page for a local filling station. I was bored, they needed a web presence, and it turned into a proper little marketing site. My largest repo by size, mostly because of the imagery.',
    category: 'clients',
    status: 'live',
    tech: ['CSS', 'HTML', 'JavaScript'],
    repo: 'https://github.com/muazz7/Khan-Filling-Station',
    live: 'https://khan-filling-station.vercel.app',
    weight: 35,
    featured: false,
    year: '2026',
  },
  {
    slug: 'morsad',
    title: 'Morsad',
    tagline: 'Client portfolio',
    description: 'A portfolio site built for Morsad.',
    category: 'clients',
    status: 'live',
    tech: ['JavaScript', 'CSS'],
    repo: 'https://github.com/muazz7/morsad-portfolio',
    live: 'https://morsad-portfolio.vercel.app',
    weight: 30,
    featured: false,
    year: '2026',
  },
  {
    slug: 'imtiaz',
    title: 'Imtiaz',
    tagline: "A friend's portfolio",
    description: "A portfolio site I built for my friend Imtiaz.",
    category: 'clients',
    status: 'live',
    tech: ['HTML', 'CSS', 'JavaScript'],
    repo: 'https://github.com/muazz7/imtiaz-portfolio',
    live: 'https://imtiazz.vercel.app/',
    weight: 28,
    featured: false,
    year: '2025',
  },
  {
    slug: 'zarifa',
    title: 'Zarifa',
    tagline: 'Client portfolio',
    description: "A portfolio site built for Zarifa.",
    category: 'clients',
    status: 'live',
    tech: ['TypeScript', 'React'],
    repo: 'https://github.com/muazz7/zarifa',
    live: 'https://zarifa-pearl.vercel.app',
    weight: 26,
    featured: false,
    year: '2025',
  },
  {
    slug: 'ratul',
    title: 'Ratul',
    tagline: 'Client portfolio',
    description: 'A portfolio site built for Ratul.',
    category: 'clients',
    status: 'live',
    tech: ['HTML', 'CSS'],
    repo: 'https://github.com/muazz7/ratul-portfolio',
    live: 'https://ratul-portfolio-ebon.vercel.app',
    weight: 24,
    featured: false,
    year: '2026',
  },
  {
    slug: 'mumu-n-pritha',
    title: 'Mumu & Pritha',
    tagline: 'A web project for two friends',
    description: 'A web project built for Mumu and Pritha.',
    category: 'clients',
    status: 'live',
    tech: ['CSS', 'HTML'],
    repo: 'https://github.com/muazz7/mumu_n_pritha',
    live: 'https://mumu-n-pritha.vercel.app',
    weight: 22,
    featured: false,
    year: '2026',
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured).sort((a, b) => b.weight - a.weight);

export const PROJECTS_BY_CATEGORY: Record<ProjectCategory, Project[]> = {
  apps: PROJECTS.filter((p) => p.category === 'apps').sort((a, b) => b.weight - a.weight),
  clients: PROJECTS.filter((p) => p.category === 'clients').sort((a, b) => b.weight - a.weight),
};

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  apps: 'Apps & Experiments',
  clients: 'Sites I made for others',
};

/** Every valid `focus` value - fed to the model as an enum so it cannot invent one. */
export const PROJECT_SLUGS = PROJECTS.map((p) => p.slug);

/**
 * Words visitors use for a project that do not appear in its title.
 * Keys must be lowercase and already normalised (letters, digits, single spaces).
 */
const PROJECT_ALIASES: Record<string, string> = {
  muazos: 'muaz-os',
  'muaz xp': 'muaz-os',
  muazxp: 'muaz-os',
  'windows xp': 'muaz-os',
  'xp portfolio': 'muaz-os',
  'xp desktop': 'muaz-os',
  'muaz pro': 'muaz-os',
  researchtech: 'research-tech',
  'research portal': 'research-tech',
  'research proposal portal': 'research-tech',
  ecommerce: 'leviro',
  'e commerce': 'leviro',
  'online store': 'leviro',
  'wrapped it': 'wrapped-it',
  wrapper: 'muazs-wrapper',
  'muaz wrapper': 'muazs-wrapper',
  'ai wrapper': 'muazs-wrapper',
  chatroom: 'chat-room',
  'chat app': 'chat-room',
  antor: 'chat-room',
  ludo: 'moodo',
  'ludo game': 'moodo',
  garage: 'muazs-garage',
  'garage tour': 'muazs-garage',
  'muaz garage': 'muazs-garage',
  sec: 'sec-portfolio',
  // "SEC" is short for second - nothing to do with the university club.
  'second portfolio': 'sec-portfolio',
  editorial: 'editorial-portfolio',
  'nahidforyou': 'nahid',
  'nahid for you': 'nahid',
  khan: 'khan-filling-station',
  'filling station': 'khan-filling-station',
  'petrol pump': 'khan-filling-station',
  mumu: 'mumu-n-pritha',
  pritha: 'mumu-n-pritha',
};

function flatten(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function bySlug(slug: string): Project | null {
  return PROJECTS.find((p) => p.slug === slug) ?? null;
}

/** True when `phrase` appears in `haystack` on word boundaries, not mid-word. */
function containsPhrase(haystack: string, phrase: string): boolean {
  if (phrase.length < 3) return false;
  return new RegExp(`(?:^| )${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?: |$)`).test(haystack);
}

/**
 * Resolves anything a caller might hand us - a slug from the model, a title, an
 * alias, or a whole sentence from a visitor - down to one project, or null.
 *
 * Used in two places: the model's `focus` argument (usually already a slug) and
 * the offline engine, which only has the raw question to work from.
 */
export function findProject(query: string | null | undefined): Project | null {
  if (!query) return null;
  const normalized = flatten(query);
  if (!normalized) return null;

  // Exact identifiers first - "muaz-os", "Muaz OS", "muazs-wrapper".
  const exact = PROJECTS.find((p) => flatten(p.slug) === normalized || flatten(p.title) === normalized);
  if (exact) return exact;

  const alias = PROJECT_ALIASES[normalized];
  if (alias) return bySlug(alias);

  // Otherwise look for a named project inside a longer sentence, longest phrase
  // first so "editorial portfolio" wins over a bare "portfolio".
  const candidates: { phrase: string; slug: string }[] = [];
  for (const project of PROJECTS) {
    candidates.push({ phrase: flatten(project.title), slug: project.slug });
    candidates.push({ phrase: flatten(project.slug), slug: project.slug });
  }
  for (const [phrase, slug] of Object.entries(PROJECT_ALIASES)) {
    candidates.push({ phrase, slug });
  }
  candidates.sort((a, b) => b.phrase.length - a.phrase.length);

  for (const candidate of candidates) {
    if (containsPhrase(normalized, candidate.phrase)) return bySlug(candidate.slug);
  }

  return null;
}
