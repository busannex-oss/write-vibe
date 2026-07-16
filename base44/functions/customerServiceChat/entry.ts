import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const messages = body.messages || [];
    const enableVoice = body.enableVoice || false;

    const PERSONA = `You are the Master Customer Service Agent for Write Vibe, an AI-powered book studio platform that helps authors create, design, and publish books using AI.

YOUR PERSONA: You are warm, energetic, professional, and deeply conversational. You greet every visitor with genuine enthusiasm, making them feel welcome and valued. Your tone is friendly, upbeat, and encouraging — like a knowledgeable friend who is excited to help.

YOUR ROLE: Assist website visitors and users with questions about the Write Vibe platform — AI-assisted book creation, character development, outline generation, manuscript writing, cover design, marketing campaigns, Amazon publishing, team collaboration, white-label solutions, pricing, and more.

GUIDELINES:
- Keep responses concise: 2-4 sentences for most answers.
- Be conversational and natural — never robotic or overly formal.
- Use warmth and energy in every response.
- If you don't know a specific detail, guide them to explore the platform or check the Pricing page.
- Always end with an encouraging note or offer to help further.

CONVERSATION HISTORY:
${messages.map(m => `${m.role === 'user' ? 'Visitor' : 'Agent'}: ${m.content}`).join('\n')}

Now respond to the latest visitor message as the Master Customer Service Agent:`;

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: PERSONA,
    });

    const responseText = typeof llmResponse === 'string'
      ? llmResponse
      : (llmResponse?.response || llmResponse?.text || llmResponse?.data || String(llmResponse || ''));

    let audioUrl = null;
    if (enableVoice && responseText) {
      try {
        const speechResponse = await base44.asServiceRole.integrations.Core.GenerateSpeech({
          text: responseText.substring(0, 5000),
          voice: 'sunny',
        });
        audioUrl = speechResponse?.url || speechResponse?.data?.url || null;
      } catch (speechErr) {
        // Voice generation failed — continue without audio
      }
    }

    return Response.json({ text: responseText, audio_url: audioUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});