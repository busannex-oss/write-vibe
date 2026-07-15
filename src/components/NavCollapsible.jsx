import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NavCollapsible({ parent, items, currentPageName, onNavigate }) {
  const childActive = items.some((c) => currentPageName === c.href);
  const parentActive = currentPageName === parent.href;
  const anyActive = childActive || parentActive;
  const [expanded, setExpanded] = useState(childActive);

  return (
    <div>
      <div
        className={cn(
          "flex items-center rounded-xl transition-all duration-200",
          anyActive
            ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 shadow-lg shadow-amber-500/5"
            : "hover:bg-white/5"
        )}
      >
        <Link
          to={createPageUrl(parent.href)}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl flex-1",
            anyActive ? "text-amber-400" : "text-white/60 hover:text-white"
          )}
        >
          <parent.icon className={cn("w-5 h-5", anyActive && "text-amber-400")} />
          <span className="font-medium">{parent.name}</span>
        </Link>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn("px-3 py-3", anyActive ? "text-amber-400" : "text-white/60 hover:text-white")}
          aria-label="Toggle sub-menu"
        >
          <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
        </button>
      </div>
      {expanded && (
        <div className="mt-1 ml-4 space-y-1 border-l border-white/10 pl-2">
          {items.map((item) => {
            const isActive = currentPageName === item.href;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.href)}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm",
                  isActive
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive && "text-amber-400")} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}