import { internalMutation, mutation, query } from "./_generated/server";

// Internal mutation to update local DB
export const finalizeSubscription = internalMutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
            .unique();

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

import { v } from "convex/values";

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
        // (Skipped efficient search for now)

        if (!user) {
            console.error("Webhook Error: User not found for subscription change", args);
            // In a real app we might create a stray user or log deeper
            return;
        }

        // 2. Update Internal DB
        await ctx.db.patch(user._id, {
            subscriptionStatus: args.status,
            subscriptionTier: args.tier,
            stripeCustomerId: args.stripeCustomerId,
        });

        // 2.5 Update Local Organization (if applicable)
        if (user.orgId) {
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
        }

        // 3. Update Clerk Metadata handled by Action calling this? 
        // NO - This mutation is called BY the action. The Action handles Clerk. 
        // The previous code had Clerk calls inside the Internal Mutation. 
        // Clerk calls must be in the ACTION (Node).
        // Since we are moving this to V8, we MUT strip the Clerk calls.

        // Wait, the previous code had Clerk calls inside `internalMutation`.
        // That was ALREADY broken if `clerk` import uses Node. 
        // But `clerk` usually runs in Node. 

        // Strategy:
        // The original `stripe.ts` had `use node` and `internalMutation` mixed.
        // We need to keep the Clerk calls in the `action` (in `stripe.ts` or `http.ts` that receives the webhook).
        // BUT wait, `stripe.ts` only had `internalMutation` exports. It didn't have actions.
        // The webhook handler is likely in `http.ts`.

        // Correct Architecture:
        // 1. HTTP Action (Node) receives Webhook.
        // 2. HTTP Action calls Clerk API directly (Node).
        // 3. HTTP Action calls `internal.paymentsData.handleSubscriptionChange` (V8) to update DB.

        // So I will remove the Clerk calls from this mutation.

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

        // Return user info so the Action can handle Clerk
        return {
            userId: user.externalId,
            orgId: user.orgId
        };
    },
});

export const recordPayment = internalMutation({
    args: {
        paymentAttemptData: v.any(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("paymentAttempts", args.paymentAttemptData);

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
