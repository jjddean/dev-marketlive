# 🚀 Phase 2: Polish & Stability (Tomorrow's Plan)

## � Critical Bugs (Priority 1)
- [ ] **Admin Authentication**: 
  - [ ] verify `AdminRoute` protection (user reported "protected sign in not work").
  - [ ] Ensure explicit Admin Login flow exists and is accessible.
- [ ] **Payment View Button**: 
  - [ ] Fix the "View" button in `PaymentsPage`. Replace current `alert()` with a proper Modal/Dialog displaying detailed invoice items.
- [ ] **Document Signatures**:
  - [ ] Investigate DocuSign flow ("i dont remember signing docs"). Verify the `Send for Signature` button actually triggers the envelope and handles the redirect callback.

## 🟡 UX & Stability (Priority 2)
- [ ] **Payment Flow Transition**: 
  - [ ] Make "Pay Now" open in a new tab (`target="_blank"`) to prevent losing app state/context, as requested.
- [ ] **Page Transitions**: 
  - [ ] Address "app jumps" and "transition not good". Implement smooth layout transitions (e.g., `framer-motion` or CSS transitions between routes).
- [ ] **UI Polish**:
  - [ ] "ui needs editing" - Review padding, consistency, and mobile responsiveness.
  - [ ] "buttons not configed thru out app" - Audit all buttons for consistent styling (Primary vs Secondary) and hover states.

## � Feature Gaps (Priority 3)
- [ ] **Auto-Invoicing**: Ensure `createBooking` automatically generates a corresponding pending invoice record.
- [ ] **Document Auto-Creation**: Trigger B/L generation instantly upon Booking Confirmation.

---

## ✅ Completed in Phase 1 (Today)
- [x] **Core Payments**: Hybrid Model (Subscription + One-Time Invoice) connected to Stripe.
- [x] **Export**: CSV Export for Invoices verified.
- [x] **Tracking**: Leaflet-based Geospatial Map functioning.
- [x] **Booking**: Basic Quote-to-Booking flow with Email Notifications.
- [x] **Documents**: Templates created for print/PDF.
