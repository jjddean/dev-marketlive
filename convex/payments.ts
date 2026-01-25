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
        const user = await ctx.runMutation(internal.payments.finalizeSubscription, {});

        // 2. Update Clerk Metadata
        if (user?.orgId) {
            try {
                await clerk.organizations.updateOrganizationMetadata(user.orgId, {
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
                await clerk.users.updateUserMetadata(identity.subject, {
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

// Internal mutation to update local DB
export const finalizeSubscription = internalMutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
            .first();

        if (user) {
            await ctx.db.patch(user._id, {
                subscriptionTier: 'pro',
                subscriptionStatus: 'active'
            });

            // AUDIT LOG: Payment Success
            await ctx.db.insert("auditLogs", {
                action: "payment.completed",
                entityType: "payment",
                entityId: "PAY-" + Date.now(),
                userId: identity.subject,
                userEmail: user.email,
                orgId: user.orgId,
                details: {
                    amount: "2450.00", // Mock amount for now
                    currency: "USD",
                    status: "succeeded",
                    method: "stripe"
                },
                timestamp: Date.now(),
            });

            return user; // Return user for action to use (e.g.orgId)
        }
        return null;
    }
});

// Admin: List all invoices
export const listAllInvoices = query({
    args: {},
    handler: async (ctx) => {
        // In prod: check admin role
        return await ctx.db
            .query("invoices")
            .order("desc")
            .collect();
    }
});

// Admin: List all payment attempts (Transactions)
export const listAllPayments = query({
    args: {},
    handler: async (ctx) => {
        // In prod: check admin role
        return await ctx.db
            .query("paymentAttempts")
            .order("desc")
            .collect();
    }
});
