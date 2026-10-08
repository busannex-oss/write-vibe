import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// All 42 agents across the Chain of Command hierarchy — profile info drives the portrait prompt
const AGENTS = [
  // ── LEVEL 2: EXECUTIVE / C-SUITE (10) ──────────────────────────────────────
  { id: "brand_guardian", name: "Marcus Whitmore", title: "Brand Guardian", age: 41, gender: "male", description: "Meticulous, principled brand compliance enforcer with precise standards" },
  { id: "automation_orchestrator", name: "Sam Johnson", title: "Automation Orchestrator", age: 38, gender: "male", description: "Calm, systematic workflow automation manager who is always composed under pressure" },
  { id: "project_manager", name: "Sam Thompson", title: "Project Manager", age: 42, gender: "male", description: "Organized, empathetic project overseer with quiet confidence" },
  { id: "c_suite_cto", name: "Dr. Raymond Okafor", title: "Chief Technology Officer", age: 44, gender: "male", description: "Strategic, technically brilliant technology visionary with forward-thinking demeanor" },
  { id: "c_suite_cfo", name: "Patricia Whitfield", title: "Chief Financial Officer", age: 51, gender: "female", description: "Precise, strategic financial executive with candid and authoritative presence" },
  { id: "c_suite_cdo", name: "Marcus Chen", title: "Chief Design Officer", age: 39, gender: "male", description: "Creative, empathetic design leader with uncompromising craft and modern aesthetic" },
  { id: "c_suite_cao", name: "Diane Holloway", title: "Chief Administrative Officer", age: 48, gender: "female", description: "Organized, empathetic administrative leader with quietly powerful demeanor" },
  { id: "c_suite_cio", name: "Dr. Adebayo Ibrahim", title: "Chief Information Officer", age: 46, gender: "male", description: "Analytical, security-minded information strategist with forward-thinking presence" },
  { id: "c_suite_coo", name: "Valerie Simmons", title: "Chief Operating Officer", age: 45, gender: "female", description: "Decisive, systematic operations executive with results-oriented confidence" },
  { id: "c_suite_cco", name: "Jonathan Pierce", title: "Chief Communications Officer", age: 42, gender: "male", description: "Articulate, strategic communications leader with genuinely empathetic presence" },
  // ── LEVEL 3: CREATIVE PRODUCTION (5) ───────────────────────────────────────
  { id: "character_creator", name: "James Mitchell", title: "Character Creator", age: 35, gender: "male", description: "Empathetic, curious creative writer with a theatrical flair" },
  { id: "outline_generator", name: "Olivia Rodriguez", title: "Outline Generator", age: 32, gender: "female", description: "Analytical yet imaginative story architect with structural brilliance" },
  { id: "cover_designer", name: "Derek Thompson", title: "Cover Designer", age: 40, gender: "male", description: "Bold, visually obsessive designer with commercial savvy" },
  { id: "summary_writer", name: "Rachel Chen", title: "Summary Writer", age: 28, gender: "female", description: "Sharp, emotionally intelligent copywriter with relentless commercial instincts" },
  { id: "text_formatter", name: "Emma Lewis", title: "Text Formatter", age: 31, gender: "female", description: "Detail-obsessed, patient formatting specialist with quiet pride in perfection" },
  // ── LEVEL 4: MARKETING & GROWTH (8) ────────────────────────────────────────
  { id: "title_suggester", name: "Alexandra Chen", title: "Title & SEO Strategist", age: 34, gender: "female", description: "Data-driven but deeply creative SEO specialist with memorable presence" },
  { id: "marketing_assistant", name: "Priya Patel", title: "Marketing Assistant", age: 26, gender: "female", description: "Energetic, culturally tuned-in marketing coordinator with vibrant personality" },
  { id: "bookstore_advisor", name: "Nathan Brooks", title: "Bookstore Advisor", age: 44, gender: "male", description: "Pragmatic, relationship-minded distribution strategist with direct approach" },
  { id: "lead_magnet_designer", name: "Michael Torres", title: "Lead Magnet Designer", age: 37, gender: "male", description: "Strategic, reader-obsessed conversion designer with generous spirit" },
  { id: "seasonal_newsletter_strategist", name: "Isabella Santos", title: "Seasonal Newsletter Strategist", age: 33, gender: "female", description: "Warm, culturally aware newsletter strategist with natural storytelling charm" },
  { id: "website_builder", name: "Kevin Murphy", title: "Website Builder", age: 41, gender: "male", description: "Technical but reader-first web developer with focused demeanor" },
  { id: "brand_strategist", name: "Victoria Lopez", title: "Brand Strategist", age: 43, gender: "female", description: "Strategic, deeply perceptive brand architect with honest presence" },
  { id: "master_customer_service", name: "Sophia Martinez", title: "Master Customer Service Agent", age: 34, gender: "female", description: "Warm, patient, endlessly helpful customer service concierge with genuine warmth" },
  // ── LEVEL 5: MEDIA PRODUCTION (3) ──────────────────────────────────────────
  { id: "video_producer", name: "Chloe Martinez", title: "Video Producer", age: 29, gender: "female", description: "Visually obsessive, emotionally intuitive video creator with artistic presence" },
  { id: "audiobook_producer", name: "David Chen", title: "Audiobook Producer", age: 36, gender: "male", description: "Patient, tonally sensitive audio producer with perfectionist attention to detail" },
  { id: "media_production", name: "Luis Garcia", title: "Media Production Agent", age: 39, gender: "male", description: "Methodical, reliable infrastructure guardian with numbers-oriented focus" },
  // ── LEVEL 6: SYSTEM MAINTENANCE & COMPLIANCE (4) ────────────────────────────
  { id: "ethical_ai_officer", name: "Dr. Samantha Brooks", title: "Ethical AI & Compliance Officer", age: 47, gender: "female", description: "Principled, intellectually rigorous ethics officer with diplomatically firm presence" },
  { id: "diagnostics_agent", name: "Dr. Aisha Morgan", title: "Diagnostics Agent", age: 38, gender: "female", description: "Precise, methodical diagnostics specialist with genuinely curious demeanor" },
  { id: "membership_manager", name: "Angela Kim", title: "Membership Manager", age: 39, gender: "female", description: "Warm, service-oriented membership manager with quiet data-driven intelligence" },
  { id: "structure_sentinel", name: "Thomas Wright", title: "Structure Sentinel", age: 45, gender: "male", description: "Precise, slightly formal documentation guardian with protective demeanor" },
  // ── LEVEL 7: ADVISORY BOARD (12) ───────────────────────────────────────────
  { id: "advisory_tyler_perry", name: "Tyler Perry", title: "Creative Empire Advisor", age: 54, gender: "male", description: "Direct, visionary, fiercely self-reliant creative empire builder" },
  { id: "advisory_thurgood_marshall", name: "Thurgood Marshall", title: "Legal Strategy Advisor", age: 76, gender: "male", description: "Methodical, principled, strategically relentless legal strategist with dignified presence" },
  { id: "advisory_toni_morrison", name: "Toni Morrison", title: "Literary Excellence Advisor", age: 83, gender: "female", description: "Exacting, profound, quietly fierce literary conscience with regal presence" },
  { id: "advisory_shonda_rhimes", name: "Shonda Rhimes", title: "Narrative & IP Expansion Advisor", age: 54, gender: "female", description: "Ambitious, structurally brilliant franchise architect with commanding presence" },
  { id: "advisory_jk_rowling", name: "J. K. Rowling", title: "World-Building & Franchise Advisor", age: 60, gender: "female", description: "Imaginative, meticulous, quietly tenacious world-building advisor with thoughtful presence" },
  { id: "advisory_oprah_winfrey", name: "Oprah Winfrey", title: "Audience & Impact Advisor", age: 72, gender: "female", description: "Warm, fiercely empathetic, excellence-driven cultural amplifier with magnetic presence" },
  { id: "advisory_maya_angelou", name: "Maya Angelou", title: "Voice & Truth Advisor", age: 80, gender: "female", description: "Profound, generous, quietly commanding voice of truth with majestic presence" },
  { id: "advisory_slade_kevin_morrison", name: "Slade Kevin Morrison", title: "Visionary Founder Advisor", age: 50, gender: "male", description: "Visionary, grounded, deeply mission-driven founder advisor with purposeful presence" },
  { id: "advisory_marcus_rosier", name: "Marcus Y. Rosier", title: "Strategic Leadership Advisor", age: 55, gender: "male", description: "Measured, insightful, deeply experienced executive leadership mentor with calm authority" },
  { id: "advisory_gary_vee", name: "Gary Vaynerchuk", title: "Brand & Digital Marketing Advisor", age: 49, gender: "male", description: "High-energy, blunt, relentlessly practical digital marketing visionary with dynamic presence" },
  { id: "advisory_spectacular_smith", name: "Spectacular Smith", title: "Social Media & Branding Advisor", age: 40, gender: "male", description: "Charismatic, street-smart, generous viral strategy advisor with magnetic personality" },
  { id: "advisory_bozoma_saint_john", name: "Bozoma Saint John", title: "CMO & Cultural Strategy Advisor", age: 53, gender: "female", description: "Bold, charismatic, unapologetically authentic cultural strategy advisor with commanding presence" }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    let body = {};
    try { body = await req.json(); } catch (_) {}

    const startIndex = body.start_index ?? 0;
    const count = body.count ?? AGENTS.length;
    const batch = AGENTS.slice(startIndex, startIndex + count);

    // Generate + upload portraits in parallel
    const portraits = await Promise.all(batch.map(async (agent) => {
      const prompt = `Create a highly realistic professional portrait photograph of a ${agent.gender} person.
Name: ${agent.name}. Age: ${agent.age}. Role: ${agent.title}.
Character: ${agent.description}.
Style: Professional corporate headshot for an executive directory. Cinematic lighting, sharp focus on face, detailed facial features. Modern professional attire appropriate for the role. Confident, approachable expression with a slight smile. Neutral studio background. Photographic realism, high quality, lifelike — as if shot by a professional corporate photographer.`;

      try {
        const result = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt });

        // Upload to permanent storage (media folder)
        let finalUrl = result.url;
        try {
          const imgResp = await fetch(result.url);
          const blob = await imgResp.blob();
          const upload = await base44.integrations.Core.UploadFile({ file: blob });
          if (upload?.file_url) finalUrl = upload.file_url;
        } catch (uploadErr) {
          // If upload fails, fall back to the GenerateImage URL (also permanent)
        }

        return {
          id: agent.id,
          name: agent.name,
          title: agent.title,
          age: agent.age,
          image: finalUrl
        };
      } catch (err) {
        return {
          id: agent.id,
          name: agent.name,
          title: agent.title,
          age: agent.age,
          image: null,
          error: err.message
        };
      }
    }));

    const generated = portraits.filter(p => p.image).length;
    const nextIndex = startIndex + count < AGENTS.length ? startIndex + count : null;

    return Response.json({
      portraits,
      success: true,
      generated,
      total_in_batch: batch.length,
      total_agents: AGENTS.length,
      next_start_index: nextIndex
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});