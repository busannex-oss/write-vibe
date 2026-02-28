import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

export default function Privacy() {
  const sections = [
    {
      title: "Information We Collect",
      items: [
        "Account information (name, email, password)",
        "Book content and manuscript data",
        "Payment information (processed securely through our payment providers)",
        "Usage data and analytics",
      ]
    },
    {
      title: "How We Use Your Information",
      items: [
        "Provide, maintain, and improve our services",
        "Process your transactions and send related information",
        "Generate AI-powered content for your books",
        "Send you technical notices and support messages",
        "Respond to your comments and questions",
      ]
    },
    {
      title: "Data Security",
      description: "We implement appropriate technical and organizational measures to protect your personal information. Your book content is encrypted and stored securely."
    },
    {
      title: "Your Rights",
      items: [
        "Access your personal data",
        "Correct inaccurate data",
        "Request deletion of your data",
        "Export your book content",
        "Opt-out of marketing communications",
      ]
    },
    {
      title: "Contact Us",
      description: "If you have questions about this Privacy Policy, please contact us at privacy@authorforge.ai"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <Link to={createPageUrl("Landing")}>
          <Button variant="ghost" className="text-white/60 hover:text-white mb-12">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-white/50">Your privacy is important to us. Learn how we protect your data.</p>
        </div>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={index} className="relative">
              {/* Timeline dot and line */}
              <div className="absolute left-12 top-0 w-1 h-full bg-gradient-to-b from-amber-500/50 to-transparent" style={{ transform: 'translateX(-0.5px)' }} />
              
              <div className="pl-32 pb-8">
                <div className="absolute left-0 top-6 w-24 h-24 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400">{index + 1}</div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-sm hover:bg-white/8 transition-colors">
                  <h2 className="text-2xl font-semibold text-white mb-4">{section.title}</h2>
                  
                  {section.description ? (
                    <p className="text-white/70 leading-relaxed">{section.description}</p>
                  ) : (
                    <ul className="space-y-3">
                      {section.items?.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-amber-400 mt-1">✓</span>
                          <span className="text-white/70">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-white/40 mt-16 text-center">Last updated: February 28, 2026</p>
      </div>
    </div>
  );
}