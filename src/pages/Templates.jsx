import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Library, Star, Trash2, User, FileText, Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.Template.list("-updated_date", 100);
      setTemplates(all);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this template?")) return;
    await base44.entities.Template.delete(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleFavorite = async (t) => {
    await base44.entities.Template.update(t.id, { is_favorite: !t.is_favorite });
    setTemplates((prev) => prev.map((x) => (x.id === t.id ? { ...x, is_favorite: !x.is_favorite } : x)));
  };

  const filtered = templates.filter(
    (t) =>
      (filter === "all" || t.type === filter) &&
      (!search ||
        t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
            <Library className="w-7 h-7 text-amber-400" /> Template Library
          </h1>
          <p className="text-white/40 text-sm">
            Save your favorite character profiles and book outlines to reuse across future projects.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex gap-2">
            {["all", "character", "outline"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === f ? "bg-amber-500 text-black" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                {f === "all" ? "All" : f + "s"}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-white/30 absolute left-3 top-3" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="bg-white/5 border-white/10 text-white pl-9 w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-16 text-center">
              <Library className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No templates yet</h3>
              <p className="text-white/50 mb-4">
                Save character profiles or outlines from the Book Editor to build your reusable library.
              </p>
              <Link to={createPageUrl("Books")}>
                <Button className="bg-amber-500 hover:bg-amber-600 text-black">Go to Books</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((t) => (
              <Card key={t.id} className="bg-white/5 border-white/10 card-hover">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                        {t.type === "character" ? (
                          <User className="w-5 h-5 text-amber-400" />
                        ) : (
                          <FileText className="w-5 h-5 text-amber-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold truncate">{t.name}</h3>
                        <Badge className="bg-white/10 text-white/50 border-0 text-xs mt-1 capitalize">{t.type}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => toggleFavorite(t)}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors"
                        title="Toggle favorite"
                      >
                        <Star
                          className={`w-4 h-4 ${t.is_favorite ? "text-amber-400 fill-amber-400" : "text-white/30"}`}
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400/70" />
                      </button>
                    </div>
                  </div>
                  {t.description && <p className="text-white/50 text-sm mt-3 line-clamp-2">{t.description}</p>}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {t.category && (
                      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">{t.category}</Badge>
                    )}
                    {t.tags?.map((tag, i) => (
                      <Badge key={i} className="bg-white/5 text-white/40 border-0 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}