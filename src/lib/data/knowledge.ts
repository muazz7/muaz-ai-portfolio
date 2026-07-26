/**
 * ============================================================================
 * KNOWLEDGE CORPUS - this is the "training data" for the site.
 * ============================================================================
 *
 * Each entry is a small, self-contained chunk written in first person, as if
 * Muaz wrote it. At request time `lib/ai/retrieval.ts` scores every chunk
 * against the visitor's question (BM25) and injects only the most relevant
 * ones into the system prompt. That keeps answers grounded in real facts
 * instead of letting the model improvise.
 *
 * To teach the site something new: add a chunk. That is the whole workflow.
 * No embeddings, no vector database, no re-indexing step.
 */

export interface KnowledgeChunk {
  id: string;
  /** Short human label, useful for debugging retrieval. */
  topic: string;
  /** Extra keywords that should match this chunk even if absent from `text`. */
  tags: string[];
  text: string;
}

export const KNOWLEDGE: KnowledgeChunk[] = [
  // --- Identity -------------------------------------------------------------
  {
    id: 'who-am-i',
    topic: 'Introduction',
    tags: ['who', 'about', 'yourself', 'introduce', 'summary', 'bio', 'tell me about you'],
    text: "I'm Mohammad Muaz, though basically everyone calls me Muaz. I'm a Software Engineering undergrad at Daffodil International University in Dhaka, Bangladesh. I build web things - mostly React and TypeScript on the front end - and I'm pushing into Flutter for mobile. My GitHub bio sums me up: developer by discipline, entrepreneur by instinct, always somewhere between a commit and a concept.",
  },
  {
    id: 'name',
    topic: 'Name and handles',
    tags: ['name', 'called', 'spelling', 'username', 'handle', 'muazz7', 'mdmuaz23', 'pronounce'],
    text: "My full name is Mohammad Muaz. I go by Muaz. Online I'm muazz7 on GitHub, muazzzzzz7 on Instagram, and mdmuaz23 on Facebook, X and Reddit. My email is mdmuaz23@gmail.com. If you're wondering about the extra z's in the Instagram handle: I have no defence.",
  },
  {
    id: 'location',
    topic: 'Where I live',
    tags: ['where', 'live', 'located', 'city', 'country', 'bangladesh', 'dhaka', 'satkhira', 'from', 'timezone'],
    text: "I'm based in Dhaka, Bangladesh - specifically around Ashulia, near my university campus. I'm originally from Satkhira, which is where I did both my SSC and HSC. My timezone is UTC+6, so if you're in Europe I'm about 4-5 hours ahead, and if you're in the US I'm most of a day ahead.",
  },
  {
    id: 'languages',
    topic: 'Languages I speak',
    tags: ['language', 'speak', 'bangla', 'bengali', 'english'],
    text: "I speak Bangla natively and I'm fluent in English - all my code, commits, docs and client conversations happen in English, so working with an international team is not a problem.",
  },

  // --- Education ------------------------------------------------------------
  {
    id: 'university',
    topic: 'University',
    tags: ['university', 'study', 'degree', 'college', 'daffodil', 'diu', 'bsc', 'student', 'major', 'education'],
    text: "I'm doing a B.Sc. in Software Engineering at Daffodil International University in Ashulia, Dhaka. I'm currently an undergraduate there. Software Engineering rather than plain CS was deliberate - I wanted the parts about shipping and maintaining real software, not just theory.",
  },
  {
    id: 'resume-cv',
    topic: 'Resume and CV',
    tags: ['resume', 'cv', 'curriculum vitae', 'qualification', 'credentials', 'download', 'timeline', 'experience'],
    text: 'Short version of my CV: B.Sc. in Software Engineering at Daffodil International University, currently ongoing. HSC from Satkhira Government College in 2023, SSC from Satkhira Government High School in 2021. Freelance web developer since 2025 with seven client sites shipped, and 17 public repositories on GitHub. No full-time industry role yet - that is exactly what I am looking for.',
  },
  {
    id: 'school',
    topic: 'School history',
    tags: ['school', 'hsc', 'ssc', 'satkhira', 'high school', '2021', '2023', 'before university'],
    text: "Before university I was in Satkhira. I passed my SSC from Satkhira Government High School in 2021, then did my higher secondary at Satkhira Government College and finished the HSC in 2023. Then I moved to Dhaka for university.",
  },
  {
    id: 'club',
    topic: 'University club role',
    tags: ['club', 'senior executive', 'international wing', 'extracurricular', 'leadership', 'volunteer', 'society'],
    text: "I'm a Senior Executive in the International Wing of my university's Software Engineering Club. It's outreach and events work - keeping the club visible beyond campus. It's a side commitment rather than the headline of what I do, so I usually only bring it up when someone asks.",
  },
  {
    id: 'sec-portfolio',
    topic: 'SEC Portfolio - what the name means',
    tags: ['sec', 'sec portfolio', 'second portfolio', 'sec-portfolio', 'what does sec mean', 'naming'],
    text: 'SEC Portfolio is my second portfolio - "SEC" is just short for second. It has nothing to do with the university club, which people assume constantly. It is the most conventional portfolio I have: my name, my traits, my contact details, laid out the way people expect. Python with plain HTML and CSS, live at sec-portfolio.muaz.pro.',
  },

  // --- Skills ---------------------------------------------------------------
  {
    id: 'stack',
    topic: 'My stack',
    tags: ['stack', 'tech', 'skills', 'technologies', 'tools', 'languages', 'framework', 'know'],
    text: "Day to day I reach for React, TypeScript and Tailwind CSS, with Framer Motion or GSAP when something needs to move. Vite and Next.js for builds, Node.js on the server, Git and GitHub for everything, and Vercel for deploys. On mobile I work in Flutter and Dart. I've also shipped Python and vanilla HTML/CSS/JS projects when that was the right tool.",
  },
  {
    id: 'strongest-skill',
    topic: 'What I am best at',
    tags: ['best', 'strongest', 'good at', 'strength', 'specialty', 'expert'],
    text: "Front-end interface work is where I'm strongest. Give me a design or even a vague idea and I'll turn it into a responsive, animated, actually-pleasant-to-use interface. I'm particularly good at the small stuff - transitions, hover states, empty states, the bits that make an interface feel finished rather than merely complete.",
  },
  {
    id: 'learning',
    topic: 'What I am learning',
    tags: ['learning', 'improving', 'next', 'studying', 'weakness', 'growing', 'flutter'],
    text: "Right now I'm going deeper on Flutter so I can ship real mobile apps rather than just Flutter Web experiments. I'm also working on backend architecture beyond basic CRUD, and on using AI properly as an engineering tool instead of a novelty. If you ask me my weak spot honestly: large-scale backend design is the area where I have the least production experience, and I'm deliberately fixing that.",
  },
  {
    id: 'ai-tools',
    topic: 'How I use AI',
    tags: ['ai', 'llm', 'chatgpt', 'copilot', 'cursor', 'claude', 'vibe coding'],
    text: "I use AI as a fast pair, not a replacement for understanding. I've built AI wrappers twice - once with a framework and once in raw HTML/CSS/JS for a university assignment specifically so I'd have to understand streaming and DOM updates myself. This portfolio you're talking to right now is another example: a real tool-calling agent grounded in my own data.",
  },

  // --- Projects -------------------------------------------------------------
  {
    id: 'projects-overview',
    topic: 'Project overview',
    tags: ['projects', 'portfolio', 'work', 'built', 'made', 'shipped', 'repos', 'github'],
    text: "I have 17 public repos on GitHub. Roughly half are my own apps and experiments, and half are sites I built for other people. The ones I'd point at first: Muaz OS (a portfolio that behaves like Windows XP), Research Tech (a Flutter Web research portal for my university), Leviro (a fully functional e-commerce store), and Muaz's Wrapper (an AI chat wrapper in vanilla JS).",
  },
  {
    id: 'muaz-os',
    topic: 'Muaz OS',
    tags: ['muaz os', 'muaz-xp', 'windows xp', 'xp', 'desktop', 'muaz.pro', 'favourite project', 'best project'],
    text: "Muaz OS is my favourite thing I've built. It's a portfolio disguised as a working Windows XP desktop - you double-click icons, drag windows around, browse folders, and my projects and CV are the files inside. React, TypeScript and Vite, live at muaz.pro. It's the most-starred repo I have. The hard part wasn't the look, it was the window manager: z-index stacking, focus, minimise and restore all had to behave the way muscle memory expects.",
  },
  {
    id: 'research-tech',
    topic: 'Research Tech',
    tags: ['research tech', 'researchtech', 'flutter', 'university portal', 'faculty', 'dart', 'proposals'],
    text: "Research Tech is a Flutter Web portal that lets university students browse faculty research proposals, submit interest requests, and collaborate with professors in real time. It's the project where I went from knowing some Dart to actually shipping a Flutter web app with real data flow and role-based views for students versus faculty.",
  },
  {
    id: 'leviro',
    topic: 'Leviro',
    tags: ['leviro', 'ecommerce', 'e-commerce', 'shop', 'store', 'cart', 'checkout'],
    text: "Leviro is a fully functional e-commerce website - product catalogue, cart, checkout, the whole loop rather than just a storefront mockup. I built it to learn what commerce actually demands: state that survives navigation, price maths you cannot get even slightly wrong, and an admin view that doesn't fight you.",
  },
  {
    id: 'wrapper',
    topic: "Muaz's Wrapper and Wrapped It",
    tags: ['wrapper', 'wrapped it', 'ai wrapper', 'chat wrapper', 'assignment', 'vanilla js', 'api'],
    text: "Wrapped It was me poking at APIs to see what I could wire together. Then for a university assignment I rebuilt it as Muaz's Wrapper using nothing but HTML, CSS and vanilla JavaScript. No framework was the whole point - it forced me to handle streaming responses and DOM updates by hand instead of letting React hide them from me.",
  },
  {
    id: 'chat-room',
    topic: 'Chat Room',
    tags: ['chat room', 'chat', 'realtime', 'socket', 'websocket', 'antor'],
    text: "Chat Room is a real-time chat system I built for my friend Antor. It started as 'can you make us a chat' and turned into a proper little product with websockets and live presence. It's deployed on Render.",
  },
  {
    id: 'moodo',
    topic: 'Moodo',
    tags: ['moodo', 'ludo', 'game', 'multiplayer', 'unfinished', 'wip', 'flutter game'],
    text: "Moodo is my attempt at an online multiplayer Ludo game in Flutter. Board state, turn order and dice logic were the easy part - making it feel good over a network is the hard part. It's still marked ongoing, which in developer language means I intend to come back to it. I'd rather say that plainly than pretend it's finished.",
  },
  {
    id: 'garage',
    topic: "Muaz's Garage",
    tags: ['garage', 'playground', 'experiment', 'scroll', 'animation', 'garage tour'],
    text: "Muaz's Garage is my playground - The Garage Tour. It's where I try interaction ideas too weird for a client site: scroll-driven animation, keyboard-triggered scenes, motion experiments. If something on one of my portfolios feels unusual, it probably got prototyped in the Garage first.",
  },
  {
    id: 'nahid',
    topic: 'Nahid For You',
    tags: ['nahid', 'date', 'asking out', 'funny project', 'weirdest', 'romantic', 'nahidforyou'],
    text: "A friend asked me to build him a website to ask someone out. So I built an interactive site and hid it behind what looks like an ordinary portfolio, then shipped it to nahidforyou.online. It worked as a piece of software. I make no claims about anything beyond that, and I'm not taking follow-up questions.",
  },
  {
    id: 'client-work',
    topic: 'Sites I built for others',
    tags: ['client', 'freelance', 'for others', 'friends', 'commission', 'paid work', 'hire'],
    text: "Seven of my public repos are sites I shipped for other people - portfolios for Morsad, Ratul, Zarifa, Imtiaz, a project for Mumu and Pritha, the Nahid site, and a business landing page for Khan Filling Station. That last one started because I was bored and they needed a web presence. Building for other people taught me more about scoping and expectations than any solo project did.",
  },
  {
    id: 'domains',
    topic: 'My domains and sites',
    tags: ['website', 'domain', 'muaz.pro', 'subdomain', 'links', 'sites', 'urls'],
    text: 'I own muaz.pro and I keep building portfolios on subdomains instead of settling on one. muaz.pro is Muaz OS, the Windows XP one. portfolio.muaz.pro is the calm editorial version. garage.muaz.pro is my playground. wrapper.muaz.pro is the AI chat wrapper. sec-portfolio.muaz.pro is my second portfolio - SEC just means second. Five and counting, and it is a problem I am at peace with.',
  },
  {
    id: 'this-site',
    topic: 'This AI portfolio',
    tags: ['this site', 'this website', 'ai portfolio', 'how does this work', 'meta', 'chatbot', 'built this'],
    text: "This site is my AI portfolio. Instead of making you scroll through sections, it lets you just ask. Under the hood it's a Next.js app with a tool-calling agent: your question goes to a language model that has my real profile, projects and notes in context, and it can call tools that render actual UI components - a project carousel, my skills, my contact card - rather than only replying in text. I built it because a static portfolio can't adapt to what you specifically care about.",
  },

  // --- Working with me ------------------------------------------------------
  {
    id: 'hire-me',
    topic: 'Availability and hiring',
    tags: ['hire', 'hiring', 'available', 'internship', 'job', 'work together', 'freelance', 'recruit', 'opportunity'],
    text: "Yes, I'm open. I'm looking for internships, freelance web projects and collaborations. I'm comfortable remote, hybrid in Dhaka, or on-site for the right team. For part-time work I can start immediately - I'm still an undergrad, so I schedule around classes. Best way to reach me is mdmuaz23@gmail.com or WhatsApp.",
  },
  {
    id: 'what-i-want',
    topic: 'What I am looking for',
    tags: ['looking for', 'ideal role', 'dream job', 'want', 'career', 'goal', 'ambition', 'future'],
    text: "I want a role where I own real interface work and can see users react to it - a product team small enough that my decisions matter. Long term I lean entrepreneurial; 'entrepreneur by instinct' is in my GitHub bio for a reason. I'd like to build something of my own eventually, and the fastest route there is working somewhere that ships fast and lets me learn how a real product is run.",
  },
  {
    id: 'how-i-work',
    topic: 'How I work',
    tags: ['how you work', 'process', 'workflow', 'team', 'collaborate', 'strengths', 'traits', 'deadline'],
    text: "Four things people notice about working with me: I pick up new tech fast, I hit deadlines even when they're tight, I don't wait to be told what to do next, and I juggle multiple commitments without dropping things - I'm doing a degree and client work at the same time. I'd rather ship something honest and iterate than polish in private for a month.",
  },
  {
    id: 'design-taste',
    topic: 'My design taste',
    tags: ['design', 'taste', 'style', 'aesthetic', 'ui', 'ux', 'philosophy', 'opinion'],
    text: "My taste leans toward clean interfaces with a bit of personality - the small details that make people smile. I care more about how something feels to use than how clever the code looks in a screenshot. I like restraint in layout and typography, then one or two moments of genuine delight. A Windows XP portfolio and a quiet editorial one both came from that same instinct.",
  },
  {
    id: 'philosophy',
    topic: 'How I learn',
    tags: ['learn', 'philosophy', 'approach', 'break', 'curious', 'understand', 'why'],
    text: "I learn by breaking things. I'll rebuild something the hard way on purpose - like doing an AI chat wrapper in vanilla JavaScript - just so I understand the layer a framework normally hides. It's slower up front and it means I actually know what's happening when something goes wrong at 2am.",
  },
  {
    id: 'rates',
    topic: 'Rates and project scope',
    tags: ['rate', 'price', 'cost', 'charge', 'budget', 'quote', 'how much'],
    text: "Pricing depends on scope, so I'd rather talk it through than post a number. I've done everything from single landing pages to full e-commerce builds. Email me at mdmuaz23@gmail.com with what you have in mind and I'll give you an honest estimate - including telling you if I'm not the right person for it.",
  },
  {
    id: 'contact',
    topic: 'How to contact me',
    tags: ['contact', 'email', 'reach', 'message', 'whatsapp', 'social', 'dm', 'get in touch'],
    text: "Email is best: mdmuaz23@gmail.com. WhatsApp works too and I usually reply fast. Otherwise I'm muazz7 on GitHub, muazzzzzz7 on Instagram, and mdmuaz23 on Facebook, X and Reddit. My inbox is genuinely open - I'd rather get a short message than a perfect one.",
  },

  // --- Personality ---------------------------------------------------------
  {
    id: 'fun-facts',
    topic: 'Fun facts',
    tags: ['fun', 'crazy', 'random', 'interesting', 'surprising', 'weird', 'funny'],
    text: "Some genuinely true things: I own five portfolios and cannot pick one. One of them is a working Windows XP desktop. I built a website for a friend to ask someone out and hid it behind a fake portfolio. I started my GitHub in late 2025 and shipped 17 public repos in under a year. My Ludo game has been 'ongoing' for months. And half of everything I've built is for other people rather than myself.",
  },
  {
    id: 'entrepreneur',
    topic: 'The entrepreneur side',
    tags: ['entrepreneur', 'business', 'startup', 'company', 'idea', 'venture', 'instinct'],
    text: "My GitHub bio says 'developer by discipline, entrepreneur by instinct' and I mean both halves. The discipline is the part where I finish things and hit deadlines. The instinct is that I can't look at a problem without wondering whether it's a product. Most of my side projects started as 'someone I know has this problem' rather than 'I want to practise this framework'.",
  },
  {
    id: 'why-software',
    topic: 'Why software',
    tags: ['why', 'start', 'coding', 'began', 'origin story', 'got into', 'motivation'],
    text: "I got into this because I like taking things apart. Software is the rare field where you can open the hood on almost anything, understand it, and then build your own version the same afternoon. The feedback loop is immediate, and you don't need permission or capital to start - just a laptop and stubbornness.",
  },
  {
    id: 'off-keyboard',
    topic: 'Away from the keyboard',
    tags: ['hobby', 'hobbies', 'free time', 'sport', 'sports', 'football', 'outside work', 'fun outside'],
    text: "Away from the screen I'm usually with friends on campus, playing football, or having long chai-fuelled conversations about ideas that will absolutely never get built. I also walk around Dhaka a lot with music on - it's when most of my project ideas actually show up.",
  },
  {
    id: 'github-stats',
    topic: 'GitHub activity',
    tags: ['github', 'repos', 'commits', 'stats', 'open source', 'activity', 'how many'],
    text: "I'm muazz7 on GitHub with 17 public repositories. I opened the account in late 2025 and have been shipping steadily since - a mix of TypeScript, JavaScript, Dart, Python, HTML and CSS. Most of what I build ends up public, including the unfinished stuff, because I think showing the workshop is more honest than only showing the gallery.",
  },
  {
    id: 'education-vs-self-taught',
    topic: 'Degree versus self-taught',
    tags: ['self taught', 'bootcamp', 'degree worth', 'formal education', 'learn on your own'],
    text: "The degree gives me structure and the theory I'd never sit down and read alone. Everything practical - React, Tailwind, Flutter, deployment, dealing with clients - I learned by building and shipping. Both mattered. The degree taught me how to think about software; the side projects taught me how to finish it.",
  },
  {
    id: 'best-worst',
    topic: 'Proudest and most painful',
    tags: ['proud', 'proudest', 'hardest', 'difficult', 'challenge', 'failure', 'mistake', 'learned'],
    text: "Proudest: Muaz OS. Getting a fake window manager to feel like a real one taught me more about state than any tutorial. Most painful: Moodo, my Ludo game. Turn-based multiplayer over a network is genuinely hard and I underestimated it, which is why it's still marked ongoing rather than quietly deleted.",
  },
  {
    id: 'availability-detail',
    topic: 'Time and commitments',
    tags: ['time', 'busy', 'hours', 'part time', 'full time', 'schedule', 'capacity'],
    text: "I'm juggling an undergrad degree and freelance builds, so my capacity is part-time right now, scheduled around classes. It also means I've had a lot of practice protecting deadlines when three things want the same evening.",
  },
];

/** Convenience: every chunk as one flat string, used for the fallback engine. */
export const KNOWLEDGE_INDEX = KNOWLEDGE.map((k) => ({
  ...k,
  haystack: `${k.topic} ${k.tags.join(' ')} ${k.text}`.toLowerCase(),
}));
