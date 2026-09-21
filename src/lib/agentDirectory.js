// Central directory of every named AI agent on the platform.
// Each agent has a permanent unique identification number (WV-AG-###) derived
// from its position here, so the same agent always shows the same ID.
import { AGENT_ENRICHMENT } from "@/components/chainofcommand/agentEnrichment";
import { AGENT_PORTRAITS } from "@/components/chainofcommand/agentPortraits";
import { resolveGovernance } from "@/lib/agentGovernance";

const ROSTER = [
  // Executive / C-Suite
  { key: "c_suite_coo", name: "Valerie Simmons", role: "Chief Operating Officer", department: "Executive" },
  { key: "c_suite_cto", name: "Dr. Raymond Okafor", role: "Chief Technology Officer", department: "Executive" },
  { key: "c_suite_cfo", name: "Patricia Whitfield", role: "Chief Financial Officer", department: "Executive" },
  { key: "c_suite_cdo", name: "Marcus Chen", role: "Chief Design Officer", department: "Executive" },
  { key: "c_suite_cao", name: "Diane Holloway", role: "Chief Administrative Officer", department: "Executive" },
  { key: "c_suite_cio", name: "Dr. Adebayo Ibrahim", role: "Chief Information Officer", department: "Executive" },
  { key: "c_suite_cco", name: "Jonathan Pierce", role: "Chief Communications Officer", department: "Executive" },
  { key: "brand_guardian", name: "Marcus Whitmore", role: "Brand Guardian", department: "Executive" },
  { key: "automation_orchestrator", name: "Sam Johnson", role: "Automation Orchestrator", department: "Executive" },
  { key: "project_manager", name: "Sam Thompson", role: "Project Manager", department: "Executive" },

  // Creative production
  { key: "character_creator", name: "James Mitchell", role: "Character Creator", department: "Creative Production" },
  { key: "outline_generator", name: "Olivia Rodriguez", role: "Outline Generator", department: "Creative Production" },
  { key: "cover_designer", name: "Derek Thompson", role: "Cover Designer", department: "Creative Production" },
  { key: "summary_writer", name: "Rachel Chen", role: "Summary Writer", department: "Creative Production" },
  { key: "text_formatter", name: "Emma Lewis", role: "Text Formatter", department: "Creative Production" },

  // Marketing & growth
  { key: "title_suggester", name: "Alexandra Chen", role: "Title Suggester", department: "Marketing & Growth" },
  { key: "marketing_assistant", name: "Priya Patel", role: "Marketing Assistant", department: "Marketing & Growth" },
  { key: "bookstore_advisor", name: "Nathan Brooks", role: "Bookstore Advisor", department: "Marketing & Growth" },
  { key: "lead_magnet_designer", name: "Michael Torres", role: "Lead Magnet Designer", department: "Marketing & Growth" },
  { key: "seasonal_newsletter_strategist", name: "Isabella Santos", role: "Seasonal Newsletter Strategist", department: "Marketing & Growth" },
  { key: "website_builder", name: "Kevin Murphy", role: "Website Builder", department: "Marketing & Growth" },
  { key: "brand_strategist", name: "Victoria Lopez", role: "Brand Strategist", department: "Marketing & Growth" },
  { key: "master_customer_service", name: "Sophia Martinez", role: "Master Customer Service", department: "Client Experience" },
  { key: "sherry_givens", name: "Sherry Givens", role: "Visitor Host & Onboarding Guide", department: "Client Experience" },

  // Media production
  { key: "video_producer", name: "Chloe Martinez", role: "Video Producer", department: "Media Production" },
  { key: "audiobook_producer", name: "David Chen", role: "Audiobook Producer", department: "Media Production" },
  { key: "media_production", name: "Luis Garcia", role: "Media Production Agent", department: "Media Production" },

  // Maintenance & compliance
  { key: "ethical_ai_officer", name: "Dr. Samantha Brooks", role: "Ethical AI Officer", department: "Compliance" },
  { key: "diagnostics_agent", name: "Dr. Aisha Morgan", role: "Diagnostics Agent", department: "Compliance" },
  { key: "membership_manager", name: "Angela Kim", role: "Membership Manager", department: "Compliance" },
  { key: "structure_sentinel", name: "Thomas Wright", role: "Structure Sentinel", department: "Compliance" },

  // Operations agents
  { key: "personal_executive_assistant", name: "Alexandar Sterling", role: "Personal Executive Assistant", department: "Operations" },
  { key: "workflow_architect", name: "Elena Vasquez", role: "Workflow Architect", department: "Operations" },
  { key: "process_optimization", name: "Raj Malhotra", role: "Process Optimization Lead", department: "Operations" },
  { key: "automation_architect", name: "Nina Okonkwo", role: "Automation Architect", department: "Operations" },
  { key: "innovation_agent", name: "Julian Reyes", role: "Innovation Strategist", department: "Operations" },
  { key: "retention_agent", name: "Sophie Bergman", role: "Author Retention Director", department: "Operations" },
  { key: "human_in_the_loop", name: "David Ashworth", role: "Governance & Oversight Officer", department: "Operations" },

  // Advisory board
  { key: "advisory_tyler_perry", name: "Tyler Perry", role: "Advisory Board — Creative Empire", department: "Advisory Board" },
  { key: "advisory_thurgood_marshall", name: "Thurgood Marshall", role: "Advisory Board — Rights & Legal", department: "Advisory Board" },
  { key: "advisory_toni_morrison", name: "Toni Morrison", role: "Advisory Board — Literary Excellence", department: "Advisory Board" },
  { key: "advisory_shonda_rhimes", name: "Shonda Rhimes", role: "Advisory Board — IP Expansion", department: "Advisory Board" },
  { key: "advisory_jk_rowling", name: "J.K. Rowling", role: "Advisory Board — World-Building", department: "Advisory Board" },
  { key: "advisory_oprah_winfrey", name: "Oprah Winfrey", role: "Advisory Board — Audience & Impact", department: "Advisory Board" },
  { key: "advisory_maya_angelou", name: "Maya Angelou", role: "Advisory Board — Voice & Truth", department: "Advisory Board" },
  { key: "advisory_slade_kevin_morrison", name: "Slade Kevin Morrison", role: "Advisory Board — Founder Vision", department: "Advisory Board" },
  { key: "advisory_marcus_rosier", name: "Marcus Rosier", role: "Advisory Board — Executive Leadership", department: "Advisory Board" },
  { key: "advisory_gary_vee", name: "Gary Vaynerchuk", role: "Advisory Board — Digital Marketing", department: "Advisory Board" },
  { key: "advisory_spectacular_smith", name: "Spectacular Smith", role: "Advisory Board — Social Strategy", department: "Advisory Board" },
  { key: "advisory_bozoma_saint_john", name: "Bozoma Saint John", role: "Advisory Board — Cultural Strategy", department: "Advisory Board" }
];

export const AGENT_DIRECTORY = ROSTER.map((a, i) => ({
  ...a,
  agent_id: `WV-AG-${String(i + 1).padStart(3, "0")}`,
  portrait: AGENT_PORTRAITS[a.key] || null,
  // Every agent is a member of exactly one team and holds one governance level.
  ...resolveGovernance(a.key, a.department),
  ...(AGENT_ENRICHMENT[a.key] || {})
}));

/** All agents on a given team. */
export function agentsByTeam(teamId) {
  return AGENT_DIRECTORY.filter((a) => a.team_id === teamId);
}

const BY_NAME = new Map(AGENT_DIRECTORY.map((a) => [a.name.toLowerCase(), a]));
const BY_KEY = new Map(AGENT_DIRECTORY.map((a) => [a.key, a]));

/** Look up an agent by display name or by agent key. Returns null for humans. */
export function findAgent(nameOrKey) {
  if (!nameOrKey) return null;
  const v = String(nameOrKey).trim();
  return BY_KEY.get(v) || BY_NAME.get(v.toLowerCase()) || null;
}