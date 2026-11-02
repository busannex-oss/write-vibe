import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function FirstBookStep({ book, onCreated }) {
  const [form, setForm] = useState({ title: "", category: "", plot_summary: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (book) {
    return (
      <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-white/80 flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        <span><b className="text-white">{book.title}</b> is set up. You can keep shaping it in the Book Editor.</span>
      </div>
    );
  }

  const create = async () => {
    if (!form.title.trim()) return setError("Give your book a working title.");
    setSaving(true);
    setError("");
    try {
      onCreated(await base44.entities.Book.create({ ...form, title: form.title.trim(), status: "draft" }));
    } catch (e) {
      setError(e.message || "Could not create the book. Please try again.");
    }
    setSaving(false);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <div className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10">
      <Input placeholder="Working title" value={form.title} onChange={set("title")} />
      <Input placeholder="Genre (e.g. Romance, Thriller, Self-help)" value={form.category} onChange={set("category")} />
      <Textarea rows={4} placeholder="What's your book about? A few sentences is plenty." value={form.plot_summary} onChange={set("plot_summary")} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button onClick={create} disabled={saving}>
        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create my book project
      </Button>
    </div>
  );
}