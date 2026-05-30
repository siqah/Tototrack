import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  schools: defineTable({
    name: v.string(),
    subscriptionTier: v.string(),
    subscriptionStatus: v.string(),
    mpesaPhone: v.string(),
    adminUserId: v.string(),
    adminEmail: v.string(),
    adminPhone: v.string(),
    createdAt: v.number(),
  }),

  buses: defineTable({
    schoolId: v.id("schools"),
    busId: v.string(),
    plateNumber: v.string(),
    driverName: v.string(),
    driverPhone: v.string(),
    driverUserId: v.optional(v.string()),
    currentLat: v.number(),
    currentLng: v.number(),
    speed: v.number(),
    heading: v.optional(v.number()),
    status: v.string(),
    lastUpdated: v.number(),
    routePointIndex: v.optional(v.number()),
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
    parentUserId: v.optional(v.string()),
    stopLabel: v.string(),
    stopOrder: v.number(),
    boardedAt: v.optional(v.number()),
    status: v.string(),
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
    type: v.string(),
    severity: v.string(),
    message: v.string(),
    parentMessage: v.string(),
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
    confirmedBy: v.string(),
    method: v.string(),
    photoStorageId: v.optional(v.string()),
  }).index("by_bus", ["busId"]),

  simulatorState: defineTable({
    running: v.boolean(),
  }),

  smsLog: defineTable({
    to: v.string(),
    message: v.string(),
    type: v.string(),
    status: v.string(),
    sentAt: v.number(),
    childId: v.optional(v.id("children")),
    alertId: v.optional(v.id("alerts")),
  }),

  // Stores roles separately since @convex-dev/better-auth doesn't support
  // additionalFields on the user model in v0.12
  userRoles: defineTable({
    userId: v.string(), // better-auth user.id
    role: v.string(),  // "school_admin" | "driver" | "parent" | "operator"
    schoolId: v.optional(v.string()),
    busId: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});
