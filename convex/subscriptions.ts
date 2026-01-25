"use node";

import { mutation } from "./_generated/server";
import { v } from "convex/values";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20" as any,
});

export const createCheckoutSession = mutation({
    args: {
        priceId: v.string(),
        plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        // Use VITE_APP_URL if defined, otherwise fallback to standard dev URL or standard prod URL if needed
        // The user requested VITE_APP_URL specifically.
        const domain = process.env.VITE_APP_URL || "http://localhost:5173";

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: args.priceId, quantity: 1 }],
            success_url: `${domain}/payments?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domain}/payments?canceled=true`,
            customer_email: identity.email,
            metadata: {
                userId: identity.subject,
                plan: args.plan,
            },
        });

        return { url: session.url };
    },
});
