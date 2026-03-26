import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Check, 
  Loader2, 
  ExternalLink,
  ShoppingBag,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Calendar,
  Clock
} from "lucide-react";
import AIWebsiteContent from "./AIWebsiteContent";
import LeadMagnetHub from "./LeadMagnetHub";
import AmazonPublisher from "./AmazonPublisher";
import AmazonReviewImporter from "./AmazonReviewImporter";

const BOOKSTORES = [
  { id: "amazon", name: "Amazon", logo: "📦" },
  { id: "barnes_noble", name: "Barnes & Noble", logo: "📚" },
  { id: "apple_books", name: "Apple Books", logo: "🍎" },
  { id: "google_play", name: "Google Play Books", logo: "📖" },
  { id: "kobo", name: "Kobo", logo: "📕" },
  { id: "audible", name: "Audible", logo: "🎧" },
  { id: "bookshop", name: "Bookshop.org", logo: "🏪" },
  { id: "indiebound", name: "IndieBound", logo: "📗" },
  { id: "walmart", name: "Walmart", logo: "🛒" },
  { id: "target", name: "Target", logo: "🎯" },
  { id: "books_a_million", name: "Books-A-Million", logo: "📘" },
  { id: "thriftbooks", name: "ThriftBooks", logo: "💰" }
];

const SOCIAL_PLATFORMS = [
  { id: "facebook", name: "Facebook", icon: Facebook },
  { id: "twitter", name: "X (Twitter)", icon: Twitter },
  { id: "instagram", name: "Instagram", icon: Instagram },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin },
  { id: "youtube", name: "YouTube", icon: Youtube },
  { id: "tiktok", name: "TikTok", icon: null },
  { id: "pinterest", name: "Pinterest", icon: null },
  { id: "goodreads", name: "Goodreads", icon: null }
];

export default function WebsiteBuilder({ book, onUpdate, isUpdating }) {
  const [websiteStatus, setWebsiteStatus] = useState(book.website_config?.status || "coming_soon");
  const [releaseDate, setReleaseDate] = useState(book.website_config?.release_date || "");
  const [selectedBookstores, setSelectedBookstores] = useState(book.selected_bookstores || []);

  const normalizeLinks = (links) => {
    if (!links) return {};
    if (Array.isArray(links)) {
      return links.reduce((acc, { id, url }) => { acc[id] = url; return acc; }, {});
    }
    return links;
  };

  const [bookstoreLinks, setBookstoreLinks] = useState(normalizeLinks(book.website_config?.bookstore_links));
  const [socialLinks, setSocialLinks] = useState(book.social_media_links || {});

  const toggleBookstore = (id) => {
    setSelectedBookstores(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const updateBookstoreLink = (id, url) => {
    setBookstoreLinks(prev => ({ ...prev, [id]: url }));
  };

  const updateSocialLink = (id, url) => {
    setSocialLinks(prev => ({ ...prev, [id]: url }));
  };

  const saveWebsite = () => {
    const bookstoreLinksArray = Object.entries(bookstoreLinks)
      .filter(([_, url]) => url)
      .map(([id, url]) => ({ id, url }));

    onUpdate({
      website_config: {
        status: websiteStatus,
        release_date: releaseDate,
        bookstore_links: bookstoreLinksArray
      },
      selected_bookstores: selectedBookstores,
      social_media_links: socialLinks,
      status: websiteStatus === "live" ? "published" : "marketing"
    }, true);
  };

  const calculateDaysUntil = (date) => {
    if (!date) return null;
    const today = new Date();
    const release = new Date(date);
    const diffTime = release - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
  };

  const daysUntilRelease = calculateDaysUntil(releaseDate);

  const applyAIContent = (field, value) => {
    console.log(`Applying ${field}:`, value);
  };

  return (
    <div className="space-y-6">
      {/* Lead Magnet Designer */}
      {book.back_cover_url && <LeadMagnetHub bookId={book.id} />}

      {/* AI Content Generator */}
      {book.back_cover_url && <AIWebsiteContent book={book} onApplyContent={applyAIContent} />}

      {/* Amazon Reviews Importer */}
      <AmazonReviewImporter book={book} />

      {/* Amazon KDP/ACX Publisher */}
      <AmazonPublisher book={book} />

      {/* Website Status Card */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            Book Website
          </CardTitle>
          <CardDescription className="text-white/50">
            Create a landing page for your book with newsletter and bookstore links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Website Status */}
          <div>
            <Label className="text-white/70 mb-3 block">Website Status</Label>
            <div className="flex gap-3">
              <button
                onClick={() => setWebsiteStatus("coming_soon")}
                className={`flex-1 px-4 py-3 rounded-xl transition-all ${
                  websiteStatus === "coming_soon"
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500/50 text-amber-300'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                } border text-center`}
              >
                🚧 Coming Soon
              </button>
              <button
                onClick={() => setWebsiteStatus("live")}
                className={`flex-1 px-4 py-3 rounded-xl transition-all ${
                  websiteStatus === "live"
                    ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/10 border-emerald-500/50 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                } border text-center`}
              >
                🚀 Live & Available
              </button>
            </div>
          </div>

          {/* Release Date (only for coming_soon) */}
          {websiteStatus === "coming_soon" && (
            <div>
              <Label className="text-white/70 mb-2 block flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Release Date (Optional)
              </Label>
              <Input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
              {daysUntilRelease && (
                <p className="text-xs text-amber-300 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {daysUntilRelease} days until release
                </p>
              )}
            </div>
          )}

          <Button
            onClick={saveWebsite}
            disabled={isUpdating}
            className="bg-emerald-500 hover:bg-emerald-600 text-white border-0"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Save Website Settings
          </Button>
        </CardContent>
      </Card>

      {/* Bookstores */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              Where to Buy
            </CardTitle>
            <CardDescription className="text-white/50">
              Select bookstores and add purchase links
            </CardDescription>
          </div>
          <Button onClick={saveWebsite} disabled={isUpdating} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 flex-shrink-0">
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
            Save
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {BOOKSTORES.map((store) => (
              <div key={store.id} className="space-y-2">
                <button
                  onClick={() => toggleBookstore(store.id)}
                  className={`w-full p-3 rounded-xl transition-all flex items-center gap-2 ${
                    selectedBookstores.includes(store.id)
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  } border`}
                >
                  <span className="text-xl">{store.logo}</span>
                  <span className="text-sm text-white truncate">{store.name}</span>
                  {selectedBookstores.includes(store.id) && (
                    <Check className="w-4 h-4 text-amber-400 ml-auto" />
                  )}
                </button>
                {selectedBookstores.includes(store.id) && (
                  <Input
                    value={bookstoreLinks[store.id] || ""}
                    onChange={(e) => updateBookstoreLink(store.id, e.target.value)}
                    placeholder="Enter purchase URL..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 text-xs"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-white text-sm">Social Media Links</CardTitle>
            <CardDescription className="text-white/50">
              Add your social profiles to display on the website footer
            </CardDescription>
          </div>
          <Button onClick={saveWebsite} disabled={isUpdating} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 flex-shrink-0">
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
            Save
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SOCIAL_PLATFORMS.map((platform) => (
              <div key={platform.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  {platform.icon ? (
                    <platform.icon className="w-5 h-5 text-white/60" />
                  ) : (
                    <span className="text-sm text-white/60">{platform.name.charAt(0)}</span>
                  )}
                </div>
                <Input
                  value={socialLinks[platform.id] || ""}
                  onChange={(e) => updateSocialLink(platform.id, e.target.value)}
                  placeholder={`${platform.name} URL`}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Website Button */}
      <Card className="bg-emerald-500/10 border-emerald-500/30">
        <CardContent className="py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-emerald-300 font-semibold">Your Book Website</p>
            <p className="text-xs text-white/50 mt-0.5">This is the public landing page for your book — share this link with readers.</p>
          </div>
          <a href={`/BookWebsite?id=${book.id}`} target="_blank" rel="noopener noreferrer">
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 font-semibold flex-shrink-0">
              <ExternalLink className="w-4 h-4 mr-2" /> View Book Website
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Website Preview */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-white text-sm">Website Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-8 space-y-8">
            <div className="relative">
              {websiteStatus === "coming_soon" && (
                <div className="text-center mb-6">
                  <div className="inline-flex flex-col items-center gap-2">
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-sm px-4 py-1.5">
                      Coming Soon
                    </Badge>
                    {daysUntilRelease && (
                      <div className="text-xs text-white/50">
                        <span className="text-2xl font-bold text-amber-400">{daysUntilRelease}</span> days until release
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center mb-6">
                {book.front_cover_url ? (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-2xl group-hover:blur-3xl transition-all" />
                    <img
                      src={book.front_cover_url}
                      alt=""
                      className="relative w-64 h-96 object-cover rounded-lg shadow-2xl transform hover:scale-105 transition-transform"
                      style={{ filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5))' }}
                    />
                  </div>
                ) : (
                  <div className="w-64 h-96 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                    <span className="text-white/30 text-sm">No Cover Yet</span>
                  </div>
                )}
              </div>

              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">{book.title}</h2>
                {book.subtitle && <p className="text-lg text-white/60 mb-2">{book.subtitle}</p>}
                <p className="text-amber-400">{book.category}</p>
              </div>
            </div>

            {book.book_summary && (
              <p className="text-white/60 text-sm text-center max-w-2xl mx-auto leading-relaxed">
                {book.book_summary?.slice(0, 200)}...
              </p>
            )}

            {selectedBookstores.length > 0 && websiteStatus === "live" && (
              <div className="flex flex-wrap justify-center gap-2">
                {selectedBookstores.slice(0, 4).map((id) => {
                  const store = BOOKSTORES.find(s => s.id === id);
                  return (
                    <Button key={id} size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0">
                      {store?.logo} {store?.name}
                    </Button>
                  );
                })}
              </div>
            )}

            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-sm text-white/70 mb-3">Stay updated about the release</p>
              <div className="flex gap-2 max-w-sm mx-auto">
                <Input
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  Subscribe
                </Button>
              </div>
            </div>

            {Object.keys(socialLinks).filter(k => socialLinks[k]).length > 0 && (
              <div className="flex justify-center gap-3 pt-4 border-t border-white/10">
                {Object.entries(socialLinks)
                  .filter(([_, url]) => url)
                  .map(([id]) => {
                    const platform = SOCIAL_PLATFORMS.find(p => p.id === id);
                    return (
                      <div key={id} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        {platform?.icon ? (
                          <platform.icon className="w-4 h-4 text-white/60" />
                        ) : (
                          <span className="text-xs text-white/60">{platform?.name.charAt(0)}</span>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}