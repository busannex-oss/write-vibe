import React from "react";

const usd = (n) => "$" + Math.round(n).toLocaleString();

export default function ValuationSummary({ v, replacement }) {
  const rows = [
    ["Current Estimated Component Replacement / Development Value", usd(replacement)],
    ["Current Estimated Fair Market Value", usd(v.fmv)],
    ["Recommended Retail / Acquisition Price", usd(v.retail)],
    ["Recommended Cash Buyout Price", usd(v.cash)],
    ["Recommended Monthly Usage / Licensing Price", usd(v.monthly) + " / month"],
    ["Recommended Down Payment", usd(v.installment.down)],
    ["Previous FMV", v.previousFmv ? usd(v.previousFmv) : "None on record (this is the baseline)"],
    ["Change Since Previous Evaluation", v.previousFmv ? `${usd(v.fmv - v.previousFmv)} | ${(((v.fmv - v.previousFmv) / v.previousFmv) * 100).toFixed(1)}%` : "N/A (baseline)"],
    ["Valuation Date", v.date],
    ["Next Valuation Trigger", "Material system improvement, commercial traction, tenant growth, market change, or scheduled review."],
  ];
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
      <h3 className="text-lg font-bold text-amber-400 mb-4">Executive Valuation Summary</h3>
      <dl className="divide-y divide-white/10">
        {rows.map(([k, val]) => (
          <div key={k} className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2">
            <dt className="text-sm text-white/60">{k}</dt>
            <dd className="text-sm font-semibold text-white sm:text-right">{val}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm italic text-white/70">FMV shows what is actually there. Price shows what Miranda is willing to accept.</p>
    </div>
  );
}