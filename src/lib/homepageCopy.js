import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

// Maps an audit section name onto one of the homepage blocks it can replace.
export function slotForSection(sectionName = "") {
  const s = sectionName.toLowerCase();
  if (s.includes("hero") || s.includes("headline") || s.includes("above the fold")) return "hero";
  if (s.includes("problem") || s.includes("pain")) return "problem";
  if (s.includes("solution") || s.includes("value prop") || s.includes("offer")) return "solution";
  if (s.includes("proof") || s.includes("stat") || s.includes("trust") || s.includes("credibility")) return "proof";
  if (s.includes("testimonial") || s.includes("review")) return "testimonials";
  if (s.includes("cta") || s.includes("call to action") || s.includes("closing") || s.includes("conversion")) return "cta";
  return null;
}

export function useHomepageCopy() {
  const { data } = useQuery({
    queryKey: ["homepage-copy"],
    queryFn: () => base44.entities.HomepageCopy.filter({ is_active: true }, "-created_date", 50),
    staleTime: 60000
  });

  const bySlot = {};
  (data || []).forEach((rec) => {
    if (!bySlot[rec.slot]) bySlot[rec.slot] = rec;
  });

  return (slot, field, fallback) => bySlot[slot]?.[field] || fallback;
}