// Single source of truth for which pages are public, member-only, or admin-only.
// Every new page must be listed here — anything unlisted is treated as member-only.

export const PUBLIC_PAGES = [
  "Landing", "BookWebsite", "Pricing", "About", "Contact", "Privacy", "Terms",
  "Investor", "FAQ", "CookiePolicy", "HowItWorks",
  "Blog", "BlogPost", "BlogAuthor", "BlogTag"
];

export const ADMIN_PAGES = [
  // Operations
  "UserManagement", "InternalMessages", "ErrorDashboard", "TeamSummary",
  "AdvisoryReviewDashboard", "CRM", "BlogManager", "BlogCalendar",
  // AI agents
  "OperationsAgents", "AgentMemoryLog", "AgentAudit", "AgentConnectionMap",
  "Certifications", "CCOSStudio", "CCOSAgent", "ChainOfCommand",
  // Strategy & docs
  "MissionStatement", "MasterRegistry", "AdminDocuments", "MapLegend", "Sitemap",
  "SOPs", "LegalDocuments", "LicensingTerms", "KPIFramework",
  // Platform & brand
  "BrandStyleGuide", "PillarAlignment", "PillarsArchitecture", "SystemArchitecture",
  "HomepageAudit", "OnboardingExperience", "VersionRoadmap", "WhiteLabelAdmin"
];

export const MEMBER_PAGES = [
  "Dashboard", "Books", "BookEditor", "CreateBook", "Documents", "Team", "Settings",
  "ProjectReports", "Templates", "PublishingCalendar", "PlatformHealth",
  "ReaderInsights", "DocumentReview", "PublicationChecklist", "BookHealthCheck",
  "DistributionDashboard"
];

export const isPublicPage = (page) => PUBLIC_PAGES.includes(page);
export const isAdminPage = (page) => ADMIN_PAGES.includes(page);