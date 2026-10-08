export const ONBOARDING_AGENTS = [
  { key: "master_customer_service", helps: "Your go-to for any question. Chat with her anytime from the bubble in the corner." },
  { key: "outline_generator", helps: "Turns your idea into a chapter-by-chapter outline." },
  { key: "character_creator", helps: "Builds rich characters with backstories, traits and portraits." },
  { key: "cover_designer", helps: "Designs front and back covers that fit your genre." },
  { key: "marketing_assistant", helps: "Creates your launch plan, social posts and campaigns." },
  { key: "website_builder", helps: "Builds a book website with links to buy your book." },
];

export const ONBOARDING_RESOURCES = [
  { title: "My Books", desc: "Create and manage every book project.", page: "Books" },
  { title: "Template Library", desc: "Start from proven book and chapter templates.", page: "Templates" },
  { title: "Publication Checklist", desc: "Make sure nothing is missed before launch.", page: "PublicationChecklist" },
  { title: "Publishing Calendar", desc: "Plan your milestones and release dates.", page: "PublishingCalendar" },
];

export const isPayingMember = (user) =>
  !!user?.subscription_tier && !["trial", "free"].includes(user.subscription_tier);

export const needsOnboarding = (user) => isPayingMember(user) && !user?.member_onboarding_completed;