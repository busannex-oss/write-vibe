import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle2, RefreshCw, Trash2, Bot, ShieldAlert, Globe, Loader2 } from "lucide-react";
import { format } from "date-fns";

const SEVERITY_COLORS = {
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

const TYPE_ICONS = {
  auth_403: ShieldAlert,
  not_found_404: Globe,
  runtime: AlertTriangle,
  render: AlertTriangle,
  network: Globe,
  query: RefreshCw,
  unknown: AlertTriangle,
};

export default function ErrorDashboard() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedError, setSelectedError] = useState(null);

  const { data: errors = [], isLoading } = useQuery({
    queryKey: ["errorLogs", filter],
    queryFn: () => filter === "unresolved"
      ? base44.entities.ErrorLog.filter({ resolved: false }, "-created_date", 100)
      : filter === "resolved"
      ? base44.entities.ErrorLog.filter({ resolved: true }, "-created_date", 100)
      : base44.entities.ErrorLog.list("-created_date", 100),
    refetchInterval: 30000,
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, notes }) => base44.entities.ErrorLog.update(id, { resolved: true, resolution_notes: notes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["errorLogs"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ErrorLog.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["errorLogs"] }),
  });

  const clearResolved = async () => {
    const resolved = errors.filter(e => e.resolved);
    await Promise.all(resolved.map(e => deleteMutation.mutateAsync(e.id)));
  };

  const analyzeWithAI = async (error) => {
    setSelectedError(error);
    setAnalyzing(true);
    setAiAnalysis(null);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert React/JavaScript debugger. Analyze this application error and provide a concise resolution.

Error Type: ${error.error_type}
Message: ${error.message}
Page: ${error.page}
Component: ${error.component || "unknown"}
Status Code: ${error.status_code || "N/A"}
Stack Trace: ${error.stack?.slice(0, 800) || "N/A"}
Context: ${error.context || "N/A"}

Respond with:
1. Root Cause (1-2 sentences)
2. Recommended Fix (specific code-level steps)
3. Prevention (how to avoid recurrence)
Keep it concise and technical.`,
      response_json_schema: {
        type: "object",
        properties: {
          root_cause: { type: "string" },
          recommended_fix: { type: "string" },
          prevention: { type: "string" },
          severity_assessment: { type: "string" }
        }
      }
    });
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  const applyFix = async (error, analysis) => {
    setAnalyzing(true);
    try {
      await base44.functions.invoke('fixError', {
        errorId: error.id,
        errorData: { ...error, ...analysis }
      });
      queryClient.invalidateQueries({ queryKey: ["errorLogs"] });
      setSelectedError(null);
      setAiAnalysis(null);
    } catch (err) {
      console.error('Failed to apply fix:', err);
    }
    setAnalyzing(false);
  };

  const stats = {
    total: errors.length,
    critical: errors.filter(e => e.severity === "critical" && !e.resolved).length,
    unresolved: errors.filter(e => !e.resolved).length,
    auth403: errors.filter(e => e.error_type === "auth_403" && !e.resolved).length,
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Error Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Real-time error tracking & AI-powered resolutions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={clearResolved} className="text-white/40 hover:text-white text-sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Resolved
          </Button>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["errorLogs"] })}
            variant="ghost" className="text-white/40 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Errors", value: stats.total, color: "text-white" },
          { label: "Unresolved", value: stats.unresolved, color: "text-orange-400" },
          { label: "Critical", value: stats.critical, color: "text-red-400" },
          { label: "403 Auth Errors", value: stats.auth403, color: "text-yellow-400" },
        ].map(s => (
          <Card key={s.label} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-white/40 text-xs mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Error List */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Errors</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-white/30 text-sm">{errors.length} entries</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-amber-500 animate-spin" /></div>
          ) : errors.length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-400/50" />
              <p>No errors logged</p>
            </div>
          ) : (
            <div className="space-y-2">
              {errors.map((err) => {
                const Icon = TYPE_ICONS[err.error_type] || AlertTriangle;
                return (
                  <div
                    key={err.id}
                    onClick={() => setSelectedError(err)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedError?.id === err.id
                        ? "border-amber-500/40 bg-amber-500/5"
                        : "border-white/5 bg-white/3 hover:border-white/10 hover:bg-white/5"
                    } ${err.resolved ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${err.resolved ? "text-emerald-400" : "text-red-400"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge className={SEVERITY_COLORS[err.severity]}>{err.severity}</Badge>
                          <Badge variant="outline" className="text-white/40 border-white/10 text-xs">{err.error_type}</Badge>
                          {err.status_code && <Badge variant="outline" className="text-white/40 border-white/10 text-xs">{err.status_code}</Badge>}
                          {err.resolved && <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">resolved</Badge>}
                        </div>
                        <p className="text-white text-sm font-medium truncate">{err.message}</p>
                        <p className="text-white/30 text-xs mt-1">{err.page} • {err.created_date ? format(new Date(err.created_date), "MMM d, h:mma") : ""}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); !analyzing && analyzeWithAI(err); }} disabled={analyzing}
                          className="text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10 h-7 px-2 text-xs disabled:opacity-50">
                          <Bot className="w-3 h-3 mr-1" /> {analyzing && selectedError?.id === err.id ? "Analyzing..." : "AI Fix"}
                        </Button>
                        {!err.resolved && (
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); resolveMutation.mutate({ id: err.id, notes: "Manually resolved" }); }}
                            className="text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10 h-7 px-2 text-xs">
                            <CheckCircle2 className="w-3 h-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(err.id); }}
                          className="text-red-400/40 hover:text-red-400 hover:bg-red-500/10 h-7 px-2">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Analysis Panel */}
        {selectedError && (
          <div className="lg:w-96 shrink-0">
            <Card className="bg-white/5 border-white/10 sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Bot className="w-4 h-4 text-amber-400" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <p className="text-white/40 text-xs mb-1">Error</p>
                  <p className="text-white text-sm font-medium break-all">{selectedError.message}</p>
                  {selectedError.stack && (
                    <pre className="text-white/30 text-xs mt-2 overflow-auto max-h-24 whitespace-pre-wrap">{selectedError.stack.slice(0, 400)}</pre>
                  )}
                </div>

                {analyzing ? (
                  <div className="flex items-center gap-2 text-white/50 text-sm py-4 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    Analyzing with AI...
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-3">
                    {[
                      { key: "root_cause", label: "Root Cause" },
                      { key: "recommended_fix", label: "Recommended Fix" },
                      { key: "prevention", label: "Prevention" },
                    ].map(({ key, label }) => aiAnalysis[key] && (
                      <div key={key} className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <p className="text-amber-400/80 text-xs font-semibold uppercase tracking-wide mb-1">{label}</p>
                        <p className="text-white/80 text-sm leading-relaxed">{aiAnalysis[key]}</p>
                      </div>
                    ))}
                    <Button
                      className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30"
                      onClick={() => resolveMutation.mutate({ id: selectedError.id, notes: aiAnalysis.recommended_fix })}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Resolved
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
                    onClick={() => analyzeWithAI(selectedError)}>
                    <Bot className="w-4 h-4 mr-2" />
                    Analyze This Error
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}