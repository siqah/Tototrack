"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

interface AnomalyResult {
  isAnomaly: boolean;
  anomalyType: "off_route" | "unexpected_stop" | "speeding" | "no_movement" | "none";
  severity: "low" | "medium" | "high";
  parentMessage: string | null;
  adminMessage: string | null;
  confidence: number;
}

export const detectAnomaly = action({
  args: {
    busId: v.string(),
    schoolId: v.id("schools"),
    lat: v.number(),
    lng: v.number(),
    speed: v.number(),
    history: v.array(
      v.object({
        lat: v.number(),
        lng: v.number(),
        speed: v.number(),
        timestamp: v.number(),
      }),
    ),
    waypoints: v.array(
      v.object({
        lat: v.number(),
        lng: v.number(),
        label: v.string(),
        order: v.number(),
        expectedArrivalTime: v.string(),
      }),
    ),
  },
  handler: async (ctx, args): Promise<AnomalyResult | null> => {
    const now = new Date().toLocaleTimeString("en-KE", {
      timeZone: "Africa/Nairobi",
    });
    const day = new Date().toLocaleDateString("en-KE", {
      timeZone: "Africa/Nairobi",
      weekday: "long",
    });

    const prompt = `You are TotoTrack's safety monitor watching school buses in Nairobi, Kenya.

Expected route waypoints: ${JSON.stringify(args.waypoints)}
Recent GPS pings (newest last): ${JSON.stringify(args.history)}
Current position: lat ${args.lat}, lng ${args.lng}
Current speed: ${args.speed} km/h
Current time: ${now}
Day of week: ${day}

Detection rules:
- off_route: current position >500m from nearest expected waypoint
- unexpected_stop: speed <3 km/h for >5 consecutive pings, not at a waypoint
- speeding: speed >80 km/h
- no_movement: no position change across last 10 pings between 06:00-20:00 EAT

Return ONLY this JSON, no explanation:
{"isAnomaly":boolean,"anomalyType":"off_route"|"unexpected_stop"|"speeding"|"no_movement"|"none","severity":"low"|"medium"|"high","parentMessage":"SMS under 160 chars or null","adminMessage":"dashboard text or null","confidence":0.0-1.0}`;

    try {
      const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt,
      });

      const result: AnomalyResult = JSON.parse(
        text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, ""),
      );

      if (result.isAnomaly && result.anomalyType !== "none") {
        const alertId = await ctx.runMutation(api.alerts.create, {
          busId: args.busId,
          schoolId: args.schoolId,
          type: result.anomalyType,
          severity: result.severity,
          message: result.adminMessage ?? "Anomaly detected",
          parentMessage:
            result.parentMessage ?? "Issue detected on your child's bus. — TotoTrack",
          lat: args.lat,
          lng: args.lng,
        });

        await ctx.runMutation(api.buses.updateStatus, {
          busId: args.busId,
          status: "flagged",
        });

        await ctx.runAction(api.notifications.notifyAllParentsOnBus, {
          busId: args.busId,
          message:
            result.parentMessage ?? "Issue detected on your child's bus. — TotoTrack",
          alertId,
          type: "anomaly",
        });
      }

      return result;
    } catch {
      return null;
    }
  },
});
