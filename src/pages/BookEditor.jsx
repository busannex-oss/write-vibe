import React, { useState } from "react";
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
  ShieldCheck, ChevronRight, BookMarked, AlignLeft
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

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  {
    id: "title",
    label: "Title",
    icon: Edit3,
    description: "Give your book a compelling, marketable title",
    hint: "AI will suggest 8 options — or type your own",
    isDone: (b) => !!b?.title && b.title !== "Untitled Book",
  },
  {
    id: "characters",
    label: "Characters",
    icon: Users,
    description: "Define the people who drive your story",
    hint: "Add main and supporting characters with backstory and traits",
    isDone: (b) => (b?.characters?.length || 0) > 0,
    optional: true,
  },
  {
    id: "outline",
    label: "Outline",
    icon: FileText,
    description: "Build your chapter-by-chapter roadmap",
    hint: "AI generates a complete story structure — edit to match your vision",
    isDone: (b) => (b?.table_of_contents?.length || 0) > 0,
  },
  {
    id: "summary",
    label: "Summary",
    icon: AlignLeft,
    description: "Write your back cover and marketing copy",
    hint: "Three versions: social teaser, back cover (150 words), extended synopsis",
    isDone: (b) => !!b?.book_summary,
  },
  {
    id: "manuscript",
    label: "Manuscript",
    icon: BookOpen,
    description: "Write your book, chapter by chapter",
    hint: "AI writes each chapter from your outline — edit in real time",
    isDone: (b) => (b?.manuscript_chapters?.length || 0) > 0,
  },
  {
    id: "cover",
    label: "Cover Design",
    icon: Image,
    description: "Design your front and back cover",
    hint: "Generate multiple options — vote on your favourite",
    isDone: (b) => !!b?.front_cover_url,
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
    label: "Book Promo Video",
    icon: Video,
    description: "Create a promotional video for your book",
    hint: "AI produces a cinematic trailer for social and your website",
    isDone: (b) => !!b?.video_commercial_url,
    optional: true,
  },
  {
    id: "website",
    label: "Book Website",
    icon: Globe,
    description: "Launch your author website with promo video embedded",
    hint: "Full book site with cover, summary, links, video, and reader reviews",
    isDone: (b) => !!b?.website_config?.status,
  },
];

const STEP_IDS = STEPS.map(s => s.id);

// Steps that are "utility" tabs — accessible anytime via the header
const UTILITY_TABS = [
  { id: "seo", label: "SEO", icon: Sparkles },
  { id: "team", label: "Team", icon: Users },
  { id: "agents", label: "Agent Access", icon: ShieldCheck },
  { id: "viewer", label: "View & Export", icon: Download },
  { id: "marketing", label: "Marketing", icon: BookMarked },
];

// ── Step Progress Rail ────────────────────────────────────────────────────────
function StepRail({ steps, book, activeStep, onStepClick }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1 scrollbar-none">
      {steps.map((step, idx) => {
        const done = step.isDone(book);
        const active = activeStep === step.id;
        const prevsDone = steps.slice(0, idx).filter(s => !s.optional).every(s => s.isDone(book));
        const accessible = idx === 0 || prevsDone || step.optional || done;

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => accessible && onStepClick(step.id)}
              disabled={!accessible}
              title={!accessible ? "Complete previous steps first" : step.description}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all whitespace-nowrap shrink-0 text-sm font-medium ${
                active
                  ? "bg-amber-500/15 border-amber-500/50 text-white"
                  : done
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15"
                  : accessible
                  ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                  : "bg-white/3 border-white/5 text-white/20 cursor-not-allowed"
              }`}
            >
              {done && !active ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <step.icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-amber-400" : ""}`} />
              )}
              <span>{step.label}</span>
              {step.optional && !done && (
                <span className="text-[9px] text-white/25 font-normal">(opt)</span>
              )}
            </button>
            {idx < steps.length - 1 && (
              <ChevronRight className="w-3 h-3 text-white/15 shrink-0 mx-0.5" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Step Footer — Next / Prev navigation ─────────────────────────────────────
function StepFooter({ currentStepId, book, onNavigate }) {
  const idx = STEP_IDS.indexOf(currentStepId);
  if (idx < 0) return null;

  const currentStep = STEPS[idx];
  const isDone = currentStep.isDone(book);
  const nextStep = idx < STEPS.length - 1 ? STEPS[idx + 1] : null;
  const prevStep = idx > 0 ? STEPS[idx - 1] : null;

  return (
    <div className="mt-8 pt-6 border-t border-white/8 flex items-center justify-between gap-4">
      <div>
        {prevStep && (
          <Button variant="ghost" onClick={() => onNavigate(prevStep.id)}
            className="text-white/40 hover:text-white hover:bg-white/8">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> {prevStep.label}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {!isDone && (
          <p className="text-white/30 text-xs hidden sm:block">
            {currentStep.optional ? "This step is optional — skip if not needed" : "Complete this step to continue"}
          </p>
        )}
        {nextStep && (
          <Button
            onClick={() => onNavigate(nextStep.id)}
            disabled={!isDone && !nextStep.optional && !STEPS.slice(0, STEP_IDS.indexOf(nextStep.id)).filter(s => !s.optional).every(s => s.isDone(book))}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold border-0"
          >
            Next: {nextStep.label}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        )}
        {!nextStep && isDone && (
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Check className="w-4 h-4" /> All steps complete — your book is ready to publish!
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step Header — context banner ──────────────────────────────────────────────
function StepHeader({ step, stepNumber, totalSteps }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
        <span className="text-amber-400 font-bold text-sm">{stepNumber}</span>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <h2 className="text-white font-bold text-lg">{step.label}</h2>
          <span className="text-white/20 text-sm">· Step {stepNumber} of {totalSteps}</span>
          {step.optional && <Badge className="bg-white/8 text-white/30 border-0 text-xs">Optional</Badge>}
        </div>
        <p className="text-white/50 text-sm">{step.description}</p>
        {step.hint && (
          <p className="text-amber-400/60 text-xs mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> {step.hint}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main BookEditor ───────────────────────────────────────────────────────────
export default function BookEditor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");

  const [activeTab, setActiveTab] = useState("title");

  const { data: bookRaw, isLoading, error } = useQuery({
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

  // Progress calculation
  const completedRequired = STEPS.filter(s => !s.optional && s.isDone(book)).length;
  const totalRequired = STEPS.filter(s => !s.optional).length;
  const completedOptional = STEPS.filter(s => s.optional && s.isDone(book)).length;
  const totalCompleted = STEPS.filter(s => s.isDone(book)).length;
  const progress = (totalCompleted / STEPS.length) * 100;

  const currentStepDef = STEPS.find(s => s.id === activeTab) || null;
  const currentStepIdx = STEP_IDS.indexOf(activeTab);
  const isUtilityTab = UTILITY_TABS.some(u => u.id === activeTab);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
    </div>
  );

  if ((!book || !book.id) && !isLoading) return (
    <div className="p-6 lg:p-8 text-center">
      <h2 className="text-xl font-semibold text-white mb-2">Book not found</h2>
      <p className="text-white/50 mb-4">This book may have been deleted or you don't have access.</p>
      <Button onClick={() => navigate(createPageUrl("Books"))}
        className="bg-gradient-to-r from-amber-500 to-orange-500 text-black border-0 font-semibold">
        Back to Books
      </Button>
    </div>
  );

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="mb-5">
        <Button variant="ghost" onClick={() => navigate(createPageUrl("Books"))}
          className="text-white/40 hover:text-white hover:bg-white/8 mb-3 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> My Books
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl lg:text-2xl font-bold text-white truncate">
              {book.title || "Untitled Book"}
            </h1>
            <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
              {book.category && (
                <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/25 text-xs">{book.category}</Badge>
              )}
              <span className="text-white/30 text-xs">{totalCompleted}/{STEPS.length} steps complete</span>
              <div className="flex items-center gap-2">
                <Progress value={progress} className="w-20 h-1.5 bg-white/10" />
                <span className="text-white/40 text-xs">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>

          {/* Quick-access utility tools */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate(`/BookHealthCheck?id=${bookId}`)}
              className="border-white/15 text-white/50 hover:text-white hover:bg-white/8 text-xs h-8">
              <BarChart2 className="w-3.5 h-3.5 mr-1" /> Health
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/DistributionDashboard?id=${bookId}`)}
              className="border-white/15 text-white/50 hover:text-white hover:bg-white/8 text-xs h-8">
              <Package className="w-3.5 h-3.5 mr-1" /> Distribute
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/BookWebsite?id=${bookId}`)}
              className="border-white/15 text-white/50 hover:text-white hover:bg-white/8 text-xs h-8">
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Site
            </Button>
          </div>
        </div>
      </div>

      {/* ── Step Rail ──────────────────────────────────────────────── */}
      <div className="mb-5 space-y-3">
        <StepRail steps={STEPS} book={book} activeStep={activeTab} onStepClick={setActiveTab} />

        {/* Utility tabs row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-white/20 text-xs font-medium shrink-0">Tools:</span>
          {UTILITY_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-slate-700/60 border-white/25 text-white"
                  : "bg-white/3 border-white/8 text-white/35 hover:text-white/60 hover:bg-white/6"
              }`}>
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Step Content ───────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {/* Step context banner for main steps */}
          {currentStepDef && (
            <StepHeader
              step={currentStepDef}
              stepNumber={currentStepIdx + 1}
              totalSteps={STEPS.length}
            />
          )}

          {/* Step content */}
          {activeTab === "title" && (
            <TitleGenerator book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />
          )}
          {activeTab === "characters" && (
            <EnhancedCharacterCreator book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />
          )}
          {activeTab === "outline" && (
            <UnifiedOutlineGenerator book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />
          )}
          {activeTab === "summary" && (
            <SummaryGenerator book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />
          )}
          {activeTab === "manuscript" && (
            <ManuscriptWriter book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />
          )}
          {activeTab === "cover" && (
            <CoverDesigner book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />
          )}
          {activeTab === "format" && (
            <ManuscriptFormatter book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />
          )}
          {activeTab === "audiobook" && (
            <AudiobookGenerator book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />
          )}
          {activeTab === "video" && (
            <VideoCommercial book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />
          )}
          {activeTab === "website" && (
            <WebsiteBuilder book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />
          )}

          {/* Utility tabs */}
          {activeTab === "seo" && (
            <SEOMetadataEditor book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />
          )}
          {activeTab === "viewer" && (
            <ManuscriptViewer book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />
          )}
          {activeTab === "marketing" && (
            <MarketingCampaignGenerator book={book} onUpdate={handleUpdate} isUpdating={updateBookMutation.isPending} />
          )}
          {activeTab === "team" && <CollaborationPanel book={book} />}
          {activeTab === "agents" && <AgentAccessPanel book={book} />}

          {/* Step navigation footer */}
          {currentStepDef && (
            <StepFooter currentStepId={activeTab} book={book} onNavigate={setActiveTab} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}