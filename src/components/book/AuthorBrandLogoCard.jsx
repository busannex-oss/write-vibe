import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Stamp } from "lucide-react";

// The author's own brand logo — kept on their profile, separate from any book logo.
export default function AuthorBrandLogoCard({ user, book, onUpdate }) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const brandLogo = user?.author_brand_logo_url;

  const saveBrand = async (url) => {
    await base44.auth.updateMe({ author_brand_logo_url: url });
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
    await saveBrand(file_url);
    setBusy(false);
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Stamp className="w-4 h-4 text-amber-400" /> My Author Brand Logo
        </CardTitle>
        <p className="text-xs text-white/40">Your personal brand mark, kept separately from this book's logo and available on every book.</p>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-28 h-28 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {brandLogo ? <img src={brandLogo} alt="Author brand logo" className="w-full h-full object-contain p-2" /> : <span className="text-xs text-white/30">No brand logo</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-white text-sm hover:bg-white/10 cursor-pointer">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {brandLogo ? "Replace brand logo" : "Upload brand logo"}
            <input type="file" accept="image/*" className="hidden" onChange={upload} disabled={busy} />
          </label>
          {book.author_logo_url && book.author_logo_url !== brandLogo && (
            <Button size="sm" variant="outline" className="border-white/20 text-white" onClick={() => saveBrand(book.author_logo_url)}>
              Save this book's logo as my brand logo
            </Button>
          )}
          {brandLogo && brandLogo !== book.author_logo_url && (
            <Button size="sm" className="bg-amber-500 text-slate-950 hover:bg-amber-600" onClick={() => onUpdate({ author_logo_url: brandLogo }, true)}>
              Use brand logo on this cover
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}