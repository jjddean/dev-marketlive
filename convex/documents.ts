import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createDocument = mutation({
  args: {
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
    status: v.optional(v.string()),
    orgId: v.optional(v.string()), // New: Implicitly passed by frontend context
  },
  handler: async (ctx, args) => {
    // Link to current user. Ensure a user record exists; if not, create it.
    const identity = await ctx.auth.getUserIdentity();
    // ... (user linking logic remains same)
    let linkedUserId: any = undefined;
    if (identity) {
      // ... (existing code)
      let user = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
        .unique();
      // ... (existing backfill logic)
      if (!user) {
        const name = (identity as any).name || (identity as any).email || identity.subject;
        const email = (identity as any).email;
        linkedUserId = await ctx.db.insert("users", { name, email, externalId: identity.subject } as any);
      } else {
        linkedUserId = user._id;
      }
    }

    const toInsert: any = {
      type: args.type,
      bookingId: args.bookingId,
      shipmentId: args.shipmentId,
      documentData: args.documentData,
      status: args.status || "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    if (linkedUserId) toInsert.userId = linkedUserId;

    // Add orgId: prioritize ARG, fall back to Token, then null
    const orgId = args.orgId || (identity as any).org_id;
    if (orgId) {
      toInsert.orgId = orgId;
    }

    const docId = await ctx.db.insert("documents", toInsert);

    return docId;
  },
});

export const listMyDocuments = query({
  args: {
    type: v.optional(v.string()),
    bookingId: v.optional(v.string()),
    shipmentId: v.optional(v.string()),
  },
  handler: async (ctx, { type, bookingId, shipmentId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) return [];

    const userId = user._id;
    const orgId = (identity as any).org_id;

    let docs = await ctx.db
      .query("documents")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .filter(q => q.eq(q.field("orgId"), orgId))
      .collect();

    // Filter by type if provided
    if (type) {
      docs = docs.filter(doc => doc.type === type);
    }

    // Filter by bookingId if provided
    if (bookingId) {
      docs = docs.filter(doc => doc.bookingId === bookingId);
    }

    // Filter by shipmentId if provided
    if (shipmentId) {
      docs = docs.filter(doc => doc.shipmentId === shipmentId);
    }

    return docs.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    return await ctx.db.get(documentId);
  },
});

export const updateDocument = mutation({
  args: {
    documentId: v.id("documents"),
    documentData: v.optional(v.object({
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
    })),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { documentId, documentData, status }) => {
    const updates: any = { updatedAt: Date.now() };

    if (documentData) {
      updates.documentData = documentData;
    }

    if (status) {
      updates.status = status;
    }

    await ctx.db.patch(documentId, updates);
    return documentId;
  },
});

// New: store DocuSign envelope metadata
export const setDocusignEnvelope = mutation({
  args: {
    documentId: v.id("documents"),
    envelopeId: v.string(),
    status: v.string(),
    recipients: v.optional(v.array(v.object({
      email: v.string(),
      name: v.string(),
      role: v.optional(v.string()),
      recipientId: v.optional(v.string()),
      status: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, { documentId, envelopeId, status, recipients }) => {
    await ctx.db.patch(documentId, {
      docusign: {
        envelopeId,
        status,
        lastUpdated: Date.now(),
        recipients,
      } as any,
      status: status === 'sent' ? 'issued' : status,
      updatedAt: Date.now(),
    } as any);
    return documentId;
  }
});

export const generateShareLink = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    // Check auth
    const identity = await ctx.auth.getUserIdentity();
    console.log("DEBUG: Clerk Identity:", identity);

    if (!identity) {
      throw new Error("Unauthenticated call to createDocument");
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    await ctx.db.patch(documentId, {
      shareToken: token,
      updatedAt: Date.now()
    });

    return token;
  },
});

export const getSharedDocument = query({
  args: { shareToken: v.string() },
  handler: async (ctx, { shareToken }) => {
    const doc = await ctx.db
      .query("documents")
      .withIndex("byShareToken", (q) => q.eq("shareToken", shareToken))
      .unique();
    return doc;
  },
});

// Re-defined listDocuments with strict Org filtering
export const listDocuments = query({
  args: {
    orgId: v.optional(v.union(v.string(), v.null())),
    status: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const orgId = args.orgId ?? null;

    let docs;
    if (orgId) {
      // Filter by organization
      docs = await ctx.db
        .query("documents")
        .withIndex("byOrgId", (q) => q.eq("orgId", orgId))
        .order("desc")
        .collect();
    } else {
      // Personal account - filter by userId AND ensure orgId is null/undefined
      const user = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
        .unique();

      if (!user) return [];

      docs = await ctx.db
        .query("documents")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("orgId"), undefined)) // Explicitly ensure no Org linked
        .order("desc")
        .collect();
    }

    if (args.status) {
      docs = docs.filter(d => d.status === args.status);
    }
    if (args.type) {
      docs = docs.filter(d => d.type === args.type);
    }
    return docs;
  },
});

// Get a single document by ID (for PDF generation)
export const getDocumentById = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    return await ctx.db.get(documentId);
  },
});

// Explicitly mark as signed (called on return from embedded signing)
export const markDocumentSigned = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const doc = await ctx.db.get(documentId);
    if (!doc) throw new Error("Document not found");

    await ctx.db.patch(documentId, {
      status: 'approved',
      docusign: {
        ...doc.docusign,
        status: 'signed',
        lastUpdated: Date.now()
      } as any,
      updatedAt: Date.now()
    });
  }
});