# TotoTrack

> **"Every child. Every journey. Accounted for."**

AI-powered school bus tracking for Kenyan schools. Real-time GPS on Nairobi streets, Groq AI anomaly detection, natural language SMS to parents via UjumbeSMS, and manual boarding confirmation for drivers.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 App Router + Tailwind CSS + shadcn/ui |
| Backend | Convex (real-time WebSocket subscriptions) |
| Auth | Better Auth v1.6 + `@convex-dev/better-auth` v0.12 |
| AI | Vercel AI SDK + Groq (`llama-3.3-70b-versatile`) |
| SMS | `ujumbe-sms-client` (Kenyan gateway) |
| Maps | MapLibre GL JS + OpenFreeMap (free, no API key) |
| Payments | IntaSend (M-Pesa STK Push — Phase 2) |

---

## User Flows

### School Admin
1. Sign in at `/sign-in` with email/password or Google OAuth
2. Land on `/` — fleet overview map (all buses live on dark Nairobi map)
3. Click a bus marker → side panel shows driver info, speed, children manifest
4. Click bus ID → `/buses/[busId]` for full per-bus view + alert feed
5. Go to `/alerts` to see all active/resolved anomaly alerts; click **Resolve** to clear
6. Go to `/setup` to seed demo data and start the bus simulator

### Driver
1. Sign in at `/sign-in` with email/password (provisioned by admin)
2. Land on `/driver/[busId]` — mobile-optimised boarding list
3. Tap **Confirm Boarded** next to each child as they board the bus
4. Button locks after confirm (no double-confirm)
5. Parent receives AI-generated SMS automatically on each confirmation

### Parent
1. Register at `/sign-up` with name, email, password
2. Land on `/parent` — see all registered children, their bus, stop, and live boarding status
3. Receive SMS updates at key moments: boarding, ETA, arrival, anomaly (no app needed)

### Demo / Setup
1. Visit `/setup` and click **Seed Demo Data** — creates 1 school, 2 buses (KCA-123Y, KBZ-456X), 4 children
2. Click **Start (10s interval)** — simulator moves buses along the Westlands → Karen route every 10 seconds
3. Click **Trigger Anomaly** on a bus — deviates it 600m off route, sets status to `flagged`, fires alert
4. Click **Reset** to restore a bus to the start of the route

---

## Roles

| Role | Sign-in | Default redirect |
|---|---|---|
| `school_admin` | Email/password or Google | `/` (fleet map) |
| `driver` | Email/password | `/driver/[busId]` |
| `parent` | Self-register at `/sign-up` | `/parent` |
| `operator` | Email/password or Google | `/` (fleet map) |

Roles are stored in the `userRoles` Convex table (Better Auth v0.12 does not support custom user fields).

---

## Local Setup

```bash
# 1. Clone and install
git clone https://github.com/siqah/Tototrack.git
cd Tototrack
pnpm install

# 2. Copy env template and fill in values
cp env.example .env.local

# 3. Start Convex (keep this terminal open — generates types + deploys schema)
pnpm convex dev

# 4. Start Next.js (new terminal)
pnpm dev
```

Open [http://localhost:3000/setup](http://localhost:3000/setup), seed the demo data, then go to [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

See `env.example` for all keys. The minimum required to run locally:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Auto-set by `pnpm convex dev` |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |

Convex functions need their own copy of server-side secrets (they can't read `.env.local`):

```bash
pnpm convex env set BETTER_AUTH_SECRET <value>
pnpm convex env set BETTER_AUTH_URL http://localhost:3000
pnpm convex env set NEXT_PUBLIC_CONVEX_SITE_URL <value>  # auto-set by convex dev
pnpm convex env set GROQ_API_KEY <value>
pnpm convex env set UJUMBESMS_API_KEY <value>
pnpm convex env set UJUMBESMS_EMAIL <value>
# optional
pnpm convex env set GOOGLE_CLIENT_ID <value>
pnpm convex env set GOOGLE_CLIENT_SECRET <value>
```

---

## Project Structure

```
app/                    Next.js routes
  page.tsx              Fleet overview (admin)
  sign-in/              Better Auth sign-in
  sign-up/              Parent self-registration
  buses/[busId]/        Per-bus detail + anomaly feed
  driver/[busId]/       Mobile boarding confirmation
  parent/               Parent child status view
  alerts/               All alerts with resolve
  setup/                Demo seed + simulator controls
  api/auth/[...all]/    Better Auth proxy → Convex

convex/
  schema.ts             8 app tables + userRoles
  auth.ts               createClient + createAuth factory + requireRole
  http.ts               Convex HTTP router (Better Auth routes)
  buses.ts              Live bus queries + status mutations
  children.ts           Boarding confirmation mutations
  tracking.ts           Location update + history
  alerts.ts             Alert CRUD
  anomaly.ts            Groq AI anomaly detection action
  notifications.ts      UjumbeSMS send action
  simulator.ts          Demo route tick + triggerAnomaly
  userRoles.ts          Role management (set/get)

components/
  map/FleetMap.tsx       MapLibre GL + OpenFreeMap real-time markers
  dashboard/             FleetOverview, AlertFeed, BusDetailPanel
  driver/BoardingList    One-tap boarding confirmation
  auth/                  SignInForm, GoogleSignInButton

lib/
  auth-client.ts         Better Auth React hooks (signIn, signUp, useSession)
  nairobi.ts             Demo route coordinates (Westlands → Karen)
```
