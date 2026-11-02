import React from "react";

export const BACK_TEXT_DEFAULTS = {
  enabled: true, tagline: "", blurb: "", author_bio: "",
  font: "serif", size: 100, color: "#ffffff", align: "left",
  position: "top", band_opacity: 45, show_barcode: true
};

const FONTS = { serif: 'Georgia, "Times New Roman", serif', sans: "Helvetica, Arial, sans-serif", mono: "ui-monospace, monospace" };
const POSITIONS = { top: { top: "8%" }, middle: { top: "50%", transform: "translateY(-50%)" }, bottom: { bottom: "18%" } };

export default function BackCoverTextOverlay({ settings, fallbackBlurb }) {
  const s = { ...BACK_TEXT_DEFAULTS, ...settings };
  if (!s.enabled) return null;
  const blurb = s.blurb || fallbackBlurb;
  const scale = s.size / 100;
  return (
    <>
      <div className="absolute inset-x-0 px-[7%]" style={{ ...POSITIONS[s.position], fontFamily: FONTS[s.font], color: s.color, textAlign: s.align }}>
        <div className="rounded p-[6%] space-y-2" style={{ background: `rgba(0,0,0,${s.band_opacity / 100})` }}>
          {s.tagline && <p className="font-bold leading-tight" style={{ fontSize: `${15 * scale}px` }}>{s.tagline}</p>}
          {blurb && <p className="whitespace-pre-line leading-relaxed" style={{ fontSize: `${11 * scale}px` }}>{blurb}</p>}
          {s.author_bio && (
            <div className="pt-2 border-t border-white/20">
              <p className="font-semibold" style={{ fontSize: `${10 * scale}px` }}>About the Author</p>
              <p className="opacity-85 leading-snug" style={{ fontSize: `${9 * scale}px` }}>{s.author_bio}</p>
            </div>
          )}
        </div>
      </div>
      {s.show_barcode && (
        <div className="absolute right-[5%] bottom-[3.5%] w-[22%] aspect-[2/1] bg-white rounded-sm flex items-end justify-center pb-0.5">
          <span className="text-[6px] text-black font-mono">ISBN</span>
        </div>
      )}
    </>
  );
}