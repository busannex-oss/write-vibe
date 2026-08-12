import React from "react";
import { motion } from "framer-motion";
import {
  Compass, Search, PenLine, FileEdit, Rocket, Palette, UserCircle,
  Globe, Megaphone, Headphones, GraduationCap, Mic, Briefcase, Bot, Scale
} from "lucide-react";

const services = [
  { icon: Compass, title: "Book Strategy", desc: "Position your book as a business asset before the first chapter is written" },
  { icon: Search, title: "Research Support", desc: "AI-accelerated research that grounds your book in credible sources" },
  { icon: PenLine, title: "Manuscript Development", desc: "Structured chapter-by-chapter development guided by your voice" },
  { icon: FileEdit, title: "Editing", desc: "Intelligent editing assistance with human-quality standards" },
  { icon: Rocket, title: "Publishing", desc: "Direct distribution to Amazon KDP and major bookstores" },
  { icon: Palette, title: "Cover Design", desc: "Publication-quality covers with consistent visual identity" },
  { icon: UserCircle, title: "Author Branding", desc: "A personal brand built around your expertise and published work" },
  { icon: Globe, title: "Website Development", desc: "Author and book websites with newsletter and bookstore integration" },
  { icon: Megaphone, title: "Marketing Assets", desc: "Trailers, press releases, and campaigns generated from your book" },
  { icon: Headphones, title: "Audiobooks", desc: "Professional audiobook production from your finished manuscript" },
  { icon: GraduationCap, title: "Online Courses", desc: "Transform book content into structured educational products" },
  { icon: Mic, title: "Speaker Kits", desc: "Talks, one-sheets, and materials that convert authority into bookings" },
  { icon: Briefcase, title: "Business Documents", desc: "White papers, business plans, and executive documents" },
  { icon: Bot, title: "AI Author Tools", desc: "A dedicated AI team for characters, outlines, and production" },
  { icon: Scale, title: "IP Consulting", desc: "Guidance on ownership, licensing, and long-term asset value" }
];

export default function ServicesEcosystem() {
  return (
    <section id="ecosystem" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            One Connected <span className="text-amber-400">Publishing Ecosystem</span>
          </h2>
          <p className="text-white/60 text-lg max-w-3xl mx-auto">
            These aren't isolated services. Each one feeds the next — your strategy shapes your manuscript,
            your manuscript becomes your brand, and your brand generates products, platforms, and opportunities
            for years after publication.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              viewport={{ once: true }}
              className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <s.icon className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-white font-semibold">{s.title}</h3>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}