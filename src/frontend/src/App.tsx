import { Toaster } from "@/components/ui/sonner";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Zap } from "lucide-react";
import React, { Suspense, useEffect, useRef } from "react";
import AppLayout from "./components/AppLayout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";

// ─── Lazy page imports ────────────────────────────────────────────────────────

const DashboardPage = React.lazy(() => import("./pages/DashboardPage"));
const CommunityPage = React.lazy(() => import("./pages/CommunityPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const ProfileSetupPage = React.lazy(() => import("./pages/ProfileSetupPage"));
const LandingPage = React.lazy(() => import("./pages/LandingPage"));

// ─── Hide initial HTML loader once React mounts ───────────────────────────────

function HideInitialLoader() {
  const dismissed = useRef(false);
  useEffect(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    const loader = document.getElementById("initial-loader");
    if (loader) {
      loader.classList.add("hidden");
      setTimeout(() => loader.remove(), 450);
    }
  }, []);
  return null;
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-5 relative overflow-hidden"
      style={{ background: "#0B0B0F" }}
    >
      {/* Ambient orbs */}
      <div
        className="pointer-events-none fixed top-[-120px] right-[-80px] w-[400px] h-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,77,141,0.15) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none fixed bottom-[-100px] left-[-80px] w-[360px] h-[360px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Logo */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #FF4D8D, #7C3AED)",
          boxShadow:
            "0 0 32px rgba(255,77,141,0.4), 0 0 64px rgba(124,58,237,0.2)",
        }}
      >
        <Zap className="w-8 h-8 text-white" />
      </div>

      {/* Brand name */}
      <span
        className="text-2xl font-bold tracking-tight"
        style={{
          background: "linear-gradient(135deg, #FF4D8D, #7C3AED)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Elite Flow
      </span>

      {/* Status */}
      <div
        className="flex items-center gap-2"
        style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}
      >
        <div
          className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
          style={{
            borderColor: "rgba(255,77,141,0.25)",
            borderTopColor: "#FF4D8D",
          }}
        />
        Loading Elite Flow...
      </div>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

function RootLayout() {
  return <Outlet />;
}

// ─── Page Wrappers (with auth guard) ─────────────────────────────────────────

function DashboardPageWrapper() {
  return (
    <AppLayout>
      <DashboardPage />
    </AppLayout>
  );
}

function CommunityPageWrapper() {
  return (
    <AppLayout>
      <CommunityPage />
    </AppLayout>
  );
}

function ProfilePageWrapper() {
  return (
    <AppLayout>
      <ProfilePage />
    </AppLayout>
  );
}

// ─── Routes ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/dashboard" />,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPageWrapper,
});

const communityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/community",
  component: CommunityPageWrapper,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePageWrapper,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  communityRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ─── App Shell (Auth Guard) ───────────────────────────────────────────────────

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isFetched: profileFetched } =
    useGetCallerUserProfile();

  // While auth is still initializing AND not yet authenticated, show landing
  // page immediately. This prevents blank screen during the auth check.
  if (isInitializing && !isAuthenticated) {
    return (
      <>
        <HideInitialLoader />
        <Suspense fallback={<LoadingScreen />}>
          <LandingPage />
        </Suspense>
        <Toaster richColors position="top-right" />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <HideInitialLoader />
        <Suspense fallback={<LoadingScreen />}>
          <LandingPage />
        </Suspense>
        <Toaster richColors position="top-right" />
      </>
    );
  }

  // Only block for profile setup check once the query has settled.
  // While profileFetched is still false we skip to the router so the
  // dashboard shell renders immediately; each module handles its own
  // loading state internally.
  const showProfileSetup =
    isAuthenticated && profileFetched && userProfile === null;

  if (showProfileSetup) {
    return (
      <>
        <HideInitialLoader />
        <Suspense fallback={<LoadingScreen />}>
          <ProfileSetupPage />
        </Suspense>
        <Toaster richColors position="top-right" />
      </>
    );
  }

  return (
    <>
      <HideInitialLoader />
      <Suspense fallback={<LoadingScreen />}>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster richColors position="top-right" />
    </>
  );
}
