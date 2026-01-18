import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Action types for consistency
export const AUDIT_ACTIONS = {
    // Booking actions
    BOOKING_CREATED: "booking.created",
    BOOKING_APPROVED: "booking.approved",
    BOOKING_REJECTED: "booking.rejected",
    BOOKING_UPDATED: "booking.updated",
    BOOKING_CANCELLED: "booking.cancelled",

    // Document actions
    DOCUMENT_CREATED: "document.created",
    DOCUMENT_SIGNED: "document.signed",
    DOCUMENT_SENT: "document.sent",
    DOCUMENT_VIEWED: "document.viewed",
    DOCUMENT_SHARED: "document.shared",

    // Shipment actions
    SHIPMENT_CREATED: "shipment.created",
    SHIPMENT_UPDATED: "shipment.updated",
    SHIPMENT_STATUS_CHANGED: "shipment.status_changed",

    // User actions
    USER_LOGIN: "user.login",
    USER_ROLE_CHANGED: "user.role_changed",
    USER_ORG_JOINED: "user.org_joined",
    USER_ORG_LEFT: "user.org_left",

    // Payment actions
    PAYMENT_INITIATED: "payment.initiated",
    PAYMENT_COMPLETED: "payment.completed",
    PAYMENT_FAILED: "payment.failed",
} as const;

// Internal mutation to log audit events (called from other mutations)
export const logEvent = internalMutation({
    args: {
        action: v.string(),
        entityType: v.string(),
        entityId: v.optional(v.string()),
        userId: v.optional(v.string()),
        userEmail: v.optional(v.string()),
        orgId: v.optional(v.string()),
        details: v.optional(v.any()),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("auditLogs", {
            ...args,
            timestamp: Date.now(),
        });
    },
});

// Public mutation for logging (uses auth context)
export const log = mutation({
    args: {
        action: v.string(),
        entityType: v.string(),
        entityId: v.optional(v.string()),
        details: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        return await ctx.db.insert("auditLogs", {
            action: args.action,
            entityType: args.entityType,
            entityId: args.entityId,
            details: args.details,
            userId: identity?.subject,
            userEmail: identity?.email,
            orgId: (identity as any)?.org_id,
            timestamp: Date.now(),
        });
    },
});

// Query: List audit logs (admin only)
export const listLogs = query({
    args: {
        entityType: v.optional(v.string()),
        action: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { entityType, action, limit }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        // Get current user to check role
        const currentUser = await ctx.db
            .query("users")
            .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
            .unique();

        // Only admins can view audit logs
        if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "platform:superadmin")) {
            return [];
        }

        // Query logs based on filters
        let logs;
        if (entityType) {
            logs = await ctx.db
                .query("auditLogs")
                .withIndex("byEntityType", (q) => q.eq("entityType", entityType))
                .order("desc")
                .take(limit || 100);
        } else if (action) {
            logs = await ctx.db
                .query("auditLogs")
                .withIndex("byAction", (q) => q.eq("action", action))
                .order("desc")
                .take(limit || 100);
        } else {
            logs = await ctx.db
                .query("auditLogs")
                .order("desc")
                .take(limit || 100);
        }

        return logs;
    },
});

// Query: Get logs for a specific entity
export const getEntityLogs = query({
    args: {
        entityType: v.string(),
        entityId: v.string(),
    },
    handler: async (ctx, { entityType, entityId }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        // Get all logs for this entity
        const allLogs = await ctx.db
            .query("auditLogs")
            .withIndex("byEntityType", (q) => q.eq("entityType", entityType))
            .order("desc")
            .collect();

        // Filter by entityId (not indexed, so post-filter)
        return allLogs.filter((log) => log.entityId === entityId);
    },
});
