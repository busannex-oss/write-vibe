import React from "react";
import { Sparkles } from "lucide-react";
import { useBrandLogo } from "@/lib/brandLogo";

export default function BrandMark({ small = false }) {
  const logo = useBrandLogo();
  const box = small ? "w-8 h-8 rounded-lg" : "w-9 h-9 rounded-xl";
  if (logo) {
    return (
      <div className={`${box} overflow-hidden flex items-center justify-center`}>
        <img src={logo} alt="Write Vibe" className="w-full h-full object-contain" />
      </div>
    );
  }
  return (
    <div className={`${box} bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center`}>
      <Sparkles className={small ? "w-4 h-4 text-white" : "w-5 h-5 text-white"} />
    </div>
  );
}