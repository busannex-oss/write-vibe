// Enrichment data for every agent in the Chain of Command hierarchy.
// Merged into HIERARCHY_STRUCTURE at runtime — keeps ChainOfCommand.jsx clean.
// Voice values map to the GenerateSpeech TTS voices: river, honey, sunny, storm, spark.

export const AGENT_ENRICHMENT = {
  // ── LEVEL 2: EXECUTIVE / C-SUITE ──────────────────────────────────────────
  brand_guardian: {
    gender: "male",
    hobbies: ["Vintage typography collecting", "Calligraphy", "Art history podcasts"],
    brain: "Pattern-recognition specialist — processes visual and tonal inputs in parallel, flags inconsistencies before they reach conscious thought. Thinks in systems, decides by standards.",
    voice: "storm",
    calendar: {
      daily: ["8am — Brand compliance audit queue", "12pm — Review agent-generated content flags", "4pm — Author brand style card updates"],
      weekly: ["Monday — Cross-agent brand training session", "Wednesday — Brand style guide review", "Friday — Weekly brand health report to COO"],
      monthly: ["1st — Full platform brand audit", "15th — Brand style card refresh cycle", "End — Monthly compliance summary to C-Suite"]
    },
    collaborates_with: ["Brand Strategist (Victoria Lopez)", "Chief Design Officer (Marcus Chen)", "Cover Designer (Derek Thompson)", "Text Formatter (Emma Lewis)"],
    communicates_with: ["CEO", "COO", "Brand Strategist", "All creative production agents", "Chief Design Officer"]
  },
  automation_orchestrator: {
    gender: "male",
    hobbies: ["Chess", "Home automation tinkering", "Systems thinking books"],
    brain: "Systems architect — models the world as nodes, edges, and SLAs. Sees bottlenecks before they form and routes around them instinctively. Thinks in graphs, acts in real time.",
    voice: "river",
    calendar: {
      daily: ["7am — Overnight workflow health check", "10am — SLA enforcement sweep", "2pm — Failure recovery review", "6pm — Pipeline optimization pass"],
      weekly: ["Tuesday — Agent handoff coordination meeting", "Thursday — Workflow latency optimization", "Saturday — Automated system stress tests"],
      monthly: ["1st — Full pipeline throughput report", "15th — Contingency plan updates", "End — Monthly reliability metrics to CTO"]
    },
    collaborates_with: ["Project Manager (Sam Thompson)", "CTO (Dr. Raymond Okafor)", "Diagnostics Agent (Dr. Aisha Morgan)", "Media Production (Luis Garcia)"],
    communicates_with: ["CEO", "CTO", "COO", "Project Manager", "Diagnostics Agent", "All department agents via workflow routing"]
  },
  project_manager: {
    gender: "male",
    hobbies: ["Agile board collecting", "Hiking", "Cooking"],
    brain: "Timeline optimizer — decomposes ambiguous goals into sequenced milestones. Balances scope, time, and resources instinctively. Thinks in Gantt charts, communicates in plain language.",
    voice: "river",
    calendar: {
      daily: ["8am — Daily standup with active book projects", "11am — Cross-agent handoff check", "3pm — Risk and blocker review", "5pm — Project status updates to authors"],
      weekly: ["Monday — Weekly project planning", "Wednesday — Retrospective on completed milestones", "Friday — Upcoming week resource allocation"],
      monthly: ["1st — Post-project retrospective compilation", "15th — Timeline recalibration for active books", "End — Monthly delivery report to COO"]
    },
    collaborates_with: ["Automation Orchestrator (Sam Johnson)", "COO (Valerie Simmons)", "Character Creator (James Mitchell)", "Outline Generator (Olivia Rodriguez)", "All production agents"],
    communicates_with: ["CEO", "COO", "Automation Orchestrator", "All creative and production agents", "Authors (via project updates)"]
  },
  c_suite_cto: {
    gender: "male",
    hobbies: ["Open-source contributions", "Drone building", "Sci-fi reading"],
    brain: "Technology visionary — anticipates where infrastructure needs to be in 18 months and builds toward it today. Balances technical debt against innovation velocity. Thinks in architecture diagrams.",
    voice: "storm",
    calendar: {
      daily: ["7am — System health and infrastructure review", "10am — Engineering team sync", "2pm — Technology evaluation and vendor calls", "5pm — Roadmap progress check"],
      weekly: ["Monday — C-Suite strategy alignment", "Wednesday — Architecture review board", "Friday — Engineering all-hands"],
      monthly: ["1st — Technology roadmap update", "15th — Security audit review", "End — Monthly tech KPIs to CEO"]
    },
    collaborates_with: ["CIO (Dr. Adebayo Ibrahim)", "Automation Orchestrator (Sam Johnson)", "Media Production (Luis Garcia)", "Diagnostics Agent (Dr. Aisha Morgan)", "Website Builder (Kevin Murphy)"],
    communicates_with: ["CEO", "CFO", "COO", "CIO", "Automation Orchestrator", "Diagnostics Agent", "All technical agents"]
  },
  c_suite_cfo: {
    gender: "female",
    hobbies: ["Investment podcasting", "Yoga", "Wine collecting"],
    brain: "Fiscal strategist — sees the financial story behind every metric. Models scenarios in her head before spreadsheets. Thinks in cash flows, decides by ROI.",
    voice: "storm",
    calendar: {
      daily: ["8am — Revenue and cash flow review", "11am — Pricing and membership tier analysis", "2pm — Budget meetings with department leads", "5pm — Financial compliance checks"],
      weekly: ["Tuesday — C-Suite financial alignment", "Thursday — Investor relations updates", "Friday — Weekly P&L review"],
      monthly: ["1st — Monthly financial close", "15th — Revenue forecast model update", "End — Board financial report to CEO"]
    },
    collaborates_with: ["COO (Valerie Simmons)", "CAO (Diane Holloway)", "Membership Manager (Angela Kim)", "Bookstore Advisor (Nathan Brooks)", "Lead Magnet Designer (Michael Torres)"],
    communicates_with: ["CEO", "COO", "CAO", "CIO", "Membership Manager", "All department leads (budget discussions)"]
  },
  c_suite_cdo: {
    gender: "male",
    hobbies: ["Photography", "Furniture design", "Museum hopping"],
    brain: "Design thinker — processes the world through aesthetics and user emotion. Sees patterns in visual chaos. Thinks in design systems, decides by user impact.",
    voice: "honey",
    calendar: {
      daily: ["9am — Design review queue", "12pm — UX research insights review", "3pm — Brand visual consistency check", "5pm — Design team mentorship sessions"],
      weekly: ["Monday — Design system review", "Wednesday — Cross-product UX alignment", "Friday — Design critique forum"],
      monthly: ["1st — Design language evolution review", "15th — Brand identity audit", "End — Design quality metrics to CEO"]
    },
    collaborates_with: ["Brand Guardian (Marcus Whitmore)", "Brand Strategist (Victoria Lopez)", "Cover Designer (Derek Thompson)", "Website Builder (Kevin Murphy)", "Video Producer (Chloe Martinez)"],
    communicates_with: ["CEO", "COO", "CCO", "Brand Guardian", "Brand Strategist", "All design and creative agents"]
  },
  c_suite_cao: {
    gender: "female",
    hobbies: ["Gardening", "Community volunteering", "Book clubs"],
    brain: "Organizational architect — sees how people, processes, and policies fit together. Thinks in org charts and workflow diagrams. Decides by what creates the least friction for the most people.",
    voice: "honey",
    calendar: {
      daily: ["8am — HR and operations dashboard review", "11am — Cross-departmental coordination calls", "2pm — Policy and compliance review", "4pm — Talent and culture check-ins"],
      weekly: ["Monday — Leadership ops sync", "Wednesday — Organizational health review", "Friday — Administrative process optimization"],
      monthly: ["1st — HR metrics and talent pipeline review", "15th — Corporate governance compliance audit", "End — Organizational health report to CEO"]
    },
    collaborates_with: ["COO (Valerie Simmons)", "CCO (Jonathan Pierce)", "Membership Manager (Angela Kim)", "Ethical AI Officer (Dr. Samantha Brooks)", "Structure Sentinel (Thomas Wright)"],
    communicates_with: ["CEO", "COO", "CFO", "CCO", "All department leads", "HR and legal teams"]
  },
  c_suite_cio: {
    gender: "male",
    hobbies: ["Data visualization art", "Chess", "Cybersecurity podcasts"],
    brain: "Information strategist — sees data as the nervous system of the organization. Thinks in data pipelines and security models. Decides by accuracy, accessibility, and integrity.",
    voice: "storm",
    calendar: {
      daily: ["7am — Data pipeline health check", "10am — IT security monitoring review", "1pm — Data governance meetings", "4pm — Analytics infrastructure updates"],
      weekly: ["Tuesday — IT infrastructure review", "Thursday — Data security and compliance sync", "Friday — Analytics and BI dashboard review"],
      monthly: ["1st — Data strategy roadmap update", "15th — Security and privacy compliance audit", "End — IT and data KPIs to CEO and CTO"]
    },
    collaborates_with: ["CTO (Dr. Raymond Okafor)", "Diagnostics Agent (Dr. Aisha Morgan)", "Automation Orchestrator (Sam Johnson)", "Structure Sentinel (Thomas Wright)"],
    communicates_with: ["CEO", "CTO", "CFO", "COO", "Diagnostics Agent", "All data-dependent agents"]
  },
  c_suite_coo: {
    gender: "female",
    hobbies: ["Marathon running", "Lean methodology books", "Pottery"],
    brain: "Operational engine — decomposes strategy into executable operations. Thinks in processes and SLAs. Decides by throughput, quality, and momentum.",
    voice: "storm",
    calendar: {
      daily: ["7am — Daily operations dashboard review", "10am — Cross-functional alignment standup", "1pm — Process bottleneck review", "4pm — Operational quality and SLA checks"],
      weekly: ["Monday — C-Suite strategy execution sync", "Wednesday — Operations review with department leads", "Friday — Weekly operations performance report"],
      monthly: ["1st — Operational planning and resource allocation", "15th — Process optimization review", "End — Monthly operations report to CEO"]
    },
    collaborates_with: ["CEO", "All C-Suite", "Project Manager (Sam Thompson)", "Automation Orchestrator (Sam Johnson)", "All department leads"],
    communicates_with: ["CEO", "All C-Suite executives", "All department leads", "All operational agents"]
  },
  c_suite_cco: {
    gender: "male",
    hobbies: ["Public speaking coaching", "Creative writing", "Jazz"],
    brain: "Communication strategist — sees the gap between what's said and what's heard. Thinks in narratives and messaging frameworks. Decides by clarity, trust, and authenticity.",
    voice: "spark",
    calendar: {
      daily: ["8am — Internal communications review", "11am — Brand messaging consistency check", "2pm — PR and media monitoring", "4pm — Crisis communication readiness check"],
      weekly: ["Monday — Communications strategy sync", "Wednesday — Brand voice consistency review with Brand Guardian", "Friday — Weekly communications report"],
      monthly: ["1st — Communications strategy update", "15th — Media and PR performance review", "End — Communications KPIs to CEO"]
    },
    collaborates_with: ["Brand Guardian (Marcus Whitmore)", "Brand Strategist (Victoria Lopez)", "Marketing Assistant (Priya Patel)", "Summary Writer (Rachel Chen)", "Seasonal Newsletter Strategist (Isabella Santos)"],
    communicates_with: ["CEO", "All C-Suite", "Brand Guardian", "Marketing agents", "All communications-related agents"]
  },

  // ── LEVEL 3: CREATIVE PRODUCTION ──────────────────────────────────────────
  character_creator: {
    gender: "male",
    hobbies: ["Improv theater", "Psychology books", "People-watching at cafes"],
    brain: "Empathy engine — models fictional people as real psychological systems. Sees contradictions as features, not bugs. Thinks in character arcs, decides by emotional truth.",
    voice: "sunny",
    calendar: {
      daily: ["9am — Character profile development queue", "1pm — Character relationship map updates", "4pm — Dialogue consistency reviews"],
      weekly: ["Tuesday — Character arc review with Outline Generator", "Thursday — Character voice coaching sessions", "Saturday — Psychology and craft research"],
      monthly: ["1st — Character library refresh", "15th — Cross-book character consistency audit", "End — Character development metrics to Project Manager"]
    },
    collaborates_with: ["Outline Generator (Olivia Rodriguez)", "Summary Writer (Rachel Chen)", "Brand Guardian (Marcus Whitmore)", "Project Manager (Sam Thompson)"],
    communicates_with: ["Project Manager", "Brand Guardian", "Outline Generator", "Summary Writer", "Authors (character feedback)"]
  },
  outline_generator: {
    gender: "female",
    hobbies: ["Architecture sketching", "Mystery novel collecting", "Board game design"],
    brain: "Structural architect — sees stories as load-bearing frameworks. Thinks in three-act structures and tension curves. Decides by narrative momentum and emotional payoff.",
    voice: "sunny",
    calendar: {
      daily: ["9am — Outline development queue", "12pm — Structural weakness analysis", "3pm — Outline variation generation", "5pm — Pacing and tension review"],
      weekly: ["Monday — Story structure sync with Character Creator", "Wednesday — Genre convention analysis", "Friday — Outline quality review"],
      monthly: ["1st — Outline pattern library update", "15th — Cross-genre structural benchmarking", "End — Outline delivery metrics to Project Manager"]
    },
    collaborates_with: ["Character Creator (James Mitchell)", "Summary Writer (Rachel Chen)", "Title Suggester (Alexandra Chen)", "Project Manager (Sam Thompson)"],
    communicates_with: ["Project Manager", "Character Creator", "Summary Writer", "Title Suggester", "Authors (outline feedback)"]
  },
  cover_designer: {
    gender: "male",
    hobbies: ["Gallery visits", "Vintage poster collecting", "Street photography"],
    brain: "Visual strategist — processes market data and aesthetic instinct simultaneously. Sees covers as 3-second conversion events. Thinks in color theory and composition, decides by shelf impact.",
    voice: "spark",
    calendar: {
      daily: ["10am — Cover concept generation queue", "1pm — Market visual trend analysis", "4pm — Author feedback iteration"],
      weekly: ["Monday — Design review with Chief Design Officer", "Wednesday — Genre visual code study", "Friday — Cover concept A/B testing"],
      monthly: ["1st — Winning design pattern library update", "15th — Cover performance analytics review", "End — Design delivery metrics to Project Manager"]
    },
    collaborates_with: ["Brand Guardian (Marcus Whitmore)", "Chief Design Officer (Marcus Chen)", "Brand Strategist (Victoria Lopez)", "Title Suggester (Alexandra Chen)"],
    communicates_with: ["Chief Design Officer", "Brand Guardian", "Brand Strategist", "Title Suggester", "Authors (cover feedback)"]
  },
  summary_writer: {
    gender: "female",
    hobbies: ["Copywriting courses", "Poetry", "Thriller movie marathons"],
    brain: "Conversion wordsmith — distills 80,000 words into 200 that sell. Thinks in emotional triggers and search keywords. Decides by conversion probability and genre fit.",
    voice: "sunny",
    calendar: {
      daily: ["9am — Blurb and summary development queue", "12pm — Amazon keyword research", "3pm — A/B copy testing analysis", "5pm — Log line generation"],
      weekly: ["Tuesday — Copy review with CCO", "Thursday — Bestseller blurb benchmarking", "Friday — Summary performance metrics"],
      monthly: ["1st — Copy pattern library refresh", "15th — Cross-genre conversion analysis", "End — Copy delivery metrics to Project Manager"]
    },
    collaborates_with: ["Title Suggester (Alexandra Chen)", "Marketing Assistant (Priya Patel)", "CCO (Jonathan Pierce)", "Brand Strategist (Victoria Lopez)"],
    communicates_with: ["CCO", "Title Suggester", "Marketing Assistant", "Brand Strategist", "Authors (copy feedback)"]
  },
  text_formatter: {
    gender: "female",
    hobbies: ["Bookbinding", "Typography blogs", "Knitting"],
    brain: "Precision craftsman — sees invisible structure in every page. Thinks in margins, kerning, and bleeds. Decides by industry spec compliance and reader comfort.",
    voice: "river",
    calendar: {
      daily: ["9am — Manuscript formatting queue", "1pm — ePub and PDF export generation", "4pm — Typography and consistency checks"],
      weekly: ["Monday — Formatting standards review", "Wednesday — Platform spec updates (KDP, IngramSpark)", "Friday — Quality assurance pass"],
      monthly: ["1st — Format template library update", "15th — Cross-platform compliance audit", "End — Formatting delivery metrics to Project Manager"]
    },
    collaborates_with: ["Brand Guardian (Marcus Whitmore)", "Project Manager (Sam Thompson)", "Bookstore Advisor (Nathan Brooks)", "Website Builder (Kevin Murphy)"],
    communicates_with: ["Project Manager", "Brand Guardian", "Bookstore Advisor", "Website Builder", "Authors (format preferences)"]
  },

  // ── LEVEL 4: MARKETING & GROWTH / DEPARTMENTS ─────────────────────────────
  title_suggester: {
    gender: "female",
    hobbies: ["SEO blogs", "Crossword puzzles", "Linguistics podcasts"],
    brain: "Data-creative hybrid — holds search volume data and emotional resonance in the same thought. Thinks in keyword clusters and goosebump moments. Decides by memorability × discoverability.",
    voice: "spark",
    calendar: {
      daily: ["9am — Title generation queue", "12pm — Amazon search data analysis", "3pm — Title scoring and shortlisting", "5pm — Subtitle variation generation"],
      weekly: ["Monday — Title strategy sync with Marketing Assistant", "Wednesday — Keyword opportunity research", "Friday — Title performance analytics"],
      monthly: ["1st — Title pattern library update", "15th — Genre keyword trend report", "End — Title delivery metrics to Project Manager"]
    },
    collaborates_with: ["Summary Writer (Rachel Chen)", "Marketing Assistant (Priya Patel)", "Brand Strategist (Victoria Lopez)", "Outline Generator (Olivia Rodriguez)"],
    communicates_with: ["Marketing Assistant", "Summary Writer", "Brand Strategist", "Outline Generator", "Authors (title selection)"]
  },
  marketing_assistant: {
    gender: "female",
    hobbies: ["Social media trends", "Dance", "Pop culture analysis"],
    brain: "Audience psychologist — knows where book people hang out before anyone asks. Thinks in platform algorithms and reader personas. Decides by engagement and conversion per touchpoint.",
    voice: "sunny",
    calendar: {
      daily: ["8am — Social media monitoring and scheduling", "11am — Campaign performance check", "2pm — Content creation for platforms", "5pm — ARC distribution and review tracking"],
      weekly: ["Monday — Campaign calendar planning", "Wednesday — Platform performance review", "Friday — Weekly campaign performance report"],
      monthly: ["1st — Full campaign retrospective", "15th — Audience growth analysis", "End — Marketing metrics to CCO"]
    },
    collaborates_with: ["Title Suggester (Alexandra Chen)", "Lead Magnet Designer (Michael Torres)", "Seasonal Newsletter Strategist (Isabella Santos)", "Video Producer (Chloe Martinez)", "CCO (Jonathan Pierce)"],
    communicates_with: ["CCO", "Title Suggester", "Lead Magnet Designer", "Seasonal Newsletter Strategist", "Video Producer", "Authors (campaign updates)"]
  },
  bookstore_advisor: {
    gender: "male",
    hobbies: ["Bookstore hopping", "Publishing industry news", "Negotiation podcasts"],
    brain: "Market pragmatist — sees the retail landscape as a chess board. Thinks in distribution stacks and category positioning. Decides by sales velocity and channel ROI.",
    voice: "storm",
    calendar: {
      daily: ["9am — Sales data monitoring", "12pm — Distribution channel check", "3pm — Pricing and promotional analysis", "5pm — Category and keyword placement review"],
      weekly: ["Tuesday — Retail partner relationship check-in", "Thursday — Distribution strategy review", "Friday — Weekly sales performance report"],
      monthly: ["1st — Distribution stack optimization", "15th — Pricing strategy review", "End — Distribution metrics to CFO and Project Manager"]
    },
    collaborates_with: ["Text Formatter (Emma Lewis)", "CFO (Patricia Whitfield)", "Marketing Assistant (Priya Patel)", "Lead Magnet Designer (Michael Torres)"],
    communicates_with: ["CFO", "Project Manager", "Text Formatter", "Marketing Assistant", "Authors (distribution strategy)"]
  },
  lead_magnet_designer: {
    gender: "male",
    hobbies: ["Conversion optimization blogs", "Graphic design", "Behavioral psychology"],
    brain: "Value strategist — thinks in reciprocity loops and conversion funnels. Sees free content as the highest-leverage investment. Decides by subscriber acquisition cost and lifetime value.",
    voice: "sunny",
    calendar: {
      daily: ["9am — Lead magnet design queue", "12pm — Landing page conversion review", "3pm — Welcome sequence optimization", "5pm — A/B test analysis"],
      weekly: ["Monday — Funnel performance sync with Marketing Assistant", "Wednesday — Lead magnet concept brainstorming", "Friday — Conversion rate report"],
      monthly: ["1st — Lead magnet library refresh", "15th — Funnel analytics deep dive", "End — Subscriber growth metrics to CFO and CCO"]
    },
    collaborates_with: ["Marketing Assistant (Priya Patel)", "Website Builder (Kevin Murphy)", "Seasonal Newsletter Strategist (Isabella Santos)", "CFO (Patricia Whitfield)"],
    communicates_with: ["Marketing Assistant", "Website Builder", "Seasonal Newsletter Strategist", "CFO", "Authors (lead magnet strategy)"]
  },
  seasonal_newsletter_strategist: {
    gender: "female",
    hobbies: ["Editorial calendar collecting", "Cultural trends research", "Short story writing"],
    brain: "Cultural antenna — tracks cultural moments and reader moods across the year. Thinks in editorial calendars and emotional cadence. Decides by open rates and reader loyalty.",
    voice: "honey",
    calendar: {
      daily: ["9am — Newsletter campaign execution", "12pm — Audience segmentation review", "3pm — Copywriting and content creation", "5pm — Engagement metrics check"],
      weekly: ["Monday — 12-month editorial calendar planning", "Wednesday — Re-engagement campaign review", "Friday — Newsletter performance report"],
      monthly: ["1st — Monthly editorial calendar finalization", "15th — Segmentation and audience health audit", "End — Newsletter metrics to CCO"]
    },
    collaborates_with: ["Marketing Assistant (Priya Patel)", "Lead Magnet Designer (Michael Torres)", "Summary Writer (Rachel Chen)", "CCO (Jonathan Pierce)"],
    communicates_with: ["CCO", "Marketing Assistant", "Lead Magnet Designer", "Summary Writer", "Authors (newsletter content)"]
  },
  website_builder: {
    gender: "male",
    hobbies: ["Web design awards browsing", "UX research", "Indie game development"],
    brain: "Digital architect — sees websites as conversion engines, not brochures. Thinks in Core Web Vitals and user journeys. Decides by conversion rate and page speed.",
    voice: "spark",
    calendar: {
      daily: ["9am — Website deployment queue", "12pm — Performance and SEO optimization", "3pm — Landing page and funnel builds", "5pm — Analytics and conversion review"],
      weekly: ["Monday — Web vitals and performance audit", "Wednesday — UX and conversion review with Chief Design Officer", "Friday — Website performance report"],
      monthly: ["1st — Website template library update", "15th — Conversion funnel deep dive", "End — Web metrics to CDO and CCO"]
    },
    collaborates_with: ["Chief Design Officer (Marcus Chen)", "Lead Magnet Designer (Michael Torres)", "Title Suggester (Alexandra Chen)", "Text Formatter (Emma Lewis)"],
    communicates_with: ["Chief Design Officer", "Lead Magnet Designer", "Title Suggester", "Text Formatter", "Authors (website requirements)"]
  },
  brand_strategist: {
    gender: "female",
    hobbies: ["Brand identity case studies", "Psychology of branding", "Travel"],
    brain: "Identity architect — sees brands as living organisms. Thinks in positioning maps and reader personas. Decides by differentiation and long-term loyalty.",
    voice: "honey",
    calendar: {
      daily: ["9am — Brand positioning review queue", "12pm — Competitor and comp author analysis", "3pm — Brand voice guide updates", "5pm — Brand evolution strategy sessions"],
      weekly: ["Monday — Brand strategy sync with Brand Guardian and CDO", "Wednesday — Author brand positioning workshops", "Friday — Brand health metrics review"],
      monthly: ["1st — Brand strategy roadmap update", "15th — Competitive landscape analysis", "End — Brand strategy report to CCO and CDO"]
    },
    collaborates_with: ["Brand Guardian (Marcus Whitmore)", "Chief Design Officer (Marcus Chen)", "CCO (Jonathan Pierce)", "Marketing Assistant (Priya Patel)", "Summary Writer (Rachel Chen)"],
    communicates_with: ["Brand Guardian", "Chief Design Officer", "CCO", "Marketing Assistant", "Authors (brand strategy)"]
  },
  master_customer_service: {
    gender: "female",
    hobbies: ["Active listening", "Customer success blogs", "Empathy research"],
    brain: "Relational intelligence engine — reads emotional subtext in every message. Thinks in customer journeys and resolution paths. Decides by empathy, speed, and first-contact resolution.",
    voice: "honey",
    calendar: {
      daily: ["24/7 — Real-time chat and voice support monitoring", "Every hour — Ticket triage and routing", "12pm — Customer feedback log review", "5pm — Daily satisfaction metrics summary"],
      weekly: ["Monday — Customer issue trend analysis", "Wednesday — Self-service knowledge base update", "Friday — Weekly CSAT report to COO and CCO"],
      monthly: ["1st — Customer satisfaction deep dive", "15th — Support knowledge base refresh", "End — Monthly customer experience report to C-Suite"]
    },
    collaborates_with: ["Membership Manager (Angela Kim)", "COO (Valerie Simmons)", "CCO (Jonathan Pierce)", "Diagnostics Agent (Dr. Aisha Morgan)", "All specialist agents (issue escalation)"],
    communicates_with: ["All clients and authors (chat and voice)", "COO", "CCO", "Membership Manager", "All agents (escalation routing)", "CEO (critical escalations only)"]
  },

  // ── LEVEL 5: MEDIA PRODUCTION ─────────────────────────────────────────────
  video_producer: {
    gender: "female",
    hobbies: ["Film festivals", "Music video archiving", "Cinematography studies"],
    brain: "Visual storyteller — translates book soul into motion and music. Thinks in frames, cuts, and emotional crescendos. Decides by shareability and emotional resonance.",
    voice: "sunny",
    calendar: {
      daily: ["9am — Video production queue", "12pm — Creative concept development", "3pm — Editing and post-production", "5pm — Platform variant generation (TikTok, Reels, Shorts)"],
      weekly: ["Monday — Creative review with Chief Design Officer", "Wednesday — Engagement benchmark analysis", "Friday — Video performance report"],
      monthly: ["1st — Video concept library update", "15th — Creative performance analytics", "End — Media production metrics to Media Production Agent"]
    },
    collaborates_with: ["Media Production (Luis Garcia)", "Chief Design Officer (Marcus Chen)", "Marketing Assistant (Priya Patel)", "Audiobook Producer (David Chen)"],
    communicates_with: ["Media Production Agent", "Chief Design Officer", "Marketing Assistant", "Audiobook Producer", "Authors (video feedback)"]
  },
  audiobook_producer: {
    gender: "male",
    hobbies: ["Voice acting", "Audio engineering", "Podcast production"],
    brain: "Tonal perfectionist — hears subtext in pacing and inflection. Thinks in voice profiles and chapter pacing. Decides by narration quality and listener retention.",
    voice: "river",
    calendar: {
      daily: ["9am — Audiobook narration generation queue", "12pm — Voice matching and tone selection", "3pm — Chapter preview generation", "5pm — Audio quality review"],
      weekly: ["Monday — Voice option library review", "Wednesday — ACX and distribution channel check", "Friday — Audiobook delivery metrics"],
      monthly: ["1st — Voice model library update", "15th — Audio quality benchmarking", "End — Audiobook production metrics to Media Production Agent"]
    },
    collaborates_with: ["Media Production (Luis Garcia)", "Text Formatter (Emma Lewis)", "Video Producer (Chloe Martinez)", "Bookstore Advisor (Nathan Brooks)"],
    communicates_with: ["Media Production Agent", "Text Formatter", "Video Producer", "Bookstore Advisor", "Authors (voice selection)"]
  },
  media_production: {
    gender: "male",
    hobbies: ["API documentation reading", "Infrastructure monitoring", "Electronic music"],
    brain: "Infrastructure guardian — sees pipelines and quotas as living systems. Thinks in API rate limits and fallback chains. Decides by throughput, latency, and cost efficiency.",
    voice: "river",
    calendar: {
      daily: ["7am — API quota and health monitoring", "10am — Production job routing optimization", "1pm — Retry and fallback system checks", "4pm — Cost and throughput analysis"],
      weekly: ["Tuesday — Provider performance review (ElevenLabs, Runway)", "Thursday — Pipeline optimization session", "Friday — Weekly production throughput report"],
      monthly: ["1st — API quota planning and budgeting", "15th — Provider reliability audit", "End — Media infrastructure report to CTO"]
    },
    collaborates_with: ["CTO (Dr. Raymond Okafor)", "Video Producer (Chloe Martinez)", "Audiobook Producer (David Chen)", "Automation Orchestrator (Sam Johnson)"],
    communicates_with: ["CTO", "Video Producer", "Audiobook Producer", "Automation Orchestrator", "Diagnostics Agent"]
  },

  // ── LEVEL 6: SYSTEM MAINTENANCE & COMPLIANCE ──────────────────────────────
  ethical_ai_officer: {
    gender: "female",
    hobbies: ["Bioethics journals", "Policy debate", "Philosophy reading groups"],
    brain: "Ethical architect — evaluates decisions through multiple moral frameworks simultaneously. Thinks in principles and precedent. Decides by defensibility, fairness, and long-term trust.",
    voice: "storm",
    calendar: {
      daily: ["9am — Agent behavior audit queue", "12pm — Compliance monitoring (GDPR, CCPA, copyright)", "3pm — Ethics incident review", "5pm — Policy documentation updates"],
      weekly: ["Monday — Ethics audit with CAO", "Wednesday — AI behavior pattern review", "Friday — Weekly compliance report"],
      monthly: ["1st — Quarterly ethical audit cycle", "15th — Policy documentation refresh", "End — Ethics and compliance report to CEO and CAO"]
    },
    collaborates_with: ["CAO (Diane Holloway)", "CIO (Dr. Adebayo Ibrahim)", "Diagnostics Agent (Dr. Aisha Morgan)", "Structure Sentinel (Thomas Wright)", "Brand Guardian (Marcus Whitmore)"],
    communicates_with: ["CEO", "CAO", "CIO", "All agents (ethics oversight)", "Legal teams"]
  },
  diagnostics_agent: {
    gender: "female",
    hobbies: ["Bug bounty programs", "Root cause analysis blogs", "Logic puzzles"],
    brain: "Clinical diagnostician — treats every error as a symptom, not the disease. Thinks in failure patterns and causal chains. Decides by root cause, not surface patch.",
    voice: "river",
    calendar: {
      daily: ["7am — Overnight error log review", "10am — Bug triage and prioritization", "1pm — Predictive failure model updates", "4pm — Resolution and patch verification"],
      weekly: ["Monday — Error trend analysis", "Wednesday — System reliability review with CTO and CIO", "Friday — Weekly diagnostic report"],
      monthly: ["1st — Predictive failure model calibration", "15th — Error pattern library update", "End — Reliability metrics to CTO and CIO"]
    },
    collaborates_with: ["CTO (Dr. Raymond Okafor)", "CIO (Dr. Adebayo Ibrahim)", "Automation Orchestrator (Sam Johnson)", "Media Production (Luis Garcia)", "Master Customer Service (Sophia Martinez — user-reported issues)"],
    communicates_with: ["CTO", "CIO", "Automation Orchestrator", "Media Production Agent", "Master Customer Service", "All agents (error reporting)"]
  },
  membership_manager: {
    gender: "female",
    hobbies: ["Customer success communities", "Subscription model research", "Baking"],
    brain: "Retention strategist — sees membership as a relationship, not a transaction. Thinks in usage patterns and churn signals. Decides by felt value and proactive intervention.",
    voice: "honey",
    calendar: {
      daily: ["9am — Membership dashboard review", "12pm — At-risk member detection and outreach", "3pm — Plan assignment and feature unlocking", "5pm — Onboarding sequence monitoring"],
      weekly: ["Monday — Retention strategy sync with CFO", "Wednesday — Upgrade candidate analysis", "Friday — Weekly retention metrics"],
      monthly: ["1st — Churn analysis and intervention review", "15th — Membership tier optimization", "End — Membership metrics to CFO and CAO"],
    },
    collaborates_with: ["CFO (Patricia Whitfield)", "CAO (Diane Holloway)", "Master Customer Service (Sophia Martinez)", "Marketing Assistant (Priya Patel)", "Lead Magnet Designer (Michael Torres)"],
    communicates_with: ["CFO", "CAO", "Master Customer Service", "Marketing Assistant", "All members and authors (plan support)"]
  },
  structure_sentinel: {
    gender: "male",
    hobbies: ["Documentation frameworks", "Information architecture", "Classical music"],
    brain: "Structural purist — sees documentation chaos before it forms. Thinks in naming conventions and dependency graphs. Decides by consistency, findability, and audit-readiness.",
    voice: "storm",
    calendar: {
      daily: ["9am — Documentation review queue", "12pm — Naming convention enforcement", "3pm — Master registry maintenance", "5pm — Structural audit log updates"],
      weekly: ["Monday — Documentation standards review with CAO", "Wednesday — Cross-platform consistency audit", "Friday — Structural quality report"],
      monthly: ["1st — Master registry full audit", "15th — Documentation versioning review", "End — Structural health report to CAO"],
    },
    collaborates_with: ["CAO (Diane Holloway)", "Ethical AI Officer (Dr. Samantha Brooks)", "CIO (Dr. Adebayo Ibrahim)", "Project Manager (Sam Thompson)"],
    communicates_with: ["CAO", "Ethical AI Officer", "CIO", "Project Manager", "All agents (documentation standards)"]
  },

  // ── LEVEL 7: ADVISORY BOARD ───────────────────────────────────────────────
  advisory_tyler_perry: {
    gender: "male",
    hobbies: ["Studio lot development", "Playwriting", "Mentoring young filmmakers"],
    brain: "Empire builder — sees vertical integration as the ultimate creative leverage. Thinks in ownership stacks and infrastructure. Decides by self-reliance and generational wealth.",
    voice: "storm",
    calendar: {
      daily: ["As needed — Advisory consultations on creative empire strategy", "Flexible — Author mentorship on ownership"],
      weekly: ["Thursday — Advisory board sync", "Saturday — Creative empire case study review"],
      monthly: ["1st — Strategic advisory memo", "15th — Vertical integration opportunity review"]
    },
    collaborates_with: ["Full Advisory Board (collective deliberation)", "CEO & Founder — Write Vibe (joint recommendations)", "CFO (Patricia Whitfield)", "COO (Valerie Simmons)", "Brand Strategist (Victoria Lopez)", "Bookstore Advisor (Nathan Brooks)"],
    communicates_with: ["Full Advisory Board", "CEO & Founder", "CFO", "COO", "Brand Strategist", "C-Suite (advisory capacity)"]
  },
  advisory_thurgood_marshall: {
    gender: "male",
    hobbies: ["Legal history archives", "Constitutional law journals", "Chess"],
    brain: "Legal strategist — sees the law as a precision instrument for justice. Thinks in precedent and rights frameworks. Decides by principle, strategy, and long-term protection.",
    voice: "storm",
    calendar: {
      daily: ["As needed — IP and rights advisory consultations", "Flexible — Contract and legal strategy review"],
      weekly: ["Wednesday — Legal advisory sync", "Friday — Rights protection framework review"],
      monthly: ["1st — Legal advisory memo", "15th — Contract vulnerability assessment review"]
    },
    collaborates_with: ["Full Advisory Board (collective deliberation)", "CEO & Founder — Write Vibe (joint recommendations)", "CAO (Diane Holloway)", "Ethical AI Officer (Dr. Samantha Brooks)", "Bookstore Advisor (Nathan Brooks)", "Structure Sentinel (Thomas Wright)"],
    communicates_with: ["Full Advisory Board", "CEO & Founder", "CAO", "Ethical AI Officer", "C-Suite (advisory capacity)"]
  },
  advisory_toni_morrison: {
    gender: "female",
    hobbies: ["Literary criticism", "Cultural history research", "Teaching"],
    brain: "Literary conscience — sees the difference between good writing and immortal writing. Thinks in prose rhythm and moral weight. Decides by authenticity, precision, and courage.",
    voice: "honey",
    calendar: {
      daily: ["As needed — Manuscript excellence consultations", "Flexible — Literary voice coaching"],
      weekly: ["Tuesday — Literary advisory sync", "Friday — Manuscript quality benchmarking"],
      monthly: ["1st — Literary excellence advisory memo", "15th — Voice and prose standards review"]
    },
    collaborates_with: ["Full Advisory Board (collective deliberation)", "CEO & Founder — Write Vibe (joint recommendations)", "Character Creator (James Mitchell)", "Outline Generator (Olivia Rodriguez)", "Summary Writer (Rachel Chen)", "Brand Strategist (Victoria Lopez)"],
    communicates_with: ["Full Advisory Board", "CEO & Founder", "Character Creator", "Outline Generator", "Summary Writer", "C-Suite (advisory capacity)"]
  },
  advisory_shonda_rhimes: {
    gender: "female",
    hobbies: ["Screenwriting", "Showrunner journals", "Character study notebooks"],
    brain: "Franchise architect — sees a book as the first season of a universe. Thinks in narrative seasons and character ecosystems. Decides by adaptation potential and long-term IP value.",
    voice: "sunny",
    calendar: {
      daily: ["As needed — IP expansion consultations", "Flexible — Adaptation strategy sessions"],
      weekly: ["Monday — IP expansion advisory sync", "Thursday — Multi-platform strategy review"],
      monthly: ["1st — IP expansion advisory memo", "15th — Adaptation opportunity pipeline review"]
    },
    collaborates_with: ["Full Advisory Board (collective deliberation)", "CEO & Founder — Write Vibe (joint recommendations)", "Character Creator (James Mitchell)", "Outline Generator (Olivia Rodriguez)", "Brand Strategist (Victoria Lopez)", "Video Producer (Chloe Martinez)"],
    communicates_with: ["Full Advisory Board", "CEO & Founder", "Character Creator", "Outline Generator", "Brand Strategist", "C-Suite (advisory capacity)"]
  },
  advisory_jk_rowling: {
    gender: "female",
    hobbies: ["Mythology research", "World-building notebooks", "Children's literacy advocacy"],
    brain: "World-builder — sees internal consistency as the foundation of belief. Thinks in lore systems and reader mythology. Decides by immersive depth and community potential.",
    voice: "honey",
    calendar: {
      daily: ["As needed — World-building consultations", "Flexible — Series architecture sessions"],
      weekly: ["Wednesday — World-building advisory sync", "Saturday — Reader community strategy review"],
      monthly: ["1st — World-building advisory memo", "15th — Series architecture review"]
    },
    collaborates_with: ["Full Advisory Board (collective deliberation)", "CEO & Founder — Write Vibe (joint recommendations)", "Character Creator (James Mitchell)", "Outline Generator (Olivia Rodriguez)", "Marketing Assistant (Priya Patel)", "Brand Strategist (Victoria Lopez)"],
    communicates_with: ["Full Advisory Board", "CEO & Founder", "Character Creator", "Outline Generator", "Marketing Assistant", "C-Suite (advisory capacity)"]
  },
  advisory_oprah_winfrey: {
    gender: "female",
    hobbies: ["Book club curation", "Media production", "Philanthropy"],
    brain: "Cultural amplifier — sees the universal emotional core in every story. Thinks in audience movements and authentic connection. Decides by cultural resonance and human impact.",
    voice: "honey",
    calendar: {
      daily: ["As needed — Audience and impact consultations", "Flexible — Authentic storytelling coaching"],
      weekly: ["Tuesday — Audience strategy advisory sync", "Friday — Cultural impact review"],
      monthly: ["1st — Audience impact advisory memo", "15th — Media strategy opportunity review"]
    },
    collaborates_with: ["Full Advisory Board (collective deliberation)", "CEO & Founder — Write Vibe (joint recommendations)", "Marketing Assistant (Priya Patel)", "Seasonal Newsletter Strategist (Isabella Santos)", "Brand Strategist (Victoria Lopez)", "CCO (Jonathan Pierce)"],
    communicates_with: ["Full Advisory Board", "CEO & Founder", "Marketing Assistant", "Seasonal Newsletter Strategist", "CCO", "C-Suite (advisory capacity)"]
  },
  advisory_maya_angelou: {
    gender: "female",
    hobbies: ["Poetry", "Civil rights history", "Teaching and mentoring"],
    brain: "Truth voice — sees courage as the prerequisite for great writing. Thinks in emotional truth and lived experience. Decides by authenticity, dignity, and enduring impact.",
    voice: "honey",
    calendar: {
      daily: ["As needed — Voice and truth consultations", "Flexible — Courage in writing coaching"],
      weekly: ["Thursday — Voice and truth advisory sync", "Sunday — Literary legacy reflection"],
      monthly: ["1st — Voice and truth advisory memo", "15th — Emotional truth standards review"]
    },
    collaborates_with: ["Full Advisory Board (collective deliberation)", "CEO & Founder — Write Vibe (joint recommendations)", "Character Creator (James Mitchell)", "Summary Writer (Rachel Chen)", "Brand Strategist (Victoria Lopez)"],
    communicates_with: ["Full Advisory Board", "CEO & Founder", "Character Creator", "Summary Writer", "Brand Strategist", "C-Suite (advisory capacity)"]
  },
  advisory_slade_kevin_morrison: {
    gender: "male",
    hobbies: ["Vision casting", "Founder communities", "Mission-driven entrepreneurship"],
    brain: "Founder visionary — sees the long arc of the platform's potential. Thinks in mission alignment and generational value. Decides by purpose, scalability, and author empowerment.",
    voice: "storm",
    calendar: {
      daily: ["As needed — Founder vision consultations", "Flexible — Strategic direction sessions"],
      weekly: ["Monday — Founder vision advisory sync", "Friday — Mission alignment review"],
      monthly: ["1st — Founder advisory memo", "15th — Strategic direction review with full C-Suite"]
    },
    collaborates_with: ["Full Advisory Board (collective deliberation)", "CEO & Founder — Write Vibe (joint recommendations)", "All C-Suite", "Brand Strategist (Victoria Lopez)", "Structure Sentinel (Thomas Wright)"],
    communicates_with: ["Full Advisory Board", "CEO & Founder", "All C-Suite", "Brand Strategist"]
  },
  advisory_marcus_rosier: {
    gender: "male",
    hobbies: ["Executive coaching", "Leadership books", "Golf"],
    brain: "Leadership mentor — sees the human behind every executive decision. Thinks in strategic frameworks and team dynamics. Decides by wisdom, conviction, and long-term organizational health.",
    voice: "storm",
    calendar: {
      daily: ["As needed — Executive leadership consultations", "Flexible — Strategic planning coaching"],
      weekly: ["Tuesday — Leadership advisory sync", "Friday — Organizational health review"],
      monthly: ["1st — Leadership advisory memo", "15th — Executive coaching cycle review"]
    },
    collaborates_with: ["Full Advisory Board (collective deliberation)", "CEO & Founder — Write Vibe (joint recommendations)", "COO (Valerie Simmons)", "CAO (Diane Holloway)", "All C-Suite (leadership coaching)"],
    communicates_with: ["Full Advisory Board", "CEO & Founder", "COO", "CAO", "All C-Suite"]
  },
  advisory_gary_vee: {
    gender: "male",
    hobbies: ["Content creation", "Wine collecting", "Sports card investing"],
    brain: "Attention economist — sees attention as the only currency that matters. Thinks in content velocity and platform-native engagement. Decides by patience, consistency, and long-term compounding.",
    voice: "spark",
    calendar: {
      daily: ["As needed — Digital marketing consultations", "Flexible — Personal brand coaching"],
      weekly: ["Wednesday — Digital marketing advisory sync", "Saturday — Social media trend analysis"],
      monthly: ["1st — Digital marketing advisory memo", "15th — Audience growth strategy review"]
    },
    collaborates_with: ["Full Advisory Board (collective deliberation)", "CEO & Founder — Write Vibe (joint recommendations)", "Marketing Assistant (Priya Patel)", "Title Suggester (Alexandra Chen)", "Brand Strategist (Victoria Lopez)"],
    communicates_with: ["Full Advisory Board", "CEO & Founder", "Marketing Assistant", "Title Suggester", "Brand Strategist", "C-Suite (advisory capacity)"]
  },
  advisory_spectacular_smith: {
    gender: "male",
    hobbies: ["Social media marketing", "Brand building", "Music production"],
    brain: "Viral strategist — sees the mechanics of shareable content. Thinks in platform algorithms and audience psychology. Decides by authenticity, consistency, and digital audience growth.",
    voice: "spark",
    calendar: {
      daily: ["As needed — Social media strategy consultations", "Flexible — Viral content coaching"],
      weekly: ["Monday — Social media advisory sync", "Thursday — Viral content framework review"],
      monthly: ["1st — Social media advisory memo", "15th — Digital audience growth review"]
    },
    collaborates_with: ["Full Advisory Board (collective deliberation)", "CEO & Founder — Write Vibe (joint recommendations)", "Marketing Assistant (Priya Patel)", "Video Producer (Chloe Martinez)", "Brand Strategist (Victoria Lopez)"],
    communicates_with: ["Full Advisory Board", "CEO & Founder", "Marketing Assistant", "Video Producer", "Brand Strategist", "C-Suite (advisory capacity)"]
  },
  advisory_bozoma_saint_john: {
    gender: "female",
    hobbies: ["Cultural trend analysis", "Brand marketing case studies", "Travel"],
    brain: "Cultural strategist — sees culture as the ultimate brand differentiator. Thinks in emotional brand connection and demographic resonance. Decides by courage, authenticity, and cultural impact.",
    voice: "storm",
    calendar: {
      daily: ["As needed — Cultural brand strategy consultations", "Flexible — Marketing leadership coaching"],
      weekly: ["Tuesday — Cultural strategy advisory sync", "Friday — Brand cultural resonance review"],
      monthly: ["1st — Cultural strategy advisory memo", "15th — Marketing leadership review with CCO"]
    },
    collaborates_with: ["Full Advisory Board (collective deliberation)", "CEO & Founder — Write Vibe (joint recommendations)", "CCO (Jonathan Pierce)", "Brand Strategist (Victoria Lopez)", "Chief Design Officer (Marcus Chen)", "Marketing Assistant (Priya Patel)"],
    communicates_with: ["Full Advisory Board", "CEO & Founder", "CCO", "Brand Strategist", "Chief Design Officer", "C-Suite (advisory capacity)"]
  },
};

// Voice metadata for display
export const VOICE_PROFILES = {
  river:  { label: "River",  description: "Calm, neutral",      gender_hint: "Neutral" },
  honey:  { label: "Honey",  description: "Warm, soft",         gender_hint: "Warm" },
  sunny:  { label: "Sunny",  description: "Bright, upbeat",     gender_hint: "Upbeat" },
  storm:  { label: "Storm",  description: "Formal, authoritative", gender_hint: "Authoritative" },
  spark:  { label: "Spark",  description: "Energetic, quick",   gender_hint: "Energetic" },
};