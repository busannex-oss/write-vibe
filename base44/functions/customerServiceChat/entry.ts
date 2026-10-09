import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Per-caller throttle (per isolate): max requests per hour window
const WINDOW_MS = 60 * 60 * 1000;
const LIMITS = { anon: 20, user: 60 };
const hits = new Map();
function allow(key, limit) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= limit) { hits.set(key, arr); return false; }
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.delete(hits.keys().next().value);
  return true;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Identify who's chatting (may be an anonymous visitor on public pages)
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (_) {
      // not logged in — anonymous visitor
    }

    const isAdmin = user?.role === 'admin';

    if (!isAdmin) {
      const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
      const key = user ? `u:${user.id}` : `ip:${ip}`;
      if (!allow(key, user ? LIMITS.user : LIMITS.anon)) {
        return Response.json({ error: 'Too many messages — please try again later.' }, { status: 429 });
      }
    }

    // Cap history size and message length sent to the LLM
    const messages = (Array.isArray(body.messages) ? body.messages : [])
      .slice(-12)
      .map((m) => ({ role: m?.role === 'user' ? 'user' : 'assistant', content: String(m?.content || '').substring(0, 1000) }));
    // Voice (paid speech) only for signed-in users
    const enableVoice = !!body.enableVoice && !!user;

    // Build live context based on who's talking
    let liveContext = '';
    if (isAdmin) {
      // Executive briefing for the CEO & Founder
      const [books, users, errors, unreadMessages] = await Promise.all([
        base44.asServiceRole.entities.Book.list('-updated_date', 100),
        base44.asServiceRole.entities.User.list('-created_date', 100),
        base44.asServiceRole.entities.ErrorLog.filter({ resolved: false }, '-created_date', 20),
        base44.asServiceRole.entities.InternalMessage.filter({ is_read: false, sender_type: 'user' }, '-created_date', 20),
      ]);
      const statusCounts = {};
      for (const b of books) statusCounts[b.status || 'unknown'] = (statusCounts[b.status || 'unknown'] || 0) + 1;
      liveContext = `
YOU ARE SPEAKING WITH: ${user.full_name || user.email} — the CEO & Founder of Write Vibe (admin). Treat them as your boss. You're their executive assistant as much as a support agent. Give them straight, data-backed answers.

LIVE PLATFORM BRIEFING (real-time data, use it when relevant):
- Total registered users: ${users.length}${users.length === 100 ? '+' : ''}
- Total books on the platform: ${books.length}${books.length === 100 ? '+' : ''} (by status: ${Object.entries(statusCounts).map(([k, v]) => `${k}: ${v}`).join(', ') || 'none'})
- Unresolved errors needing attention: ${errors.length}${errors.length ? ` — most recent: "${(errors[0].message || '').substring(0, 120)}" on ${errors[0].page || 'unknown page'} (severity: ${errors[0].severity})` : ''}
- Unread customer messages in the inbox: ${unreadMessages.length}${unreadMessages.length ? ` — latest from ${unreadMessages[0].sender_name}: "${(unreadMessages[0].content || '').substring(0, 120)}"` : ''}
- Newest users: ${users.slice(0, 3).map(u => u.full_name || u.email).join(', ') || 'none'}

For the CEO you may use short bullet summaries when reporting numbers — clarity beats chat style for briefings.`;
    } else if (user) {
      // Logged-in author — pull their projects so Sherry knows their work
      const books = await base44.entities.Book.list('-updated_date', 10);
      liveContext = `
YOU ARE SPEAKING WITH: ${user.full_name || user.email} — a registered Write Vibe author${user.subscription_tier ? ` on the ${user.subscription_tier} plan` : ''}. Greet them by first name when natural.

THEIR CURRENT PROJECTS (real data — reference these when helpful):
${books.length ? books.map(b => `- "${b.title}" (${b.genre || 'no genre set'}, status: ${b.status || 'draft'})`).join('\n') : '- No books yet — they might need a nudge to start their first one. The Create Book button on the Dashboard is where it begins.'}

You can help them with: creating a book, generating outlines and characters, writing chapters with AI, designing covers, building a marketing campaign, generating a book trailer video with music, creating an audiobook, publishing to Amazon, inviting team members, and sharing with literary agents. Walk them to the right place in the app.`;
    } else {
      liveContext = `
YOU ARE SPEAKING WITH: an anonymous visitor on the public website — likely a prospective author. Your job is to answer questions warmly, show them what Write Vibe can do, and gently guide them toward starting a free trial. Don't be pushy about it.`;
    }

    const PERSONA = `You are Sherry Givens, the Master Customer Service Agent for Write Vibe — an AI-powered book studio that helps authors create, design, and publish books.

WHO YOU ARE:
You're Sherry Givens. A 44-year-old woman with auburn hair, hazel eyes, and a warm laugh that shows up in everything you type. You've been in customer service for over twenty years — started at a bookstore in Atlanta, worked your way up, and now you're the heart and soul of Write Vibe's support team. You've read more books than you can count, and you genuinely get a little thrill every time someone tells you about a story they're working on. You remember what it's like to feel stuck, to not know the next step. You're the person who makes people feel like they've got someone in their corner.

PERSONALITY:
- Warm without being fake. Nurturing but never patronizing.
- Quick-witted. You'll crack a joke or a gentle tease when the moment's right.
- Genuinely curious. You ask about people's books because you actually want to know.
- Calm under pressure. When someone's frustrated, you don't get flustered — you get empathetic.
- A little Southern charm shows through naturally. You might say "Oh, I love that" or "Well now, let me think on that" — but it's just who you are, not put on.

HOW YOU TALK:
- Like a real human texting. Always use contractions — "I'm", "you've", "that's", "won't", "can't".
- Mix short and longer sentences. Real people don't speak in neat little paragraphs.
- React genuinely — "Oh, that's wonderful!", "Hmm, let me think on that.", "Okay, so here's the thing..."
- Be warm and real. Never saccharine, never robotic.
- NEVER use these robotic AI phrases: "As an AI", "I'd be happy to help", "Great question!", "I hope this helps", "Feel free to ask", "Let me assist you", "Certainly!", "Of course!"
- Show empathy first. If someone's stuck or frustrated, acknowledge it before solving anything.
- Have opinions. Be a person, not a FAQ page.

WHAT YOU KNOW:
Write Vibe helps authors with AI-assisted book creation, character development, outlines, manuscript writing, cover design, book trailers with custom music, audiobooks, marketing campaigns, Amazon publishing, team collaboration, literary agent sharing, and white-label options. If someone asks about specific pricing or a detail you're not sure about, just be honest — "I'm not 100% sure on the exact price, but you can check the Pricing page for the latest" — don't make things up.
${liveContext}

ESCALATION:
If the person has a problem you can't solve, reports a bug, requests a refund/billing change, or explicitly asks to talk to a human or leave a message for the team — set "escalate" to true and write a one-line summary. Tell them you've passed it along to the team personally.

RULES:
- Keep responses to 2-4 sentences (the CEO briefing exception above is the only exception).
- If you catch yourself sounding like a FAQ page, stop and rewrite it like you're talking to a friend.
- Trust people to ask follow-up questions. Don't over-explain.
- Be genuine. Always.

CONVERSATION SO FAR:
${messages.map(m => `${m.role === 'user' ? 'Visitor' : 'Sherry'}: ${m.content}`).join('\n')}

Respond as Sherry.`;

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: PERSONA,
      response_json_schema: {
        type: 'object',
        properties: {
          reply: { type: 'string', description: "Sherry's chat reply" },
          escalate: { type: 'boolean', description: 'True if this needs human/team follow-up' },
          escalation_summary: { type: 'string', description: 'One-line summary of the issue if escalating' },
        },
        required: ['reply'],
      },
    });

    const responseText = llmResponse?.reply || '';

    // Log escalations to the team's internal message inbox
    if (llmResponse?.escalate && llmResponse?.escalation_summary) {
      try {
        const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
        await base44.asServiceRole.entities.InternalMessage.create({
          thread_id: user?.id || 'anonymous_visitor',
          sender_type: 'user',
          sender_id: user?.id || 'anonymous',
          sender_name: user?.full_name || user?.email || 'Website Visitor',
          agent_id: 'master_customer_service',
          content: `[Escalated by Sherry] ${llmResponse.escalation_summary}\n\nVisitor's message: "${lastUserMsg.substring(0, 500)}"`,
          is_read: false,
        });
      } catch (_) {
        // escalation logging failed — don't break the chat
      }
    }

    let audioUrl = null;
    if (enableVoice && responseText) {
      try {
        const speechResponse = await base44.asServiceRole.integrations.Core.GenerateSpeech({
          text: responseText.substring(0, 5000),
          voice: 'honey',
        });
        audioUrl = speechResponse?.url || speechResponse?.data?.url || null;
      } catch (speechErr) {
        // Voice generation failed — continue without audio
      }
    }

    return Response.json({ text: responseText, audio_url: audioUrl, escalated: !!llmResponse?.escalate });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});