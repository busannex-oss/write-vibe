import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2 } from "lucide-react";
import OnboardingAgents from "@/components/onboarding/OnboardingAgents";
import OnboardingResources from "@/components/onboarding/OnboardingResources";

const STEPS = [
  { title: "Welcome to your author team", sub: "You're a member now. Here's a quick tour so you can get started today." },
  { title: "Meet your AI agents", sub: "Each agent specializes in one part of your book's journey." },
  { title: "Your key resources", sub: "These tools keep your project organized from first draft to launch." },
  { title: "Start your first book", sub: "The fastest way to get value is to create your book project now." },
];

export default function MemberOnboarding() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const last = step === STEPS.length - 1;

  const finish = async (page) => {
    setSaving(true);
    await base44.auth.updateMe({ member_onboarding_completed: true, member_onboarding_completed_at: new Date().toISOString() });
    await qc.invalidateQueries({ queryKey: ["user"] });
    navigate(createPageUrl(page));
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <Progress value={((step + 1) / STEPS.length) * 100} className="mb-2" />
      <p className="text-xs text-white/40 mb-6">Step {step + 1} of {STEPS.length}</p>
      <h1 className="text-3xl font-bold text-white mb-2">{STEPS[step].title}</h1>
      <p className="text-white/60 mb-8">{STEPS[step].sub}</p>

      {step === 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/5 border border-amber-500/20 text-white/80 space-y-3">
          <Sparkles className="w-8 h-8 text-amber-400" />
          <p>Write Vibe gives you a full team of AI specialists to help you outline, write, design, publish and market your book.</p>
          <p>This tour takes about two minutes.</p>
        </div>
      )}
      {step === 1 && <OnboardingAgents />}
      {step === 2 && <OnboardingResources />}
      {step === 3 && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-white/80">
          Create a book, and Olivia will help you shape the outline while the rest of the team steps in at each stage.
        </div>
      )}

      <div className="flex justify-between mt-10">
        <Button variant="ghost" disabled={step === 0 || saving} onClick={() => setStep(step - 1)}>Back</Button>
        <div className="flex gap-2">
          {last ? (
            <>
              <Button variant="ghost" disabled={saving} onClick={() => finish("Dashboard")}>Go to dashboard</Button>
              <Button disabled={saving} onClick={() => finish("CreateBook")}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create my first book
              </Button>
            </>
          ) : (
            <Button onClick={() => setStep(step + 1)}>Next</Button>
          )}
        </div>
      </div>
    </div>
  );
}