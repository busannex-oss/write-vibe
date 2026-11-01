import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { withGuard } from '../../shared/guard.ts';

const DAILY_LIMIT = 5;

const handler = async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const isPaid = user.subscription_tier && !['trial', 'free'].includes(user.subscription_tier);
    if (user.role !== 'admin' && !isPaid) {
      return Response.json({ error: 'Music generation is available on paid plans.' }, { status: 403 });
    }

    if (user.role !== 'admin') {
      const since = new Date(Date.now() - 86400_000).toISOString();
      const used = await base44.asServiceRole.entities.SystemTrace.count({
        source: 'generatePromoMusic', user_id: user.id, kind: 'function_call', status: 'ok', created_date: { $gte: since },
      });
      if (used >= DAILY_LIMIT) {
        return Response.json({ error: `Daily music limit reached (${DAILY_LIMIT} tracks per day). Please try again tomorrow.` }, { status: 429 });
      }
    }

    const { prompt, provider, bookTitle } = await req.json();
    if (typeof prompt === 'string' && prompt.length > 2000) {
      return Response.json({ error: 'Music prompt is too long' }, { status: 400 });
    }
    if (!prompt) {
      return Response.json({ error: 'Missing music prompt' }, { status: 400 });
    }

    // Find the MiniMax API key
    const env = Deno.env.toObject();
    let apiKey = env.MINIMAX_API_KEY || env.MINIMAX_KEY || env.minimax_api_key || env.mk_1THinSIormYzZE9vDTdTPXnh;
    if (!apiKey) {
      for (const [, value] of Object.entries(env)) {
        if (typeof value === 'string' && value.startsWith('mk_') && value.length > 20) {
          apiKey = value;
          break;
        }
      }
    }
    if (!apiKey) {
      return Response.json({ error: 'Music generation is not configured.' }, { status: 500 });
    }

    // MiniMax music generation API — music-2.6 model
    const response = await fetch('https://api.minimax.io/v1/music_generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'music-2.6',
        prompt: prompt,
        lyrics: '[instrumental]',
        audio_setting: {
          sample_rate: 44100,
          bitrate: 256000,
          format: 'mp3'
        }
      })
    });

    const data = await response.json();

    if (data.base_resp?.status_code !== 0) {
      return Response.json({ error: data.base_resp?.status_msg || 'Music generation failed' }, { status: 400 });
    }

    if (data.data?.audio) {
      // Decode hex-encoded audio to bytes
      const hexString = data.data.audio;
      const bytes = new Uint8Array(hexString.length / 2);
      for (let i = 0; i < hexString.length; i += 2) {
        bytes[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
      }

      // Upload to Base44 storage
      const file = new File([bytes], `promo-music-${Date.now()}.mp3`, { type: 'audio/mpeg' });
      const uploadResult = await base44.integrations.Core.UploadFile({ file });

      return Response.json({
        success: true,
        audioUrl: uploadResult.file_url,
        provider: provider || 'minimax_music',
        duration: data.extra_info?.music_duration
      });
    }

    return Response.json({ error: 'No audio in response', details: JSON.stringify(data) }, { status: 500 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};

Deno.serve(withGuard('generatePromoMusic', 3, handler));