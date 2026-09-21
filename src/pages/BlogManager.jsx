import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Pencil, Trash2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import BlogPostEditor from "@/components/blog/BlogPostEditor";
import LinkedInShareCard from "@/components/blog/LinkedInShareCard";

export default function BlogManager() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data: user } = useQuery({ queryKey: ['user'], queryFn: () => base44.auth.me(), staleTime: 60000 });
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts-admin'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 100)
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['blog-posts-admin'] });
    qc.invalidateQueries({ queryKey: ['blog-index'] });
    setEditing(null);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    await base44.entities.BlogPost.delete(id);
    refresh();
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Blog</h1>
          <p className="text-white/50 mt-1">Publish articles that attract readers and grow your newsletter.</p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl("Blog")}>
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10">
              <ExternalLink className="w-4 h-4 mr-2" /> View blog
            </Button>
          </Link>
          <Button onClick={() => setEditing({})} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            <Plus className="w-4 h-4 mr-2" /> New Post
          </Button>
        </div>
      </div>

      <LinkedInShareCard posts={posts} />

      {editing && (
        <div className="mb-8">
          <BlogPostEditor post={editing.id ? editing : null} user={user} onSaved={refresh} onCancel={() => setEditing(null)} />
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : posts.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center text-white/40">No posts yet — write your first one.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <Card key={p.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium truncate">{p.title}</p>
                    <Badge className={p.status === "published" ? "bg-emerald-500/15 text-emerald-300 border-0" : "bg-white/10 text-white/50 border-0"}>
                      {p.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-white/35 mt-1">
                    {p.published_at ? format(new Date(p.published_at), "MMM d, yyyy") : "unpublished"}
                    {" · "}<Eye className="w-3 h-3 inline -mt-0.5" /> {p.view_count || 0} views
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditing(p)} className="text-white/50 hover:text-white">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(p.id)} className="text-red-400/70 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}