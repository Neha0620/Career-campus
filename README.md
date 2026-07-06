# Career Compass

AI-guided career navigation: paste a resume, name a target role, and get a
real skill-gap reading, a generated learning roadmap, and a conversational
advisor — all behind real authentication and backed by a real database, not
mocked data.

## Why this project

Most "career guidance" portfolio projects are a form plus a static tip list.
This one does actual structured reasoning over unstructured input (a resume)
and turns it into something you can act on and track, with the auth and
authorization model built the way you'd defend it in a real interview — not
just a client-trusted ID.

## Stack

- **Next.js 14 (App Router) + TypeScript** — single deployable for UI + API
- **NextAuth (credentials + JWT sessions) + bcrypt** — real sign-up/sign-in,
  protected routes via middleware, every API route re-derives identity from
  the session instead of trusting a client-supplied ID
- **Tailwind CSS + Framer Motion** — the "night navigation" visual language
- **PostgreSQL + Prisma** — User / Profile / Roadmap / Milestone / ChatMessage
- **Gemini or Claude (pluggable)** — skill extraction, gap scoring, roadmap
  generation, and a streaming chat advisor. Defaults to Gemini's free tier
  (no credit card) if `GEMINI_API_KEY` is set, falls back to Anthropic if
  `ANTHROPIC_API_KEY` is set instead, and falls back further to a mock mode
  with canned responses if neither is configured — so the whole app is
  runnable with zero AI account setup
- **Recharts** — skill radar (have vs. need)
- **Docker Compose** for a local Postgres that matches production
- **GitHub Actions** CI running lint + build on every push/PR

## Architecture

```
src/
  middleware.ts             protects /onboarding, /dashboard, /chat
  app/
    page.tsx                  landing
    login/page.tsx             sign in / sign up
    onboarding/page.tsx        4-step quiz → POST /api/onboarding
    dashboard/page.tsx         GET /api/dashboard → radar + roadmap
    chat/page.tsx               streaming advisor UI
    api/
      auth/[...nextauth]/route.ts   NextAuth handler
      auth/register/route.ts         bcrypt-hashed sign-up
      onboarding/route.ts            resume → skill analysis → roadmap
      analyze/route.ts                re-run analysis on demand
      dashboard/route.ts              read profile + latest roadmap
      milestones/[id]/route.ts        toggle milestone (ownership-checked)
      chat/route.ts                    streaming advisor endpoint
  lib/
    auth.ts                  NextAuth config (credentials provider)
    llm.ts                   Claude prompts for analysis/roadmap/chat
    prisma.ts                Prisma client singleton
prisma/
  schema.prisma              data model
  seed.ts                    demo account + sample roadmap
```

Two things worth being able to explain in an interview:

1. **The LLM is the engine, not a bolt-on chatbot.** Skill extraction and
   roadmap generation are structured-JSON calls to Claude rather than a
   hand-rolled NLP pipeline. Fast to build, less deterministic — worth being
   able to discuss that tradeoff and how you'd add output validation.
2. **No API route trusts a client-supplied user ID.** Every route calls
   `getServerSession` and derives `userId` server-side; the milestone-toggle
   route additionally checks that the milestone's roadmap belongs to the
   requesting user before allowing a write. That's the difference between a
   demo and something you'd be comfortable calling "secure by default."

## Setup

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL, NEXTAUTH_SECRET, and ONE of the AI keys below

# Option A — local Postgres via Docker
docker compose up -d
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/careercompass"

# Option B — hosted Postgres (Neon / Supabase), just paste the URL into .env

npm run db:push             # sync schema
npm run db:seed             # optional: creates demo@careercompass.dev / demo1234
npm run dev
```

Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`.

**AI provider — pick one:**
- Gemini (free, no credit card): get a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey), set `GEMINI_API_KEY`
- Anthropic (requires a funded Console account): [console.anthropic.com](https://console.anthropic.com), set `ANTHROPIC_API_KEY`
- Neither: leave `ANTHROPIC_API_KEY="mock"` and the app runs with canned responses (clearly labeled `[Mock mode]` in the UI)

## Deploy

- **Vercel** for the app (runs the Next.js API routes natively)
- Point `DATABASE_URL` at hosted Postgres in Vercel's env vars
- Set `GEMINI_API_KEY` (or `ANTHROPIC_API_KEY`), `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (your deployed URL)
- CI (`.github/workflows/ci.yml`) runs lint + build on every push/PR — wire
  a Vercel deploy hook or GitHub integration to ship on green

## Known scope cuts (be upfront about these — it reads as maturity, not laziness)

- **Job market data isn't live**: no dashboard pulling real listings yet.
  Natural next step: Adzuna or RemoteOK API, cached in Postgres.
- **No resume file upload**: text paste only, by design — a PDF parser adds
  a real dependency and failure surface (`pdf-parse` is the usual choice)
  that wasn't worth the risk for this scope. Mention it as the next step,
  don't silently skip it.
- **No password reset flow** — sign-up/sign-in only. Would need an email
  provider (Resend, Postmark) wired into NextAuth's email flow.
- **Skill extraction accuracy** depends entirely on prompt quality — no eval
  suite yet. If you want to go further, log analyses and spot-check weekly.

## What to say about it on a resume

> Built a full-stack career guidance platform (Next.js, PostgreSQL, NextAuth,
> Claude API) with session-based authentication and per-request
> authorization checks; extracts skills from resume text, scores fit
> against a target role, and generates a personalized learning roadmap with
> progress tracking. Included Docker Compose for local dev parity and a
> GitHub Actions CI pipeline; deployed on Vercel.

That's true, specific, and defensible line-by-line in an interview — which
matters more than any single feature.
