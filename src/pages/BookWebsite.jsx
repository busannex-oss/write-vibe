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
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent" />
        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Cover Image */}
            <div className="mb-8">
              {book.front_cover_url ? (
                <motion.img 
                  src={book.front_cover_url} 
                  alt={book.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-48 md:w-64 h-auto mx-auto rounded-xl shadow-2xl shadow-black/50"
                />
              ) : (
                <div className="w-48 md:w-64 aspect-[2/3] mx-auto rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white/20" />
                </div>
              )}
            </div>

            {/* Status Badge */}
            {isComingSoon && (
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 mb-4">
                🚧 Coming Soon
              </Badge>
            )}

            {/* Title & Info */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {book.title}
            </h1>
            {book.subtitle && (
              <p className="text-xl text-amber-400 mb-4">{book.subtitle}</p>
            )}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Badge className="bg-white/10 text-white/70 border-0">
                {book.category}
              </Badge>
              {book.subjects?.slice(0, 3).map((subject) => (
                <Badge key={subject} className="bg-amber-500/20 text-amber-300 border-0">
                  {subject}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Summary Section */}
      {book.book_summary && (
        <section className="py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <p className="text-lg text-white/70 leading-relaxed">
                {book.book_summary}
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Buy Buttons */}
      {!isComingSoon && bookstores.length > 0 && (
        <section className="py-12 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-semibold text-white mb-6">Available Now</h2>
            <div className="flex flex-wrap justify-center gap-4">
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
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <span className="text-xl">{store.logo}</span>
                    <span>{store.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-16 px-6">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20"
          >
            <Mail className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              {isComingSoon ? "Get Notified on Release" : "Stay Updated"}
            </h2>
            <p className="text-white/50 mb-6">
              {isComingSoon 
                ? "Be the first to know when this book is available"
                : "Subscribe for exclusive updates and content"
              }
            </p>
            
            {subscribed ? (
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <Check className="w-5 h-5" />
                <span>You're subscribed! We'll keep you updated.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-3">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  required
                />
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 px-6"
                  disabled={subscribeMutation.isPending}
                >
                  {subscribeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Subscribe"
                  )}
                </Button>
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