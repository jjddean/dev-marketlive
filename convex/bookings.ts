import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const createBooking = mutation({
  args: {
    quoteId: v.string(),
    carrierQuoteId: v.string(),
    customerDetails: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      company: v.string(),
    }),
    pickupDetails: v.object({
      address: v.string(),
      date: v.string(),
      timeWindow: v.string(),
      contactPerson: v.string(),
      contactPhone: v.string(),
    }),
    deliveryDetails: v.object({
      address: v.string(),
      date: v.string(),
      timeWindow: v.string(),
      contactPerson: v.string(),
      contactPhone: v.string(),
    }),
    specialInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Link to current user when available
    const identity = await ctx.auth.getUserIdentity();
    let linkedUserId: any = undefined;
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
        .unique();
      if (user) linkedUserId = user._id;
    }

    // Validate quote exists and carrier option is valid
    const quote = await ctx.db
      .query("quotes")
      .withIndex("byQuoteId", (q) => q.eq("quoteId", args.quoteId))
      .unique();
    if (!quote) {
      throw new Error("Invalid quoteId: quote not found");
    }

    const selected = (quote.quotes as any[] | undefined)?.find((q) => q.carrierId === args.carrierQuoteId);
    if (!selected) {
      throw new Error("Invalid carrierQuoteId for this quote");
    }

    // Optional: enforce validity window if present
    try {
      const validUntil = selected.validUntil ? Date.parse(selected.validUntil) : undefined;
      if (validUntil && Date.now() > validUntil) {
        throw new Error("Selected quote has expired");
      }
    } catch (e) {
      // If parsing fails, do not block; rely on manual override
    }

    // Generate booking ID
    const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create booking
    const docId = await ctx.db.insert("bookings", {
      bookingId,
      quoteId: args.quoteId,
      carrierQuoteId: args.carrierQuoteId,
      status: "pending",
      customerDetails: args.customerDetails,
      pickupDetails: args.pickupDetails,
      deliveryDetails: args.deliveryDetails,
      specialInstructions: args.specialInstructions,
      userId: linkedUserId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any);

    // AUTOMATIC INVOICE GENERATION
    // Create a pending payment attempt so it shows up in Payments Page
    try {
      const amount = selected.price?.amount || 0;
      const currency = selected.price?.currency || "USD";
      const symbol = currency === "USD" ? "$" : (currency === "GBP" ? "£" : "€");

      await ctx.db.insert("paymentAttempts", {
        payment_id: `PAY-${bookingId}`,
        invoice_id: `INV-${bookingId}`,
        statement_id: `ST-${bookingId}`,
        status: "pending",
        billing_date: Date.now(),
        charge_type: "one_time",
        created_at: Date.now(),
        updated_at: Date.now(),
        payer: {
          email: args.customerDetails.email,
          first_name: args.customerDetails.name.split(' ')[0] || 'Guest',
          last_name: args.customerDetails.name.split(' ').slice(1).join(' ') || '',
          user_id: identity?.subject || 'TRANSIT_USER'
        },
        payment_source: {
          card_type: 'n/a',
          last4: '0000'
        },
        subscription_items: [
          {
            amount: { amount, amount_formatted: `${symbol}${amount}`, currency, currency_symbol: symbol },
            plan: {
              id: 'freight-one-time',
              // Trim potential newlines from carrierName
              name: `Freight: ${(selected.carrierName || 'Carrier').trim()} - ${(selected.serviceType || 'Standard').trim()}`,
              slug: 'freight',
              amount,
              currency,
              period: 'one_time',
              interval: 0
            },
            status: 'pending',
            period_start: Date.now(),
            period_end: Date.now()
          }
        ],
        totals: {
          grand_total: { amount, amount_formatted: `${symbol}${amount}`, currency, currency_symbol: symbol },
          subtotal: { amount, amount_formatted: `${symbol}${amount}`, currency, currency_symbol: symbol },
          tax_total: { amount: 0, amount_formatted: `${symbol}0`, currency, currency_symbol: symbol }
        },
        userId: linkedUserId
      });
    } catch (invErr) {
      console.error("INVOICE GENERATION FAILED (Booking allowed):", invErr);
      // We do not rethrow, so booking succeeds.
    }

    // Send Confirmation Email
    await ctx.scheduler.runAfter(0, internal.email.sendEmail, {
      to: args.customerDetails.email,
      subject: `Booking Confirmation: ${bookingId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #003366;">Booking Received</h1>
          <p>Dear ${args.customerDetails.name},</p>
          <p>Your booking <strong>${bookingId}</strong> has been received and is pending approval.</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Origin:</strong> ${args.pickupDetails.address}</p>
            <p><strong>Destination:</strong> ${args.deliveryDetails.address}</p>
          </div>
          <p>We will notify you once your shipment is fully approved.</p>
          <p>Best regards,<br/>The MarketLive Team</p>
        </div>
      `
    });

    return { bookingId, docId };
  },
});

export const listMyBookings = query({
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
      .query("bookings")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getBooking = query({
  args: { bookingId: v.string() },
  handler: async (ctx, { bookingId }) => {
    return await ctx.db
      .query("bookings")
      .withIndex("byBookingId", (q) => q.eq("bookingId", bookingId))
      .unique();
  },
});

// Admin: list all bookings for the current org (for stats/dashboard)
export const listBookings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get current user's org from JWT
    const orgId = (identity as any).org_id;

    if (orgId) {
      // Filter by organization
      return await ctx.db
        .query("bookings")
        .withIndex("byOrgId", (q) => q.eq("orgId", orgId))
        .order("desc")
        .collect();
    } else {
      // Personal account - filter by userId
      const user = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
        .unique();

      if (!user) return [];

      return await ctx.db
        .query("bookings")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect();
    }
  },
});

export const updateBookingStatus = mutation({
  args: {
    bookingId: v.string(),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { bookingId, status, notes }) => {
    const booking = await ctx.db
      .query("bookings")
      .withIndex("byBookingId", (q) => q.eq("bookingId", bookingId))
      .unique();

    if (!booking) {
      throw new Error("Booking not found");
    }

    await ctx.db.patch(booking._id, {
      status,
      notes,
      updatedAt: Date.now(),
    });

    if (status === 'confirmed') {
      await ctx.scheduler.runAfter(0, internal.email.sendEmail, {
        to: booking.customerDetails.email,
        subject: `Booking Confirmed: ${booking.bookingId}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #003366;">Booking Confirmed!</h1>
            <p>Dear ${booking.customerDetails.name},</p>
            <p>Good news! Your booking <strong>${booking.bookingId}</strong> has been confirmed.</p>
            <p>Our team has verified your route and cargo details. A carrier has been assigned.</p>
            <p><strong>Next Steps:</strong> You can track your shipment live on our dashboard.</p>
            <a href="${process.env.CONVEX_SITE_URL}/dashboard" style="display:inline-block; background:#003366; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; margin-top:20px;">View Dashboard</a>
          </div>
        `
      });
    }

    return booking._id;
  },
});

// Admin: Approve a booking that requires platform approval
export const approveBooking = mutation({
  args: {
    bookingId: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { bookingId, notes }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "platform:superadmin")) {
      throw new Error("Only admins can approve bookings");
    }

    const booking = await ctx.db
      .query("bookings")
      .withIndex("byBookingId", (q) => q.eq("bookingId", bookingId))
      .unique();

    if (!booking) throw new Error("Booking not found");

    await ctx.db.patch(booking._id, {
      status: "approved",
      approvalStatus: "approved",
      approvedBy: identity.subject,
      approvedAt: Date.now(),
      notes: notes || booking.notes,
      updatedAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.email.sendEmail, {
      to: booking.customerDetails.email,
      subject: `Booking Approved: ${booking.bookingId}`,
      html: `<div style="font-family: sans-serif;"><h1 style="color: #22c55e;">Booking Approved!</h1><p>Your booking ${booking.bookingId} has been approved.</p></div>`
    });

    return { success: true, bookingId };
  },
});

// Admin: Reject a booking
export const rejectBooking = mutation({
  args: {
    bookingId: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, { bookingId, reason }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "platform:superadmin")) {
      throw new Error("Only admins can reject bookings");
    }

    const booking = await ctx.db
      .query("bookings")
      .withIndex("byBookingId", (q) => q.eq("bookingId", bookingId))
      .unique();

    if (!booking) throw new Error("Booking not found");

    await ctx.db.patch(booking._id, {
      status: "rejected",
      approvalStatus: "rejected",
      rejectionReason: reason,
      approvedBy: identity.subject,
      approvedAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.email.sendEmail, {
      to: booking.customerDetails.email,
      subject: `Booking Update: ${booking.bookingId}`,
      html: `<div style="font-family: sans-serif;"><h1 style="color: #ef4444;">Booking Could Not Be Processed</h1><p>Reason: ${reason}</p></div>`
    });

    return { success: true, bookingId };
  },
});

// Query: Get bookings pending approval
export const listPendingApprovals = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "platform:superadmin")) {
      return [];
    }

    return await ctx.db
      .query("bookings")
      .withIndex("byApprovalStatus", (q) => q.eq("approvalStatus", "pending"))
      .order("desc")
      .collect();
  },
});