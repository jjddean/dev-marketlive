# Collaboration Rules & Agent Protocols

These rules define the required behavior for the AI agent to ensure alignment with the User.

## 1. Explicit Confirmation Required
*   **Major Refactors**: Never proactively refactor functional code (e.g., changing app names, moving directories) without explicit user permission.
*   **Deletions**: Never delete files or documentation unless explicitly instructed.
*   **Correction Loops**: If a tool fails, **STOP** and ask the user how to proceed. Do not retry endlessly or guess.

## 2. Documentation Management
*   **Separation of Concerns**: Maintain `COMPLETED_FEATURES.md` and `UPCOMING_ROADMAP.md` as separate files. Do not merge them.
*   **Accuracy Check**: Before marking a feature as "Done", verify the *backend implementation*, not just the frontend UI.

## 3. Communication Style
*   **No Surprise Features**: Do not implementing features that were not requested (even if they seem helpful).
*   **Stop Means Stop**: If the user says "Stop", cease all tool usage immediately and await further input.

## 4. Technical Boundaries
*   **UI Is Sacred**: Do not change the visual design or layout unless specific CSS changes are requested.
*   **Mock vs Real**: Clearly label mock data usage. Do not claim a feature is "Real" (like tracking) if it is using `Math.random()`.
