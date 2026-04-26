import React from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function BrandBanner() {
  return (
    <div className="mb-8 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-bold text-amber-100 mb-1">Brand Style Guide Incomplete</h3>
        <p className="text-amber-100/70 text-sm mb-3">
          Visual settings are using defaults. Complete your Brand Style Guide to apply your full brand identity to this page.
        </p>
        <Link to="/BrandStyleGuide">
          <Button
            variant="outline"
            size="sm"
            className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 gap-2"
          >
            Go to Brand Style Guide
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}