# Elite Flow

## Current State
The app has a `LoginPage.tsx` that shows directly when a user is not authenticated. It has a two-panel layout (left branding, right login form) with a single "Sign in with Internet Identity" button that immediately triggers Internet Identity authentication.

## Requested Changes (Diff)

### Add
- A new `LandingPage.tsx` component shown before any authentication prompt
- Full-screen landing hero with Elite Flow logo, headline "Level Up Your Life", description text, and two CTA buttons (Sign Up, Login)
- Dark background with pink-purple gradient accents matching the existing Elite Flow brand
- A state flag in `App.tsx` to control transition from landing → login (Internet Identity auth trigger)

### Modify
- `App.tsx`: when the user is not authenticated, show `LandingPage` first. When either button is clicked, trigger the Internet Identity login flow directly (same as existing `handleAuth`).
- `LoginPage.tsx` is effectively replaced/bypassed by the new landing page flow, but the underlying auth hook (`useInternetIdentity`) remains untouched.

### Remove
- Nothing removed — the existing auth system and all other pages remain intact.

## Implementation Plan
1. Create `src/pages/LandingPage.tsx` with:
   - Full-screen dark background, pink-purple gradient orbs/accents
   - Centered layout: logo (Zap icon + "Elite Flow" text), headline, description, two gradient buttons (Sign Up / Login)
   - Both buttons call `login()` from `useInternetIdentity` hook — same as the existing LoginPage
2. Update `App.tsx`: when `!isAuthenticated`, render `<LandingPage />` instead of `<LoginPage />`
3. Apply deterministic `data-ocid` markers to landing page buttons and sections
