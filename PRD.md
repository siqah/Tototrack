# TotoTrack — Product Requirements Document

> **"Every child. Every journey. Accounted for."**

**Version:** 2.0  
**Date:** May 2026  
**Author:** TotoTrack Team  
**Status:** Active — Hackathon Build + Roadmap

---

## Table of Contents

1. [Executive Summary](https://claude.ai/chat/4286b051-c0d4-4d9a-98a7-690cd7219028#1-executive-summary)
2. [Problem Statement](https://claude.ai/chat/4286b051-c0d4-4d9a-98a7-690cd7219028#2-problem-statement)
3. [Target Users](https://claude.ai/chat/4286b051-c0d4-4d9a-98a7-690cd7219028#3-target-users)
4. [Business Model](https://claude.ai/chat/4286b051-c0d4-4d9a-98a7-690cd7219028#4-business-model)
5. [Tech Stack](https://claude.ai/chat/4286b051-c0d4-4d9a-98a7-690cd7219028#5-tech-stack)
6. [Authentication — Better Auth + Convex](https://claude.ai/chat/4286b051-c0d4-4d9a-98a7-690cd7219028#6-authentication--better-auth--convex)
7. [Convex Schema](https://claude.ai/chat/4286b051-c0d4-4d9a-98a7-690cd7219028#7-convex-schema)
8. [Phase 1 — Hackathon Features](https://claude.ai/chat/4286b051-c0d4-4d9a-98a7-690cd7219028#8-phase-1--hackathon-features-4-hours)
9. [Phase 2 — Post-Hackathon Features](https://claude.ai/chat/4286b051-c0d4-4d9a-98a7-690cd7219028#9-phase-2--post-hackathon-features-24-weeks)
10. [Phase 3 — Scale Features](https://claude.ai/chat/4286b051-c0d4-4d9a-98a7-690cd7219028#10-phase-3--scale-features-26-months)
11. [AI Prompts](https://claude.ai/chat/4286b051-c0d4-4d9a-98a7-690cd7219028#11-ai-prompts)
12. [SMS Integration — UjumbeSMS](https://claude.ai/chat/4286b051-c0d4-4d9a-98a7-690cd7219028#12-sms-integration--ujumbesms)
13. [Map Integration — MapLibre + OpenFreeMap](https://claude.ai/chat/4286b051-c0d4-4d9a-98a7-690cd7219028#13-map-integration--maplibre--openfreemap)
14. [Environment Variables](https://claude.ai/chat/4286b051-c0d4-4d9a-98a7-690cd7219028#14-environment-variables)
15. [Project Structure](https://claude.ai/chat/4286b051-c0d4-4d9a-98a7-690cd7219028#15-project-structure)
16. [Demo Script](https://claude.ai/chat/4286b051-c0d4-4d9a-98a7-690cd7219028#16-demo-script)
17. [Judging Criteria Alignment](https://claude.ai/chat/4286b051-c0d4-4d9a-98a7-690cd7219028#17-judging-criteria-alignment)
18. [Why TotoTrack Wins](https://claude.ai/chat/4286b051-c0d4-4d9a-98a7-690cd7219028#18-why-tototrack-wins)

---

## 1. Executive Summary

TotoTrack is a B2B AI-powered school bus tracking platform built for Kenyan schools. It gives school administrators, parents, and bus operators complete real-time visibility into every child's transit journey — from gate to home.

Unlike raw GPS trackers, TotoTrack layers AI on top of location data to generate human-readable parent updates, detect route anomalies automatically, and provide schools with a full audit trail of every journey.

**"Toto"** means _child_ in Swahili. The name is intentional — this product is built for Africa, by Africans.

---

## 2. Problem Statement

| Problem                                                     | Impact                                            |
| ----------------------------------------------------------- | ------------------------------------------------- |
| Parents have zero visibility into their child's bus journey | Daily anxiety, no trust in the system             |
| Drivers manage attendance manually with paper lists         | Human error, no audit trail                       |
| Schools have no incident audit trail                        | Liability exposure, no accountability             |
| Existing GPS trackers return raw coordinates                | Useless to non-technical parents and admins       |
| No SaaS product exists for Kenyan school fleet management   | Operators run on WhatsApp groups and spreadsheets |

---

## 3. Target Users

### Primary — School Admin

- **Role:** Fleet manager, responsible for all buses under the school
- **Pain:** No real-time visibility, manual incident reporting, no historical data
- **Needs:** Dashboard showing all buses live, instant alerts, per-journey logs
- **Auth role:** `school_admin`

### Secondary — Parent

- **Role:** Guardian of a child on a school bus
- **Pain:** Anxiety during transit window, zero proactive communication
- **Needs:** SMS updates at key moments — boarding, ETA, arrival, anomalies
- **Constraint:** Cannot be required to install an app (friction killer)
- **Auth role:** `parent`

### Tertiary — Driver

- **Role:** Operates the bus, responsible for boarding confirmation
- **Pain:** Manual attendance on paper, no incident reporting tool
- **Needs:** Simple mobile-friendly UI to tap boarding confirmations
- **Auth role:** `driver`

### Quaternary — Bus Operator (B2B Customer)

- **Role:** Owns the fleet, sells transport service to schools
- **Pain:** No SaaS tool built for Kenyan fleet management
- **Needs:** Multi-school dashboard, billing, driver management
- **Auth role:** `operator`

---

## 4. Business Model

### Pricing

| Tier       | Price (KES/bus/month) | Included                                                |
| ---------- | --------------------- | ------------------------------------------------------- |
| Starter    | 3,000                 | Up to 5 buses, SMS alerts, admin dashboard              |
| Growth     | 5,000                 | Up to 20 buses, AI anomaly detection, history logs      |
| Enterprise | 8,000                 | Unlimited buses, face confirmation (Phase 2), analytics |

### Revenue Model

- Schools pay per bus monthly via IntaSend M-Pesa or card
- Parents access free under the school's subscription
- Bus operators pay directly and manage multiple school accounts

### Revenue Projections

| Scale  | Buses                       | Monthly Revenue (KES) |
| ------ | --------------------------- | --------------------- |
| Early  | 20 buses, 1 school cluster  | 60,000 – 160,000      |
| Growth | 50 buses, 3 school clusters | 150,000 – 400,000     |
| Scale  | 200 buses, 10+ schools      | 600,000 – 1,600,000   |

### Payment Stack

- **IntaSend** — M-Pesa STK Push + card billing for school subscriptions
- **UjumbeSMS** — SMS delivery to parents per notification event

---

## 5. Tech Stack

| Layer    | Technology                              | Reason                                                              |
| -------- | --------------------------------------- | ------------------------------------------------------------------- |
| Frontend | Next.js 15 App Router                   | Fast, client-side real-time updates                                 |
| Backend  | Convex                                  | Real-time WebSocket subscriptions, serverless actions, file storage |
| Auth     | Better Auth + `@convex-dev/better-auth` | Framework-agnostic, role-based, OAuth + email/password              |
| AI       | Vercel AI SDK + Anthropic Claude        | Anomaly detection, NL SMS generation                                |
| SMS      | `ujumbe-sms-client`                     | Kenyan SMS gateway, local deliverability                            |
| Maps     | MapLibre GL JS + OpenFreeMap            | Open-source, zero cost, no API key required                         |
| UI       | shadcn/ui + Tailwind CSS                | Consistent, accessible component system                             |
| Payments | IntaSend                                | M-Pesa STK Push, local KES billing                                  |

### Architecture Rules

- All data mutations go through **Convex mutations**
- All external API calls (SMS, AI, payments) go through **Convex actions** (`"use node"`)
- Real-time bus location updates stream via **Convex WebSocket** using `useQuery` hooks
- Auth state managed by **Better Auth**; Convex functions verify sessions via `@convex-dev/better-auth`
- Maps rendered with **MapLibre GL JS** against **OpenFreeMap** tile server (free, no key needed)
- All Claude calls return **structured JSON** — always parse safely with try/catch
- TypeScript throughout — **no `any` types**

---

## 6. Authentication — Better Auth + Convex

### Why Better Auth

| Concern                                          | Better Auth advantage                                |
| ------------------------------------------------ | ---------------------------------------------------- |
| Role-based access (admin/driver/parent/operator) | Built-in roles + metadata fields                     |
| OAuth providers (Google for school admins)       | First-class support, 30+ providers                   |
| Framework agnostic                               | Next.js today, Expo tomorrow, same auth              |
| Session management                               | Server-side sessions, not just JWTs                  |
| Convex integration                               | Official `@convex-dev/better-auth` component v0.11.4 |

### Installation

```bash
npm install better-auth @convex-dev/better-auth
```

### Convex Component Setup

```typescript
// convex/convex.config.ts
import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";

const app = defineApp();
app.use(betterAuth);
export default app;
```

### Auth Server Config

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { convexAdapter } from "@convex-dev/better-auth";
import { convex } from "./convex";

export const auth = betterAuth({
  database: convexAdapter(convex),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "parent",
        // "school_admin" | "driver" | "parent" | "operator"
      },
      schoolId: { type: "string", required: false },
      busId: { type: "string", required: false },
    },
  },
});
```

### Auth Client (React hooks)

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### Convex Auth Bridge

```typescript
// convex/auth.ts
import { BetterAuth } from "@convex-dev/better-auth";
import { components } from "./_generated/api";

export const betterAuth = new BetterAuth(components.betterAuth);

// Guard any Convex query/mutation by role
export async function requireRole(ctx: QueryCtx | MutationCtx, role: string) {
  const session = await betterAuth.getSession(ctx);
  if (!session || session.user.role !== role) {
    throw new Error(`Unauthorized: requires ${role}`);
  }
  return session.user;
}
```

### Route Guards in Next.js Middleware

```typescript
// middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth.middleware({
  rules: [
    { path: "/dashboard/*", role: ["school_admin", "operator"] },
    { path: "/driver/*", role: ["driver"] },
    { path: "/parent/*", role: ["parent"] },
  ],
});
```

### Auth Flows by Role

| Role         | Sign-in method                        | Redirect after auth |
| ------------ | ------------------------------------- | ------------------- |
| School Admin | Email/password or Google OAuth        | `/dashboard`        |
| Driver       | Email/password (provisioned by admin) | `/driver/[busId]`   |
| Parent       | Email/password (self-register)        | `/parent`           |
| Operator     | Email/password or Google OAuth        | `/operator`         |

---

## 7. Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Note: Better Auth manages its own tables via @convex-dev/better-auth
  // (user, session, account, verification) — auto-created by the component.
  // Do NOT define them manually.

  schools: defineTable({
    name: v.string(),
    subscriptionTier: v.string(), // "starter" | "growth" | "enterprise"
    subscriptionStatus: v.string(), // "active" | "trial" | "suspended"
    mpesaPhone: v.string(),
    adminUserId: v.string(), // Better Auth user.id
    adminEmail: v.string(),
    adminPhone: v.string(),
    createdAt: v.number(),
  }),

  buses: defineTable({
    schoolId: v.id("schools"),
    busId: v.string(), // human-readable e.g. "KCA-123Y"
    plateNumber: v.string(),
    driverName: v.string(),
    driverPhone: v.string(),
    driverUserId: v.optional(v.string()), // Better Auth user.id for driver
    currentLat: v.number(),
    currentLng: v.number(),
    speed: v.number(), // km/h
    heading: v.optional(v.number()), // degrees 0-360
    status: v.string(), // "en_route" | "stopped" | "at_school" | "flagged" | "idle"
    lastUpdated: v.number(),
  }).index("by_school", ["schoolId"]),

  routes: defineTable({
    busId: v.string(),
    schoolId: v.id("schools"),
    waypoints: v.array(
      v.object({
        lat: v.number(),
        lng: v.number(),
        label: v.string(),
        order: v.number(),
        expectedArrivalTime: v.string(),
      }),
    ),
  }).index("by_bus", ["busId"]),

  children: defineTable({
    schoolId: v.id("schools"),
    busId: v.string(),
    name: v.string(),
    photoStorageId: v.optional(v.string()),
    parentName: v.string(),
    parentPhone: v.string(),
    parentUserId: v.optional(v.string()), // Better Auth user.id if parent registered
    stopLabel: v.string(),
    stopOrder: v.number(),
    boardedAt: v.optional(v.number()),
    status: v.string(), // "waiting" | "onboard" | "delivered"
    grade: v.string(),
  })
    .index("by_bus", ["busId"])
    .index("by_school", ["schoolId"])
    .index("by_parent", ["parentUserId"]),

  locationHistory: defineTable({
    busId: v.string(),
    lat: v.number(),
    lng: v.number(),
    speed: v.number(),
    timestamp: v.number(),
  }).index("by_bus", ["busId"]),

  alerts: defineTable({
    busId: v.string(),
    schoolId: v.id("schools"),
    type: v.string(), // "off_route" | "unexpected_stop" | "speeding" | "no_movement"
    severity: v.string(), // "low" | "medium" | "high"
    message: v.string(), // AI-generated admin message
    parentMessage: v.string(), // AI-generated parent SMS text
    lat: v.number(),
    lng: v.number(),
    triggeredAt: v.number(),
    resolvedAt: v.optional(v.number()),
    notifiedParents: v.boolean(),
  })
    .index("by_bus", ["busId"])
    .index("by_school", ["schoolId"]),

  boardingEvents: defineTable({
    busId: v.string(),
    childId: v.id("children"),
    confirmedAt: v.number(),
    confirmedBy: v.string(), // driver userId or "face_recognition"
    method: v.string(), // "manual" | "face_recognition"
    photoStorageId: v.optional(v.string()),
  }).index("by_bus", ["busId"]),

  smsLog: defineTable({
    to: v.string(),
    message: v.string(),
    type: v.string(), // "boarding" | "eta" | "arrival" | "anomaly"
    status: v.string(), // "success" | "error"
    sentAt: v.number(),
    childId: v.optional(v.id("children")),
    alertId: v.optional(v.id("alerts")),
  }),
});
```

---

## 8. Phase 1 — Hackathon Features (4 hours)

> **Goal:** A working, demo-ready build that judges can interact with in real time.

---

### F1. Live Bus Tracking Map (MapLibre + OpenFreeMap)

**Description:** Real-time map on Nairobi streets. Zero API cost — OpenFreeMap's free tile server backed by OpenStreetMap data.

**Map Component:**

```typescript
// components/map/FleetMap.tsx
"use client";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const NAIROBI_CENTER: [number, number] = [36.8219, -1.2921];

export function FleetMap({ schoolId }: { schoolId: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markers = useRef<Map<string, maplibregl.Marker>>(new Map());

  // Convex WebSocket real-time subscription — auto-updates on every bus mutation
  const buses = useQuery(api.buses.getLiveBySchool, { schoolId });

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: NAIROBI_CENTER,
      zoom: 12,
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || !buses) return;
    buses.forEach((bus) => {
      const color =
        bus.status === "flagged" ? "#ef4444"
        : bus.speed > 5 ? "#22c55e"
        : "#f59e0b";

      const existing = markers.current.get(bus.busId);
      if (existing) {
        existing.setLngLat([bus.currentLng, bus.currentLat]);
        existing.getElement().style.background = color;
      } else {
        const el = document.createElement("div");
        el.style.cssText = `
          width:36px;height:36px;background:${color};
          border:2px solid white;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:18px;cursor:pointer;
          box-shadow:0 2px 8px rgba(0,0,0,.3);transition:background .3s;
        `;
        el.textContent = "🚌";
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([bus.currentLng, bus.currentLat])
          .addTo(mapRef.current!);
        markers.current.set(bus.busId, marker);
      }
    });
  }, [buses]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
}
```

**Requirements:**

- MapLibre GL JS with OpenFreeMap `liberty` or `dark` style
- Centered on Nairobi at zoom 12
- Marker colors: 🟢 green (speed >5), 🟡 amber (slow/stopped), 🔴 red (flagged)
- Convex `useQuery` streams updates — **no polling, pure WebSocket**
- Bus simulator: `setInterval` every 10s mutates `currentLat/currentLng` in Convex
- "Trigger Anomaly" button deviates bus off route for demo

**Acceptance Criteria:**

- [ ] Map loads with Nairobi streets, 2 simulated buses visible
- [ ] Markers move in real time without page refresh
- [ ] Clicking marker opens side panel with children manifest
- [ ] Status color updates correctly on anomaly
- [ ] No Mapbox API key or paid tier required

---

### F2. AI Anomaly Detection

**Description:** Claude analyzes GPS history against route waypoints and flags dangerous behavior automatically. Runs on every Convex location update.

| Anomaly Type      | Trigger                                                   |
| ----------------- | --------------------------------------------------------- |
| `off_route`       | >500m from nearest expected waypoint                      |
| `unexpected_stop` | Speed <3 km/h for >5 consecutive pings, not at a waypoint |
| `speeding`        | Speed >80 km/h                                            |
| `no_movement`     | No position change >15 min between 06:00–20:00 EAT        |

**On anomaly detected:**

1. Insert alert record into `alerts` table
2. Set bus `status` to `"flagged"`
3. Call `notifyAllParentsOnBus` action → batch UjumbeSMS

**Acceptance Criteria:**

- [ ] Anomaly fires within one location update cycle
- [ ] Alert appears on dashboard in real time via Convex subscription
- [ ] Parent SMS fires automatically
- [ ] Alert record has correct type, severity, coordinates

---

### F3. Natural Language Parent SMS Updates

**Description:** Claude generates warm, specific, human-sounding SMS from raw GPS + route data. Sent via `ujumbe-sms-client`.

| Event        | Trigger                         |
| ------------ | ------------------------------- |
| `boarding`   | Driver confirms child boarded   |
| `eta_update` | Bus 10 minutes from parent stop |
| `arrival`    | Bus arrives at parent stop      |
| `anomaly`    | Anomaly detected on bus         |

**Example outputs:**

```
Boarding:  "Amani boarded KCA 123Y at 07:14. Near Westlands, ~12 mins
            to your stop. — TotoTrack"

Anomaly:   "⚠️ Amani's bus stopped on Kikuyu Rd 6 mins. School notified.
            — TotoTrack"

Arrival:   "Amani arrived at your stop. Have a great day! — TotoTrack"
```

**Acceptance Criteria:**

- [ ] SMS fires within 5 seconds of trigger event
- [ ] Under 160 characters every time
- [ ] Includes child name, location, time estimate
- [ ] Logged in `smsLog` with `status: "success" | "error"`

---

### F4. School Admin Dashboard

**Pages:**

| Route            | Role                       | Description                                           |
| ---------------- | -------------------------- | ----------------------------------------------------- |
| `/`              | `school_admin`, `operator` | Fleet overview — all buses live on map, alert summary |
| `/buses/[busId]` | `school_admin`             | Per-bus detail — map, children manifest, alert feed   |
| `/alerts`        | `school_admin`             | All active and resolved alerts                        |
| `/setup`         | `school_admin`             | Seed data form for demo                               |
| `/sign-in`       | public                     | Better Auth email/password + Google OAuth             |
| `/sign-up`       | public                     | Parent self-registration                              |

**Requirements:**

- Fleet overview: buses count, active alerts, children in transit
- Alert feed: type badge, severity badge, AI-generated description, timestamp, resolve button
- Setup form populates complete demo seed data (school, 2 buses, routes, children)

**Acceptance Criteria:**

- [ ] Loads with seed data without manual Convex entry
- [ ] Alert count updates live when anomaly fires
- [ ] Per-bus manifest shows correct boarding statuses
- [ ] Auth redirects work per role (Better Auth middleware)

---

### F5. Manual Boarding Confirmation — Driver View

**Route:** `/driver/[busId]` — protected, role: `driver`

**Requirements:**

- Lists all children assigned to this bus with stop label and status
- Tap "Confirm Boarded" → patches child `status`, inserts `boardingEvent`, triggers SMS
- Button disables after confirm — cannot double-confirm
- Minimal JS bundle, fast on 3G, works on low-end Android
- Driver authenticated via Better Auth email/password

**Acceptance Criteria:**

- [ ] Renders correctly on mobile viewport
- [ ] Confirming updates admin dashboard live
- [ ] Parent SMS fires within 5 seconds
- [ ] Cannot confirm same child twice

---

## 9. Phase 2 — Post-Hackathon Features (2–4 weeks)

### F6. Predictive ETA Engine

- `locationHistory` accumulates GPS pings per route per time window
- Learn Nairobi-specific patterns: Ngong Road 07:30–09:00 congestion, Waiyaki Way ABC Place junction delays, school gate Friday morning bottlenecks
- Stack: Convex `locationHistory` → periodic export → scikit-learn ridge regression → predictions served via Convex action
- ETA gets more accurate daily as route data grows

### F7. Face Confirmation at Boarding (Computer Vision)

- Camera at bus door captures frame on boarding event
- Frame sent to Claude vision via Convex action
- Matched against child school photo in Convex file storage
- Match confirmed → auto-marks `"onboard"`, triggers parent boarding SMS
- Unrecognized face → immediate `high` severity alert to admin
- Hardware: Raspberry Pi 4 + USB camera or Android phone in door mount

### F8. Absence Pattern Recognition

- Daily scheduled Convex action runs at end of school day
- Claude analyzes 30-day rolling window for non-boarding patterns
- Example flag: "Wanjiku has not boarded on 3 consecutive Mondays"
- Weekly attendance report for school admin
- Optional UjumbeSMS nudge to parent on unexpected absence

### F9. Parent Mobile App

- Expo (React Native)
- Better Auth session token exchange from web
- Push notifications replacing SMS for app users
- Live MapLibre map scoped to their child's bus only (privacy-scoped)
- Boarding and arrival history log (last 30 days)
- In-app messaging thread with school admin

### F10. Driver Mobile App

- Expo (React Native) with Better Auth `driver` role
- Auto-starts GPS tracking on route start (no manual GPS device needed)
- Boarding list with inline camera for photo confirmation
- SOS button → immediate `high` severity alert to school + all parents on bus
- End-of-route summary auto-generated by Claude
- Offline-first: caches GPS pings when signal drops, batch syncs to Convex on reconnect

---

## 10. Phase 3 — Scale Features (2–6 months)

### F11. Fleet Analytics for Operators

- Route efficiency score per bus per week
- Driver performance: speeding events, route adherence %, on-time rate
- On-time delivery rate per stop, per day of week
- Exportable PDF reports for school management boards

### F12. Multi-school Operator Portal

- Single `operator` role manages buses across multiple schools
- Per-school dashboards under one operator super-view
- Centralized IntaSend billing across all schools
- Operator-level alert aggregation

### F13. Route Optimization Suggestions

- AI analyzes historical routes and stop sequences
- Suggests reordering stops to reduce total journey time
- Flags routes where a second bus reduces overcrowding
- Estimated time savings shown per suggestion

### F14. Emergency Escalation Flow

- Panic button (driver app or future child wearable)
- Triggers push to school admin, all parents on bus, designated emergency contacts
- Auto-dials driver if stationary >20 min in unexpected location
- Full incident report auto-generated from location history + anomaly log

### F15. Offline-resilient Driver Tracking

- PWA driver app caches GPS pings when offline (common on Kenyan roads)
- Batch syncs to Convex on reconnect
- Map shows "last known position" + timestamp when offline
- No journey data lost due to connectivity gaps

---

## 11. AI Prompts

### Anomaly Detection Prompt

```
You are TotoTrack's safety monitor — an AI watching school buses
in Nairobi, Kenya to keep children safe.

Analyze the bus GPS data and return JSON only. No explanation outside the JSON.

Expected route waypoints: {{waypoints}}
Recent 20 GPS pings (newest last): {{history}}
Current position: lat {{lat}}, lng {{lng}}
Current speed: {{speed}} km/h
Current time: {{time}}
Day of week: {{day}}

Return this exact JSON structure:
{
  "isAnomaly": boolean,
  "anomalyType": "off_route" | "unexpected_stop" | "speeding" | "no_movement" | "none",
  "severity": "low" | "medium" | "high",
  "parentMessage": "SMS under 160 chars if anomaly, else null",
  "adminMessage": "Dashboard alert text if anomaly, else null",
  "confidence": number between 0.0 and 1.0
}

Detection rules:
- off_route: current position >500m from nearest expected waypoint
- unexpected_stop: speed <3 km/h for >5 consecutive pings, not at a waypoint
- speeding: speed >80 km/h
- no_movement: no position change across last 10 pings between 06:00–20:00 EAT

Severity guide:
- low: minor deviation, likely traffic
- medium: significant deviation or prolonged stop
- high: extreme speeding, complete route abandonment, or no movement >15 min
```

### Natural Language Parent Update Prompt

```
You are TotoTrack, a school bus safety service in Kenya.
Generate a warm, reassuring SMS for a parent. Max 160 characters.
Always use the child's name. Be specific about time and location.
No jargon. No coordinates. End with "— TotoTrack".

Child name: {{childName}}
Event type: {{event}}  (boarding | eta_update | arrival | anomaly)
Nearest landmark: {{locationDescription}}
ETA to parent's stop: {{etaMinutes}} minutes
Current time: {{currentTime}}
Bus plate number: {{plateNumber}}

Return the SMS text only. No quotes. No explanation. No markdown.
```

---

## 12. SMS Integration — UjumbeSMS

### Installation

```bash
npm install ujumbe-sms-client
```

### Client Setup (Convex action — `"use node"` required)

```typescript
"use node";
import { UjumbeSmsClient, UjumbeSmsError } from "ujumbe-sms-client";

const smsClient = new UjumbeSmsClient({
  apiKey: process.env.UJUMBESMS_API_KEY!,
  email: process.env.UJUMBESMS_EMAIL!,
});
```

### Single Parent Notification

```typescript
await smsClient.sendSingleMessage(
  child.parentPhone, // "254712345678"
  aiGeneratedMessage, // under 160 chars, AI-generated
  "TOTOTRACK", // registered sender ID
);
```

### Batch Anomaly Alert (all parents on bus — one API call)

```typescript
const allNumbers = children.map((c) => c.parentPhone).join(",");
await smsClient.sendSingleMessage(allNumbers, anomalyMessage, "TOTOTRACK");
```

### Error Handling

```typescript
try {
  const response = await smsClient.sendSingleMessage(
    phone,
    message,
    "TOTOTRACK",
  );
  // response.status.type === "success"
  // response.meta?.available_credits — monitor credit balance
} catch (error) {
  if (error instanceof UjumbeSmsError) {
    console.error("SMS failed:", {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    });
  }
}
```

---

## 13. Map Integration — MapLibre + OpenFreeMap

### Why OpenFreeMap over Mapbox

| Factor           | Mapbox                      | OpenFreeMap           |
| ---------------- | --------------------------- | --------------------- |
| Cost             | Paid after free tier limits | 100% free forever     |
| API key          | Required                    | Not required          |
| Data source      | Proprietary                 | OpenStreetMap         |
| Nairobi coverage | Good                        | Good                  |
| Self-hostable    | No                          | Yes                   |
| License          | Commercial                  | MIT tiles + ODbL data |

### Installation

```bash
npm install maplibre-gl
```

### Tile Style Options

```typescript
// Light — good for daytime admin dashboard
const LIBERTY = "https://tiles.openfreemap.org/styles/liberty";

// Dark — better contrast for monitoring, night use
const DARK = "/styles/dark.json"; // host in /public/styles/dark.json
// Source: https://github.com/w3cj/openfreemap-examples (MIT)

// Bright — high contrast, good for mobile driver view
const BRIGHT = "https://tiles.openfreemap.org/styles/bright";
```

### Nairobi Route Coordinates (Demo Simulator)

```typescript
// lib/nairobi.ts
export const NAIROBI_CENTER: [number, number] = [36.8219, -1.2921];
export const NAIROBI_ZOOM = 12;

// Simulated Westlands → Karen route for demo
export const DEMO_ROUTE_STOPS = [
  { label: "Westlands", lng: 36.8104, lat: -1.2636 },
  { label: "Sarit Centre", lng: 36.8067, lat: -1.2587 },
  { label: "ABC Place Junction", lng: 36.798, lat: -1.2631 },
  { label: "Ngong Road Junction", lng: 36.7927, lat: -1.2897 },
  { label: "Karen", lng: 36.7117, lat: -1.3191 },
];
```

### Route Polyline Overlay

```typescript
map.addSource("expected-route", {
  type: "geojson",
  data: {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: waypoints.map((w) => [w.lng, w.lat]),
    },
    properties: {},
  },
});

map.addLayer({
  id: "route-line",
  type: "line",
  source: "expected-route",
  layout: { "line-join": "round", "line-cap": "round" },
  paint: {
    "line-color": "#3b82f6",
    "line-width": 3,
    "line-dasharray": [2, 1],
    "line-opacity": 0.7,
  },
});
```

---

## 14. Environment Variables

```env
# Convex
CONVEX_DEPLOYMENT=your_deployment_name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Better Auth
BETTER_AUTH_SECRET=your_32_char_random_secret_here
BETTER_AUTH_URL=https://tototrack.app
NEXT_PUBLIC_APP_URL=https://tototrack.app

# Google OAuth (for school admin + operator sign-in)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-...

# UjumbeSMS
UJUMBESMS_API_KEY=ZDIzxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
UJUMBESMS_EMAIL=your@email.com

# No Mapbox token — OpenFreeMap is completely free

# IntaSend (Phase 1 optional, Phase 2 required for billing)
INTASEND_PUBLIC_KEY=ISPubKey_...
INTASEND_SECRET_KEY=ISSecretKey_...
```

---

## 15. Project Structure

```
tototrack/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                       # Fleet overview (school_admin, operator)
│   ├── sign-in/page.tsx               # Better Auth sign-in
│   ├── sign-up/page.tsx               # Parent self-registration
│   ├── buses/
│   │   └── [busId]/page.tsx           # Per-bus detail view
│   ├── driver/
│   │   └── [busId]/page.tsx           # Driver boarding (mobile, role: driver)
│   ├── parent/page.tsx                # Parent view (role: parent)
│   ├── alerts/page.tsx                # Alert feed
│   └── setup/page.tsx                 # Seed data setup
│
├── components/
│   ├── map/
│   │   ├── FleetMap.tsx               # MapLibre GL + OpenFreeMap wrapper
│   │   ├── BusMarker.tsx              # Animated status-colored marker
│   │   └── RouteOverlay.tsx           # Expected route polyline layer
│   ├── dashboard/
│   │   ├── FleetOverview.tsx          # Stats cards + bus list
│   │   ├── AlertFeed.tsx              # Real-time alert list
│   │   └── BusDetailPanel.tsx         # Side panel on marker click
│   ├── driver/
│   │   └── BoardingList.tsx           # Child boarding confirmation cards
│   ├── auth/
│   │   ├── SignInForm.tsx             # Better Auth form
│   │   └── GoogleSignInButton.tsx     # OAuth button
│   └── ui/                            # shadcn/ui components
│
├── convex/
│   ├── convex.config.ts               # Better Auth component registration
│   ├── schema.ts                      # Full schema (8 tables)
│   ├── auth.ts                        # Better Auth Convex bridge + requireRole
│   ├── buses.ts                       # Bus mutations + queries
│   ├── children.ts                    # Children mutations + queries
│   ├── tracking.ts                    # updateLocation mutation + history query
│   ├── alerts.ts                      # Alert mutations + queries
│   ├── anomaly.ts                     # AI anomaly detection action
│   ├── notifications.ts               # UjumbeSMS sendParentSMS action
│   ├── smsLog.ts                      # SMS log mutation + query
│   ├── simulator.ts                   # Demo bus route simulator
│   └── _generated/                    # Auto-generated Convex types
│
├── lib/
│   ├── auth.ts                        # Better Auth server config
│   ├── auth-client.ts                 # Better Auth React hooks
│   ├── nairobi.ts                     # Nairobi coordinates + demo stops
│   └── utils.ts                       # Shared utilities
│
├── public/
│   └── styles/
│       └── dark.json                  # OpenFreeMap dark tile style (MIT)
│
├── middleware.ts                       # Better Auth role-based route guards
├── .env.local
├── next.config.ts
├── package.json
└── README.md
```

---

## 16. Demo Script

> **Total time: 4 minutes**

| Time | Action                    | What judges see                                                          |
| ---- | ------------------------- | ------------------------------------------------------------------------ |
| 0:00 | Open admin dashboard      | 2 buses live on dark Nairobi MapLibre map, moving in real time           |
| 0:20 | Mention map               | "OpenStreetMap data, OpenFreeMap tiles — completely free, no API key"    |
| 0:35 | Click Bus KCA 123Y        | Side panel: children manifest, driver, current speed                     |
| 1:00 | Open driver view on phone | Mobile boarding list — loads fast, minimal data                          |
| 1:15 | Tap "Amani boarded"       | Dashboard boarding status updates live — Convex WebSocket                |
| 1:35 | Show parent SMS           | AI-written: "Amani boarded KCA 123Y at 07:14..."                         |
| 2:00 | Hit "Trigger Anomaly"     | Bus deviates off Ngong Road in simulator                                 |
| 2:20 | Alert on dashboard        | Red badge, AI description, severity: high — real time                    |
| 2:40 | Show anomaly SMS          | "⚠️ Amani's bus stopped on Kikuyu Rd 6 mins. School notified."           |
| 3:00 | Show sign-in page         | "Admins sign in with Google. Drivers with email. Parents self-register." |
| 3:15 | Phase 2                   | "Camera at bus door. Face confirmation. Zero driver input needed."       |
| 3:30 | Business model            | "KES 3,000–8,000/bus/month. 50 buses = KES 400K MRR. Starting Nairobi."  |
| 3:45 | Q&A                       | —                                                                        |

---

## 17. Judging Criteria Alignment

| Criterion               | TotoTrack's answer                                                                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Innovation**          | AI anomaly detection + NL SMS from raw GPS — no product does this in Kenya today. OpenFreeMap removes the last cost barrier for African map startups. |
| **Technical Execution** | Convex WebSocket real-time + Claude vision + MapLibre GL + Better Auth roles — all live, not mocked                                                   |
| **Impact**              | Every Kenyan school parent with a child on a bus feels this problem personally                                                                        |
| **Presentation**        | Judges see a bus move on Nairobi streets, an anomaly fire, and an SMS land — all in 4 minutes                                                         |

---

## 18. Why TotoTrack Wins

- **"Toto"** — immediately resonates with every Kenyan in the room. The name earns trust before a word is spoken.
- **Emotional resonance** — every judge who is a parent understands this anxiety viscerally.
- **AI is load-bearing** — anomaly detection and NL SMS generation are impossible without it. Not decorative.
- **Convex WebSocket real-time** — bus location streams live. Not polling. Not mock. Pure Convex subscriptions firing on every mutation.
- **MapLibre + OpenFreeMap** — the demo map shows real Nairobi streets. Judges see roads they drive on every day. And it costs nothing to run, forever.
- **Better Auth** — role-based access from day one. Admin, driver, parent, operator — each sees only what they need. Production-grade auth in the hackathon build.
- **UjumbeSMS** — zero parent app install friction. Works on any Kenyan phone, any network.
- **Clear KES revenue model** — not "we'll figure out monetization." Tiers, numbers, projections.
- **Phase 2 story** — face confirmation at the bus door gives judges something to remember and talk about after the room clears.
- **Built for Africa** — M-Pesa billing, Kenyan SMS gateway, Nairobi traffic patterns in the AI prompt, OpenStreetMap data for Kenyan roads. Not a Western product re-skinned.

---
