import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, ChevronDown, ChevronUp } from "lucide-react";
import SocialCredentialsPanel from "@/components/admin/SocialCredentialsPanel";

export default function SocialKeysSection({ user }) {
  const [open, setOpen] = useState(false);

  if (user?.role !== "admin") return null;

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader className="border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-base">Social Media API Keys</CardTitle>
              <CardDescription className="text-white/40 text-xs">
                Connect Facebook, Instagram &amp; LinkedIn to push marketing snippets
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(!open)}
            className="text-white/50 hover:text-white hover:bg-white/10"
          >
            {open ? "Hide" : "Manage Keys"}
            {open ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-6">
          <SocialCredentialsPanel />
        </CardContent>
      )}
    </Card>
  );
}