import React from "react";
import { motion } from "framer-motion";
import { Wand2, BookOpen, Palette, Video, Megaphone, MessageSquare, Users, Brain } from "lucide-react";

const AI_TEAM = [
  { icon: Wand2, name: "Character Creator", role: "Builds rich, consistent characters with backstories, traits, and visual profiles that stay true across every chapter, cover, and trailer." },
  { icon: BookOpen, name: "Outline Architect", role: "Maps your story chapter by chapter with narrative arcs, pacing, and plot threads — so your book never falls apart at chapter 3." },
  { icon: Palette, name: "Cover Designer", role: "Designs professional covers that match your genre and keep your characters visually consistent from page to poster." },
  { icon: Video, name: "Video Producer", role: "Produces cinematic book trailers and commercials tailored to your target readers — no film crew required." },
  { icon: Megaphone, name: "Marketing Strategist", role: "Writes your press releases, publisher letters, social campaigns, and launch plan while you focus on the writing." },
  { icon: MessageSquare, name: "Sherry, Author Success", role: "Your always-on guide. Sherry welcomes you, answers questions, and keeps your first book moving from day one." },
  { icon: Users, name: "Advisory Board", role: "A panel of AI advisors reviews your character arcs and milestones, flagging what a seasoned editor would catch." },
  { icon: Brain, name: "CCOS Optimizer", role: "Works overnight analyzing your project and the platform itself, surfacing insights so your book keeps improving while you sleep." },
];

export default function AITeamSection() {
  return (
    <section id="ai-team" className="py-20 px-6 bg-white/[0.02] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <Users className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300">Only on Write Vibe</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Meet Your <span className="text-amber-400">AI Publishing Team</span>
          </h2>
          <p className="text-white/60 text-lg max-w-3xl mx-auto">
            Other tools give you a chatbot. Write Vibe gives you a full publishing house — 20+ specialized AI agents
            working around the clock, each trained for one job on your book. They collaborate, review each other's
            work, and answer to one voice: yours.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {AI_TEAM.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-4">
                <member.icon className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{member.name}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{member.role}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-white/40 text-sm mt-10 max-w-2xl mx-auto">
          Every agent works from your Personal Intelligence Blueprint — your voice, your style, your goals.
          That's what makes a Write Vibe book unmistakably yours, not a template.
        </p>
      </div>
    </section>
  );
}