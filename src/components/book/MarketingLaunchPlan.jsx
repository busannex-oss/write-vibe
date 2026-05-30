import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Rocket, Loader2, Target, TrendingUp, Zap, DollarSign,
  BarChart2, CheckCircle2, Calendar, Lightbulb, Users, ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRIORITY_COLORS = {
  high: "bg-red-500/20 text-red-300 border-red-500/30",
  medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  low: "bg-slate-500/20 text-slate-300 border-slate-500/30"
};

function PhaseSteps({ steps }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={i} className="rounded-lg bg-white/5 border border-white/10 overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-amber-400">{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-white">{step.action}</span>
                {step.priority && (
                  <Badge className={`text-xs border ${PRIORITY_COLORS[step.priority] || PRIORITY_COLORS.medium}`}>
                    {step.priority}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                {step.week && <span className="text-xs text-white/40">{step.week}</span>}
                {step.platform && <span className="text-xs text-amber-400/60">{step.platform}</span>}
                {step.estimated_cost && <span className="text-xs text-emerald-400/70">{step.estimated_cost}</span>}
              </div>
            </div>
            {expanded === i ? <ChevronUp className="w-4 h-4 text-white/30 shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/30 shrink-0" />}
          </button>
          <AnimatePresence>
            {expanded === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-2 border-t border-white/10">
                  {step.detail && (
                    <p className="text-sm text-white/60 mt-3">{step.detail}</p>
                  )}
                  {step.expected_outcome && (
                    <div className="flex items-start gap-2 mt-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-300/70">{step.expected_outcome}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default function MarketingLaunchPlan({ book }) {
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  const generatePlan = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('marketingLaunchPlan', { book_id: book.id });
      setPlan(res.data.plan);
    } catch (e) {
      setError("Failed to generate plan. Please try again.");
    }
    setGenerating(false);
  };

  const hasAudienceData = book.target_audience?.age_range ||
    (book.target_audience?.interests || []).length > 0 ||
    book.category;

  return (
    <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 border-violet-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Rocket className="w-5 h-5 text-violet-400" />
          AI Marketing Launch Plan
        </CardTitle>
        <CardDescription className="text-white/50">
          Step-by-step launch roadmap built from your book's audience and category data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!plan ? (
          <div className="text-center py-8 space-y-4">
            {!hasAudienceData && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-left max-w-md mx-auto">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-300 font-medium">Add audience data for a better plan</p>
                  <p className="text-xs text-white/50 mt-1">Fill in your target audience (age range, interests, demographics) in the book settings to get a more tailored launch strategy.</p>
                </div>
              </div>
            )}
            <Button
              onClick={generatePlan}
              disabled={generating}
              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0"
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Building Launch Plan...</>
              ) : (
                <><Rocket className="w-4 h-4 mr-2" />Generate Launch Plan</>
              )}
            </Button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <p className="text-xs text-white/40">
              AI analyzes your genre, audience demographics, and book details to build a phased launch strategy
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={generatePlan}
                disabled={generating}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                {generating ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Zap className="w-3 h-3 mr-1.5" />}
                Regenerate
              </Button>
            </div>

            {/* Executive Summary */}
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <p className="text-sm text-white/80 leading-relaxed">{plan.executive_summary}</p>
            </div>

            {/* Quick Wins */}
            {plan.quick_wins?.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-300">Quick Wins — Start Today</span>
                </div>
                <ul className="space-y-1.5">
                  {plan.quick_wins.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-amber-400 mt-0.5">→</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Tabs defaultValue="phases" className="w-full">
              <TabsList className="grid grid-cols-4 w-full bg-white/5">
                <TabsTrigger value="phases">Phases</TabsTrigger>
                <TabsTrigger value="audience">Audience</TabsTrigger>
                <TabsTrigger value="budget">Budget</TabsTrigger>
                <TabsTrigger value="kpis">KPIs</TabsTrigger>
              </TabsList>

              {/* Phases */}
              <TabsContent value="phases" className="space-y-4 mt-4">
                {plan.phases?.map((phase, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{phase.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/40">{phase.duration}</span>
                          {phase.goal && <span className="text-xs text-violet-400/70">· {phase.goal}</span>}
                        </div>
                      </div>
                    </div>
                    <PhaseSteps steps={phase.steps || []} />
                  </div>
                ))}
              </TabsContent>

              {/* Audience Insights */}
              <TabsContent value="audience" className="space-y-4 mt-4">
                {plan.target_audience_insights && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-violet-400" />
                      <span className="text-sm font-semibold text-white">Audience Buying Behavior</span>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed">{plan.target_audience_insights}</p>
                  </div>
                )}
                {plan.key_messages?.length > 0 && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-violet-400" />
                      <span className="text-sm font-semibold text-white">Key Messaging Angles</span>
                    </div>
                    <ul className="space-y-2">
                      {plan.key_messages.map((msg, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                          <span className="text-violet-400 font-bold shrink-0">{i + 1}.</span>
                          {msg}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              {/* Budget */}
              <TabsContent value="budget" className="space-y-3 mt-4">
                {plan.budget_breakdown?.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-white">{item.category}</span>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-xs">
                        {item.recommended_spend}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/50">{item.rationale}</p>
                  </div>
                ))}
              </TabsContent>

              {/* KPIs */}
              <TabsContent value="kpis" className="space-y-3 mt-4">
                {plan.kpis?.map((kpi, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-violet-400 shrink-0" />
                        <span className="text-sm font-semibold text-white">{kpi.metric}</span>
                      </div>
                      <Badge className="bg-violet-500/20 text-violet-300 border-0 text-xs shrink-0">
                        {kpi.target}
                      </Badge>
                    </div>
                    {kpi.tracking_method && (
                      <p className="text-xs text-white/40 mt-2 ml-6">How to track: {kpi.tracking_method}</p>
                    )}
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}