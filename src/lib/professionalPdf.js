// Shared professional PDF theme for all generated documents.
// Brand palette: deep ink navy + amber/gold accents — matches the Write Vibe app.
// All helpers are unit-agnostic (work in mm or pt) by deriving a scale factor
// from the page width (a4 mm = 210, letter pt = 612).

export const PALETTE = {
  ink: [11, 17, 32],        // #0B1120
  inkDeep: [7, 11, 22],     // #070B16
  inkLight: [30, 41, 59],   // #1E293B
  gold: [245, 158, 11],     // #F59E0B
  goldDark: [217, 119, 6],  // #D97706
  blue: [59, 130, 246],     // #3B82F6
  blueDark: [30, 58, 138],  // #1E3A8A
  blueLight: [147, 197, 253],
  emerald: [16, 185, 129],  // #10B981
  body: [51, 65, 85],       // #334155
  bodyLight: [71, 85, 105], // #475569
  muted: [100, 116, 139],   // #64748B
  border: [226, 232, 240],  // #E2E8F0
  white: [255, 255, 255],
};

// Scale factor: converts mm-ish design values to the doc's unit (pt docs are ~2.835x).
export function scale(pdf) {
  return pdf.internal.pageSize.getWidth() > 300 ? 2.835 : 1;
}

export function dims(pdf, marginMM = 18) {
  const u = scale(pdf);
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const margin = marginMM * u;
  return { pw, ph, u, margin, contentW: pw - 2 * margin };
}

// ── COVER PAGE (dark branded) ──────────────────────────────────────────────
export function coverPage(pdf, opts = {}) {
  const { pw, ph, u, margin, contentW } = dims(pdf, 18);
  const accent = opts.accent || PALETTE.gold;

  // background
  pdf.setFillColor(...PALETTE.inkDeep);
  pdf.rect(0, 0, pw, ph, "F");
  // left accent stripe
  pdf.setFillColor(...accent);
  pdf.rect(0, 0, 6 * u, ph, "F");

  // brand block (top-right)
  const bx = pw - 62 * u, by = 14 * u;
  pdf.setFillColor(...PALETTE.inkLight);
  pdf.roundedRect(bx, by, 48 * u, 16 * u, 2 * u, 2 * u, "F");
  pdf.setFillColor(...accent);
  pdf.roundedRect(bx + 1.5 * u, by + 2 * u, 4 * u, 12 * u, 1 * u, 1 * u, "F");
  pdf.setFontSize(8); pdf.setFont("helvetica", "bold"); pdf.setTextColor(...PALETTE.white);
  pdf.text(opts.brandLabel || "WRITE VIBE", bx + 10 * u, by + 7.5 * u);
  pdf.setFontSize(5.5); pdf.setFont("helvetica", "normal"); pdf.setTextColor(...PALETTE.muted);
  pdf.text(opts.brandSub || "AI BOOK CREATION PLATFORM", bx + 10 * u, by + 12 * u);

  // badge
  let titleY = 70 * u;
  if (opts.badgeLabel) {
    const badgeH = 9 * u;
    pdf.setFillColor(...PALETTE.inkLight);
    pdf.roundedRect(margin, 30 * u, 92 * u, badgeH, 2 * u, 2 * u, "F");
    pdf.setFillColor(...accent);
    pdf.rect(margin, 30 * u, 3 * u, badgeH, "F");
    pdf.setFontSize(7); pdf.setFont("helvetica", "bold"); pdf.setTextColor(...accent);
    pdf.text(opts.badgeLabel, margin + 7 * u, 30 * u + 6 * u);
    titleY = 60 * u;
  }

  // title
  const titleSize = opts.titleSize || 24;
  pdf.setFontSize(titleSize); pdf.setFont("helvetica", "bold"); pdf.setTextColor(...PALETTE.white);
  const titleLines = pdf.splitTextToSize(opts.title || "Document", contentW - 6 * u);
  pdf.text(titleLines, margin, titleY);
  let cursorY = titleY + titleLines.length * titleSize * 1.22;

  // subtitle
  if (opts.subtitle) {
    pdf.setFontSize(12); pdf.setFont("helvetica", "italic"); pdf.setTextColor(...accent);
    const subLines = pdf.splitTextToSize(opts.subtitle, contentW - 6 * u);
    pdf.text(subLines, margin, cursorY + 4 * u);
    cursorY += subLines.length * 12 * 1.3 + 4 * u;
  }

  // author
  if (opts.author) {
    pdf.setFontSize(11); pdf.setFont("helvetica", "normal"); pdf.setTextColor(...PALETTE.muted);
    pdf.text(`by ${opts.author}`, margin, cursorY + 8 * u);
    cursorY += 14 * u;
  }

  // gold + blue rule
  const ruleY = cursorY + 8 * u;
  pdf.setFillColor(...accent);
  pdf.rect(margin, ruleY, 50 * u, 0.9 * u, "F");
  pdf.setFillColor(...PALETTE.blue);
  pdf.rect(margin + 52 * u, ruleY, contentW - 52 * u, 0.9 * u, "F");

  // metadata box
  if (opts.meta && opts.meta.length) {
    const metaY = ruleY + 8 * u;
    const rowH = 9 * u;
    const boxH = 12 * u + opts.meta.length * rowH;
    pdf.setFillColor(...PALETTE.inkLight);
    pdf.roundedRect(margin, metaY, contentW, boxH, 3 * u, 3 * u, "F");
    pdf.setFillColor(...PALETTE.blueDark);
    pdf.roundedRect(margin, metaY, contentW, 8 * u, 3 * u, 3 * u, "F");
    pdf.rect(margin, metaY + 4 * u, contentW, 4 * u, "F");
    pdf.setFontSize(6.5); pdf.setFont("helvetica", "bold"); pdf.setTextColor(...PALETTE.blueLight);
    pdf.text("DOCUMENT METADATA", margin + 4 * u, metaY + 5.5 * u);
    opts.meta.forEach((item, i) => {
      const iy = metaY + 14 * u + i * rowH;
      pdf.setFontSize(6); pdf.setFont("helvetica", "normal"); pdf.setTextColor(...PALETTE.muted);
      pdf.text(String(item[0]), margin + 4 * u, iy);
      pdf.setFontSize(8); pdf.setFont("helvetica", "bold"); pdf.setTextColor(...PALETTE.white);
      pdf.text(String(item[1]), margin + 4 * u, iy + 4.5 * u);
    });
  }

  // footer
  pdf.setFontSize(6.5); pdf.setFont("helvetica", "normal"); pdf.setTextColor(...PALETTE.inkLight);
  pdf.text(
    "PROPRIETARY & CONFIDENTIAL — Unauthorized reproduction or distribution is strictly prohibited.",
    pw / 2, ph - 8 * u, { align: "center" }
  );
}

// ── PAGE CHROME ────────────────────────────────────────────────────────────
export function pageHeader(pdf, opts = {}) {
  const { pw, u, margin } = dims(pdf, opts.marginMM || 18);
  const accent = opts.accent || PALETTE.gold;
  const barH = 13 * u;
  pdf.setFillColor(...PALETTE.inkDeep);
  pdf.rect(0, 0, pw, barH, "F");
  pdf.setFillColor(...accent);
  pdf.rect(0, barH - 0.5 * u, pw, 0.5 * u, "F");
  pdf.setFontSize(6.5); pdf.setFont("helvetica", "bold"); pdf.setTextColor(...accent);
  pdf.text(opts.headerLabel || "WRITE VIBE  ·  CONFIDENTIAL", margin, 9 * u);
  if (opts.headerRight) {
    pdf.setFont("helvetica", "normal"); pdf.setTextColor(...PALETTE.muted);
    pdf.text(String(opts.headerRight).slice(0, 50), pw - margin, 9 * u, { align: "right" });
  }
}

export function pageFooter(pdf, opts = {}) {
  const { pw, ph, u, margin } = dims(pdf, opts.marginMM || 18);
  const barH = 10 * u;
  pdf.setFillColor(...PALETTE.inkDeep);
  pdf.rect(0, ph - barH, pw, barH, "F");
  pdf.setFillColor(...opts.accent || PALETTE.gold);
  pdf.rect(0, ph - barH, pw, 0.5 * u, "F");
  pdf.setFontSize(6.5); pdf.setTextColor(...PALETTE.muted);
  if (opts.footerLeft) pdf.text(String(opts.footerLeft), margin, ph - 4 * u);
  if (opts.pageNum) pdf.text(`Page ${opts.pageNum}`, pw / 2, ph - 4 * u, { align: "center" });
  pdf.text(`© ${new Date().getFullYear()} ${opts.brandLabel || "Write Vibe"}`, pw - margin, ph - 4 * u, { align: "right" });
}

// Detect simple heading lines (ALL CAPS, Article/Section/Chapter, numbered)
function isHeading(line) {
  if (/^(article|section|chapter|phase|part)\s+[\divx]+/i.test(line)) return true;
  if (/^\d+(\.\d+)*\s+[A-Z]/.test(line)) return true;
  if (/^[A-Z][A-Z\s&:'()\/\-]{5,}$/.test(line) && line.length < 80) return true;
  return false;
}

// ── CONTENT RENDERER (heading + body, auto-paginated) ────────────────────
export function renderContent(pdf, content, opts = {}) {
  const { pw, ph, u, margin, contentW } = dims(pdf, opts.marginMM || 18);
  const accent = opts.accent || PALETTE.gold;
  const fontSize = opts.fontSize || 10;
  const lineHeight = fontSize * 1.55;
  const bottomMargin = 16 * u;
  const baseOpts = { ...opts, accent };

  pageHeader(pdf, baseOpts);
  let y = 28 * u;
  let pageNum = opts.startPage || 1;

  const ensureSpace = (needed) => {
    if (y + needed > ph - bottomMargin - 10 * u) {
      pageFooter(pdf, { ...baseOpts, pageNum });
      pdf.addPage();
      pageNum++;
      pageHeader(pdf, baseOpts);
      y = 28 * u;
    }
  };

  const lines = String(content || "").split("\n");

  lines.forEach((raw) => {
    const line = raw.trim();
    if (!line) { y += lineHeight * 0.35; return; }

    if (isHeading(line)) {
      ensureSpace(26 * u);
      if (y > 30 * u) y += 5 * u;
      const hSize = fontSize + 3;
      const barH = hSize + 7 * u;
      const barTop = y - hSize + 1 * u;
      pdf.setFillColor(...PALETTE.inkLight);
      pdf.rect(margin, barTop, contentW, barH, "F");
      pdf.setFillColor(...accent);
      pdf.rect(margin, barTop, 3 * u, barH, "F");
      pdf.setFontSize(hSize); pdf.setFont("helvetica", "bold"); pdf.setTextColor(...accent);
      const hLines = pdf.splitTextToSize(line, contentW - 9 * u);
      pdf.text(hLines, margin + 7 * u, y + 1 * u);
      y += barH + 4 * u;
      pdf.setFont("helvetica", "normal");
    } else {
      pdf.setFontSize(fontSize); pdf.setFont("helvetica", "normal"); pdf.setTextColor(...PALETTE.body);
      const wrapped = pdf.splitTextToSize(line, contentW);
      wrapped.forEach((wl) => {
        ensureSpace(lineHeight);
        pdf.text(wl, margin, y);
        y += lineHeight;
      });
    }
  });

  pageFooter(pdf, { ...baseOpts, pageNum });
  return pageNum;
}