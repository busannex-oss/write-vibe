import { useState, useEffect } from "react";
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
  Check,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  FileText,
  Headphones,
  Video
} from "lucide-react";
import { motion } from "framer-motion";
import BrandLogoOverlay from "@/components/book/BrandLogoOverlay";

const SOCIAL_ICONS = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube
};

const BOOKSTORE_INFO = {
  amazon: { name: "Amazon", logo: "📦" },
  barnes_noble: { name: "Barnes & Noble", logo: "📚" },
  apple_books: { name: "Apple Books", logo: "🍎" },
  google_play: { name: "Google Play", logo: "📖" },
  kobo: { name: "Kobo", logo: "📕" },
  audible: { name: "Audible", logo: "🎧" },
  bookshop: { name: "Bookshop.org", logo: "🏪" },
  indiebound: { name: "IndieBound", logo: "📗" },
  walmart: { name: "Walmart", logo: "🛒" },
  target: { name: "Target", logo: "🎯" },
  books_a_million: { name: "Books-A-Million", logo: "📘" },
  thriftbooks: { name: "ThriftBooks", logo: "💰" }
};

export default function BookWebsite() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [showAllChars, setShowAllChars] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(null);

  const { data: pageData, isLoading, error } = useQuery({
    queryKey: ['public-book', bookId],
    queryFn: async () => {
      // Try direct entity access first (works for logged-in book owner)
      try {
        const books = await base44.entities.Book.filter({ id: bookId });
        if (books?.[0]) {
          const book = books[0];
          let reviews = [];
          try {
            const allReviews = await base44.entities.Review.filter({ book_id: bookId });
            reviews = allReviews.filter(r => r.status === 'approved');
          } catch (_) {}
          return { book, author: null, reviews };
        }
      } catch (_) {}
      // Fallback to public backend function (for unauthenticated visitors)
      const res = await base44.functions.invoke('getPublicBook', { bookId });
      return res.data;
    },
    enabled: !!bookId,
    retry: 2
  });

  const book = pageData?.book || null;
  const authorProfile = pageData?.author || null;
  const reviews = pageData?.reviews || [];

  const subscribeMutation = useMutation({
    mutationFn: () => base44.functions.invoke('subscribeNewsletter', { book_id: bookId, email, name }),
    onSuccess: () => setSubscribed(true)
  });

  useEffect(() => {
    if (!bookId || !book) return;
    // Load subscriber count for social proof
    try {
      base44.entities.NewsletterSubscriber.filter({ book_id: bookId }).then(subs => {
        if (subs?.length > 0) setSubscriberCount(subs.length);
      });
    } catch (_) {}
  }, [bookId, book]);

  // Record a real page visit once per browser session, per book
  useEffect(() => {
    if (!bookId || !book) return;
    const flag = `bookview_${bookId}`;
    if (sessionStorage.getItem(flag)) return;
    sessionStorage.setItem(flag, "1");
    let sessionId = sessionStorage.getItem("wv_session_id");
    if (!sessionId) {
      sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("wv_session_id", sessionId);
    }
    base44.functions
      .invoke("trackBookView", { bookId, referrer: document.referrer || "", sessionId })
      .catch(() => {});
  }, [bookId, book]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) subscribeMutation.mutate();
  };

  // ── Derived values (computed even if book is null, safe with fallbacks) ──
  const isComingSoon = book?.website_config?.status !== "live";
  const bookstores = book?.selected_bookstores || [];
  const socialLinks = { ...(book?.social_media_links || {}), ...(authorProfile?.social_media || {}) };
  const authorName = authorProfile?.full_name || book?.created_by?.split("@")[0];
  const authorPhoto = authorProfile?.author_photo_url || book?.author_photo_url;
  const authorBio = authorProfile?.biography;
  const chapters = book?.table_of_contents || book?.outline || [];
  const detailedOutline = book?.detailed_outline || book?.outline || [];
  const characters = book?.characters || [];
  const releaseDate = book?.website_config?.release_date;
  const branding = book?.website_config?.branding || {};
  const logoUrl = branding.logo_url || "";
  const brandName = branding.brand_name || authorName || "";
  const footerText = branding.footer_text || "";
  const safeUrl = (v) => { try { return ['http:', 'https:'].includes(new URL(v).protocol) ? v : "#"; } catch { return "#"; } };
  const safeHex = (v, fallback) => (/^#[0-9a-fA-F]{6}$/.test(v || "") ? v : fallback);
  const themeColor = safeHex(branding.theme_color, "#f59e0b");
  const themeBg1 = safeHex(branding.theme_bg1, "#020617");
  const themeBg2 = safeHex(branding.theme_bg2, "#0f172a");
  const daysUntil = releaseDate ? Math.ceil((new Date(releaseDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  const themeStyle = { '--theme-primary': themeColor, '--theme-bg1': themeBg1, '--theme-bg2': themeBg2 };

  // ── SEO + JSON-LD (must be before any return) ──
  useEffect(() => {
    if (!book) return;
    const schemas = [];
    const bookSchema = {
      "@context": "https://schema.org",
      "@type": "Book",
      "name": book.title,
      ...(book.subtitle ? { "alternateName": book.subtitle } : {}),
      ...(book.book_summary || book.plot_summary ? { "description": book.book_summary || book.plot_summary } : {}),
      ...(book.front_cover_url ? { "image": book.front_cover_url } : {}),
      ...(book.category ? { "genre": book.category } : {}),
      ...(authorName ? { "author": { "@type": "Person", "name": authorName } } : {}),
      ...(book.amazon_asin ? { "isbn": book.amazon_asin } : {}),
      "url": window.location.href,
    };
    if (avgRating && reviews.length) {
      bookSchema["aggregateRating"] = { "@type": "AggregateRating", "ratingValue": avgRating, "reviewCount": reviews.length, "bestRating": 5, "worstRating": 1 };
      bookSchema["review"] = reviews.slice(0, 5).map(r => ({ "@type": "Review", "author": { "@type": "Person", "name": r.author_name }, "reviewRating": { "@type": "Rating", "ratingValue": r.rating, "bestRating": 5 }, ...(r.title ? { "name": r.title } : {}), "reviewBody": r.content }));
    }
    schemas.push(bookSchema);
    if (authorName) schemas.push({ "@context": "https://schema.org", "@type": "Person", "name": authorName, ...(authorPhoto ? { "image": authorPhoto } : {}), ...(authorBio ? { "description": authorBio } : {}) });
    document.querySelectorAll('script[data-bookwebsite-schema]').forEach(s => s.remove());
    schemas.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-bookwebsite-schema', 'true');
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
    const savedSEO = book.website_config?.seo || {};
    document.title = savedSEO.meta_title || `${book.title}${book.subtitle ? ' — ' + book.subtitle : ''}${authorName ? ' by ' + authorName : ''}`;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.name = 'description'; document.head.appendChild(metaDesc); }
    metaDesc.content = savedSEO.meta_description || (book.book_summary || book.plot_summary || '').slice(0, 160) || `${book.title} by ${authorName}. Available now.`;
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
    ogTitle.content = book.title;
    const ogImageUrl = savedSEO.og_image || book.front_cover_url;
    if (ogImageUrl) {
      let ogImg = document.querySelector('meta[property="og:image"]');
      if (!ogImg) { ogImg = document.createElement('meta'); ogImg.setAttribute('property', 'og:image'); document.head.appendChild(ogImg); }
      ogImg.content = ogImageUrl;
    }
    return () => { document.querySelectorAll('script[data-bookwebsite-schema]').forEach(s => s.remove()); };
  }, [book, reviews, authorName, authorPhoto, authorBio, avgRating]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
          <p className="text-white/40">Loading book...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="w-16 h-16 text-white/20 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Book not found</h1>
          <p className="text-white/40">{error?.message || "This book page is not available."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ background: `linear-gradient(135deg, ${themeBg1} 0%, ${themeBg2} 50%, ${themeBg1} 100%)`, ...themeStyle }}>
      <style>{`
        .theme-accent { color: ${themeColor} !important; }
        .theme-accent-bg { background-color: ${themeColor} !important; }
        .theme-accent-border { border-color: ${themeColor}66 !important; }
        .theme-gradient-text { background: linear-gradient(90deg, ${themeColor}, ${themeColor}cc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .theme-gradient-bg { background: linear-gradient(90deg, ${themeColor}, ${themeColor}bb) !important; }
        .theme-glow { box-shadow: 0 10px 40px ${themeColor}40; }
        .theme-divider { background: linear-gradient(90deg, ${themeColor}, ${themeColor}88); }
      `}</style>

      {/* ── BRANDED HEADER ── */}
      {(logoUrl || brandName) && (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between" style={{ background: `${themeBg1}e8`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${themeColor}22` }}>
          <div className="flex items-center gap-3">
            {logoUrl && (
              <img src={logoUrl} alt={brandName} className="h-9 w-auto object-contain" />
            )}
            {brandName && (
              <span className="font-bold text-lg text-white">{brandName}</span>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {(book.book_summary || book.plot_summary) && <a href="#about" className="text-white/60 hover:text-white transition-colors">About</a>}
            {characters.length > 0 && <a href="#characters" className="text-white/60 hover:text-white transition-colors">Characters</a>}
            {chapters.length > 0 && <a href="#contents" className="text-white/60 hover:text-white transition-colors">Contents</a>}
            <a href="#newsletter" className="px-4 py-1.5 rounded-full text-white font-semibold text-xs" style={{ background: themeColor }}>Subscribe</a>
          </nav>
        </header>
      )}

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 py-24" style={{ paddingTop: (logoUrl || brandName) ? '7rem' : '6rem' }}>
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          {book.front_cover_url && (
            <div
              className="absolute inset-0 opacity-15 bg-center bg-cover blur-3xl scale-110"
              style={{ backgroundImage: `url(${book.front_cover_url})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40" style={{ background: `linear-gradient(to bottom, ${themeBg1}99, ${themeBg1}60, ${themeBg1})` }} />
        </div>

        <div className="max-w-6xl mx-auto relative w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Cover */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex justify-center"
            >
              {book.front_cover_url ? (
                <div className="relative group">
                  <div className="absolute -inset-8 bg-gradient-to-br from-amber-500/40 to-orange-500/20 rounded-3xl blur-3xl opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-72 md:w-96">
                    <img
                      src={book.front_cover_url}
                      alt={book.title}
                      className="relative w-full h-auto rounded-2xl shadow-2xl shadow-black/80 object-cover ring-1 ring-white/10"
                    />
                    <BrandLogoOverlay book={book} />
                  </div>
                </div>
              ) : (
                <div className="w-72 aspect-[2/3] rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center gap-4 ring-1 ring-white/10">
                  <BookOpen className="w-20 h-20 text-white/20" />
                  <p className="text-white/30 text-sm">Cover Coming Soon</p>
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="space-y-6"
            >
              {/* Status badge */}
              {isComingSoon ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/40">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-sm font-semibold text-amber-300">
                    Coming Soon{daysUntil && daysUntil > 0 ? ` · ${daysUntil} days away` : ""}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-semibold text-emerald-300">Available Now</span>
                </div>
              )}

              {/* Title */}
              <div>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="text-xl md:text-2xl font-light mt-2 theme-accent">{book.subtitle}</p>
                )}
                {authorName && (
                  <p className="text-white/50 text-lg mt-2">by <span className="text-white/80 font-medium">{authorName}</span></p>
                )}
                {book.author_tagline && (
                  <p className="text-sm italic mt-2 theme-accent">{book.author_tagline}</p>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {book.category && (
                  <Badge className="px-3 py-1 text-sm" style={{ background: `${themeColor}22`, color: themeColor, borderColor: `${themeColor}44` }}>
                    {book.category}
                  </Badge>
                )}
                {book.subcategory && (
                  <Badge className="bg-white/10 text-white/70 border-white/20 px-3 py-1 text-sm">
                    {book.subcategory}
                  </Badge>
                )}
                {(book.subjects || []).slice(0, 3).map(s => (
                  <Badge key={s} className="bg-white/5 text-white/50 border-white/10 px-3 py-1 text-sm">{s}</Badge>
                ))}
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 text-sm text-white/50">
                {chapters.length > 0 && (
                  <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {chapters.length} Chapters</span>
                )}
                {characters.length > 0 && (
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {characters.length} Characters</span>
                )}
                {book.audiobook_url && (
                  <span className="flex items-center gap-1.5"><Headphones className="w-4 h-4" /> Audiobook</span>
                )}
                {avgRating && (
                  <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-current" style={{ color: themeColor }} /> {avgRating} ({reviews.length})</span>
                )}
              </div>

              {/* Summary excerpt */}
              {book.book_summary && (
                <p className="text-white/70 text-lg leading-relaxed">
                  {book.book_summary.slice(0, 200)}{book.book_summary.length > 200 ? "…" : ""}
                </p>
              )}

              {/* CTA Buttons */}
              <div className="space-y-3 pt-2">
                {!isComingSoon && bookstores.length > 0 && (
                  <a href="#buy" className="block">
                    <Button className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-lg border-0 rounded-xl shadow-lg shadow-amber-500/30">
                      📖 Get Your Copy Now
                    </Button>
                  </a>
                )}
                <a href="#newsletter">
                <Button variant="outline" className="w-full h-12 border-white/20 text-white hover:bg-white/10 rounded-xl font-semibold">
                  <Mail className="w-4 h-4 mr-2" />
                  {isComingSoon ? "Notify Me on Release" : "Subscribe for Updates"}
                </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ABOUT THE BOOK ── */}
      <span id="about" />
      {(book.book_summary || book.plot_summary) && (
        <section className="py-24 px-6 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8 text-center"
            >
              <h2 className="text-4xl font-bold text-white">About This Book</h2>
              <div className="h-1 w-20 mx-auto rounded-full theme-divider" />
              <p className="text-xl text-white/75 leading-relaxed">
                {book.book_summary || book.plot_summary}
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── CHARACTERS ── */}
      {characters.length > 0 && (
        <section className="py-24 px-6" id="characters">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-4xl font-bold text-white mb-3">Meet the Characters</h2>
              <div className="h-1 w-20 mx-auto rounded-full theme-divider" />
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(showAllChars ? characters : characters.slice(0, 8)).map((char, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-gradient-to-br from-white/8 to-white/3 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-amber-500/30 transition-all"
                >
                  {char.image_url ? (
                    <img
                      src={char.image_url}
                      alt={char.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto ring-2 ring-amber-500/30"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto ring-2 ring-amber-500/20">
                      <span className="text-2xl font-bold text-amber-400">
                        {char.name?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white">{char.name}</h3>
                    {char.role && (
                      <p className="text-amber-400 text-sm font-medium mt-0.5">{char.role}</p>
                    )}
                  </div>
                  {char.description && (
                    <p className="text-white/60 text-sm leading-relaxed text-center line-clamp-3">
                      {char.description}
                    </p>
                  )}
                  {char.traits?.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {char.traits.slice(0, 3).map(t => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">{t}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {characters.length > 8 && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setShowAllChars(!showAllChars)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {showAllChars ? "Show Less" : `Show All ${characters.length} Characters`}
                  {showAllChars ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── TABLE OF CONTENTS ── */}
      {chapters.length > 0 && (
        <section className="py-24 px-6" id="contents" style={{ background: `linear-gradient(to bottom, ${themeBg1}, ${themeBg2}44, ${themeBg1})` }}>
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-4xl font-bold text-white mb-3">Table of Contents</h2>
              <div className="h-1 w-20 mx-auto rounded-full theme-divider" />
              <p className="text-white/50 mt-4">{chapters.length} chapters</p>
            </motion.div>

            <div className="space-y-3">
              {chapters.map((ch, i) => {
                const detail = detailedOutline.find(d => d.chapter_number === ch.chapter_number);
                const isOpen = expandedChapter === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all" style={{ '--hover-color': themeColor }}
                  >
                    <button
                      className="w-full flex items-center gap-4 px-6 py-4 text-left"
                      onClick={() => detail && setExpandedChapter(isOpen ? null : i)}
                    >
                      <span className="text-2xl font-bold text-amber-500/50 min-w-[2.5rem]">
                        {String(ch.chapter_number || i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-white font-medium text-lg">{ch.chapter_title}</span>
                      {detail && (
                        isOpen
                          ? <ChevronUp className="w-5 h-5 text-white/30 flex-shrink-0" />
                          : <ChevronDown className="w-5 h-5 text-white/30 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && detail && (
                      <div className="px-6 pb-5 border-t border-white/5 space-y-3">
                        {detail.summary && (
                          <p className="text-white/60 leading-relaxed">{detail.summary}</p>
                        )}
                        {detail.key_events?.length > 0 && (
                          <ul className="space-y-1">
                            {detail.key_events.map((ev, j) => (
                              <li key={j} className="text-white/50 text-sm flex items-start gap-2">
                                <span className="text-amber-500 mt-1">•</span> {ev}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── VIDEO TRAILER ── */}
      {book.video_commercial_url && (() => {
        let trailerData = null;
        try { trailerData = JSON.parse(book.video_commercial_url); } catch {}
        const images = trailerData?.storyboardImages || [];
        if (!images.length) return null;

        return (
          <section className="py-24 px-6">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-14"
              >
                <h2 className="text-4xl font-bold text-white mb-3">🎬 Book Trailer</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full" />
              </motion.div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10 group">
                    <img src={img.url} alt={`Scene ${img.scene}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-3">
                      <p className="text-white text-xs italic line-clamp-2">"{img.narration}"</p>
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">Scene {img.scene}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── BUY NOW ── */}
      {!isComingSoon && bookstores.length > 0 && (
        <section id="buy" className="py-24 px-6 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-slate-950 border-y border-amber-500/20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-3">Get Your Copy</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full" />
              <p className="text-white/50 mt-4">Available on your favorite platforms</p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {bookstores.map((storeId) => {
                const store = BOOKSTORE_INFO[storeId];
                if (!store) return null;
                const linksArr = book.website_config?.bookstore_links || [];
                const linkObj = Array.isArray(linksArr) ? linksArr.find(l => l.id === storeId) : null;
                const href = safeUrl(linkObj?.url);
                return (
                  <a
                    key={storeId}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 px-5 py-5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white transition-all border border-white/10 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10 group"
                  >
                    <span className="text-3xl">{store.logo}</span>
                    <span className="font-semibold">{store.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── REVIEWS ── */}
      {reviews.length > 0 && (
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-4xl font-bold text-white mb-3">⭐ Reader Reviews</h2>
              <div className="h-1 w-20 mx-auto rounded-full theme-divider" />
              {avgRating && (
                <div className="mt-6 inline-flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-6 py-3">
                  <span className="text-4xl font-bold text-amber-400">{avgRating}</span>
                  <div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-5 h-5 ${i <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-white/20"}`} />
                      ))}
                    </div>
                    <p className="text-white/50 text-sm">{reviews.length} reviews</p>
                  </div>
                </div>
              )}
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-gradient-to-br from-white/8 to-white/3 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-amber-500/30 transition-all"
                >
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-4 h-4 ${i <= review.rating ? "fill-amber-400 text-amber-400" : "text-white/20"}`} />
                    ))}
                  </div>
                  {review.title && <h3 className="font-semibold text-white">{review.title}</h3>}
                  <p className="text-white/65 text-sm leading-relaxed">"{review.content}"</p>
                  <p className="text-amber-400 text-sm font-medium pt-2 border-t border-white/10">— {review.author_name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── AUTHOR ── */}
      {(authorPhoto || authorName || authorBio) && (
        <section className="py-24 px-6 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-6"
            >
              <h2 className="text-4xl font-bold text-white">About the Author</h2>
              <div className="h-1 w-20 mx-auto rounded-full theme-divider" />
              {authorPhoto && (
                <img
                  src={authorPhoto}
                  alt={authorName}
                  className="w-32 h-32 rounded-full mx-auto object-cover ring-4 ring-amber-500/30 shadow-2xl"
                />
              )}
              {authorName && (
                <p className="text-2xl font-bold theme-accent">{authorName}</p>
              )}
              {authorBio && (
                <p className="text-white/65 text-lg leading-relaxed max-w-xl mx-auto">{authorBio}</p>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── NEWSLETTER ── */}
      <section id="newsletter" className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border p-12 space-y-6 text-center shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${themeColor}22, ${themeColor}0a, ${themeBg2}99)`, borderColor: `${themeColor}44` }}
          >
            <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center" style={{ background: `${themeColor}22` }}>
              <Mail className="w-7 h-7" style={{ color: themeColor }} />
            </div>
            {subscriberCount && subscriberCount > 5 && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium" style={{ background: `${themeColor}15`, color: themeColor }}>
                <Users className="w-4 h-4" />
                {subscriberCount.toLocaleString()} readers already subscribed
              </div>
            )}
            <h2 className="text-3xl font-bold text-white">
              {isComingSoon ? "Be First to Know" : "Stay in the Loop"}
            </h2>
            <p className="text-white/65 text-lg">
              {isComingSoon
                ? `Get notified the moment "${book.title}" is available. Limited early-access for subscribers.`
                : `Exclusive content, behind-the-scenes stories, and special offers for subscribers of "${book.title}".`}
            </p>

            {subscribed ? (
              <div className="flex flex-col items-center gap-3 rounded-xl py-6 px-6" style={{ background: '#10b98120', border: '1px solid #10b98140' }}>
                <Check className="w-10 h-10 text-emerald-400" />
                <p className="font-bold text-white text-xl">Check your inbox!</p>
                <p className="text-white/60 text-sm">Click the confirmation link we sent to finish subscribing.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                  />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="w-full h-12 text-white border-0 rounded-xl font-bold text-base theme-glow"
                  style={{ background: `linear-gradient(90deg, ${themeColor}, ${themeColor}cc)` }}
                >
                  {subscribeMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    isComingSoon ? "🔔 Notify Me on Release →" : "✉️ Subscribe for Updates →"
                  )}
                </Button>
                <div className="flex items-center justify-center gap-4 text-white/40 text-xs pt-1">
                  <span>✓ No spam, ever</span>
                  <span>✓ Unsubscribe anytime</span>
                  <span>✓ Free updates</span>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── SEO TEXT BLOCK — full copy for crawlers, visually hidden ── */}
      <div
        aria-hidden="false"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
          border: 0,
          left: '-9999px'
        }}
      >
        <h1>{book.title}{book.subtitle ? ` — ${book.subtitle}` : ''}</h1>
        {authorName && <p>By {authorName}</p>}
        {book.category && <p>Genre: {book.category}</p>}
        {book.subcategory && <p>Sub-genre: {book.subcategory}</p>}
        {(book.subjects || []).length > 0 && <p>Subjects: {book.subjects.join(', ')}</p>}
        {(book.book_summary || book.plot_summary) && (
          <>
            <h2>About {book.title}</h2>
            <p>{book.book_summary || book.plot_summary}</p>
          </>
        )}
        {characters.length > 0 && (
          <>
            <h2>Characters in {book.title}</h2>
            {characters.map((char, i) => (
              <div key={i}>
                <h3>{char.name}{char.role ? ` — ${char.role}` : ''}</h3>
                {char.description && <p>{char.description}</p>}
                {char.backstory && <p>{char.backstory}</p>}
                {char.traits?.length > 0 && <p>Traits: {char.traits.join(', ')}</p>}
              </div>
            ))}
          </>
        )}
        {chapters.length > 0 && (
          <>
            <h2>Table of Contents — {book.title}</h2>
            {chapters.map((ch, i) => {
              const detail = detailedOutline.find(d => d.chapter_number === ch.chapter_number);
              return (
                <div key={i}>
                  <h3>Chapter {ch.chapter_number || i + 1}: {ch.chapter_title}</h3>
                  {detail?.summary && <p>{detail.summary}</p>}
                  {detail?.key_events?.length > 0 && (
                    <ul>{detail.key_events.map((ev, j) => <li key={j}>{ev}</li>)}</ul>
                  )}
                </div>
              );
            })}
          </>
        )}
        {authorBio && (
          <>
            <h2>About the Author{authorName ? ` — ${authorName}` : ''}</h2>
            <p>{authorBio}</p>
          </>
        )}
        {reviews.length > 0 && (
          <>
            <h2>Reader Reviews for {book.title}</h2>
            {reviews.map((r, i) => (
              <div key={i}>
                {r.title && <h3>{r.title}</h3>}
                <p>Rating: {r.rating}/5 — {r.author_name}</p>
                <p>{r.content}</p>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer className="py-16 px-6" style={{ borderTop: `1px solid ${themeColor}22`, background: `${themeBg1}ee` }}>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Logo + Brand */}
          <div className="flex flex-col items-center gap-3">
            {logoUrl && (
              <img src={logoUrl} alt={brandName} className="h-12 w-auto object-contain opacity-80" />
            )}
            {brandName && (
              <p className="font-bold text-lg text-white">{brandName}</p>
            )}
          </div>

          {/* Social Icons */}
          {Object.entries(socialLinks).filter(([, v]) => v).length > 0 && (
            <div className="flex justify-center gap-4">
              {Object.entries(socialLinks).filter(([, url]) => url).map(([id, url]) => {
                const Icon = SOCIAL_ICONS[id];
                return (
                  <a
                    key={id}
                    href={safeUrl(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all"
                    style={{ background: `${themeColor}22` }}
                  >
                    {Icon ? <Icon className="w-5 h-5" /> : <span className="text-sm">{id.charAt(0).toUpperCase()}</span>}
                  </a>
                );
              })}
            </div>
          )}

          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-white">{book.title}</p>
            {authorName && <p className="text-white/40 text-sm">by {authorName}</p>}
            {footerText && <p className="text-white/50 text-sm max-w-md mx-auto">{footerText}</p>}
            <div className="flex items-center justify-center gap-4 text-white/25 text-xs pt-2">
              <span>© {new Date().getFullYear()} All rights reserved.</span>
              {subscriberCount && <span>·</span>}
              {subscriberCount && <span>{subscriberCount} subscribers</span>}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}