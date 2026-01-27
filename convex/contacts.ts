import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List contacts for the current user/org
export const listContacts = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        // Check for Org Context (if we had it strictly passed, but for now relies on user association)
        // Similar to documents, we could filter by Org if needed.
        // For simplicity, we'll list contacts created by this User OR linked to their Org.

        // 1. Get User to find their Org
        const user = await ctx.db
            .query("users")
            .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
            .unique();

        if (!user) return [];

        // If part of an Org, fetch Org contacts? 
        // Or just fetch personal contacts for now to keep it simple as requested ("my saved info")

        return await ctx.db
            .query("contacts")
            .withIndex("byUserId", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .collect();
    },
});

// Create a new contact
export const createContact = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        company: v.optional(v.string()),
        phone: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
            .unique();

        const orgId = user?.orgId;

        return await ctx.db.insert("contacts", {
            name: args.name,
            email: args.email,
            company: args.company,
            phone: args.phone,
            userId: identity.subject,
            orgId: orgId,
            createdAt: Date.now(),
        });
    },
});
