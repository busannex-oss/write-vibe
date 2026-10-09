import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sparkles, RotateCcw } from "lucide-react";

const SECTIONS = [
  { title: "1. Free Trial", content: "New members can try Write Vibe with a free trial. You will not be charged if you cancel before the trial ends." },
  { title: "2. 14-Day Refund on Your First Payment", content: "If you are not satisfied, you may request a full refund within 14 days of your first paid subscription charge. This applies once per account." },
  { title: "3. Renewals and Cancellations", content: "You can cancel at any time from your account settings. Cancellation stops future charges, and you keep access until the end of your current billing period. Renewal charges and partially used billing periods are not refunded." },
  { title: "4. Non-Refundable Items", content: "AI generation credits that have already been used, completed custom services, white-label setup fees, and third-party costs (such as distribution, printing, or ISBN fees paid to outside providers) are not refundable." },
  { title: "5. Platform Acquisition & Licensing", content: "Acquisition, installment purchase, and licensing agreements follow the refund terms written into each signed agreement and are not covered by this policy." },
  { title: "6. Billing Errors", content: "If you were charged in error or charged twice, contact us and we will refund the incorrect amount in full." },
  { title: "7. How to Request a Refund", content: "Send a request through our Contact page with the email on your account and the date of the charge. Approved refunds go back to your original payment method, usually within 5–10 business days." },
];

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Write Vibe</span>
          </Link>
        </div>
      </nav>
      <div className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Refund Policy</h1>
              <p className="text-white/40 text-sm mt-1">Last updated: October 2026</p>
            </div>
          </div>
          <div className="space-y-8">
            {SECTIONS.map((s) => (
              <div key={s.title}>
                <h2 className="text-xl font-semibold text-white mb-2">{s.title}</h2>
                <p className="text-white/60 leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to={createPageUrl("Contact")} className="text-amber-400 hover:text-amber-300">Contact us about a refund →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}