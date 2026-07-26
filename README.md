# Muaz · AI Portfolio

A portfolio you talk to instead of scroll through. Ask it anything about Mohammad Muaz and it answers in his voice, grounded in his real data — and renders live UI components instead of walls of text.


---

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

**It works immediately with no API key.** With no key configured the site answers from a local retrieval engine over your own written notes — less fluent than a real model, but every sentence is text you wrote, so it is never wrong. Add a key when you want fluent, conversational answers.

## Add an AI provider

Copy the template and fill in one key:

```bash
cp .env.example .env.local
```

```env
AI_PROVIDER=google
AI_MODEL=gemini-2.5-flash
AI_API_KEY=your-key-here
```

| `AI_PROVIDER` | Suggested `AI_MODEL` | Where to get a key | Notes |
| --- | --- | --- | --- |
| `google` | `gemini-2.5-flash` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | Generous free tier. Recommended. |
| `groq` | `llama-3.3-70b-versatile` | [console.groq.com/keys](https://console.groq.com/keys) | Free and extremely fast. |
| `openai` | `gpt-4.1-mini` | [platform.openai.com](https://platform.openai.com) | Paid, highest quality. |
| `openrouter` | `google/gemini-2.0-flash-001` | [openrouter.ai/keys](https://openrouter.ai/keys) | One key, many models. |
| `deepseek` | `deepseek-chat` | [platform.deepseek.com](https://platform.deepseek.com) | Cheap. |
| `custom` | anything | — | Any OpenAI-compatible endpoint; also set `AI_BASE_URL`. |

Restart the dev server after changing `.env.local`.

---

## What is actually running

There is no fine-tuned model. Nothing was "trained" in the machine-learning sense. The persona comes from three things working together:

**1. A knowledge corpus** — `src/lib/data/knowledge.ts` holds ~40 short notes written in first person. This is the source of truth for who you are.

**2. Retrieval (BM25)** — `src/lib/ai/retrieval.ts` scores every note against the visitor's question and injects only the most relevant ones into the prompt. Lexical, not embeddings: the corpus is small, so BM25 is exact, instant, free, and needs no vector database or cold-start indexing.

**3. A persona prompt** — `src/lib/ai/system-prompt.ts` tells the model it *is* Muaz, sets the voice, and forbids inventing facts. The retrieved notes are pasted in beneath it.

Then the model can call **tools**, which is where the site stops looking like a chatbot:

```
visitor question
      ↓
BM25 retrieval → system prompt  →  provider (streaming)
      ↓
model picks a tool  →  executeTool()  →  { compact JSON back to the model
                                        { tool name streamed to the browser
      ↓                                        ↓
model writes prose  ─────────────────→  <ProjectsTool /> mounts on screen
```

The model never writes markup. It picks one of eight tools and the browser decides what that looks like:

| Tool | Renders |
| --- | --- |
| `getPresentation` | Intro card with photo, location, studies |
| `getProjects` | Filterable gallery of all 17 projects |
| `getSkills` | Categorised skill board |
| `getResume` | CV timeline with download |
| `getContact` | Every contact channel |
| `getInternship` | Availability card |
| `getCrazy` | Fun facts |
| `getSports` | Life away from the keyboard |

Everything streams over a hand-rolled NDJSON protocol (`src/lib/ai/protocol.ts`) consumed by `src/hooks/use-portfolio-chat.ts`. No AI SDK dependency, so provider and framework churn cannot break the app.

---

## Editing your own data

Everything personal lives in five files. Change them and both the UI and the AI update — there is no separate index to rebuild.

| File | Holds |
| --- | --- |
| `src/lib/data/profile.ts` | Name, contact, education, roles, availability, fun facts |
| `src/lib/data/projects.ts` | Every project, its tech, links and status |
| `src/lib/data/skills.ts` | Skill groups and what you are learning |
| `src/lib/data/knowledge.ts` | The notes the AI answers from |
| `src/lib/data/questions.ts` | Landing-page tiles and suggested questions |

**To teach the site something new, add a chunk to `knowledge.ts`.** That is the entire workflow:

```ts
{
  id: 'my-new-fact',
  topic: 'Short label',
  tags: ['keywords', 'that', 'should', 'match'],
  text: "Written in first person, as if you said it.",
}
```

### Things to fill in

Search the codebase for `TODO(muaz)`. These are placeholders I could not verify from a public source:

- `PROFILE.socials.linkedin` — currently `null`
- `PROFILE.age`, `PROFILE.calendly` — currently `null`
- `PROFILE.offKeyboard` and `PROFILE.interests` — plausible but unverified, and the Sports card says so on screen
- `PROFILE.resumeUrl` — drop a real `muaz-resume.pdf` into `public/`

### One privacy note

`PROFILE.phone` contains your real number, taken from your own public SEC portfolio. The AI can share it if asked. Delete that line if you would rather it did not — nothing else depends on it.

---

## Data sources

Every fact was pulled from something you published:

- `api.github.com/users/muazz7` — profile, bio, and all 17 repos with languages, links and descriptions
- `portfolio.muaz.pro` — about copy, education timeline, stack, project groupings
- `sec-portfolio.muaz.pro` — full name, strengths, address, phone
- `garage.muaz.pro`, `muaz.pro` — project confirmation

---

## Project layout

```
src/
├─ app/
│  ├─ page.tsx              Landing page (WebGL fluid, hero, ask box, tiles)
│  ├─ chat/page.tsx         Chat route
│  ├─ api/chat/route.ts     Streaming endpoint: validation, rate limit, engine choice
│  └─ globals.css           Design tokens (light + dark)
├─ components/
│  ├─ chat/                 Header, input, message list, tool renderer, markdown
│  ├─ tools/                The eight generative-UI components
│  ├─ ui/                   Button, dialog, tooltip primitives
│  ├─ brand-icons.tsx       GitHub/X/Instagram/etc (lucide v1 dropped brand marks)
│  ├─ fluid-canvas.tsx      Mounts the simulation
│  └─ welcome-modal.tsx     "What am I looking at" dialog
├─ hooks/
│  └─ use-portfolio-chat.ts Streaming chat client
└─ lib/
   ├─ ai/                   provider · retrieval · tools · system-prompt · agent · fallback · rate-limit
   ├─ data/                 Your data (see above)
   └─ fluid-simulation.ts   GPU Navier-Stokes solver for the background
```

## The background

`src/lib/fluid-simulation.ts` is a real incompressible fluid solver running in fragment shaders — advection, vorticity confinement, and a Jacobi pressure solve, with pointer movement injecting velocity and colour. Same technique as Pavel Dobryakov's well-known WebGL Fluid Simulation, written here from the algorithm so it is typed, self-contained, and cleans up its GL resources on unmount.

It is skipped entirely when `prefers-reduced-motion` is set or the GPU has no float-texture path. The static gradient underneath carries the page in that case.

---

## Security and limits

- Input validated with zod: max 40 messages, 4,000 characters each
- Per-IP sliding-window rate limit, `RATE_LIMIT_PER_HOUR` (default 60). Held in process memory, so on serverless each instance counts separately — enough to stop one bored visitor draining your quota. Swap the `Map` in `rate-limit.ts` for Upstash Redis if you ever need it airtight.
- API keys are server-only. Nothing reaches the browser.
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and a restrictive `Permissions-Policy` are set in `next.config.ts`.
- The prompt refuses off-topic work, will not discuss other people beyond what is already public, and declines rather than guessing.

## Deploy

Push to GitHub, import on [Vercel](https://vercel.com), and add `AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY` and `NEXT_PUBLIC_SITE_URL` as environment variables. No other configuration needed.

## Commands

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # serve the build
npm run typecheck  # tsc --noEmit
```

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · Motion · Radix primitives · zod · WebGL
