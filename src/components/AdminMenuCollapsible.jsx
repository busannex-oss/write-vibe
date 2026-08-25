import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER = ["Operations", "AI Agents", "Strategy & Docs", "Platform & Brand"];

export default function AdminMenuCollapsible({ adminNav, currentPageName, onNavigate }) {
  // Auto-open the category that contains the current page
  const activeCategory = useMemo(() => {
    const owner = adminNav.find(
      (i) => i.href === currentPageName || i.children?.some((c) => c.href === currentPageName)
    );
    return owner?.category || "Operations";
  }, [adminNav, currentPageName]);

  const [expanded, setExpanded] = useState(activeCategory);
  const [expandedItems, setExpandedItems] = useState({});
  const [query, setQuery] = useState("");

  const grouped = adminNav.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const matches = (name) => name.toLowerCase().includes(q);

  // When searching, keep only matching items (or items with matching children)
  const filterItems = (items) =>
    !searching
      ? items
      : items
          .map((item) => {
            if (matches(item.name)) return item;
            const childHits = (item.children || []).filter((c) => matches(c.name));
            if (childHits.length) return { ...item, children: childHits };
            return null;
          })
          .filter(Boolean);

  const toggleItem = (name) =>
    setExpandedItems((prev) => ({ ...prev, [name]: !prev[name] }));

  return (
    <>
      {/* Quick filter */}
      <div className="relative px-1 pt-2 pb-1">
        <Search className="absolute left-3.5 top-1/2 mt-0.5 -translate-y-1/2 w-3.5 h-3.5 text-amber-400/40 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find admin tool..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-8 py-1.5 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-amber-500/40"
        />
        {searching && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-white/30 hover:text-white"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {CATEGORY_ORDER.filter((c) => grouped[c]).map((category) => {
        const items = filterItems(grouped[category]);
        if (searching && items.length === 0) return null;
        const isOpen = searching || expanded === category;

        return (
          <div key={category}>
            <button
              onClick={() => setExpanded((prev) => (prev === category ? null : category))}
              className="w-full flex items-center justify-between px-4 py-2 mt-1 text-[10px] uppercase tracking-widest text-amber-400/60 font-semibold hover:text-amber-400 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
                {category}
              </span>
              <span className="text-amber-400/30 normal-case tracking-normal">{items.length}</span>
            </button>
            {isOpen && (
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive = currentPageName === item.href;
                  const hasChildren = item.children?.length > 0;
                  const isItemExpanded =
                    searching ||
                    expandedItems[item.name] ||
                    item.children?.some((c) => c.href === currentPageName);

                  return (
                    <div key={item.name}>
                      <div className="flex items-center">
                        <Link
                          to={createPageUrl(item.href)}
                          onClick={onNavigate}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm flex-1",
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
                            aria-label={`Toggle ${item.name} sub-menu`}
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
                                onClick={onNavigate}
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
        );
      })}
      {searching &&
        CATEGORY_ORDER.filter((c) => grouped[c]).every((c) => filterItems(grouped[c]).length === 0) && (
          <p className="px-4 py-3 text-xs text-white/30">No tools match "{query}"</p>
        )}
    </>
  );
}