import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { createNotificationHelper } from "./notifications";

export const upsertShipment = mutation({
  args: {
    shipmentId: v.string(),
    tracking: v.object({
      status: v.string(),
      currentLocation: v.object({
        city: v.string(),
        state: v.string(),
        country: v.string(),
        coordinates: v.object({ lat: v.number(), lng: v.number() }),
      }),
      estimatedDelivery: v.string(),
      carrier: v.string(),
      trackingNumber: v.string(),
      service: v.string(),
      shipmentDetails: v.object({
        weight: v.string(),
        dimensions: v.string(),
        origin: v.string(),
        destination: v.string(),
        value: v.string(),
      }),
      events: v.array(
        v.object({
          timestamp: v.string(),
          status: v.string(),
          location: v.string(),
          description: v.string(),
        })
      ),
    }),
  },
  handler: async (ctx, { shipmentId, tracking }) => {
    // resolve current user (if any) to link shipment to userId
    const identity = await ctx.auth.getUserIdentity();
    let currentUserId: string | null = null;
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
        .unique();
      if (user) currentUserId = user._id;
    }

    const existing = await ctx.db
      .query("shipments")
      .withIndex("byShipmentId", (q) => q.eq("shipmentId", shipmentId))
      .unique();

    let shipmentDocId = existing?._id;

    if (existing) {
      const oldStatus = existing.status;
      await ctx.db.patch(existing._id, {
        status: tracking.status,
        currentLocation: tracking.currentLocation,
        estimatedDelivery: tracking.estimatedDelivery,
        carrier: tracking.carrier,
        trackingNumber: tracking.trackingNumber,
        service: tracking.service,
        shipmentDetails: tracking.shipmentDetails,
        lastUpdated: Date.now(),
        ...(existing.userId ? {} : currentUserId ? { userId: currentUserId as any } : {}),
      });

      // Trigger automated workflow if status changed
      if (oldStatus !== tracking.status) {
        await ctx.scheduler.runAfter(0, internal.workflows.onShipmentStatusChange, {
          shipmentId,
          oldStatus,
          newStatus: tracking.status,
        });
      }

      // Notify User of Status Change
      if (oldStatus !== tracking.status && existing.userId) {
        const userDoc = await ctx.db.get(existing.userId);
        if (userDoc) {
          await createNotificationHelper(ctx, userDoc.externalId, {
            title: 'Shipment Update',
            message: `Shipment ${shipmentId} is now ${tracking.status}.`,
            type: 'shipment',
            priority: 'medium',
            actionUrl: '/shipments'
          });
        }
      }
    } else {
      shipmentDocId = await ctx.db.insert("shipments", {
        shipmentId,
        status: tracking.status,
        currentLocation: tracking.currentLocation,
        estimatedDelivery: tracking.estimatedDelivery,
        carrier: tracking.carrier,
        trackingNumber: tracking.trackingNumber,
        service: tracking.service,
        shipmentDetails: tracking.shipmentDetails,
        lastUpdated: Date.now(),
        createdAt: Date.now(),
        userId: currentUserId as any,
        orgId: (identity as any).org_id,
      } as any);

      // Notify User of Creation
      if (identity && identity.subject) {
        await createNotificationHelper(ctx, identity.subject, {
          title: 'Shipment Created',
          message: `New shipment ${shipmentId} created successfully.`,
          type: 'shipment',
          priority: 'medium',
          actionUrl: '/shipments'
        });
      }
    }

    // Replace events by appending new ones
    if (shipmentDocId) {
      // no bulk delete in Convex; events table is additive; we just insert new ones
      for (const e of tracking.events) {
        await ctx.db.insert("trackingEvents", {
          shipmentId: shipmentDocId,
          timestamp: e.timestamp,
          status: e.status,
          location: e.location,
          description: e.description,
          createdAt: Date.now(),
        });
      }
    }

    return shipmentDocId!;
  },
});

export const getShipment = query({
  args: { shipmentId: v.string() },
  handler: async (ctx, { shipmentId }) => {
    const shipment = await ctx.db
      .query("shipments")
      .withIndex("byShipmentId", (q) => q.eq("shipmentId", shipmentId))
      .unique();
    if (!shipment) return null;
    const events = await ctx.db
      .query("trackingEvents")
      .withIndex("byShipmentId", (q) => q.eq("shipmentId", shipment._id))
      .collect();
    return { shipment, events };
  },
});

// New: list shipments for dashboard
export const listShipments = query({
  args: { search: v.optional(v.string()), onlyMine: v.optional(v.boolean()) },
  handler: async (ctx, { search, onlyMine }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get current user's org from JWT
    const orgId = (identity as any).org_id;

    let list = [] as any[];
    if (onlyMine) {
      const user = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
        .unique();
      if (!user) return [];
      list = await ctx.db
        .query("shipments")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .collect();
    } else if (orgId) {
      // Filter by organization
      list = await ctx.db
        .query("shipments")
        .withIndex("byOrgId", (q) => q.eq("orgId", orgId))
        .collect();
    } else {
      // Personal account - filter by userId
      const user = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
        .unique();
      if (!user) return [];
      list = await ctx.db
        .query("shipments")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .collect();
    }

    if (!search || search.trim() === "") return list;
    const s = search.toLowerCase();
    return list.filter((sh) => {
      const fields = [
        sh.shipmentId,
        sh.status,
        sh.carrier,
        sh.service,
        sh.trackingNumber,
        sh.shipmentDetails.origin,
        sh.shipmentDetails.destination,
      ]
        .filter(Boolean)
        .map((x) => String(x).toLowerCase());
      return fields.some((f) => f.includes(s));
    });
  },
});

export const clearAllShipments = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Get all shipments
    const allShipments = await ctx.db.query("shipments").collect();

    // 2. Delete each shipment
    for (const shipment of allShipments) {
      await ctx.db.delete(shipment._id);
    }

    // 3. Clear events as well
    const allEvents = await ctx.db.query("trackingEvents").collect();
    for (const event of allEvents) {
      await ctx.db.delete(event._id);
    }

    return { success: true, count: allShipments.length };
  },
});

// Admin: Flag a shipment as High Risk
export const flagShipment = mutation({
  args: {
    shipmentId: v.id("shipments"), // This expects the internal ID usually, let's accept string ID or internal ID. 
    // Wait, UI usually has the internal ID `_id`. Let's assume we pass the internal ID for efficiency.
    // If the UI passes the string `shipmentId` field, we'd need to lookup.
    // Standardizing on passing the internal `_id` is better for mutations.
    // But typical existing code uses `shipmentId` (string) for lookups. 
    // Let's support looking up by `shipmentId` string to match `upsertShipment`.
    shipmentIdString: v.string(),
    riskLevel: v.string(), // "medium", "high"
    reason: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const shipment = await ctx.db
      .query("shipments")
      .withIndex("byShipmentId", (q) => q.eq("shipmentId", args.shipmentIdString))
      .unique();

    if (!shipment) throw new Error("Shipment not found");

    await ctx.db.patch(shipment._id, {
      riskLevel: args.riskLevel,
      flagReason: args.reason,
      flaggedBy: identity.subject,
      lastUpdated: Date.now()
    });

    // Audit Log
    await ctx.db.insert("auditLogs", {
      action: "shipment.flagged",
      entityType: "shipment",
      entityId: args.shipmentIdString,
      userId: identity.subject,
      details: { risk: args.riskLevel, reason: args.reason },
      timestamp: Date.now()
    });
  }
});

// Admin: Clear Risk Flag
export const clearShipmentFlag = mutation({
  args: { shipmentIdString: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const shipment = await ctx.db
      .query("shipments")
      .withIndex("byShipmentId", (q) => q.eq("shipmentId", args.shipmentIdString))
      .unique();

    if (!shipment) throw new Error("Shipment not found");

    await ctx.db.patch(shipment._id, {
      riskLevel: "low", // Reset to low/safe
      flagReason: undefined,
      flaggedBy: undefined,
      lastUpdated: Date.now()
    });

    // Audit Log
    await ctx.db.insert("auditLogs", {
      action: "shipment.unflagged",
      entityType: "shipment",
      entityId: args.shipmentIdString,
      userId: identity.subject,
      timestamp: Date.now()
    });
  }
});