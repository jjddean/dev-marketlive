# Implement Custom Subscription Tab

## Goal Description
Replace the placeholder in the "My Subscription" tab of the Payments page with a custom UI that allows users to upgrade their plan (Free, Pro, Enterprise). This involves a frontend component and a backend mutation to create Stripe checkout sessions.

## User Review Required
- **Stripe Price IDs**: The code currently uses placeholder IDs (`price_1Pro...`). These will need to be replaced with actual Stripe Price IDs in production.
- **Environment URLs**: The callback URLs use `process.env.VITE_APP_URL`. Ensure this environment variable is set or defaults to localhost.

## Proposed Changes

### convex
#### [NEW] [clerk.ts](file:///c:/Users/jason/Desktop/marketlive-clone/convex/clerk.ts)
- Initialize Clerk Backend SDK.
- Export `clerk` client.

#### [MODIFY] [payments.ts](file:///c:/Users/jason/Desktop/marketlive-clone/convex/payments.ts)
- Import `clerk` from `./clerk`.
- In `completeSubscription`, fetch the user's `orgId`.
- Call `clerk.organizations.updateOrganizationMetadata`.

#### [NEW] [subscriptions.ts](file:///c:/Users/jason/Desktop/marketlive-clone/convex/subscriptions.ts)
- Implement `createCheckoutSession` mutation.
- Import `stripe` from `./stripe`.
- Handle success/cancel URLs.

### src/hooks
#### [NEW] [useFeature.ts](file:///c:/Users/jason/Desktop/marketlive-clone/src/hooks/useFeature.ts)
- Implement `useFeature` hook using `useOrganization`.
- Define feature flags map (e.g., `UNLIMITED_SHIPMENTS`, `API_ACCESS`).
- Return boolean based on `organization.publicMetadata.subscriptionTier`.

### src/pages
#### [MODIFY] [ShipmentsPage.tsx](file:///c:/Users/jason/Desktop/marketlive-clone/src/pages/ShipmentsPage.tsx)
- Use `useFeature('UNLIMITED_SHIPMENTS')`.
- Gate the "New Shipment" button or show upgrade prompt if limit reached.

### src/pages
#### [MODIFY] [PaymentsPage.tsx](file:///c:/Users/jason/Desktop/marketlive-clone/src/pages/PaymentsPage.tsx)
- Add `MySubscription` component logic (either inline or as a sub-component).
- Integrate `api.subscriptions.createCheckoutSession`.
- Render the pricing cards as requested.

## Verification Plan
### Manual Verification
1.  Navigate to the "Payments" page.
2.  Click on the "My Subscription" tab.
3.  Click "Switch to Pro".
4.  Verify that it attempts to redirect to a Stripe Checkout URL (mocked or real if keys are set).
