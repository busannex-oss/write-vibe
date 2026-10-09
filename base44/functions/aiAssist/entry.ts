import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { withGuard } from '../../shared/guard.ts';

// Server-side gateway for the app's built-in AI features. Requires a signed-in
// user, caps input size, and enforces a per-user daily allowance per operation.
const DAILY_LIMITS: Record<string, number> = {
  InvokeLLM: 150,
  GenerateImage: 30,
  GenerateSpeech: 20,
  TranscribeAudio: 30,
};
const ALLOWED_MODELS = ['gemini_3_flash', 'claude_sonnet_4_6'];
const usage = new Map<string, { day: string; count: number }>();

function overLimit(userId: string, op: string) {
  const day = new Date().toISOString().slice(0, 10);
  const key = `${userId}:${op}`;
  const entry = usage.get(key);
  const count = entry && entry.day === day ? entry.count : 0;
  if (count >= DAILY_LIMITS[op]) return true;
  usage.set(key, { day, count: count + 1 });
  return false;
}

const str = (v: unknown, max: number) => String(v ?? '').slice(0, max);
const urls = (v: unknown) =>
  (Array.isArray(v) ? v : v ? [v] : []).filter((u) => typeof u === 'string' && /^https?:\/\//.test(u)).slice(0, 5);

const guarded = withGuard('aiAssist', 120, handler);

export default async function (req: Request): Promise<Response> {
  return guarded(req);
}

async function handler(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Please sign in to use AI features' }, { status: 401 });

    const { op, params = {} } = await req.json().catch(() => ({}));
    if (!DAILY_LIMITS[op]) return Response.json({ error: 'Unsupported operation' }, { status: 400 });
    if (user.role !== 'admin' && overLimit(user.id, op)) {
      return Response.json({ error: 'Daily AI limit reached. Please try again tomorrow.' }, { status: 429 });
    }

    const core = base44.asServiceRole.integrations.Core;
    let result;
    if (op === 'InvokeLLM') {
      const model = ALLOWED_MODELS.includes(params.model) ? params.model : undefined;
      const web = !!params.add_context_from_internet;
      result = await core.InvokeLLM({
        prompt: str(params.prompt, 60000),
        response_json_schema: params.response_json_schema || undefined,
        file_urls: urls(params.file_urls).length ? urls(params.file_urls) : undefined,
        add_context_from_internet: web,
        model: web ? 'gemini_3_flash' : model,
      });
    } else if (op === 'GenerateImage') {
      result = await core.GenerateImage({
        prompt: str(params.prompt, 4000),
        existing_image_urls: urls(params.existing_image_urls).length ? urls(params.existing_image_urls) : undefined,
      });
    } else if (op === 'GenerateSpeech') {
      result = await core.GenerateSpeech({ text: str(params.text, 5000), voice: params.voice ? str(params.voice, 20) : undefined });
    } else {
      const audio = urls(params.audio_url)[0];
      if (!audio) return Response.json({ error: 'Missing audio' }, { status: 400 });
      result = await core.TranscribeAudio({ audio_url: audio });
    }
    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}