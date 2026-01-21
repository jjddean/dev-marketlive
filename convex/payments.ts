import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Public mutation for demo purposes (in prod, use webhooks!)
export const completeSubscription = mutation({
    args: { userId: v.optional(v.string()) },
    handler: async (ctx, args) => {
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
                    amount: "2450.00",
                    currency: "USD",
                    status: "succeeded",
                    method: "stripe"
                },
                timestamp: Date.now(),
            });
        }
    }
});
