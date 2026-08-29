import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag, Headphones, AlertCircle, CheckCircle2, AlertTriangle,
  Loader2, RefreshCw, ExternalLink, Upload, FileText, Clock,
  ArrowLeft, Package, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProviderHealthBanner from "@/components/distribution/ProviderHealthBanner";
import ChannelMatrix from "@/components/distribution/ChannelMatrix";
import PrintEconomicsCard from "@/components/distribution/PrintEconomicsCard";

const invoke = (action, extra = {}) => base44.functions.invoke("distributionDashboard", { action, ...extra });

const STATUS_CONFIG = {
  not_submitted: { label: "Not Submitted", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  submitted: { label: "Submitted", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  under_review: { label: "Under Review", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  published: { label: "Published", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-300 border-red-500/30" }
};

function AlertList({ items, type }) {
  if (!items?.length) return null;
  const isError = type === "error";
  return (
    <div className={cn("rounded-xl border p-4 space-y-2", isError
      ? "bg-red-500/8 border-red-500/25" : "bg-amber-500/8 border-amber-500/20")}>
      <p className={cn("text-xs font-semibold flex items-center gap-1.5",
        isError ? "text-red-300" : "text-amber-300")}>
        {isError ? <AlertCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
        {isError ? `${items.length} Blocking Error${items.length > 1 ? 's' : ''} — Will Cause Rejection` : `${items.length} Warning${items.length > 1 ? 's' : ''} — Recommended Fixes`}
      </p>
      {items.map((item, i) => (
        <div key={i} className={cn("flex items-start gap-2 text-xs",
          isError ? "text-red-200/70" : "text-amber-200/70")}>
          <span className="shrink-0 mt-0.5">{isError ? "✕" : "⚠"}</span>
          {item}
        </div>
      ))}
    </div>
  );
}

function PlatformCard({ icon: Icon, title, iconColor, status, data, onPublish, publishing, externalUrl, externalLabel }) {
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.not_submitted;
  const isReady = data?.ready;

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
      {/* Card Header */}
      <div className="p-5 border-b border-white/8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconColor)}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold">{title}</h3>
              {data?.submitted_at && (
                <p className="text-white/30 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Last submitted {new Date(data.submitted_at).toLocaleDateString()}
                </p>
              )}
              {data?.asin && (
                <p className="text-white/30 text-xs">ASIN: {data.asin}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", statusConfig.color)}>{statusConfig.label}</Badge>
            {isReady ? (
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Issues Found
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="p-5 space-y-3">
        <AlertList items={data?.errors} type="error" />
        <AlertList items={data?.warnings} type="warning" />

        {isReady && data?.errors?.length === 0 && data?.warnings?.length === 0 && (
          <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-emerald-300 text-sm">All required metadata is present. Ready to submit.</p>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button onClick={onPublish} disabled={!isReady || publishing} size="sm"
            className={cn("font-semibold text-white border-0 flex-1",
              isReady
                ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                : "bg-slate-700 cursor-not-allowed opacity-50")}>
            {publishing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Upload className="w-3 h-3 mr-1" />}
            {publishing ? "Submitting..." : status === 'not_submitted' ? "Submit" : "Re-Submit"}
          </Button>
          <a href={externalUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="text-xs">
              <ExternalLink className="w-3 h-3 mr-1" /> {externalLabel}
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function DistributionDashboard() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [publishing, setPublishing] = useState(null);
  const [channels, setChannels] = useState([]);
  const [providers, setProviders] = useState([]);

  const load = async () => {
    if (!bookId) return;
    setLoading(true);
    const [res, gwRes] = await Promise.all([
      invoke("get_status", { book_id: bookId }),
      base44.functions.invoke("publishingGateway", { action: "list_channels", book_id: bookId }).catch(() => null)
    ]);
    setData(res.data);
    setChannels(gwRes?.data?.channels || []);
    setProviders(gwRes?.data?.providers || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [bookId]);

  const handlePublish = async (platform) => {
    setPublishing(platform);
    // Log the export
    await invoke("log_export", {
      book_id: bookId,
      platform,
      action: `Submit to ${platform.toUpperCase()}`,
      metadata_snapshot: data?.book || {},
      errors: platform === 'kdp' ? data?.kdp?.errors : data?.acx?.errors,
      notes: `Submitted via Distribution Dashboard`
    });
    // Then call the existing publishToAmazon function
    await base44.functions.invoke('publishToAmazon', {
      book_id: bookId,
      publish_type: platform === 'kdp' ? 'manuscript' : 'audiobook'
    });
    await load();
    setPublishing(null);
  };

  const handleChannelSubmit = async (channel, format) => {
    setPublishing(channel);
    await base44.functions.invoke("publishingGateway", {
      action: "submit_channel", book_id: bookId, channel, format
    }).catch(() => null);
    await load();
    setPublishing(null);
  };

  const exportLog = data?.export_log || [];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-white/50 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="w-px h-5 bg-white/10" />
            <Package className="w-5 h-5 text-amber-400" />
            <div>
              <h1 className="text-white font-bold text-base leading-tight">Distribution Command Center</h1>
              {data?.book?.title && <p className="text-white/30 text-xs">{data.book.title}</p>}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn("w-3 h-3 mr-1", loading && "animate-spin")} /> Refresh
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 text-amber-400 animate-spin" /></div>
        ) : !data ? (
          <div className="text-center py-20 text-white/40">No distribution data available. Ensure a book ID is provided.</div>
        ) : (
          <>
            {/* Metadata Summary */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" /> Book Metadata Status
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Title", ok: !!data.book?.title },
                  { label: "Cover", ok: data.book?.has_cover },
                  { label: "Manuscript", ok: data.book?.has_manuscript },
                  { label: "Audiobook", ok: data.book?.has_audiobook },
                  { label: "Category", ok: !!data.book?.category },
                  { label: "Subtitle", ok: !!data.book?.subtitle },
                  { label: "Keywords", ok: (data.book?.subjects?.length || 0) >= 3 },
                  { label: `${data.book?.word_count?.toLocaleString() || 0} words`, ok: (data.book?.word_count || 0) >= 2500 }
                ].map((item, i) => (
                  <div key={i} className={cn("flex items-center gap-2 p-2.5 rounded-lg border text-xs",
                    item.ok ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-300" : "bg-red-500/8 border-red-500/20 text-red-300")}>
                    {item.ok ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Cards */}
            <div className="grid md:grid-cols-2 gap-5">
              <PlatformCard
                icon={FileText} title="Amazon KDP" iconColor="bg-gradient-to-br from-amber-500 to-orange-500"
                status={data.kdp?.status} data={data.kdp}
                onPublish={() => handlePublish('kdp')} publishing={publishing === 'kdp'}
                externalUrl="https://kdp.amazon.com" externalLabel="KDP Dashboard"
              />
              <PlatformCard
                icon={Headphones} title="Amazon ACX" iconColor="bg-gradient-to-br from-purple-500 to-purple-700"
                status={data.acx?.status} data={data.acx}
                onPublish={() => handlePublish('acx')} publishing={publishing === 'acx'}
                externalUrl="https://www.acx.com" externalLabel="ACX Dashboard"
              />
            </div>

            {/* Distribution Command Center — multi-channel via the publishing gateway */}
            <ProviderHealthBanner providers={providers} />
            <ChannelMatrix channels={channels} publishing={publishing} onSubmit={handleChannelSubmit} />
            <PrintEconomicsCard bookId={bookId} />

            {/* Export Log */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/8 flex items-center justify-between">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white/40" /> Export History
                </h2>
                <span className="text-white/30 text-xs">{exportLog.length} entries</span>
              </div>
              {exportLog.length === 0 ? (
                <div className="p-10 text-center text-white/25 text-sm">No submissions logged yet.</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {exportLog.map((log, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 text-xs flex-wrap">
                      <Badge className={cn("text-xs shrink-0",
                        log.platform === 'kdp' ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-purple-500/20 text-purple-300 border-purple-500/30")}>
                        {log.platform?.toUpperCase()}
                      </Badge>
                      <span className="text-white/70 flex-1">{log.action}</span>
                      <Badge className={cn("text-xs",
                        log.status === 'success' ? "bg-emerald-500/20 text-emerald-300 border-0" : "bg-red-500/20 text-red-300 border-0")}>
                        {log.status}
                      </Badge>
                      <span className="text-white/25">{new Date(log.created_date).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}