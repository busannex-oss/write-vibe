import React from "react";
import { VALUATION as v } from "@/lib/systemValuation";
import ValuationSummary from "@/components/admin/ValuationSummary";

const usd = (n) => "$" + Math.round(n).toLocaleString();
const Section = ({ title, children }) => (
  <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
    <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
    <div className="text-sm text-white/70 space-y-2">{children}</div>
  </section>
);

export default function SystemValuationReport() {
  const replacement = v.components.reduce((s, c) => s + c.value, 0);
  const gap = v.fmv - v.cash;
  const balance = v.installment.price - v.installment.down;
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">Write Vibe — System Valuation</h2>
        <p className="text-sm text-white/50">Prepared under {v.promptId} · {v.date} · Evidence-based estimate, not a certified appraisal.</p>
      </div>
      <Section title="1. Component Replacement / Development Value">
        {v.components.map((c) => (
          <div key={c.name} className="flex justify-between gap-4 border-b border-white/5 pb-1">
            <span>{c.name}</span><span className="text-white font-medium">{usd(c.value)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-1 text-white font-bold"><span>Total</span><span>{usd(replacement)}</span></div>
        <p className="text-xs text-white/40">Based on professional US agency rates (~$125/hr) for design, engineering, AI prompt engineering and documentation.</p>
      </Section>
      <Section title="Component Status">
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(v.status).map(([k, list]) => (
            <div key={k}>
              <p className="font-semibold text-amber-400 mb-1">{k}</p>
              <ul className="list-disc pl-4 space-y-1">{list.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
      </Section>
      <Section title={`2. Current Fair Market Value: ${usd(v.fmv)}`}><p>{v.fmvMethod}</p></Section>
      <Section title={`3. Retail / Acquisition Price: ${usd(v.retail)}`}><p>{v.retailWhy}</p></Section>
      <Section title={`4. Cash Buyout Price: ${usd(v.cash)}`}>
        <p className="font-semibold text-white">FMV represents what the asset is estimated to be worth. The Cash Buyout Price represents what the owner is willing to accept under the stated acquisition structure.</p>
        <p>Difference from FMV: {usd(gap)} ({((gap / v.fmv) * 100).toFixed(1)}% below FMV). The buyer's implied acquisition advantage is {usd(gap)} in asset value on day one for a prompt, one-time payment.</p>
      </Section>
      <Section title={`5. Monthly Usage / Licensing Price: ${usd(v.monthly)} / month`}><p>{v.monthlyIncludes}</p></Section>
      <Section title="6. Down Payment / Installment Structure">
        <p>Purchase Price: {usd(v.installment.price)} · Down Payment (30%): {usd(v.installment.down)} · Remaining Balance: {usd(balance)}</p>
        <p>Recommended structure: {v.installment.months} monthly payments of {usd(balance / v.installment.months)}, with ownership transferring when paid in full. This is an installment purchase, not a subscription.</p>
      </Section>
      <Section title="White-Label & Business-Asset Value">
        <p>The white-label setup (tenant management, branding, domain/DNS mapping, plan selection) is complete, but no paying tenants exist yet, so it counts only as replacement value plus potential, with no revenue multiple applied.</p>
        <p>Business assets counted toward FMV: Write Vibe brand and domain, 30 trained agent personas and prompt library, SOPs, constitution, white paper, KPI framework, legal documents, brand style guide and customer-acquisition automation.</p>
      </Section>
      <ValuationSummary v={v} replacement={replacement} />
    </div>
  );
}