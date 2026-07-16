import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER = ["Operations", "AI Agents", "Strategy & Docs", "Platform & Brand"];

export default function AdminMenuCollapsible({ adminNav, currentPageName }) {
  const [expanded, setExpanded] = useState({ Operations: true });
  const [expandedItems, setExpandedItems] = useState({});

  const grouped = adminNav.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const toggleItem = (name) =>
    setExpandedItems((prev) => ({ ...prev, [name]: !prev[name] }));

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
                const hasChildren = item.children?.length > 0;
                const isItemExpanded =
                  expandedItems[item.name] ||
                  item.children?.some((c) => c.href === currentPageName);

                return (
                  <div key={item.name}>
                    <div className="flex items-center">
                      <Link
                        to={createPageUrl(item.href)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm flex-1",
                          isActive
                            ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400"
                            : "text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/5"
                        )}
                      >
                        <item.icon className={cn("w-4 h-4", isActive ? "text-amber-400" : "text-amber-400/60")} />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                      {hasChildren && (
                        <button
                          onClick={() => toggleItem(item.name)}
                          className="p-1.5 mr-1 text-amber-400/40 hover:text-amber-400"
                        >
                          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isItemExpanded && "rotate-180")} />
                        </button>
                      )}
                    </div>
                    {hasChildren && isItemExpanded && (
                      <div className="ml-4 pl-4 border-l border-amber-500/10 space-y-0.5 mt-0.5">
                        {item.children.map((child) => {
                          const childActive = currentPageName === child.href;
                          return (
                            <Link
                              key={child.name}
                              to={createPageUrl(child.href)}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all text-xs",
                                childActive
                                  ? "bg-amber-500/10 text-amber-400"
                                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
                              )}
                            >
                              <child.icon className="w-3.5 h-3.5" />
                              <span>{child.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </>
  );
}