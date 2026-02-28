import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Loader2, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Mail,
  Check
} from "lucide-react";
import { motion } from "framer-motion";

const SOCIAL_ICONS = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube
};

export default function BookWebsite() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");
  const [email, setEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState(false);

  const { data: book, isLoading } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => base44.entities.Book.filter({ id: bookId }),
    select: (data) => data[0],
    enabled: !!bookId
  });

  const subscribeMutation = useMutation({
    mutationFn: (email) => base44.entities.NewsletterSubscriber.create({
      book_id: bookId,
      email,
      subscribed_at: new Date().toISOString()
    }),
    onSuccess: () => setSubscribed(true)
  });

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      subscribeMutation.mutate(email);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Book not found</h1>
        </div>
      </div>
    );
  }

  const isComingSoon = book.website_config?.status !== "live";
  const bookstores = book.selected_bookstores || [];
  const socialLinks = book.social_media_links || {};

  const BOOKSTORE_INFO = {
    amazon: { name: "Amazon", logo: "📦" },
    barnes_noble: { name: "Barnes & Noble", logo: "📚" },
    apple_books: { name: "Apple Books", logo: "🍎" },
    google_play: { name: "Google Play", logo: "📖" },
    kobo: { name: "Kobo", logo: "📕" },
    audible: { name: "Audible", logo: "🎧" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section - Maximized Impact */}
      <section className="relative py-16 px-6 min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-slate-950" />
        <div className="max-w-6xl mx-auto relative w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Book Cover - Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              {book.front_cover_url ? (
                <div className="relative group">
                  <div className="absolute -inset-6 bg-gradient-to-br from-amber-500/30 to-orange-500/20 rounded-2xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity" />
                  <img 
                    src={book.front_cover_url} 
                    alt={book.title}
                    className="relative w-80 h-auto rounded-2xl shadow-2xl shadow-black/80 object-cover"
                  />
                </div>
              ) : (
                <div className="w-80 aspect-[2/3] rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                  <BookOpen className="w-24 h-24 text-white/20" />
                </div>
              )}
            </motion.div>

            {/* Copy & CTA - Right Side */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Status Badge */}
              {isComingSoon && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/40">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-sm font-semibold text-amber-300">Coming Soon</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="text-2xl text-amber-400 font-light">{book.subtitle}</p>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-3 items-center">
                <Badge className="bg-gradient-to-r from-amber-500/30 to-orange-500/20 text-amber-300 border-amber-500/40 text-sm px-4 py-2">
                  {book.category}
                </Badge>
                {book.subjects?.slice(0, 2).map((subject) => (
                  <Badge key={subject} className="bg-white/10 text-white/80 border-white/20 text-sm">
                    {subject}
                  </Badge>
                ))}
              </div>

              {/* Hook/Teaser Copy */}
              <div className="text-lg text-white/80 leading-relaxed font-light">
                <p>{book.book_summary?.slice(0, 150)}...</p>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 pt-4">
                {isComingSoon ? (
                  <>
                    <p className="text-white/60 text-sm">Available on release date</p>
                    <Button className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-lg border-0 rounded-xl shadow-lg shadow-amber-500/30">
                      Notify Me When Available
                    </Button>
                  </>
                ) : bookstores.length > 0 ? (
                  <Button className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-lg border-0 rounded-xl shadow-lg shadow-emerald-500/30">
                    Buy Now
                  </Button>
                ) : null}
                
                <Button variant="outline" className="w-full h-12 border-white/30 text-white hover:bg-white/10 rounded-xl font-semibold">
                  📖 Read More Details
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="pt-6 border-t border-white/10 space-y-2 text-sm text-white/60">
                <p>✓ Instant delivery to your device</p>
                <p>✓ Available in multiple formats</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Full Summary Section */}
      {book.book_summary && (
        <section className="py-20 px-6 bg-gradient-to-b from-transparent via-white/5 to-transparent">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-bold text-white text-center">About This Book</h2>
              <p className="text-lg text-white/80 leading-relaxed text-center">
                {book.book_summary}
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Buy Buttons */}
      {!isComingSoon && bookstores.length > 0 && (
        <section className="py-16 px-6 bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-y border-white/10">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Get Your Copy Today</h2>
              <p className="text-white/60">Available on your favorite platforms</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {bookstores.map((storeId) => {
                const store = BOOKSTORE_INFO[storeId];
                const link = book.website_config?.bookstore_links?.[storeId];
                if (!store) return null;
                return (
                  <a
                    key={storeId}
                    href={link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 px-4 py-4 rounded-xl bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white transition-all border border-white/10 hover:border-white/20"
                  >
                    <span className="text-2xl">{store.logo}</span>
                    <span className="font-semibold text-sm">{store.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section - High Converting */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-slate-900/50 border border-amber-500/40 p-12 space-y-6"
          >
            <div className="text-center">
              <Mail className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                {isComingSoon ? "📬 Get Notified on Release" : "📬 Exclusive Updates"}
              </h2>
              <p className="text-white/70 text-lg">
                {isComingSoon 
                  ? "Be among the first to know. Limited early access for subscribers."
                  : "Exclusive content, behind-the-scenes stories, and special offers for subscribers."
                }
              </p>
            </div>
            
            {subscribed ? (
              <div className="flex items-center justify-center gap-3 text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl py-4 px-6">
                <Check className="w-6 h-6" />
                <span className="font-semibold">Success! Check your email to confirm.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                  required
                />
                <Button 
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 rounded-xl font-bold text-lg shadow-lg shadow-amber-500/30"
                  disabled={subscribeMutation.isPending}
                >
                  {subscribeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  ) : (
                    "✓ Notify Me"
                  )}
                </Button>
                <p className="text-center text-xs text-white/50">No spam, just updates about the book.</p>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Author Section */}
      {book.author_photo_url && (
        <section className="py-16 px-6 border-t border-white/5">
          <div className="max-w-2xl mx-auto text-center">
            <img 
              src={book.author_photo_url} 
              alt="Author" 
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-lg font-semibold text-white mb-2">About the Author</h3>
            <p className="text-white/50">
              The author of {book.title}
            </p>
          </div>
        </section>
      )}

      {/* Footer with Social Links */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          {Object.keys(socialLinks).filter(k => socialLinks[k]).length > 0 && (
            <div className="flex justify-center gap-4 mb-8">
              {Object.entries(socialLinks)
                .filter(([_, url]) => url)
                .map(([id, url]) => {
                  const Icon = SOCIAL_ICONS[id];
                  return (
                    <a
                      key={id}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                    >
                      {Icon ? <Icon className="w-5 h-5" /> : <span className="text-sm">{id.charAt(0).toUpperCase()}</span>}
                    </a>
                  );
                })}
            </div>
          )}
          <p className="text-center text-sm text-white/30">
            © {new Date().getFullYear()} {book.title}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}