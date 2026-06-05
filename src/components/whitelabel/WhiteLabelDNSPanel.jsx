import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Globe, Copy, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Server } from "lucide-react";
import { cn } from "@/lib/utils";

const DNS_RECORDS = [
  {
    type: "CNAME",
    name: "@",
    value: "writevibe-proxy.vercel.app",
    ttl: "3600",
    purpose: "Main app domain routing",
  },
  {
    type: "CNAME",
    name: "www",
    value: "writevibe-proxy.vercel.app",
    ttl: "3600",
    purpose: "www subdomain routing",
  },
  {
    type: "TXT",
    name: "_writevibe-verify",
    value: "verify-{YOUR_TENANT_ID}",
    ttl: "3600",
    purpose: "Domain ownership verification",
  },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy}
      className={cn("p-1.5 rounded transition-all", copied ? "text-emerald-400" : "text-white/30 hover:text-white/70")}>
      {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function WhiteLabelDNSPanel({ tenantId, customDomain, dnsVerified, onVerified }) {
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    // Simulate DNS check — in production this would call a backend function
    await new Promise(r => setTimeout(r, 2000));
    // Mock result — show as pending unless already verified
    setVerifyResult(dnsVerified ? "verified" : "pending");
    setVerifying(false);
    if (dnsVerified && onVerified) onVerified();
  };

  const records = DNS_RECORDS.map(r => ({
    ...r,
    value: r.value.replace("{YOUR_TENANT_ID}", tenantId || "your-tenant-id"),
  }));

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <div>
              <CardTitle className="text-white text-base">Custom Domain Setup</CardTitle>
              <CardDescription className="text-white/40 text-xs">
                {customDomain ? `Configuring: ${customDomain}` : "No custom domain set"}
              </CardDescription>
            </div>
          </div>
          <Badge className={cn("text-xs border", dnsVerified
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-amber-500/10 border-amber-500/20 text-amber-400")}>
            {dnsVerified ? <><CheckCircle2 className="w-3 h-3 mr-1 inline" />Verified</> : <><AlertCircle className="w-3 h-3 mr-1 inline" />Pending</>}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!customDomain ? (
          <p className="text-white/40 text-sm">Set a custom domain in the tenant settings to configure DNS.</p>
        ) : (
          <>
            <p className="text-white/50 text-sm">
              Add these DNS records to your domain registrar for <span className="text-amber-300 font-mono">{customDomain}</span>:
            </p>

            <div className="rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/5">
                    {["Type", "Name", "Value", "TTL", ""].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-white/40 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={i} className="border-t border-white/5 hover:bg-white/3">
                      <td className="px-3 py-2.5">
                        <span className={cn("px-1.5 py-0.5 rounded text-xs font-mono font-semibold",
                          r.type === "CNAME" ? "bg-blue-500/15 text-blue-400" : "bg-purple-500/15 text-purple-400")}>
                          {r.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-white/70">{r.name}</td>
                      <td className="px-3 py-2.5 font-mono text-white/70 max-w-[200px] truncate">{r.value}</td>
                      <td className="px-3 py-2.5 text-white/40">{r.ttl}</td>
                      <td className="px-3 py-2.5"><CopyButton text={r.value} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-amber-500/8 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300/80">
              <p className="font-medium mb-1">⚡ DNS Propagation</p>
              <p>Changes can take up to 48 hours to propagate globally. Most providers update within 1–2 hours.</p>
            </div>

            {verifyResult && (
              <div className={cn("rounded-lg p-3 text-sm flex items-center gap-2", verifyResult === "verified"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                : "bg-amber-500/10 border border-amber-500/20 text-amber-300")}>
                {verifyResult === "verified"
                  ? <><CheckCircle2 className="w-4 h-4 shrink-0" />Domain verified successfully!</>
                  : <><AlertCircle className="w-4 h-4 shrink-0" />DNS records not yet detected. Check your registrar and try again.</>}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleVerify} disabled={verifying} variant="outline" size="sm"
                className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                {verifying ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                Verify DNS
              </Button>
              <a href={`https://dnschecker.org/#CNAME/${customDomain}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="border-white/15 text-white/50">
                  <ExternalLink className="w-4 h-4 mr-1" /> DNS Checker
                </Button>
              </a>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}