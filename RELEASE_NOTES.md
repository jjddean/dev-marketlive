# Release Notes - v0.8.0 (Beta)
**Release Date:** January 25, 2026
**Focus:** Monetization, System Stability, and UX Refinements

## 🚀 New Features

### Subscription & Billing System
- **Stripe Checkout Integration**: Seamlessly handle pro-tier subscriptions with secure Stripe Checkout sessions.
- **Tiered Pricing UI**: Users can now view and upgrade plans via the new "My Subscription" tab, featuring "Free", "Pro", and "Enterprise" tiers.
- **Automated Metadata Sync**: Subscription status (Plan Tier & Status) is now automatically synced to the organization's metadata upon successful payment, enabling instant feature provisioning.

### Logistics Management
- **Enhanced Tracking UX**: The "Pre-Pickup Protocol" checklist has been relocated to the bottom of the Shipments view, determining a more logical workflow for logistics operators.

## 🛠 System Improvements

### Error Handling & Feedback
- **Persistent Feedback**: Payment redirection toasts now persist during page transitions, providing users with assurance that the process is active.
- **Detailed Error Reporting**: Failed checkout attempts now expose specific API error messages (e.g., Invalid Key, Configuration Mismatch) to the UI, drastically reducing debugging time for administrators.

### Infrastructure
- **Dependency Optimization**: Resolved typing conflicts in Stripe API integrations (`convex/subscriptions.ts`) to ensure robust build stability.
- **Environment Validation**: Added explicit checks for Stripe Secret Keys in cloud environments to prevent silent failures in production.

## 🐛 Bug Fixes
- **Crash Resolution**: Fixed a critical `ReferenceError` on the Payments Page that caused the UI to crash due to a missing icon import.
- **Stability**: Patched potential race conditions in the subscription upgrade flow. 
