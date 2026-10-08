import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Gauge, Sparkles, Loader2 } from "lucide-react";
import AuditScoreCard from "@/components/audit/AuditScoreCard";
import SectionImproveDialog from "@/components/audit/SectionImproveDialog";

const SECTIONS = [
  "Hero & Value Proposition", "Trust & Credibility", "Problem Framing", "Solution Clarity",
  "Services Ecosystem", "Transformation Journey", "Why AI", "Client Journey",
  "Social Proof", "Author Readiness Assessment", "FAQ", "Final Call to Action",
  "SEO", "Accessibility", "Mobile Experience", "Conversion Optimization"
];

const SCHEMA = {
  type: "object",
  properties: {
    overall_score: { type: "number" },
    positioning_verdict: { type: "string" },
    executive_summary: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          section: { type: "string" },
          score: { type: "number" },
          assessment: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } }
        }
      }
    },
    weak_messaging: { type: "array", items: { type: "string" } },
    missed_opportunities: { type: "array", items: { type: "string" } }
  }
};

export default function HomepageAudit() {
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [improveSection, setImproveSection] = useState(null);

  const runAudit = async () => {
    setRunning(true);
    const res = await ai.InvokeLLM({
      prompt: `You are a panel of experts: a Fortune 100 Creative Director, StoryBrand copywriter, UX strategist, CRO specialist, publishing industry consultant, SEO strategist, and brand positioning expert.

Evaluate the Write Vibe homepage against the standard of a world-class AI publishing and intellectual property development company.

Brand position: Write Vibe is an AI-Powered Publishing & Intellectual Property Development Company — not a ghostwriting, editing, formatting, or self-publishing assistance service. Books are strategic assets that generate authority, revenue, opportunities, and legacy.

Current homepage content:
- Hero: "Your Expertise Is an Asset. Publish It Like One." Badge: "AI-Powered Publishing & Intellectual Property Development". Subhead about combining expert publishing strategy with AI-enhanced workflows to transform knowledge into published books, author brand, revenue streams, opportunities. CTAs: "Start Building Your Book — Free" and "Watch Demo". Trust points: no credit card required, you own 100% of your IP. Hero video.
- Trust section: 10,000+ books published, 50,000+ authors & organizations, AI-enhanced workflows, you own everything (full copyright), publishing-grade standards, long-term partnership.
- Problem: "Unwritten Expertise Is Unrealized Value" — no time/no system, publishing confusion, books that go nowhere.
- Solution: "One Integrated Process, Expert-Guided and AI-Enhanced" — replaces fragmented ghostwriters/editors/designers/agencies with one connected process; AI supports, never replaces, the author's voice.
- Services ecosystem (15): Book Strategy, Research Support, Manuscript Development, Editing, Publishing, Cover Design, Author Branding, Website Development, Marketing Assets, Audiobooks, Online Courses, Speaker Kits, Business Documents, AI Author Tools, IP Consulting.
- Transformation journey: Idea → Manuscript → Published Book → Personal Brand → Business Asset → Digital Products → Speaking Opportunities → Community → Legacy.
- Why AI: accelerated research, better organization, consistency at scale, faster workflows, intelligent editing, sustained productivity.
- AI Team section (specialized AI agents).
- Client journey (5 steps): Define Your Blueprint, Set the Strategy, Develop the Manuscript, Publish & Launch, Build the Ecosystem.
- Stats: 10,000+ books, 50,000+ authors, 99.9% uptime, 4.9/5 rating.
- Testimonials: bestselling author, consultant/author, publishing house editor.
- Interactive Author Readiness Assessment (4 questions, returns an author profile and recommended services).
- FAQ: ownership/copyright, AI usage and voice, timelines, collaboration, publishing options, marketing support, confidentiality, free trial.
- Final CTA: "Start Building Your Next Intellectual Property Asset" — 7-day free trial, no credit card, you own everything.
- SEO: title "Write Vibe — AI Publishing & Intellectual Property Development", meta description on IP development, Organization + SoftwareApplication + FAQPage schema.

Score each of these sections 0-100 with a candid assessment, concrete strengths, and specific, actionable recommendations: ${SECTIONS.join(", ")}.

Also identify weak messaging (clichés, vague claims, unsubstantiated numbers, hype) and missed opportunities. Give an overall score, a one-line positioning verdict, and an executive summary explaining how well the homepage positions Write Vibe in the publishing industry and what would strengthen it most. Be rigorous and specific — no generic advice.`,
      response_json_schema: SCHEMA
    });
    setResult(res);
    setRunning(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Gauge className="w-7 h-7 text-amber-400" />
            Homepage Positioning Audit
          </h1>
          <p className="text-white/50 mt-2">
            Evaluate the homepage against world-class AI publishing and intellectual property standards.
          </p>
        </div>
        <Button
          onClick={runAudit}
          disabled={running}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
        >
          {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {running ? "Evaluating…" : "Run Evaluation"}
        </Button>
      </div>

      {!result && !running && (
        <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center">
          <p className="text-white/50">Run an evaluation to score every homepage section and get specific recommendations.</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/5 border border-amber-500/20">
            <div className="flex items-center gap-6 mb-4">
              <div className="text-5xl font-bold text-white">{result.overall_score}</div>
              <div>
                <p className="text-xs uppercase tracking-widest text-amber-400/70">Overall Score</p>
                <p className="text-white font-medium">{result.positioning_verdict}</p>
              </div>
            </div>
            <p className="text-white/70 leading-relaxed">{result.executive_summary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {(result.sections || []).map((item, i) => (
              <AuditScoreCard key={i} item={item} onImprove={setImproveSection} />
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {result.weak_messaging?.length > 0 && (
              <div className="p-5 rounded-2xl bg-white/5 border border-red-500/20">
                <h3 className="text-white font-semibold mb-3">Weak Messaging</h3>
                <ul className="text-sm text-white/60 list-disc pl-5 space-y-1.5">
                  {result.weak_messaging.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}
            {result.missed_opportunities?.length > 0 && (
              <div className="p-5 rounded-2xl bg-white/5 border border-amber-500/20">
                <h3 className="text-white font-semibold mb-3">Missed Opportunities</h3>
                <ul className="text-sm text-white/60 list-disc pl-5 space-y-1.5">
                  {result.missed_opportunities.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <SectionImproveDialog
        item={improveSection}
        open={!!improveSection}
        onClose={() => setImproveSection(null)}
      />
    </div>
  );
}