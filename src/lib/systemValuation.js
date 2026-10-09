// Write Vibe valuation per prompt MJ-PV-2026-10-09 v2.0.
// Evidence snapshot: 69 pages, 74 backend functions, 30 AI agents, 26 workflows,
// 47 data models, 7 email templates; 2 users, 0 white-label tenants, 0 recorded payments.
export const VALUATION = {
  date: "October 9, 2026",
  promptId: "MJ-PV-2026-10-09 v2.0",
  previousFmv: null,
  components: [
    { name: "AI Book Studio (creation wizard, staged editor, outlines, manuscript, covers, audiobook, trailer, versions, comments)", value: 95000 },
    { name: "AI Agent Network (30 persona agents, governance, dual-review approvals, memory, override controls)", value: 70000 },
    { name: "Backend services & integrations (74 functions: AI gateway, publishing gateway, Amazon, social, Google Drive)", value: 65000 },
    { name: "CRM, lead scoring, nurture sequences & reader insights", value: 30000 },
    { name: "Data architecture & security (47 models, row-level access, rate limiting)", value: 28000 },
    { name: "White-label architecture (tenants, branding, domain/DNS panel, plans)", value: 26000 },
    { name: "Blog / content platform (humanized authors, SEO, RSS, sitemap, scheduling)", value: 24000 },
    { name: "Admin operations (system traces, error dashboard, backups, MCP server)", value: 24000 },
    { name: "Automation (26 workflows, 7 branded email templates)", value: 22000 },
    { name: "Business documentation (constitution, white paper, SOPs, registry, KPIs, legal, brand guide)", value: 20000 },
    { name: "Marketing site, PWA, pricing & legal pages", value: 18000 },
  ],
  status: {
    "Operational / Live": ["Published web app & PWA", "Book studio and AI tools", "Agent network & autonomous workflows", "Blog, newsletter, CRM", "Google Drive chapter export", "MCP server", "Tracing & rate limiting"],
    "Activation Required": ["Facebook / Instagram / LinkedIn posting (API keys)", "Discord notifications (webhook)", "Print & ebook distribution providers (Lulu, PublishDrive)", "Payment processing for memberships", "White-label tenants (no tenants yet)"],
    "Planned (not valued)": ["Backup browsing UI & restore testing", "Meeting minutes export to Drive", "Guided paid-member onboarding", "Real-time consensus alerts"],
  },
  fmv: 285000,
  fmvMethod: "Cost approach adjusted for market factors. Replacement value ($422,000) is reduced ~45% for pre-revenue status (no paying customers or tenants yet) and integrations awaiting activation, then credited for proprietary IP: the agent persona system, governance framework, brand and business documentation. Market check: comparable pre-revenue AI SaaS assets typically transact at 40–75% of replacement cost.",
  retail: 325000,
  retailWhy: "Set about 14% above FMV to leave room for negotiation and to reflect the buyer's time-to-market savings (12–18 months of build avoided).",
  cash: 195000,
  monthly: 2450,
  monthlyIncludes: "Full platform use under the owner's brand, all agents and workflows, hosting, maintenance and updates. AI credit usage above normal volume is billed at cost.",
  installment: { price: 325000, down: 97500, months: 24 },
};