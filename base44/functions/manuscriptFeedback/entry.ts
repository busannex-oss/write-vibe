import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { chapter_title, chapter_number, content, book_title, genre, characters } = body;

    if (!content || content.trim().length < 100) {
      return Response.json({ error: 'Chapter content too short to analyze' }, { status: 400 });
    }

    const charNames = (characters || []).map(c => c.name).join(', ') || 'Unknown';
    const excerpt = content.substring(0, 8000);

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an expert literary editor and writing coach. Analyze the following manuscript chapter and provide specific, actionable feedback across four dimensions.

Book: "${book_title}"
Genre: ${genre}
Chapter ${chapter_number}: "${chapter_title}"
Known characters: ${charNames}

CHAPTER TEXT:
---
${excerpt}
${content.length > 8000 ? '\n[...chapter continues, first 8000 characters analyzed]' : ''}
---

Provide detailed editorial feedback in four categories. For each finding, cite a SPECIFIC excerpt (exact quote, max 20 words) from the text. Be concrete and actionable — no generic advice.

Return JSON with this exact structure:
{
  "overall_score": <number 1-100>,
  "overall_summary": "<2-3 sentence editorial assessment>",
  "pacing": {
    "score": <1-100>,
    "grade": "<A/B/C/D/F>",
    "summary": "<one sentence>",
    "issues": [
      { "type": "slow_section" | "rushed_transition" | "scene_drag" | "good_rhythm", "excerpt": "<exact quote>", "feedback": "<specific fix>", "severity": "high" | "medium" | "low" }
    ]
  },
  "dialogue": {
    "score": <1-100>,
    "grade": "<A/B/C/D/F>",
    "summary": "<one sentence>",
    "issues": [
      { "character": "<name or 'unknown'>", "excerpt": "<exact quote>", "issue": "<what's wrong>", "suggestion": "<rewrite or fix>", "type": "voice_inconsistency" | "unnatural_speech" | "on_the_nose" | "strong_dialogue" }
    ]
  },
  "show_vs_tell": {
    "score": <1-100>,
    "grade": "<A/B/C/D/F>",
    "summary": "<one sentence>",
    "issues": [
      { "excerpt": "<exact telling passage>", "rewrite": "<show version>", "type": "emotion_told" | "action_told" | "setting_told" | "good_showing" }
    ]
  },
  "character_consistency": {
    "score": <1-100>,
    "grade": "<A/B/C/D/F>",
    "summary": "<one sentence>",
    "issues": [
      { "character": "<name>", "excerpt": "<exact quote>", "issue": "<inconsistency or note>", "type": "behavior_shift" | "voice_drift" | "motivation_unclear" | "strong_consistency" }
    ]
  },
  "top_priorities": ["<actionable fix 1>", "<actionable fix 2>", "<actionable fix 3>"]
}`,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: "object",
        properties: {
          overall_score: { type: "number" },
          overall_summary: { type: "string" },
          pacing: { type: "object" },
          dialogue: { type: "object" },
          show_vs_tell: { type: "object" },
          character_consistency: { type: "object" },
          top_priorities: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json({ success: true, feedback: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});