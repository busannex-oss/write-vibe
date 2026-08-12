import React from "react";

const faqs = [
  { q: "Who owns the book and the intellectual property?", a: "You do — completely. Every manuscript, cover, trailer, and marketing asset created on Write Vibe belongs to you, including full copyright and commercial rights. We never claim ownership of your work." },
  { q: "How is AI used, and will the book still sound like me?", a: "AI handles production work: research, structure, drafting assistance, editing suggestions, and design. Your Personal Intelligence Blueprint captures your voice and goals before anything is generated, and you review and approve every word. AI supports your expertise — it never replaces it." },
  { q: "How long does it take to publish a book?", a: "It depends on your starting point and involvement. Authors with a clear idea and regular sessions typically move from concept to publishable manuscript in weeks, not years — with cover design, formatting, and publishing setup handled in parallel rather than afterward." },
  { q: "Can I collaborate with my editor or team?", a: "Yes. Invite editors, publishers, and marketing team members with role-based access. Everyone works on the same project with shared drafts, comments, and version history — no email chains or scattered files." },
  { q: "What are my publishing options?", a: "Publish directly to Amazon KDP and major bookstores from the platform, or export professionally formatted files for any publisher or distributor you choose. You're never locked in." },
  { q: "What marketing support is included?", a: "Every book can generate its own launch ecosystem: a book website with newsletter integration, video trailers, press releases, social content, and a structured marketing launch plan — all derived from your finished manuscript." },
  { q: "Is my manuscript confidential?", a: "Yes. Your work is private to you and the collaborators you explicitly invite. Drafts, ideas, and business documents are never shared, published, or used without your action." },
  { q: "Is Write Vibe free to try?", a: "Yes — a 7-day free trial with no credit card required. Cancel anytime." }
];

export default function LandingFAQ() {
  return (
    <section className="py-20 px-6" itemScope itemType="https://schema.org/FAQPage">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Frequently Asked <span className="text-amber-400">Questions</span>
          </h2>
          <p className="text-white/60">Straight answers on ownership, AI, timelines, and confidentiality.</p>
        </div>
        <div className="space-y-4">
          {faqs.map(({ q, a }, i) => (
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
  );
}