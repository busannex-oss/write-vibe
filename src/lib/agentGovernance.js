// Every agent belongs to exactly one team and sits at one governance level.
// Governance levels define decision authority and how much human oversight applies.

export const GOVERNANCE_LEVELS = {
  L1: { code: "L1", label: "Executive Authority", description: "Sets direction and approves cross-team decisions. Reports to the founder." },
  L2: { code: "L2", label: "Team Oversight", description: "Leads a team, approves its work, escalates material decisions upward." },
  L3: { code: "L3", label: "Supervised Autonomy", description: "Acts independently within its remit; significant output is reviewed by its team lead." },
  L4: { code: "L4", label: "Task Execution", description: "Executes assigned tasks only; all output is reviewed before it ships." },
  ADV: { code: "ADV", label: "Advisory (Non-Executive)", description: "Advises and reviews. Holds no execution authority." }
};

export const TEAMS = {
  executive: { id: "executive", name: "Executive Team", lead: "Valerie Simmons" },
  marketing: { id: "marketing", name: "Marketing Team", lead: "Victoria Lopez" },
  engineering: { id: "engineering", name: "Engineering Team", lead: "Dr. Raymond Okafor" },
  creative: { id: "creative", name: "Creative Team", lead: "Marcus Chen" },
  media: { id: "media", name: "Media Team", lead: "Luis Garcia" },
  client_experience: { id: "client_experience", name: "Client Experience Team", lead: "Sophia Martinez" },
  operations: { id: "operations", name: "Operations Team", lead: "Elena Vasquez" },
  governance: { id: "governance", name: "Governance & Compliance Team", lead: "David Ashworth" },
  finance: { id: "finance", name: "Finance Team", lead: "Patricia Whitfield" },
  advisory: { id: "advisory", name: "Advisory Board", lead: "Slade Kevin Morrison" }
};

// team + governance level for every agent key in the roster
export const AGENT_ASSIGNMENTS = {
  // Executive
  c_suite_coo: ["executive", "L1"],
  c_suite_cto: ["engineering", "L1"],
  c_suite_cfo: ["finance", "L1"],
  c_suite_cdo: ["creative", "L1"],
  c_suite_cao: ["executive", "L1"],
  c_suite_cio: ["engineering", "L1"],
  c_suite_cco: ["marketing", "L1"],
  brand_guardian: ["marketing", "L2"],
  automation_orchestrator: ["operations", "L2"],
  project_manager: ["operations", "L2"],

  // Creative
  character_creator: ["creative", "L3"],
  outline_generator: ["creative", "L3"],
  cover_designer: ["creative", "L3"],
  summary_writer: ["creative", "L4"],
  text_formatter: ["creative", "L4"],

  // Marketing
  title_suggester: ["marketing", "L4"],
  marketing_assistant: ["marketing", "L4"],
  bookstore_advisor: ["marketing", "L3"],
  lead_magnet_designer: ["marketing", "L3"],
  seasonal_newsletter_strategist: ["marketing", "L3"],
  website_builder: ["engineering", "L3"],
  brand_strategist: ["marketing", "L2"],

  // Client experience
  master_customer_service: ["client_experience", "L2"],
  sherry_givens: ["client_experience", "L3"],

  // Media
  video_producer: ["media", "L3"],
  audiobook_producer: ["media", "L3"],
  media_production: ["media", "L2"],

  // Governance & compliance
  ethical_ai_officer: ["governance", "L2"],
  diagnostics_agent: ["engineering", "L3"],
  membership_manager: ["client_experience", "L3"],
  structure_sentinel: ["governance", "L3"],

  // Operations
  personal_executive_assistant: ["executive", "L1"],
  workflow_architect: ["operations", "L2"],
  process_optimization: ["operations", "L3"],
  automation_architect: ["operations", "L3"],
  innovation_agent: ["operations", "L3"],
  retention_agent: ["client_experience", "L3"],
  human_in_the_loop: ["governance", "L2"]
};

/** Resolve team + governance for an agent key. Advisory board members default to ADV. */
export function resolveGovernance(key, department) {
  const [teamId, levelCode] = AGENT_ASSIGNMENTS[key] || (department === "Advisory Board" ? ["advisory", "ADV"] : ["operations", "L4"]);
  const team = TEAMS[teamId];
  const level = GOVERNANCE_LEVELS[levelCode];
  return {
    team_id: team.id,
    team: team.name,
    team_lead: team.lead,
    governance_level: level.code,
    governance_label: level.label,
    governance_description: level.description
  };
}