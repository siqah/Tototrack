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
      },
      schoolId: { type: "string", required: false },
      busId: { type: "string", required: false },
    },
  },
});
