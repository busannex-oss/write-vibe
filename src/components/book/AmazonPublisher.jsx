import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  Upload, 
  Loader2, 
  Check, 
  ExternalLink,
  Headphones,
  FileText,
  AlertCircle
} from "lucide-react";

export default function AmazonPublisher({ book }) {
  const [publishing, setPublishing] = useState(null);
  const [results, setResults] = useState(null);

  const hasManuscript = !!(book.formatted_manuscript || book.manuscript_chapters?.some(c => c?.content));
  const hasAudiobook = !!book.audiobook_url;

  const publish = async (type) => {
    setPublishing(type);
    setResults(null);
    const response = await base44.functions.invoke('publishToAmazon', {
      book_id: book.id,
      publish_type: type
    });
    setResults(response.data?.results);
    setPublishing(null);
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          Publish to Amazon
        </CardTitle>
        <CardDescription className="text-white/50">
          Submit your manuscript to Amazon KDP and audiobook to ACX
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Manuscript */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span className="font-medium text-white">Manuscript (KDP)</span>
            </div>
            <div className="text-xs text-white/50">
              {hasManuscript ? (
                <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Manuscript ready</span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> No manuscript yet</span>
              )}
            </div>
            {book.amazon_kdp_status === 'submitted' && (
              <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-xs">
                Submitted to KDP
              </Badge>
            )}
            <Button
              onClick={() => publish('manuscript')}
              disabled={!hasManuscript || publishing === 'manuscript'}
              size="sm"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
            >
              {publishing === 'manuscript' ? (
                <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Submitting...</>
              ) : (
                <><Upload className="w-3 h-3 mr-1" /> Submit to KDP</>
              )}
            </Button>
            <a href="https://kdp.amazon.com" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 flex items-center gap-1 hover:underline">
              <ExternalLink className="w-3 h-3" /> Open KDP Dashboard
            </a>
          </div>

          {/* Audiobook */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-purple-400" />
              <span className="font-medium text-white">Audiobook (ACX)</span>
            </div>
            <div className="text-xs text-white/50">
              {hasAudiobook ? (
                <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Audiobook ready</span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> No audiobook yet</span>
              )}
            </div>
            {book.amazon_acx_status === 'submitted' && (
              <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-xs">
                Submitted to ACX
              </Badge>
            )}
            <Button
              onClick={() => publish('audiobook')}
              disabled={!hasAudiobook || publishing === 'audiobook'}
              size="sm"
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0"
            >
              {publishing === 'audiobook' ? (
                <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Submitting...</>
              ) : (
                <><Upload className="w-3 h-3 mr-1" /> Submit to ACX</>
              )}
            </Button>
            <a href="https://www.acx.com" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 flex items-center gap-1 hover:underline">
              <ExternalLink className="w-3 h-3" /> Open ACX Dashboard
            </a>
          </div>
        </div>

        {results && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            {Object.entries(results).map(([key, result]) => (
              <div key={key} className={`p-3 rounded-lg text-sm flex items-start gap-2 ${result.status === 'submitted' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                {result.status === 'submitted' ? (
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-medium text-white capitalize">{key}: </span>
                  <span className="text-white/70">{result.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}