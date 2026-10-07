import React, { useState, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ArrowRight, Sparkles, BookOpen, FileText, Image,
  Video, Volume2, Globe, Users, Loader2, Check, Edit3,
  RefreshCw, Download, ExternalLink, BarChart2, Package,
  ShieldCheck, BookMarked, AlignLeft, Settings2, ChevronRight,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/BookEditor.desktop.css";
import "@/styles/BookEditor.tablet.css";
import "@/styles/BookEditor.mobile.css";

import TitleGenerator from "@/components/book/TitleGenerator.jsx";
import UnifiedOutlineGenerator from "@/components/book/UnifiedOutlineGenerator.jsx";
import SummaryGenerator from "@/components/book/SummaryGenerator.jsx";
import ManuscriptWriter from "@/components/book/ManuscriptWriter.jsx";
import ManuscriptFormatter from "@/components/book/ManuscriptFormatter.jsx";
import ManuscriptViewer from "@/components/book/ManuscriptViewer.jsx";
import CoverDesigner from "@/components/book/CoverDesigner.jsx";
import VideoCommercial from "@/components/book/VideoCommercial.jsx";
import AudiobookGenerator from "@/components/book/AudiobookGenerator.jsx";
import WebsiteBuilder from "@/components/book/WebsiteBuilder.jsx";
import EnhancedCharacterCreator from "@/components/book/EnhancedCharacterCreator.jsx";
import MarketingCampaignGenerator from "@/components/book/MarketingCampaignGenerator.jsx";
import MarketingLaunchPlan from "@/components/book/MarketingLaunchPlan.jsx";
import CollaborationPanel from "@/components/book/CollaborationPanel.jsx";
import SEOMetadataEditor from "@/components/book/SEOMetadataEditor.jsx";
import AgentAccessPanel from "@/components/book/AgentAccessPanel.jsx";
import BookLogoGenerator from "@/components/book/BookLogoGenerator.jsx";
import BookStatusScheduler from "@/components/book/BookStatusScheduler.jsx";

// ─────────────────────────────────────────────────────────────────────────────
const RAW_STEPS = [
  {
    id: "title",
    label: "Title & Characters",
    icon: Edit3,
    description: "Name your book and define the people who drive your story",
    hint: "AI suggests titles — then add characters with backstory, traits, and appearance",
    isDone: (b) => !!b?.title && b.title !== "Untitled Book",
  },
  {
    id: "outline",
    label: "Outline",
    icon: FileText,
    description: "Build your chapter-by-chapter roadmap",
    hint: "AI generates full story structure — edit to match your vision",
    isDone: (b) => (b?.table_of_contents?.length || 0) > 0,
  },
  {
    id: "summary",
    label: "Summary",
    icon: AlignLeft,
    description: "Write your back cover and marketing copy",
    hint: "Teaser, back cover (150 words), and extended synopsis",
    isDone: (b) => !!b?.book_summary,
  },
  {
    id: "manuscript",
    label: "Manuscript",
    icon: BookOpen,
    description: "Write your book, chapter by chapter",
    hint: "AI writes from your outline — edit chapters in real time",
    isDone: (b) => (b?.manuscript_chapters?.length || 0) > 0,
  },
  {
    id: "cover",
    label: "Cover Design",
    icon: Image,
    description: "Design your front and back cover",
    hint: "Generate multiple cover options and vote on your favourite",
    isDone: (b) => !!b?.front_cover_url,
  },
  {
    id: "logo",
    label: "Book Logo",
    icon: Sparkles,
    description: "Generate or upload your book logo",
    hint: "AI creates logos with your real name or pen name",
    isDone: (b) => !!b?.front_cover_url,
    optional: true,
  },
  {
    id: "format",
    label: "Format & Export",
    icon: RefreshCw,
    description: "Format your manuscript for KDP and ACX",
    hint: "One-click formatting to publishing platform standards",
    isDone: (b) => !!b?.formatted_manuscript,
  },
  {
    id: "audiobook",
    label: "Audiobook",
    icon: Volume2,
    description: "Produce your audiobook with AI narration",
    hint: "Select voice style — AI narrates your full manuscript",
    isDone: (b) => !!b?.audiobook_url,
    optional: true,
  },
  {
    id: "video",
    label: "Promo Video",
    icon: Video,
    description: "Create a cinematic promotional video",
    hint: "AI produces a book trailer for social and your website",
    isDone: (b) => !!b?.video_commercial_url,
    optional: true,
  },
  {
    id: "website",
    label: "Book Website",
    icon: Globe,
    description: "Launch your author website",
    hint: "Full site with cover, summary, promo video, and reader reviews",
    isDone: (b) => !!b?.website_config?.status,
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: BookMarked,
    description: "Plan your launch and run campaigns",
    hint: "Launch plan, campaigns, and scheduled status changes",
    isDone: (b) => ["marketing", "published"].includes(b?.status),
    optional: true,
  },
];

// Steps grouped into four clear stages, in this order
export const STAGES = [
  { id: "write",   label: "Write",   steps: ["title", "outline", "manuscript"] },
  { id: "produce", label: "Produce", steps: ["cover", "logo", "format", "audiobook"] },
  { id: "market",  label: "Market",  steps: ["summary", "video", "website", "marketing"] },
];

const STEPS = STAGES.flatMap(stage =>
  stage.steps.map(id => ({ ...RAW_STEPS.find(s => s.id === id), stage: stage.label }))
);

const STEP_IDS = STEPS.map(s => s.id);
const isStageStart = (list, idx) => idx === 0 || list[idx - 1].stage !== list[idx].stage;
// Tools hidden until "Advanced" is switched on
const ADVANCED_TABS = ["seo", "team", "agents"];

const UTILITY_TABS = [
  { id: "seo",       label: "SEO",         icon: Sparkles   },
  { id: "viewer",    label: "Read",         icon: Download   },
  { id: "team",      label: "Team",         icon: Users      },
  { id: "agents",    label: "Agent Access", icon: ShieldCheck },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar stepper — icon-only rail with tooltips
// ─────────────────────────────────────────────────────────────────────────────
function Stepper({ steps, book, activeStep, onStepClick, utilityTabs }) {
  const completedCount = steps.filter(s => s.isDone(book)).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="flex flex-col items-center w-full gap-0.5">
      {/* Progress arc */}
      <div className="mb-2 w-full flex flex-col items-center gap-1">
        <span className="text-white/25 text-[9px] font-medium uppercase tracking-wider">
          {completedCount}/{steps.length}
        </span>
        <div className="w-8 h-1 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Step icons */}
      {steps.map((step, idx) => {
      const done = step.isDone(book);
      const active = activeStep === step.id;
      const prevsDone = steps.slice(0, idx).filter(s => !s.optional).every(s => s.isDone(book));
      const accessible = idx === 0 || prevsDone || step.optional || done;

      return (
        <React.Fragment key={step.id}>
        {isStageStart(steps, idx) && (
          <span className={`text-[9px] font-bold uppercase tracking-wider text-amber-400/60 ${idx > 0 ? "mt-3 pt-2 border-t border-white/10 w-8 text-center" : ""}`}>
            {step.stage}
          </span>
        )}
        <div className="relative group/tip w-full flex flex-col items-center gap-0.5">
          <button
            onClick={() => accessible && onStepClick(step.id)}
            disabled={!accessible}
            title={step.label}
            className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              active
                ? "bg-amber-500 shadow-lg shadow-amber-500/40 text-black"
                : done
                ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                : accessible
                ? "bg-white/5 text-white/35 hover:bg-white/10 hover:text-white/70"
                : "text-white/12 cursor-not-allowed"
            }`}
          >
            {done && !active ? (
              <Check className="w-5 h-5" />
            ) : !accessible ? (
              <Lock className="w-4 h-4" />
            ) : (
              <step.icon className="w-5 h-5" />
            )}
            {active && (
              <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0.5 h-5 bg-amber-500 rounded-full" />
            )}
          </button>
          <span className={`text-[9px] font-semibold tabular-nums ${active ? "text-amber-400" : done ? "text-emerald-500/60" : accessible ? "text-white/20" : "text-white/10"}`}>
            {idx + 1}
          </span>
            {/* Tooltip */}
            <div className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 z-50
              bg-slate-800 border border-white/10 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg
              whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity shadow-xl">
              {step.label}{step.optional ? " (optional)" : ""}
            </div>
          </div>
        </React.Fragment>
        );
      })}

      {/* Divider */}
      <div className="my-2 w-6 h-px bg-white/10" />

      {/* Utility tab icons */}
      {utilityTabs.map(tab => (
        <div key={tab.id} className="relative group/tip w-full flex justify-center">
          <button
            onClick={() => onStepClick(tab.id)}
            title={tab.label}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              activeStep === tab.id
                ? "bg-slate-600/60 text-white"
                : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60"
            }`}
          >
            <tab.icon className="w-5 h-5" />
          </button>
          <div className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 z-50
            bg-slate-800 border border-white/10 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg
            whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity shadow-xl">
            {tab.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step content header (shown above each step's component)
// ─────────────────────────────────────────────────────────────────────────────
function StepBanner({ step, stepNumber, totalSteps }) {
  return (
    <div className="mb-6 pb-5 border-b border-white/6">
      <div className="flex items-center gap-2 text-white/25 text-xs mb-2 font-medium uppercase tracking-wider">
        <span className="text-amber-400/60">{step.stage}</span>
        <span>·</span>
        <span>Step {stepNumber} of {totalSteps}</span>
        {step.optional && (
          <>
            <span>·</span>
            <span className="text-amber-400/40">Optional</span>
          </>
        )}
      </div>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <step.icon className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-xl leading-tight">{step.label}</h2>
          <p className="text-white/40 text-sm mt-0.5">{step.description}</p>
          {step.hint && (
            <p className="text-amber-400/50 text-xs mt-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 shrink-0" />
              {step.hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step footer nav
// ─────────────────────────────────────────────────────────────────────────────
function StepNav({ steps, currentStepId, book, onNavigate }) {
  const idx = steps.findIndex(s => s.id === currentStepId);
  if (idx < 0) return null;

  const currentStep = steps[idx];
  const isDone = currentStep.isDone(book);
  const nextStep = steps[idx + 1] || null;
  const prevStep = steps[idx - 1] || null;

  // Can go next if current is done, or if next is optional, or current is optional
  const canGoNext = isDone || currentStep.optional;

  return (
    <div className="mt-10 pt-6 border-t border-white/6 flex items-center justify-between gap-4">
      <div>
        {prevStep && (
          <Button variant="ghost" onClick={() => onNavigate(prevStep.id)}
            className="text-white/30 hover:text-white hover:bg-white/6 gap-1.5 px-3">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="text-sm">{prevStep.label}</span>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {!isDone && !currentStep.optional && (
          <p className="text-white/20 text-xs hidden sm:block">Complete this step to continue</p>
        )}
        {!isDone && currentStep.optional && (
          <p className="text-white/20 text-xs hidden sm:block">Optional — skip if not needed</p>
        )}

        {nextStep ? (
          <Button
            onClick={() => onNavigate(nextStep.id)}
            disabled={!canGoNext}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold border-0 gap-2 shadow-lg shadow-amber-500/20"
          >
            {nextStep.label}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        ) : isDone ? (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-medium px-4 py-2 rounded-lg">
            <Check className="w-4 h-4" />
            Production complete!
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
export default function BookEditor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");

  const [activeTab, setActiveTab] = useState("title");
  const [user, setUser] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(() => localStorage.getItem("bookEditorAdvanced") === "1");
  const toggleAdvanced = () => {
    const next = !showAdvanced;
    setShowAdvanced(next);
    localStorage.setItem("bookEditorAdvanced", next ? "1" : "0");
  };
  const visibleSteps = showAdvanced ? STEPS : STEPS.filter(s => !s.optional);
  const visibleTabs = showAdvanced ? UTILITY_TABS : UTILITY_TABS.filter(t => !ADVANCED_TABS.includes(t.id));

  // Load current user
  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => setUser(null));
  }, []);

  // No book selected — go back to the books list instead of showing "not found"
  useEffect(() => {
    if (!bookId) navigate(createPageUrl("Books"), { replace: true });
  }, [bookId]);

  const { data: bookRaw, isLoading } = useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      if (!bookId) return null;
      try {
        const results = await base44.entities.Book.filter({ id: bookId });
        return results[0] || null;
      } catch { return null; }
    },
    enabled: !!bookId
  });

  const book = Array.isArray(bookRaw) ? bookRaw[0] : bookRaw;

  const updateBookMutation = useMutation({
    mutationFn: (data) => base44.entities.Book.update(bookId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['book', bookId] })
  });

  const handleUpdate = async (data) => {
    await updateBookMutation.mutateAsync(data);
  };

  const currentStepDef = STEPS.find(s => s.id === activeTab) || null;
  const currentStepIdx = visibleSteps.findIndex(s => s.id === activeTab);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
    </div>
  );

  if ((!book || !book.id) && !isLoading) return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-semibold text-white mb-2">Book not found</h2>
      <p className="text-white/40 mb-5">This book may have been deleted or you don't have access.</p>
      <Button onClick={() => navigate(createPageUrl("Books"))}
        className="bg-gradient-to-r from-amber-500 to-orange-500 text-black border-0 font-semibold">
        Back to Books
      </Button>
    </div>
  );

  return (
    <div className="book-editor-container">

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="book-editor-topbar">
        <div className="book-editor-topbar-left">
          <button onClick={() => navigate(createPageUrl("Books"))}
            className="book-editor-topbar-back">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="book-editor-topbar-title">{book.title || "Untitled Book"}</h1>
          {book.category && (
            <Badge className="book-editor-hidden-mobile bg-white/8 text-white/40 border-0 text-xs shrink-0">{book.category}</Badge>
          )}
        </div>

        {/* Header actions */}
        <div className="book-editor-topbar-right">
          <button onClick={() => navigate(`/BookHealthCheck?id=${bookId}`)}
            className="book-editor-topbar-action"
            title="Health Check">
            <BarChart2 className="w-4 h-4" />
          </button>
          <button onClick={() => navigate(`/DistributionDashboard?id=${bookId}`)}
            className="book-editor-topbar-action"
            title="Distribute">
            <Package className="w-4 h-4" />
          </button>
          <button onClick={() => navigate(`/BookWebsite?id=${bookId}`)}
            className="book-editor-topbar-action"
            title="View Site">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="book-editor-body">

        {/* ── Mobile step selector (top scroll row) ───────────────────────── */}
        <div className="book-editor-mobile-selector">
          {visibleSteps.map((step, idx) => {
            const done = step.isDone(book);
            const active = activeTab === step.id;
            const prevsDone = visibleSteps.slice(0, idx).filter(s => !s.optional).every(s => s.isDone(book));
            const accessible = idx === 0 || prevsDone || step.optional || done;
            return (
              <React.Fragment key={step.id}>
              {isStageStart(visibleSteps, idx) && (
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-amber-400/60 px-1">{step.stage}</span>
              )}
              <button
                onClick={() => accessible && setActiveTab(step.id)}
                disabled={!accessible}
                className={`book-editor-mobile-selector-item ${active ? 'active' : ''} ${done && !active ? 'completed' : ''}`}
              >
                {done && !active ? <Check className="w-3 h-3" /> : <step.icon className="w-3 h-3" />}
                <span>{step.label}</span>
              </button>
              </React.Fragment>
            );
          })}
          <div className="w-px h-4 bg-white/10 shrink-0 mx-1" />
          {visibleTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`book-editor-mobile-selector-item ${activeTab === tab.id ? 'active' : ''}`}>
              <tab.icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          ))}
          <button onClick={toggleAdvanced}
            className={`book-editor-mobile-selector-item ${showAdvanced ? 'active' : ''}`}>
            <SlidersHorizontal className="w-3 h-3" />
            <span>{showAdvanced ? "Hide advanced" : "Advanced"}</span>
          </button>
        </div>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main className="book-editor-main">
          <div className={`book-editor-main-content ${["cover", "logo", "website", "viewer", "marketing"].includes(activeTab) ? "wide" : ""}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
              >
                {/* Banner for main steps */}
                {currentStepDef && (
                  <StepBanner
                    step={currentStepDef}
                    stepNumber={currentStepIdx + 1}
                    totalSteps={visibleSteps.length}
                  />
                )}

                {/* Step content */}
                {activeTab === "title" && (
                  <div className="space-y-8">
                    <TitleGenerator book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />
                    <EnhancedCharacterCreator book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />
                  </div>
                )}
                {activeTab === "outline"    && <UnifiedOutlineGenerator book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />}
                {activeTab === "summary"    && <SummaryGenerator book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />}
                {activeTab === "manuscript" && <ManuscriptWriter book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />}
                {activeTab === "cover"      && <CoverDesigner book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />}
                {activeTab === "logo"       && user && <BookLogoGenerator book={book} user={user} onUpdate={handleUpdate} />}
                {activeTab === "format"     && <ManuscriptFormatter book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />}
                {activeTab === "audiobook"  && <AudiobookGenerator book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />}
                {activeTab === "video"      && <VideoCommercial book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />}
                {activeTab === "website"    && <WebsiteBuilder book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />}

                {/* Utility tabs */}
                {activeTab === "seo"       && <SEOMetadataEditor book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />}
                {activeTab === "viewer"    && <ManuscriptViewer book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />}
                {activeTab === "marketing" && (
                  <div className="space-y-6">
                    <BookStatusScheduler book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />
                    <MarketingLaunchPlan book={book} />
                    <MarketingCampaignGenerator book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />
                  </div>
                )}
                {activeTab === "team"      && <CollaborationPanel book={book} />}
                {activeTab === "agents"    && <AgentAccessPanel book={book} />}

                {/* Next / prev footer — only for main pipeline steps */}
                {currentStepDef && (
                  <StepNav steps={visibleSteps} currentStepId={activeTab} book={book} onNavigate={setActiveTab} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* ── Sidebar — icon rail (right side) ────────────────────────────── */}
        <div className="book-editor-sidebar">
          <Stepper
            steps={visibleSteps}
            book={book}
            activeStep={activeTab}
            onStepClick={setActiveTab}
            utilityTabs={visibleTabs}
          />
          <button onClick={toggleAdvanced} title={showAdvanced ? "Hide advanced tools" : "Show advanced tools"}
            className={`mt-2 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${showAdvanced ? "bg-amber-500/15 text-amber-400" : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60"}`}>
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}