"use node";

import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { clerk } from "./clerk";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-12-18.acacia" as any,
});

// Mutations have been moved to paymentsData.ts to avoid Node runtime conflicts.
