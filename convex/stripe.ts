"use node";

import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { clerk } from "./clerk";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-12-18.acacia" as any,
});

export const handleSubscriptionChange = internalMutation({
    args: {
        stripeCustomerId: v.string(),
        userId: v.optional(v.string()), // From metadata
        status: v.string(),
        plan: v.string(),
        tier: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Find user by Stripe Customer ID or User ID (metadata)
        let user;

        if (args.userId) {
            user = await ctx.db
                .query("users")
                .withIndex("byExternalId", (q) => q.eq("externalId", args.userId!))
                .first();
        }

        // Fallback: search by stripeCustomerId if we stored it
        if (!user) {
            // Find user by scanning (not efficient but okay for now, or add index later)
            // For now, let's rely on metadata provided in webhook
        }

        if (!user) {
            console.error("Webhook Error: User not found for subscription change", args);
            return;
        }

        // 2. Update Internal DB
        await ctx.db.patch(user._id, {
            subscriptionStatus: args.status,
            subscriptionTier: args.tier,
            stripeCustomerId: args.stripeCustomerId,
        });

        // 3. Update Clerk Metadata
        // Case A: Organization (If user belongs to one)
        if (user.orgId) {
            try {
                // Update Local Organization subscription status as well
                const localOrg = await ctx.db
                    .query("organizations")
                    .withIndex("byClerkOrgId", (q) => q.eq("clerkOrgId", user.orgId!))
                    .first();

                if (localOrg) {
                    await ctx.db.patch(localOrg._id, {
                        subscriptionTier: args.tier,
                        subscriptionStatus: args.status
                    });
                }

                await clerk.organizations.updateOrganizationMetadata(user.orgId, {
                    publicMetadata: {
                        subscriptionTier: args.tier,
                        subscriptionStatus: args.status,
                        planUpdatedAt: Date.now(),
                    },
                });
            } catch (err) {
                console.error("Failed to sync Clerk Org metadata (Webhook):", err);
            }
        }
        // Case B: Personal Account (Fallback)
        else {
            try {
                await clerk.users.updateUserMetadata(user.externalId, {
                    publicMetadata: {
                        subscriptionTier: args.tier,
                        subscriptionStatus: args.status,
                        planUpdatedAt: Date.now(),
                    }
                });
            } catch (err) {
                console.error("Failed to sync Clerk User metadata (Webhook):", err);
            }
        }

        // 4. Audit Log
        await ctx.db.insert("auditLogs", {
            action: "subscription.updated_via_webhook",
            entityType: "user",
            entityId: user.externalId,
            userId: user.externalId,
            orgId: user.orgId,
            details: {
                status: args.status,
                plan: args.plan,
                stripeId: args.stripeCustomerId
            },
            timestamp: Date.now(),
        });
    },
});

export const recordPayment = internalMutation({
    args: {
        paymentAttemptData: v.any(), // Using any to match the flexible transformation result
    },
    handler: async (ctx, args) => {
        // We reuse the existing logic or insert directly into paymentAttempts
        // For now, let's insert straightforwardly to keep it simple and robust

        // Note: ensuring validators match is tricky with raw webhook data.
        // We will assume the transformation query passed valid data.

        await ctx.db.insert("paymentAttempts", args.paymentAttemptData);

        // Log to audit
        const payerId = args.paymentAttemptData.payer?.user_id;

        if (payerId) {
            await ctx.db.insert("auditLogs", {
                action: "payment.succeeded_via_webhook",
                entityType: "payment",
                entityId: args.paymentAttemptData.payment_id,
                userId: payerId,
                details: {
                    amount: args.paymentAttemptData.totals.grand_total.amount_formatted,
                    invoice: args.paymentAttemptData.invoice_id
                },
                timestamp: Date.now(),
            });
        }
    }
});
