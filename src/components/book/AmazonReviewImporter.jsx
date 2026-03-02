import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Star,
  Loader2, 
  Download,
  Check,
  ExternalLink
} from "lucide-react";

export default function AmazonReviewImporter({ book }) {
  const queryClient = useQueryClient();
  const [asin, setAsin] = useState(book.amazon_asin || "");
  const [fetching, setFetching] = useState(false);
  const [fetchedReviews, setFetchedReviews] = useState(null);
  const [importing, setImporting] = useState(false);

  const fetchReviews = async () => {
    setFetching(true);
    setFetchedReviews(null);
    const resp = await base44.functions.invoke('fetchAmazonReviews', {
      book_title: book.title,
      author_name: book.created_by,
      asin: asin || undefined
    });
    setFetchedReviews(resp.data?.data);
    setFetching(false);
  };

  const importReviews = async () => {
    if (!fetchedReviews?.reviews?.length) return;
    setImporting(true);
    for (const r of fetchedReviews.reviews) {
      await base44.entities.Review.create({
        book_id: book.id,
        author_name: r.author_name || "Amazon Reader",
        rating: r.rating || 5,
        title: r.title || "",
        content: r.content || "",
        status: "approved",
        featured: false
      });
    }
    queryClient.invalidateQueries({ queryKey: ['reviews', book.id] });
    // Save ASIN to book
    if (asin) await base44.entities.Book.update(book.id, { amazon_asin: asin });
    setImporting(false);
    setFetchedReviews(null);
    alert(`${fetchedReviews.reviews.length} Amazon reviews imported!`);
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          Amazon Reviews
        </CardTitle>
        <CardDescription className="text-white/50">
          Import real Amazon customer reviews to display on your book website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-white/70 mb-1 block">Amazon ASIN (optional)</Label>
          <div className="flex gap-2">
            <Input
              value={asin}
              onChange={e => setAsin(e.target.value)}
              placeholder="e.g. B08XXXXXX (leave blank to auto-detect)"
              className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
            />
            <Button
              onClick={fetchReviews}
              disabled={fetching}
              className="bg-amber-500 hover:bg-amber-600 text-white border-0 flex-shrink-0"
            >
              {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-white/30 mt-1">AI will search Amazon for "{book.title}" reviews</p>
        </div>

        {fetchedReviews && (
          <div className="space-y-3">
            {fetchedReviews.amazon_url && (
              <a href={fetchedReviews.amazon_url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-amber-400 flex items-center gap-1 hover:underline">
                <ExternalLink className="w-3 h-3" /> View on Amazon
              </a>
            )}
            {fetchedReviews.average_rating && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(fetchedReviews.average_rating) ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`} />
                  ))}
                </div>
                <span className="text-white font-semibold">{fetchedReviews.average_rating.toFixed(1)}</span>
                <span className="text-white/50 text-sm">({fetchedReviews.total_reviews?.toLocaleString()} reviews)</span>
              </div>
            )}

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {fetchedReviews.reviews?.map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{r.author_name}</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-3 h-3 ${j < r.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`} />
                      ))}
                    </div>
                  </div>
                  {r.title && <p className="text-xs font-semibold text-white/80 mb-1">{r.title}</p>}
                  <p className="text-xs text-white/60 line-clamp-2">{r.content}</p>
                  {r.verified && <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-xs mt-1">Verified Purchase</Badge>}
                </div>
              ))}
            </div>

            <Button
              onClick={importReviews}
              disabled={importing}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-0"
            >
              {importing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" /> Import {fetchedReviews.reviews?.length} Reviews</>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}