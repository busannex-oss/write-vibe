import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const CERTIFICATION_NAME = "AI CPD Consultant";
const ACCREDITATION_BODY = "CPD Standards Office";
const ISSUING_AUTHORITY = "Write Vibe AI Academy";
const CPD_POINTS = 40;
const CPD_HOURS = 40;
const VALIDITY_YEARS = 2;

// C-Suite (Executive) agents + Advisory Board members — single source for issuance
const RECIPIENTS = [
  { id: "brand_guardian", name: "Marcus Whitmore", title: "BRAND GUARDIAN", type: "c_suite_agent", competency_areas: ["Proper Business Structure", "Strategic Application"] },
  { id: "automation_orchestrator", name: "Sam Johnson", title: "AUTOMATION ORCHESTRATOR", type: "c_suite_agent", competency_areas: ["Business Intelligence", "Proper Business Structure"] },
  { id: "project_manager", name: "Sam Thompson", title: "PROJECT MANAGER", type: "c_suite_agent", competency_areas: ["Proper Business Structure", "Business Intelligence"] },
  { id: "c_suite_cto", name: "Dr. Raymond Okafor", title: "CHIEF TECHNOLOGY OFFICER (CTO)", type: "c_suite_agent", competency_areas: ["Proper Business Structure", "Business Intelligence"] },
  { id: "c_suite_cfo", name: "Patricia Whitfield", title: "CHIEF FINANCIAL OFFICER (CFO)", type: "c_suite_agent", competency_areas: ["Proper Business Structure", "Wealth Strategies Trajectory"] },
  { id: "c_suite_cdo", name: "Marcus Chen", title: "CHIEF DESIGN OFFICER (CDO)", type: "c_suite_agent", competency_areas: ["Strategic Application", "Exemplary Customer Service"] },
  { id: "c_suite_cao", name: "Diane Holloway", title: "CHIEF ADMINISTRATIVE OFFICER (CAO)", type: "c_suite_agent", competency_areas: ["Proper Business Structure", "Exemplary Customer Service"] },
  { id: "c_suite_cio", name: "Dr. Adebayo Ibrahim", title: "CHIEF INFORMATION OFFICER (CIO)", type: "c_suite_agent", competency_areas: ["Business Intelligence", "Predictive Analysis"] },
  { id: "c_suite_coo", name: "Valerie Simmons", title: "CHIEF OPERATING OFFICER (COO)", type: "c_suite_agent", competency_areas: ["Proper Business Structure", "Business Intelligence"] },
  { id: "c_suite_cco", name: "Jonathan Pierce", title: "CHIEF COMMUNICATIONS OFFICER (CCO)", type: "c_suite_agent", competency_areas: ["Partnership Alignment", "Exemplary Customer Service"] },
  { id: "advisory_tyler_perry", name: "Tyler Perry", title: "CREATIVE EMPIRE ADVISOR", type: "advisory_board", competency_areas: ["Self-Ownership", "Vertical Integration", "Business Structure", "Creative Empire", "Wealth Building"] },
  { id: "advisory_thurgood_marshall", name: "Thurgood Marshall", title: "LEGAL STRATEGY ADVISOR", type: "advisory_board", competency_areas: ["Intellectual Property", "Copyright", "Contract Negotiation", "Legal Strategy", "Rights Protection"] },
  { id: "advisory_toni_morrison", name: "Toni Morrison", title: "LITERARY EXCELLENCE ADVISOR", type: "advisory_board", competency_areas: ["Literary Voice", "Prose Craft", "Cultural Authenticity", "Manuscript Quality", "Character Depth"] },
  { id: "advisory_shonda_rhimes", name: "Shonda Rhimes", title: "NARRATIVE & IP EXPANSION ADVISOR", type: "advisory_board", competency_areas: ["IP Expansion", "Adaptation", "Narrative Structure", "Franchise Building", "TV & Film"] },
  { id: "advisory_jk_rowling", name: "J. K. Rowling", title: "WORLD-BUILDING & FRANCHISE ADVISOR", type: "advisory_board", competency_areas: ["World-Building", "Series Architecture", "Reader Community", "Franchise", "Fantasy & Fiction"] },
  { id: "advisory_oprah_winfrey", name: "Oprah Winfrey", title: "AUDIENCE & IMPACT ADVISOR", type: "advisory_board", competency_areas: ["Audience Building", "Media Impact", "Authentic Storytelling", "Cultural Influence", "Book Marketing"] },
  { id: "advisory_maya_angelou", name: "Maya Angelou", title: "VOICE & TRUTH ADVISOR", type: "advisory_board", competency_areas: ["Authentic Voice", "Memoir", "Emotional Truth", "Prose Poetry", "Courage in Writing"] },
  { id: "advisory_slade_kevin_morrison", name: "Slade Kevin Morrison", title: "VISIONARY FOUNDER ADVISOR", type: "advisory_board", competency_areas: ["Platform Vision", "Founder Strategy", "Culture Building", "Mission Alignment", "Author Empowerment"] },
  { id: "advisory_marcus_rosier", name: "Marcus Y. Rosier", title: "STRATEGIC LEADERSHIP ADVISOR", type: "advisory_board", competency_areas: ["Leadership", "Strategic Vision", "Founder Mentorship", "Business Scaling", "Executive Coaching"] },
  { id: "advisory_gary_vee", name: "Gary Vaynerchuk", title: "BRAND & DIGITAL MARKETING ADVISOR", type: "advisory_board", competency_areas: ["Digital Marketing", "Personal Branding", "Social Media", "Content Strategy", "Audience Building"] },
  { id: "advisory_spectacular_smith", name: "Spectacular Smith", title: "SOCIAL MEDIA & BRANDING ADVISOR", type: "advisory_board", competency_areas: ["Social Media Marketing", "Brand Building", "Viral Strategy", "Digital Audience Growth"] },
  { id: "advisory_bozoma_saint_john", name: "Bozoma Saint John", title: "CMO & CULTURAL STRATEGY ADVISOR", type: "advisory_board", competency_areas: ["Brand Marketing", "Cultural Strategy", "C-Suite Leadership", "Diversity & Inclusion", "Consumer Insights"] }
];

function genCode(prefix) {
  const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${seg()}-${seg()}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const existing = await base44.asServiceRole.entities.Certification.filter(
      { certification_name: CERTIFICATION_NAME },
      "-created_date",
      200
    );
    const existingIds = new Set((existing || []).map((c) => c.recipient_id));

    const toCreate = RECIPIENTS.filter((r) => !existingIds.has(r.id));
    const issueDate = new Date().toISOString().slice(0, 10);
    const expiryDate = new Date(Date.now() + VALIDITY_YEARS * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const year = new Date().getFullYear();

    const records = toCreate.map((r) => ({
      recipient_name: r.name,
      recipient_id: r.id,
      recipient_type: r.type,
      recipient_title: r.title,
      certification_name: CERTIFICATION_NAME,
      accreditation_body: ACCREDITATION_BODY,
      issuing_authority: ISSUING_AUTHORITY,
      cpd_points: CPD_POINTS,
      cpd_hours: CPD_HOURS,
      certificate_number: genCode("CPDC-" + year),
      verification_code: genCode("WV"),
      issue_date: issueDate,
      expiry_date: expiryDate,
      status: "active",
      competency_areas: r.competency_areas
    }));

    let created = [];
    if (records.length > 0) {
      created = await base44.asServiceRole.entities.Certification.bulkCreate(records);
    }

    return Response.json({
      issued: created.length,
      skipped: RECIPIENTS.length - toCreate.length,
      total_eligible: RECIPIENTS.length,
      total_certified: existing.length + created.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});