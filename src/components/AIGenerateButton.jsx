import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AIGenerateButton({ 
  onClick, 
  loading = false, 
  size = "sm",
  className = "",
  label = "AI Generate",
  loadingLabel = "Generating..."
}) {
  return (
    <Button
      type="button"
      size={size}
      onClick={onClick}
      disabled={loading}
      className={cn(
        "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0",
        className
      )}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  );
}