import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, TrendingDown, Users, Target, DollarSign } from "lucide-react";

// Simple linear regression: returns { slope, intercept }
function linReg(values) {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] || 0 };
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((acc, y, x) => acc + x * y, 0);
  const sumX2 = values.reduce((acc, _, x) => acc + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
  return { slope, intercept: (sumY - slope * sumX) / n };
}

function ForecastCard({ icon: Icon, label, value, change, color }) {
  const up = change >= 0;
  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="py-4 px-5">
        <div className="flex items-center justify-between">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className={`flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-400" : "text-red-400"}`}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {up ? "+" : ""}{change}%
          </span>
        </div>
        <p className="text-xl font-bold text-white mt-3">{value}</p>
        <p className="text-xs text-white/40 mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}

export default function PredictiveAnalytics({ dailySessions = [], kpis = {} }) {
  const { chartData, projections } = useMemo(() => {
    if (dailySessions.length < 3) return { chartData: [], projections: null };

    const sessions = dailySessions.map(d => d.sessions || 0);
    const users = dailySessions.map(d => d.users || 0);
    const sReg = linReg(sessions);
    const uReg = linReg(users);
    const n = sessions.length;

    const historical = dailySessions.map(d => ({
      date: d.date, sessions: d.sessions, users: d.users
    }));
    // Bridge point so forecast lines connect to history
    const last = historical[historical.length - 1];
    const forecast = [{ date: last.date, forecast_sessions: last.sessions, forecast_users: last.users }];
    for (let i = 1; i <= 14; i++) {
      const x = n - 1 + i;
      const dt = new Date();
      dt.setDate(dt.getDate() + i);
      forecast.push({
        date: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        forecast_sessions: Math.max(0, Math.round(sReg.slope * x + sReg.intercept)),
        forecast_users: Math.max(0, Math.round(uReg.slope * x + uReg.intercept)),
      });
    }

    const avgDaily = sessions.reduce((a, b) => a + b, 0) / n;
    const next30Sessions = Math.max(0, Math.round(
      Array.from({ length: 30 }, (_, i) => sReg.slope * (n + i) + sReg.intercept).reduce((a, b) => a + b, 0)
    ));
    const sessionsChange = avgDaily > 0 ? Math.round(((sReg.slope * (n + 15) + sReg.intercept) / avgDaily - 1) * 100) : 0;

    const convRate = kpis.sessions > 0 && kpis.conversions ? kpis.conversions / kpis.sessions : 0.02;
    const next30Conversions = Math.round(next30Sessions * convRate);
    const revPerConv = kpis.conversions > 0 && kpis.ad_spend && kpis.roas
      ? (kpis.ad_spend * kpis.roas) / kpis.conversions : 25;
    const next30Revenue = Math.round(next30Conversions * revPerConv);

    return {
      chartData: [...historical, ...forecast],
      projections: { next30Sessions, sessionsChange, next30Conversions, next30Revenue },
    };
  }, [dailySessions, kpis]);

  if (!projections) return null;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" /> Predictive Analytics
          <Badge className="ml-auto bg-emerald-500/10 text-emerald-300 border-0 text-xs">14-Day Forecast</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ForecastCard icon={Users} label="Projected Sessions (next 30d)" value={projections.next30Sessions.toLocaleString()} change={projections.sessionsChange} color="text-blue-400 bg-blue-500/10" />
          <ForecastCard icon={Target} label="Projected Conversions (next 30d)" value={projections.next30Conversions.toLocaleString()} change={projections.sessionsChange} color="text-red-400 bg-red-500/10" />
          <ForecastCard icon={DollarSign} label="Projected Revenue (next 30d)" value={`$${projections.next30Revenue.toLocaleString()}`} change={projections.sessionsChange} color="text-amber-400 bg-amber-500/10" />
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="gHist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} labelStyle={{ color: "white" }} />
            <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }} />
            <Area type="monotone" dataKey="sessions" name="Sessions (actual)" stroke="#6366f1" fill="url(#gHist)" strokeWidth={2} />
            <Line type="monotone" dataKey="forecast_sessions" name="Sessions (forecast)" stroke="#10b981" strokeWidth={2} strokeDasharray="6 4" dot={false} />
            <Line type="monotone" dataKey="forecast_users" name="Users (forecast)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
        <p className="text-xs text-white/30">Forecast based on linear trend of historical daily sessions. Revenue projection uses current conversion rate and ROAS.</p>
      </CardContent>
    </Card>
  );
}