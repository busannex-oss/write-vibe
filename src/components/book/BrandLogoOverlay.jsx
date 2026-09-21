import React from "react";

const POSITIONS = {
  "top-left": "top-[4%] left-[4%] items-start",
  "top-right": "top-[4%] right-[4%] items-end",
  "bottom-left": "bottom-[4%] left-[4%] items-start",
  "bottom-right": "bottom-[4%] right-[4%] items-end",
  "bottom-center": "bottom-[4%] left-1/2 -translate-x-1/2 items-center"
};

/**
 * The author's brand logo laid ON TOP of a book cover. Place inside a relative
 * wrapper that holds the cover image — it never replaces the cover art.
 */
export default function BrandLogoOverlay({ book }) {
  const o = book?.logo_overlay || {};
  if (!book?.author_logo_url || o.enabled === false) return null;

  const size = Math.max(8, Math.min(50, o.size ?? 22));
  const opacity = Math.max(20, Math.min(100, o.opacity ?? 100)) / 100;

  return (
    <div
      className={`absolute z-10 flex flex-col gap-1 pointer-events-none ${POSITIONS[o.position] || POSITIONS["bottom-right"]}`}
      style={{ width: `${size}%`, opacity }}
    >
      <img src={book.author_logo_url} alt="Author brand" className="w-full object-contain drop-shadow-lg" />
      {o.show_tagline && book.author_tagline && (
        <p className="text-[7px] leading-tight text-white/90 drop-shadow-md text-center w-full">{book.author_tagline}</p>
      )}
    </div>
  );
}