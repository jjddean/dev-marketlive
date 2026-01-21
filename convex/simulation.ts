import { mutation } from "./_generated/server";

export const moveShipments = mutation({
    args: {},
    handler: async (ctx) => {
        const shipments = await ctx.db.query("shipments").collect();

        for (const ship of shipments) {
            if (ship.status === 'delivered') continue;

            const currentLat = ship.currentLocation.coordinates.lat;
            const currentLng = ship.currentLocation.coordinates.lng;

            // Simple random walk / jitter
            // Move approx 5-10km
            const deltaLat = (Math.random() - 0.5) * 0.1;
            const deltaLng = (Math.random() - 0.5) * 0.1;

            await ctx.db.patch(ship._id, {
                currentLocation: {
                    ...ship.currentLocation,
                    coordinates: {
                        lat: currentLat + deltaLat,
                        lng: currentLng + deltaLng
                    }
                },
                lastUpdated: Date.now()
            });
        }
        return "Moved " + shipments.length + " shipments";
    },
});

export const generateFullFlow = mutation({
    args: {},
    handler: async (ctx) => {
        // 0. Get Identity for Org Association
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Must be logged in to run simulation");

        const user = await ctx.db
            .query("users")
            .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found: Please log in to the app first");

        const orgId = user.orgId; // Critical for visibility

        // 1. Create a Quote
        const quoteId = `QT-TEST-${Date.now()}`;
        const quoteDoc = {
            orgId: orgId, // Attach to current org
            origin: "London, UK",
            destination: "New York, US",
            serviceType: "ocean",
            cargoType: "general",
            weight: "500",
            dimensions: { length: "100", width: "100", height: "100" },
            value: "15000",
            incoterms: "FOB",
            urgency: "standard",
            additionalServices: ["insurance"],
            contactInfo: {
                name: "Test User",
                email: "test@example.com",
                phone: "+44123456789",
                company: "Test Corp"
            },
            quoteId: quoteId,
            status: "success",
            quotes: [{
                carrierId: "CARRIER-1",
                carrierName: "Maersk Line",
                serviceType: "Ocean Standard",
                transitTime: "12-14 days",
                price: {
                    amount: 1250,
                    currency: "USD",
                    breakdown: { baseRate: 1000, fuelSurcharge: 200, securityFee: 50, documentation: 0 }
                },
                validUntil: new Date(Date.now() + 86400000).toISOString()
            }],
            createdAt: Date.now(),
        };
        await ctx.db.insert("quotes", quoteDoc);

        // 2. Create a Booking from that Quote
        const bookingId = `BK-TEST-${Date.now()}`;
        await ctx.db.insert("bookings", {
            bookingId: bookingId,
            quoteId: quoteId,
            carrierQuoteId: "CARRIER-1",
            status: "pending",
            approvalStatus: "pending",
            customerDetails: quoteDoc.contactInfo,
            orgId: orgId, // Attach to current org
            pickupDetails: {
                address: "123 Test St, London",
                date: "2024-02-01",
                timeWindow: "09:00-17:00",
                contactPerson: "Warehouse Mgr",
                contactPhone: "+44111222333"
            },
            deliveryDetails: {
                address: "456 Test Ave, NY",
                date: "2024-02-15",
                timeWindow: "09:00-17:00",
                contactPerson: "Receiver",
                contactPhone: "+12125556789"
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // 3. Create Audit Log for Visibility
        await ctx.db.insert("auditLogs", {
            action: "booking.created",
            entityType: "booking",
            entityId: bookingId,
            userId: identity.subject,
            userEmail: user.email,
            orgId: orgId,
            details: {
                customer: "test@example.com",
                origin: "London, UK",
                destination: "New York, US"
            },
            timestamp: Date.now(),
        });

        return {
            success: true,
            message: "Generated Quote + Booking + Audit Log for Org: " + (orgId || "Personal"),
            quoteId,
            bookingId
        };
    }
});
