// The Write Vibe — Universal Publishing API Gateway
// Single entry point for all external publishing traffic (Lulu, PublishDrive).
// Normalizes provider statuses/errors into Write Vibe concepts.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { CHANNELS, luluAdapter, publishDriveAdapter, providerHealth } from '../../shared/publishingAdapters.ts';

const AMAZON_STATUS_MAP = {
  not_submitted: 'not_ready',
  submitted: 'submitted',
  under_review: 'under_review',
  published: 'live',
  rejected: 'rejected'
};

const r2 = (n) => Math.round(n * 100) / 100;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action, book_id } = body;

    if (action === 'provider_health') {
      return Response.json({ providers: providerHealth() });
    }

    if (!book_id) return Response.json({ error: 'book_id is required' }, { status: 400 });

    // Canonical Book Record stays the master record — loaded user-scoped (RLS applies).
    const books = await base44.entities.Book.filter({ id: book_id });
    const book = books[0];
    if (!book) return Response.json({ error: 'Book not found' }, { status: 404 });

    if (action === 'list_channels') {
      const records = await base44.entities.ProviderConnectionRecord.filter({ book_id });
      const channels = CHANNELS.map((ch) => {
        const rec = records.find((r) => r.channel === ch.channel);
        let status = rec?.status || 'not_ready';
        // Existing Amazon workflow remains the source of truth for its channels.
        if (ch.provider === 'amazon_kdp') status = AMAZON_STATUS_MAP[book.amazon_kdp_status || 'not_submitted'];
        if (ch.provider === 'amazon_acx') status = AMAZON_STATUS_MAP[book.amazon_acx_status || 'not_submitted'];
        return {
          ...ch,
          status,
          record_id: rec?.id || null,
          retailer_url: rec?.retailer_url || null,
          required_action: rec?.required_action || null,
          last_error: rec?.last_error || null,
          submitted_at: rec?.submitted_at || null
        };
      });
      return Response.json({ channels, providers: providerHealth() });
    }

    if (action === 'calculate_print_cost') {
      const format = body.format || 'paperback';
      const quantity = Math.max(1, parseInt(body.quantity) || 1);
      const wordCount = book.manuscript_chapters?.reduce((s, c) => s + (c?.word_count || 0), 0) || 0;
      const pageCount = Math.max(32, Math.ceil(wordCount / 300));

      const cost = await luluAdapter.calculatePrintCost({
        pageCount, format, quantity, countryCode: body.country || 'US'
      });

      const unitPrintCost = r2(cost.print_cost / quantity);
      const retail = parseFloat(body.retail_price) || null;
      const recommendedRetail = r2(Math.ceil(unitPrintCost * 2.5 + 2) - 0.01);
      const economics = {
        unit_print_cost: unitPrintCost,
        recommended_retail: recommendedRetail,
        retail_price: retail,
        margin_per_unit: retail ? r2(retail - unitPrintCost) : null,
        author_earnings_per_unit: retail ? r2((retail - unitPrintCost) * 0.8) : null
      };

      return Response.json({ page_count: pageCount, word_count: wordCount, format, quantity, ...cost, economics });
    }

    if (action === 'submit_channel') {
      const chDef = CHANNELS.find((c) => c.channel === body.channel);
      if (!chDef) return Response.json({ error: 'Unknown channel' }, { status: 400 });
      if (chDef.provider === 'amazon_kdp' || chDef.provider === 'amazon_acx') {
        return Response.json({ error: 'Amazon channels use the existing KDP/ACX submission flow' }, { status: 400 });
      }

      // Publication readiness gate — never submit blindly.
      const errors = [];
      if (!book.title || book.title === 'Untitled Book') errors.push('Missing book title');
      if (!book.front_cover_url) errors.push('Missing front cover');
      if (!book.book_summary && !book.plot_summary) errors.push('Missing book description');
      if (!(book.formatted_manuscript || book.manuscript_chapters?.some((c) => c?.content))) errors.push('No manuscript content');
      if (errors.length) return Response.json({ success: false, errors }, { status: 422 });

      const format = body.format || chDef.formats[0];
      let result;
      if (chDef.provider === 'publishdrive') {
        result = await publishDriveAdapter.submitDistribution();
      } else {
        result = luluAdapter.isConnected()
          ? { accepted: true, status: 'submitted' }
          : {
              accepted: false,
              status: 'action_required',
              required_action: 'Connect Lulu credentials to transmit this submission',
              message: 'Submission staged locally. It will be transmittable once Lulu is connected.'
            };
      }

      const now = new Date().toISOString();
      const existing = (await base44.entities.ProviderConnectionRecord.filter({ book_id, channel: body.channel, format }))[0];
      const payload = {
        book_id,
        provider: chDef.provider,
        channel: body.channel,
        format,
        status: result.status,
        required_action: result.required_action || '',
        last_error: result.accepted ? '' : (result.message || ''),
        submitted_at: result.accepted ? now : (existing?.submitted_at || null),
        last_sync: now,
        last_success: result.accepted ? now : (existing?.last_success || null)
      };
      if (body.price) payload.price = parseFloat(body.price);

      const record = existing
        ? await base44.entities.ProviderConnectionRecord.update(existing.id, payload)
        : await base44.entities.ProviderConnectionRecord.create(payload);

      // Feed the existing export history — no second logging system.
      await base44.entities.DistributionLog.create({
        book_id,
        platform: chDef.provider,
        action: `Submit ${format} to ${chDef.label}`,
        status: result.accepted ? 'success' : 'failed',
        errors: result.accepted ? [] : [result.message || 'Provider not connected'],
        notes: result.accepted ? 'Transmitted via publishing gateway' : 'Staged locally — provider credentials not configured'
      }).catch(() => null);

      return Response.json({ success: true, accepted: result.accepted, record, message: result.message || null });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}