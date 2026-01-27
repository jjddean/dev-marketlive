"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20" as any,
});

// Action to create a Stripe Checkout Session
export const createCheckoutSession = action({
    args: {
        priceId: v.string(),
        plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        // Use VITE_APP_URL if defined, otherwise fallback to standard dev URL or standard prod URL if needed
        const domain = process.env.VITE_APP_URL || "http://localhost:5173";

        // Ensure user exists in our DB before proceeding
        // This fixes the issue where new users (created when webhooks were broken)
        // could pay but fail to get their subscription recorded.
        try {
            await ctx.runMutation(internal.users.ensureUserExists, { identity });
        } catch (e) {
            console.error("Failed to ensure user existence:", e);
            // Continue anyway, maybe it exists?
        }

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: args.priceId, quantity: 1 }],
            success_url: `${domain}/payments?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domain}/payments?canceled=true`,
            customer_email: identity.email,
            subscription_data: {
                metadata: {
                    userId: identity.subject,
                    plan: args.plan,
                    type: 'subscription'
                }
            },
            metadata: {
                userId: identity.subject,
                plan: args.plan,
                type: 'subscription'
            },
        });

        return { url: session.url };
    },
});
