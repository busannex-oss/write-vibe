import React from "react";
import BrandLogoOverlay from "./BrandLogoOverlay";

/**
 * Book cover with the author's brand logo laid on top of the cover art.
 * The cover image is never replaced — the logo is always an overlay.
 */
export default function BrandedCover({ book, className = "", rounded = "rounded-xl" }) {
  return (
    <div className={`relative overflow-hidden bg-slate-900 ${rounded} ${className}`}>
      {book?.front_cover_url ? (
        <img src={book.front_cover_url} alt={book.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-4 text-center">
          <p className="text-white/40 text-sm">{book?.title}</p>
        </div>
      )}
      <BrandLogoOverlay book={book} />
    </div>
  );
}