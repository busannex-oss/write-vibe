import { format, parseISO, isValid } from "date-fns";

const safeDate = (value) => {
  if (!value) return null;
  const d = typeof value === "string" ? parseISO(value) : new Date(value);
  return isValid(d) ? d : null;
};

export const dayKey = (date) => format(date, "yyyy-MM-dd");

export const EVENT_STYLES = {
  release:    { label: "Release Date",   dot: "bg-emerald-400", chip: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  kdp:        { label: "Amazon KDP",     dot: "bg-sky-400",     chip: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  acx:        { label: "Audiobook ACX",  dot: "bg-violet-400",  chip: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  social:     { label: "Social Post",    dot: "bg-amber-400",   chip: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
};

/** Build a flat list of calendar events from books and social posts. */
export function buildTimelineEvents(books = [], posts = []) {
  const events = [];

  books.forEach((book) => {
    const release = safeDate(book.website_config?.release_date);
    if (release) {
      events.push({ id: `${book.id}-release`, date: release, type: "release", title: `${book.title} launches`, meta: book.status });
    }
    const kdp = safeDate(book.amazon_kdp_submitted_at);
    if (kdp) {
      events.push({ id: `${book.id}-kdp`, date: kdp, type: "kdp", title: `${book.title} — KDP submitted`, meta: book.amazon_kdp_status });
    }
    const acx = safeDate(book.amazon_acx_submitted_at);
    if (acx) {
      events.push({ id: `${book.id}-acx`, date: acx, type: "acx", title: `${book.title} — ACX submitted`, meta: book.amazon_acx_status });
    }
  });

  posts.forEach((post) => {
    const date = safeDate(post.posted_at) || safeDate(post.created_date);
    if (!date) return;
    events.push({
      id: `post-${post.id}`,
      date,
      type: "social",
      title: (post.caption || "Social post").slice(0, 70),
      meta: `${post.status} · ${(post.platforms || []).join(", ")}`,
    });
  });

  return events.sort((a, b) => a.date - b.date);
}

/** Group events by yyyy-MM-dd for fast day lookups. */
export function groupByDay(events) {
  return events.reduce((acc, event) => {
    const key = dayKey(event.date);
    (acc[key] = acc[key] || []).push(event);
    return acc;
  }, {});
}