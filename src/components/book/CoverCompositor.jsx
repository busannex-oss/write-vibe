import React from "react";

// ─── LAYER SYSTEM ─────────────────────────────────────────────────────────────
// Each component is a discrete layer. Edit one without touching others.
// ─────────────────────────────────────────────────────────────────────────────

function CoverCanvas({ children }) {
  return (
    <div className="relative w-full h-full overflow-hidden select-none rounded-lg">
      {children}
    </div>
  );
}

// Layer 0 — Background image (fills canvas, no distortion)
function BackgroundLayer({ url }) {
  return (
    <img
      src={url}
      alt=""
      className="absolute inset-0 w-full h-full"
      style={{ objectFit: "cover", objectPosition: "center" }}
      crossOrigin="anonymous"
    />
  );
}

// Layer 1 — Top vignette (title legibility)
function TopVignetteLayer({ opacity = 0.55 }) {
  return (
    <div
      className="absolute inset-x-0 top-0 pointer-events-none"
      style={{
        height: "45%",
        background: `linear-gradient(to bottom, rgba(0,0,0,${opacity}) 0%, transparent 100%)`
      }}
    />
  );
}

// Layer 2 — Bottom vignette (author name legibility)
function BottomVignetteLayer({ opacity = 0.65 }) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 pointer-events-none"
      style={{
        height: "28%",
        background: `linear-gradient(to top, rgba(0,0,0,${opacity}) 0%, transparent 100%)`
      }}
    />
  );
}

// Layer 3 — Front: Title + subtitle
function TitleLayer({ title, subtitle }) {
  const isLong = (title?.length || 0) > 22;
  return (
    <div className="absolute inset-x-0 top-0 flex flex-col items-center px-[8%] pt-[8%]">
      <h1
        style={{
          fontSize: isLong ? "clamp(1.5rem,6vw,3.5rem)" : "clamp(2rem,8vw,4.5rem)",
          color: "#FFFFFF",
          fontFamily: '"Playfair Display", "Georgia", serif',
          fontWeight: 900,
          lineHeight: 0.95,
          letterSpacing: isLong ? "0.08em" : "0.12em",
          textTransform: "uppercase",
          textAlign: "center",
          textShadow: "0 4px 30px rgba(0,0,0,0.95), 0 0 50px rgba(0,0,0,0.8)",
          wordBreak: "break-word",
          fontVariant: "small-caps",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            marginTop: "5%",
            fontSize: "clamp(0.6rem,2.2vw,1.1rem)",
            color: "rgba(255,255,255,0.92)",
            fontFamily: '"Georgia", serif',
            fontStyle: "normal",
            fontWeight: 400,
            letterSpacing: "0.08em",
            textAlign: "center",
            textShadow: "0 2px 12px rgba(0,0,0,0.88)",
            maxWidth: "85%",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Layer 4 — Front: Author name at bottom
function AuthorNameLayer({ authorName }) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-[6%] pointer-events-none">
      <div
        style={{
          width: "38%",
          height: "1px",
          background: "linear-gradient(to right, transparent, rgba(245,206,98,0.8), transparent)",
          marginBottom: "3%",
        }}
      />
      <p
        style={{
          fontSize: "clamp(0.55rem,1.9vw,0.95rem)",
          color: "#F5CE62",
          fontFamily: '"Georgia", serif',
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          textAlign: "center",
          textShadow: "0 1px 12px rgba(0,0,0,0.95)",
        }}
      >
        {authorName}
      </p>
    </div>
  );
}

// ── BACK COVER LAYERS ─────────────────────────────────────────────────────────

// Layer 5 — Back: Category badge top-left
function CategoryBadgeLayer({ category }) {
  if (!category) return null;
  return (
    <div className="absolute top-[4%] left-[6%]">
      <span
        style={{
          display: "inline-block",
          background: "rgba(245,206,98,0.95)",
          color: "#1a1a1a",
          fontSize: "clamp(0.42rem,1.3vw,0.6rem)",
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          padding: "2px 8px",
          borderRadius: "2px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.4)",
        }}
      >
        {category}
      </span>
    </div>
  );
}

// Layer 6 — Back: Summary text (no white box, clean text over a subtle dark band)
function SummaryLayer({ summary }) {
  const text = summary || "A compelling story that will keep you turning pages from the very first line to the last.";
  return (
    <div
      className="absolute inset-x-0"
      style={{ top: "12%", padding: "0 7%" }}
    >
      {/* Subtle frosted band — very low opacity so background shows through */}
      <div
        style={{
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          borderRadius: "4px",
          padding: "5% 6%",
          borderLeft: "2px solid rgba(245,206,98,0.4)",
        }}
      >
        <p
          style={{
            fontSize: "clamp(0.48rem,1.55vw,0.75rem)",
            color: "rgba(255,255,255,0.93)",
            fontFamily: '"Georgia", serif',
            lineHeight: 1.65,
            display: "-webkit-box",
            WebkitLineClamp: 10,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

// Layer 7 — Back: Author bio + optional circular photo
function AuthorBioLayer({ authorName, authorBio, authorPhotoUrl }) {
  if (!authorBio && !authorPhotoUrl) return null;
  return (
    <div
      className="absolute inset-x-0 flex gap-[3%] items-start"
      style={{ bottom: "16%", padding: "0 7%" }}
    >
      {authorPhotoUrl && (
        <div
          style={{
            flexShrink: 0,
            width: "clamp(28px,8vw,48px)",
            height: "clamp(28px,8vw,48px)",
            borderRadius: "50%",
            overflow: "hidden",
            border: "1.5px solid rgba(245,206,98,0.7)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          <img src={authorPhotoUrl} alt={authorName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "clamp(0.44rem,1.4vw,0.68rem)",
            color: "#F5CE62",
            fontFamily: '"Georgia", serif',
            fontWeight: 600,
            marginBottom: "2%",
          }}
        >
          About the Author
        </p>
        <p
          style={{
            fontSize: "clamp(0.4rem,1.2vw,0.6rem)",
            color: "rgba(255,255,255,0.80)",
            fontFamily: '"Georgia", serif',
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {authorBio}
        </p>
      </div>
    </div>
  );
}

// Layer 8 — Back: Barcode bottom-right
function BarcodeLayer() {
  const seed = [1,0,1,1,0,1,0,1,1,0,0,1,1,0,1,0,1,1,0,1,1,0,0,1,0,1,0,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,0,1,0,0,1,1,0,1];
  const bars = [];
  let x = 0;
  for (let i = 0; i < seed.length; i++) {
    const w = seed[i] ? 2.4 : 1.3;
    if (seed[i]) bars.push({ x, w });
    x += w + 0.7;
  }
  return (
    <div
      className="absolute right-[5%] bottom-[3.5%] bg-white rounded-sm shadow-md"
      style={{ padding: "3px 4px", width: "clamp(52px,14vw,82px)" }}
    >
      <svg viewBox={`0 0 ${x} 28`} width="100%" style={{ display: "block" }}>
        {bars.map((b, i) => (
          <rect key={i} x={b.x} y={0} width={b.w} height={22} fill="#000" />
        ))}
      </svg>
      <p
        style={{
          textAlign: "center",
          fontFamily: "monospace",
          color: "#333",
          fontSize: "clamp(3.5px,0.9vw,6px)",
          marginTop: "1px",
          lineHeight: 1,
        }}
      >
        ISBN 978-0-XXX-XXXXX-X
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPOSITOR
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
  category,
}) {
  if (!backgroundUrl) return null;

  if (type === "front") {
    return (
      <CoverCanvas>
        <BackgroundLayer url={backgroundUrl} />      {/* Layer 0 */}
        <TopVignetteLayer opacity={0.58} />          {/* Layer 1 */}
        <BottomVignetteLayer opacity={0.62} />       {/* Layer 2 */}
        <TitleLayer title={title} subtitle={subtitle} />  {/* Layer 3 */}
        <AuthorNameLayer authorName={authorName} />  {/* Layer 4 */}
      </CoverCanvas>
    );
  }

  return (
    <CoverCanvas>
      <BackgroundLayer url={backgroundUrl} />        {/* Layer 0 */}
      {/* NO full overlay — let the background breathe */}
      <CategoryBadgeLayer category={category} />    {/* Layer 5 */}
      <SummaryLayer summary={bookSummary || ""} />  {/* Layer 6 */}
      <AuthorBioLayer
        authorName={authorName}
        authorBio={authorBio}
        authorPhotoUrl={authorPhotoUrl}
      />                                             {/* Layer 7 */}
      <BarcodeLayer />                              {/* Layer 8 */}
    </CoverCanvas>
  );
}