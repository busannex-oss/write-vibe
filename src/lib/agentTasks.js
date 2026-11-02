export const HIGH_RISK_ACTIONS = ["publish", "email", "spend"];

export const AREAS = [
  { value: "writing", label: "Book writing", agent: "outline_generator", reviewer: "Marcus Chen" },
  { value: "editing", label: "Editing & formatting", agent: "text_formatter", reviewer: "Marcus Chen" },
  { value: "design", label: "Cover & design", agent: "cover_designer", reviewer: "Marcus Chen" },
  { value: "marketing", label: "Marketing", agent: "marketing_assistant", reviewer: "Victoria Lopez" },
  { value: "media", label: "Video & audio", agent: "video_producer", reviewer: "Luis Garcia" },
  { value: "distribution", label: "Distribution", agent: "bookstore_advisor", reviewer: "Victoria Lopez" },
  { value: "crm", label: "Readers & CRM", agent: "seasonal_newsletter_strategist", reviewer: "Sophia Martinez" },
  { value: "general", label: "General", agent: "project_manager", reviewer: "Valerie Simmons" }
];

export const ACTIONS = [
  { value: "draft", label: "Draft content" },
  { value: "analyze", label: "Analyze" },
  { value: "plan", label: "Plan" },
  { value: "publish", label: "Publish (needs approval)" },
  { value: "email", label: "Email readers (needs approval)" },
  { value: "spend", label: "Spend money (needs approval)" }
];

export const STATUS_STYLES = {
  queued: "bg-slate-500/20 text-slate-300",
  running: "bg-blue-500/20 text-blue-300",
  awaiting_approval: "bg-amber-500/20 text-amber-300",
  approved: "bg-emerald-500/20 text-emerald-300",
  paused: "bg-purple-500/20 text-purple-300",
  completed: "bg-emerald-500/20 text-emerald-300",
  skipped: "bg-slate-500/20 text-slate-400",
  stopped: "bg-red-500/20 text-red-300",
  failed: "bg-red-500/20 text-red-300"
};

export const logEvent = (task, event, by) => [
  ...(task.history || []),
  { at: new Date().toISOString(), event, by }
];