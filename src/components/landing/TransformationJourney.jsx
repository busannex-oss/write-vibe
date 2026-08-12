import React from "react";
import { motion } from "framer-motion";
import {
  Lightbulb, FileText, BookOpen, UserCircle, Briefcase,
  MonitorPlay, Mic, Users, Landmark
} from "lucide-react";

const stages = [
  { icon: Lightbulb, label: "Idea", desc: "Your knowledge, experience, and expertise" },
  { icon: FileText, label: "Manuscript", desc: "Structured, developed, and edited with AI-enhanced workflows" },
  { icon: BookOpen, label: "Published Book", desc: "Distributed to Amazon and major bookstores" },
  { icon: UserCircle, label: "Personal Brand", desc: "Authority that opens doors your résumé can't" },
  { icon: Briefcase, label: "Business Asset", desc: "IP that generates leads, credibility, and revenue" },
  { icon: MonitorPlay, label: "Digital Products", desc: "Courses, audiobooks, and content built from your book" },
  { icon: Mic, label: "Speaking Opportunities", desc: "Stages, podcasts, and platforms that seek out published experts" },
  { icon: Users, label: "Community", desc: "An audience that grows with every asset you release" },
  { icon: Landmark, label: "Legacy", desc: "A body of work that outlasts any single project" }
];

export default function TransformationJourney() {
  return (
    <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            A Book Is the Beginning, <span className="text-amber-400">Not the End</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            The transformation journey every Write Vibe author follows — from a single idea
            to intellectual property that compounds in value.
          </p>
        </div>
        <div className="relative pl-6">
          <div className="absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-amber-500/50 via-amber-500/20 to-amber-500/50" />
          <div className="space-y-5">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
                viewport={{ once: true }}
                className="relative flex items-center gap-4"
              >
                <div className="w-12 h-12 -ml-6 rounded-full bg-slate-900 border-2 border-amber-500/40 flex items-center justify-center flex-shrink-0 z-10">
                  <stage.icon className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-amber-400/60 font-mono">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="text-white font-semibold">{stage.label}</h3>
                  </div>
                  <p className="text-sm text-white/50">{stage.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}