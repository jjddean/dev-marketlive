"use node";
import { v } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { clerk } from "./clerk";

// Public mutation for demo purposes (in prod, use webhooks!)
// Public action to complete subscription and sync to Clerk
export const completeSubscription = action({
    args: { userId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        // 1. Update Internal DB via Internal Mutation
        const user = await ctx.runMutation(internal.paymentsData.finalizeSubscription, {});

        // 2. Update Clerk Metadata
        if (user?.orgId) {
            try {
                await clerk.organizations.updateOrganization(user.orgId, {
                    publicMetadata: {
                        subscriptionTier: 'pro',
                        subscriptionStatus: 'active',
                        planUpdatedAt: Date.now(),
                    }
                });
            } catch (err) {
                console.error("Failed to sync Clerk Organization metadata:", err);
            }
        } else {
            // No Org ID found - Update User Personal Metadata
            try {
                await clerk.users.updateUser(identity.subject, {
                    publicMetadata: {
                        subscriptionTier: 'pro',
                        subscriptionStatus: 'active',
                        planUpdatedAt: Date.now(),
                    }
                });
            } catch (err) {
                console.error("Failed to sync Clerk User metadata:", err);
            }
        }
    }
});
