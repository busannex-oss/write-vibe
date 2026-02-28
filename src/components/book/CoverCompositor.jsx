import React from "react";

// ─── LAYER SYSTEM ────────────────────────────────────────────────────────────
// Each child of <CoverCanvas> is a discrete layer, just like Photoshop.
// Editing one layer never touches the others.
// ─────────────────────────────────────────────────────────────────────────────

function CoverCanvas({ children }) {
  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {children}
    </div>
  );
}

// Layer 0 — Background image
function BackgroundLayer({ url }) {
  return (
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${url})` }}
    />
  );
}

// Layer 1 — Top vignette (darkens top so title pops)
function TopVignetteLayer({ opacity = 0.55 }) {
  return (
    <div
      className="absolute inset-x-0 top-0"
      style={{
        height: "45%",
        background: `linear-gradient(to bottom, rgba(0,0,0,${opacity}) 0%, rgba(0,0,0,0) 100%)`
      }}
    />
  );
}

// Layer 2 — Bottom vignette (darkens bottom so author name pops)
function BottomVignetteLayer({ opacity = 0.6 }) {
  return (
    <div
      className="absolute inset-x-0 bottom-0"
      style={{
        height: "30%",
        background: `linear-gradient(to top, rgba(0,0,0,${opacity}) 0%, rgba(0,0,0,0) 100%)`
      }}
    />
  );
}

// Layer 3 — Front: Title block
function TitleLayer({ title, subtitle }) {
  const isLong = (title?.length || 0) > 25;
  return (
    <div className="absolute inset-x-0 top-0 flex flex-col items-center px-4 pt-[6%]">
      {/* Title */}
      <h1
        className="text-center font-black leading-none tracking-tight uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
        style={{
          fontSize: isLong ? "clamp(1.4rem,6vw,3.6rem)" : "clamp(1.8rem,7.5vw,4.4rem)",
          color: "#FFFFFF",
          textShadow: "0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.6)",
          fontFamily: '"Georgia", "Times New Roman", serif',
          lineHeight: 1.05,
          letterSpacing: "0.04em",
          wordBreak: "break-word",
          maxWidth: "90%"
        }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p
          className="mt-[3%] text-center font-light tracking-wide"
          style={{
            fontSize: "clamp(0.6rem,2.2vw,1.1rem)",
            color: "rgba(255,255,255,0.88)",
            textShadow: "0 1px 8px rgba(0,0,0,0.8)",
            fontFamily: '"Georgia", serif',
            fontStyle: "italic",
            maxWidth: "80%"
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Layer 4 — Front: Author name strip at bottom
function AuthorNameLayer({ authorName }) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-[5%]"
    >
      {/* Thin gold rule above name */}
      <div
        style={{
          width: "40%",
          height: "1px",
          background: "linear-gradient(to right, transparent, #F5CE62, transparent)",
          marginBottom: "4%"
        }}
      />
      <p
        className="uppercase tracking-[0.25em] font-bold text-center"
        style={{
          fontSize: "clamp(0.55rem,2vw,1rem)",
          color: "#F5CE62",
          textShadow: "0 1px 12px rgba(0,0,0,0.9)",
          fontFamily: '"Georgia", serif',
          letterSpacing: "0.2em"
        }}
      >
        {authorName}
      </p>
    </div>
  );
}

// ── BACK COVER LAYERS ────────────────────────────────────────────────────────

// Layer 5 — Back: full semi-dark overlay for readability
function BackOverlayLayer() {
  return (
    <div
      className="absolute inset-0"
      style={{ background: "rgba(0,0,0,0.38)" }}
    />
  );
}

// Layer 6 — Back: Category badge (top-left)
function CategoryBadgeLayer({ category }) {
  if (!category) return null;
  return (
    <div className="absolute top-[4%] left-[6%]">
      <span
        className="uppercase tracking-widest font-bold px-3 py-1 text-xs rounded-sm"
        style={{
          background: "rgba(245,206,98,0.92)",
          color: "#1a1a1a",
          fontSize: "clamp(0.45rem,1.4vw,0.65rem)",
          letterSpacing: "0.18em",
          boxShadow: "0 1px 6px rgba(0,0,0,0.4)"
        }}
      >
        {category}
      </span>
    </div>
  );
}

// Layer 7 — Back: Book summary text box (centered, upper half)
function SummaryLayer({ summary }) {
  const text = summary || "A compelling story that will keep you turning pages from the very first line to the last.";
  return (
    <div
      className="absolute inset-x-[6%]"
      style={{ top: "14%", maxHeight: "38%" }}
    >
      <div
        className="w-full h-full p-[5%] rounded-sm overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.09)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(255,255,255,0.18)",
          borderLeft: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <p
          className="leading-relaxed"
          style={{
            fontSize: "clamp(0.5rem,1.6vw,0.8rem)",
            color: "rgba(255,255,255,0.93)",
            fontFamily: '"Georgia", serif',
            display: "-webkit-box",
            WebkitLineClamp: 9,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

// Layer 8 — Back: Author bio + optional photo
function AuthorBioLayer({ authorName, authorBio, authorPhotoUrl }) {
  if (!authorBio && !authorPhotoUrl) return null;
  return (
    <div
      className="absolute inset-x-[6%] flex gap-[4%] items-start"
      style={{ bottom: "18%", maxHeight: "22%" }}
    >
      {authorPhotoUrl && (
        <div
          className="shrink-0 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-lg"
          style={{ width: "clamp(32px,9vw,56px)", height: "clamp(32px,9vw,56px)" }}
        >
          <img src={authorPhotoUrl} alt={authorName} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold mb-1"
          style={{
            fontSize: "clamp(0.5rem,1.5vw,0.75rem)",
            color: "#F5CE62",
            fontFamily: '"Georgia", serif',
          }}
        >
          About the Author
        </p>
        <p
          className="leading-snug"
          style={{
            fontSize: "clamp(0.42rem,1.3vw,0.65rem)",
            color: "rgba(255,255,255,0.80)",
            fontFamily: '"Georgia", serif',
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}
        >
          {authorBio}
        </p>
      </div>
    </div>
  );
}

// Layer 9 — Back: Barcode (bottom-right)
function BarcodeLayer() {
  // SVG barcode — looks real, fully scalable
  const bars = [];
  const seed = [1,0,1,1,0,1,0,1,1,0,0,1,1,0,1,0,1,1,0,1,1,0,0,1,0,1,0,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,0,1,0,0,1,1,0,1];
  let x = 0;
  for (let i = 0; i < seed.length; i++) {
    const w = seed[i] ? 2.2 : 1.4;
    if (seed[i]) bars.push({ x, w });
    x += w + 0.8;
  }
  const totalW = x;

  return (
    <div
      className="absolute right-[5%] bottom-[4%] bg-white rounded-sm p-1 shadow-md"
      style={{ width: "clamp(56px,16vw,90px)" }}
    >
      <svg viewBox={`0 0 ${totalW} 32`} width="100%" style={{ display: "block" }}>
        {bars.map((b, i) => (
          <rect key={i} x={b.x} y={0} width={b.w} height={26} fill="#000" />
        ))}
      </svg>
      <p className="text-center font-mono text-black/70 leading-none mt-0.5"
        style={{ fontSize: "clamp(4px,1vw,7px)" }}>
        ISBN 978-0-XXX-XXXXX-X
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPOSITOR — assembles layers based on cover type
// ─────────────────────────────────────────────────────────────────────────────

export default function CoverCompositor({
  type = "front",
  backgroundUrl,
  title,
  subtitle,
  authorName,
  bookSummary,
  authorBio,
  authorPhotoUrl,
  category
}) {
  if (!backgroundUrl) return null;

  if (type === "front") {
    return (
      <CoverCanvas>
        {/* Layer 0 */}
        <BackgroundLayer url={backgroundUrl} />
        {/* Layer 1 */}
        <TopVignetteLayer opacity={0.6} />
        {/* Layer 2 */}
        <BottomVignetteLayer opacity={0.65} />
        {/* Layer 3 */}
        <TitleLayer title={title} subtitle={subtitle} />
        {/* Layer 4 */}
        <AuthorNameLayer authorName={authorName} />
      </CoverCanvas>
    );
  }

  // Back cover
  return (
    <CoverCanvas>
      {/* Layer 0 */}
      <BackgroundLayer url={backgroundUrl} />
      {/* Layer 5 */}
      <BackOverlayLayer />
      {/* Layer 6 */}
      <CategoryBadgeLayer category={category} />
      {/* Layer 7 */}
      <SummaryLayer summary={bookSummary || ""} />
      {/* Layer 8 */}
      <AuthorBioLayer authorName={authorName} authorBio={authorBio} authorPhotoUrl={authorPhotoUrl} />
      {/* Layer 9 */}
      <BarcodeLayer />
    </CoverCanvas>
  );
}