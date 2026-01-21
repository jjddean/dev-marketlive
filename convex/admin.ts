import { query } from "./_generated/server";
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
