import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const clearAllData = mutation({
    args: {
        resetSubscriptions: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        // 1. Lists of tables to clear
        const tables = [
            "shipments",
            "trackingEvents",
            "quotes",
            "bookings",
            "documents",
            "invoices",
            "paymentAttempts",
            "auditLogs",
            "notifications",
            "kycVerifications",
            "waitlist",
            "apiKeys"
        ];

        let deletedCount = 0;

        for (const table of tables) {
            const docs = await ctx.db.query(table as any).collect();
            for (const doc of docs) {
                await ctx.db.delete(doc._id);
                deletedCount++;
            }
        }

        // 2. Reset Subscriptions if requested
        if (args.resetSubscriptions) {
            const users = await ctx.db.query("users").collect();
            for (const user of users) {
                await ctx.db.patch(user._id, {
                    subscriptionTier: "free",
                    subscriptionStatus: undefined,
                    stripeCustomerId: undefined
                });
            }

            const orgs = await ctx.db.query("organizations").collect();
            for (const org of orgs) {
                await ctx.db.patch(org._id, {
                    subscriptionTier: "free",
                    subscriptionStatus: undefined
                });
            }
        }

        return { success: true, deletedCount, tablesCleared: tables };
    },
});
