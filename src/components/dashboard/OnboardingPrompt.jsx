import React from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { needsOnboarding } from "@/lib/memberOnboarding";

export default function OnboardingPrompt({ user }) {
  if (!needsOnboarding(user)) return null;
  return (
    <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center gap-4">
      <Sparkles className="w-8 h-8 text-amber-400 shrink-0" />
      <div className="flex-1">
        <p className="font-semibold text-white">Welcome, member! Take the 2-minute tour</p>
        <p className="text-sm text-white/60">Meet your AI agents and see the resources that help you get started.</p>
      </div>
      <Link to={createPageUrl("MemberOnboarding")}><Button>Start tour</Button></Link>
    </div>
  );
}