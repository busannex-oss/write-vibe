import React, { useState, useEffect } from "react";
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
import CollaborationPanel from "@/components/book/CollaborationPanel.jsx";
import SEOMetadataEditor from "@/components/book/SEOMetadataEditor.jsx";
import AgentAccessPanel from "@/components/book/AgentAccessPanel.jsx";
import BookLogoGenerator from "@/components/book/BookLogoGenerator.jsx";

// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: "title",
    label: "Title",
    icon: Edit3,
    description: "Give your book a compelling, marketable title",
    hint: "AI suggests 8 options — or type your own",
    isDone: (b) => !!b?.title && b.title !== "Untitled Book",
  },
  {
    id: "characters",
    label: "Characters",
    icon: Users,
    description: "Define the people who drive your story",
    hint: "Add characters with backstory, traits, and appearance",
    isDone: (b) => (b?.characters?.length || 0) > 0,
    optional: true,
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
];

const STEP_IDS = STEPS.map(s => s.id);

const UTILITY_TABS = [
  { id: "seo",       label: "SEO",         icon: Sparkles   },
  { id: "viewer",    label: "Read",         icon: Download   },
  { id: "marketing", label: "Marketing",    icon: BookMarked },
  { id: "team",      label: "Team",         icon: Users      },
  { id: "agents",    label: "Agent Access", icon: ShieldCheck },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar stepper
// ─────────────────────────────────────────────────────────────────────────────
function Stepper({ steps, book, activeStep, onStepClick }) {
  const completedCount = steps.filter(s => s.isDone(book)).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <aside className="w-56 shrink-0 flex flex-col gap-1">
      {/* Mini progress summary */}
      <div className="mb-3 px-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/30 text-xs font-medium uppercase tracking-wider">Progress</span>
          <span className="text-white/40 text-xs">{completedCount}/{steps.length}</span>
        </div>
        <Progress value={progress} className="h-1 bg-white/8" />
      </div>

      {steps.map((step, idx) => {
        const done = step.isDone(book);
        const active = activeStep === step.id;
        const prevsDone = steps.slice(0, idx).filter(s => !s.optional).every(s => s.isDone(book));
        const accessible = idx === 0 || prevsDone || step.optional || done;

        return (
          <button
            key={step.id}
            onClick={() => accessible && onStepClick(step.id)}
            disabled={!accessible}
            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left w-full ${
              active
                ? "bg-amber-500/12 text-white"
                : done
                ? "text-emerald-400/80 hover:bg-emerald-500/8 hover:text-emerald-300"
                : accessible
                ? "text-white/40 hover:text-white/70 hover:bg-white/5"
                : "text-white/15 cursor-not-allowed"
            }`}
          >
            {/* Step indicator circle */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
              active
                ? "bg-amber-500 shadow-lg shadow-amber-500/30"
                : done
                ? "bg-emerald-500/20 border border-emerald-500/40"
                : accessible
                ? "bg-white/8 border border-white/15"
                : "bg-white/4 border border-white/8"
            }`}>
              {done && !active ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : !accessible ? (
                <Lock className="w-3 h-3 text-white/20" />
              ) : active ? (
                <step.icon className="w-3.5 h-3.5 text-white" />
              ) : (
                <span className="text-xs font-semibold text-white/40">{idx + 1}</span>
              )}
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium truncate">{step.label}</span>
                {step.optional && !done && (
                  <span className="text-[9px] text-white/20 font-normal shrink-0">opt</span>
                )}
              </div>
            </div>

            {/* Active indicator bar */}
            {active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-500 rounded-full" />
            )}
          </button>
        );
      })}
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step content header (shown above each step's component)
// ─────────────────────────────────────────────────────────────────────────────
function StepBanner({ step, stepNumber, totalSteps }) {
  return (
    <div className="mb-6 pb-5 border-b border-white/6">
      <div className="flex items-center gap-2 text-white/25 text-xs mb-2 font-medium uppercase tracking-wider">
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
function StepNav({ currentStepId, book, onNavigate }) {
  const idx = STEP_IDS.indexOf(currentStepId);
  if (idx < 0) return null;

  const currentStep = STEPS[idx];
  const isDone = currentStep.isDone(book);
  const nextStep = STEPS[idx + 1] || null;
  const prevStep = STEPS[idx - 1] || null;

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

  // Load current user
  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => setUser(null));
  }, []);

  const { data: bookRaw, isLoading } = useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      if (!bookId) return null;
      try {
        const allBooks = await base44.entities.Book.list();
        return allBooks.find(b => b.id === bookId) || null;
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
  const currentStepIdx = STEP_IDS.indexOf(activeTab);

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
    <div className="min-h-screen flex flex-col">

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-white/6 bg-slate-900/40 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={() => navigate(createPageUrl("Books"))}
            className="flex items-center gap-1.5 text-white/35 hover:text-white transition-colors text-sm shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">My Books</span>
          </button>
          <div className="w-px h-4 bg-white/10 shrink-0" />
          <h1 className="text-white font-semibold text-sm truncate">{book.title || "Untitled Book"}</h1>
          {book.category && (
            <Badge className="bg-white/8 text-white/40 border-0 text-xs shrink-0 hidden md:flex">{book.category}</Badge>
          )}
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => navigate(`/BookHealthCheck?id=${bookId}`)}
            className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-xs px-2 py-1.5 rounded-lg hover:bg-white/5">
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Health</span>
          </button>
          <button onClick={() => navigate(`/DistributionDashboard?id=${bookId}`)}
            className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-xs px-2 py-1.5 rounded-lg hover:bg-white/5">
            <Package className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Distribute</span>
          </button>
          <Button size="sm" onClick={() => navigate(`/BookWebsite?id=${bookId}`)}
            className="bg-white/8 hover:bg-white/12 text-white border-0 text-xs h-8 gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            View Site
          </Button>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-1">

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <div className="w-56 shrink-0 border-r border-white/6 bg-slate-900/20 flex flex-col pt-6 pb-6 px-3 hidden lg:flex sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <Stepper
            steps={STEPS}
            book={book}
            activeStep={activeTab}
            onStepClick={setActiveTab}
          />

          {/* Divider */}
          <div className="my-4 flex items-center gap-2 px-1">
            <div className="flex-1 h-px bg-white/6" />
            <span className="text-white/20 text-[10px] uppercase tracking-wider font-medium">Tools</span>
            <div className="flex-1 h-px bg-white/6" />
          </div>

          {/* Utility tools */}
          <div className="flex flex-col gap-0.5">
            {UTILITY_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left w-full text-sm ${
                  activeTab === tab.id
                    ? "bg-slate-700/50 text-white"
                    : "text-white/30 hover:text-white/60 hover:bg-white/4"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Mobile step selector (top scroll row) ───────────────────────── */}
        <div className="lg:hidden w-full border-b border-white/6 overflow-x-auto flex items-center gap-1 px-4 py-2 bg-slate-900/30 sticky top-14 z-10">
          {STEPS.map((step, idx) => {
            const done = step.isDone(book);
            const active = activeTab === step.id;
            const prevsDone = STEPS.slice(0, idx).filter(s => !s.optional).every(s => s.isDone(book));
            const accessible = idx === 0 || prevsDone || step.optional || done;
            return (
              <button
                key={step.id}
                onClick={() => accessible && setActiveTab(step.id)}
                disabled={!accessible}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shrink-0 text-xs font-medium transition-all border ${
                  active ? "bg-amber-500/15 border-amber-500/40 text-white"
                  : done ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                  : accessible ? "bg-white/5 border-white/10 text-white/50"
                  : "bg-transparent border-transparent text-white/15 cursor-not-allowed"
                }`}
              >
                {done && !active ? <Check className="w-3 h-3" /> : <step.icon className="w-3 h-3" />}
                <span>{step.label}</span>
              </button>
            );
          })}
          <div className="w-px h-4 bg-white/10 shrink-0 mx-1" />
          {UTILITY_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shrink-0 text-xs border transition-all ${
                activeTab === tab.id ? "bg-slate-700/60 border-white/20 text-white" : "bg-transparent border-transparent text-white/25 hover:text-white/50"
              }`}>
              <tab.icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
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
                    totalSteps={STEPS.length}
                  />
                )}

                {/* Step content */}
                {activeTab === "title"      && <TitleGenerator book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />}
                {activeTab === "characters" && <EnhancedCharacterCreator book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />}
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
                {activeTab === "marketing" && <MarketingCampaignGenerator book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />}
                {activeTab === "team"      && <CollaborationPanel book={book} />}
                {activeTab === "agents"    && <AgentAccessPanel book={book} />}

                {/* Next / prev footer — only for main pipeline steps */}
                {currentStepDef && (
                  <StepNav currentStepId={activeTab} book={book} onNavigate={setActiveTab} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}