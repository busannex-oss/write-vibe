import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  BookOpen, 
  Wand2, 
  Video, 
  Globe, 
  Users,
  ArrowRight,
  Check,
  Star,
  Zap,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import DemoVideoModal from "@/components/DemoVideoModal";

export default function Landing() {
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    const schemas = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "AuthorForge",
        "url": window.location.origin,
        "description": "AI-powered book creation platform helping authors write, design, and publish books with intelligent AI agents.",
        "logo": window.location.origin + "/favicon.ico",
        "sameAs": []
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "AuthorForge",
        "applicationCategory": "BusinessApplication",
        "description": "AI-powered book creation suite that handles character creation, outlining, cover design, video commercials, book websites, and team collaboration for authors.",
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
            "name": "What is AuthorForge?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "AuthorForge is an AI-powered book creation suite that helps authors write, design, and publish books. It uses intelligent AI agents to handle character creation, outlining, cover design, video commercials, book websites, and team collaboration."
            }
          },
          {
            "@type": "Question",
            "name": "How does AuthorForge help authors?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "AuthorForge automates the entire book production process. AI agents create rich characters with backstories, generate chapter-by-chapter outlines, design professional book covers, produce video trailers, build book landing pages with newsletter integration, and manage team collaboration with role-based access."
            }
          },
          {
            "@type": "Question",
            "name": "Is AuthorForge free to try?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. AuthorForge offers a 7-day free trial with no credit card required. You can cancel anytime."
            }
          },
          {
            "@type": "Question",
            "name": "Can I publish my book directly from AuthorForge?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. AuthorForge integrates with Amazon KDP and other major bookstores so you can submit your manuscript and publish directly from the platform."
            }
          },
          {
            "@type": "Question",
            "name": "Does AuthorForge support team collaboration?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. You can invite editors, publishers, and marketing team members with role-based access control so everyone can collaborate on the same book project."
            }
          }
        ]
      }
    ];

    const existingScripts = document.querySelectorAll('script[data-authorforge-schema]');
    existingScripts.forEach(s => s.remove());

    schemas.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-authorforge-schema', 'true');
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    document.title = 'AuthorForge — Write Your Book with AI Agents';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.name = 'description'; document.head.appendChild(metaDesc); }
    metaDesc.content = 'AuthorForge is an AI-powered book creation suite. Write, design, and publish your book with intelligent AI agents handling characters, outlines, covers, video trailers, and marketing. Start your 7-day free trial.';

    return () => {
      document.querySelectorAll('script[data-authorforge-schema]').forEach(s => s.remove());
    };
  }, []);

  const features = [
    {
      icon: Wand2,
      title: "AI Character Creation",
      description: "Create rich, consistent characters with detailed personalities, backstories, and visual descriptions"
    },
    {
      icon: BookOpen,
      title: "Smart Outlining",
      description: "Generate comprehensive chapter-by-chapter outlines with intelligent story structure"
    },
    {
      icon: Sparkles,
      title: "Cover Design",
      description: "AI-powered book cover creation maintaining character consistency throughout"
    },
    {
      icon: Video,
      title: "Video Commercials",
      description: "Professional book trailers tailored to your target audience"
    },
    {
      icon: Globe,
      title: "Book Websites",
      description: "Instant landing pages with newsletter integration and bookstore links"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Invite editors, publishers, and marketing teams with role-based access"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Bestselling Author",
      content: "AuthorForge transformed my writing process. The AI agents handle everything from outlining to marketing.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    },
    {
      name: "James Chen",
      role: "Self-Published Author",
      content: "The character consistency across my book cover and video trailer is remarkable. Worth every penny.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    {
      name: "Emily Rodriguez",
      role: "Publishing House Editor",
      content: "We use AuthorForge for our entire catalog. The white-label option is perfect for our brand.",
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
            <span className="font-bold text-lg text-white">AuthorForge</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
            <a href="#testimonials" className="text-sm text-white/60 hover:text-white transition-colors">Testimonials</a>
            <Link to={createPageUrl("Pricing")} className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => base44.auth.redirectToLogin(window.location.origin + createPageUrl("Dashboard"))}
              className="hidden sm:inline-flex text-white/70 hover:text-white hover:bg-white/10"
            >
              Sign In
            </Button>
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.origin + createPageUrl("Dashboard"))}
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
              <span className="text-sm text-amber-300">AI-Powered Book Creation Suite</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Write Your Book with
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"> AI Agents</span>
            </h1>
            <p className="text-base sm:text-xl text-white/60 mb-10 max-w-2xl mx-auto">
              From character creation to marketing, our intelligent AI agents handle every aspect of your book journey on autopilot.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Button 
                  size="lg" 
                  onClick={() => base44.auth.redirectToLogin(window.location.origin + createPageUrl("Dashboard"))}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-14 px-8 text-lg"
                >
                  Start 7-Day Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
               <Button 
                size="lg" 
                variant="outline" 
                onClick={() => setShowDemoModal(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-14 px-8 text-lg">
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
                <span>Cancel anytime</span>
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
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-amber-500/10">
              <img 
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400&h=800&fit=crop&q=80" 
                alt="Diverse Authors Proudly Holding Their Published Books"
                className="w-full h-[220px] sm:h-[360px] md:h-[500px] object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Everything You Need to <span className="text-amber-400">Publish</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Our AI agents work together seamlessly to take your book from concept to market
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/50">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10,000+", label: "Books Created" },
              { value: "50,000+", label: "Authors" },
              { value: "99.9%", label: "Uptime" },
              { value: "4.9/5", label: "Rating" }
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Loved by <span className="text-amber-400">Authors</span>
            </h2>
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

      {/* FAQ Section */}
      <section className="py-20 px-6" itemScope itemType="https://schema.org/FAQPage">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked <span className="text-amber-400">Questions</span>
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "What is AuthorForge?", a: "AuthorForge is an AI-powered book creation suite that helps authors write, design, and publish books. AI agents handle character creation, outlining, cover design, video trailers, book websites, and team collaboration — all in one place." },
              { q: "Is AuthorForge free to try?", a: "Yes. AuthorForge offers a 7-day free trial with no credit card required. You can cancel anytime." },
              { q: "Can I publish my book directly from AuthorForge?", a: "Yes. AuthorForge integrates with Amazon KDP and major bookstores so you can submit and publish directly from the platform." },
              { q: "Does AuthorForge support team collaboration?", a: "Absolutely. Invite editors, publishers, and marketing teams with role-based access so everyone works together on the same project." },
              { q: "What kinds of books can I create with AuthorForge?", a: "Any genre — fiction, non-fiction, self-help, children's books, and more. The AI adapts to your book's category, tone, and target audience." }
            ].map(({ q, a }, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 className="text-lg font-semibold text-white mb-3" itemProp="name">{q}</h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-white/60" itemProp="text">{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-6 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Write Your Masterpiece?
            </h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Join thousands of authors using AI to bring their stories to life
            </p>
            <Button 
              size="lg" 
              onClick={() => base44.auth.redirectToLogin(window.location.origin + createPageUrl("Dashboard"))}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-14 px-8 text-lg"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
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
              <span className="font-semibold text-white">AuthorForge</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-white/40">
              <Link to={createPageUrl("About")} className="hover:text-white transition-colors">About</Link>
              <Link to={createPageUrl("HowItWorks")} className="hover:text-white transition-colors">How It Works</Link>
              <Link to={createPageUrl("Investor")} className="hover:text-white transition-colors">Investors</Link>
              <Link to={createPageUrl("Privacy")} className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to={createPageUrl("Terms")} className="hover:text-white transition-colors">Terms of Use</Link>
              <Link to={createPageUrl("FAQ")} className="hover:text-white transition-colors">FAQ</Link>
              <Link to={createPageUrl("Contact")} className="hover:text-white transition-colors">Contact</Link>
              <Link to={createPageUrl("CookiePolicy")} className="hover:text-white transition-colors">Cookie Policy</Link>
            </div>
            <div className="text-sm text-white/40">
              © 2026 AuthorForge. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}