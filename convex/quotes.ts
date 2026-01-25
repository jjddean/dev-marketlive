import { internalMutation, mutation, query } from "./_generated/server"
import { internal, api } from "./_generated/api"
import { v } from "convex/values"
import { calculateShippingPrice, estimateTransitTime } from "./pricing";

// ... (imports remain)
export const createQuote = mutation({
  args: {
    request: v.object({
      // ... (existing fields)
      origin: v.string(),
      destination: v.string(),
      serviceType: v.string(),
      cargoType: v.string(),
      weight: v.string(),
      dimensions: v.object({ length: v.string(), width: v.string(), height: v.string() }),
      value: v.string(),
      incoterms: v.string(),
      urgency: v.string(),
      additionalServices: v.array(v.string()),
      contactInfo: v.object({ name: v.string(), email: v.string(), phone: v.string(), company: v.string() }),
      quotes: v.optional(v.array(v.any())),
    }),
    response: v.optional(v.object({
      quoteId: v.string(),
      status: v.string(),
      quotes: v.array(v.any()),
    })),
    orgId: v.optional(v.string()), // New: receive org context
  },
  handler: async (ctx, { request, response, orgId: argsOrgId }) => {
    const identity = await ctx.auth.getUserIdentity();
    let linkedUserId: any = null;
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
        .unique();
      if (user) linkedUserId = user._id as any;
    }

    // Determine orgId: Arg > Token > null
    const orgId = argsOrgId || (identity as any)?.org_id || null;

    const quoteDoc: any = {
      ...request,
      quotes: response?.quotes || request.quotes || [{
        id: `rate-${Date.now()}`,
        carrier: "MarketLive Express",
        service_level: request.serviceType || "Standard",
        amount: calculateShippingPrice({
          origin: request.origin,
          destination: request.destination,
          weight: request.weight,
          serviceType: request.serviceType,
          cargoType: request.cargoType
        }),
        currency: "USD",
        transit_time: estimateTransitTime(request.origin, request.destination, request.serviceType)
      }],
      quoteId: response?.quoteId || `QT-${Date.now()}`,
      status: response?.status || "success",
      createdAt: Date.now(),
      orgId: orgId, // Save it!
    };
    if (linkedUserId) quoteDoc.userId = linkedUserId;

    const docId = await ctx.db.insert("quotes", quoteDoc);

    return { quoteId: quoteDoc.quoteId, quotes: quoteDoc.quotes };
  },
});

export const createInstantQuoteAndBooking = mutation({
  args: {
    request: v.object({
      origin: v.string(),
      destination: v.string(),
      serviceType: v.string(),
      cargoType: v.string(),
      weight: v.string(),
      dimensions: v.object({ length: v.string(), width: v.string(), height: v.string() }),
      value: v.string(),
      incoterms: v.string(),
      urgency: v.string(),
      additionalServices: v.array(v.string()),
      contactInfo: v.object({ name: v.string(), email: v.string(), phone: v.string(), company: v.string() }),
      quotes: v.optional(v.array(v.any())),
    }),
    orgId: v.optional(v.string()), // New
  },
  handler: async (ctx, { request, orgId: argsOrgId }) => {
    const pricing = calculateShippingPrice({
      origin: request.origin,
      destination: request.destination,
      weight: request.weight,
      serviceType: request.serviceType,
      cargoType: request.cargoType,
    });

    const transitTime = estimateTransitTime(request.origin, request.destination, request.serviceType);

    let quotes: any[] = request.quotes || [];

    if (quotes.length === 0) {
      quotes = [{
        id: `rate-${Date.now()}`,
        carrier: "MarketLive Logistics",
        service_level: request.serviceType || "Standard Freight",
        amount: pricing,
        currency: "USD",
        transit_time: transitTime,
        logo: "/logo.png"
      }];
    }

    const identity = await ctx.auth.getUserIdentity();
    let linkedUserId: any = null;
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
        .unique();
      if (user) linkedUserId = user._id as any;
    }

    const orgId = argsOrgId || (identity as any)?.org_id || null;

    const quoteId = `QT-${Date.now()}`;
    const docId = await ctx.db.insert("quotes", {
      ...request,
      quoteId,
      status: "success",
      quotes,
      userId: linkedUserId,
      orgId: orgId, // Save it
      createdAt: Date.now(),
    } as any);

    return { quoteId, docId, quotes };
  },
});

export const listQuotes = query({
  args: { orgId: v.optional(v.union(v.string(), v.null())) }, // Updated args
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const orgId = args.orgId ?? null;

    if (orgId) {
      // Filter by organization
      return await ctx.db
        .query("quotes")
        .withIndex("byOrgId", (q) => q.eq("orgId", orgId))
        .order("desc")
        .collect();
    } else {
      // Personal account - filter by userId AND ensure orgId is undefined
      const user = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
        .unique();

      if (!user) return [];

      return await ctx.db
        .query("quotes")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("orgId"), undefined))
        .order("desc")
        .collect();
    }
  },
});

export const getQuote = query({
  args: { quoteId: v.string() },
  handler: async (ctx, { quoteId }) => {
    return await ctx.db
      .query("quotes")
      .withIndex("byQuoteId", (q) => q.eq("quoteId", quoteId))
      .unique();
  },
});

// New: list quotes for the current authenticated user
export const listMyQuotes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("quotes")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});