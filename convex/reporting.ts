"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const sendShipmentReport = action({
  args: {
    shipmentId: v.string(),
    email: v.string(),
    riskScore: v.number(),
  },
  handler: async (ctx, args) => {
    const { shipmentId, email, riskScore } = args;

    // Determine Risk Level text
    let riskLevel = "Low";
    let color = "#10B981"; // Green
    if (riskScore > 40) { riskLevel = "Medium"; color = "#F59E0B"; } // Yellow
    if (riskScore > 75) { riskLevel = "High"; color = "#EF4444"; } // Red

    // Construct Email HTML
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #1e293b; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">MarketLive Logistics</h1>
        </div>
        
        <div style="padding: 32px; background-color: #ffffff;">
          <h2 style="color: #111827; margin-top: 0;">Shipment Risk Report</h2>
          <p style="color: #4b5563; font-size: 16px;">
            A detailed risk analysis has been requested for Shipment <strong>${shipmentId}</strong>.
          </p>
          
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 6px solid ${color};">
            <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Risk Assessment</p>
            <div style="display: flex; align-items: baseline; margin-top: 8px;">
              <span style="font-size: 32px; font-weight: 700; color: ${color};">${riskScore}%</span>
              <span style="margin-left: 12px; font-size: 18px; font-weight: 500; color: #374151;">${riskLevel} Risk Detected</span>
            </div>
            
            <ul style="margin-top: 16px; color: #4b5563; padding-left: 20px;">
              <li>Potential dwell time increase at destination port.</li>
              <li>Weather variance affecting current route.</li>
            </ul>
          </div>
          
          <p style="color: #4b5563;">
            We recommend monitoring this shipment closely. 
            <a href="http://localhost:8080/dashboard" style="color: #2563eb; text-decoration: none;">View Live Dashboard</a>
          </p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
          &copy; ${new Date().getFullYear()} MarketLive Logistics. All rights reserved.
        </div>
      </div>
    `;

    // Call the generic sendEmail action (internal) or simple implementation here
    // Since I can't easily call another action from an action without context madness sometimes, 
    // I'll just use the key directly here or import the function if possible.
    // Easiest: Call the generic 'email:sendEmail' if defined, or just inline the fetch here for robustness.

    // Inline Fetch for reliability in this specific action
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) throw new Error("No Resend API Key configured");

    const Response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`
      },
      body: JSON.stringify({
        from: 'MarketLive Alert <onboarding@resend.dev>', // Free tier must be this or verified domain
        to: [email],
        subject: `[Risk Alert] High Variance Detected for ${shipmentId}`,
        html: htmlContent,
      })
    });

    if (!Response.ok) {
      const errText = await Response.text();
      console.error("Resend Error:", errText);
      let message = "Failed to send email";
      try {
        message = JSON.parse(errText).message;
      } catch (e) {
        message = errText;
      }
      throw new Error(`Email Error: ${message}`);
    }

    const data = await Response.json();
    console.log("Email Sent:", data.id);
    return { success: true, id: data.id };
  },
});
