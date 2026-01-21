import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get current KYC status for the user
export const getKycStatus = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("kycVerifications")
            .withIndex("byUserId", (q) => q.eq("userId", identity.subject))
            .first();
    },
});

// Start or resume KYC process
export const startKyc = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const existing = await ctx.db
            .query("kycVerifications")
            .withIndex("byUserId", (q) => q.eq("userId", identity.subject))
            .first();

        if (existing) return existing._id;

        const user = await ctx.db
            .query("users")
            .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
            .unique();

        return await ctx.db.insert("kycVerifications", {
            userId: identity.subject,
            orgId: user?.orgId,
            status: "draft",
            step: 1,
            documents: [],
        });
    },
});

// Update Step 1: Business Details
export const updateKycDetails = mutation({
    args: {
        id: v.id("kycVerifications"),
        companyName: v.string(),
        registrationNumber: v.string(),
        vatNumber: v.string(),
        country: v.string(),
    },
    handler: async (ctx, args) => {
        // In prod: verify user owns this record
        await ctx.db.patch(args.id, {
            companyName: args.companyName,
            registrationNumber: args.registrationNumber,
            vatNumber: args.vatNumber,
            country: args.country,
            step: 2 // Move to next step
        });
    },
});

// Update Step 2: Add Document
export const addKycDocument = mutation({
    args: {
        id: v.id("kycVerifications"),
        type: v.string(),
        fileUrl: v.string(),
        fileId: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const kyc = await ctx.db.get(args.id);
        if (!kyc) throw new Error("Record not found");

        const newDocs = [...kyc.documents, {
            type: args.type,
            fileUrl: args.fileUrl,
            fileId: args.fileId,
            uploadedAt: Date.now()
        }];

        await ctx.db.patch(args.id, {
            documents: newDocs
        });
    }
});

// Submit for Review
export const submitKyc = mutation({
    args: { id: v.id("kycVerifications") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: "submitted",
            submittedAt: Date.now(),
            step: 3
        });

        // AUDIT LOG
        const identity = await ctx.auth.getUserIdentity();
        if (identity) {
            await ctx.db.insert("auditLogs", {
                action: "kyc.submitted",
                entityType: "kyc",
                entityId: args.id,
                userId: identity.subject,
                timestamp: Date.now()
            });
        }
    }
});
