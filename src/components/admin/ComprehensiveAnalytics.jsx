import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  TrendingUp, Users, Eye, MousePointer, DollarSign, Target,
  Zap, Globe, RefreshCw, Loader2, AlertTriangle, BookOpen, BarChart3, Megaphone
} from "lucide-react";
import PredictiveAnalytics from "@/components/admin/PredictiveAnalytics";

const DATE_RANGES = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
];

const COLORS = ["#f59e0b", "#6366f1", "#10b981", "#f43f5e", "#8b5cf6", "#06b6d4"];

function KPICard({ icon: Icon, label, value, sub, color = "amber", trend }) {
  const colorMap = {
    amber: "text-amber-400 bg-amber-500/10",
    green: "text-emerald-400 bg-emerald-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    red: "text-red-400 bg-red-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
  };
  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="py-4 px-5">
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend !== undefined && (
            <span className={`text-xs font-medium ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {trend >= 0 ? "+" : ""}{trend}%
            </span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-white/50 mt-0.5">{label}</p>
          {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function SyntheticBadge() {
  return (
    <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-xs flex items-center gap-1">
      <Zap className="w-3 h-3" /> AI Preview Data
    </Badge>
  );
}

function fmt(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(Math.round(n));
}

export default function ComprehensiveAnalytics() {
  const [dateRange, setDateRange] = useState("30d");

  const { data: overviewRes, isLoading: loadingOverview, refetch } = useQuery({
    queryKey: ["analytics-overview", dateRange],
    queryFn: async () => {
      const res = await base44.functions.invoke("fetchAnalytics", { action: "overview", date_range: dateRange });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: adsRes, isLoading: loadingAds } = useQuery({
    queryKey: ["analytics-ads", dateRange],
    queryFn: async () => {
      const res = await base44.functions.invoke("fetchAnalytics", { action: "ads", date_range: dateRange });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: booksRes, isLoading: loadingBooks } = useQuery({
    queryKey: ["analytics-books", dateRange],
    queryFn: async () => {
      const res = await base44.functions.invoke("fetchAnalytics", { action: "books", date_range: dateRange });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = loadingOverview || loadingAds || loadingBooks;
  const d = overviewRes?.data || {};
  const ads = adsRes?.data || d;
  const books = booksRes?.data || d;
  const isSynthetic = overviewRes?.source === "synthetic";

  const dailySessions = d.daily_sessions || [];
  const trafficSources = d.traffic_sources || [];
  const campaigns = ads.top_campaigns || d.top_campaigns || [];
  const topBooks = books.top_books || d.top_books || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Comprehensive Analytics</h2>
            <p className="text-xs text-white/40">Google Analytics + Adwizar unified view</p>
          </div>
          {isSynthetic && <SyntheticBadge />}
        </div>
        <div className="flex items-center gap-2">
          {DATE_RANGES.map(r => (
            <Button
              key={r.value}
              size="sm"
              variant={dateRange === r.value ? "default" : "outline"}
              onClick={() => setDateRange(r.value)}
              className={dateRange === r.value
                ? "bg-amber-500 hover:bg-amber-600 text-white border-0"
                : "border-white/20 text-white/60 hover:text-white hover:bg-white/10"
              }
            >
              {r.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="border-white/20 text-white/60 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* API Key Notice */}
      {isSynthetic && (
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2 text-sm text-amber-300/80">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>Showing AI-synthesized preview data. Connect real data by setting <code className="bg-white/10 px-1 rounded text-xs">GA4_PROPERTY_ID</code> and <code className="bg-white/10 px-1 rounded text-xs">ADWIZAR_API_KEY</code> in Settings → Environment Variables.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-white/40 text-sm">Loading analytics data…</p>
        </div>
      ) : (
        <>
          {/* ── KPI Row ─────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <KPICard icon={Users} label="Sessions" value={fmt(d.sessions)} sub="Google Analytics" color="blue" trend={8} />
            <KPICard icon={Globe} label="New Users" value={fmt(d.new_users)} sub="vs returning" color="cyan" trend={12} />
            <KPICard icon={Eye} label="Bounce Rate" value={d.bounce_rate || "—"} sub="avg. session time" color="purple" trend={-3} />
            <KPICard icon={DollarSign} label="Ad Spend" value={d.ad_spend ? `$${fmt(d.ad_spend)}` : "—"} sub="Adwizar" color="amber" />
            <KPICard icon={TrendingUp} label="ROAS" value={d.roas ? `${d.roas}×` : "—"} sub="return on ad spend" color="green" trend={5} />
            <KPICard icon={Target} label="Conversions" value={fmt(d.conversions)} sub={d.conversion_rate} color="red" trend={15} />
          </div>

          {/* ── Predictive Analytics ────────────────────────────────────────── */}
          <PredictiveAnalytics dailySessions={dailySessions} kpis={d} />

          {/* ── Sessions Chart + Traffic Sources ────────────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="bg-white/5 border-white/10 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" /> Daily Sessions & Users
                  <Badge className="ml-auto bg-blue-500/10 text-blue-300 border-0 text-xs">Google Analytics</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dailySessions.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={dailySessions}>
                      <defs>
                        <linearGradient id="gSessions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} labelStyle={{ color: "white" }} />
                      <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                      <Area type="monotone" dataKey="sessions" stroke="#6366f1" fill="url(#gSessions)" strokeWidth={2} />
                      <Area type="monotone" dataKey="users" stroke="#f59e0b" fill="url(#gUsers)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-white/30 text-sm">No time-series data</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-purple-400" /> Traffic Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trafficSources.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={trafficSources} dataKey="sessions" nameKey="source" cx="50%" cy="50%" outerRadius={65} strokeWidth={0}>
                          {trafficSources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 mt-2">
                      {trafficSources.map((s, i) => (
                        <div key={s.source} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                            <span className="text-white/60 capitalize">{s.source}</span>
                          </div>
                          <span className="text-white/40">{s.percentage || Math.round((s.sessions / (d.sessions || 1)) * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-white/30 text-sm">No data</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Adwizar Campaigns ───────────────────────────────────────────── */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-400" /> Adwizar Campaigns
                <Badge className="ml-auto bg-amber-500/10 text-amber-300 border-0 text-xs">Adwizar.ai</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length > 0 ? (
                <>
                  {/* Bar chart: spend vs conversions */}
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={campaigns} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                      <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                      <Bar dataKey="spend" name="Spend ($)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="conversions" name="Conversions" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Campaign table */}
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-white/30 border-b border-white/10">
                          <th className="text-left py-2 pr-4 font-medium">Campaign</th>
                          <th className="text-right py-2 pr-4 font-medium">Spend</th>
                          <th className="text-right py-2 pr-4 font-medium">Impressions</th>
                          <th className="text-right py-2 pr-4 font-medium">Clicks</th>
                          <th className="text-right py-2 pr-4 font-medium">Conv.</th>
                          <th className="text-right py-2 font-medium">ROAS</th>
                          <th className="text-right py-2 pl-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map((c, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-2 pr-4 text-white/80 font-medium">{c.name}</td>
                            <td className="py-2 pr-4 text-right text-white/60">${fmt(c.spend)}</td>
                            <td className="py-2 pr-4 text-right text-white/60">{fmt(c.impressions)}</td>
                            <td className="py-2 pr-4 text-right text-white/60">{fmt(c.clicks)}</td>
                            <td className="py-2 pr-4 text-right text-white/60">{c.conversions || "—"}</td>
                            <td className="py-2 text-right text-emerald-400 font-medium">{c.roas ? `${c.roas}×` : "—"}</td>
                            <td className="py-2 pl-4 text-right">
                              <Badge className={`text-xs ${c.status === "active" ? "bg-emerald-500/20 text-emerald-300 border-0" : "bg-slate-500/20 text-slate-400 border-0"}`}>
                                {c.status || "active"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-white/30 text-sm">No campaign data</div>
              )}
            </CardContent>
          </Card>

          {/* ── Per-Book Performance ────────────────────────────────────────── */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" /> Per-Book Performance
                <Badge className="ml-auto bg-cyan-500/10 text-cyan-300 border-0 text-xs">GA + Adwizar</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topBooks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-white/30 border-b border-white/10">
                        <th className="text-left py-2 pr-4 font-medium">Book Title</th>
                        <th className="text-right py-2 pr-4 font-medium">Page Views</th>
                        <th className="text-right py-2 pr-4 font-medium">Ad Spend</th>
                        <th className="text-right py-2 pr-4 font-medium">Conversions</th>
                        <th className="text-right py-2 font-medium">Est. Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topBooks.map((b, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2 pr-4 text-white/80 font-medium">{b.title}</td>
                          <td className="py-2 pr-4 text-right text-white/60">{fmt(b.page_views)}</td>
                          <td className="py-2 pr-4 text-right text-white/60">${fmt(b.ad_spend)}</td>
                          <td className="py-2 pr-4 text-right text-white/60">{b.conversions || "—"}</td>
                          <td className="py-2 text-right text-emerald-400 font-medium">${fmt(b.revenue_est)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-white/30 text-sm">No per-book data</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}