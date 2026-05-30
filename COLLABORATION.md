# TotoTrack — Developer Collaboration Guide

## Getting Started (new team member)

```bash
git clone https://github.com/siqah/Tototrack.git
cd Tototrack
git checkout chore/project-setup

pnpm install

cp env.example .env.local
# Fill in .env.local — see Environment Variables section below

pnpm convex dev   # Terminal 1 — keep running (generates types + deploys schema)
pnpm dev          # Terminal 2 — Next.js on http://localhost:3000
```

Then visit [http://localhost:3000/setup](http://localhost:3000/setup) and click **Seed Demo Data**.

---

## Environment Variables

Copy `env.example` to `.env.local` and fill in:

| Variable | Required | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | ✅ | Auto-set by `pnpm convex dev` |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | ✅ | Auto-set by `pnpm convex dev` |
| `CONVEX_DEPLOYMENT` | ✅ | Auto-set by `pnpm convex dev` |
| `BETTER_AUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | ✅ | `http://localhost:3000` for dev |
| `NEXT_PUBLIC_APP_URL` | ✅ | `http://localhost:3000` for dev |
| `GROQ_API_KEY` | ✅ | [console.groq.com/keys](https://console.groq.com/keys) |
| `UJUMBESMS_API_KEY` | ✅ | [ujumbesms.co.ke](https://ujumbesms.co.ke) |
| `UJUMBESMS_EMAIL` | ✅ | Your UjumbeSMS account email |
| `GOOGLE_CLIENT_ID` | optional | Google Cloud Console OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | optional | Google Cloud Console OAuth 2.0 |
| `INTASEND_PUBLIC_KEY` | Phase 2 | [intasend.com](https://intasend.com) |
| `INTASEND_SECRET_KEY` | Phase 2 | [intasend.com](https://intasend.com) |

> **Convex functions can't read `.env.local`** — push server-side secrets separately:

```bash
pnpm convex env set BETTER_AUTH_SECRET <value>
pnpm convex env set BETTER_AUTH_URL http://localhost:3000
pnpm convex env set NEXT_PUBLIC_CONVEX_SITE_URL <value>
pnpm convex env set GROQ_API_KEY <value>
pnpm convex env set UJUMBESMS_API_KEY <value>
pnpm convex env set UJUMBESMS_EMAIL <value>
# Optional
pnpm convex env set GOOGLE_CLIENT_ID <value>
pnpm convex env set GOOGLE_CLIENT_SECRET <value>
```

---

## Google OAuth Setup (optional)

To enable "Continue with Google" on the sign-in page:

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add these **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   https://<your-convex-site-url>/api/auth/callback/google
   ```
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.local` and Convex env vars

---

## Important: `convex/_generated/` is gitignored

This folder is auto-generated per deployment and is **not committed**. Every developer generates their own by running `pnpm convex dev`. Never commit it manually.

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, demo-ready |
| `chore/project-setup` | Current active development |

Open PRs against `main` when a feature is demo-ready.

---

## Demo Seed

See [SEED.md](SEED.md) for all demo accounts, buses, children, and route stops.

Quick reference — all passwords are `password`:

```
grace.wekesa@demo.tototrack   → parent of Amani (bus KCA-123Y)
james.otieno@demo.tototrack   → parent of Zawadi (bus KCA-123Y)
mary.mwangi@demo.tototrack    → parent of Baraka (bus KBZ-456X)
peter.kamau@demo.tototrack    → parent of Imani  (bus KBZ-456X)
driver.kca@demo.tototrack     → driver of KCA-123Y
driver.kbz@demo.tototrack     → driver of KBZ-456X
```

---

## Project Structure

```
app/            Next.js routes (pages)
convex/         Backend — mutations, queries, actions, schema
components/     React UI components
lib/            Auth client, utilities, Nairobi coordinates
public/         Static assets
```

See [README.md](README.md) for the full structure breakdown.

---

## Common Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm convex dev` | Deploy schema + watch Convex functions |
| `pnpm convex env list` | List Convex environment variables |
| `pnpm convex env set KEY value` | Set a Convex environment variable |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
