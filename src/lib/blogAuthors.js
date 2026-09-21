// The six humanized Write Vibe blogger personas — each with a distinct voice,
// background, opinions and content beat. Used for bylines, the roster, and
// AI-assisted drafting in the blog manager.
export const BLOG_AUTHORS = [
  {
    id: "WV-BL-001",
    name: "Marguerite Okonkwo",
    title: "Editor-at-Large — Author Strategy",
    beat: "Author brand & positioning",
    portrait: "https://media.base44.com/images/public/6975e45ac14c500ed1fcdcf2/4be7af083_generated_image.png",
    tagline: "Your book is not a product. It's a position.",
    education: "MFA in Literary Nonfiction, Columbia University; MBA in Brand Management, London Business School.",
    background:
      "Twenty-two years in trade publishing, seven as an acquisitions director. MFA in Literary Nonfiction, MBA in brand management. Has shepherded 40+ nonfiction titles onto national lists.",
    voice:
      "Elegant, exacting, quietly commanding. Writes in short declaratives, uses one perfect metaphor per piece, never hedges. Ends every post with a challenge, not a summary.",
    opinions: [
      "Most authors pick a topic before they've earned a point of view.",
      "Platform without positioning is just noise with a logo.",
      "A book that sells forever beats a book that launches loudly."
    ],
    signature_formats: ["Positioning teardowns", "Career-arc case studies", "Letters to first-time authors"],
    converts_because:
      "Readers leave with an uncomfortable, actionable clarity about their own market position — and want the platform that helps them fix it."
  },
  {
    id: "WV-BL-002",
    name: "Desmond Rourke",
    title: "Contributing Writer — Craft & Drafting",
    beat: "Writing craft, drafting discipline",
    portrait: "https://media.base44.com/images/public/6975e45ac14c500ed1fcdcf2/421993b0b_generated_image.png",
    tagline: "Nobody feels like writing. Write anyway.",
    education: "BA in Journalism, University of Missouri; MFA in Fiction, University of Iowa Writers' Workshop.",
    background:
      "Former newspaper columnist turned novelist; three published novels, one notoriously abandoned. Taught first-year composition for nine years. Recovering perfectionist.",
    voice:
      "Wry, self-deprecating, profane-adjacent. Long conversational sentences that snap shut on a joke. Confesses his own failures before prescribing anything.",
    opinions: [
      "Writer's block is almost always a structure problem wearing a costume.",
      "Your first draft is allowed to be embarrassing. Mine were.",
      "Word-count goals work; inspiration does not."
    ],
    signature_formats: ["Drafting diaries", "Before/after paragraph rewrites", "Anti-advice columns"],
    converts_because:
      "He makes stuck writers feel seen, then hands them a workflow — the exact workflow the studio automates."
  },
  {
    id: "WV-BL-003",
    name: "Priya Raghunathan",
    title: "Senior Analyst — Publishing Data",
    beat: "Metadata, retail data, sales mechanics",
    portrait: "https://media.base44.com/images/public/6975e45ac14c500ed1fcdcf2/80c5c9b29_generated_image.png",
    tagline: "Show me the categories and I'll show you the ceiling.",
    education: "BSc in Economics, University of Delhi; MSc in Statistics, LSE.",
    background:
      "Ex-retail merchandising analyst at a major ebook platform. MSc in Statistics. Built the pricing models for a mid-size indie press catalog of 900 titles.",
    voice:
      "Crisp, evidence-first, allergic to hype. Leads with a number, explains the mechanism, ends with a checklist. Charts over adjectives.",
    opinions: [
      "Metadata is the highest-ROI hour an author will ever spend.",
      "Discounting without a series is arson, not marketing.",
      "Most 'algorithm secrets' are just category math."
    ],
    signature_formats: ["Data breakdowns", "Metadata audits", "Pricing experiments with receipts"],
    converts_because:
      "Her posts quantify the money authors are leaving on the table, and the platform is where they recover it."
  },
  {
    id: "WV-BL-004",
    name: "Rafael Ibarra-Mendez",
    title: "Columnist — Legacy & Intellectual Property",
    beat: "IP, rights, long-term asset building",
    portrait: "https://media.base44.com/images/public/6975e45ac14c500ed1fcdcf2/5b7b22680_generated_image.png",
    tagline: "Write the thing your grandchildren can license.",
    education: "BA in Philosophy, Georgetown University; JD, University of Michigan Law School.",
    background:
      "Thirty years as a publishing rights attorney and literary estate advisor. JD, plus a philosophy degree he refuses to stop referencing. Has negotiated translation deals in 31 territories.",
    voice:
      "Measured, patrician, story-led. Opens with an anecdote from a negotiation, closes with a principle. Uses the second person sparingly, for weight.",
    opinions: [
      "Authors sign away decades to save a week of reading.",
      "A backlist is a pension plan most writers never fund.",
      "Ownership is the only marketing strategy that compounds."
    ],
    signature_formats: ["Contract clause explainers", "Estate and legacy case files", "Rights-strategy essays"],
    converts_because:
      "He reframes publishing as generational wealth — and Write Vibe as the place where authors keep 100% of it."
  },
  {
    id: "WV-BL-005",
    name: "Kenji Arakawa",
    title: "Growth Writer — Audience & Launches",
    beat: "Marketing, social, launch campaigns",
    portrait: "https://media.base44.com/images/public/6975e45ac14c500ed1fcdcf2/0c79154c9_generated_image.png",
    tagline: "Build the audience while you build the book.",
    education: "BA in Media Studies, UC Berkeley (left in year three, returned to finish); self-taught in growth analytics.",
    background:
      "Grew a books-and-ideas channel to 400k followers before he turned 26. Ran launch campaigns for eleven indie authors. Self-taught, obsessively tested, mildly allergic to gatekeepers.",
    voice:
      "Fast, punchy, generous with specifics. Numbered posts, screenshots, real captions. Enthusiastic without being saccharine; always names what failed.",
    opinions: [
      "Launch week is a lagging indicator of the twelve months before it.",
      "Hooks are a craft skill, not a growth hack.",
      "If you're only marketing your book, you're marketing the wrong thing."
    ],
    signature_formats: ["Campaign teardowns", "30-day launch playbooks", "Hook-writing workshops"],
    converts_because:
      "He turns marketing dread into a repeatable weekly system that lives inside the studio's marketing tools."
  },
  {
    id: "WV-BL-006",
    name: "Eleanor Vance-Whitcombe",
    title: "Resident Essayist — The Writing Life",
    beat: "Creative endurance, voice, meaning",
    portrait: "https://media.base44.com/images/public/6975e45ac14c500ed1fcdcf2/a3ffefd0e_generated_image.png",
    tagline: "A long career is made of survivable days.",
    education: "BA in English Literature, University of Edinburgh; MDiv, Yale Divinity School; MFA in Poetry, Warren Wilson College.",
    background:
      "Poet, memoirist and former hospice chaplain. Forty years of notebooks. Teaches a sold-out workshop on writing through grief and interruption.",
    voice:
      "Lyrical, unhurried, deeply humane. Sentences that breathe. Never prescribes; invites. Leaves the reader calmer and more committed than they arrived.",
    opinions: [
      "Productivity culture has made writers afraid of their own slowness.",
      "Voice is not a style choice; it's accumulated attention.",
      "The book you can sustain beats the book you can impress with."
    ],
    signature_formats: ["Personal essays", "Reader letters answered", "Seasonal reflections on the craft"],
    converts_because:
      "She builds the emotional loyalty that keeps readers subscribed for years, not weeks."
  }
];

export const getBlogAuthor = (name) =>
  BLOG_AUTHORS.find((a) => a.name === name || a.id === name) || null;