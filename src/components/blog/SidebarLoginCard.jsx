import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LogIn, LayoutDashboard } from "lucide-react";

export default function SidebarLoginCard() {
  const { data: user } = useQuery({
    queryKey: ["blog-sidebar-user"],
    queryFn: async () => {
      const authed = await base44.auth.isAuthenticated();
      return authed ? await base44.auth.me() : null;
    },
    retry: false,
    staleTime: 60000
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      {user ? (
        <>
          <p className="text-sm text-white/50">Signed in as</p>
          <p className="text-white font-medium truncate">{user.full_name || user.email}</p>
          <Link to={createPageUrl("Dashboard")} className="block mt-4">
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
              <LayoutDashboard className="w-4 h-4" /> Go to dashboard
            </Button>
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-white">Members area</p>
          <p className="text-xs text-white/50 mt-1">
            Sign in to comment, save articles and access your book studio.
          </p>
          <Button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
          >
            <LogIn className="w-4 h-4" /> Sign in
          </Button>
        </>
      )}
    </div>
  );
}