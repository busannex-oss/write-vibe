import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <Link to={createPageUrl("Landing")}>
          <Button variant="ghost" className="text-white/60 hover:text-white mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <div className="space-y-8 text-white/80">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              We collect information you provide directly to us when you create an account, 
              use our services, or communicate with us. This includes:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-white/60">
              <li>Account information (name, email, password)</li>
              <li>Book content and manuscript data</li>
              <li>Payment information (processed securely through our payment providers)</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc ml-6 space-y-2 text-white/60">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and send related information</li>
              <li>Generate AI-powered content for your books</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Data Security</h2>
            <p className="text-white/60">
              We implement appropriate technical and organizational measures to protect your 
              personal information. Your book content is encrypted and stored securely.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Your Rights</h2>
            <p className="mb-4 text-white/60">You have the right to:</p>
            <ul className="list-disc ml-6 space-y-2 text-white/60">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your book content</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Contact Us</h2>
            <p className="text-white/60">
              If you have questions about this Privacy Policy, please contact us at privacy@authorforge.ai
            </p>
          </section>

          <p className="text-sm text-white/40 mt-12">Last updated: February 25, 2026</p>
        </div>
      </div>
    </div>
  );
}