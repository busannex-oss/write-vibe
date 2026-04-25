import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { 
  BookOpen, 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Crown,
  Sparkles,
  ShieldAlert,
  Brain,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useErrorLogger } from "@/components/useErrorLogger";
import ErrorBoundary from "@/components/ErrorBoundary";

// Route protection zones
const PUBLIC_PAGES   = ["Landing", "BookWebsite", "Pricing", "About", "Contact", "Privacy", "Terms", "Investor", "FAQ", "CookiePolicy", "HowItWorks"];
const ADMIN_PAGES    = ["UserManagement", "ErrorDashboard"];
const MEMBER_PAGES   = ["Dashboard", "Books", "BookEditor", "CreateBook", "Documents", "Team", "Settings", "ProjectReports"];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useErrorLogger(user);

  useEffect(() => {
    loadUser();
  }, []);

  // Re-check auth whenever page changes
  useEffect(() => {
    if (!loading) checkAccess();
  }, [currentPageName, loading]);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      setUser(null);
    }
    setLoading(false);
  };

  const checkAccess = () => {
    const isMemberPage = MEMBER_PAGES.some(p => currentPageName?.startsWith(p));
    const isAdminPage  = ADMIN_PAGES.includes(currentPageName);

    if ((isMemberPage || isAdminPage) && !user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    if (isAdminPage && user?.role !== "admin") {
      navigate(createPageUrl("Dashboard"));
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const isWhiteLabel = user?.subscription_tier === "white_label";
  const brandName = isWhiteLabel && user?.white_label_config?.brand_name 
    ? user.white_label_config.brand_name 
    : "Write Vibe";
  const brandColor = isWhiteLabel && user?.white_label_config?.primary_color 
    ? user.white_label_config.primary_color 
    : "#f59e0b";
  const brandLogo = isWhiteLabel && user?.white_label_config?.logo_url 
    ? user.white_label_config.logo_url 
    : null;

  const memberNav = [
    { name: "Dashboard",  href: "Dashboard",  icon: LayoutDashboard },
    { name: "My Books",   href: "Books",       icon: BookOpen },
    { name: "Documents",  href: "Documents",   icon: FileText },
    { name: "Team",       href: "Team",        icon: Users },
    { name: "Settings",   href: "Settings",    icon: Settings },
  ];

  const adminNav = user?.role === "admin"
    ? [
        { name: "User Management", href: "UserManagement", icon: Crown },
        { name: "Error Dashboard", href: "ErrorDashboard", icon: ShieldAlert },
        { name: "Agent Memory", href: "AgentMemoryLog", icon: Brain },
        { name: "Mission Statement", href: "MissionStatement", icon: Target }
      ]
    : [];

  const navigation = [...memberNav, ...adminNav];

  // Public pages — no sidebar/header
  if (PUBLIC_PAGES.includes(currentPageName)) {
    return <>{children}</>;
  }

  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <style>{`
        :root { --brand-primary: ${brandColor}; }
      `}</style>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            {brandLogo ? (
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                <img src={brandLogo} alt={brandName} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="font-semibold text-white tracking-tight">{brandName}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-72 bg-slate-900/95 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 ease-out",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              {brandLogo ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
                  <img src={brandLogo} alt={brandName} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <h1 className="font-bold text-lg text-white tracking-tight">{brandName}</h1>
                <p className="text-xs text-white/40">AI Book Studio</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {memberNav.map((item) => {
              const isActive = currentPageName === item.href;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.href)}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 shadow-lg shadow-amber-500/5" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "text-amber-400")} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}

            {/* Admin-only section */}
            {adminNav.length > 0 && (
              <>
                <div className="pt-3 pb-1 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] uppercase tracking-widest text-amber-400/60 font-semibold">Admin</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                </div>
                {adminNav.map((item) => {
                  const isActive = currentPageName === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={createPageUrl(item.href)}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 shadow-lg shadow-amber-500/5"
                          : "text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/5"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", isActive ? "text-amber-400" : "text-amber-400/60")} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* User Section */}
          {user && (
            <div className="p-4 border-t border-white/5">
              {user.subscription_tier === "trial" && (
                <Link
                  to={createPageUrl("Pricing")}
                  className="flex items-center gap-2 px-4 py-3 mb-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:shadow-lg hover:shadow-amber-500/20 transition-all"
                >
                  <Crown className="w-4 h-4" />
                  <span>Upgrade Plan</span>
                </Link>
              )}
              {(user.role === "admin" || user.is_super_admin) && (
                <div className="flex items-center gap-2 px-4 py-1 mb-2">
                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                  <span className="text-xs text-amber-400/80 uppercase tracking-wider">Admin</span>
                </div>
              )}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center overflow-hidden">
                  {user.author_photo_url ? (
                    <img src={user.author_photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium text-white/60">
                      {user.full_name?.charAt(0) || user.email?.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.full_name || "Author"}</p>
                  <p className="text-xs text-white/40 truncate">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-white/40 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72 min-h-screen">
        {/* Desktop Top Header */}
        <div className="hidden lg:flex items-center justify-between px-8 h-14 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-30">
          <h2 className="text-sm font-medium text-white/50 tracking-wide">
            {currentPageName?.replace(/([A-Z])/g, ' $1').trim()}
          </h2>
          {user && (
            <div className="flex items-center gap-3">
              {(user.role === "admin" || user.is_super_admin) && (
                <span className="text-xs text-amber-400/70 bg-amber-400/10 px-2 py-1 rounded-full">Admin</span>
              )}
              <span className="text-sm text-white/30">{user.email}</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center overflow-hidden">
                {user.author_photo_url ? (
                  <img src={user.author_photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-medium text-white/60">
                    {user.full_name?.charAt(0) || user.email?.charAt(0)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="pt-16 lg:pt-0">
          <ErrorBoundary componentName={currentPageName}>
            {children}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}