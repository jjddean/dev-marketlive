# 🚧 Upcoming Feature Roadmap

The following features are planned for future development.

## 💸 Phase 2: Financial Operations
**Goal:** Robust invoicing and payment collection.
- [ ] **Convex Backend**: Ensure `paymentAttempts` logic mirrors the reference app's robust schema.
- [ ] **Stripe Webhooks**: Implement server-side `checkout.session.completed` webhook to confirm payments if client redirect fails.
- [ ] **Invoicing**: Generate PDF invoices dynamically.

## 🗺️ Phase 3: Interactive Operations (Map Enhancements)
**Goal:** Real-time visibility.
- [ ] **Live Vessel Tracking**: Replace CSS animations in `LiveVesselMap` with real AIS data or Mapbox paths.
- [ ] **Coordinate Precision**: Replace static `CITY_COORDS` mapping with real-time Geocoding or GPS updates from the backend.

## 🔍 Phase 4: Global Search & Navigation
**Goal:** Enterprise-grade usability.
- [ ] **Cmd+K Palette**: Implement a global command menu to jump to Shipments, Bookings, or Customers.
- [ ] **Vector Search**: Use Convex to search shipment manifests semantically.

## 📡 Phase 5: Client Portal
**Goal:** External customer experience.
- [ ] **Quote-to-Booking Flow**: Ensure external clients can request a quote and convert it to a booking seamlessly.
- [ ] **Status Updates**: Email notifications via SendGrid/Resend when Shipment status changes.

## 🛡️ Phase 7: Compliance & Security
**Goal:** Accountability and audit trails.
- [ ] **Shipment Audit Log**: Track all changes to shipment fields (User, Timestamp, Old Value -> New Value).
- [ ] **History Tab**: UI in Shipment Details to view the audit log timeline.
