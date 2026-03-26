import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Sparkles, 
  ArrowLeft,
  Crown,
  Zap,
  Shield,
  Users
} from "lucide-react";
import { motion } from "framer-motion";

export default function Pricing() {
  const tiers = [
    {
      id: "starter",
      name: "Starter",
      price: "$19",
      description: "Perfect for new authors",
      features: [
        "3 Book Projects",
        "AI Title Generator",
        "Basic Outline Creator",
        "Book Summary Writer",
        "Cover Design (3/month)",
        "Email Support"
      ],
      cta: "Start Free Trial"
    },
    {
      id: "professional",
      name: "Professional",
      price: "$49",
      description: "For serious authors",
      features: [
        "10 Book Projects",
        "All AI Agents",
        "Unlimited Outlines & Summaries",
        "Cover Design (10/month)",
        "Video Commercials (3/month)",
        "Book Website Builder",
        "Newsletter Integration",
        "Priority Support"
      ],
      popular: true,
      cta: "Start Free Trial"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$99",
      description: "For publishing teams",
      features: [
        "Unlimited Book Projects",
        "All Professional Features",
        "Unlimited Cover Designs",
        "Unlimited Video Commercials",
        "Team Collaboration (5 members)",
        "Publisher Letter Generator",
        "Press Release Writer",
        "Dedicated Account Manager"
      ],
      cta: "Start Free Trial"
    },
    {
      id: "white_label",
      name: "White Label",
      price: "$299",
      description: "For agencies & publishers",
      features: [
        "Everything in Enterprise",
        "Custom Branding",
        "Your Logo & Colors",
        "Custom Domain",
        "API Access",
        "Unlimited Team Members",
        "SLA Support",
        "Custom Integrations"
      ],
      cta: "Contact Sales"
    }
  ];

  const faqs = [
    {
      question: "What's included in the 7-day free trial?",
      answer: "You get full access to all Professional tier features during the trial. No credit card required to start."
    },
    {
      question: "Can I switch plans later?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Apple Pay, Google Pay, and all major credit cards."
    },
    {
      question: "Is there a refund policy?",
      answer: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with the service."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">AuthorForge</span>
          </Link>
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 mb-4">
            <Zap className="w-3 h-3 mr-1" />
            7-Day Free Trial
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Choose the plan that fits your writing journey. Start free, upgrade when you're ready.
          </p>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative h-full ${
                  tier.popular 
                    ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/50' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                        <Crown className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="pt-8 pb-6 flex flex-col h-full">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                      <p className="text-sm text-white/50 mt-1">{tier.description}</p>
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-white">{tier.price}</span>
                        <span className="text-white/50">/month</span>
                      </div>
                    </div>
                    
                    <ul className="space-y-3 flex-1">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-white/70">
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link to={createPageUrl("Dashboard")} className="mt-6">
                      <Button className={`w-full ${
                        tier.popular
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0'
                          : 'bg-white/10 hover:bg-white/20 text-white border-0'
                      }`}>
                        {tier.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Why Choose AuthorForge?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, title: "AI-Powered", description: "8 specialized AI agents work together to create your book" },
              { icon: Shield, title: "Consistent Quality", description: "Character consistency across all covers and videos" },
              { icon: Users, title: "Team Ready", description: "Collaborate with editors, publishers, and marketing teams" }
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/50">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question} className="bg-white/5 border-white/10">
                <CardContent className="py-4">
                  <h4 className="font-medium text-white mb-2">{faq.question}</h4>
                  <p className="text-sm text-white/60">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start Writing Today</h2>
          <p className="text-white/60 mb-8">
            Join thousands of authors using AI to bring their stories to life
          </p>
          <Link to={createPageUrl("Dashboard")}>
            <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-14 px-8">
              Start Your 7-Day Free Trial
            </Button>
          </Link>
          <p className="text-sm text-white/40 mt-4">No credit card required • Cancel anytime</p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-xs text-white/30 uppercase tracking-widest">Accepted payment methods</p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {/* Apple Pay */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <svg className="h-5" viewBox="0 0 56 24" fill="white"><path d="M11.0 4.5C10.1 5.6 8.7 6.4 7.4 6.3c-.2-1.3.5-2.7 1.3-3.6C9.6 1.5 11.1.8 12.2.9c.2 1.4-.4 2.7-1.2 3.6zm1.2 1.9c-1.9-.1-3.5 1.1-4.4 1.1-.9 0-2.3-1-3.8-1-2 0-3.8 1.2-4.8 3C-2 13.8.6 19.5 2.6 22.4c1 1.4 2.1 2.9 3.6 2.8 1.4 0 2-.9 3.7-.9 1.7 0 2.2.9 3.7.9 1.5 0 2.5-1.4 3.5-2.8.6-.9 1.1-1.8 1.5-2.8-3.8-1.5-4.4-7 .4-9.1-.9-1.4-2.4-2.1-3.8-2.1z"/></svg>
                <span className="text-white text-sm font-medium">Apple Pay</span>
              </div>
              {/* Google Pay */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <svg className="h-5 w-auto" viewBox="0 0 41 17" fill="none"><path d="M19.65 8.5c0 4.4-3.4 7.5-7.5 7.5S4.65 12.9 4.65 8.5 8.05 1 12.15 1s7.5 3.1 7.5 7.5z" fill="#4285F4"/><path d="M36.65 8.5c0 4.1-3.1 7.5-7 7.5s-7-3.4-7-7.5 3.1-7.5 7-7.5 7 3.4 7 7.5z" fill="#EA4335"/><path d="M40.15 8.5c0 3.7-1.6 7.5-4.5 7.5s-4.5-3.8-4.5-7.5 1.6-7.5 4.5-7.5 4.5 3.8 4.5 7.5z" fill="#FBBC05"/></svg>
                <span className="text-white text-sm font-medium">Google Pay</span>
              </div>
              {/* Visa */}
              <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <svg className="h-5 w-12" viewBox="0 0 48 16" fill="none"><text x="0" y="13" fontSize="14" fontWeight="bold" fill="#1A1F71" fontFamily="Arial">VISA</text></svg>
              </div>
              {/* Mastercard */}
              <div className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <div className="w-5 h-5 rounded-full bg-red-500 opacity-90" />
                <div className="w-5 h-5 rounded-full bg-yellow-400 opacity-90 -ml-2" />
                <span className="text-white text-sm font-medium ml-1">Mastercard</span>
              </div>
              {/* Amex */}
              <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-white text-sm font-semibold tracking-wide">AMEX</span>
              </div>
            </div>
            <p className="text-xs text-white/25 mt-1">🔒 256-bit SSL encryption • PCI DSS compliant</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center text-sm text-white/40">
          © 2026 AuthorForge. All rights reserved.
        </div>
      </footer>
    </div>
  );
}