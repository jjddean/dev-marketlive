"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

export const sendWelcomeEmail = action({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
        referralCode: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Check for API Key
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            console.warn("RESEND_API_KEY is not set. Skipping email send.");
            return;
        }

        const resend = new Resend(resendApiKey);

        // 2. Prepare Template
        // Simple HTML template for now. In a real app, use React Email.
        const referralLink = `https://marketlive.app/access?ref=${args.referralCode || ""}`;

        const htmlContent = `
      <div style="font-family: sans-serif; color: #333;">
        <h1 style="color: #003057;">Welcome to MarketLive! 🚀</h1>
        <p>You're on the list. We're building the future of logistics, and we're glad to have you with us.</p>
        
        <div style="background-color: #f4f6f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #555;">Your Position & Access</p>
          <p style="margin-top: 10px;">You are now in the queue. Want to skip the line?</p>
          <p>Share your unique referral link to unlock early access:</p>
          <a href="${referralLink}" style="color: #003057; font-weight: bold;">${referralLink}</a>
        </div>

        <p>We'll be in touch soon with your access credentials.</p>
        <p>Best,<br/>The MarketLive Team</p>
      </div>
    `;

        // 3. Send Email
        try {
            const data = await resend.emails.send({
                from: "MarketLive <onboarding@resend.dev>", // Default Resend test domain
                to: args.email,
                subject: "You're on the list! 🚀",
                html: htmlContent,
            });
            console.log("Email sent successfully:", data);
        } catch (error) {
            console.error("Failed to send email:", error);
            // We don't throw here to avoid failing the mutation call if it was called directly,
            // though typically this is run as a side effect.
        }
    },
});
