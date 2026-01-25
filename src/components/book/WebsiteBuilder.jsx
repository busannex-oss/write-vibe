import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Check, 
  Loader2, 
  ExternalLink,
  ShoppingBag,
  Plus,
  X,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
} from "lucide-react";

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
  const [selectedBookstores, setSelectedBookstores] = useState(book.selected_bookstores || []);
  const [bookstoreLinks, setBookstoreLinks] = useState(book.website_config?.bookstore_links || {});
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
    onUpdate({ 
      website_config: {
        status: websiteStatus,
        bookstore_links: bookstoreLinks
      },
      selected_bookstores: selectedBookstores,
      social_media_links: socialLinks,
      status: websiteStatus === "live" ? "published" : "marketing"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
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
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            Where to Buy
          </CardTitle>
          <CardDescription className="text-white/50">
            Select bookstores and add purchase links
          </CardDescription>
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
        <CardHeader>
          <CardTitle className="text-white text-sm">Social Media Links</CardTitle>
          <CardDescription className="text-white/50">
            Add your social profiles to display on the website footer
          </CardDescription>
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

      {/* Website Preview */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-white text-sm">Website Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-6 space-y-6">
            {/* Header */}
            <div className="text-center">
              {book.front_cover_url && (
                <img 
                  src={book.front_cover_url} 
                  alt="" 
                  className="w-32 h-48 object-cover rounded-lg shadow-2xl mx-auto mb-4"
                />
              )}
              <h2 className="text-2xl font-bold text-white">{book.title}</h2>
              <p className="text-amber-400 mt-1">{book.category}</p>
              {websiteStatus === "coming_soon" && (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 mt-3">
                  Coming Soon
                </Badge>
              )}
            </div>

            {/* Summary */}
            <p className="text-white/60 text-sm text-center max-w-md mx-auto">
              {book.book_summary?.slice(0, 150)}...
            </p>

            {/* Buy Buttons */}
            {selectedBookstores.length > 0 && websiteStatus === "live" && (
              <div className="flex flex-wrap justify-center gap-2">
                {selectedBookstores.slice(0, 4).map((id) => {
                  const store = BOOKSTORES.find(s => s.id === id);
                  return (
                    <Button
                      key={id}
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 text-white border-0"
                    >
                      {store?.logo} {store?.name}
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Newsletter */}
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

            {/* Social Icons */}
            {Object.keys(socialLinks).filter(k => socialLinks[k]).length > 0 && (
              <div className="flex justify-center gap-3 pt-4 border-t border-white/10">
                {Object.entries(socialLinks)
                  .filter(([_, url]) => url)
                  .map(([id]) => {
                    const platform = SOCIAL_PLATFORMS.find(p => p.id === id);
                    return (
                      <div 
                        key={id}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                      >
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