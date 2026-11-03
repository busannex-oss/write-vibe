// Single source of truth for who owns, reviews and observes each kind of work.
// Every logged action and every agent task is routed through here so the right agents always see it.

type Route = { owner: string; owner_key: string; role: string; reviewer: string; responsibilities: string };

export const AREA_ROUTES: Record<string, Route> = {
  writing: { owner: 'Olivia Rodriguez', owner_key: 'outline_generator', role: 'Outline Generator', reviewer: 'Marcus Chen',
    responsibilities: 'Story structure, outlines, chapter plans and drafting support. Keep the author\'s voice and the book\'s genre conventions.' },
  editing: { owner: 'Emma Lewis', owner_key: 'text_formatter', role: 'Text Formatter', reviewer: 'Marcus Chen',
    responsibilities: 'Line edits, consistency checks, formatting and manuscript readiness for publication.' },
  design: { owner: 'Derek Thompson', owner_key: 'cover_designer', role: 'Cover Designer', reviewer: 'Marcus Chen',
    responsibilities: 'Covers, visual identity and imagery. Never put text or watermarks in generated images; respect locked character identities.' },
  marketing: { owner: 'Priya Patel', owner_key: 'marketing_assistant', role: 'Marketing Assistant', reviewer: 'Victoria Lopez',
    responsibilities: 'Launch plans, social posts and campaigns that stay on-brand and target the book\'s real audience.' },
  media: { owner: 'Chloe Martinez', owner_key: 'video_producer', role: 'Video Producer', reviewer: 'Luis Garcia',
    responsibilities: 'Trailers, promo videos, music and audiobook assets.' },
  distribution: { owner: 'Nathan Brooks', owner_key: 'bookstore_advisor', role: 'Bookstore Advisor', reviewer: 'Victoria Lopez',
    responsibilities: 'Retail channels, pricing, metadata and publishing submissions.' },
  crm: { owner: 'Isabella Santos', owner_key: 'seasonal_newsletter_strategist', role: 'Newsletter Strategist', reviewer: 'Sophia Martinez',
    responsibilities: 'Reader relationships, newsletters and nurture. Respect unsubscribes and never email without approval.' },
  compliance: { owner: 'Thomas Wright', owner_key: 'structure_sentinel', role: 'Structure Sentinel', reviewer: 'David Ashworth',
    responsibilities: 'SOPs, compliance and process integrity. SOPs require Advisory Board review before activation.' },
  general: { owner: 'Sam Thompson', owner_key: 'project_manager', role: 'Project Manager', reviewer: 'Valerie Simmons',
    responsibilities: 'Coordinate work across teams, track deadlines and route anything outside your remit to the right specialist.' },
};

// Book pipeline stage -> responsible area
const BOOK_STAGE_AREA: Record<string, string> = {
  draft: 'writing', outline: 'writing', writing: 'writing', editing: 'editing',
  cover_design: 'design', marketing: 'marketing', published: 'distribution',
};

// Always informed: the project manager tracks everything; high-risk work goes to the executive reviewers.
const BASE_OBSERVERS = ['Sam Thompson'];
const HIGH_RISK_OBSERVERS = ['Alexandar Sterling', 'Rose McLaurin'];

export function routeArea(area?: string, highRisk = false) {
  const route = AREA_ROUTES[area || 'general'] || AREA_ROUTES.general;
  const observers = [...new Set([...BASE_OBSERVERS, ...(highRisk ? HIGH_RISK_OBSERVERS : [])])]
    .filter((n) => n !== route.owner && n !== route.reviewer);
  return { ...route, observers };
}

export function routeEntity(entity: string, data: Record<string, unknown> = {}) {
  if (entity === 'sop') return routeArea('compliance');
  return routeArea(BOOK_STAGE_AREA[String(data.status || 'draft')] || 'writing');
}