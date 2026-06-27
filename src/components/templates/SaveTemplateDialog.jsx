import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Bookmark } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SaveTemplateDialog({ open, onClose, type, data, defaultName = "" }) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setDescription("");
      setCategory("");
      setTags("");
    }
  }, [open, defaultName]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Template.create({
        name: name.trim(),
        type,
        description: description.trim(),
        category: category.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        character_data: type === "character" ? data : undefined,
        outline_data: type === "outline" ? data : undefined,
        is_favorite: false,
      });
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to save template");
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-400" /> Save as Template
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-white/70">Template Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === "character" ? "e.g. Reluctant Hero" : "e.g. 3-Act Fantasy Structure"}
              className="bg-white/5 border-white/20 text-white mt-1"
            />
          </div>
          <div>
            <Label className="text-white/70">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this reusable?"
              className="bg-white/5 border-white/20 text-white mt-1"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/70">Category (optional)</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Fantasy"
                className="bg-white/5 border-white/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Tags (comma-separated)</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="hero, mentor"
                className="bg-white/5 border-white/20 text-white mt-1"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/20 text-white hover:bg-white/10">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()} className="bg-amber-500 hover:bg-amber-600 text-black">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bookmark className="w-4 h-4 mr-2" />}
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}