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
      <div className="max-w-6xl mx-auto px-5 py-10">
        <Link to={createPageUrl("Blog")} className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" /> The Journal
        </Link>

        <div className="grid lg:grid-cols-[300px_1fr] gap-10">
          <aside className="lg:sticky lg:top-6 h-fit rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <img src={author.portrait} alt={author.name} className="w-full aspect-square object-cover" />
            <div className="p-6">
              <h1 className="text-2xl font-bold text-white">{author.name}</h1>
              <p className="text-amber-400/90 text-sm mt-1">{author.title}</p>
              <p className="text-xs text-white/40 mt-1">{author.beat}</p>
              <div className="flex flex-wrap gap-2 mt-5">
                {author.signature_formats.map((f) => (
                  <span key={f} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/55">{f}</span>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-8">
            <blockquote className="flex gap-3 rounded-2xl border-l-2 border-amber-400/60 bg-amber-500/5 p-6 text-xl text-white/85 italic leading-snug">
              <Quote className="w-5 h-5 text-amber-400/70 flex-shrink-0 mt-1" />
              {author.tagline}
            </blockquote>

            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { label: "Education", text: author.education, icon: GraduationCap },
                { label: "Background", text: author.background },
                { label: "Persona & voice", text: author.voice },
              ].map((s) => (
                <section key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[10px] uppercase tracking-widest text-amber-400/70 mb-2 flex items-center gap-1.5">
                    {s.icon && <s.icon className="w-3.5 h-3.5" />} {s.label}
                  </p>
                  <p className="text-white/70 text-sm leading-relaxed">{s.text}</p>
                </section>
              ))}
              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-[10px] uppercase tracking-widest text-amber-400/70 mb-2">Strong opinions</p>
                <ul className="space-y-2">
                  {author.opinions.map((o) => <li key={o} className="text-white/70 text-sm leading-relaxed">— {o}</li>)}
                </ul>
              </section>
            </div>

        <section className="pt-8 border-t border-white/5">
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
      </div>
    </div>
  );
}