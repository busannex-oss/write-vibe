import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, X } from "lucide-react";

export default function ShareBookDialog({ bookId, bookTitle, onClose, onShared }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("editor");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!email.trim()) return;
    setSaving(true);
    try {
      await base44.entities.TeamMember.create({
        book_id: bookId,
        user_email: email.trim().toLowerCase(),
        name: name.trim() || email.trim(),
        role,
        status: "active",
      });
      try {
        await base44.users.inviteUser(email.trim().toLowerCase(), "user");
      } catch (_) {
        // likely already registered — that's fine
      }
      toast({ title: "Team member added", description: `${email} can now review and comment on "${bookTitle}".` });
      onShared?.();
      onClose?.();
    } catch (e) {
      toast({ title: "Could not add member", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold text-white">Share for review</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/50 hover:text-white w-8 h-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-white/50">Invite a team member to view drafts and leave comments on <strong className="text-white/80">{bookTitle}</strong>.</p>
          <div className="space-y-2">
            <Label className="text-white/70 text-xs">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@example.com" className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-white/70 text-xs">Name (optional)</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Editor" className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-white/70 text-xs">Role</Label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full h-9 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
              <option value="editor">Editor</option>
              <option value="co_author">Co-author</option>
              <option value="publisher">Publisher</option>
              <option value="marketing">Marketing</option>
              <option value="assistant">Assistant</option>
            </select>
          </div>
          <Button onClick={submit} disabled={saving || !email.trim()} className="w-full">
            <UserPlus className="w-4 h-4" />
            {saving ? "Sharing…" : "Share & invite"}
          </Button>
        </div>
      </div>
    </div>
  );
}