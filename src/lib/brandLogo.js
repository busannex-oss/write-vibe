import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

// The brand logo (set in Settings → Website Branding) is the single source of truth for the site logo.
export function useBrandLogo() {
  const { data } = useQuery({
    queryKey: ["brand-logo"],
    queryFn: async () => (await base44.entities.BrandAsset.filter({ key: "site_logo" }))[0]?.url || null,
    staleTime: 300000,
  });
  return data || null;
}

// Called by admins when the brand logo changes, so public pages pick it up.
export async function saveBrandLogo(url) {
  const [existing] = await base44.entities.BrandAsset.filter({ key: "site_logo" });
  if (existing) return base44.entities.BrandAsset.update(existing.id, { url });
  return base44.entities.BrandAsset.create({ key: "site_logo", url });
}