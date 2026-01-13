# Master Verification Checklist

We will verify these pages one by one.

## 1. Global Features
- [x] **Global Search Bar (Command + K)**
    - [x] Backend Function (`api.search.globalSearch`) - *Disabled*
    - [x] Frontend Component (`CommandMenu`) - *REMOVED from App.tsx*

## 2. Public Pages (Marketing)
- [x] **Home** (`/`)
- [ ] **Services** (`/services`)
- [ ] **Solutions** (`/solutions`)
- [ ] **Platform** (`/platform`)
- [ ] **Resources** (`/resources`)
- [ ] **About** (`/about`)
- [ ] **Contact** (`/contact`)
- [ ] **API Docs** (`/api`)

## 3. Protected Pages (App)
- [ ] **Dashboard** (`/dashboard`)
- [ ] **Quotes** (`/quotes`)
- [ ] **Bookings** (`/bookings`)
- [ ] **Shipments** (`/shipments`)
- [ ] **Documents** (`/documents`)
    - [ ] List View
    - [ ] Create Document
    - [ ] DocuSign Integration (Code added, Verification Paused)
- [ ] **Compliance** (`/compliance`)
- [ ] **Payments** (`/payments`)
- [ ] **Reports** (`/reports`)
- [ ] **Account** (`/account`)

## 4. Other
- [ ] **Shared Document View** (`/shared/:token`)

---
**Current Focus:** Verification of Protected Pages (Starting with Documents).
