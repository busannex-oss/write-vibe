import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NavCollapsible from "@/components/NavCollapsible";
import AdminMenuCollapsible from "@/components/AdminMenuCollapsible";

export default function MobileNav({ memberNav, adminNav, user, currentPageName, onNavigate, onLogout }) {
  return (
    <nav className="lg:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/5 p-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
      {memberNav.map((item) =>
        item.children ? (
          <NavCollapsible
            key={item.name}
            parent={item}
            items={item.children}
            currentPageName={currentPageName}
            onNavigate={onNavigate}
          />
        ) : (
          <Link
            key={item.name}
            to={createPageUrl(item.href)}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
              currentPageName === item.href
                ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className={cn("w-5 h-5", currentPageName === item.href && "text-amber-400")} />
            <span className="font-medium">{item.name}</span>
          </Link>
        )
      )}

      {adminNav.length > 0 && (
        <div className="pt-2 mt-2 border-t border-white/10">
          <AdminMenuCollapsible adminNav={adminNav} currentPageName={currentPageName} onNavigate={onNavigate} />
        </div>
      )}

      {user && (
        <div className="flex items-center gap-3 pt-3 mt-3 px-2 border-t border-white/10">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center overflow-hidden shrink-0">
            {user.author_photo_url ? (
              <img src={user.author_photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-medium text-white/60">
                {user.full_name?.charAt(0) || user.email?.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.full_name || "Author"}</p>
            <p className="text-xs text-white/40 truncate">{user.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="text-white/40 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      )}
    </nav>
  );
}