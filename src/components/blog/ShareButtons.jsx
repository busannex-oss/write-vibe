import React, { useState } from "react";
import { Linkedin, Facebook, Twitter, Mail, Link2, Check } from "lucide-react";

export default function ShareButtons({ title, excerpt }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const e = encodeURIComponent;

  const links = [
    { label: "LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}` },
    { label: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}` },
    { label: "X", icon: Twitter, href: `https://twitter.com/intent/tweet?text=${e(title)}&url=${e(url)}` },
    { label: "Email", icon: Mail, href: `mailto:?subject=${e(title)}&body=${e((excerpt || "") + "\n\n" + url)}` }
  ];

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs uppercase tracking-wider text-white/35 mr-1">Share</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${l.label}`}
          className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
        >
          <l.icon className="w-4 h-4" />
        </a>
      ))}
      <button
        onClick={copy}
        aria-label="Copy link"
        className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  );
}