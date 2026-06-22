import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, ClipboardPaste, CheckCircle2, XCircle, Copy, RefreshCw, TrendingUp, ArrowRight } from "lucide-react";
import {
  CCOS_ASSET_TYPES,
  CCOS_DIMENSIONS,
  CCOS_FINAL_CHECKLIST,
  buildEvaluationPrompt,
  CCOS_EVALUATION_SCHEMA
} from "@/lib/ccosFramework";

export default function CCOSStudio() {
  const [assetType, setAssetType] = useState("Website");
  const [assetContent, setAssetContent] = useState("");
  const [brandContext, setBrandContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const runEvaluation = async () => {
    if (!assetContent.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: buildEvaluationPrompt(assetType, assetContent, brandContext),
        response_json_schema: CCOS_EVALUATION_SCHEMA,
        model: "claude_sonnet_4_6"
      });
      setResult(response);
    } catch (e) {
      setError(e.message || "Evaluation failed. Please try again.");
    }
    setLoading(false);
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setAssetContent("");
    setBrandContext("");
  };

  const copyRewrite = () => {
    if (!result?.rewritten_asset) return;
    navigator.clipboard.writeText(result.rewritten_asset);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const scoreBg = (score) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">CCOS Studio</h1>
              <p className="text-sm text-white/50">Communication-to-Cashflow Operating System — evaluate & optimize any asset</p>
            </div>
          </div>
        </div>

        {!result ? (
          <>
            {/* Input Card */}
            <Card className="bg-white/5 border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ClipboardPaste className="w-5 h-5 text-amber-400" />
                  Asset Evaluation
                </CardTitle>
                <CardDescription className="text-white/50">
                  Paste any report, website, proposal, email sequence, or sales asset. CCOS scores it across 8 dimensions and rewrites it to standard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/70 mb-2 block">Asset Type</Label>
                    <Select value={assetType} onValueChange={setAssetType}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/20">
                        {CCOS_ASSET_TYPES.map((t) => (
                          <SelectItem key={t} value={t} className="text-white focus:bg-white/10">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-white/70 mb-2 block">Asset Content</Label>
                  <Textarea
                    value={assetContent}
                    onChange={(e) => setAssetContent(e.target.value)}
                    placeholder="Paste the full text of the asset you want evaluated..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 min-h-[200px]"
                  />
                </div>

                <div>
                  <Label className="text-white/70 mb-2 block">Brand / Business Context (optional)</Label>
                  <Textarea
                    value={brandContext}
                    onChange={(e) => setBrandContext(e.target.value)}
                    placeholder="Who is served? What problem is solved? Any positioning notes..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 min-h-[80px]"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={runEvaluation}
                  disabled={loading || !assetContent.trim()}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-12"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Running CCOS Evaluation...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Evaluate Asset
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-white/50 mb-1">Overall CCOS Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-bold ${scoreColor(result.overall_score)}`}>{result.overall_score}</span>
                      <span className="text-white/40 text-lg">/ 100</span>
                    </div>
                  </div>
                  <div className="flex-1 max-w-md w-full">
                    <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                      <div className={`h-full ${scoreBg(result.overall_score)} transition-all duration-700`} style={{ width: `${result.overall_score}%` }} />
                    </div>
                  </div>
                  <Button variant="outline" onClick={reset} className="border-white/20 text-white/70 hover:bg-white/10">
                    <RefreshCw className="w-4 h-4 mr-2" /> New Evaluation
                  </Button>
                </div>
                <p className="text-white/70 mt-4 leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>

            {/* Dimension Scores */}
            <div className="grid sm:grid-cols-2 gap-4">
              {(result.dimensions || []).map((dim, i) => (
                <Card key={i} className="bg-white/5 border-white/10">
                  <CardContent className="pt-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{dim.dimension}</h3>
                      <span className={`text-2xl font-bold ${scoreColor(dim.score)}`}>{dim.score}</span>
                    </div>
                    <p className="text-sm text-white/60 mb-3">{dim.assessment}</p>
                    {dim.gaps?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Gaps</p>
                        <ul className="space-y-1">
                          {dim.gaps.map((g, j) => (
                            <li key={j} className="text-sm text-red-300/80 flex gap-2">
                              <span className="text-red-400">•</span> {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {dim.recommendations?.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Recommendations</p>
                        <ul className="space-y-1">
                          {dim.recommendations.map((r, j) => (
                            <li key={j} className="text-sm text-emerald-300/90 flex gap-2">
                              <ArrowRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400" /> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Final Checklist */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Final Evaluation Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {CCOS_FINAL_CHECKLIST.map((item) => {
                    const passed = result.final_checklist?.[item.key];
                    return (
                      <div key={item.key} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        {passed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                        )}
                        <span className={`text-sm ${passed ? "text-white/80" : "text-white/50"}`}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Rewritten Asset */}
            {result.rewritten_asset && (
              <Card className="bg-gradient-to-br from-emerald-500/10 to-slate-900 border-emerald-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      Rewritten Asset
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={copyRewrite} className="text-white/60 hover:text-white">
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{result.rewritten_asset}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Next Actions */}
            {result.next_actions?.length > 0 && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Next Actions</CardTitle>
                  <CardDescription className="text-white/50">Implementation over education — each action has a timeline, outcome, and measurement.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.next_actions.map((na, i) => (
                    <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-white font-medium mb-2">{na.action}</p>
                      <div className="grid sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-white/40">Timeline: </span>
                          <span className="text-white/70">{na.timeline}</span>
                        </div>
                        <div>
                          <span className="text-white/40">Outcome: </span>
                          <span className="text-white/70">{na.expected_outcome}</span>
                        </div>
                        <div>
                          <span className="text-white/40">Measurement: </span>
                          <span className="text-white/70">{na.measurement}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}