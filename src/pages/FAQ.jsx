import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const faqs = [
  {
    category: "Getting Started",
    items: [
      { q: "What is AuthorForge?", a: "AuthorForge is an AI-powered book creation platform that helps authors, publishers, and creators write, design, and market their books from start to finish — using intelligent AI agents for every step of the journey." },
      { q: "Do I need writing experience to use AuthorForge?", a: "Not at all! AuthorForge is designed for everyone from first-time writers to seasoned professionals. Our AI agents guide you through character creation, outlining, writing, cover design, and marketing." },
      { q: "How do I get started?", a: "Simply click 'Start Free Trial' to create your account. No credit card is required. You'll get full access to all features for 7 days." },
      { q: "What types of books can I create?", a: "You can create virtually any genre — fiction, non-fiction, self-help, children's books, memoirs, business books, thrillers, romance, and more." }
    ]
  },
  {
    category: "AI Features",
    items: [
      { q: "How does the AI character creation work?", a: "Our AI Character Creator helps you build richly detailed characters with personalities, backstories, physical descriptions, and relationship dynamics. Characters remain visually consistent across your cover, website, and marketing materials." },
      { q: "Can the AI write my entire book?", a: "Yes! Our Manuscript Writer can generate full chapters based on your outline, style preferences, and character profiles. You can also use it in co-author mode to write alongside the AI." },
      { q: "How good is the AI-generated cover design?", a: "Our Cover Designer uses state-of-the-art image generation to create professional, publication-ready covers. You can generate multiple versions, rate them, and select your favorite." },
      { q: "What is the Video Commercial feature?", a: "The Video Commercial tool creates a professional book trailer by generating a script, storyboard images, and assembling them into a shareable video — perfect for social media marketing." }
    ]
  },
  {
    category: "Pricing & Plans",
    items: [
      { q: "Is there a free trial?", a: "Yes! Every new account gets a 7-day free trial with full access to all features. No credit card required to start." },
      { q: "What happens after the trial ends?", a: "After 7 days, you can choose a paid plan to continue. If you don't subscribe, your account moves to a limited free tier. Your work is always saved." },
      { q: "Can I cancel anytime?", a: "Absolutely. You can cancel your subscription at any time from your Settings page. There are no cancellation fees or commitments." },
      { q: "Do you offer white-label plans for businesses?", a: "Yes! Our White Label plan lets publishing houses, agencies, and enterprises customize AuthorForge with their own branding, domain, and client management tools. Contact us to learn more." }
    ]
  },
  {
    category: "Publishing & Distribution",
    items: [
      { q: "Can I publish directly from AuthorForge?", a: "AuthorForge generates fully formatted manuscripts and covers ready for upload to major platforms like Amazon KDP, IngramSpark, Draft2Digital, and more." },
      { q: "Does AuthorForge handle ISBN and copyright?", a: "We help you prepare your book for publishing but do not directly assign ISBNs. We provide guidance on obtaining ISBNs through Bowker or your country's national agency." },
      { q: "Can I create a website for my book?", a: "Yes! Our Website Builder creates a beautiful landing page for your book with newsletter signup, bookstore links, and social sharing — no coding needed." }
    ]
  },
  {
    category: "Team & Collaboration",
    items: [
      { q: "Can I collaborate with a co-author or editor?", a: "Yes! You can invite team members with specific roles — author, co-author, editor, publisher, marketing, or assistant — each with tailored permissions." },
      { q: "How many team members can I add?", a: "Team size depends on your plan. Professional plans support unlimited team members. Check our Pricing page for details." }
    ]
  }
];

export default function FAQ() {
  const [search, setSearch] = useState("");
  const [openItems, setOpenItems] = useState({});

  const toggle = (key) => setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));

  const filtered = faqs.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">AuthorForge</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-white/50">
            <Link to={createPageUrl("Landing")} className="hover:text-white transition-colors">Home</Link>
            <Link to={createPageUrl("Pricing")} className="hover:text-white transition-colors">Pricing</Link>
            <Link to={createPageUrl("Contact")} className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">Frequently Asked <span className="text-amber-400">Questions</span></h1>
            <p className="text-white/60 text-lg mb-8">Everything you need to know about AuthorForge.</p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
              />
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-10">
            {filtered.map((cat) => (
              <div key={cat.category}>
                <h2 className="text-xs text-amber-400 uppercase tracking-widest font-semibold mb-4">{cat.category}</h2>
                <div className="space-y-2">
                  {cat.items.map((item, i) => {
                    const key = `${cat.category}-${i}`;
                    return (
                      <div key={key} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                        <button
                          onClick={() => toggle(key)}
                          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
                        >
                          <span className="text-white font-medium text-sm">{item.q}</span>
                          <ChevronDown className={`w-4 h-4 text-white/40 shrink-0 ml-4 transition-transform duration-200 ${openItems[key] ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {openItems[key] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-5 text-white/60 text-sm leading-relaxed border-t border-white/5 pt-4">
                                {item.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-white/40">
                No questions match your search. <Link to={createPageUrl("Contact")} className="text-amber-400 hover:underline">Contact us</Link> for help.
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
            <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
            <p className="text-white/60 mb-4">Our support team is ready to help.</p>
            <Link to={createPageUrl("Contact")}>
              <span className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm hover:from-amber-600 hover:to-orange-600 transition-all">
                Contact Support
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">AuthorForge</span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
            <Link to={createPageUrl("Privacy")} className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to={createPageUrl("Terms")} className="hover:text-white transition-colors">Terms of Use</Link>
            <Link to={createPageUrl("FAQ")} className="hover:text-white transition-colors">FAQ</Link>
            <Link to={createPageUrl("Contact")} className="hover:text-white transition-colors">Contact</Link>
            <Link to={createPageUrl("CookiePolicy")} className="hover:text-white transition-colors">Cookie Policy</Link>
            <Link to={createPageUrl("HowItWorks")} className="hover:text-white transition-colors">How It Works</Link>
            <Link to={createPageUrl("Investor")} className="hover:text-white transition-colors">Investors</Link>
          </div>
          <div className="text-sm text-white/40">© 2026 AuthorForge. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}