import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Film, Save, Loader2, CheckCircle2, ExternalLink, Key,
  Wand2, Play, Video, Zap, ImageIcon, Download, Trash2,
  FolderOpen, Calendar, Link2, Copy, HardDrive
} from "lucide-react";

const PROVIDERS = [
  {
    id: "runway",
    name: "Runway ML",
    description: "Gen-3 Alpha Turbo — cinematic video generation",
    badge: "Gen-3",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    iconColor: "text-purple-400",
    docsUrl: "https://docs.runwayml.com",
    models: ["gen3a_turbo", "gen-3 alpha"],
    keyPlaceholder: "rw_xxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "kling",
    name: "Kling AI",
    description: "High-fidelity 5–10s cinematic clips from text or image",
    badge: "v1.6",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    iconColor: "text-blue-400",
    docsUrl: "https://klingai.com/docs",
    models: ["kling-v1", "kling-v1.5", "kling-v1.6"],
    keyPlaceholder: "kling_xxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "veo",
    name: "Google Veo 2",
    description: "DeepMind's state-of-the-art video generation via Vertex AI",
    badge: "Veo 2",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    iconColor: "text-emerald-400",
    docsUrl: "https://cloud.google.com/vertex-ai/docs",
    models: ["veo-2", "veo-3"],
    keyPlaceholder: "AIza_xxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "seedance",
    name: "Seedance",
    description: "Fast, high-quality text-to-video and image-to-video",
    badge: "v1 Pro",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    iconColor: "text-amber-400",
    docsUrl: "https://seedance.ai/docs",
    models: ["seedance-v1", "seedance-v1-pro"],
    keyPlaceholder: "sd_xxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "sora",
    name: "OpenAI Sora",
    description: "OpenAI's video generation model — up to 60s clips",
    badge: "Sora",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    iconColor: "text-teal-400",
    docsUrl: "https://platform.openai.com/docs/guides/video",
    models: ["sora-1080p", "sora-720p"],
    keyPlaceholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "grok",
    name: "xAI Aurora (Grok)",
    description: "xAI's Aurora video model — photorealistic generation",
    badge: "Aurora",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    iconColor: "text-rose-400",
    docsUrl: "https://x.ai/api",
    models: ["aurora-v1"],
    keyPlaceholder: "xai-xxxxxxxxxxxxxxxxxxxxxxxx",
  },
];

const WebGLPreview = ({ canvasRef }) => (
  <canvas
    ref={canvasRef}
    width={480}
    height={270}
    className="w-full rounded-lg border border-white/10 bg-black"
    style={{ aspectRatio: "16/9" }}
  />
);

export default function AIVideoProduction({ user }) {
  const queryClient = useQueryClient();
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);
  const [saveAssetForm, setSaveAssetForm] = useState({ url: "", title: "", provider: "", duration: "", resolution: "", notes: "" });
  const [savingAsset, setSavingAsset] = useState(false);
  const [assetSaved, setAssetSaved] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Load saved video assets from Document entity
  const { data: videoAssets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["video-assets"],
    queryFn: () => base44.entities.Document.filter({ type: "promotional_material", status: "final" })
      .then(docs => docs.filter(d => d.title?.startsWith("[VIDEO]")))
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["video-assets"] })
  });

  const handleSaveAsset = async () => {
    if (!saveAssetForm.url || !saveAssetForm.title) return;
    setSavingAsset(true);
    try {
      await base44.entities.Document.create({
        type: "promotional_material",
        status: "final",
        book_id: "admin",
        title: `[VIDEO] ${saveAssetForm.title}`,
        file_url: saveAssetForm.url,
        content: JSON.stringify({
          provider: saveAssetForm.provider || config.active_provider,
          duration: saveAssetForm.duration || config.default_duration,
          resolution: saveAssetForm.resolution || config.default_resolution,
          notes: saveAssetForm.notes,
          saved_at: new Date().toISOString(),
        })
      });
      queryClient.invalidateQueries({ queryKey: ["video-assets"] });
      setSaveAssetForm({ url: "", title: "", provider: "", duration: "", resolution: "", notes: "" });
      setAssetSaved(true);
      setTimeout(() => setAssetSaved(false), 3000);
    } finally {
      setSavingAsset(false);
    }
  };

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (url, title) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "-")}.mp4`;
    a.target = "_blank";
    a.click();
  };

  const [config, setConfig] = useState({
    active_provider: "runway",
    runway_key: "", runway_model: "gen3a_turbo",
    kling_key: "", kling_model: "kling-v1.6",
    veo_key: "", veo_project: "", veo_model: "veo-2",
    seedance_key: "", seedance_model: "seedance-v1-pro",
    sora_key: "", sora_model: "sora-1080p",
    grok_key: "", grok_model: "aurora-v1",
    default_duration: "5",
    default_resolution: "1080p",
    default_aspect: "16:9",
    motion_intensity: "medium",
    style_preset: "cinematic",
    watermark: false,
    output_format: "mp4",
    webcodecs_enabled: true,
    webgl_preview: true,
    prompt_prefix: "Cinematic book trailer for Write Vibe:",
  });

  useEffect(() => {
    if (user?.video_production_config) {
      setConfig(prev => ({ ...prev, ...user.video_production_config }));
    }
  }, [user]);

  // WebGL animated preview canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !config.webgl_preview) return;
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    setPreviewActive(true);
    const vsSource = `
      attribute vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `;
    const fsSource = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.4;
        vec3 c = vec3(
          0.02 + 0.15 * sin(uv.x * 4.0 + t),
          0.02 + 0.08 * sin(uv.y * 3.0 + t * 1.3 + 1.0),
          0.08 + 0.18 * sin((uv.x + uv.y) * 5.0 + t * 0.7 + 2.0)
        );
        float vignette = 1.0 - length(uv - 0.5) * 1.2;
        gl_FragColor = vec4(c * vignette, 1.0);
      }
    `;

    const compileShader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s); return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(prog); gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_res");
    gl.uniform2f(uRes, canvas.width, canvas.height);

    let start = null;
    const render = (ts) => {
      if (!start) start = ts;
      gl.uniform1f(uTime, (ts - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animFrameRef.current = requestAnimationFrame(render);
    };
    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setPreviewActive(false);
    };
  }, [config.webgl_preview]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ video_production_config: config });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const set = (k, v) => setConfig(prev => ({ ...prev, [k]: v }));
  const activeProvider = PROVIDERS.find(p => p.id === config.active_provider);
  const inputClass = "bg-white/5 border-white/20 text-white placeholder:text-white/30";
  const labelClass = "text-white/70 mb-1 block text-sm";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/20 flex items-center justify-center">
            <Film className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              AI Movie Production
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">WebGL + WebCodecs</Badge>
            </h2>
            <p className="text-sm text-white/50">Generate cinematic book trailers using state-of-the-art AI video models</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {config.webgl_preview && previewActive && (
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              WebGL Live
            </Badge>
          )}
          {config.webcodecs_enabled && (
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">WebCodecs API</Badge>
          )}
        </div>
      </div>

      {/* WebGL Preview */}
      {config.webgl_preview && (
        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-xs font-medium text-white/50 uppercase tracking-wider flex items-center gap-2">
              <Play className="w-3.5 h-3.5" /> WebGL Real-Time Preview Canvas
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <WebGLPreview canvasRef={canvasRef} />
            <p className="text-xs text-white/30 mt-2">
              Live WebGL shader preview — this canvas will render generated video frames via WebCodecs API during production
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="providers">
        <TabsList className="bg-white/5 border border-white/10 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="assets" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
            <HardDrive className="w-3.5 h-3.5 mr-1.5" /> Saved Assets
            {videoAssets.length > 0 && (
              <span className="ml-1 bg-purple-500/40 text-purple-200 text-xs rounded-full px-1.5">{videoAssets.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="providers" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
            <Wand2 className="w-3.5 h-3.5 mr-1.5" /> AI Providers
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
            <Key className="w-3.5 h-3.5 mr-1.5" /> API Keys
          </TabsTrigger>
          <TabsTrigger value="production" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
            <Video className="w-3.5 h-3.5 mr-1.5" /> Production
          </TabsTrigger>
          <TabsTrigger value="webtech" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
            <Zap className="w-3.5 h-3.5 mr-1.5" /> Web APIs
          </TabsTrigger>
        </TabsList>

        {/* SAVED ASSETS */}
        <TabsContent value="assets" className="mt-4 space-y-4">
          {/* Save new asset form */}
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Save className="w-4 h-4 text-purple-400" /> Save a Generated Video Asset
              </CardTitle>
              <CardDescription className="text-white/40">Paste the URL returned by your AI video provider and save it to the library</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label className={labelClass}>Video Title *</Label>
                  <Input value={saveAssetForm.title} onChange={e => setSaveAssetForm(f => ({ ...f, title: e.target.value }))} placeholder="Book Trailer — The Midnight Code" className={inputClass} />
                </div>
                <div>
                  <Label className={labelClass}>Video URL *</Label>
                  <Input value={saveAssetForm.url} onChange={e => setSaveAssetForm(f => ({ ...f, url: e.target.value }))} placeholder="https://...mp4 or CDN URL" className={inputClass} />
                </div>
                <div>
                  <Label className={labelClass}>Provider Used</Label>
                  <select value={saveAssetForm.provider || config.active_provider} onChange={e => setSaveAssetForm(f => ({ ...f, provider: e.target.value }))}
                    className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/20 text-white">
                    {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className={labelClass}>Duration</Label>
                    <Input value={saveAssetForm.duration} onChange={e => setSaveAssetForm(f => ({ ...f, duration: e.target.value }))} placeholder="5s" className={inputClass} />
                  </div>
                  <div>
                    <Label className={labelClass}>Resolution</Label>
                    <Input value={saveAssetForm.resolution} onChange={e => setSaveAssetForm(f => ({ ...f, resolution: e.target.value }))} placeholder="1080p" className={inputClass} />
                  </div>
                </div>
              </div>
              <div>
                <Label className={labelClass}>Notes / Prompt Used</Label>
                <Textarea value={saveAssetForm.notes} onChange={e => setSaveAssetForm(f => ({ ...f, notes: e.target.value }))} placeholder="Describe the prompt or notes for this video..." className={`${inputClass} min-h-[60px]`} />
              </div>
              <Button onClick={handleSaveAsset} disabled={savingAsset || !saveAssetForm.url || !saveAssetForm.title}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                {savingAsset ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> :
                  assetSaved ? <><CheckCircle2 className="w-4 h-4 mr-2" />Saved to Library!</> :
                  <><HardDrive className="w-4 h-4 mr-2" />Save to Video Library</>}
              </Button>
            </CardContent>
          </Card>

          {/* Assets list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider flex items-center gap-2">
                <FolderOpen className="w-4 h-4" /> Video Library
                <Badge className="bg-white/10 text-white/50 border-0">{videoAssets.length} asset{videoAssets.length !== 1 ? "s" : ""}</Badge>
              </h3>
            </div>

            {assetsLoading ? (
              <div className="py-8 text-center"><Loader2 className="w-6 h-6 text-purple-400 animate-spin mx-auto" /></div>
            ) : videoAssets.length === 0 ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-10 text-center">
                  <Film className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No video assets saved yet. Generate a video and save it above.</p>
                </CardContent>
              </Card>
            ) : (
              videoAssets.map(asset => {
                const meta = (() => { try { return JSON.parse(asset.content || "{"); } catch { return {}; } })();
                const providerInfo = PROVIDERS.find(p => p.id === meta.provider);
                const displayTitle = asset.title.replace("[VIDEO] ", "");
                return (
                  <Card key={asset.id} className="bg-white/5 border-white/10 hover:border-purple-500/20 transition-all">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Film className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            <p className="font-medium text-white truncate">{displayTitle}</p>
                            {providerInfo && (
                              <Badge className={`${providerInfo.badgeColor} text-xs`}>{providerInfo.name}</Badge>
                            )}
                            {meta.duration && <Badge className="bg-white/10 text-white/50 border-white/10 text-xs">{meta.duration}s</Badge>}
                            {meta.resolution && <Badge className="bg-white/10 text-white/50 border-white/10 text-xs">{meta.resolution}</Badge>}
                          </div>
                          {meta.notes && <p className="text-xs text-white/40 mt-1 truncate">{meta.notes}</p>}
                          <div className="flex items-center gap-2 mt-1.5">
                            <Calendar className="w-3 h-3 text-white/20" />
                            <span className="text-xs text-white/30">
                              {meta.saved_at ? new Date(meta.saved_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                            </span>
                            {asset.file_url && (
                              <a href={asset.file_url} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-purple-400/60 hover:text-purple-300 flex items-center gap-0.5 ml-2">
                                <Link2 className="w-3 h-3" /> Preview
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {asset.file_url && (
                            <>
                              <Button size="icon" variant="ghost"
                                onClick={() => handleCopyUrl(asset.file_url, asset.id)}
                                className="text-white/40 hover:text-white hover:bg-white/10 w-8 h-8"
                                title="Copy URL">
                                {copiedId === asset.id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              </Button>
                              <Button size="icon" variant="ghost"
                                onClick={() => handleDownload(asset.file_url, displayTitle)}
                                className="text-white/40 hover:text-purple-400 hover:bg-white/10 w-8 h-8"
                                title="Download">
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button size="icon" variant="ghost"
                            onClick={() => confirm("Delete this video asset?") && deleteAssetMutation.mutate(asset.id)}
                            className="text-white/40 hover:text-red-400 hover:bg-red-500/10 w-8 h-8"
                            title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* PROVIDERS */}
        <TabsContent value="providers" className="mt-4 space-y-4">
          <p className="text-sm text-white/50">Select your active AI video provider. Configure API keys in the <span className="text-purple-300">API Keys</span> tab.</p>
          <div className="grid md:grid-cols-2 gap-3">
            {PROVIDERS.map(p => (
              <button
                key={p.id}
                onClick={() => set("active_provider", p.id)}
                className={`text-left rounded-xl border p-4 transition-all ${
                  config.active_provider === p.id
                    ? "bg-purple-500/15 border-purple-500/40 shadow-lg shadow-purple-500/10"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Film className={`w-4 h-4 ${p.iconColor}`} />
                    <span className="font-semibold text-white text-sm">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge className={`${p.badgeColor} text-xs`}>{p.badge}</Badge>
                    {config.active_provider === p.id && (
                      <Badge className="bg-purple-500/30 text-purple-200 border-purple-400/40 text-xs">Active</Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-white/50">{p.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-white/30">Models: {p.models.slice(0, 2).join(", ")}</span>
                  <a href={p.docsUrl} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className={`text-xs ${p.iconColor} hover:underline flex items-center gap-0.5`}>
                    Docs <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        {/* API KEYS */}
        <TabsContent value="active" className="mt-4 space-y-4">
          {PROVIDERS.map(p => (
            <Card key={p.id} className={`border transition-all ${config.active_provider === p.id ? "bg-purple-500/10 border-purple-500/30" : "bg-white/5 border-white/10"}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Film className={`w-4 h-4 ${p.iconColor}`} />
                  {p.name}
                  <Badge className={`${p.badgeColor} text-xs`}>{p.badge}</Badge>
                  {config.active_provider === p.id && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs ml-auto">Active Provider</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label className={labelClass}>API Key</Label>
                    <Input
                      value={config[`${p.id}_key`] || ""}
                      onChange={(e) => set(`${p.id}_key`, e.target.value)}
                      placeholder={p.keyPlaceholder}
                      type="password"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <Label className={labelClass}>Model</Label>
                    <select
                      value={config[`${p.id}_model`] || p.models[0]}
                      onChange={(e) => set(`${p.id}_model`, e.target.value)}
                      className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/20 text-white"
                    >
                      {p.models.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  {p.id === "veo" && (
                    <div>
                      <Label className={labelClass}>GCP Project ID</Label>
                      <Input
                        value={config.veo_project || ""}
                        onChange={(e) => set("veo_project", e.target.value)}
                        placeholder="my-gcp-project-id"
                        className={inputClass}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* PRODUCTION */}
        <TabsContent value="production" className="mt-4 space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-400" /> Production Defaults
              </CardTitle>
              <CardDescription className="text-white/40">
                Applied to all book trailer generations via Write Vibe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className={labelClass}>Duration (seconds)</Label>
                  <select value={config.default_duration} onChange={(e) => set("default_duration", e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/20 text-white">
                    {["4","5","8","10","15","30","60"].map(v => <option key={v} value={v}>{v}s</option>)}
                  </select>
                </div>
                <div>
                  <Label className={labelClass}>Resolution</Label>
                  <select value={config.default_resolution} onChange={(e) => set("default_resolution", e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/20 text-white">
                    {["480p","720p","1080p","4K"].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <Label className={labelClass}>Aspect Ratio</Label>
                  <select value={config.default_aspect} onChange={(e) => set("default_aspect", e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/20 text-white">
                    {["16:9","9:16","1:1","4:3","21:9"].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <Label className={labelClass}>Motion Intensity</Label>
                  <select value={config.motion_intensity} onChange={(e) => set("motion_intensity", e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/20 text-white">
                    {["low","medium","high","dynamic"].map(v => <option key={v} value={v} className="capitalize">{v}</option>)}
                  </select>
                </div>
                <div>
                  <Label className={labelClass}>Style Preset</Label>
                  <select value={config.style_preset} onChange={(e) => set("style_preset", e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/20 text-white">
                    {["cinematic","documentary","dramatic","fantasy","noir","animated","realistic"].map(v => (
                      <option key={v} value={v} className="capitalize">{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className={labelClass}>Output Format</Label>
                  <select value={config.output_format} onChange={(e) => set("output_format", e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/20 text-white">
                    {["mp4","webm","mov","gif"].map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <Label className={labelClass}>Global Prompt Prefix</Label>
                <Textarea
                  value={config.prompt_prefix}
                  onChange={(e) => set("prompt_prefix", e.target.value)}
                  placeholder="Cinematic book trailer for Write Vibe:"
                  className={`${inputClass} min-h-[70px]`}
                />
                <p className="text-xs text-white/30 mt-1">Prepended to every video generation prompt for consistent brand tone</p>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-white/5">
                <div>
                  <p className="text-sm text-white">Remove Watermark</p>
                  <p className="text-xs text-white/40">Requires provider plan that supports no-watermark output</p>
                </div>
                <Switch checked={config.watermark} onCheckedChange={(v) => set("watermark", v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WEB APIs */}
        <TabsContent value="webtech" className="mt-4 space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" /> Browser Web API Configuration
              </CardTitle>
              <CardDescription className="text-white/40">
                WebGL and WebCodecs power local video rendering, preview, and frame processing inside the browser
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <p className="text-sm font-medium text-white flex items-center gap-2">
                      WebGL Preview Canvas
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">GPU Accelerated</Badge>
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">Real-time shader-based preview canvas while video is generating. Uses GPU for rendering.</p>
                  </div>
                  <Switch checked={config.webgl_preview} onCheckedChange={(v) => set("webgl_preview", v)} />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <p className="text-sm font-medium text-white flex items-center gap-2">
                      WebCodecs API
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">Hardware Decode</Badge>
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">Hardware-accelerated video frame decoding. Enables frame-level processing, scrubbing, and export without plugins.</p>
                  </div>
                  <Switch checked={config.webcodecs_enabled} onCheckedChange={(v) => set("webcodecs_enabled", v)} />
                </div>
              </div>

              {/* Tech capability breakdown */}
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  {
                    icon: <ImageIcon className="w-4 h-4 text-purple-400" />,
                    title: "WebGL Capabilities",
                    items: [
                      "Shader-based frame compositing",
                      "Real-time color grading & LUTs",
                      "GPU-accelerated text overlay rendering",
                      "Live preview during AI generation",
                      "WebGL2 multi-pass rendering pipeline",
                    ]
                  },
                  {
                    icon: <Video className="w-4 h-4 text-blue-400" />,
                    title: "WebCodecs Capabilities",
                    items: [
                      "Hardware H.264 / VP9 / AV1 decode",
                      "Frame-accurate video scrubbing",
                      "Client-side MP4 / WebM muxing",
                      "Zero-plugin browser video export",
                      "Streaming decode for long-form content",
                    ]
                  }
                ].map(section => (
                  <div key={section.title} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                      {section.icon} {section.title}
                    </p>
                    <ul className="space-y-1">
                      {section.items.map(item => (
                        <li key={item} className="text-xs text-white/50 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-white/20 inline-block flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Pipeline diagram */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <p className="text-xs font-semibold text-purple-300 mb-3 uppercase tracking-wider">Production Pipeline</p>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {[
                    { label: "Book Metadata", color: "bg-white/10 text-white/70" },
                    { arrow: true },
                    { label: "Prompt Builder", color: "bg-purple-500/20 text-purple-300" },
                    { arrow: true },
                    { label: activeProvider?.name || "AI Provider", color: "bg-pink-500/20 text-pink-300" },
                    { arrow: true },
                    { label: "WebCodecs Decode", color: "bg-blue-500/20 text-blue-300" },
                    { arrow: true },
                    { label: "WebGL Composite", color: "bg-emerald-500/20 text-emerald-300" },
                    { arrow: true },
                    { label: "MP4 Export", color: "bg-amber-500/20 text-amber-300" },
                  ].map((step, i) =>
                    step.arrow ? (
                      <span key={i} className="text-white/20">→</span>
                    ) : (
                      <span key={i} className={`px-2 py-1 rounded-md border border-white/10 font-medium ${step.color}`}>
                        {step.label}
                      </span>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4 mr-2" />Saved!</>
          ) : (
            <><Save className="w-4 h-4 mr-2" />Save Video Production Settings</>
          )}
        </Button>
        {saved && <span className="text-sm text-purple-400">Configuration saved successfully.</span>}
      </div>
    </div>
  );
}