import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, LayoutDashboard, FileText, Users, Settings, LogOut, Menu, X, Crown, Sparkles, ShieldAlert, Brain, Target, ClipboardList, Map, LayoutGrid, Palette, Building2, Scale, FileKey, BarChart2, UserCheck, GitBranch, Layers, Bot, CheckSquare, Store, Network, Milestone, ClipboardCheck,   TrendingUp, MessageSquare, Library, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useErrorLogger } from "@/components/useErrorLogger";
import ErrorBoundary from "@/components/ErrorBoundary";
import AdminMenuCollapsible from "@/components/AdminMenuCollapsible";
import NavCollapsible from "@/components/NavCollapsible";

// Route protection zones
const PUBLIC_PAGES   = ["Landing", "BookWebsite", "Pricing", "About", "Contact", "Privacy", "Terms", "Investor", "FAQ", "CookiePolicy", "HowItWorks"];
const ADMIN_PAGES    = ["UserManagement", "ErrorDashboard", "Certifications"];
const MEMBER_PAGES   = ["Dashboard", "Books", "BookEditor", "CreateBook", "Documents", "Team", "Settings", "ProjectReports", "Templates"];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Single shared user query — Layout and pages reuse one cached call instead of
  // each fetching separately. Refetches every 5s on the Settings page so branding
  // changes (logo/title) are picked up, matching the previous polling behavior.
  const { data: user, isLoading: loading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    staleTime: 60000,
    retry: false,
    refetchInterval: currentPageName === 'Settings' ? 5000 : false
  });

  useErrorLogger(user);

  // Re-check auth whenever page changes
  useEffect(() => {
    if (!loading) checkAccess();
  }, [currentPageName, loading]);

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
  
  // Website branding (applies to all users)
  const brandName = user?.website_title || "Write Vibe";
  const brandLogo = user?.website_logo_url || (isWhiteLabel && user?.white_label_config?.logo_url ? user.white_label_config.logo_url : null);
  
  // White label specific overrides
  const finalBrandName = isWhiteLabel && user?.white_label_config?.brand_name 
    ? user.white_label_config.brand_name 
    : brandName;
  const brandColor = isWhiteLabel && user?.white_label_config?.primary_color 
    ? user.white_label_config.primary_color 
    : "#f59e0b";

  const memberNav = [
    { name: "Dashboard",  href: "Dashboard",  icon: LayoutDashboard },
    { name: "My Books",   href: "Books",       icon: BookOpen, children: [
      { name: "Template Library", href: "Templates", icon: Library },
    ]},
    { name: "Publication Checklist", href: "PublicationChecklist", icon: CheckSquare },
    { name: "Documents",  href: "Documents",   icon: FileText },
    { name: "Team",       href: "Team",        icon: Users },
    { name: "Settings",   href: "Settings",    icon: Settings },
  ];

  const adminNav = user?.role === "admin"
    ? [
        { name: "User Management", href: "UserManagement", icon: Crown },
        { name: "Error Dashboard", href: "ErrorDashboard", icon: ShieldAlert },
        { name: "Agent Memory", href: "AgentMemoryLog", icon: Brain },
        { name: "Mission Statement", href: "MissionStatement", icon: Target },
        { name: "SOPs", href: "SOPs", icon: ClipboardList },
        { name: "Master Registry", href: "MasterRegistry", icon: BookOpen },
        { name: "Map Legend", href: "MapLegend", icon: Map },
        { name: "Pillar Alignment", href: "PillarAlignment", icon: LayoutGrid },
        { name: "Brand Style Guide", href: "BrandStyleGuide", icon: Palette },
        { name: "Sitemap", href: "Sitemap", icon: Map },
        { name: "System Architecture", href: "SystemArchitecture", icon: Building2 },
        { name: "Legal Documents", href: "LegalDocuments", icon: Scale },
        { name: "Licensing Terms", href: "LicensingTerms", icon: FileKey },
        { name: "KPI Framework", href: "KPIFramework", icon: BarChart2 },
        { name: "Onboarding Experience", href: "OnboardingExperience", icon: UserCheck },
        { name: "Version Roadmap", href: "VersionRoadmap", icon: GitBranch },
        { name: "Pillars Architecture", href: "PillarsArchitecture", icon: Layers },
        { name: "AI Agent Audit", href: "AgentAudit", icon: Bot },
        { name: "White Label Admin", href: "WhiteLabelAdmin", icon: Store },
        { name: "Agent Map", href: "AgentConnectionMap", icon: Network },
        { name: "Advisory Reviews", href: "AdvisoryReviewDashboard", icon: ClipboardCheck },
        { name: "CCOS Studio", href: "CCOSStudio", icon: TrendingUp },
        { name: "CCOS Agent", href: "CCOSAgent", icon: MessageSquare },
        { name: "Certifications", href: "Certifications", icon: Award }
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
            <span className="font-semibold text-white tracking-tight">{finalBrandName}</span>
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

        {/* Mobile Dropdown Menu */}
        {sidebarOpen && (
          <nav className="lg:hidden bg-slate-900/80 backdrop-blur-xl border-b border-white/5 p-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {memberNav.map((item) => {
              if (item.children) {
                return (
                  <NavCollapsible
                    key={item.name}
                    parent={item}
                    items={item.children}
                    currentPageName={currentPageName}
                    onNavigate={() => setSidebarOpen(false)}
                  />
                );
              }
              const isActive = currentPageName === item.href;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.href)}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "text-amber-400")} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-50 h-full w-72 bg-slate-900/95 backdrop-blur-xl border-r border-white/5 flex-col">
        <div className="flex flex-col h-full pt-16">
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
                <h1 className="font-bold text-lg text-white tracking-tight">{finalBrandName}</h1>
                <p className="text-xs text-white/40">AI Book Studio</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {memberNav.map((item) => {
              if (item.children) {
                return (
                  <NavCollapsible
                    key={item.name}
                    parent={item}
                    items={item.children}
                    currentPageName={currentPageName}
                    onNavigate={() => setSidebarOpen(false)}
                  />
                );
              }
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

            {/* Admin-only collapsible section */}
            {adminNav.length > 0 && (
              <div className="pt-2 border-t border-white/10 mt-2">
                <AdminMenuCollapsible adminNav={adminNav} currentPageName={currentPageName} />
              </div>
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