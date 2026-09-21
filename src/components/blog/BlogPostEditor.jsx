import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save, Sparkles, X, CalendarClock } from "lucide-react";

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function BlogPostEditor({ post, user, onSaved, onCancel }) {
  const [form, setForm] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    cover_image_url: post?.cover_image_url || "",
    tags: (post?.tags || []).join(", "),
    cta_headline: post?.cta_headline || "",
    status: post?.status || "draft",
    scheduled_for: post?.scheduled_for ? post.scheduled_for.slice(0, 16) : ""
  });
  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const generateDraft = async () => {
    if (!form.title) return;
    setDrafting(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a blog post for Write Vibe, an AI book publishing platform for authors.
Title: ${form.title}
Audience: authors who want to write, publish and market books and grow a loyal readership.
Write 600-900 words of genuinely useful, specific advice in markdown with subheadings. Warm, practical, no fluff.
Also give a 2-sentence excerpt, 3 tags, and a newsletter CTA headline that makes readers want to subscribe.`,
      response_json_schema: {
        type: "object",
        properties: {
          content: { type: "string" },
          excerpt: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          cta_headline: { type: "string" }
        }
      }
    });
    setForm((p) => ({
      ...p,
      content: res.content || p.content,
      excerpt: res.excerpt || p.excerpt,
      tags: (res.tags || []).join(", ") || p.tags,
      cta_headline: res.cta_headline || p.cta_headline
    }));
    setDrafting(false);
  };

  const save = async (status) => {
    setSaving(true);
    const data = {
      ...form,
      status,
      slug: form.slug || slugify(form.title),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      author_name: post?.author_name || user?.full_name || "Write Vibe",
      seo_title: form.title,
      seo_description: form.excerpt,
      scheduled_for: status === "scheduled" && form.scheduled_for ? new Date(form.scheduled_for).toISOString() : null,
      published_at: status === "published" ? post?.published_at || new Date().toISOString() : post?.published_at
    };
    if (post?.id) await base44.entities.BlogPost.update(post.id, data);
    else await base44.entities.BlogPost.create(data);
    setSaving(false);
    onSaved();
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-white font-semibold">{post ? "Edit post" : "New post"}</p>
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div>
          <Label className="text-white/70 mb-2 block">Title</Label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="How I sold 1,000 copies without ads" />
        </div>

        <Button onClick={generateDraft} disabled={drafting || !form.title} className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
          {drafting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {drafting ? "Drafting..." : "Draft with AI"}
        </Button>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-white/70 mb-2 block">Slug</Label>
            <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto from title" />
          </div>
          <div>
            <Label className="text-white/70 mb-2 block">Tags (comma separated)</Label>
            <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="marketing, craft" />
          </div>
        </div>

        <div>
          <Label className="text-white/70 mb-2 block">Cover image URL</Label>
          <Input value={form.cover_image_url} onChange={(e) => set("cover_image_url", e.target.value)} placeholder="https://..." />
        </div>

        <div>
          <Label className="text-white/70 mb-2 block">Excerpt</Label>
          <Textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} />
        </div>

        <div>
          <Label className="text-white/70 mb-2 block">Content (markdown)</Label>
          <Textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={14} className="font-mono text-sm" />
        </div>

        <div>
          <Label className="text-white/70 mb-2 block">Newsletter CTA headline</Label>
          <Input value={form.cta_headline} onChange={(e) => set("cta_headline", e.target.value)} placeholder="Get the next post in your inbox" />
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <Label className="text-white/70 mb-2 block flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-amber-400" /> Go live on
          </Label>
          <Input
            type="datetime-local"
            value={form.scheduled_for}
            onChange={(e) => set("scheduled_for", e.target.value)}
          />
          <p className="text-[11px] text-white/35 mt-2">
            Pick a date and time, then use “Schedule” — the post publishes itself automatically.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => save("draft")} disabled={saving || !form.title} className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
            <Save className="w-4 h-4 mr-2" /> Save draft
          </Button>
          <Button
            onClick={() => save("scheduled")}
            disabled={saving || !form.title || !form.scheduled_for}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            <CalendarClock className="w-4 h-4 mr-2" /> Schedule
          </Button>
          <Button onClick={() => save("published")} disabled={saving || !form.title} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Publish
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}