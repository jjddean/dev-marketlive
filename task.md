# Tasks

# Tasks

- [x] Verify AI Browser functionality
    - [x] Run a simple browser subagent test
    - [x] Analyze failure or success
- [x] Verify Localhost Connectivity
    - [x] Attempt to access default Vite port (5173)
    - [x] Diagnose connection issues
- [x] Refine Payment UX (Sidebar/Drawer)
    - [x] Fix "Pay Now" button jumps (PaymentsPage)
    - [x] Standardize payment logic (useStripeCheckout)
    - [x] Align Booking Drawer UI with Quotes style
    - [x] Fix "Calculated at Checkout" text wrapping
    - [x] Update button color to App Blue (Primary)
- [x] Implement Payment Confirmation Logic
    - [x] Create confirmBookingPayment mutation
    - [x] Handle invoice_id redirect in PaymentsPage
    - [x] Rename button to "Secure Booking"

# System Architect Inspection: End-to-End Booking Flow
- [x] Analyze Codebase for Flow Logic
    - [x] Identify Payment/Stripe implementation details
    - [x] Identify Email/Notification triggers (Alerts, Emails)
    - [x] Determine "Success" states in DB (Convex)
- [ ] Execute End-to-End Browser Test
    - [x] Generate Quote
    - [x] Select Rate
    - [x] Complete Booking Form
    - [x] Process Payment (Verified Manually by User)
    - [x] Verify UI Success Alert
- [ ] Verify System State
    - [ ] Check Admin Dashboard for new booking
    - [ ] Verify "Paid" status
    - [ ] Check Email Confirmation (Audit Logs)

- [ ] **Execute MASTER_TEST_PLAN.md**
    - [ ] 1. Core User Flows (Guest -> Shipper -> Payment)
    - [ ] 2. Technical Verification (Mapbox, Email, Admin)
    - [ ] 3. Manual Test Script (User Led)

# KYC Verification Implementation
- [x] Implement KYC Verification Modal
    - [x] Create `kycVerifications` table in `convex/schema.ts`
    - [x] Create backend logic (`compliance.ts`, `upload.ts`)
    - [x] Create frontend `ComplianceKycModal` component
    - [x] Integrate into `CompliancePage.tsx`
    - [x] Verify Modal functionality


# Marketing System (Phase 1: Trust Landing Page)
- [x] Backend: `waitlist` schema table
- [x] Backend: `joinWaitlist` mutation
- [x] Frontend: Basic `WaitlistPage.tsx`
- [x] Integration: `/access` route
- [x] Deployment: Push Basic Version to Vercel
- [x] **Hero**: Interactive Visual Quote Map (Mapbox)
    - [x] Create `InteractiveHero` component (Refactored `VisualQuoteInput` to Mapbox)
    - [x] Wire up "Mock" quotes on route selection
- [x] **Trust**: Value Prop Cards & "Wall of Love" placeholder
- [x] **Data**: Capture extra fields (Company Name)
- [-] **Marketing**: Video Diary Features (Skipped by user)
- [x] **Email**: Resend Integration (Welcome Drip)
    - [x] Install `resend` package in Convex
    - [x] Create `convex/emails.ts` action (sendWelcomeEmail)
    - [x] Create Email Template (HTML)
    - [x] Wire `scheduler.runAfter` in `joinWaitlist`
- [x] **Documentation**:
    - [x] Create `marketing_plan.md` (Value Prop & "Why Us")
    - [x] Create `app_features.md` (Hidden Gems & Screenshots)



# Internal API System (Client Access)
- [x] Implement API Key System
    - [x] Create `apiKeys` schema table
    - [x] Create `convex/developer.ts` (generate, list, revoke)
    - [x] Update `ApiDocsPage.tsx` with Management UI


