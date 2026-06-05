import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Building2, Globe, Palette, Users, BarChart3, Key, Loader2,
  CheckCircle2, AlertCircle, TrendingUp, DollarSign, Zap, Crown
} from "lucide-react";
import WhiteLabelTenantManager from "@/components/whitelabel/WhiteLabelTenantManager";
import WhiteLabelBranding from "@/components/WhiteLabelBranding";
import WhiteLabelDNSPanel from "@/components/whitelabel/WhiteLabelDNSPanel";
import WhiteLabelPlanSelector from "@/components/whitelabel/WhiteLabelPlanSelector";
import InlineRecommendations from "@/components/InlineRecommendations";
import { cn } from "@/lib/utils";

export default function WhiteLabelAdmin() {
  const [activeTab, setActiveTab] = useState("overview");
  const [togglingWL, setTogglingWL] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: tenants = [], isLoading: tenantsLoading } = useQuery({
    queryKey: ["wl-tenants"],
    queryFn: () => base44.entities.WhiteLabelTenant.list("-created_date", 200),
  });

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const isWhiteLabel = user?.subscription_tier === "white_label";

  const toggleWhiteLabel = async () => {
    setTogglingWL(true);
    const newTier = isWhiteLabel ? "professional" : "white_label";
    await base44.auth.updateMe({ subscription_tier: newTier });
    queryClient.invalidateQueries({ queryKey: ["user"] });
    setTogglingWL(false);
  };
  const activeTenants = tenants.filter(t => t.status === "active");
  const totalMRR = activeTenants.reduce((s, t) => s + (t.monthly_revenue || 0), 0);
  const dnsVerifiedCount = tenants.filter(t => t.dns_verified).length;

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">White Label Infrastructure</h1>
              <p className="text-white/40 text-sm">Manage tenants, branding, domains, and reseller configuration</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
            <div className="text-right">
              <p className="text-xs text-white/40 leading-none mb-0.5">White Label Feature</p>
              <p className={cn("text-sm font-semibold leading-none", isWhiteLabel ? "text-amber-300" : "text-white/50")}>
                {isWhiteLabel ? "Active" : "Inactive"}
              </p>
            </div>
            {togglingWL
              ? <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
              : <Switch checked={isWhiteLabel} onCheckedChange={toggleWhiteLabel} className="data-[state=checked]:bg-amber-500" />
            }
          </div>
        </div>

        {/* Inline Recommendations */}
        <InlineRecommendations
          context="White Label Infrastructure"
          contextData={{
            totalTenants: tenants.length,
            activeTenants: activeTenants.length,
            monthlyRevenue: totalMRR,
            dnsVerified: dnsVerifiedCount,
            isWhiteLabel,
            brandConfigured: !!user?.white_label_config?.brand_name,
          }}
          storageKey="recs_white_label_admin"
        />

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Tenants", value: tenants.length, icon: Building2, color: "text-amber-400" },
            { label: "Active Tenants", value: activeTenants.length, icon: CheckCircle2, color: "text-emerald-400" },
            { label: "Monthly Revenue", value: `$${totalMRR.toLocaleString()}`, icon: DollarSign, color: "text-emerald-400" },
            { label: "Domains Verified", value: `${dnsVerifiedCount}/${tenants.filter(t => t.custom_domain).length || 0}`, icon: Globe, color: "text-blue-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="bg-white/5 border-white/10">
              <CardContent className="py-4 flex items-center gap-3">
                <Icon className={cn("w-5 h-5 shrink-0", color)} />
                <div>
                  <p className="text-white font-bold text-lg leading-none">{value}</p>
                  <p className="text-white/40 text-xs mt-0.5">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              <BarChart3 className="w-4 h-4 mr-1.5" />Overview
            </TabsTrigger>
            <TabsTrigger value="tenants" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              <Building2 className="w-4 h-4 mr-1.5" />Tenants
              {tenants.length > 0 && <span className="ml-1.5 bg-amber-500/30 text-amber-300 text-xs px-1.5 py-0.5 rounded-full">{tenants.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="branding" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              <Palette className="w-4 h-4 mr-1.5" />Master Branding
            </TabsTrigger>
            <TabsTrigger value="dns" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              <Globe className="w-4 h-4 mr-1.5" />DNS & Domains
            </TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              <Crown className="w-4 h-4 mr-1.5" />Reseller Plans
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {!isWhiteLabel && (
              <Card className="bg-amber-500/8 border-amber-500/30">
                <CardContent className="py-5 flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-300 font-medium">White Label plan not active</p>
                    <p className="text-amber-300/60 text-sm mt-0.5">Upgrade to the White Label plan to unlock all reseller features including custom domains, tenant management, and full brand isolation.</p>
                    <Button size="sm" className="mt-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold" onClick={() => setActiveTab("plans")}>
                      View Reseller Plans
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Infrastructure Status */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Infrastructure Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Master Brand Config", ok: !!user?.white_label_config?.brand_name, hint: "Set your reseller brand name and logo" },
                    { label: "Platform Color Scheme", ok: !!user?.white_label_config?.primary, hint: "Choose primary brand colors" },
                    { label: "Custom Domain (Master)", ok: !!user?.white_label_config?.custom_domain, hint: "Optional: your own domain for the platform" },
                    { label: "Active Tenants", ok: activeTenants.length > 0, hint: "Create and activate at least one tenant" },
                    { label: "DNS Verified", ok: dnsVerifiedCount > 0, hint: "Verify at least one tenant's custom domain" },
                  ].map(({ label, ok, hint }) => (
                    <div key={label} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {ok
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          : <AlertCircle className="w-4 h-4 text-amber-400/60 shrink-0" />}
                        <div>
                          <p className="text-white/80 text-sm font-medium">{label}</p>
                          {!ok && <p className="text-white/30 text-xs">{hint}</p>}
                        </div>
                      </div>
                      <Badge className={cn("text-xs border shrink-0", ok
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400")}>
                        {ok ? "Complete" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Tenants Summary */}
            {tenants.length > 0 && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-base">Tenant Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tenants.slice(0, 5).map(t => (
                      <div key={t.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ background: t.primary_color || "#f59e0b" }} />
                          <span className="text-white/80 text-sm">{t.brand_name}</span>
                          <span className="text-white/30 text-xs capitalize">{t.plan}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {t.monthly_revenue > 0 && <span className="text-emerald-400 text-sm font-medium">${t.monthly_revenue}/mo</span>}
                          <Badge className={cn("text-xs border capitalize",
                            t.status === "active" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                            t.status === "trial" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                            "bg-red-500/10 border-red-500/20 text-red-400")}>
                            {t.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  {tenants.length > 5 && (
                    <button className="text-amber-400/60 text-xs mt-3 hover:text-amber-400 transition-colors"
                      onClick={() => setActiveTab("tenants")}>
                      View all {tenants.length} tenants →
                    </button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tenants */}
          <TabsContent value="tenants" className="mt-6">
            <WhiteLabelTenantManager />
          </TabsContent>

          {/* Master Branding */}
          <TabsContent value="branding" className="mt-6">
            <WhiteLabelBranding user={user} onUpdate={() => {}} />
          </TabsContent>

          {/* DNS */}
          <TabsContent value="dns" className="mt-6 space-y-6">
            <p className="text-white/40 text-sm">Configure DNS for your master domain and review tenant domain status.</p>
            <WhiteLabelDNSPanel
              tenantId="master"
              customDomain={user?.white_label_config?.custom_domain}
              dnsVerified={false}
            />
            {tenants.filter(t => t.custom_domain).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider">Tenant Domains</h3>
                {tenants.filter(t => t.custom_domain).map(t => (
                  <WhiteLabelDNSPanel
                    key={t.id}
                    tenantId={t.id}
                    customDomain={t.custom_domain}
                    dnsVerified={t.dns_verified}
                    onVerified={async () => {
                      await base44.entities.WhiteLabelTenant.update(t.id, { dns_verified: true });
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Plans */}
          <TabsContent value="plans" className="mt-6">
            <WhiteLabelPlanSelector
              currentPlan={user?.white_label_reseller_plan}
              onSelect={(planId) => {
                if (planId === "enterprise_reseller") {
                  window.open("mailto:sales@writevibe.app?subject=Enterprise Reseller Plan", "_blank");
                } else {
                  alert(`To upgrade to ${planId}, please contact sales@writevibe.app or visit the billing page.`);
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}