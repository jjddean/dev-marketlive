import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardStats = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            // For now, allow public access for demo purposes, or return empty stats
            // throw new Error("Unauthorized");
        }

        const bookings = await ctx.db.query("bookings").collect();
        const shipments = await ctx.db.query("shipments").collect();
        const users = await ctx.db.query("users").collect();

        const totalBookings = bookings.length;
        // Calculate pending approvals (bookings with status 'pending' or 'quote_received')
        const pendingApprovals = bookings.filter(b => b.status === 'pending' || b.status === 'quote_received').length;

        const activeShipments = shipments.filter(s => s.status === 'In Transit' || s.status === 'in_transit').length;
        const totalCustomers = users.length;

        // Calculate trends (mock logic or comparing dates)
        // For now, return static trends
        return {
            totalBookings,
            activeShipments,
            totalCustomers,
            pendingApprovals,
            trends: {
                bookings: "+12.5%",
                shipments: "+4",
                customers: "+8.2%",
                approvals: pendingApprovals > 0 ? "+1" : "0"
            }
        };
    },
});

export const listAllBookings = query({
    args: {},
    handler: async (ctx) => {
        // Admin check would go here
        return await ctx.db.query("bookings").order("desc").collect();
    }
});


export const listAllShipments = query({
    args: {},
    handler: async (ctx) => {
        // Admin check would go here
        return await ctx.db.query("shipments").order("desc").collect();
    }
});

export const getRecentActivity = query({
    args: {},
    handler: async (ctx) => {
        // Admin check would go here (already protected by UI role check usually, but good to add)
        return await ctx.db.query("auditLogs")
            .order("desc")
            .take(20);
    }
});

export const getPendingActions = query({
    args: {},
    handler: async (ctx) => {
        // 1. Pending Bookings
        const bookings = await ctx.db
            .query("bookings")
            .withIndex("byApprovalStatus", (q) => q.eq("approvalStatus", "pending"))
            .collect();

        // 2. Pending KYC
        const kyc = await ctx.db
            .query("kycVerifications")
            .withIndex("byStatus", (q) => q.eq("status", "submitted"))
            .collect();

        // 3. Pending Documents (using status filter)
        const allDocs = await ctx.db.query("documents").collect();
        const pendingDocs = allDocs.filter(d => d.status === "pending_review");

        // 4. Failed/Pending Payments (New)
        // Note: We don't have a status index on paymentAttempts yet, so we scan (ok for MVP admin)
        // Or we added it? Let's use filter for now.
        const allPayments = await ctx.db.query("paymentAttempts").collect();
        const pendingPayments = allPayments.filter(p => p.status === 'failed' || p.status === 'requires_action');

        // Normalize
        const actions = [
            ...bookings.map(b => ({
                id: b._id, // Internal ID preferable for mutations
                type: 'booking',
                priority: 'high',
                title: `Booking Approval: ${b.bookingId}`,
                subtitle: `${b.customerDetails?.company || 'Unknown'} - ${b.pickupDetails?.address?.split(',')[0]} -> ${b.deliveryDetails?.address?.split(',')[0]}`,
                createdAt: b.createdAt,
                status: 'pending'
            })),
            ...kyc.map(k => ({
                id: k._id,
                type: 'kyc',
                priority: 'critical',
                title: `KYC Verification: ${k.companyName}`,
                subtitle: `Reg: ${k.registrationNumber} (${k.country})`,
                createdAt: k.submittedAt || k._creationTime,
                status: 'submitted'
            })),
            ...pendingDocs.map(d => ({
                id: d._id,
                type: 'document',
                priority: 'medium',
                title: `Document Review: ${d.type}`,
                subtitle: `Ref: ${d.documentData?.documentNumber}`,
                createdAt: d.updatedAt || d.createdAt,
                status: 'pending_review'
            })),
            ...pendingPayments.map(p => ({
                id: p._id,
                type: 'payment',
                priority: 'high',
                title: `Payment Issue: ${p.invoice_id}`,
                subtitle: `Amount: ${p.totals?.grand_total?.amount_formatted || 'Unknown'} - ${p.status}`,
                createdAt: p.created_at,
                status: p.status
            }))
        ];

        // Sort by newest first
        return actions.sort((a, b) => b.createdAt - a.createdAt);
    }
});

// Admin: List Waitlist
export const listWaitlist = query({
    args: {},
    handler: async (ctx) => {
        // In prod: check admin role
        return await ctx.db
            .query("waitlist")
            .order("desc")
            .collect();
    }
});

// Admin: Approve Waitlist User (Invite)
export const approveWaitlistUser = mutation({
    args: { id: v.id("waitlist") },
    handler: async (ctx, args) => {
        // In prod: check admin role
        await ctx.db.patch(args.id, {
            status: "invited",
            invitedAt: Date.now()
        });

        // Get user details to send email
        const entry = await ctx.db.get(args.id);
        if (entry) {
            // AUDIT LOG
            const identity = await ctx.auth.getUserIdentity();
            await ctx.db.insert("auditLogs", {
                action: "waitlist.invited",
                entityType: "waitlist",
                entityId: args.id,
                userId: identity?.subject || "admin",
                // invitedEmail: entry.email, (would go in details)
                details: { email: entry.email },
                timestamp: Date.now()
            });

            // Trigger Email (Mock)
            // await ctx.scheduler.runAfter(0, internal.email.sendInvite, { email: entry.email });
        }
    }
});

// Admin: List Audit Logs
export const getAuditLogs = query({
    args: {},
    handler: async (ctx) => {
        // In prod: check admin role
        return await ctx.db
            .query("auditLogs")
            .order("desc")
            .take(100); // Increased limit for audit page
    }
});

// Admin: List All Users
export const listUsers = query({
    args: {},
    handler: async (ctx) => {
        // In prod: check admin role
        return await ctx.db
            .query("users")
            .order("desc")
            .collect();
    }
});

// Admin: List All Organizations
export const listOrganizations = query({
    args: {},
    handler: async (ctx) => {
        // In prod: check admin role
        return await ctx.db
            .query("organizations")
            .order("desc")
            .collect();
    }
});

// Admin: List All Documents
export const listAllDocuments = query({
    args: {},
    handler: async (ctx) => {
        // In prod: check admin role
        const docs = await ctx.db
            .query("documents")
            .order("desc")
            .collect();

        // Enhance with Org Name/User Name?
        // For MVP, just return docs. Frontend can potentially resolve names if needed
        // or we can do a Promise.all join here if performance allows (for <1000 items ok).

        return docs;
    }
});
