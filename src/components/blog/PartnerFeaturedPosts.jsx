import React from "react";
import { ExternalLink, Handshake } from "lucide-react";
import { PARTNER_FEATURED_POSTS } from "@/lib/partnerBlogs";

export default function PartnerFeaturedPosts() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Handshake className="w-4 h-4 text-amber-400" />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">From our partners</p>
      </div>
      <ul className="space-y-4">
        {PARTNER_FEATURED_POSTS.map((p) => (
          <li key={p.id}>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 group"
            >
              <img src={p.image} alt="" loading="lazy" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-amber-400/70">{p.partner}</p>
                <p className="text-sm text-white/80 group-hover:text-amber-300 leading-snug">
                  {p.title} <ExternalLink className="w-3 h-3 inline-block mb-0.5 text-white/30" />
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}