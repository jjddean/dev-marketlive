import { mutation } from "./_generated/server";

export const addMissingLog = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not logged in");

        const user = await ctx.db
            .query("users")
            .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        await ctx.db.insert("auditLogs", {
            action: "payment.completed",
            entityType: "payment",
            entityId: "PAY-TEST-BACKFILL-" + Date.now(),
            userId: identity.subject,
            userEmail: user.email,
            orgId: user.orgId,
            details: {
                amount: "2,450.00",
                currency: "USD",
                status: "succeeded",
                note: "Backfilled log for user verification"
            },
            timestamp: Date.now(),
        });

        return "Successfully added missing log";
    }
});
