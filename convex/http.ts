import { httpRouter } from "convex/server";
import { betterAuthClient, createAuth } from "./auth";

const http = httpRouter();

betterAuthClient.registerRoutesLazy(http, createAuth, {
  cors: true,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "",
  ],
});

export default http;
