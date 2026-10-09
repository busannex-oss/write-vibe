import React from "react";
import ReactMarkdown from "react-markdown";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PRICING_VALUATION_PROMPT } from "@/lib/pricingValuationPrompt";

export default function PricingValuationPrompt() {
  const { toast } = useToast();
  const copy = async () => {
    await navigator.clipboard.writeText(PRICING_VALUATION_PROMPT);
    toast({ title: "Prompt copied" });
  };
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={copy}><Copy /> Copy prompt</Button>
      </div>
      <div className="prose prose-invert max-w-none prose-headings:text-amber-300">
        <ReactMarkdown>{PRICING_VALUATION_PROMPT}</ReactMarkdown>
      </div>
    </div>
  );
}