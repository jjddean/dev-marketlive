// NOTE: If geoRoutes table is already defined elsewhere, remove this duplicate.

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
// Force rebuild 2

import { paymentAttemptSchemaValidator } from "./paymentAttemptTypes";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    // this the Clerk ID, stored in the subject JWT field
    externalId: v.string(),
    // Multi-tenancy: Clerk Organization ID
    orgId: v.optional(v.string()),
    role: v.optional(v.string()), // "client", "admin", "platform:superadmin"
    subscriptionTier: v.optional(v.string()), // "free", "pro"
    subscriptionStatus: v.optional(v.string()), // "active", "canceled", "past_due"
    stripeCustomerId: v.optional(v.string()),
  }).index("byExternalId", ["externalId"])
    .index("byOrgId", ["orgId"]),

  // Organizations table - synced from Clerk
  organizations: defineTable({
    clerkOrgId: v.string(), // Clerk organization ID
    name: v.string(),
    slug: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdBy: v.optional(v.string()), // Clerk user ID who created it
    membersCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byClerkOrgId", ["clerkOrgId"])
    .index("bySlug", ["slug"]),

  paymentAttempts: defineTable(paymentAttemptSchemaValidator)
    .index("byPaymentId", ["payment_id"])
    .index("byUserId", ["userId"])
    .index("byPayerUserId", ["payer.user_id"]),

  quotes: defineTable({
    // Request details
    origin: v.string(),
    destination: v.string(),
    serviceType: v.string(),
    cargoType: v.string(),
    weight: v.string(),
    dimensions: v.object({
      length: v.string(),
      width: v.string(),
      height: v.string(),
    }),
    value: v.string(),
    incoterms: v.string(),
    urgency: v.string(),
    additionalServices: v.array(v.string()),
    contactInfo: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      company: v.string(),
    }),
    // Quote response
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
        breakdown: v.object({
          baseRate: v.number(),
          fuelSurcharge: v.number(),
          securityFee: v.number(),
          documentation: v.number(),
        }),
      }),
      validUntil: v.string(),
    })),
    userId: v.optional(v.id("users")),
    orgId: v.optional(v.string()), // Multi-tenancy
    createdAt: v.number(),
  }).index("byUserId", ["userId"])
    .index("byQuoteId", ["quoteId"])
    .index("byOrgId", ["orgId"]),

  shipments: defineTable({
    shipmentId: v.string(),
    status: v.string(),
    currentLocation: v.object({
      city: v.string(),
      state: v.string(),
      country: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    }),
    estimatedDelivery: v.string(),
    carrier: v.string(),
    trackingNumber: v.string(),
    service: v.string(),
    shipmentDetails: v.object({
      weight: v.string(),
      dimensions: v.string(),
      origin: v.string(),
      destination: v.string(),
      value: v.string(),
    }),
    userId: v.optional(v.id("users")),
    orgId: v.optional(v.string()), // Multi-tenancy
    lastUpdated: v.number(),
    createdAt: v.number(),
  }).index("byUserId", ["userId"])
    .index("byShipmentId", ["shipmentId"])
    .index("byTrackingNumber", ["trackingNumber"])
    .index("byOrgId", ["orgId"]),

  trackingEvents: defineTable({
    shipmentId: v.id("shipments"),
    timestamp: v.string(),
    status: v.string(),
    location: v.string(),
    description: v.string(),
    createdAt: v.number(),
  }).index("byShipmentId", ["shipmentId"])
    .index("byTimestamp", ["timestamp"]),

  bookings: defineTable({
    bookingId: v.string(),
    quoteId: v.string(),
    carrierQuoteId: v.string(),
    status: v.string(), // "confirmed", "in_transit", "delivered", "cancelled"
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
    notes: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    orgId: v.optional(v.string()), // Multi-tenancy
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byUserId", ["userId"])
    .index("byBookingId", ["bookingId"])
    .index("byQuoteId", ["quoteId"])
    .index("byOrgId", ["orgId"]),

  documents: defineTable({
    type: v.string(), // "bill_of_lading", "air_waybill", "commercial_invoice"
    bookingId: v.optional(v.string()),
    shipmentId: v.optional(v.string()),
    documentData: v.object({
      documentNumber: v.string(),
      issueDate: v.string(),
      parties: v.object({
        shipper: v.object({
          name: v.string(),
          address: v.string(),
          contact: v.string(),
        }),
        consignee: v.object({
          name: v.string(),
          address: v.string(),
          contact: v.string(),
        }),
        carrier: v.optional(v.object({
          name: v.string(),
          address: v.string(),
          contact: v.string(),
        })),
      }),
      cargoDetails: v.object({
        description: v.string(),
        weight: v.string(),
        dimensions: v.string(),
        value: v.string(),
        hsCode: v.optional(v.string()),
      }),
      routeDetails: v.object({
        origin: v.string(),
        destination: v.string(),
        portOfLoading: v.optional(v.string()),
        portOfDischarge: v.optional(v.string()),
      }),
      terms: v.optional(v.string()),
    }),
    status: v.string(), // "draft", "issued", "acknowledged", "archived"
    // New: DocuSign envelope metadata
    docusign: v.optional(v.object({
      envelopeId: v.string(),
      status: v.string(), // sent | completed | voided | declined | created
      lastUpdated: v.number(),
      recipients: v.optional(v.array(v.object({
        email: v.string(),
        name: v.string(),
        role: v.optional(v.string()),
        recipientId: v.optional(v.string()),
        status: v.optional(v.string()),
      }))),
    })),
    userId: v.optional(v.id("users")),
    orgId: v.optional(v.string()), // Multi-tenancy
    uploadedBy: v.optional(v.string()), // "client" | "system" - for hybrid model
    shareToken: v.optional(v.string()), // For public sharing
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byUserId", ["userId"])
    .index("byType", ["type"])
    .index("byBookingId", ["bookingId"])
    .index("byShipmentId", ["shipmentId"])
    .index("byShareToken", ["shareToken"])
    .index("byOrgId", ["orgId"]),

  geoRoutes: defineTable({
    key: v.string(),
    origin: v.string(),
    dest: v.string(),
    profile: v.string(),
    points: v.array(v.object({ lat: v.number(), lng: v.number() })),
    distance: v.optional(v.number()),
    duration: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.optional(v.number()),
  }).index("byKey", ["key"]),

  invoices: defineTable({
    invoiceNumber: v.string(),
    bookingId: v.id("bookings"),
    customerId: v.optional(v.id("users")),
    amount: v.number(),
    currency: v.string(),
    status: v.string(), // "pending", "paid", "overdue", "void"
    dueDate: v.string(),
    items: v.array(v.object({
      description: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      total: v.number(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
    orgId: v.optional(v.string()), // Multi-tenancy
  }).index("byBookingId", ["bookingId"])
    .index("byCustomerId", ["customerId"])
    .index("byInvoiceNumber", ["invoiceNumber"])
    .index("byOrgId", ["orgId"]),
}); 
