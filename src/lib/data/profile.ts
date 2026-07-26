/**
 * ============================================================================
 * PROFILE - the single source of truth about you.
 * ============================================================================
 *
 * Everything in this file was pulled from your own public pages:
 *   - github.com/muazz7 (profile + all 17 public repos)
 *   - portfolio.muaz.pro (about, journey, stack, project list)
 *   - sec-portfolio.muaz.pro (full name, traits, address, phone)
 *
 * Anything marked `TODO(muaz)` is a safe placeholder I could not verify from a
 * public source. Edit those lines and the whole site + AI updates instantly.
 */

export const PROFILE = {
  // --- Identity -------------------------------------------------------------
  fullName: 'Mohammad Muaz',
  name: 'Muaz',
  /** Shown as the big faded word behind the landing page. */
  wordmark: 'Muaz',
  handle: 'muazz7',
  title: 'Software Engineer',
  /** The one-liner under the hero. */
  headline: 'I build fun stuff and love to explore new technologies.',
  /** Your GitHub bio, verbatim. */
  bio: 'Developer by discipline, Entrepreneur by instinct. Always somewhere between a commit and a concept.',
  pronouns: 'he/him',
  age: null as number | null,

  // --- Where ----------------------------------------------------------------
  location: 'Dhaka, Bangladesh',
  locationDetail: 'YKSG-2, DIU, Ashulia, Dhaka, Bangladesh',
  hometown: 'Satkhira, Bangladesh',
  timezone: 'Asia/Dhaka (UTC+6)',
  languages: ['Bangla (native)', 'English (fluent)'],

  // --- Contact --------------------------------------------------------------
  email: 'mdmuaz23@gmail.com',
  /** Remove this line if you would rather the AI never hand out your number. */
  phone: '+880 1741 885952',
  whatsapp: 'https://wa.me/8801741885952',
  calendly: null as string | null,

  // --- Availability ---------------------------------------------------------
  availability: {
    open: true,
    headline: 'Open to projects',
    /** What you are actually looking for. Shown by the "internship" tool. */
    lookingFor: 'internships, freelance web projects, and collaborations',
    workStyle: 'Remote, hybrid in Dhaka, or on-site for the right team',
    startDate: 'Flexible - I can start immediately for part-time work',
    focus: 'Frontend engineering, full-stack web, and Flutter mobile',
  },

  // --- Socials --------------------------------------------------------------
  socials: {
    github: 'https://github.com/muazz7',
    facebook: 'https://www.facebook.com/mdmuaz23',
    instagram: 'https://www.instagram.com/muazzzzzz7/',
    x: 'https://x.com/mdmuaz23',
    reddit: 'https://www.reddit.com/user/mdmuaz23',
    linkedin: null as string | null,
  },

  // --- Sites you own --------------------------------------------------------
  sites: [
    { label: 'muaz.pro', url: 'https://muaz.pro', note: 'Muaz OS - my Windows XP portfolio' },
    { label: 'portfolio.muaz.pro', url: 'https://portfolio.muaz.pro', note: 'My editorial portfolio' },
    { label: 'garage.muaz.pro', url: 'https://garage.muaz.pro', note: 'The Garage - my playground' },
    { label: 'wrapper.muaz.pro', url: 'https://wrapper.muaz.pro', note: "Muaz's Wrapper" },
  ],

  // --- Education ------------------------------------------------------------
  education: [
    {
      period: 'Present',
      credential: 'B.Sc. in Software Engineering',
      institution: 'Daffodil International University',
      location: 'Ashulia, Dhaka',
      detail:
        'Undergraduate Software Engineering student - the degree is the structure; most of what I can actually do came from shipping side projects alongside it.',
      current: true,
    },
    {
      period: '2023',
      credential: 'HSC (Higher Secondary Certificate)',
      institution: 'Satkhira Government College',
      location: 'Satkhira',
      detail: 'Two years of higher-secondary studies, wrapping up with the HSC in 2023.',
      current: false,
    },
    {
      period: '2021',
      credential: 'SSC (Secondary School Certificate)',
      institution: 'Satkhira Government High School',
      location: 'Satkhira',
      detail: 'Where it started. Completed my secondary schooling and passed the SSC here in 2021.',
      current: false,
    },
  ],

  // --- Roles / involvement --------------------------------------------------
  /**
   * Order matters: `roles[0]` is what the site leads with, so the working role
   * comes first. The club role is real but minor - it stays on the list without
   * being the headline on every screen.
   */
  roles: [
    {
      role: 'Freelance web developer',
      org: 'Self-employed',
      period: '2025 - Present',
      detail:
        'I build portfolios, landing pages, and small web products for friends, classmates, and local businesses. Seven of my public repos are sites I shipped for other people.',
    },
    {
      role: 'Senior Executive, International Wing',
      org: 'Software Engineering Club, Daffodil International University',
      period: 'Present',
      detail:
        'I help run the international side of the club - outreach, events, and keeping it visible outside campus.',
    },
  ],

  // --- How you work ---------------------------------------------------------
  /** Straight off your SEC portfolio. */
  traits: [
    { label: 'Quick learner', detail: 'I adapt to new technologies and workflows fast.' },
    { label: 'Deadline driven', detail: 'I finish things under tight schedules.' },
    { label: 'Initiative taker', detail: 'I explore and implement solutions without being asked twice.' },
    { label: 'Team player', detail: 'I balance multiple responsibilities without dropping the ball.' },
  ],

  // --- The story ------------------------------------------------------------
  story: {
    short:
      "I'm Muaz, a Software Engineering undergrad at Daffodil International University in Dhaka. I build thoughtful, playful things on the web and break stuff to understand how it works.",
    long: [
      "I'm Mohammad Muaz - most people just call me Muaz. I'm a B.Sc. Software Engineering student at Daffodil International University, based in Dhaka, Bangladesh, originally from Satkhira.",
      "My taste leans toward clean interfaces with a bit of personality: the small details that make people smile. I care more about how something feels to use than how clever the code looks in a screenshot.",
      "When I'm not shipping side projects, I'm usually chasing a new idea or figuring out how something works under the hood. That's why my GitHub looks like a workshop rather than a museum - a Windows XP portfolio, a Ludo game, an e-commerce store, a Flutter research portal, and a pile of sites I built for friends.",
      "Right now I'm going deeper on Flutter for mobile and taking on freelance builds around my degree. Somewhere between a commit and a concept, as my GitHub bio puts it.",
    ],
  },

  /** Shown by the "crazy" / fun tool and used by the AI for personality. */
  funFacts: [
    'I own the domain muaz.pro and I keep building new portfolios on subdomains of it instead of settling on one. There are five and counting.',
    'One of my portfolios is a full Windows XP desktop you can click around - open windows, browse folders, all of it. It lives at muaz.pro.',
    'A friend asked me to build him a website to ask someone out. I built it, hid it behind a fake portfolio, and shipped it to nahidforyou.online. I am not taking questions about that one.',
    'I started my GitHub account in late 2025 and shipped 17 public repos in under a year.',
    'I tried to build an online Ludo game in Flutter. It is still "ongoing", which is developer for "I will come back to it".',
    'Half of my repos are websites for other people - friends, classmates, a filling station. I build for others as often as for myself.',
  ],

  /** TODO(muaz): these are placeholders. Swap in your real ones. */
  interests: [
    'Exploring new frameworks the weekend they drop',
    'UI details and micro-interactions',
    'Reverse-engineering apps I like',
    'Tech entrepreneurship and product ideas',
  ],

  /** TODO(muaz): replace with what you actually do away from the keyboard. */
  offKeyboard: {
    headline: 'Away from the keyboard',
    items: [
      'Football with friends on campus',
      'Long chai-fuelled conversations about startup ideas',
      'Walking around Dhaka with music on',
    ],
    note:
      'This section is a placeholder - Muaz has not published this publicly, so treat it as light detail rather than fact.',
  },

  resumeUrl: '/muaz-resume.pdf', // TODO(muaz): drop your real PDF into /public.
} as const;

export type Profile = typeof PROFILE;

// ---------------------------------------------------------------------------
// Contact channels
// ---------------------------------------------------------------------------

export type ContactChannelId = 'email' | 'whatsapp' | 'github' | 'instagram' | 'x' | 'facebook' | 'reddit';

export interface ContactChannel {
  id: ContactChannelId;
  label: string;
  /** The thing a visitor actually asked for: the address, the number, the handle. */
  value: string;
  href: string;
}

/**
 * One list, used by both the contact tool payload and the contact card, so a
 * question about a single channel can be answered with that channel alone.
 */
export const CONTACT_CHANNELS: ContactChannel[] = [
  { id: 'email', label: 'Email', value: PROFILE.email, href: `mailto:${PROFILE.email}` },
  { id: 'whatsapp', label: 'WhatsApp', value: PROFILE.phone, href: PROFILE.whatsapp },
  { id: 'github', label: 'GitHub', value: `@${PROFILE.handle}`, href: PROFILE.socials.github },
  { id: 'instagram', label: 'Instagram', value: '@muazzzzzz7', href: PROFILE.socials.instagram },
  { id: 'x', label: 'X', value: '@mdmuaz23', href: PROFILE.socials.x },
  { id: 'facebook', label: 'Facebook', value: '@mdmuaz23', href: PROFILE.socials.facebook },
  { id: 'reddit', label: 'Reddit', value: '@mdmuaz23', href: PROFILE.socials.reddit },
];

export const CONTACT_CHANNEL_IDS: ContactChannelId[] = CONTACT_CHANNELS.map((c) => c.id);

/** Words visitors use that are not the channel id. Longest phrase wins. */
const CHANNEL_ALIASES: Record<string, ContactChannelId> = {
  mail: 'email',
  'e mail': 'email',
  gmail: 'email',
  'email address': 'email',
  whats: 'whatsapp',
  'whats app': 'whatsapp',
  wa: 'whatsapp',
  number: 'whatsapp',
  'phone number': 'whatsapp',
  phone: 'whatsapp',
  mobile: 'whatsapp',
  cell: 'whatsapp',
  twitter: 'x',
  insta: 'instagram',
  ig: 'instagram',
  fb: 'facebook',
  git: 'github',
};

/**
 * Resolves a channel id, an alias, or a whole sentence down to one channel.
 * Returns null for broad questions like "how do I reach you", which should show
 * everything.
 */
export function findChannel(query: string | null | undefined): ContactChannel | null {
  if (!query) return null;
  const normalized = query.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (!normalized) return null;

  const exact = CONTACT_CHANNELS.find((c) => c.id === normalized || c.label.toLowerCase() === normalized);
  if (exact) return exact;

  const alias = CHANNEL_ALIASES[normalized];
  if (alias) return CONTACT_CHANNELS.find((c) => c.id === alias) ?? null;

  // Phrase search for the offline engine, which only sees the raw question.
  const candidates: { phrase: string; id: ContactChannelId }[] = [
    ...CONTACT_CHANNELS.map((c) => ({ phrase: c.id, id: c.id })),
    ...Object.entries(CHANNEL_ALIASES).map(([phrase, id]) => ({ phrase, id })),
  ].sort((a, b) => b.phrase.length - a.phrase.length);

  for (const candidate of candidates) {
    if (candidate.phrase.length < 3) continue;
    if (new RegExp(`(?:^| )${candidate.phrase}(?: |$)`).test(normalized)) {
      return CONTACT_CHANNELS.find((c) => c.id === candidate.id) ?? null;
    }
  }

  return null;
}
