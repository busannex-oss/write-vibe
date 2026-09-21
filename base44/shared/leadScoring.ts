// Deterministic, activity-based lead scoring for CRM contacts.
// Score is 0-100; factors explain exactly how it was reached.

const daysSince = (iso) => {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86400000);
};

export function scoreContact(contact) {
  const factors = [];
  const add = (label, points) => { if (points) factors.push({ label, points }); };

  // Membership & purchase
  if (contact.is_member) add("Registered member", 25);
  if (contact.subscription_tier && contact.subscription_tier !== "trial") add("Paid subscription", 15);

  // Newsletter engagement
  if (contact.newsletter_status === "active") add("Active newsletter subscriber", 15);
  if (contact.newsletter_status === "unsubscribed") add("Unsubscribed from newsletter", -15);

  // Touchpoints & book interest
  const touches = Math.max(0, (contact.signup_count || 1) - 1);
  add("Repeat touchpoints", Math.min(10, touches * 3));
  add("Books followed", Math.min(10, (contact.book_ids || []).length * 5));

  // Recency of activity
  const recency = daysSince(contact.last_activity_at);
  if (recency === null) add("No recorded activity", -5);
  else if (recency <= 7) add("Active this week", 25);
  else if (recency <= 30) add("Active this month", 15);
  else if (recency <= 90) add("Active in last 90 days", 5);
  else add(`Quiet for ${recency} days`, -15);

  // Advocacy potential
  if (contact.advocacy_potential === "high") add("High advocacy potential", 10);
  else if (contact.advocacy_potential === "medium") add("Medium advocacy potential", 5);

  // Nurtured repeatedly without converting
  if (!contact.is_member && (contact.nurture_stage || 0) >= 3) add("Nurtured but not converted", -10);

  const raw = factors.reduce((sum, f) => sum + f.points, 0);
  const score = Math.max(0, Math.min(100, raw));

  // Who needs attention, and why
  let attention_level = "healthy";
  let attention_reason = "Engaged and on track.";

  if (contact.lifecycle_stage === "dormant" || (recency !== null && recency > 120)) {
    attention_level = "urgent";
    attention_reason = "Gone quiet — win-back outreach needed.";
  } else if (contact.loyalty_risk === "high" && contact.is_member) {
    attention_level = "urgent";
    attention_reason = "Member at high risk of churning.";
  } else if (!contact.is_member && score >= 60) {
    attention_level = "urgent";
    attention_reason = "Hot lead not yet converted — reach out now.";
  } else if (!contact.is_member && (contact.nurture_stage || 0) >= 3) {
    attention_level = "watch";
    attention_reason = "Repeatedly nurtured without converting — change the offer.";
  } else if (contact.loyalty_risk === "high" || (recency !== null && recency > 45)) {
    attention_level = "watch";
    attention_reason = "Engagement slipping — needs a nudge.";
  } else if (contact.advocacy_potential === "high" && contact.is_member) {
    attention_level = "watch";
    attention_reason = "Strong advocate — invite them to promote.";
  }

  return { lead_score: score, score_factors: factors, attention_level, attention_reason };
}