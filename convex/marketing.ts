import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";

// Join the waitlist
export const joinWaitlist = mutation({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
        company: v.optional(v.string()),
        role: v.optional(v.string()),
        source: v.optional(v.string()),
        ref: v.optional(v.string()), // The referral code they used
    },
    handler: async (ctx, args) => {
        // Check if already exists
        const existing = await ctx.db
            .query("waitlist")
            .withIndex("byEmail", (q) => q.eq("email", args.email))
            .first();

        if (existing) {
            // Return existing code if they try again
            return {
                success: true,
                message: "Already on the list!",
                id: existing._id,
                referralCode: existing.referralCode
            };
        }

        // Handle Referral Logic (Increment the referrer)
        if (args.ref) {
            const referrer = await ctx.db
                .query("waitlist")
                .withIndex("byReferralCode", (q) => q.eq("referralCode", args.ref))
                .first();

            if (referrer) {
                await ctx.db.patch(referrer._id, {
                    referrals: (referrer.referrals || 0) + 1
                });
            }
        }

        // Generate simple code: First 3 of email + random string
        const codePrefix = args.email.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const newReferralCode = `${codePrefix}-${randomSuffix}`;

        const id = await ctx.db.insert("waitlist", {
            email: args.email,
            name: args.name,
            company: args.company,
            role: args.role,
            status: "pending",
            source: args.source,
            referralCode: newReferralCode,
            referredBy: args.ref,
            referrals: 0,
            createdAt: Date.now(),
        });

        // Calculate Position (simple count of all users)
        // In prod, this would be a separate query or counter document
        const total = await ctx.db.query("waitlist").collect();
        const position = total.length;

        // Schedule welcome email
        // Schedule welcome email
        await ctx.scheduler.runAfter(0, api.emails.sendWelcomeEmail, {
            email: args.email,
            name: args.name,
            referralCode: newReferralCode,
        });

        return { success: true, id, referralCode: newReferralCode, position };
    },
});

// Admin: Get waitlist
export const getWaitlist = query({
    args: {},
    handler: async (ctx) => {
        // In prod: check for admin role
        return await ctx.db
            .query("waitlist")
            .order("desc")
            .collect();
    },
});
