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
import FirstBookStep from "@/components/onboarding/FirstBookStep";
import SocialProfilesStep from "@/components/onboarding/SocialProfilesStep";

const STEPS = [
  { title: "Welcome to your author team", sub: "You're a member now. Here's a quick tour so you can get started today." },
  { title: "Meet your AI agents", sub: "Each agent specializes in one part of your book's journey." },
  { title: "Your key resources", sub: "These tools keep your project organized from first draft to launch." },
  { title: "Set up your first book", sub: "Just the basics. Your agents will help you build out the rest." },
  { title: "Link your social profiles", sub: "So your marketing team can promote your book where your readers are." },
];

export default function MemberOnboarding() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const last = step === STEPS.length - 1;

  const [book, setBook] = useState(null);
  const [social, setSocial] = useState({});

  const finish = async (page) => {
    setSaving(true);
    await base44.auth.updateMe({
      member_onboarding_completed: true,
      member_onboarding_completed_at: new Date().toISOString(),
      social_profiles: social,
    });
    await qc.invalidateQueries({ queryKey: ["user"] });
    navigate(page === "BookEditor" ? `/BookEditor?id=${book.id}` : createPageUrl(page));
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
      {step === 3 && <FirstBookStep book={book} onCreated={setBook} />}
      {step === 4 && <SocialProfilesStep value={social} onChange={setSocial} />}

      <div className="flex justify-between mt-10">
        <Button variant="ghost" disabled={step === 0 || saving} onClick={() => setStep(step - 1)}>Back</Button>
        <div className="flex gap-2">
          {last ? (
            <>
              <Button variant="ghost" disabled={saving} onClick={() => finish("Dashboard")}>Go to dashboard</Button>
              <Button disabled={saving} onClick={() => finish(book ? "BookEditor" : "Books")}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{book ? "Open my book" : "Finish setup"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setStep(step + 1)}>{step === 3 && !book ? "Skip for now" : "Next"}</Button>
          )}
        </div>
      </div>
    </div>
  );
}