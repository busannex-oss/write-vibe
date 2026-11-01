import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { CreditCard } from "lucide-react";

const PROVIDERS = [
  { key: "payments_stripe", label: "Stripe", note: "Card payments through Stripe checkout." },
  { key: "payments_paddle", label: "Paddle", note: "Requires your Paddle API key before it can take payments." },
];

export default function PaymentProviderToggles() {
  const qc = useQueryClient();
  const { data: settings = [] } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: () => base44.entities.AppSetting.filter({ key: { $in: PROVIDERS.map((p) => p.key) } }),
  });

  const toggle = async (key, enabled) => {
    const existing = settings.find((s) => s.key === key);
    if (existing) await base44.entities.AppSetting.update(existing.id, { enabled });
    else await base44.entities.AppSetting.create({ key, enabled });
    qc.invalidateQueries({ queryKey: ["payment-settings"] });
  };

  return (
    <Card className="bg-white/5 border-white/10 mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2"><CreditCard className="w-5 h-5 text-amber-400" />Payment Providers</CardTitle>
        <CardDescription className="text-white/50">Turn each payment option on or off.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {PROVIDERS.map((p) => (
          <div key={p.key} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-medium">{p.label}</p>
              <p className="text-xs text-white/50">{p.note}</p>
            </div>
            <Switch checked={!!settings.find((s) => s.key === p.key)?.enabled} onCheckedChange={(v) => toggle(p.key, v)} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}