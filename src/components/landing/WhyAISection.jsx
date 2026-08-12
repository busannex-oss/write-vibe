import React from "react";
import { motion } from "framer-motion";
import { Search, ListTree, CheckCircle2, Timer, FileEdit, Gauge, Sparkles } from "lucide-react";

const benefits = [
  { icon: Search, title: "Accelerated Research", desc: "Gather, verify, and organize source material in hours instead of months" },
  { icon: ListTree, title: "Better Organization", desc: "Turn scattered notes and ideas into a coherent, publishable structure" },
  { icon: CheckCircle2, title: "Consistency at Scale", desc: "Characters, terminology, and voice stay consistent from chapter one to the cover" },
  { icon: Timer, title: "Faster Workflows", desc: "Production steps that once took weeks — formatting, covers, trailers — happen in minutes" },
  { icon: FileEdit, title: "Intelligent Editing", desc: "Line-level suggestions that tighten prose while preserving your style" },
  { icon: Gauge, title: "Sustained Productivity", desc: "Momentum from first outline to launch, with no stage left to stall on" }
];

export default function WhyAISection() {
  return (
    <section id="why-ai" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            AI That <span className="text-amber-400">Amplifies</span> Your Expertise
          </h2>
          <p className="text-white/60 text-lg max-w-3xl mx-auto">
            AI at Write Vibe does the production work — research, structure, consistency, speed.
            The ideas, the voice, and the expertise are always yours. Nothing ships without your review and approval.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{b.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-white/80 text-sm">AI enhances human expertise. It never replaces your creativity or your voice.</span>
          </div>
        </div>
      </div>
    </section>
  );
}