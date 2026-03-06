import { Toaster } from "@/components/ui/sonner";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Loader2, Zap } from "lucide-react";
import AppLayout from "./components/AppLayout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import CommunityPage from "./pages/CommunityPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileSetupPage from "./pages/ProfileSetupPage";

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center">
        <Zap className="w-6 h-6 text-white" />
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading Elite Flow...</span>
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
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  if (isInitializing) return <LoadingScreen />;

  if (!isAuthenticated) {
    return (
      <>
        <LandingPage />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  if (profileLoading) return <LoadingScreen />;

  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;
  if (showProfileSetup) {
    return (
      <>
        <ProfileSetupPage />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}
