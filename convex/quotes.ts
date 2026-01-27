import { internalMutation, mutation, query } from "./_generated/server"
import { internal, api } from "./_generated/api"
import { v } from "convex/values"
import { calculateShippingPrice, estimateTransitTime } from "./pricing";
import { getFreightEstimates } from "./freightos";
import { findLocode } from "./locations";

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
    try {
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
      const orgId = argsOrgId || (identity as any)?.org_id || undefined;

      // 1. Map Cities to UN/LOCODES (Using Database)
      const originCode = findLocode(request.origin);
      const destCode = findLocode(request.destination);

      if (!originCode || !destCode) {
        throw new Error(`Could not find UN/LOCODE for route: ${request.origin} -> ${request.destination}. Please use major ports (e.g. Shanghai, Los Angeles, Rotterdam).`);
      }

      // 2. Call Freightos API
      // Heuristic for unit type/weight/volume based on user input string
      // In a real app, inputs would be structured.
      const totalWeight = parseFloat(request.weight) || 1000;

      const estimates = await getFreightEstimates({
        origin: originCode,
        destination: destCode,
        load: [{
          quantity: 1,
          unitType: "boxes", // Defaulting to boxes for simplicity
          unitWeightKg: totalWeight,
          unitVolumeCBM: totalWeight * 0.005 // Rough 1kg = 0.005 CBM estimate
        }]
      });

      if (!estimates) {
        throw new Error("No quotes returned from Freightos.");
      }

      const newQuotes: any[] = [];

      // 3. Map OCEAN Results
      // 3. Map OCEAN Results
      if (estimates.OCEAN && estimates.OCEAN.priceEstimates && estimates.OCEAN.transitTime) {
        newQuotes.push({
          carrierId: `rate-ocean-${Date.now()}`,
          carrierName: "Freightos Ocean",
          serviceType: "Standard Ocean",
          transitTime: `${estimates.OCEAN.transitTime.min}-${estimates.OCEAN.transitTime.max} days`,
          price: {
            amount: Math.round(estimates.OCEAN.priceEstimates.min),
            currency: "USD",
            breakdown: {
              baseRate: Math.round(estimates.OCEAN.priceEstimates.min * 0.8),
              fuelSurcharge: Math.round(estimates.OCEAN.priceEstimates.min * 0.15),
              securityFee: Math.round(estimates.OCEAN.priceEstimates.min * 0.05),
              documentation: 50
            }
          },
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      // 4. Map AIR Results
      if (estimates.AIR && estimates.AIR.priceEstimates && estimates.AIR.transitTime) {
        newQuotes.push({
          carrierId: `rate-air-${Date.now()}`,
          carrierName: "Freightos Air",
          serviceType: "Express Air",
          transitTime: `${estimates.AIR.transitTime.min}-${estimates.AIR.transitTime.max} days`,
          price: {
            amount: Math.round(estimates.AIR.priceEstimates.min),
            currency: "USD",
            breakdown: {
              baseRate: Math.round(estimates.AIR.priceEstimates.min * 0.7),
              fuelSurcharge: Math.round(estimates.AIR.priceEstimates.min * 0.2),
              securityFee: Math.round(estimates.AIR.priceEstimates.min * 0.05),
              documentation: 25
            }
          },
          validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      if (newQuotes.length === 0) {
        throw new Error("No valid quotes found for this route.");
      }

      const normalizedQuotes = newQuotes.map((r: any) => ({
        carrierId: r.carrierId ?? r.id ?? `carrier-${r.carrier}`,
        carrierName: r.carrierName ?? r.carrier ?? "Unknown carrier",
        price: {
          amount: Number(r.price?.amount ?? r.amount?.total ?? r.amount ?? 0),
          breakdown: {
            baseRate: Number(r.price?.breakdown?.baseRate ?? r.amount?.baseRate ?? 0),
            documentation: Number(r.price?.breakdown?.documentation ?? r.amount?.documentation ?? 0),
            fuelSurcharge: Number(r.price?.breakdown?.fuelSurcharge ?? r.amount?.fuelSurcharge ?? 0),
            securityFee: Number(r.price?.breakdown?.securityFee ?? r.amount?.securityFee ?? 0),
          },
          currency: r.price?.currency ?? r.currency ?? "USD",
        },
        serviceType: r.serviceType ?? r.service_level ?? "unknown",
        transitTime: r.transitTime ?? r.transit_time ?? "unknown",
        validUntil: r.validUntil ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }));

      const quoteDoc: any = {
        ...request,
        quotes: normalizedQuotes,
        quoteId: response?.quoteId || `QT-${Date.now()}`,
        status: response?.status || "success",
        createdAt: Date.now(),
      };

      if (orgId) quoteDoc.orgId = orgId;
      if (linkedUserId) quoteDoc.userId = linkedUserId;

      const docId = await ctx.db.insert("quotes", quoteDoc);

      return { quoteId: quoteDoc.quoteId, quotes: quoteDoc.quotes };
    } catch (error) {
      console.error("FAILED to create quote:", error);
      throw new Error(`Quote creation failed: ${(error as any).message}`);
    }
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

    const orgId = argsOrgId || (identity as any)?.org_id || null; // Matches schema optional string

    // STRICT NORMALIZATION
    const normalizedQuotes = quotes.map((r: any) => ({
      carrierId: r.carrierId ?? r.id ?? `carrier-${Date.now()}`,
      carrierName: r.carrierName ?? r.carrier ?? "MarketLive Logistics",
      price: {
        amount: Number(r.price?.amount ?? r.amount?.total ?? r.amount ?? 0),
        breakdown: {
          baseRate: Number(r.price?.breakdown?.baseRate ?? r.amount?.baseRate ?? r.amount ?? 0),
          documentation: Number(r.price?.breakdown?.documentation ?? r.amount?.documentation ?? 0),
          fuelSurcharge: Number(r.price?.breakdown?.fuelSurcharge ?? r.amount?.fuelSurcharge ?? 0),
          securityFee: Number(r.price?.breakdown?.securityFee ?? r.amount?.securityFee ?? 0),
        },
        currency: r.price?.currency ?? r.currency ?? "USD",
      },
      serviceType: (r.serviceType ?? r.service_level ?? r.serviceType) || "Standard Freight",
      transitTime: r.transitTime ?? r.transit_time ?? "3-5 days",
      validUntil: r.validUntil ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }));

    const quoteId = `QT-${Date.now()}`;
    const quoteDoc: any = {
      ...request,
      quoteId,
      status: "success",
      quotes: normalizedQuotes, // Use normalized
      userId: linkedUserId,
      createdAt: Date.now(),
    };

    if (orgId) quoteDoc.orgId = orgId;

    const docId = await ctx.db.insert("quotes", quoteDoc);

    return { quoteId, docId, quotes: normalizedQuotes };
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