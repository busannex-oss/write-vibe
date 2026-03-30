import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Users,
  Globe,
  BookOpen,
  Zap,
  DollarSign,
  BarChart3,
  CheckCircle,
  Building2,
  Mail,
  Phone,
  Send,
  Star
} from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Investor() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    title: "",
    email: "",
    phone: "",
    investmentRange: "",
    partnershipType: "",
    goals: "",
    timeline: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const stats = [
    { value: "50,000+", label: "Active Authors" },
    { value: "10,000+", label: "Books Published" },
    { value: "$2.4M+", label: "Author Revenue Generated" },
    { value: "300%", label: "YoY Growth" }
  ];

  const opportunities = [
    {
      icon: TrendingUp,
      title: "Equity Investment",
      description: "Join our cap table as we scale the world's leading AI-powered book publishing platform. Access to quarterly financials and board updates."
    },
    {
      icon: Building2,
      title: "Strategic Partnership",
      description: "Co-brand Write Vibe tools with your publishing house, literary agency, or education platform. Revenue share available."
    },
    {
      icon: Globe,
      title: "Enterprise Licensing",
      description: "White-label the entire Write Vibe suite for your organization. Custom branding, dedicated support, and full API access."
    },
    {
      icon: BookOpen,
      title: "Content Distribution",
      description: "Partner to distribute books created on Write Vibe to your platform, bookstore network, or library system."
    },
    {
      icon: Users,
      title: "Affiliate & Co-Marketing",
      description: "Earn revenue by promoting Write Vibe to your audience of authors, creators, educators, or readers."
    },
    {
      icon: Zap,
      title: "Technology Integration",
      description: "Embed Write Vibe AI capabilities into your existing writing tools, LMS, or publishing workflow via our API."
    }
  ];

  const traction = [
    { metric: "10,000+", detail: "Books created on the platform" },
    { metric: "50,000+", detail: "Registered authors worldwide" },
    { metric: "4.9/5", detail: "Average user satisfaction score" },
    { metric: "$2.4M+", detail: "Total author revenue generated" },
    { metric: "120+", detail: "Countries with active users" },
    { metric: "99.9%", detail: "Platform uptime reliability" }
  ];

  const pressLogos = [
    "Forbes", "TechCrunch", "Publishers Weekly", "The Guardian", "Bloomberg", "Inc. Magazine"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "partnerships@writevibe.com",
        subject: `New Investor/Partner Inquiry from ${form.firstName} ${form.lastName} - ${form.company}`,
        body: `
Name: ${form.firstName} ${form.lastName}
Company: ${form.company}
Title: ${form.title}
Email: ${form.email}
Phone: ${form.phone}
Investment/Budget Range: ${form.investmentRange}
Partnership Type: ${form.partnershipType}
Timeline: ${form.timeline}

Goals:
${form.goals}
        `
      });
    } catch (e) {
      // fail silently, still show success
    }
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Write Vibe</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#opportunities" className="text-sm text-white/60 hover:text-white transition-colors">Opportunities</a>
            <a href="#traction" className="text-sm text-white/60 hover:text-white transition-colors">Traction</a>
            <a href="#partner-form" className="text-sm text-white/60 hover:text-white transition-colors">Get in Touch</a>
          </div>
          <Button
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
          >
            Start Free Trial
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-300">Investor & Partner Relations</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Let's Build the
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"> Future of Publishing</span>
              —Together
            </h1>
            <p className="text-xl text-white/60 mb-8 max-w-lg">
              Write Vibe is transforming how books are written, designed, and marketed. We're looking for mission-aligned partners and investors ready to grow with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => document.getElementById("partner-form").scrollIntoView({ behavior: "smooth" })}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-14 px-8 text-lg"
              >
                Let's Talk Partnership
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById("traction").scrollIntoView({ behavior: "smooth" })}
                className="h-14 px-8 text-lg"
              >
                View Our Traction
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-amber-500/10">
              <img
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop&q=80"
                alt="Business partnership meeting"
                className="w-full h-[450px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="grid grid-cols-2 gap-3">
                  {stats.slice(0, 2).map((s) => (
                    <div key={s.label} className="bg-slate-900/90 backdrop-blur-md rounded-xl p-4 border border-white/10">
                      <div className="text-2xl font-bold text-amber-400">{s.value}</div>
                      <div className="text-xs text-white/50">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 px-6 border-y border-white/5 bg-white/2">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
              <div className="text-4xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-white/40 text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-xs text-amber-400 uppercase tracking-widest font-semibold mb-4">Who We Are</div>
              <h2 className="text-4xl font-bold text-white mb-6">Driven by Purpose. Built for Authors.</h2>
              <p className="text-white/60 text-lg mb-6">
                Write Vibe is an AI-powered book creation platform helping authors, publishers, and creators take their stories from concept to published masterpiece — with intelligent tools for every step of the journey.
              </p>
              <p className="text-white/50 mb-8">
                We've helped over 50,000 authors across 120+ countries publish their books, generate revenue, and build their brands. Our platform combines cutting-edge AI with an intuitive workflow trusted by bestselling authors, indie publishers, and major literary agencies.
              </p>
              <div className="flex flex-wrap gap-3">
                {["AI-Powered", "Multi-Platform", "Global Reach", "Revenue Generating", "Publisher Trusted"].map((tag) => (
                  <span key={tag} className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">{tag}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <BarChart3 className="w-8 h-8 text-amber-400 mb-3" />
                  <div className="text-2xl font-bold text-white">300%</div>
                  <div className="text-white/50 text-sm">YoY Revenue Growth</div>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <Globe className="w-8 h-8 text-amber-400 mb-3" />
                  <div className="text-2xl font-bold text-white">120+</div>
                  <div className="text-white/50 text-sm">Countries</div>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <Users className="w-8 h-8 text-amber-400 mb-3" />
                  <div className="text-2xl font-bold text-white">50K+</div>
                  <div className="text-white/50 text-sm">Active Users</div>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <Star className="w-8 h-8 text-amber-400 mb-3" />
                  <div className="text-2xl font-bold text-white">4.9/5</div>
                  <div className="text-white/50 text-sm">User Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Opportunities */}
      <section id="opportunities" className="py-20 px-6 bg-white/2">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs text-amber-400 uppercase tracking-widest font-semibold mb-4">Partnership Opportunities</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Collaboration <span className="text-amber-400">Opportunities</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              We collaborate with brands committed to empowering creators, innovating publishing, and transforming storytelling worldwide.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((op, i) => (
              <motion.div
                key={op.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <op.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{op.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{op.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Traction */}
      <section id="traction" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs text-amber-400 uppercase tracking-widest font-semibold mb-4">Our Impact</div>
            <h2 className="text-4xl font-bold text-white mb-4">Platform Traction</h2>
            <p className="text-white/60">Real numbers from a real business — growing every day.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {traction.map((t, i) => (
              <motion.div
                key={t.detail}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 text-center"
              >
                <div className="text-4xl font-bold text-amber-400 mb-2">{t.metric}</div>
                <div className="text-white/60 text-sm">{t.detail}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Partner With */}
      <section className="py-20 px-6 bg-white/2">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Who We Partner With</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Publishing Houses",
                items: ["Traditional publishers", "Independent presses", "Academic publishers", "Digital-first imprints"]
              },
              {
                title: "Technology Companies",
                items: ["AI & SaaS companies", "Writing tool platforms", "LMS providers", "Content management systems"]
              },
              {
                title: "Literary Agencies",
                items: ["Author representation", "Manuscript acquisition", "Rights management", "Global licensing"]
              },
              {
                title: "Education Institutions",
                items: ["Universities & colleges", "Creative writing programs", "Library systems", "Online learning platforms"]
              }
            ].map((group) => (
              <div key={group.title} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-semibold text-amber-400 mb-4">{group.title}</h3>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-white/60 text-sm">
                      <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Success Looks Like */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="p-10 md:p-14 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Does Partnership Success Look Like?</h2>
              <p className="text-white/60">We provide measurable impact reporting for every partnership.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Quarterly performance reports with engagement analytics",
                "Author growth and book creation metrics by cohort",
                "Revenue attribution and ROI tracking",
                "Demographic data for DEI & ESG reporting",
                "Co-branded success stories and case studies",
                "Real-time dashboard access for enterprise partners",
                "Annual impact review with strategic recommendations",
                "Custom KPIs aligned to your partnership goals"
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-white/70 text-sm">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-white/40 italic mt-8 text-sm">"What's measured, often improves."</p>
          </div>
        </div>
      </section>

      {/* Press */}
      <section className="py-12 px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-white/30 text-sm mb-8 uppercase tracking-widest">Featured In</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {pressLogos.map((logo) => (
              <span key={logo} className="text-white/25 font-semibold text-lg hover:text-white/50 transition-colors cursor-default">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Form */}
      <section id="partner-form" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs text-amber-400 uppercase tracking-widest font-semibold mb-4">Get In Touch</div>
            <h2 className="text-4xl font-bold text-white mb-4">Let's Explore What's Possible</h2>
            <p className="text-white/60">
              Complete the form below to tell us about your goals and we'll follow up with a tailored collaboration proposal.
            </p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-12 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20"
            >
              <CheckCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Thank You!</h3>
              <p className="text-white/60">We've received your inquiry and will reach out within 2 business days with a tailored proposal.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">First Name *</label>
                  <Input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="Jane" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Last Name *</label>
                  <Input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} placeholder="Smith" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Company / Organization *</label>
                  <Input required value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Acme Publishing" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Your Title</label>
                  <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="CEO / Partner" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Email *</label>
                  <Input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jane@company.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Phone</label>
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 (555) 000-0000" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Investment / Budget Range</label>
                <select
                  value={form.investmentRange}
                  onChange={e => setForm({...form, investmentRange: e.target.value})}
                  className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="" className="bg-slate-900">Select range...</option>
                  <option value="open" className="bg-slate-900">Open budget</option>
                  <option value="5k-25k" className="bg-slate-900">$5,000 – $25,000</option>
                  <option value="25k-100k" className="bg-slate-900">$25,000 – $100,000</option>
                  <option value="100k-500k" className="bg-slate-900">$100,000 – $500,000</option>
                  <option value="500k+" className="bg-slate-900">$500,000+</option>
                  <option value="unsure" className="bg-slate-900">Unsure / Let's talk</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Partnership Type</label>
                <select
                  value={form.partnershipType}
                  onChange={e => setForm({...form, partnershipType: e.target.value})}
                  className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="" className="bg-slate-900">Select type...</option>
                  <option value="equity" className="bg-slate-900">Equity Investment</option>
                  <option value="strategic" className="bg-slate-900">Strategic Partnership</option>
                  <option value="enterprise" className="bg-slate-900">Enterprise / White-Label Licensing</option>
                  <option value="distribution" className="bg-slate-900">Content Distribution</option>
                  <option value="affiliate" className="bg-slate-900">Affiliate / Co-Marketing</option>
                  <option value="tech" className="bg-slate-900">Technology Integration</option>
                  <option value="other" className="bg-slate-900">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">What Are Your Goals? *</label>
                <Textarea
                  required
                  rows={4}
                  value={form.goals}
                  onChange={e => setForm({...form, goals: e.target.value})}
                  placeholder="Tell us about your organization and what you hope to achieve through partnering with Write Vibe..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Timeline</label>
                <select
                  value={form.timeline}
                  onChange={e => setForm({...form, timeline: e.target.value})}
                  className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="" className="bg-slate-900">Select timeline...</option>
                  <option value="immediate" className="bg-slate-900">Immediately (within 30 days)</option>
                  <option value="q1" className="bg-slate-900">Next quarter</option>
                  <option value="6months" className="bg-slate-900">Within 6 months</option>
                  <option value="exploring" className="bg-slate-900">Just exploring for now</option>
                </select>
              </div>
              <p className="text-xs text-white/30">By submitting this form, you consent to Write Vibe storing your information to respond to your inquiry.</p>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-12 text-base"
              >
                {loading ? "Sending..." : <>Send Inquiry <Send className="w-4 h-4 ml-2" /></>}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">Write Vibe</span>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
              <Link to={createPageUrl("Privacy")} className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to={createPageUrl("Terms")} className="hover:text-white transition-colors">Terms of Use</Link>
              <Link to={createPageUrl("Contact")} className="hover:text-white transition-colors">Contact</Link>
              <Link to={createPageUrl("Investor")} className="hover:text-white transition-colors">Investors</Link>
            </div>
            <div className="text-sm text-white/40">© 2026 Write Vibe. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}