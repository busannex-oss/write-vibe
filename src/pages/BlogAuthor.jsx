import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Quote, GraduationCap } from "lucide-react";
import { getBlogAuthor } from "@/lib/blogAuthors";
import BlogCard from "@/components/blog/BlogCard";

export default function BlogAuthor() {
  const id = new URLSearchParams(window.location.search).get("id");
  const author = getBlogAuthor(id);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-author-posts', author?.name],
    queryFn: () => base44.entities.BlogPost.filter({ status: "published", author_name: author.name }, '-published_at', 30),
    enabled: !!author
  });

  if (!author) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white/50">
        Writer not found. <Link to={createPageUrl("Blog")} className="text-amber-400 ml-2">Back to the blog</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-5 py-10">
        <Link to={createPageUrl("Blog")} className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" /> The Journal
        </Link>

        <div className="flex flex-col sm:flex-row gap-6">
          <img src={author.portrait} alt={author.name} className="w-28 h-28 rounded-2xl object-cover" />
          <div>
            <h1 className="text-3xl font-bold text-white">{author.name}</h1>
            <p className="text-amber-400/90 mt-1">{author.title}</p>
            <p className="text-xs text-white/35 mt-1">{author.id} · {author.beat}</p>
            <p className="flex gap-2 mt-4 text-white/70 italic">
              <Quote className="w-4 h-4 text-amber-400/60 flex-shrink-0 mt-1" />
              {author.tagline}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mt-10">
          <section>
            <p className="text-[10px] uppercase tracking-widest text-white/35 mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" /> Education
            </p>
            <p className="text-white/65 text-sm">{author.education}</p>
          </section>
          <section>
            <p className="text-[10px] uppercase tracking-widest text-white/35 mb-2">Background</p>
            <p className="text-white/65 text-sm">{author.background}</p>
          </section>
          <section>
            <p className="text-[10px] uppercase tracking-widest text-white/35 mb-2">Persona & voice</p>
            <p className="text-white/65 text-sm">{author.voice}</p>
          </section>
          <section>
            <p className="text-[10px] uppercase tracking-widest text-white/35 mb-2">Strong opinions</p>
            <ul className="space-y-1">
              {author.opinions.map((o) => <li key={o} className="text-white/65 text-sm">— {o}</li>)}
            </ul>
          </section>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          {author.signature_formats.map((f) => (
            <span key={f} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/55">{f}</span>
          ))}
        </div>

        <section className="mt-12 pt-8 border-t border-white/5">
          <h2 className="text-xl font-bold text-white mb-5">Articles by {author.name.split(" ")[0]}</h2>
          {isLoading ? (
            <div className="py-10 text-center">
              <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-white/40 text-sm">No published articles yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {posts.map((p) => <BlogCard key={p.id} post={p} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}