import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Building2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const RESELLER_PLANS = [
  {
    id: "starter_reseller",
    name: "Starter Reseller",
    price: "$99",
    period: "/month",
    icon: Zap,
    color: "from-slate-700 to-slate-800",
    border: "border-white/10",
    features: [
      "Up to 5 white label tenants",
      "Custom branding per tenant",
      "Subdomain hosting (*.writevibe.app)",
      "Email & chat support",
      "Starter plan for each tenant",
    ],
    limits: "5 tenants max",
  },
  {
    id: "professional_reseller",
    name: "Pro Reseller",
    price: "$299",
    period: "/month",
    icon: Star,
    color: "from-amber-900/60 to-orange-900/40",
    border: "border-amber-500/30",
    popular: true,
    features: [
      "Up to 25 white label tenants",
      "Custom domains per tenant",
      "Full brand isolation & color theming",
      "Feature toggle per tenant",
      "Priority support + Slack channel",
      "Reseller dashboard & analytics",
      "API access for tenant management",
    ],
    limits: "25 tenants max",
  },
  {
    id: "enterprise_reseller",
    name: "Enterprise Reseller",
    price: "Custom",
    period: "",
    icon: Building2,
    color: "from-violet-900/60 to-purple-900/40",
    border: "border-violet-500/30",
    features: [
      "Unlimited tenants",
      "Custom domain for your platform",
      "Full platform white label",
      "Dedicated infrastructure",
      "Custom integrations & API",
      "White glove onboarding",
      "SLA & dedicated CSM",
    ],
    limits: "Unlimited",
  },
];

export default function WhiteLabelPlanSelector({ currentPlan, onSelect }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white font-semibold mb-1">White Label Reseller Plans</h3>
        <p className="text-white/40 text-sm">Choose the tier that matches your reseller volume.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {RESELLER_PLANS.map(plan => {
          const Icon = plan.icon;
          const isActive = currentPlan === plan.id;
          return (
            <Card key={plan.id} className={cn("relative overflow-hidden border transition-all", plan.border,
              isActive ? "ring-2 ring-amber-500/50" : "hover:border-white/20")}>
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-xl">
                  Most Popular
                </div>
              )}
              <CardContent className={cn("pt-6 bg-gradient-to-br", plan.color)}>
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-5 h-5 text-amber-400" />
                  <h4 className="text-white font-semibold">{plan.name}</h4>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/50 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => onSelect?.(plan.id)}
                  disabled={isActive}
                  className={cn("w-full", isActive
                    ? "bg-white/10 text-white/50 cursor-default"
                    : plan.popular
                      ? "bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                      : "bg-white/10 hover:bg-white/20 text-white")}>
                  {isActive ? <><Check className="w-4 h-4 mr-1" />Current Plan</> : plan.price === "Custom" ? "Contact Sales" : "Select Plan"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}