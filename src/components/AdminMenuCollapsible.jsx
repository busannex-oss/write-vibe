import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER = ["Core", "Strategy", "Documentation", "Architecture", "System", "Experience"];

export default function AdminMenuCollapsible({ adminNav, currentPageName }) {
  const [expanded, setExpanded] = useState({ Documentation: true });

  const grouped = adminNav.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <>
      {CATEGORY_ORDER.filter((c) => grouped[c]).map((category) => (
        <div key={category}>
          <button
            onClick={() => setExpanded((prev) => ({ ...prev, [category]: !prev[category] }))}
            className="w-full flex items-center gap-2 px-4 py-2 mt-2 text-[10px] uppercase tracking-widest text-amber-400/60 font-semibold hover:text-amber-400 transition-colors"
          >
            <ChevronDown className={cn("w-3 h-3 transition-transform", expanded[category] && "rotate-180")} />
            {category}
          </button>
          {expanded[category] && (
            <div className="space-y-1">
              {grouped[category].map((item) => {
                const isActive = currentPageName === item.href;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.href)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm",
                      isActive
                        ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400"
                        : "text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/5"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", isActive ? "text-amber-400" : "text-amber-400/60")} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </>
  );
}