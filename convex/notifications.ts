"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { UjumbeSmsClient, UjumbeSmsError } from "ujumbe-sms-client";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

function buildSmsClient() {
  return new UjumbeSmsClient({
    apiKey: process.env.UJUMBESMS_API_KEY!,
    email: process.env.UJUMBESMS_EMAIL!,
  });
}

export const sendParentSMS = action({
  args: {
    childName: v.string(),
    parentPhone: v.string(),
    childId: v.id("children"),
    event: v.string(),
    locationDescription: v.string(),
    etaMinutes: v.number(),
    plateNumber: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const prompt = `You are TotoTrack, a school bus safety service in Kenya.
Generate a warm, reassuring SMS for a parent. Max 160 characters.
Always use the child's name. Be specific about time and location.
No jargon. No coordinates. End with "— TotoTrack".

Child name: ${args.childName}
Event type: ${args.event}
Nearest landmark: ${args.locationDescription}
ETA to parent's stop: ${args.etaMinutes} minutes
Current time: ${new Date().toLocaleTimeString("en-KE", { timeZone: "Africa/Nairobi" })}
Bus plate number: ${args.plateNumber}

Return the SMS text only. No quotes. No explanation. No markdown.`;

    let message: string;
    try {
      const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt,
      });
      message = text.trim().slice(0, 160);
    } catch {
      message = `${args.childName} boarded ${args.plateNumber}. ~${args.etaMinutes} mins to your stop. — TotoTrack`;
    }

    const logId = await ctx.runMutation(api.smsLog.log, {
      to: args.parentPhone,
      message,
      type: args.type,
      childId: args.childId,
    });

    try {
      const sms = buildSmsClient();
      await sms.sendSingleMessage(args.parentPhone, message, "TOTOTRACK");
      await ctx.runMutation(api.smsLog.updateStatus, {
        logId,
        status: "success",
      });
    } catch (error) {
      await ctx.runMutation(api.smsLog.updateStatus, {
        logId,
        status: "error",
      });
      if (error instanceof UjumbeSmsError) {
        console.error("SMS failed:", {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
        });
      }
    }

    return message;
  },
});

export const notifyAllParentsOnBus = action({
  args: {
    busId: v.string(),
    message: v.string(),
    alertId: v.id("alerts"),
    type: v.string(),
  },
  handler: async (ctx, { busId, message, alertId, type }) => {
    const children = await ctx.runQuery(api.children.getByBus, { busId });
    if (!children.length) return;

    const phones = children
      .map((c: { parentPhone: string }) => c.parentPhone)
      .join(",");

    await Promise.all(
      children.map((c: { parentPhone: string }) =>
        ctx.runMutation(api.smsLog.log, {
          to: c.parentPhone,
          message,
          type,
          alertId,
        }),
      ),
    );

    try {
      const sms = buildSmsClient();
      await sms.sendSingleMessage(phones, message, "TOTOTRACK");
      await ctx.runMutation(api.alerts.markParentsNotified, { alertId });
    } catch (error) {
      if (error instanceof UjumbeSmsError) {
        console.error("Batch SMS failed:", error.message);
      }
    }
  },
});
