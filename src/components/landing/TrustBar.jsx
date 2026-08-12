import React from "react";
import { ShieldCheck, BookOpen, Cpu, Users, Award, Handshake } from "lucide-react";

const signals = [
  { icon: BookOpen, title: "10,000+ Books Published", detail: "Manuscripts developed, designed, and distributed to Amazon KDP and major bookstores" },
  { icon: Users, title: "50,000+ Authors & Organizations", detail: "First-time authors, executives, and publishing houses build their IP here" },
  { icon: Cpu, title: "AI-Enhanced Workflows", detail: "Intelligent systems accelerate research, structure, and production — your voice stays yours" },
  { icon: ShieldCheck, title: "You Own Everything", detail: "Full copyright and commercial rights to every manuscript, cover, and asset you create" },
  { icon: Award, title: "Publishing-Grade Standards", detail: "Editorial review, industry formatting, and professional design on every project" },
  { icon: Handshake, title: "Long-Term Partnership", detail: "From first draft to audiobooks, courses, and speaker platforms — one team, one ecosystem" }
];

export default function TrustBar() {
  return (
    <section className="py-16 px-6 border-t border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm uppercase tracking-widest text-amber-400/70 mb-10">
          Why authors and organizations trust Write Vibe
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {signals.map((s) => (
            <div key={s.title} className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}