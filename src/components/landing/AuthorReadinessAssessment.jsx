import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ClipboardCheck, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";

const QUESTIONS = [
  {
    id: "goal",
    question: "What's the primary outcome you want from publishing?",
    options: [
      { value: "authority", label: "Establish authority in my field", services: ["Book Strategy", "Author Branding", "Speaker Kits"] },
      { value: "revenue", label: "Create a new revenue stream", services: ["Publishing", "Audiobooks", "Online Courses"] },
      { value: "story", label: "Tell a story I've carried for years", services: ["Manuscript Development", "Cover Design", "Marketing Assets"] },
      { value: "business", label: "Grow my business or organization", services: ["IP Consulting", "Business Documents", "Website Development"] }
    ]
  },
  {
    id: "stage",
    question: "Where is your book right now?",
    options: [
      { value: "idea", label: "It's still an idea", services: ["Book Strategy", "Research Support"] },
      { value: "notes", label: "Notes and fragments, nothing organized", services: ["Manuscript Development", "Research Support"] },
      { value: "draft", label: "A partial or complete draft", services: ["Editing", "Cover Design"] },
      { value: "published", label: "Already published — I want more from it", services: ["Audiobooks", "Online Courses", "Author Branding"] }
    ]
  },
  {
    id: "challenge",
    question: "What's held you back the most?",
    options: [
      { value: "time", label: "Time — I can't dedicate months to this", services: ["AI Author Tools", "Manuscript Development"] },
      { value: "structure", label: "Organizing my ideas into a coherent book", services: ["Book Strategy", "Manuscript Development"] },
      { value: "publishing", label: "The publishing process is confusing", services: ["Publishing", "IP Consulting"] },
      { value: "marketing", label: "Getting the book seen once it exists", services: ["Marketing Assets", "Author Branding", "Website Development"] }
    ]
  },
  {
    id: "timeline",
    question: "When do you want to hold your published book?",
    options: [
      { value: "asap", label: "Within 3 months", services: [] },
      { value: "sixmonths", label: "Within 6 months", services: [] },
      { value: "year", label: "Within a year", services: [] },
      { value: "exploring", label: "I'm still exploring", services: [] }
    ]
  }
];

const PROFILES = {
  authority: { title: "The Thought Leader", summary: "Your book is a positioning asset. The right strategy turns it into speaking invitations, media credibility, and a brand that precedes you into every room." },
  revenue: { title: "The IP Builder", summary: "Your book is the first product in a portfolio. Publishing is step one — audiobooks, courses, and licensing multiply its value." },
  story: { title: "The Storyteller", summary: "Your story deserves professional treatment. Structured development and publication-quality design carry it from your head to readers' hands." },
  business: { title: "The Strategic Operator", summary: "Your book is a business development tool. Built correctly, it generates leads, shortens sales cycles, and institutionalizes your expertise." }
};

export default function AuthorReadinessAssessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const done = step >= QUESTIONS.length;
  const current = QUESTIONS[step];

  const selectOption = (option) => {
    setAnswers({ ...answers, [current.id]: option });
    setStep(step + 1);
  };

  const restart = () => { setStep(0); setAnswers({}); };

  const recommendedServices = done
    ? [...new Set(Object.values(answers).flatMap((a) => a.services))].slice(0, 6)
    : [];
  const profile = done ? PROFILES[answers.goal?.value] || PROFILES.story : null;

  return (
    <section id="assessment" className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <ClipboardCheck className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300">Author Readiness Assessment</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Where Are You on the <span className="text-amber-400">Publishing Journey?</span>
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Answer four quick questions and we'll show you exactly which parts of the ecosystem fit your goals — no email required.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10">
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-white/40">Question {step + 1} of {QUESTIONS.length}</span>
                  <div className="flex gap-1.5">
                    {QUESTIONS.map((_, i) => (
                      <div key={i} className={`w-8 h-1.5 rounded-full ${i <= step ? "bg-amber-500" : "bg-white/10"}`} />
                    ))}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-6">{current.question}</h3>
                <div className="space-y-3">
                  {current.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => selectOption(option)}
                      className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all text-white/80 hover:text-white"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <p className="text-sm text-amber-400 uppercase tracking-widest mb-2">Your Author Profile</p>
                <h3 className="text-2xl font-bold text-white mb-3">{profile.title}</h3>
                <p className="text-white/60 mb-8 max-w-lg mx-auto">{profile.summary}</p>

                {recommendedServices.length > 0 && (
                  <div className="mb-8">
                    <p className="text-sm text-white/40 mb-3">Recommended for you:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {recommendedServices.map((s) => (
                        <span key={s} className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    size="lg"
                    onClick={() => base44.auth.redirectToLogin(window.location.origin + createPageUrl("Dashboard"))}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                  >
                    Start Your Free Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button variant="outline" onClick={restart} className="border-white/20 text-white/70 hover:bg-white/10">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake Assessment
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}