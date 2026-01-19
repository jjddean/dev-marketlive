# Implementation Plan: Visual Quote Flow

**Goal:** Replace the boring text form on `HomePage` or `ClientQuotesPage` with a "Map-First" experience.

## 1. Components to Build
### A. `VisualQuoteInput.tsx` (New Component)
- **Map Background:** Full-width Leaflet map (dimmed/overlay).
- **Floating Input Bar:** "Where From" (Origin) -> "Where To" (Destination).
- **Line Drawing:** Dynamic polyline drawing between two points as user selects them.

### B. `QuoteComparisonList.tsx` (New Component)
- **Layout:** Horizontal cards (like flight results).
- **Data:**
  - ✈️ **Air:** High Cost / Fast Speed (3 Days)
  - 🚢 **Ocean:** Low Cost / Slow Speed (35 Days)
  - 🚆 **Rail:** Mid Cost / Mid Speed (18 Days)

## 2. Page Integration
- **Target:** `src/components/home/QuoteCalculator.tsx` (or similar section on Home).
- **State Management:** Lift state up so selecting on Map updates the form.

## 3. Tech Stack
- **Map:** `react-leaflet` (already installed).
- **Icons:** `lucide-react` (Plane, Ship, TrainFront).
- **Animation:** CSS transitions for the "Flight Path" effect.

## 4. Verification
- Test: Select "London" -> "New York".
- Expect: Blue line appears on map. Cards appear below with Air ($4k) and Sea ($1.2k) options.
