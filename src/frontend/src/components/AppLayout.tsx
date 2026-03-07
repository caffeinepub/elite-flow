import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { getAvatarUrl } from "../hooks/useAvatarUrl";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile, useIsFounder } from "../hooks/useQueries";
import { getInitials, stringToColor } from "../lib/helpers";
import { FounderBadge } from "./FounderBadge";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard_link",
  },
  {
    to: "/community",
    label: "Community",
    icon: Users,
    ocid: "nav.community_link",
  },
  { to: "/profile", label: "Profile", icon: User, ocid: "nav.profile_link" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const { data: isFounder } = useIsFounder();
  const displayName = userProfile?.displayName ?? "User";
  const username = userProfile?.username ?? "";
  const initials = getInitials(displayName);
  const avatarColor = stringToColor(displayName);

  const SidebarContent = () => (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border/50">
        <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-display text-xl font-bold text-sidebar-foreground">
          Elite Flow
        </span>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, ocid }) => {
          const isActive =
            currentPath === to || currentPath.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              data-ocid={ocid}
              className={cn(
                "sidebar-item",
                isActive ? "sidebar-item-active" : "sidebar-item-inactive",
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>

      {/* User section */}
      <div className="px-3 py-4 border-t border-sidebar-border/50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <Avatar className="w-8 h-8 flex-shrink-0">
            {getAvatarUrl(userProfile?.avatarId) && (
              <AvatarImage
                src={getAvatarUrl(userProfile?.avatarId) ?? undefined}
                alt={displayName}
                className="object-cover"
              />
            )}
            <AvatarFallback
              className="text-xs font-semibold text-white"
              style={{ background: avatarColor }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-sidebar-foreground truncate">
                {displayName}
              </span>
              {isFounder && <FounderBadge />}
            </div>
            <span className="text-xs text-sidebar-foreground/50 truncate block">
              @{username}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="w-7 h-7 text-sidebar-foreground/50 hover:text-sidebar-foreground flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm lg:hidden">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-9 h-9"
            >
              {sidebarOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display font-bold">Elite Flow</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isFounder && <span className="text-sm">👑</span>}
            <Avatar className="w-8 h-8">
              {getAvatarUrl(userProfile?.avatarId) && (
                <AvatarImage
                  src={getAvatarUrl(userProfile?.avatarId) ?? undefined}
                  alt={displayName}
                  className="object-cover"
                />
              )}
              <AvatarFallback
                className="text-xs font-semibold text-white"
                style={{ background: avatarColor }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="hidden lg:flex items-center justify-between px-6 py-3.5 border-b border-border bg-card/30">
          <div />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-sm font-semibold">{displayName}</span>
                {isFounder && <FounderBadge />}
              </div>
              <span className="text-xs text-muted-foreground">@{username}</span>
            </div>
            <Avatar className="w-9 h-9">
              {getAvatarUrl(userProfile?.avatarId) && (
                <AvatarImage
                  src={getAvatarUrl(userProfile?.avatarId) ?? undefined}
                  alt={displayName}
                  className="object-cover"
                />
              )}
              <AvatarFallback
                className="text-sm font-semibold text-white"
                style={{ background: avatarColor }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto custom-scrollbar">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden flex items-center justify-around border-t border-border bg-card/80 backdrop-blur-sm px-2 py-2">
          {navItems.map(({ to, label, icon: Icon, ocid }) => {
            const isActive =
              currentPath === to || currentPath.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                data-ocid={ocid}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors text-xs font-medium",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
