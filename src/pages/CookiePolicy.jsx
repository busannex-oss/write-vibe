import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sparkles, Cookie } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">AuthorForge</span>
          </Link>
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Cookie className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Cookie Policy</h1>
              <p className="text-white/40 text-sm mt-1">Last updated: February 2026</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            {[
              {
                title: "1. What Are Cookies?",
                content: "Cookies are small text files placed on your device when you visit AuthorForge. They help us remember your preferences, keep you logged in, and understand how you use our platform to make it better."
              },
              {
                title: "2. Types of Cookies We Use",
                content: null,
                list: [
                  { name: "Essential Cookies", desc: "Required for the platform to function. These include authentication tokens, session management, and security features. You cannot opt out of these." },
                  { name: "Analytics Cookies", desc: "Help us understand usage patterns, popular features, and areas for improvement. We use anonymized, aggregated data only." },
                  { name: "Preference Cookies", desc: "Remember your settings such as language, theme, and editor preferences across sessions." },
                  { name: "Marketing Cookies", desc: "Used to show relevant advertising and measure campaign effectiveness. These are only set with your consent." }
                ]
              },
              {
                title: "3. Third-Party Cookies",
                content: "We may use third-party services that set their own cookies, including analytics providers and payment processors. These third parties have their own privacy policies governing how they use this information."
              },
              {
                title: "4. Managing Cookies",
                content: "You can control cookies through your browser settings. You may block or delete cookies at any time. Note that blocking essential cookies may impair platform functionality. Most browsers allow you to: view cookies stored, delete individual or all cookies, block third-party cookies, and set preferences for specific websites."
              },
              {
                title: "5. Cookie Retention",
                content: "Session cookies expire when you close your browser. Persistent cookies remain for a specified period (typically 30 days to 1 year) or until you delete them. Authentication cookies expire after 30 days of inactivity."
              },
              {
                title: "6. Updates to This Policy",
                content: "We may update this Cookie Policy periodically. We will notify you of significant changes via email or a prominent notice on the platform."
              },
              {
                title: "7. Contact Us",
                content: "If you have questions about our use of cookies, please contact us at privacy@authorforge.com."
              }
            ].map((section) => (
              <div key={section.title} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-3">{section.title}</h2>
                {section.content && <p className="text-white/60 leading-relaxed">{section.content}</p>}
                {section.list && (
                  <ul className="space-y-3 mt-2">
                    {section.list.map((item) => (
                      <li key={item.name} className="text-white/60">
                        <span className="text-amber-400 font-medium">{item.name}:</span> {item.desc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

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