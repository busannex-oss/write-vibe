import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Sparkles, ArrowRight, UserPlus, BookOpen, Wand2, Palette,
  Video, Globe, TrendingUp, CheckCircle, Users, Zap
} from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description: "Sign up free — no credit card required. Get instant access to all Write Vibe tools for 7 days.",
    details: ["Set up your author profile", "Add your biography and photo", "Choose your subscription tier", "Invite team members (optional)"]
  },
  {
    step: "02",
    icon: BookOpen,
    title: "Start Your Book",
    description: "Create a new book project and define the basics — title, genre, target audience, and key themes.",
    details: ["Enter your book title and concept", "Select genre and subcategory", "Define your target audience", "AI suggests key themes and angles"]
  },
  {
    step: "03",
    icon: Users,
    title: "Build Your Characters",
    description: "Use the AI Character Creator to develop rich, consistent characters with personalities, backstories, and visual profiles.",
    details: ["Create protagonist and supporting cast", "Define personalities, traits & backstory", "Generate character portraits", "Maintain visual consistency throughout"]
  },
  {
    step: "04",
    icon: Wand2,
    title: "Generate Your Outline",
    description: "Choose from simple table-of-contents, detailed story outline, or professional industry-standard outline formats.",
    details: ["AI generates chapter-by-chapter structure", "Review and edit each chapter plan", "Add key events, plot threads, and pacing notes", "Export or use directly in manuscript writer"]
  },
  {
    step: "05",
    icon: Sparkles,
    title: "Write Your Manuscript",
    description: "Generate full chapters with AI, write alongside it in co-author mode, or use it to enhance your own writing.",
    details: ["Chapter-by-chapter AI generation", "Co-author mode for collaborative writing", "AI editor for style and tone refinement", "Track word count and progress analytics"]
  },
  {
    step: "06",
    icon: Palette,
    title: "Design Your Cover",
    description: "Create stunning front and back cover designs with your characters and themes — no design skills needed.",
    details: ["AI generates multiple cover concepts", "Rate and compare versions", "Upload your author photo", "Download print-ready files"]
  },
  {
    step: "07",
    icon: Video,
    title: "Create Marketing Assets",
    description: "Generate a book trailer, social media content, press releases, and a complete marketing campaign — all with AI.",
    details: ["Professional video commercial/book trailer", "Social media post series", "Publisher letter and press release", "Marketing campaign calendar"]
  },
  {
    step: "08",
    icon: Globe,
    title: "Publish & Launch",
    description: "Format your manuscript for any publishing platform, set up your book website, and go live with your launch.",
    details: ["One-click manuscript formatting for KDP, IngramSpark, etc.", "Book landing page with newsletter signup", "Bookstore distribution links", "Audiobook generation (optional)"]
  }
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Write Vibe</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Pricing")} className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
            <Link to={createPageUrl("FAQ")} className="text-sm text-white/60 hover:text-white transition-colors">FAQ</Link>
            <Link to={createPageUrl("Contact")} className="text-sm text-white/60 hover:text-white transition-colors">Contact</Link>
          </div>
          <Button
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
          >
            Start Free Trial
          </Button>
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-300">Your complete publishing workflow</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              How Write Vibe <span className="text-amber-400">Works</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              From blank page to published book — follow these 8 steps to bring your story to life using AI.
            </p>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/50 via-amber-500/20 to-transparent hidden md:block" />

            <div className="space-y-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="relative flex gap-6 md:gap-10"
                >
                  {/* Icon bubble */}
                  <div className="relative z-10 shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                      <step.icon className="w-7 h-7 text-amber-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-slate-950">{i + 1}</div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/20 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                        <span className="text-xs text-amber-400/60 font-mono">{step.step}</span>
                      </div>
                      <p className="text-white/60 mb-4 leading-relaxed">{step.description}</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {step.details.map((d) => (
                          <li key={d} className="flex items-center gap-2 text-sm text-white/50">
                            <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center p-12 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20">
            <TrendingUp className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Write Your Book?</h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Join 50,000+ authors using Write Vibe to publish their stories. Start for free — no credit card required.
            </p>
            <Button
              size="lg"
              onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-14 px-10 text-lg"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">Write Vibe</span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
            <Link to={createPageUrl("Privacy")} className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to={createPageUrl("Terms")} className="hover:text-white transition-colors">Terms of Use</Link>
            <Link to={createPageUrl("FAQ")} className="hover:text-white transition-colors">FAQ</Link>
            <Link to={createPageUrl("Contact")} className="hover:text-white transition-colors">Contact</Link>
            <Link to={createPageUrl("CookiePolicy")} className="hover:text-white transition-colors">Cookie Policy</Link>
            <Link to={createPageUrl("RefundPolicy")} className="hover:text-white transition-colors">Refund Policy</Link>
            <Link to={createPageUrl("AIDisclosure")} className="hover:text-white transition-colors">AI Disclosure</Link>
            <Link to={createPageUrl("HowItWorks")} className="hover:text-white transition-colors">How It Works</Link>
            <Link to={createPageUrl("Investor")} className="hover:text-white transition-colors">Investors</Link>
          </div>
          <div className="text-sm text-white/40">© 2026 Write Vibe. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}