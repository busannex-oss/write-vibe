import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminMenuCollapsible({ adminNav, currentPageName }) {
  const [expanded, setExpanded] = useState(true);

  const categories = {
    "Core": adminNav.slice(0, 2), // User Management, Error Dashboard
    "Strategy": adminNav.slice(2, 5), // Agent Memory, Mission, SOPs
    "Documentation": adminNav.slice(5, 10), // Registry, Legend, Pillars, Brand, Sitemap
    "System": adminNav.slice(10, 14), // Architecture, Legal, Licensing, KPI
    "Experience": adminNav.slice(14) // Onboarding, Roadmap, Pillars Architecture, Agent Audit
  };

  return (
    <>
      {Object.entries(categories).map(([category, items]) => (
        <div key={category}>
          <button
            onClick={() => setExpanded(prev => ({ ...prev, [category]: !prev[category] }))}
            className="w-full flex items-center gap-2 px-4 py-2 mt-2 text-[10px] uppercase tracking-widest text-amber-400/60 font-semibold hover:text-amber-400 transition-colors"
          >
            <ChevronDown className={cn("w-3 h-3 transition-transform", expanded[category] && "rotate-180")} />
            {category}
          </button>
          {expanded[category] && (
            <div className="space-y-1">
              {items.map((item) => {
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