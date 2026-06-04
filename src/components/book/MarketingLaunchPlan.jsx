import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Rocket, Loader2, Target, TrendingUp, Zap, DollarSign,
  BarChart2, CheckCircle2, Calendar, Lightbulb, Users,
  ChevronDown, ChevronUp, Clock, ArrowRight, Flag, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRIORITY_COLORS = {
  high:   "bg-red-500/20 text-red-300 border-red-500/30",
  medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  low:    "bg-slate-500/20 text-slate-300 border-slate-500/30"
};

const PHASE_COLORS = ["from-violet-500/30 to-purple-500/10 border-violet-500/40", "from-amber-500/30 to-orange-500/10 border-amber-500/40", "from-emerald-500/30 to-teal-500/10 border-emerald-500/40"];
const PHASE_ACCENTS = ["text-violet-400", "text-amber-400", "text-emerald-400"];
const PHASE_STEP_BG = ["bg-violet-500/20", "bg-amber-500/20", "bg-emerald-500/20"];
const PHASE_ICONS = [Calendar, Rocket, TrendingUp];

function StepRow({ step, index, accentClass, stepBg, phaseIndex }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-white/5 transition-colors"
      >
        {/* Step number */}
        <div className={`w-8 h-8 rounded-full ${stepBg} flex items-center justify-center shrink-0 font-bold text-sm ${accentClass}`}>
          {index + 1}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{step.action}</span>
            {step.priority && (
              <Badge className={`text-xs border ${PRIORITY_COLORS[step.priority] || PRIORITY_COLORS.medium}`}>
                {step.priority}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {step.week && (
              <span className="text-xs text-white/40 flex items-center gap-1">
                <Clock className="w-3 h-3" />{step.week}
              </span>
            )}
            {step.platform && (
              <span className={`text-xs font-medium ${accentClass} opacity-70`}>{step.platform}</span>
            )}
            {step.estimated_cost && (
              <span className="text-xs text-emerald-400/80 font-medium">{step.estimated_cost}</span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <div className="shrink-0 text-white/30">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/10">
              {step.detail && (
                <p className="text-sm text-white/60 leading-relaxed pt-3">{step.detail}</p>
              )}
              {step.expected_outcome && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-300 mb-0.5">Expected Outcome</p>
                    <p className="text-xs text-emerald-300/70">{step.expected_outcome}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PhaseCard({ phase, phaseIndex, isActive, onToggle }) {
  const PhaseIcon = PHASE_ICONS[phaseIndex] || Calendar;
  const accent = PHASE_ACCENTS[phaseIndex] || "text-violet-400";
  const stepBg = PHASE_STEP_BG[phaseIndex] || "bg-violet-500/20";
  const gradient = PHASE_COLORS[phaseIndex] || PHASE_COLORS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: phaseIndex * 0.08 }}
      className={`rounded-2xl border bg-gradient-to-br ${gradient} overflow-hidden`}
    >
      {/* Phase Header */}
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
        onClick={onToggle}
      >
        <div className={`w-10 h-10 rounded-xl ${stepBg} flex items-center justify-center shrink-0`}>
          <PhaseIcon className={`w-5 h-5 ${accent}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-base font-bold text-white">{phase.name}</span>
            <Badge className={`text-xs ${stepBg} ${accent} border-0`}>{phase.duration}</Badge>
          </div>
          {phase.goal && <p className="text-xs text-white/50 mt-0.5">{phase.goal}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs font-semibold ${accent}`}>{phase.steps?.length || 0} steps</span>
          {isActive ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
        </div>
      </button>

      {/* Phase Steps */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-2">
              {(phase.steps || []).map((step, i) => (
                <StepRow key={i} step={step} index={i} accentClass={accent} stepBg={stepBg} phaseIndex={phaseIndex} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MarketingLaunchPlan({ book }) {
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("timeline");
  const [openPhases, setOpenPhases] = useState({ 0: true });

  const generatePlan = async () => {
    setGenerating(true);
    setError(null);
    const res = await base44.functions.invoke('marketingLaunchPlan', { book_id: book.id });
    setPlan(res.data.plan);
    setOpenPhases({ 0: true });
    setGenerating(false);
  };

  const togglePhase = (i) => setOpenPhases(prev => ({ ...prev, [i]: !prev[i] }));
  const hasAudienceData = book.target_audience?.age_range || (book.target_audience?.interests || []).length > 0 || book.category;
  const totalSteps = plan?.phases?.reduce((sum, p) => sum + (p.steps?.length || 0), 0) || 0;

  return (
    <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI Marketing Launch Plan</h3>
            <p className="text-xs text-white/40">Step-by-step roadmap from your audience & category data</p>
          </div>
        </div>
        {plan && (
          <Button onClick={generatePlan} disabled={generating} variant="outline" size="sm"
            className="border-white/20 text-white/70 hover:bg-white/10">
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            <span className="ml-1.5">Regenerate</span>
          </Button>
        )}
      </div>

      <div className="p-6">
        {!plan ? (
          /* ── EMPTY STATE ── */
          <div className="text-center py-10 space-y-5">
            {!hasAudienceData && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left max-w-md mx-auto">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-300 font-semibold">Add audience data for a better plan</p>
                  <p className="text-xs text-white/50 mt-1">Fill in your target audience (age range, interests, demographics) in the book settings to get a more tailored launch strategy.</p>
                </div>
              </div>
            )}
            <Button onClick={generatePlan} disabled={generating}
              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0 px-8 py-3 text-base">
              {generating ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Building your launch plan...</>
              ) : (
                <><Rocket className="w-5 h-5 mr-2" />Generate Launch Plan</>
              )}
            </Button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <p className="text-xs text-white/30 max-w-sm mx-auto">
              AI analyzes your genre, audience demographics, and book details to craft a phased launch strategy with exact steps, costs, and KPIs.
            </p>
          </div>
        ) : (
          /* ── PLAN VIEW ── */
          <div className="space-y-5">
            {/* Summary Banner */}
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <p className="text-sm text-white/80 leading-relaxed">{plan.executive_summary}</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-2xl font-bold text-violet-400">{plan.phases?.length || 0}</p>
                <p className="text-xs text-white/40 mt-0.5">Phases</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-2xl font-bold text-amber-400">{totalSteps}</p>
                <p className="text-xs text-white/40 mt-0.5">Action Steps</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-2xl font-bold text-emerald-400">{plan.kpis?.length || 0}</p>
                <p className="text-xs text-white/40 mt-0.5">KPIs Tracked</p>
              </div>
            </div>

            {/* Quick Wins */}
            {plan.quick_wins?.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-300">Quick Wins — Start Today</span>
                </div>
                <div className="space-y-1.5">
                  {plan.quick_wins.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      {w}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full bg-white/5 border border-white/10">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="audience">Audience</TabsTrigger>
                <TabsTrigger value="budget">Budget</TabsTrigger>
                <TabsTrigger value="kpis">KPIs</TabsTrigger>
              </TabsList>

              {/* ── TIMELINE (phases) ── */}
              <TabsContent value="timeline" className="space-y-3 mt-4">
                {/* Phase progress connector */}
                <div className="flex items-center justify-center gap-1 mb-5">
                  {plan.phases?.map((phase, i) => (
                    <React.Fragment key={i}>
                      <button
                        onClick={() => togglePhase(i)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${openPhases[i] ? PHASE_STEP_BG[i] + " " + PHASE_ACCENTS[i] : "bg-white/5 text-white/40"}`}
                      >
                        <Flag className="w-3 h-3" />{phase.name}
                      </button>
                      {i < plan.phases.length - 1 && <ArrowRight className="w-3 h-3 text-white/20" />}
                    </React.Fragment>
                  ))}
                </div>
                {plan.phases?.map((phase, i) => (
                  <PhaseCard
                    key={i}
                    phase={phase}
                    phaseIndex={i}
                    isActive={!!openPhases[i]}
                    onToggle={() => togglePhase(i)}
                  />
                ))}
              </TabsContent>

              {/* ── AUDIENCE ── */}
              <TabsContent value="audience" className="space-y-4 mt-4">
                {plan.target_audience_insights && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-violet-400" />
                      <span className="text-sm font-bold text-white">Audience Buying Behavior</span>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed">{plan.target_audience_insights}</p>
                  </div>
                )}
                {plan.key_messages?.length > 0 && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-violet-400" />
                      <span className="text-sm font-bold text-white">Key Messaging Angles</span>
                    </div>
                    <div className="space-y-2">
                      {plan.key_messages.map((msg, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                          <span className="w-6 h-6 rounded-full bg-violet-500/30 text-violet-300 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                          <p className="text-sm text-white/70">{msg}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ── BUDGET ── */}
              <TabsContent value="budget" className="space-y-3 mt-4">
                {plan.budget_breakdown?.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-white">{item.category}</span>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                        {item.recommended_spend}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">{item.rationale}</p>
                  </motion.div>
                ))}
              </TabsContent>

              {/* ── KPIs ── */}
              <TabsContent value="kpis" className="space-y-3 mt-4">
                {plan.kpis?.map((kpi, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-violet-400 shrink-0" />
                        <span className="text-sm font-semibold text-white">{kpi.metric}</span>
                      </div>
                      <Badge className="bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs shrink-0">{kpi.target}</Badge>
                    </div>
                    {kpi.tracking_method && (
                      <p className="text-xs text-white/40 mt-2 ml-6 flex items-center gap-1">
                        <Target className="w-3 h-3" /> {kpi.tracking_method}
                      </p>
                    )}
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}