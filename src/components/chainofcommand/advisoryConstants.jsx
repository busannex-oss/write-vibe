// Shared constants for Advisory Board components — single source of truth

export const PRIORITY_STYLES = {
  high:   { bg: "#7f1d1d25", border: "#ef4444", text: "#fca5a5", badge: "bg-red-500/20 text-red-400 border-red-500/30",   label: "HIGH" },
  medium: { bg: "#78350f25", border: "#f59e0b", text: "#fcd34d", badge: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "MED" },
  low:    { bg: "#1e3a5f25", border: "#3b82f6", text: "#93c5fd", badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",   label: "LOW" },
};

export const ADVISORS = [
  { id: "advisory_oprah",                name: "Oprah Winfrey",        expertise_tags: ["Storytelling", "Audience Building", "Emotional Resonance", "Authenticity"] },
  { id: "advisory_tyler_perry",          name: "Tyler Perry",          expertise_tags: ["Narrative Arc", "Character Voice", "Cultural Relevance", "World-Building"] },
  { id: "advisory_thurgood",             name: "Thurgood Marshall",    expertise_tags: ["Intellectual Property", "Literary Rights", "Publishing Law", "Content Ethics"] },
  { id: "advisory_maya_angelou",         name: "Maya Angelou",         expertise_tags: ["Authentic Voice", "Memoir", "Emotional Truth", "Prose Poetry", "Courage in Writing"] },
  { id: "advisory_slade_kevin_morrison", name: "Slade Kevin Morrison", expertise_tags: ["Platform Vision", "Founder Strategy", "Culture Building", "Mission Alignment", "Author Empowerment"] },
  { id: "advisory_marcus_rosier",     name: "Marcus Y. Rosier",    expertise_tags: ["Leadership", "Strategic Vision", "Founder Mentorship", "Business Scaling", "Executive Coaching"] },
  { id: "advisory_gary_vee",          name: "Gary Vaynerchuk",     expertise_tags: ["Digital Marketing", "Personal Branding", "Social Media", "Content Strategy", "Audience Building", "E-commerce"] },
  { id: "advisory_spectacular_smith", name: "Spectacular Smith",   expertise_tags: ["Social Media Marketing", "Brand Building", "Viral Strategy", "Hip-Hop Entrepreneurship", "Digital Audience Growth"] },
  { id: "advisory_bozoma_saint_john", name: "Bozoma Saint John",   expertise_tags: ["Brand Marketing", "Cultural Strategy", "C-Suite Leadership", "Diversity & Inclusion", "Consumer Insights", "Entertainment Marketing"] },
];

export const ADVISOR_MAP = Object.fromEntries(ADVISORS.map(a => [a.name, a]));