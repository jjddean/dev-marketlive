import { mutation } from "./_generated/server";

// Seed function to create test shipments with real location data
export const seedTestShipments = mutation({
    args: {},
    handler: async (ctx) => {
        // Get current user
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Must be logged in to seed data");

        const user = await ctx.db
            .query("users")
            .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const testShipments = [
            {
                shipmentId: `SH-${Date.now()}-001`,
                status: "in_transit",
                carrier: "Maersk Line",
                trackingNumber: "MSKU1234567",
                service: "Ocean Freight",
                estimatedDelivery: new Date(Date.now() + 7 * 86400000).toISOString(),
                currentLocation: {
                    city: "Hamburg",
                    state: "Hamburg",
                    country: "Germany",
                    coordinates: { lat: 53.5511, lng: 9.9937 }
                },
                shipmentDetails: {
                    weight: "2500 kg",
                    dimensions: "40ft Container",
                    origin: "London, UK",
                    destination: "New York, USA",
                    value: "£125,000"
                },
                userId: user._id,
                createdAt: Date.now(),
                lastUpdated: Date.now(),
            },
            {
                shipmentId: `SH-${Date.now()}-002`,
                status: "in_transit",
                carrier: "DHL Express",
                trackingNumber: "DHL9876543",
                service: "Air Freight Express",
                estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
                currentLocation: {
                    city: "Frankfurt",
                    state: "Hesse",
                    country: "Germany",
                    coordinates: { lat: 50.1109, lng: 8.6821 }
                },
                shipmentDetails: {
                    weight: "75 kg",
                    dimensions: "120x80x60 cm",
                    origin: "Tokyo, Japan",
                    destination: "Paris, France",
                    value: "£45,000"
                },
                userId: user._id,
                createdAt: Date.now(),
                lastUpdated: Date.now(),
            },
            {
                shipmentId: `SH-${Date.now()}-003`,
                status: "delivered",
                carrier: "COSCO Shipping",
                trackingNumber: "COSCO7654321",
                service: "Ocean Freight Standard",
                estimatedDelivery: new Date(Date.now() - 2 * 86400000).toISOString(),
                currentLocation: {
                    city: "Rotterdam",
                    state: "South Holland",
                    country: "Netherlands",
                    coordinates: { lat: 51.9225, lng: 4.4792 }
                },
                shipmentDetails: {
                    weight: "5000 kg",
                    dimensions: "2x 20ft Containers",
                    origin: "Shanghai, China",
                    destination: "Rotterdam, NL",
                    value: "£250,000"
                },
                userId: user._id,
                createdAt: Date.now() - 10 * 86400000,
                lastUpdated: Date.now(),
            },
        ];

        const insertedIds = [];
        for (const shipment of testShipments) {
            const id = await ctx.db.insert("shipments", shipment as any);
            insertedIds.push(id);
        }

        return { message: `Created ${insertedIds.length} test shipments`, ids: insertedIds };
    },
});

export const seedAdminData = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Must be logged in to seed data");

        // 1. Pending Booking
        const bookingId = await ctx.db.insert("bookings", {
            bookingId: `BK-${Date.now()}-ADMIN`,
            userId: identity.subject as any,
            status: "pending",
            approvalStatus: "pending",
            quoteId: "mock-quote-id",
            carrierQuoteId: "mock-carrier-quote-id", // Added required field
            customerDetails: {
                company: "Test Corp Inc.",
                name: "Admin Tester",
                email: "admin@test.com",
                phone: "+1 555 0199"
            },
            pickupDetails: {
                address: "123 Test St, New York, NY",
                date: new Date().toISOString(),
                timeWindow: "09:00 - 17:00",
                contactPerson: "John Doe",
                contactPhone: "+1 555 1234"
            },
            deliveryDetails: {
                address: "456 Sample Rd, London, UK",
                date: new Date(Date.now() + 86400000).toISOString(), // Delivered tomorrow
                timeWindow: "09:00 - 17:00",
                contactPerson: "Jane Smith",
                contactPhone: "+1 555 5678"
            },
            cargoDetails: undefined, // Removed invalid field, strictly follow schema if needed, but schema shows this is not present in "bookings" table definition above? 
            // WAIT - reviewed schema lines 139-188. "cargoDetails" is NOT in bookings table. 
            // It is in "documents". 
            // Bookings typically link to a quote which has cargo details.
            // Removing cargoDetails.

            financials: undefined, // Removed invalid field. Schema has "price" object.
            price: {
                amount: 1500,
                currency: "USD",
            },
            paymentStatus: "pending", // Schema allows string

            createdAt: Date.now(),
            updatedAt: Date.now()
        });

        // 2. Suspended Organization
        await ctx.db.insert("organizations", {
            clerkOrgId: `org_test_${Date.now()}`,
            name: "Suspicious Logistics Ltd",
            slug: `suspicious-logistics-${Date.now()}`,
            createdBy: identity.subject,
            status: "suspended",
            createdAt: Date.now(),
            updatedAt: Date.now()
        });

        // 3. High Risk Shipment
        await ctx.db.insert("shipments", {
            shipmentId: `RISK-${Date.now()}`,
            userId: identity.subject as any,
            status: "held_customs",
            carrier: "Unknown Carrier",
            trackingNumber: `RISK${Date.now()}`,
            service: "Standard",
            riskLevel: "high",
            flagReason: "Automated Risk Detection: Unusual Route",
            flaggedBy: "system",
            currentLocation: {
                city: "Unknown",
                state: "N/A",
                country: "International Waters",
                coordinates: { lat: 0, lng: 0 }
            },
            shipmentDetails: {
                weight: "1000kg",
                dimensions: "Unknown",
                origin: "Restricted Area",
                destination: "US",
                value: "$50,000"
            },
            estimatedDelivery: new Date().toISOString(),
            createdAt: Date.now(),
            lastUpdated: Date.now()
        });

        // 4. Failed Payment
        await ctx.db.insert("paymentAttempts", {
            invoice_id: `inv_fail_${Date.now()}`,
            session_id: `sess_fail_${Date.now()}`,
            amount_total: 250000,
            payment_status: "unpaid",
            status: "failed",
            customer_email: "risky@payer.com",
            customer_name: "Risky Payer",
            created_at: Date.now(),
            totals: {
                grand_total: {
                    amount: 2500,
                    amount_formatted: "$2,500.00",
                    currency: "usd",
                    currency_symbol: "$"
                },
                subtotal: {
                    amount: 2500,
                    amount_formatted: "$2,500.00",
                    currency: "usd",
                    currency_symbol: "$"
                },
                tax_total: {
                    amount: 0,
                    amount_formatted: "$0.00",
                    currency: "usd",
                    currency_symbol: "$"
                }
            }
        });

        return { success: true, message: "Admin test data seeded successfully" };
    }
});
