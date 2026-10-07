import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import { AREAS, ACTIONS, HIGH_RISK_ACTIONS } from "@/lib/agentTasks";
import { findAgent } from "@/lib/agentDirectory";

const sel = "w-full h-9 rounded-md px-2 text-sm";

export default function AgentTaskForm({ books, onCreate }) {
  const [f, setF] = useState({ title: "", instructions: "", area: "writing", action_type: "draft", book_id: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const agent = findAgent(AREAS.find((a) => a.value === f.area).agent);
    await onCreate({
      ...f,
      risk: HIGH_RISK_ACTIONS.includes(f.action_type) ? "high" : "low",
      agent_key: agent?.key,
      agent_name: agent?.name,
      status: "queued"
    });
    setF({ ...f, title: "", instructions: "" });
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
      <Input required placeholder="What should the agent do? e.g. Draft a launch email sequence" value={f.title} onChange={set("title")} />
      <Textarea placeholder="Extra instructions (optional)" value={f.instructions} onChange={set("instructions")} rows={2} />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <select className={sel} value={f.area} onChange={set("area")}>{AREAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}</select>
        <select className={sel} value={f.action_type} onChange={set("action_type")}>{ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}</select>
        <select className={sel} value={f.book_id} onChange={set("book_id")}>
          <option value="">No specific book</option>
          {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
        </select>
        <Button type="submit" disabled={saving} className="bg-amber-500 text-slate-950 hover:bg-amber-600">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}Assign
        </Button>
      </div>
    </form>
  );
}