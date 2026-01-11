import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Automated Workflows
 * Triggers automatic actions based on data changes
 */

// Auto-send email when shipment status changes
export const onShipmentStatusChange = internalMutation({
    args: {
        shipmentId: v.string(),
        oldStatus: v.string(),
        newStatus: v.string(),
        userEmail: v.optional(v.string()),
    },
    handler: async (ctx, { shipmentId, oldStatus, newStatus, userEmail }) => {
        // Only send email if status actually changed
        if (oldStatus === newStatus) return;

        // Get shipment details
        const shipment = await ctx.db
            .query("shipments")
            .filter((q) => q.eq(q.field("shipmentId"), shipmentId))
            .first();

        if (!shipment) return;

        // Determine email recipient
        let recipientEmail = userEmail;
        if (!recipientEmail && shipment.userId) {
            const user = await ctx.db.get(shipment.userId);
            recipientEmail = user?.email;
        }

        if (!recipientEmail) return;

        // Send status update email
        const emailSubject = `Shipment ${shipmentId} Status Update: ${newStatus}`;
        const emailBody = `
      <h2>Shipment Status Update</h2>
      <p>Your shipment <strong>${shipmentId}</strong> status has been updated.</p>
      
      <table style="border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Previous Status:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${oldStatus}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>New Status:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${newStatus}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Origin:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${shipment.shipmentDetails?.origin || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Destination:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${shipment.shipmentDetails?.destination || 'N/A'}</td>
        </tr>
      </table>
      
      <p>Track your shipment at: <a href="${process.env.VITE_APP_URL || 'http://localhost:8080'}/shipments">View Shipments</a></p>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated notification from MarketLive.
      </p>
    `;

        try {
            await ctx.scheduler.runAfter(0, internal.email.sendEmail, {
                to: recipientEmail,
                subject: emailSubject,
                html: emailBody,
            });

            console.log(`✅ Scheduled status change email for ${shipmentId}: ${oldStatus} → ${newStatus}`);
        } catch (error) {
            console.error(`❌ Failed to schedule email for ${shipmentId}:`, error);
        }
    },
});

// Auto-generate invoice when booking is confirmed
export const onBookingConfirmed = internalMutation({
    args: {
        bookingId: v.id("bookings"),
    },
    handler: async (ctx, { bookingId }) => {
        const booking = await ctx.db.get(bookingId);
        if (!booking) return;

        // Check if invoice already exists
        const existingInvoice = await ctx.db
            .query("invoices")
            .filter((q) => q.eq(q.field("bookingId"), bookingId))
            .first();

        if (existingInvoice) {
            console.log(`Invoice already exists for booking ${bookingId}`);
            return;
        }

        // Generate invoice
        const invoiceNumber = `INV-${Date.now()}`;
        const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

        // Calculate amount (use quote price if available, otherwise estimate)
        let amount = 1000; // Default
        if (booking.quoteId) {
            const quote = await ctx.db
                .query("quotes")
                .filter((q) => q.eq(q.field("quoteId"), booking.quoteId))
                .first();

            if (quote?.quotes?.[0]?.price?.amount) {
                amount = quote.quotes[0].price.amount;
            }
        }

        const invoice = await ctx.db.insert("invoices", {
            invoiceNumber,
            bookingId,
            customerId: booking.userId,
            amount,
            currency: "USD",
            status: "pending",
            dueDate: dueDate.toISOString(),
            items: [
                {
                    description: `Shipping Service - ${booking.pickupDetails?.address || 'Origin'} to ${booking.deliveryDetails?.address || 'Destination'}`,
                    quantity: 1,
                    unitPrice: amount,
                    total: amount,
                },
            ],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        console.log(`✅ Auto-generated invoice ${invoiceNumber} for booking ${bookingId}`);

        // Send invoice email to customer
        if (booking.customerDetails?.email) {
            const emailSubject = `Invoice ${invoiceNumber} - MarketLive`;
            const emailBody = `
        <h2>New Invoice</h2>
        <p>An invoice has been generated for your booking.</p>
        
        <table style="border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Invoice Number:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">$${amount.toFixed(2)} USD</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Due Date:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${dueDate.toLocaleDateString()}</td>
          </tr>
        </table>
        
        <p>View and pay your invoice at: <a href="${process.env.VITE_APP_URL || 'http://localhost:8080'}/payments">View Invoices</a></p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated notification from MarketLive.
        </p>
      `;

            try {
                await ctx.scheduler.runAfter(0, internal.email.sendEmail, {
                    to: booking.customerDetails.email,
                    subject: emailSubject,
                    html: emailBody,
                });

                console.log(`✅ Scheduled invoice email for ${invoiceNumber}`);
            } catch (error) {
                console.error(`❌ Failed to schedule invoice email:`, error);
            }
        }

        return invoice;
    },
});

// Auto-welcome email for new users
export const onUserCreated = internalMutation({
    args: {
        userId: v.id("users"),
        email: v.string(),
        name: v.optional(v.string()),
    },
    handler: async (ctx, { userId, email, name }) => {
        const emailSubject = "Welcome to MarketLive!";
        const emailBody = `
      <h2>Welcome to MarketLive${name ? `, ${name}` : ''}!</h2>
      <p>Thank you for joining our freight forwarding platform.</p>
      
      <h3>Get Started:</h3>
      <ul>
        <li><strong>Request a Quote:</strong> Get instant shipping quotes for your cargo</li>
        <li><strong>Track Shipments:</strong> Monitor your shipments in real-time on our 3D globe</li>
        <li><strong>Manage Documents:</strong> Upload and share shipping documents securely</li>
        <li><strong>View Invoices:</strong> Access all your invoices and payment history</li>
      </ul>
      
      <p style="margin-top: 30px;">
        <a href="${process.env.VITE_APP_URL || 'http://localhost:8080'}/dashboard" 
           style="background-color: #003057; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Go to Dashboard
        </a>
      </p>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        Need help? Contact our support team anytime.
      </p>
    `;

        try {
            await ctx.scheduler.runAfter(0, internal.email.sendEmail, {
                to: email,
                subject: emailSubject,
                html: emailBody,
            });

            console.log(`✅ Scheduled welcome email for ${email}`);
        } catch (error) {
            console.error(`❌ Failed to schedule welcome email:`, error);
        }
    },
});
