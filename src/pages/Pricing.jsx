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
          <p className="text-sm text-white/40 mt-4">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center text-sm text-white/40">
          © 2024 AuthorForge. All rights reserved.
        </div>
      </footer>
    </div>
  );
}