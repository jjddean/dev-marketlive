import { internalMutation, mutation, query } from "./_generated/server"
import { internal, api } from "./_generated/api"
import { v } from "convex/values"

export const createQuote = mutation({
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
    }),
    response: v.object({
      quoteId: v.string(),
      status: v.string(),
      quotes: v.array(v.object({
        carrierId: v.string(),
        carrierName: v.string(),
        serviceType: v.string(),
        transitTime: v.string(),
        price: v.object({
          amount: v.number(),
          currency: v.string(),
          breakdown: v.object({ baseRate: v.number(), fuelSurcharge: v.number(), securityFee: v.number(), documentation: v.number() }),
        }),
        validUntil: v.string(),
      })),
    }),
  },
  handler: async (ctx, { request, response }) => {
    // Link to current user when available (map Clerk subject -> users.externalId)
    const identity = await ctx.auth.getUserIdentity();
    let linkedUserId: any = null;
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
        .unique();
      if (user) linkedUserId = user._id as any;
    }

    const quoteDoc: any = {
      ...request,
      ...response,
      createdAt: Date.now(),
    };
    if (linkedUserId) quoteDoc.userId = linkedUserId;

    const docId = await ctx.db.insert("quotes", quoteDoc);

    return docId;
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
    }),
  },
  handler: async (ctx, { request }) => {
    // Import pricing engine
    const { calculateShippingPrice, estimateTransitTime } = await import('./pricing');

    // Calculate real price based on route, weight, and service type
    const pricing = calculateShippingPrice({
      origin: request.origin,
      destination: request.destination,
      weight: request.weight,
      serviceType: request.serviceType,
      cargoType: request.cargoType,
    });

    const transitTime = estimateTransitTime(request.origin, request.destination, request.serviceType);

    // Use real pricing for instant quote
    const quoteId = `QT-${Date.now()}`;
    const quotes = [
      {
        carrierId: "CARRIER-001",
        carrierName: request.serviceType === 'sea' ? 'Maersk Line' :
          request.serviceType === 'air' ? 'DHL Air Freight' :
            'FedEx Express',
        serviceType: request.serviceType || "air",
        transitTime: transitTime,
        price: {
          amount: pricing.total,
          currency: "USD",
          breakdown: {
            baseRate: pricing.baseRate,
            fuelSurcharge: pricing.fuelSurcharge,
            securityFee: pricing.securityFee,
            documentation: pricing.documentation,
          },
        },
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Link to current user when available
    const identity = await ctx.auth.getUserIdentity();
    let linkedUserId: any = null;
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
        .unique();
      if (user) linkedUserId = user._id as any;
    }

    const docId = await ctx.db.insert("quotes", {
      ...request,
      quoteId,
      status: "success",
      quotes,
      userId: linkedUserId,
      createdAt: Date.now(),
    } as any);

    // Auto-create a booking using the best (first) carrier quote
    const best = quotes[0];
    const bookingArgs = {
      quoteId,
      carrierQuoteId: best.carrierId,
      customerDetails: request.contactInfo,
      pickupDetails: {
        address: request.origin,
        date: new Date().toISOString(),
        timeWindow: "09:00-17:00",
        contactPerson: request.contactInfo.name,
        contactPhone: request.contactInfo.phone,
      },
      deliveryDetails: {
        address: request.destination,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        timeWindow: "09:00-17:00",
        contactPerson: request.contactInfo.name,
        contactPhone: request.contactInfo.phone,
      },
      specialInstructions: undefined,
    };

    const booking: any = await ctx.runMutation(api.bookings.createBooking, bookingArgs);

    return { quoteId, convexQuoteId: docId, booking };
  },
});

export const listQuotes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("quotes").order("desc").collect();
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