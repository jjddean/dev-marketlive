# MarketLive - Master QA Test Plan
**Version:** 1.0  
**Date:** 2026-01-22  
**Objective:** Verify end-to-end functionality of MarketLive Logistics Platform.

---

## 1. Test Environment Setup
- [ ] **Database:** Clean / Fresh State (Recommended)
    - Run: `npx convex run shipments:clearAllShipments` (Optional)
- [ ] **Servers:** Running
    - Frontend: `http://localhost:5173`
    - Backend: `npx convex dev`
- [ ] **User Accounts:**
    - **User A (Shipper):** Personal email (e.g. `user@test.com`)
    - **Admin:** Special permissions account (if applicable)

---

## 2. Core User Flows (Priority Zero)

### A. The "Guest" Experience (Unauthenticated)
**Goal:** Verify a new visitor can explore rates but is forced to sign up to book.
1.  **Landing Page (`/`)**:
    *   [ ] **Map:** Verify 3D Globe renders (Mapbox).
    *   [ ] **Input:** Enter "Shanghai" -> "Los Angeles".
    *   [ ] **Search:** Click "Search Rates".
    *   [ ] **Results:** Verify 3 cards appear (Ocean, Air, Rail).
2.  **Conversion**:
    *   [ ] Click "Book Now" on Ocean Freight.
    *   [ ] **Verify:** Redirects to Sign-In/Sign-Up (Clerk).

### B. The "Shipper" Booking Flow (Authenticated)
**Goal:** Verify a logged-in user can complete a booking and pay.
1.  **Authentication**:
    *   [ ] Sign In via Clerk.
2.  **Booking Wizard**:
    *   [ ] Navigate to Home or Quotes.
    *   [ ] Initiate a Quote (Shanghai -> LA).
    *   [ ] **Form Step 1 (Details):** Fill Origin/Dest/Service.
    *   [ ] **Form Step 2 (Cargo):** Fill Weight/Dims/Value.
    *   [ ] **Form Step 3 (Options):** Select Urgency/Insurance.
    *   [ ] **Form Step 4 (Contact):** Auto-filled from profile?
    *   [ ] **Submit:** Click "Secure Booking".
3.  **Payment Processing**:
    *   [ ] **Verify:** Redirected to `/payments?quoteId=...`.
    *   [ ] **Action:** Click "Pay Now" (Stripe Mock).
    *   [ ] **Success:** Verify "Payment Successful" toast/alert.
    *   [ ] **Redirect:** Redirected to Dashboard.

### C. Shipment Management
**Goal:** Verify the user can track their newly created shipment.
1.  **Dashboard (`/dashboard`)**:
    *   [ ] **Map:** Verify the new shipment appears as a marker.
    *   [ ] **Map:** Verify Mapbox Dark Mode style.
    *   [ ] **List:** Verify shipment is listed in "Active Shipments".
2.  **Tracking Page (`/shipments`)**:
    *   [ ] **Detail View:** Click the shipment.
    *   [ ] **Timeline:** Verify events (Booked, Paid, In Transit).

---

## 3. Technical Verification

### A. Mapbox Integration
*   [ ] **Markers:** Click a marker on any map. Verify Popup shows correct Origin/Dest.
*   [ ] **Performance:** Map loads within <5 seconds.
*   [ ] **Style:** Dark mode is consistent.

### B. Emails (Integration)
*   [ ] **Welcome Email:** New signups should receive via Resend.
*   [ ] **Booking Confirmation:** User receives email upon "Secure Booking".

### C. Admin Dashboard
*   [ ] **Access:** Visit `/admin` (if authorized).
*   [ ] **Visibility:** See all user bookings globally.

---

## 4. Manual Test Script (For Today)
*Use this checklist for your session.*

- [ ] **1. Clean Slate**
    - Run `npx convex run shipments:clearAllShipments` in terminal (Optional).
- [ ] **2. Verify Home Page Map**
    - Load `http://localhost:5173`.
    - Type "Shanghai" / "Los Angeles".
    - Click "Search Rates".
    - **Pass:** "Best Routes Found" section appears with 3 pricing cards.
- [ ] **3. Book a Shipment**
    - Click "Book Layout" on the first card.
    - Fill out the form (Any dummy data).
    - Click "Secure Booking".
    - **Pass:** You are taken to the Payments page.
- [ ] **4. Verify Tracking**
    - Go to `http://localhost:5173/shipments`.
    - **Pass:** You see a map marker for the shipment you just created.
