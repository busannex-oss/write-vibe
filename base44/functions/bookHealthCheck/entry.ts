import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { book_id } = body;

    const allBooks = await base44.entities.Book.list();
    const book = allBooks.find(b => b.id === book_id);
    if (!book) return Response.json({ error: 'Book not found' }, { status: 404 });

    // Build context snapshot
    const chapters = book.manuscript_chapters || [];
    const outline = book.table_of_contents || book.detailed_outline || [];
    const characters = book.characters || [];
    const totalWords = chapters.reduce((sum, c) => sum + (c.word_count || (c.content?.split(/\s+/).length) || 0), 0);

    // Sample up to 3000 words from manuscript for readability analysis
    let manuscriptSample = '';
    for (const ch of chapters) {
      if (ch.content) {
        manuscriptSample += ch.content.slice(0, 1000) + '\n\n';
        if (manuscriptSample.length > 3000) break;
      }
    }

    const prompt = `You are a professional manuscript editor and literary analyst. Analyze this book project for The Write Vibe self-publishing platform.

BOOK METADATA:
- Title: ${book.title || 'Untitled'}
- Genre/Category: ${book.category || 'Unknown'}
- Status: ${book.status || 'draft'}
- Word Count: ${totalWords.toLocaleString()}
- Chapters Written: ${chapters.length}
- Chapters Outlined: ${outline.length}
- Characters: ${characters.length} (${characters.map(c => c.name).join(', ') || 'none'})

OUTLINE:
${outline.slice(0, 10).map((ch, i) => `${i+1}. ${ch.chapter_title || ch.title || 'Untitled'}: ${ch.summary || ''}`).join('\n') || 'No outline available'}

MANUSCRIPT SAMPLE (first ~3000 words):
${manuscriptSample || 'No manuscript content yet'}

Perform a comprehensive Book Health Check with these analyses:

1. NARRATIVE CONSISTENCY — Check for plot holes, character consistency, timeline issues, continuity errors
2. READABILITY SCORES — Estimate Flesch-Kincaid grade level, sentence complexity, vocabulary sophistication, pacing
3. STRUCTURAL GAPS — Missing scenes, chapter imbalance, act structure alignment, pacing issues
4. CHARACTER DEVELOPMENT — Arc completeness, voice consistency, supporting cast depth
5. PUBLISHING READINESS — Overall readiness for professional publication

Return a JSON object with this exact structure:
{
  "overall_health_score": number (0-100),
  "overall_grade": "A" | "B" | "C" | "D" | "F",
  "summary": "2-3 sentence executive summary of the book's current health",
  "readability": {
    "score": number (0-100),
    "grade_level": string (e.g. "Grade 8", "College Level"),
    "flesch_reading_ease": number (0-100),
    "avg_sentence_length": number,
    "vocabulary_level": "Elementary" | "Middle Grade" | "Young Adult" | "Adult" | "Academic",
    "pacing": "Too slow" | "Slow" | "Good" | "Fast" | "Too fast",
    "notes": string
  },
  "narrative_consistency": {
    "score": number (0-100),
    "issues": [{ "severity": "critical" | "major" | "minor", "title": string, "description": string }],
    "notes": string
  },
  "structure": {
    "score": number (0-100),
    "act_structure": "Three-Act" | "Hero's Journey" | "Five-Act" | "Unclear",
    "chapter_balance": "Well-balanced" | "Uneven" | "Needs work",
    "word_count_assessment": "Too short" | "Short" | "Good" | "Long" | "Too long",
    "gaps": [{ "location": string, "description": string, "recommendation": string }],
    "notes": string
  },
  "character_development": {
    "score": number (0-100),
    "protagonist_arc": "Strong" | "Good" | "Weak" | "Missing",
    "supporting_cast": "Rich" | "Adequate" | "Thin" | "Missing",
    "issues": [{ "character": string, "issue": string }],
    "notes": string
  },
  "publishing_readiness": {
    "score": number (0-100),
    "ready_for": "First Draft Review" | "Beta Readers" | "Professional Edit" | "Proofreading" | "Publishing",
    "blockers": [string],
    "next_steps": [string]
  },
  "recommendations": [
    { "priority": "critical" | "high" | "medium" | "low", "category": string, "title": string, "action": string }
  ]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: "object",
        properties: {
          overall_health_score: { type: "number" },
          overall_grade: { type: "string" },
          summary: { type: "string" },
          readability: { type: "object" },
          narrative_consistency: { type: "object" },
          structure: { type: "object" },
          character_development: { type: "object" },
          publishing_readiness: { type: "object" },
          recommendations: { type: "array" }
        }
      }
    });

    return Response.json({ success: true, analysis: result, word_count: totalWords, chapters_count: chapters.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});