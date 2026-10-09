import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Paragraph-level compare: highlights paragraphs that don't appear in the other side
function Column({ title, text, otherText, tone }) {
  const other = new Set((otherText || "").split(/\n+/).map((p) => p.trim()).filter(Boolean));
  const paras = (text || "").split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const words = (text || "").split(/\s+/).filter(Boolean).length;
  return (
    <div className="flex flex-col min-w-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 text-xs">
        <span className="font-medium text-white">{title}</span>
        <span className="text-white/40">{words.toLocaleString()} words</span>
      </div>
      <ScrollArea className="h-[420px]">
        <div className="p-3 space-y-2 text-sm leading-relaxed">
          {paras.length === 0 && <p className="text-white/40">No content</p>}
          {paras.map((p, i) => (
            <p key={i} className={other.has(p) ? "text-white/60" : `${tone} rounded px-2 py-1`}>{p}</p>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default function ChapterVersionCompare({ version, versionLabel, currentContent }) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
        <Column title={versionLabel} text={version.content} otherText={currentContent} tone="bg-rose-500/15 text-rose-100" />
        <Column title="Current draft" text={currentContent} otherText={version.content} tone="bg-emerald-500/15 text-emerald-100" />
      </div>
      <p className="px-3 py-2 text-[11px] text-white/40 border-t border-white/10">
        Highlighted paragraphs differ between the two drafts.
      </p>
    </div>
  );
}