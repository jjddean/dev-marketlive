# Development Diary & Project History

This log documents the major stages of development for the Clearrship / MarketLive application.

## Phase 1: Foundation & Infrastructure (Completed)
**Goal:** Establish the core application shell, database connection, and authentication.
- [x] **Project Setup**: Initialized Vite + React + TypeScript environment.
- [x] **Database**: Connected to Convex backend.
- [x] **Authentication**: Integrated Clerk for user and organization management (Multi-tenancy).
- [x] **Basic UI**: Implemented TailwindCSS and Shadcn UI components.
- [x] **Navigation**: Built responsive App Sidebar and Drawer navigation.

## Phase 2: Core Logistics Features (Completed)
**Goal:** Implement the primary business logic for shipping and freight.
- [x] **Quotes System**:
  - Built `QuotesPage` for generating shipping estimates.
  - Implemented `createQuote` and `getQuotes` mutations/queries.
  - Added PDF generation for quotes.
- [x] **Bookings Flow**:
  - Developed end-to-end booking wizard (Origin -> Destination -> Cargo).
  - Integrated "Secure Booking" payment intent logic.
- [x] **Shipments Tracking**:
  - Created `ShipmentsPage` with "Active" and "Completed" tabs.
  - Integrated Mapbox for `LiveVesselMap` visualization.
  - Added "Pre-Pickup Protocol" checklist for driver compliance.
  - Implemented `sendShipmentReport` via Resend API for email updates.

## Phase 3: Compliance & Security (Completed)
**Goal:** Ensure regulatory compliance and application security.
- [x] **KYC Verification**:
  - Implemented `CompliancePage` with minimal upload interface.
  - Created `ComplianceKycModal` for document collection.
  - Wired backend storage for identity documents.
- [x] **Security Patching**:
  - Upgraded `react-router-dom` to v6.30.3 to resolve XSS vulnerabilities.
  - Audited dependencies via `npm audit`.

## Phase 4: Admin Portal Expansion (Completed)
**Goal:** Provide internal tools for managing the platform.
- [x] **Admin Dashboard**:
  - Refactored Admin Sidebar with collapsible groups.
  - Created dedicated pages: `AdminApprovalsPage`, `AdminFinancePage`, `AdminAuditPage`.
- [x] **SOP Implementation**:
  - Wired "Suspend Organization" actions in `AdminCustomersPage`.
  - Wired "Flag Shipment Risk" actions in `AdminShipmentsPage`.

## Phase 5: Marketing & Growth (Completed)
**Goal:** Build public-facing assets to attract users.
- [x] **Waitlist System**:
  - Created `WaitlistPage` with email capture.
  - Integrated `joinWaitlist` mutation combined with Welcome Email drip (Resend).
- [x] **Interactive Home**:
  - Built 3D visual route map for the landing page hero section.

## Phase 6: Monetization & Subscriptions (Current - v0.8.0 Beta)
**Goal:** Implement recurring billing and feature gating.
- [x] **Stripe Integration**:
  - Set up `createCheckoutSession` for utilizing Stripe Hosted Checkout.
  - Configured environment variables (`STRIPE_SECRET_KEY`) for payments.
- [x] **Subscription UI**:
  - Added "My Subscription" tab to `PaymentsPage` with Pricing Cards.
  - Implemented "Switch to Pro" upgrade flow.
- [x] **Metadata Sync**:
  - Configured Webhook/Callback logic to sync `subscriptionTier` to Clerk Organization Metadata.
- [x] **Feature Gating**:
  - Created `useFeature` hook to check permissions.
  - Gated `ShipmentsPage` (New Shipment button) for non-Pro users.
  - Gated "Predictive Insights" (Shipments), "Custom Reports" (Reports), "AI Compliance" (Compliance), and "API Keys" (ApiDocs).
  - Implemented Fallback UI with blurred/locked states.
- [x] **Personal Subscriptions**:
  - Enabled "Pro" upgrades for individual users (Personal Metadata Fallback).
  - Updated backend (`payments.ts`) to handle non-org users.
  - Updated frontend (`useFeature.ts`) to support personal entitlements.
- [x] **UX Polish**:
  - Updated all "Upgrade" links to deep-link to `/payments?tab=subscription`.
  - Fixed build error in `CompliancePage` (missing import).

  - [x] **Usage Limits**:
  - Updated Schema: Added `subscriptionTier` to `organizations` table.
  - Backend Enforcement: Blocked creation of >5 shipments/month for "Free" users in `shipments.ts`.
  - Sync Logic: Updated `stripe.ts` webhooks to keep local DB in sync with subscription changes.

## Future Roadmap (Planned)

- [ ] **Advanced Analytics**: Reporting dashboard for Pro users.
- [ ] **Mobile App**: React Native or PWA adaptation.
