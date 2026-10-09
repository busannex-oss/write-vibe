import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  Check,
  Star,
  Zap,
  Shield,
  Clock,
  Layers,
  Compass,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import DemoVideoModal from "@/components/DemoVideoModal";
import AITeamSection from "@/components/landing/AITeamSection";
import TrustBar from "@/components/landing/TrustBar";
import ServicesEcosystem from "@/components/landing/ServicesEcosystem";
import TransformationJourney from "@/components/landing/TransformationJourney";
import WhyAISection from "@/components/landing/WhyAISection";
import ClientJourney from "@/components/landing/ClientJourney";
import AuthorReadinessAssessment from "@/components/landing/AuthorReadinessAssessment";
import LandingFAQ from "@/components/landing/LandingFAQ";
import { useHomepageCopy } from "@/lib/homepageCopy";

const DEFAULT_HERO = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400&h=800&fit=crop&q=80";

export default function Landing() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [heroImage, setHeroImage] = useState(DEFAULT_HERO);
  const copy = useHomepageCopy();

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) return;
      const user = await base44.auth.me().catch(() => null);
      if (user?.website_hero_image_url) setHeroImage(user.website_hero_image_url);
    });
  }, []);

  useEffect(() => {
    const schemas = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Write Vibe",
        "url": window.location.origin,
        "description": "AI-powered publishing and intellectual property development company helping authors, executives, and organizations transform expertise into published books, author brands, and long-term business assets.",
        "logo": window.location.origin + "/favicon.ico",
        "sameAs": []
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Write Vibe",
        "applicationCategory": "BusinessApplication",
        "description": "AI-enhanced publishing ecosystem covering book strategy, manuscript development, editing, cover design, publishing to Amazon KDP, author branding, book websites, audiobooks, and marketing assets.",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "7-day free trial, no credit card required"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "50000",
          "bestRating": "5"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Who owns the book and the intellectual property?",
            "acceptedAnswer": { "@type": "Answer", "text": "You do — completely. Every manuscript, cover, trailer, and marketing asset created on Write Vibe belongs to you, including full copyright and commercial rights." }
          },
          {
            "@type": "Question",
            "name": "How is AI used in the writing process?",
            "acceptedAnswer": { "@type": "Answer", "text": "AI handles production work: research, structure, drafting assistance, editing suggestions, and design. Your voice and expertise guide everything, and you review and approve every word. AI supports human creativity — it never replaces it." }
          },
          {
            "@type": "Question",
            "name": "Can I publish my book directly from Write Vibe?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes. Write Vibe integrates with Amazon KDP and major bookstores so you can publish directly from the platform, or export professionally formatted files for any publisher." }
          },
          {
            "@type": "Question",
            "name": "Is Write Vibe free to try?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes. Write Vibe offers a 7-day free trial with no credit card required. You can cancel anytime." }
          },
          {
            "@type": "Question",
            "name": "Is my manuscript confidential?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes. Your work is private to you and the collaborators you explicitly invite. Drafts and business documents are never shared or used without your action." }
          }
        ]
      }
    ];

    const existingScripts = document.querySelectorAll('script[data-writevibe-schema]');
    existingScripts.forEach(s => s.remove());

    schemas.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-writevibe-schema', 'true');
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    document.title = 'Write Vibe — AI Publishing & Intellectual Property Development';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.name = 'description'; document.head.appendChild(metaDesc); }
    metaDesc.content = 'Write Vibe is an AI-powered publishing and intellectual property development platform. Turn your expertise into a published book, author brand, and long-term business asset — book strategy, manuscript development, publishing, and marketing in one ecosystem.';

    return () => {
      document.querySelectorAll('script[data-writevibe-schema]').forEach(s => s.remove());
    };
  }, []);

  const goToSignup = () => base44.auth.redirectToLogin(window.location.origin + createPageUrl("Dashboard"));

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Bestselling Author",
      content: "I published 3 books in the time it used to take me to finish one draft. The AI team handles outlining, covers, and marketing — I just write.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    },
    {
      name: "James Chen",
      role: "Consultant & Author",
      content: "My book became my best salesperson. It opened doors to speaking engagements and clients my marketing budget never could — and Write Vibe built the whole ecosystem around it.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    {
      name: "Emily Rodriguez",
      role: "Publishing House Editor",
      content: "We moved our entire 40-title catalog to Write Vibe's white-label platform. Our editors collaborate in one place instead of six tools.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Write Vibe</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#ecosystem" className="text-sm text-white/60 hover:text-white transition-colors">Ecosystem</a>
            <a href="#why-ai" className="text-sm text-white/60 hover:text-white transition-colors">Why AI</a>
            <a href="#assessment" className="text-sm text-white/60 hover:text-white transition-colors">Assessment</a>
            <a href="#testimonials" className="text-sm text-white/60 hover:text-white transition-colors">Results</a>
            <Link to={createPageUrl("Pricing")} className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={goToSignup}
              className="hidden sm:inline-flex text-white/70 hover:text-white hover:bg-white/10"
            >
              Sign In
            </Button>
            <Button
              onClick={goToSignup}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 text-sm px-3 sm:px-4"
            >
              <span className="hidden sm:inline">Start Free Trial</span>
              <span className="sm:hidden">Try Free</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-300">AI-Powered Publishing & Intellectual Property Development</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              {copy("hero", "headline") || (
                <>
                  Your Expertise Is an Asset.
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"> Publish It Like One.</span>
                </>
              )}
            </h1>
            <p className="text-base sm:text-xl text-white/60 mb-10 max-w-2xl mx-auto">
              {copy("hero", "subheadline") || copy("hero", "body_copy") ||
                "Write Vibe combines expert publishing strategy with AI-enhanced workflows to transform your knowledge, experience, and ideas into published books — and the author brand, revenue streams, and opportunities that follow."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={goToSignup}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-14 px-8 text-lg"
              >
                {copy("hero", "primary_cta", "Start Building Your Book — Free")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowDemoModal(true)}
                className="h-14 px-8 text-lg border-white/20 text-white/80 hover:bg-white/10 hover:text-white bg-transparent">
                Watch Demo
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>You own 100% of your IP</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Image/Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-amber-500/10 relative">
              <video
                autoPlay
                muted
                loop
                playsInline
                poster={heroImage}
                className="w-full h-[220px] sm:h-[360px] md:h-[500px] object-cover"
              >
                <source src="https://media.base44.com/videos/public/6975e45ac14c500ed1fcdcf2/5d8717cb2_Write_Vibe_Hero.mp4" type="video/mp4" />
              </video>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <TrustBar />

      {/* Problem Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {copy("problem", "headline") || (
              <>Unwritten Expertise Is <span className="text-amber-400">Unrealized Value</span></>
            )}
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-12">
            {copy("problem", "body_copy") || copy("problem", "subheadline") ||
              "Professionals, entrepreneurs, and organizations sit on decades of knowledge that never becomes an asset. The manuscript stays unfinished. The ideas stay unorganized. The publishing process stays confusing. And the authority, visibility, and revenue a book could generate never materialize."}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-white font-medium mb-1">No Time, No System</h3>
              <p className="text-sm text-white/50">Months of writing, editing, and production stall careers-worth of expertise before chapter one.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
                <Compass className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-white font-medium mb-1">Publishing Confusion</h3>
              <p className="text-sm text-white/50">Formats, distributors, rights, and platforms — the industry is opaque unless it's your full-time job.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-white font-medium mb-1">Books That Go Nowhere</h3>
              <p className="text-sm text-white/50">Even finished books fail without branding, marketing, and a strategy to monetize the expertise behind them.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Layers className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {copy("solution", "headline") || (
              <>One Integrated Process, <span className="text-amber-400">Expert-Guided and AI-Enhanced</span></>
            )}
          </h2>
          <p className="text-white/60 text-lg max-w-3xl mx-auto">
            {copy("solution", "body_copy") || copy("solution", "subheadline") ||
              "Write Vibe replaces the fragmented maze of ghostwriters, editors, designers, and marketing agencies with a single, connected publishing process. Intelligent AI workflows handle research, structure, production, and consistency, while strategic guidance keeps every decision aligned with your goals — and your creativity and voice at the center. The result: books that get finished, published professionally, and built to work as long-term assets."}
          </p>
        </div>
      </section>

      {/* Services Ecosystem */}
      <ServicesEcosystem />

      {/* Transformation Journey */}
      <TransformationJourney />

      {/* Why AI */}
      <WhyAISection />

      {/* AI Team Section — brand uniqueness */}
      <AITeamSection />

      {/* Client Journey */}
      <ClientJourney />

      {/* Stats Section — demonstrated proof */}
      <section className="py-20 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {copy("proof", "headline") || (
                <>Measured Outcomes, <span className="text-amber-400">Not Marketing Claims</span></>
              )}
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              {copy("proof", "subheadline") || copy("proof", "body_copy") ||
                "Authors and organizations stay because their books get finished, published, and put to work."}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10,000+", label: "Books written, designed, and published" },
              { value: "50,000+", label: "Authors and organizations on the platform" },
              { value: "99.9%", label: "Uptime — your IP is always accessible" },
              { value: "4.9/5", label: "Average author rating" }
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-white/40 text-sm mt-10 max-w-2xl mx-auto">
            Write Vibe publishes directly to Amazon KDP and major bookstores, and is trusted by publishing
            houses running their entire catalog on our white-label platform.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {copy("testimonials", "headline") || (
                <>Authors Who Turned Books Into <span className="text-amber-400">Businesses</span></>
              )}
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              {copy("testimonials", "subheadline") || copy("testimonials", "body_copy") ||
                "First-time writers, consultants, executives, and publishing houses build their intellectual property here."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-white/70 mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <img src={testimonial.avatar} alt="" className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-medium text-white">{testimonial.name}</div>
                    <div className="text-sm text-white/40">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Author Readiness Assessment */}
      <AuthorReadinessAssessment />

      {/* FAQ Section */}
      <LandingFAQ />

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-6 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-300">7-Day Free Trial • No Credit Card Required</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                {copy("cta", "headline", "Start Building Your Next Intellectual Property Asset")}
              </h2>
              <p className="text-white/60 mb-8 max-w-xl mx-auto">
                {copy("cta", "body_copy") || copy("cta", "subheadline") ||
                  "The expertise is already yours. Write Vibe provides the strategy, the AI-enhanced workflows, and the publishing ecosystem to turn it into a book — and the brand, products, and opportunities that come after. We'll be your publishing partner from first outline to lasting legacy."}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Button
                  size="lg"
                  onClick={goToSignup}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-14 px-8 text-lg"
                >
                  {copy("cta", "primary_cta", "Begin Your Free Trial")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <div className="flex items-center gap-4 text-sm text-white/50">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>You own everything</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/40">
                Join 50,000+ authors and organizations building intellectual property on Write Vibe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Modal */}
      <DemoVideoModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">Write Vibe</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-white/40">
              <Link to={createPageUrl("About")} className="hover:text-white transition-colors">About</Link>
              <Link to={createPageUrl("HowItWorks")} className="hover:text-white transition-colors">How It Works</Link>
              <Link to={createPageUrl("Blog")} className="hover:text-white transition-colors">Blog</Link>
              <Link to={createPageUrl("Investor")} className="hover:text-white transition-colors">Investors</Link>
              <Link to={createPageUrl("Privacy")} className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to={createPageUrl("Terms")} className="hover:text-white transition-colors">Terms of Use</Link>
              <Link to={createPageUrl("FAQ")} className="hover:text-white transition-colors">FAQ</Link>
              <Link to={createPageUrl("Contact")} className="hover:text-white transition-colors">Contact</Link>
              <Link to={createPageUrl("CookiePolicy")} className="hover:text-white transition-colors">Cookie Policy</Link>
              <Link to={createPageUrl("RefundPolicy")} className="hover:text-white transition-colors">Refund Policy</Link>
            </div>
            <div className="text-sm text-white/40">
              © 2026 Write Vibe. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}