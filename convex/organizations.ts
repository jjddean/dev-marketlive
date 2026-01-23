import { internalMutation, query, mutation } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { v } from "convex/values";

// Sync organization from Clerk webhook
export const upsertFromClerk = internalMutation({
    args: { data: v.any() },
    async handler(ctx, { data }) {
        const orgAttributes = {
            clerkOrgId: data.id,
            name: data.name,
            slug: data.slug,
            imageUrl: data.image_url,
            createdBy: data.created_by,
            membersCount: data.members_count,
            updatedAt: Date.now(),
        };

        const existingOrg = await orgByClerkId(ctx, data.id);
        if (existingOrg === null) {
            await ctx.db.insert("organizations", {
                ...orgAttributes,
                createdAt: Date.now(),
            });
        } else {
            await ctx.db.patch(existingOrg._id, orgAttributes);
        }
    },
});

// Delete organization from Clerk webhook
export const deleteFromClerk = internalMutation({
    args: { clerkOrgId: v.string() },
    async handler(ctx, { clerkOrgId }) {
        const org = await orgByClerkId(ctx, clerkOrgId);

        if (org !== null) {
            await ctx.db.delete(org._id);
        } else {
            console.warn(
                `Can't delete org, there is none for Clerk org ID: ${clerkOrgId}`,
            );
        }
    },
});

// Update user's org membership when they join/leave an org
export const updateUserOrgMembership = internalMutation({
    args: {
        clerkUserId: v.string(),
        clerkOrgId: v.optional(v.string()),
        role: v.optional(v.string()),
    },
    async handler(ctx, { clerkUserId, clerkOrgId, role }) {
        const user = await ctx.db
            .query("users")
            .withIndex("byExternalId", (q) => q.eq("externalId", clerkUserId))
            .unique();

        if (user) {
            await ctx.db.patch(user._id, {
                orgId: clerkOrgId,
                role: role || user.role,
            });
        }
    },
});

// Query: Get organization by Clerk ID
export const getByClerkId = query({
    args: { clerkOrgId: v.string() },
    handler: async (ctx, { clerkOrgId }) => {
        return await orgByClerkId(ctx, clerkOrgId);
    },
});

// Query: List all organizations (admin only)
export const listOrganizations = query({
    args: {},
    handler: async (ctx) => {
        // TODO: Add admin check
        return await ctx.db.query("organizations").collect();
    },
});

// Admin: Suspend Organization
export const suspendOrganization = mutation({
    args: { orgId: v.id("organizations"), reason: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        // Verify Admin Role (or rely on UI protection + audit trail for MVP)
        // const user = ... check role ...

        await ctx.db.patch(args.orgId, {
            status: "suspended",
            updatedAt: Date.now()
        });

        await ctx.db.insert("auditLogs", {
            action: "organization.suspended",
            entityType: "organization",
            entityId: args.orgId,
            userId: identity.subject,
            details: { reason: args.reason },
            timestamp: Date.now()
        });
    }
});

// Admin: Activate Organization
export const activateOrganization = mutation({
    args: { orgId: v.id("organizations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        await ctx.db.patch(args.orgId, {
            status: "active",
            updatedAt: Date.now()
        });

        await ctx.db.insert("auditLogs", {
            action: "organization.activated",
            entityType: "organization",
            entityId: args.orgId,
            userId: identity.subject,
            timestamp: Date.now()
        });
    }
});

// Helper function
async function orgByClerkId(ctx: QueryCtx, clerkOrgId: string) {
    return await ctx.db
        .query("organizations")
        .withIndex("byClerkOrgId", (q) => q.eq("clerkOrgId", clerkOrgId))
        .unique();
}
