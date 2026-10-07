import { base44 } from "@/api/base44Client";

// White papers and business plans share Document type "white_paper";
// business plans are distinguished by the "[BIZPLAN]" title prefix.
const isBizPlan = (title) => (title || "").startsWith("[BIZPLAN]");

async function siblings(title) {
  const all = await base44.entities.Document.filter({ type: "white_paper", book_id: "admin" });
  return all.filter((d) => isBizPlan(d.title) === isBizPlan(title));
}

// Saves a brand-new version: next version number, marked current, previous versions preserved.
export async function createDocVersion(data) {
  const doc = { type: "white_paper", book_id: "admin", ...data };
  const existing = await siblings(doc.title);
  const next = Math.max(0, ...existing.map((d) => d.version_number || 0)) + 1;
  await Promise.all(existing.filter((d) => d.is_current).map((d) => base44.entities.Document.update(d.id, { is_current: false })));
  return base44.entities.Document.create({
    ...doc,
    version_number: next,
    is_current: true,
    generated_at: new Date().toISOString()
  });
}

// Editing never overwrites — it saves the edited copy as a new version.
export async function reviseDocVersion(original, changes) {
  const { id, created_date, updated_date, created_by, created_by_id, version_number, is_current, generated_at, ...rest } = original;
  return createDocVersion({ ...rest, ...changes });
}