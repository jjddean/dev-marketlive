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
    },
    handler: async (ctx, args) => {
        // 1. Configuration
        const dsApi = new docusign.ApiClient();
        const dsConfig = {
            clientId: process.env.DOCUSIGN_INTEGRATION_KEY!,
            userId: process.env.DOCUSIGN_USER_ID!, // The user to impersonate
            privateKey: process.env.DOCUSIGN_PRIVATE_KEY!.replace(/\\n/g, '\n'), // Handle newlines
            basePath: "https://demo.docusign.net/restapi",
            accountId: process.env.DOCUSIGN_API_ACCOUNT_ID!
        };

        dsApi.setOAuthBasePath("account-d.docusign.com"); // Demo

        // 2. Get JWT Token
        try {
            const results = await dsApi.requestJWTUserToken(
                dsConfig.clientId,
                dsConfig.userId,
                SCOPES,
                Buffer.from(dsConfig.privateKey, "utf8"),
                3600
            );
            const accessToken = results.body.access_token;
            dsApi.addDefaultHeader("Authorization", "Bearer " + accessToken);
        } catch (e: any) {
            throw new Error(`DocuSign Auth Failed: ${e?.response?.body?.error_description || e.message}`);
        }

        // 3. Construct Envelope
        const envelopeDefinition = new docusign.EnvelopeDefinition();
        envelopeDefinition.emailSubject = "Please sign this Logistics Document";

        // Create Dummy Document if none provided
        const doc = new docusign.Document();
        doc.documentBase64 = args.documentBase64 || Buffer.from("Logistics Agreement Placeholder").toString("base64");
        doc.name = "Agreement.pdf";
        doc.fileExtension = "pdf";
        doc.documentId = "1";

        envelopeDefinition.documents = [doc];

        // Create Signer
        const signer = new docusign.Signer();
        signer.email = args.signerEmail;
        signer.name = args.signerName;
        signer.recipientId = "1";
        signer.routingOrder = "1";

        // Create Tabs (Sign Here)
        const signHere = new docusign.SignHere();
        signHere.documentId = "1";
        signHere.pageNumber = "1";
        signHere.recipientId = "1";
        signHere.tabLabel = "SignHereTab";
        signHere.xPosition = "100";
        signHere.yPosition = "100";

        signer.tabs = new docusign.Tabs();
        signer.tabs.signHereTabs = [signHere];

        envelopeDefinition.recipients = new docusign.Recipients();
        envelopeDefinition.recipients.signers = [signer];
        envelopeDefinition.status = "sent";

        // 4. Send Envelope
        const envelopesApi = new docusign.EnvelopesApi(dsApi);
        const results = await envelopesApi.createEnvelope(dsConfig.accountId, {
            envelopeDefinition
        });

        return results.envelopeId;
    },
});
