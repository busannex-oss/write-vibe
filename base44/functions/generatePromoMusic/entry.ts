import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, provider, duration, bookTitle } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Missing music prompt' }, { status: 400 });
    }

    const apiKey = Deno.env.get("MINIMAX_API_KEY");
    if (!apiKey) {
      return Response.json({ error: 'Music API key not configured. Set MINIMAX_API_KEY in app settings.' }, { status: 500 });
    }

    // MiniMax music generation API (music-01 model)
    const response = await fetch('https://api.minimaxi.com/v1/music_generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'music-01-customer',
        prompt: prompt,
        duration: parseInt(duration) || 30,
        output_format: 'mp3'
      })
    });

    const data = await response.json();

    if (data.audio_url) {
      return Response.json({
        success: true,
        audioUrl: data.audio_url,
        provider: provider || 'minimax_music'
      });
    } else if (data.base_resp?.status_msg) {
      return Response.json({ error: data.base_resp.status_msg }, { status: 400 });
    } else {
      return Response.json({ error: 'Music generation failed', details: JSON.stringify(data) }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});