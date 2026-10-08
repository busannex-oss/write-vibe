import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import { ONBOARDING_RESOURCES } from "@/lib/memberOnboarding";

export default function OnboardingResources() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {ONBOARDING_RESOURCES.map((r) => (
        <Link key={r.page} to={createPageUrl(r.page)} target="_blank" className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition">
          <p className="font-semibold text-white flex items-center justify-between">
            {r.title} <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition" />
          </p>
          <p className="text-sm text-white/60 mt-1">{r.desc}</p>
        </Link>
      ))}
    </div>
  );
}