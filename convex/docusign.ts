// @ts-nocheck
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import docusign from "docusign-esign";

const SCOPES = ["signature", "impersonation"];

export const sendEnvelope = action({
    args: {
        documentId: v.string(),
        signerName: v.string(),
        signerEmail: v.string(),
        documentBase64: v.optional(v.string()), // If uploading a real file
        returnUrl: v.optional(v.string()), // Allow client to specify return URL (localhost vs prod)
    },
    handler: async (ctx, args) => {
        // 1. Configuration - Robust Key Handling
        let privateKey = process.env.DOCUSIGN_PRIVATE_KEY || "";

        // Prefer Base64 key if available (Fixes Cloud Env Newline Issues)
        if (process.env.DOCUSIGN_PRIVATE_KEY_B64) {
            try {
                privateKey = Buffer.from(process.env.DOCUSIGN_PRIVATE_KEY_B64, 'base64').toString('utf-8');
            } catch (e) {
                console.error("Failed to decode DOCUSIGN_PRIVATE_KEY_B64");
            }
        } else {
            // Fallback to standard replace
            privateKey = privateKey.replace(/\\n/g, '\n');
        }

        const dsConfig = {
            clientId: process.env.DOCUSIGN_INTEGRATION_KEY!,
            userId: process.env.DOCUSIGN_USER_ID!,
            privateKey: privateKey,
            accountId: process.env.DOCUSIGN_API_ACCOUNT_ID!
        };

        if (!dsConfig.clientId || !dsConfig.userId || !dsConfig.privateKey) {
            throw new Error("Missing DocuSign Configuration variables (INTEGRATION_KEY, USER_ID, or PRIVATE_KEY_B64)");
        }

        const dsApi = new docusign.ApiClient();
        dsApi.setOAuthBasePath("account-d.docusign.com");

        // 2. Authenticate & Discover Base URI
        try {
            console.log("Attempting DocuSign JWT Auth...");
            const results = await dsApi.requestJWTUserToken(
                dsConfig.clientId,
                dsConfig.userId,
                SCOPES,
                Buffer.from(dsConfig.privateKey, "utf8"),
                3600
            );
            const accessToken = results.body.access_token;
            dsApi.addDefaultHeader("Authorization", "Bearer " + accessToken);

            const userInfo = await dsApi.getUserInfo(accessToken);
            const account = userInfo.accounts.find((a: any) => a.accountId === dsConfig.accountId) || userInfo.accounts[0];
            const baseUri = account.baseUri + "/restapi";

            console.log(`Using Base URI: ${baseUri}`);
            dsApi.setBasePath(baseUri);

        } catch (e: any) {
            console.error("DocuSign Auth Error:", JSON.stringify(e?.response?.body || e));
            throw new Error(`DocuSign Auth Failed: ${e.message}`);
        }

        // 3. Construct Envelope (Embedded)
        try {
            const envelopeDefinition = new docusign.EnvelopeDefinition();
            envelopeDefinition.emailSubject = "Please sign this Logistics Document";
            envelopeDefinition.status = "sent";

            // Helper: Clean Base64 (remove data URI prefix)
            let base64Content = args.documentBase64 || "";
            if (base64Content.includes(",")) {
                base64Content = base64Content.split(",")[1];
            }

            // Fallback: Valid Minimal PDF (Hello World) if no document provided
            if (!base64Content) {
                base64Content = "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCiAgICA+PgogID4+CiAgL0NvbnRlbnRzIDUgMCBSCj4+CmVuZG9iagokNCAwIG9iago8PAogIC9UeXBlIC9Gb250CiAgL1N1YnR5cGUgL1R5cGUxCiAgL0Jhc2VGb250IC9UaW1lcy1Sb21hbgo+PgplbmRvYmoKCjUgMCBvYmoKPDwgL0xlbmd0aCA0NCA+PgpzdHJlYW0KQlQKNzAgNTAgVEQKL0YxIDEyIFRmCihIZWxsbywgRG9jdVNpZ24hKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCgp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTAgMDAwMDAgbiAKMDAwMDAwMDA2MCAwMDAwMCBuIAowMDAwMDAwMTE0IDAwMDAwIG4gCjAwMDAwMDAyMjUgMDAwMDAgbiAKMDAwMDAwMDMxMiAwMDAwMCBuIAp0cmFpbGVyCjw8CiAgL1NpemUgNgogIC9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MDYKJSVFT0YK";
            }

            const doc = new docusign.Document();
            doc.documentBase64 = base64Content;
            doc.name = "Agreement.pdf";
            doc.fileExtension = "pdf";
            doc.documentId = "1";
            envelopeDefinition.documents = [doc];

            const signer = new docusign.Signer();
            signer.email = args.signerEmail;
            signer.name = args.signerName;
            signer.recipientId = "1";
            signer.routingOrder = "1";
            // IMPORTANT: clientUserId enables Embedded Signing (no email sent)
            signer.clientUserId = args.signerEmail;

            const signHere = new docusign.SignHere();
            signHere.documentId = "1";
            signHere.pageNumber = "1";
            signHere.recipientId = "1";
            signHere.xPosition = "100";
            signHere.yPosition = "100";

            signer.tabs = new docusign.Tabs();
            signer.tabs.signHereTabs = [signHere];

            const recipients = new docusign.Recipients();
            recipients.signers = [signer];
            envelopeDefinition.recipients = recipients;

            // 4. Send Envelope
            console.log("Creating Envelope...");
            const envelopesApi = new docusign.EnvelopesApi(dsApi);
            const envelopeSummary = await envelopesApi.createEnvelope(dsConfig.accountId, {
                envelopeDefinition
            });
            const envelopeId = envelopeSummary.envelopeId;
            console.log("Envelope Created:", envelopeId);

            // 5. Generate Recipient View (Embedded Signing URL)
            console.log("Generating Recipient View...");
            const viewRequest = new docusign.RecipientViewRequest();
            // Use client-provided URL or fallback to localhost default
            viewRequest.returnUrl = args.returnUrl || "http://localhost:5173/documents?event=signing_complete";
            viewRequest.authenticationMethod = "none";
            viewRequest.email = args.signerEmail;
            viewRequest.userName = args.signerName;
            viewRequest.clientUserId = args.signerEmail; // Must match signer above

            const viewUrl = await envelopesApi.createRecipientView(dsConfig.accountId, envelopeId, {
                recipientViewRequest: viewRequest
            });

            console.log("Signing URL: ", viewUrl.url);

            // Return BOTH ID and URL for the frontend
            return {
                envelopeId: envelopeId,
                signingUrl: viewUrl.url
            };

        } catch (e: any) {
            console.error("DocuSign Operation Failed:", JSON.stringify(e?.response?.body || e, null, 2));
            throw new Error(`DocuSign Error: ${e?.response?.body?.message || e.message}`);
        }
    },
});
