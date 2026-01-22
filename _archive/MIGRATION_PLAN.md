# Zero-Regression Migration Plan: "One App" Architecture

This plan establishes the standard operating procedure for migrating the **MarketLive** application from a mock-data frontend to a fully connected full-stack application using Convex.

**Core Philosophy:**
> **"The UI is Sacred."**
> We migrate logic *underneath* the UI. We do not refactor components, change styles, or alter layout unless absolutely necessary for data display. If the UI shifts, we revert.

---

## 🏗️ Architecture

*   **Frontend**: Vite + React + Tailwind (Root directory)
*   **Backend**: Convex (located in `/convex`)
*   **Auth**: Clerk (Integrated with Convex)
*   **Deployment**: One unified repository.

---

## ✅ Current Status

*   [x] **Backend Ported**: All Convex functions (`shipments.ts`, `quotes.ts`, etc.) moved from `convex-dashboard2` to local `/convex`.
*   [x] **Auth Configured**: `ConvexProviderWithClerk` wraps the app in `src/App.tsx`.
*   [x] **Dashboard Wired**: `DashboardPage.tsx` is connected to `api.shipments.listShipments` with a fallback to hardcoded data.

---

## 📅 Execution Roadmap

### Phase 1: Verification (Immediate)
Before moving to other pages, we must prove the data pipeline works.
1.  **Verify Auth**: Confirm a user can sign in via Clerk and get a valid token.
2.  **Verify Data Flow**: Confirm `useQuery` behaves correctly (returns `undefined` -> `[]` -> `Data`).
3.  **Verify Fallback**: Ensure the hardcoded data still displays if the user has no personal data yet.

### Phase 2: Systematic Page Wiring
We will go page-by-page. For each page, we follow the **"Surgical Swap"** protocol.

#### Priority 1: `ShipmentsPage.tsx`
*   **Target**: Replace mock `allShipments` array.
*   **Action**: Import `api.shipments.listShipments`.
*   **Logic**:
    ```typescript
    // BEFORE
    const shipments = MOCK_DATA;
    
    // AFTER
    const liveShipments = useQuery(api.shipments.listShipments);
    const shipments = liveShipments || MOCK_DATA;
    ```

#### Priority 2: `ClientQuotesPage.tsx` / `NewQuotePage.tsx`
*   **Target**: Quote submission and history.
*   **Action**: Wire `api.quotes.create` mutation to the form.
*   **Action**: Wire `api.quotes.list` to the history table.

#### Priority 3: Admin & Analytics
*   **Target**: `ReportsPage.tsx` and Carrier integrations.
*   **Action**: Connect backend analytics queries.

---

## 🛠️ The "Surgical Swap" Protocol

When working on a file, follow these exact steps to prevent breakage:

1.  **Read**: Open the file and find the hardcoded data variable (e.g., `const recentShipments = [...]`).
2.  **Import**: Add imports at the top *only*:
    ```typescript
    import { useQuery } from "convex/react";
    import { api } from "../../convex/_generated/api";
    ```
3.  **Fetch**: Add the `useQuery` hook at the top of the component.
4.  **Swap**: Update the variable assignment to use the live data if available, falling back to the hardcoded data.
    *   *Critical*: Ensure mapped field names match (e.g., if backend says `_id` but UI expects `id`, map it).
5.  **Verify**: Check the browser. If the page yields a white screen or layout shift, **UNDO**.

---

## 🚨 Rules of Engagement

1.  **No Refactoring**: Do not "clean up" CSS or change component structures "while we're at it."
2.  **Typesafe**: Use Convex's generated API types to ensure data consistency.
3.  **Fallback First**: Always keep the hardcoded data as a fallback to ensure the app looks perfect even without a database connection.
