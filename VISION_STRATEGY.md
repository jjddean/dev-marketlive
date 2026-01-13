# VISION: The "MarketLive" Digital Freight Platform

This document defines the strategic vision, core philosophy, and technical requirements for the MarketLive platform. It serves as the single source of truth for all development decisions.

---

## 1. Project Objective
To construct a **Top-Tier Digital Freight Forwarding Platform** that bridges the gap between modern technology (Real-time data, Instant Pricing) and trusted usability (Simple, Intuitive UI).

**Primary Goal:** Successfully migrate the robust backend functionality of `convex-dashboard2` into a modern `clerk-react` architecture without altering the proven visual design of the original application.

---

## 2. Core Philosophy
**"Complexity in the Back, Simplicity in the Front."**

*   **The Backend** must be powerful: Handling geospatial queries, pricing algorithms, and document state machines.
*   **The Frontend** must be familiar: Utilizing a tested, simple "Box & Emoji" design system that logistics operators understand immediately, avoiding unnecessary visual clutter or "redesigns" that confuse the user.

---

## 3. Required Capabilities (The "Top Tier" Standard)

To compete with market leaders (Flexport, Forto), the application must deliver the following four pillars of value:

### Pillar A: Visibility (The "Control Tower")
*   **Requirement:** Users must see their entire supply chain at a glance.
*   **Implementation:** 
    *   A Global **Dashboard** summarizing shipment states (In Transit, Delivered).
    *   A **Real-Time Interactive Map** showing the precise location of cargo.
    *   **Live Metrics** that update without page reloads.

### Pillar B: Automation (The "Instant" Experience)
*   **Requirement:** Eliminate the "Email & Wait" cycle for pricing.
*   **Implementation:**
    *   **Instant Quoting Engine:** A form taking Origin/Dest/Weight that returns a binding price in < 2 seconds.
    *   **One-Click Booking:** Converting a Quote into a Booking seamlessly.

### Pillar C: Compliance (The "Digital Filing Cabinet")
*   **Requirement:** Centralize all trade documentation to prevent customs delays.
*   **Implementation:**
    *   Context-aware **Tasks List** (e.g., "Upload Invoice for Shipment A").
    *   Secure **File Uploads** connected directly to the shipment record.

### Pillar D: Security & Role Management
*   **Requirement:** Strict separation between Client data and Admin control.
*   **Implementation:**
    *   **Clerk Authentication** for secure, industry-standard identity management.
    *   **Role-Based Access:** Admins see all; Clients see only their own data.

---

## 4. Technical Architecture Strategy

To achieve this vision, the project employs a specific migration strategy:

1.  **The "Single Source" UI Principle**: The generic/original UI is treated as immutable. We do not "redesign" pages; we "wire" them.
2.  **The Modern Data Layer**: Replacing static JSON files with **Convex**, a real-time database that pushes updates to the client instantly.
3.  **The "Functional Clone" Outcome**: The final product is visually indistinguishable from the reference design but is technically superior, scalable, and secure.

---

## 5. Definition of Success

The project is complete when a user can perform the following **"Golden Path"** without error:
1.  **Log In** via Clerk.
2.  **Request a Quote** for 500kg from Shanghai to LA and get a price.
3.  **Book** that quote instantly.
4.  **Track** the resulting shipment on a Map.
5.  **Upload** a Commercial Invoice to clear customs.
6.  **Log Out** knowing their supply chain is under control.

---

## 6. Admin Portal Strategy (The "God Mode")
To support the platform, a full **Admin Side** (`/admin`) is required, distinct from the User Client.

### Requirements:
*   **User Management:** View/Edit/Ban users.
*   **Shipment Override:** Edit any shipment for any client (God Mode).
*   **System Config:** Manage API keys and global settings.
*   **Analytics:** Global revenue and volume tracking.

**Architecture:**
*   Protected by `role: admin` check.
*   Uses a distinct layout (e.g., Red/Dark sidebar) to prevent confusion with Client App.
