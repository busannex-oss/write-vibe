import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Library, Search, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LoadTemplateDialog({ open, onClose, type, onApply }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSelectedId(null);
    base44.entities.Template
      .filter({ type }, "-updated_date", 50)
      .then(setTemplates)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, type]);

  const filtered = templates.filter(
    (t) =>
      !search ||
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())
  );
  const selected = templates.find((t) => t.id === selectedId);

  const handleApply = () => {
    if (!selected) return;
    onApply(selected);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Library className="w-4 h-4 text-amber-400" /> Load {type === "character" ? "Character" : "Outline"} Template
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="w-4 h-4 text-white/30 absolute left-3 top-3" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="bg-white/5 border-white/20 text-white pl-9"
          />
        </div>
        <div className="max-h-80 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-white/40 text-sm py-8">
              No templates yet. Save one from the {type === "character" ? "character editor" : "outline generator"}.
            </p>
          ) : (
            filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedId === t.id
                    ? "bg-amber-500/10 border-amber-500/40"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white text-sm">{t.name}</span>
                  {t.is_favorite && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                </div>
                {t.description && <p className="text-white/40 text-xs mt-0.5 line-clamp-2">{t.description}</p>}
                {t.category && (
                  <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs mt-1.5">{t.category}</Badge>
                )}
              </button>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/20 text-white hover:bg-white/10">
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!selected} className="bg-amber-500 hover:bg-amber-600 text-black">
            Use Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}