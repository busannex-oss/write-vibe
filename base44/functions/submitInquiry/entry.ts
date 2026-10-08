import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Public contact / partnership forms. Recipients are fixed server-side.
const RECIPIENTS: Record<string, string> = {
  contact: 'support@writevibe.ai',
  investor: 'partnerships@writevibe.com',
};
const clean = (v: unknown, max = 200) => String(v ?? '').replace(/[\r\n]+/g, ' ').slice(0, max);

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { kind, form = {} } = await req.json().catch(() => ({}));
    const to = RECIPIENTS[kind];
    if (!to) return Response.json({ error: 'Invalid form' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.email || ''))) {
      return Response.json({ error: 'A valid email is required' }, { status: 400 });
    }

    let subject: string, body: string;
    if (kind === 'contact') {
      subject = `Contact Form: ${clean(form.name, 100)}`;
      body = `Name: ${clean(form.name)}\nEmail: ${clean(form.email)}\n\nMessage:\n${String(form.message ?? '').slice(0, 5000)}`;
    } else {
      subject = `New Investor/Partner Inquiry from ${clean(form.firstName, 60)} ${clean(form.lastName, 60)} - ${clean(form.company, 100)}`;
      body = [
        `Name: ${clean(form.firstName)} ${clean(form.lastName)}`,
        `Company: ${clean(form.company)}`, `Title: ${clean(form.title)}`,
        `Email: ${clean(form.email)}`, `Phone: ${clean(form.phone, 40)}`,
        `Investment/Budget Range: ${clean(form.investmentRange, 40)}`,
        `Partnership Type: ${clean(form.partnershipType, 40)}`, `Timeline: ${clean(form.timeline, 40)}`,
        '', 'Goals:', String(form.goals ?? '').slice(0, 5000),
      ].join('\n');
    }

    await base44.asServiceRole.integrations.Core.SendEmail({ to, subject, body });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}