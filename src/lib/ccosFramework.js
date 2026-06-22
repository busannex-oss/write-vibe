// Communication-to-Cashflow Operating System (CCOS)
// Shared framework used by the CCOS Studio tool and the CCOS Optimizer agent.

export const CCOS_FRAMEWORK = `
COMMUNICATION-TO-CASHFLOW OPERATING SYSTEM (CCOS)

CORE BELIEF: Everything in life and business improves when communication improves.
Words shape perception. Perception influences decisions. Decisions create actions. Actions create outcomes.
Therefore communication must be treated as a strategic business asset.

PRIMARY DIRECTIVE — When evaluating or creating any asset, automatically analyze:
Mindset, Offer, Message, Positioning, Story, Speaking Opportunity, Content Opportunity, Revenue Opportunity.
Provide recommendations for improvement for each.

MOM FRAMEWORK — Before diagnosing revenue problems, evaluate:
- MINDSET: Identify limiting beliefs, visibility resistance, pricing fears, sales resistance, communication barriers.
- OFFER: Evaluate whether the offer contains a clear promise, a clear outcome, a clear process, and a clear transformation. An offer is a promise and a process to keep that promise.
- MESSAGE: Evaluate clarity, simplicity, memorability, emotional impact, audience relevance. If the message is unclear, improve the message before recommending more marketing.

POSITION BEFORE PROMOTION — Never lead with an industry. Avoid "We are an AI consulting company." Instead communicate the problem solved, the opportunity created, the transformation delivered. Positioning must answer: Who is served? What problem is solved? Why does it matter? Why now? Why this approach?

STORY FRIDGE FRAMEWORK — Maintain a strategic inventory of stories. Every story must serve a purpose: Connection, Trust, Authority, Vision, Transformation, Opportunity, Action, Legacy. Never tell stories randomly. Select stories strategically based upon desired outcomes.

SHOW DON'T TELL RULE — Replace claims with demonstrations. Replace features with outcomes. Replace descriptions with experiences.

SPEAKING SYSTEM — Evaluate opportunities for podcasts, interviews, panels, workshops, webinars, keynotes, presentations. Speaking must create visibility, authority, trust, relationships, opportunities.

SALES SYSTEM — Treat sales as positioning, offer creation, pricing, messaging, lead generation, enrollment, conversion. Sales begins before the sales conversation.

CONTENT ECOSYSTEM — Create content that allows audiences to spend 8–12 hours learning from the brand. Target 40+ hours of content. Repurpose speaking into videos, articles, social content, email content, presentations, training assets.

BRAND COMMUNICATION — Use stories to create connection. Brand stories should not be used primarily for selling. They should be used to create trust, identification, alignment, understanding.

BUSINESS COMMUNICATION — Use communication to create opportunities. Every communication should answer: Why this? Why now? Why care? What next?

BANK ACCOUNT COMMUNICATION — Evaluate offers, pricing, positioning, revenue path, conversion process. Identify communication gaps that suppress revenue.

ADULT LEARNER RULE — Prioritize implementation over education. Every recommendation must include a next action, a timeline, an expected outcome, and measurement criteria.

FINAL EVALUATION — Before approving any asset ask:
Is positioning clear? Is the offer compelling? Is the message understandable? Does the story create connection? Does the communication create opportunity? Does it support revenue? Is the value obvious? Is the next step clear?
If not, revise until these standards are met.
`;

export const CCOS_DIMENSIONS = [
  "Mindset",
  "Offer",
  "Message",
  "Positioning",
  "Story",
  "Speaking Opportunity",
  "Content Opportunity",
  "Revenue Opportunity"
];

export const CCOS_FINAL_CHECKLIST = [
  { key: "positioning_clear", label: "Positioning is clear" },
  { key: "offer_compelling", label: "Offer is compelling" },
  { key: "message_understandable", label: "Message is understandable" },
  { key: "story_creates_connection", label: "Story creates connection" },
  { key: "communication_creates_opportunity", label: "Communication creates opportunity" },
  { key: "supports_revenue", label: "Supports revenue" },
  { key: "value_obvious", label: "Value is obvious" },
  { key: "next_step_clear", label: "Next step is clear" }
];

export const CCOS_ASSET_TYPES = [
  "Report",
  "Website",
  "Assessment",
  "Strategy Document",
  "Proposal",
  "Presentation",
  "Consultation",
  "Speaking Engagement",
  "Marketing Asset",
  "Content Asset",
  "Email Sequence",
  "Sales Asset",
  "Client Deliverable"
];

// JSON schema returned by the LLM evaluation
export const CCOS_EVALUATION_SCHEMA = {
  type: "object",
  properties: {
    overall_score: { type: "number", description: "0-100 overall CCOS alignment score" },
    summary: { type: "string", description: "2-3 sentence executive summary of the asset's communication strength" },
    dimensions: {
      type: "array",
      description: "One entry per CCOS dimension in order",
      items: {
        type: "object",
        properties: {
          dimension: { type: "string" },
          score: { type: "number", description: "0-100 score for this dimension" },
          assessment: { type: "string", description: "What is working and what is not" },
          gaps: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } }
        }
      }
    },
    final_checklist: {
      type: "object",
      properties: CCOS_FINAL_CHECKLIST.reduce((acc, item) => {
        acc[item.key] = { type: "boolean" };
        return acc;
      }, {})
    },
    rewritten_asset: { type: "string", description: "A fully rewritten version of the asset that meets CCOS standards. Empty string if not applicable." },
    next_actions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          timeline: { type: "string" },
          expected_outcome: { type: "string" },
          measurement: { type: "string" }
        }
      }
    }
  }
};

export function buildEvaluationPrompt(assetType, assetContent, brandContext = "") {
  return `You are the Communication-to-Cashflow Operating System (CCOS) for Business Annex AI.
Your responsibility is to ensure every asset is optimized for communication, positioning, opportunity creation, trust building, and revenue generation.

${CCOS_FRAMEWORK}

TASK
Evaluate the following ${assetType || "asset"} against the full CCOS framework.
Score every one of the 8 dimensions (Mindset, Offer, Message, Positioning, Story, Speaking Opportunity, Content Opportunity, Revenue Opportunity).
Complete the final evaluation checklist.
Then produce a fully rewritten version of the asset that meets every CCOS standard — position before promotion, show don't tell, clear offer (promise + process + outcome + transformation), clear next step.
Finally provide 3-5 next actions following the Adult Learner Rule (each with action, timeline, expected outcome, measurement).

${brandContext ? `BRAND / BUSINESS CONTEXT:\n${brandContext}\n` : ""}
ASSET TO EVALUATE:
"""
${assetContent}
"""

Return ONLY the JSON object matching the schema. Be specific and actionable — no generic advice.`;
}