# Elite Flow

## Current State

Elite Flow is a full-stack SaaS productivity app with:
- Internet Identity authentication (blocking -- app shows `LoadingScreen` while `isInitializing` is true)
- A landing page for unauthenticated users
- Dashboard with HabitTracker, TaskManager, and CashflowSystem all eagerly imported
- CommunityPage with all three tabs (Announcements, General, DMs) eagerly imported
- ProfilePage and ProfileSetupPage also eagerly imported
- All page and component imports in `App.tsx` and `DashboardPage.tsx` are static (no `React.lazy`)
- Vite config has `minify: false` which produces larger bundles
- `index.html` already has an HTML/CSS loading screen (no blank page problem at HTML level)
- `HideInitialLoader` hook removes the HTML loader once React mounts
- Auth still blocks UI: `if (isInitializing) return <LoadingScreen />` -- nothing renders until AuthClient resolves

## Requested Changes (Diff)

### Add
- `React.lazy` + `Suspense` boundaries for all heavy page components: `DashboardPage`, `CommunityPage`, `ProfilePage`, `ProfileSetupPage`, `LandingPage`
- `React.lazy` + `Suspense` for heavy dashboard sub-components: `HabitTracker`, `TaskManager`, `CashflowSystem`, `WealthGoal`
- Skeleton placeholder components for dashboard cards shown during lazy load (HabitSkeleton, TaskSkeleton, CashflowSkeleton)
- `React.lazy` for `CommunityPage` so it only loads when navigated to
- A `DashboardSkeleton` shell that renders the dashboard grid structure instantly before data arrives
- Vite code-splitting: manual chunks config separating vendor, ICP/dfinity, chart/heavy UI from core app shell

### Modify
- `App.tsx`: Remove static imports of page components; replace with `React.lazy`. Auth initialization should NOT block rendering -- instead show LandingPage/skeleton immediately and resolve auth in background. Concretely: remove the `if (isInitializing) return <LoadingScreen />` gate; instead show the landing page optimistically while auth initializes, then transition once resolved.
- `DashboardPage.tsx`: Replace static imports of `HabitTracker`, `TaskManager`, `CashflowSystem`, `WealthGoal` with `React.lazy` + `Suspense` with skeleton fallbacks. Dashboard header/greeting renders immediately; widget panels load asynchronously.
- `vite.config.js`: Enable `minify: true` (or `'esbuild'`), add `build.rollupOptions.output.manualChunks` to split: `vendor` (react, react-dom, tanstack), `icp` (@dfinity/*, @icp-sdk/*), `ui` (lucide-react, shadcn components), app chunks per route.

### Remove
- The `if (isInitializing) return <LoadingScreen />` blocking gate in `App.tsx`
- The profile-loading blocking gate (`if (profileLoading) return <LoadingScreen />`) -- replace with skeleton or allow dashboard to render with placeholder data while profile loads

## Implementation Plan

1. **vite.config.js** -- Enable minification (`minify: 'esbuild'`). Add `rollupOptions.output.manualChunks` splitting react/tanstack into `vendor`, dfinity/icp into `icp`, lucide/radix into `ui`.

2. **App.tsx** -- Convert all page imports to `React.lazy`. Remove blocking `isInitializing` and `profileLoading` gates. Auth runs in background: show LandingPage while auth initializes (unauthenticated/unknown state both show landing), transition to app once auth completes. Wrap router in `<Suspense>` with lightweight fallback.

3. **DashboardPage.tsx** -- Lazy-import HabitTracker, TaskManager, CashflowSystem, WealthGoal. Add inline skeleton fallbacks for each card. Dashboard greeting/header renders on first paint.

4. **Skeleton components** -- Create lightweight inline skeletons (pulsing placeholder blocks) inside DashboardPage for each widget card.

5. **CommunityPage.tsx** -- Messages already load via react-query (data arrives after render). No structural change needed; confirm lazy import boundary is set at the route level.

6. **QueryClient config** -- Set `staleTime` and `gcTime` to improve re-navigation cache hit rates so data doesn't refetch on every route change.
