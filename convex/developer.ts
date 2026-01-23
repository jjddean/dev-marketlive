import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate a new API key for the authenticated user.
 */
export const generateApiKey = mutation({
    args: {
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const userId = identity.tokenIdentifier; // Using Clerk Token Identifier

        // Generate a simple key - in production, use a more robust generator or library
        // Format: mk_live_<random_string>
        const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const key = `cs_live_${randomPart}`;

        const keyId = await ctx.db.insert("apiKeys", {
            key,
            userId,
            name: args.name || "Default Key",
            createdAt: Date.now(),
            status: "active",
            // Expires in 1 year
            expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
        });

        // Return the key explicitly so the frontend can display it ONCE
        return { keyId, key };
    },
});

/**
 * List all active API keys for the user.
 * Note: We do NOT return the full key string for security, only metadata and maybe a masked version.
 * However, since we don't have a separate "hashed" column yet, we return the key but frontend should mask it.
 * Ideally, we should store a hash and only return the full key on creation.
 * For this MVP, we return the key but advise user to treat it secretly.
 */
export const listApiKeys = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.tokenIdentifier;

        const keys = await ctx.db
            .query("apiKeys")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();

        return keys.map((k) => ({
            _id: k._id,
            name: k.name,
            createdAt: k.createdAt,
            lastUsedAt: k.lastUsedAt,
            // Mask the key for display list: mk_live_...abcd
            maskedKey: `${k.key.substring(0, 8)}...${k.key.substring(k.key.length - 4)}`,
        }));
    },
});

/**
 * Revoke an API key.
 */
export const revokeApiKey = mutation({
    args: {
        id: v.id("apiKeys"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const userId = identity.tokenIdentifier;

        const existing = await ctx.db.get(args.id);
        if (!existing || existing.userId !== userId) {
            throw new Error("Key not found or unauthorized");
        }

        await ctx.db.patch(args.id, {
            status: "revoked",
        });

        return true;
    },
});

/**
 * PUBLIC API: Get Shipments
 * Call this using: client.query(api.developer.getShipmentsApi, { apiKey: "..." })
 * In a real HTTP endpoint, the apiKey would be extracted from the Authorization header.
 */
export const getShipmentsApi = query({
    args: {
        apiKey: v.string(),
        status: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // 1. Validate API Key
        const keyRecord = await ctx.db
            .query("apiKeys")
            .withIndex("by_key", (q) => q.eq("key", args.apiKey))
            .first();

        if (!keyRecord || keyRecord.status !== "active") {
            throw new Error("Invalid or inactive API key");
        }

        // Check expiration
        if (keyRecord.expiresAt && keyRecord.expiresAt < Date.now()) {
            throw new Error("API key expired");
        }

        // Update usage stats (async side effect not possible in query? 
        // Actually, queries cannot mutate. So we can't update lastUsedAt here.
        // In a real implementation, this would be a mutation or HTTP action that wraps a consistent read.)
        // For now, we just proceed with the read.

        // 2. Fetch Data for the Key's Owner
        const userId = keyRecord.userId;

        // We need to map the Clerk Token Identifier (stored in apiKey) to the User ID used in shipments table?
        // Let's check how shipments are stored. They use `v.id("users")` (Convex ID) or string?
        // Schema says: userId: v.optional(v.id("users"))

        // We need to find the Convex User ID corresponding to this Clerk Token ID
        const user = await ctx.db
            .query("users")
            .withIndex("byExternalId", (q) => q.eq("externalId", userId)) // externalId is usually the tokenIdentifier or sub
            .first();

        if (!user) {
            // Fallback: If userId in apiKeys IS the Convex ID (unlikely if we used identity.tokenIdentifier)
            // Let's assume schema.ts usage of `tokenIdentifier` matches `externalId` in `users` table.
            return { error: "User context not found for this key" };
        }

        let query = ctx.db
            .query("shipments")
            .withIndex("byUserId", (q) => q.eq("userId", user._id));

        if (args.status) {
            query = query.filter((q) => q.eq(q.field("status"), args.status));
        }

        const shipments = await query.take(args.limit || 10);

        return {
            success: true,
            count: shipments.length,
            data: shipments,
        };
    },
});
