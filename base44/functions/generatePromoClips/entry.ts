import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const isPaid = user.subscription_tier && !['trial', 'free'].includes(user.subscription_tier);
    if (user.role !== 'admin' && !isPaid) {
      return Response.json({ error: 'Promo video generation is available on paid plans.' }, { status: 403 });
    }

    const { scenes, bookTitle, genre, mood, aspectRatio } = await req.json().catch(() => ({}));
    if (!Array.isArray(scenes) || !scenes.length) {
      return Response.json({ error: 'No scenes provided' }, { status: 400 });
    }

    const picked = scenes.slice(0, 4);
    const results = await Promise.allSettled(picked.map((s) =>
      base44.asServiceRole.integrations.Core.GenerateVideo({
        prompt: `Cinematic book trailer shot for "${bookTitle}" (${genre || 'fiction'}). ${s.visual}. Mood: ${mood || 'dramatic'}. Film-quality lighting, smooth camera movement, no text, no watermarks.`,
        duration: 8,
        aspect_ratio: aspectRatio === '9:16' ? '9:16' : '16:9',
        generate_audio: false,
      })
    ));

    const clips = results.map((r, i) => ({
      scene_number: picked[i].scene_number ?? i + 1,
      narration: picked[i].narration || '',
      url: r.status === 'fulfilled' ? r.value?.url : null,
      error: r.status === 'rejected' ? String(r.reason?.message || r.reason) : null,
    }));

    if (!clips.some((c) => c.url)) {
      return Response.json({ error: clips[0]?.error || 'Video generation failed', clips }, { status: 502 });
    }
    return Response.json({ success: true, clips });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}