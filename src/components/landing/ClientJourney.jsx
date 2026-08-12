import React from "react";
import { motion } from "framer-motion";
import { UserCheck, Map, PenLine, Rocket, TrendingUp } from "lucide-react";

const steps = [
  { icon: UserCheck, step: "01", title: "Define Your Blueprint", desc: "Complete your Personal Intelligence Blueprint — a one-time profile that captures your voice, goals, and audience. Every asset we create is guided by it." },
  { icon: Map, step: "02", title: "Set the Strategy", desc: "Position your book before you write it: category, audience, structure, and the business outcomes it should drive." },
  { icon: PenLine, step: "03", title: "Develop the Manuscript", desc: "Write chapter by chapter with AI-assisted drafting, research, editing, and version history — reviewed and refined by you at every step." },
  { icon: Rocket, step: "04", title: "Publish & Launch", desc: "Professional cover, industry formatting, and direct publishing to Amazon and major bookstores — with a book website and launch campaign ready on day one." },
  { icon: TrendingUp, step: "05", title: "Build the Ecosystem", desc: "Extend your book into audiobooks, courses, speaker kits, and marketing assets that keep generating value long after launch." }
];

export default function ClientJourney() {
  return (
    <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            From First Idea to <span className="text-amber-400">Full Publishing Ecosystem</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            A clear, guided process — you always know where you are and what happens next.
          </p>
        </div>
        <div className="grid md:grid-cols-5 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <s.icon className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-white/10 mb-1">{s.step}</div>
              <h3 className="text-white font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}