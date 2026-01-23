# Design & UI Rules for New Pages

Whenever you create a new page component in `src/pages/`, you **MUST** follow these structural rules to ensure consistency with the existing dashboard.

## 1. Page Structure
Every page should follow a consistent hierarchy, though headers may vary:
```tsx
<div className="min-h-screen bg-gray-50">
  {/* Header Component (MediaCardHeader OR Standard Header) */}
  <div className="px-4 sm:px-6 lg:px-8 py-8">
     {/* Content Here */}
  </div>
</div>
```

## 2. Mandatory Components
*   **Header**: Use `MediaCardHeader` for **Feature Bookends** (e.g., Shipments, Bookings, Main Dashboard). Use simple headers for utilities/settings.
*   **Tables**: Always use `DataTable` for lists.
*   **Buttons**: Use `Button` from `@/components/ui/button`.

## 3. Style Tokens
*   **Background**: `bg-gray-50` (Page background).
*   **Cards**: `bg-white rounded-xl border border-gray-200 shadow-sm`.
*   **Primary Color**: `text-[#003057]` (Brand Blue) or `text-primary`.
*   **Badges**: `inline-flex px-2 py-1 text-xs font-medium rounded-full`.

## 4. Emoji Usage
*   Use emojis *only* in:
    *   Specific widget headers (e.g. "Predictive Delay Risk 🌩️").
    *   Status visualizations if needed.
    *   **NEVER** in the main Page Title or Subtitle (let `MediaCardHeader` handle the aesthetics).
