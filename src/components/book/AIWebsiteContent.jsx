import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Loader2, 
  Copy,
  Check,
  Search,
  Share2,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";

export default function AIWebsiteContent({ book, onApplyContent }) {
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const generateWebsiteContent = async () => {
    setGenerating(true);
    try {
      const response = await ai.InvokeLLM({
        prompt: `Generate compelling website marketing content for this book:

Title: ${book.title}
Genre: ${book.category}
Summary: ${book.book_summary || 'Not available'}
Target Audience: ${book.target_audience?.age_range || 'General'}

Generate:
1. Hero Headline (8-12 words, compelling hook)
2. Hero Subheadline (20-30 words, expands on the hook)
3. Meta Description for SEO (155 characters max, keyword-rich)
4. SEO Keywords (10-15 relevant keywords)
5. Social Media Posts (3 variations for Twitter/Facebook/Instagram)
6. Email Newsletter Subject Line (compelling, urgency-driven)
7. Call-to-Action Text (3 variations: soft, medium, strong)

Make it engaging, conversion-focused, and SEO-optimized.`,
        response_json_schema: {
          type: "object",
          properties: {
            hero_headline: { type: "string" },
            hero_subheadline: { type: "string" },
            meta_description: { type: "string" },
            seo_keywords: {
              type: "array",
              items: { type: "string" }
            },
            social_posts: {
              type: "object",
              properties: {
                twitter: { type: "string" },
                facebook: { type: "string" },
                instagram: { type: "string" }
              }
            },
            email_subject: { type: "string" },
            cta_variations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      
      setGeneratedContent(response);
    } catch (error) {
      console.error("Error generating content:", error);
    }
    setGenerating(false);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const applyContent = (field, value) => {
    onApplyContent(field, value);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            AI Website Content Generator
          </CardTitle>
          <CardDescription className="text-white/50">
            Generate SEO-optimized copy and marketing content for your book website
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!generatedContent ? (
            <div className="text-center py-8">
              <Button
                onClick={generateWebsiteContent}
                disabled={generating}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Marketing Content
                  </>
                )}
              </Button>
              <p className="text-xs text-white/40 mt-3">
                AI will create headlines, SEO copy, social media posts, and more
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Hero Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white">Hero Section</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generateWebsiteContent}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Regenerate All
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-white/5 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/50">Headline</span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(generatedContent.hero_headline, 'headline')}
                          className="h-6 px-2 text-white/60 hover:text-white"
                        >
                          {copiedField === 'headline' ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-white">{generatedContent.hero_headline}</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/50">Subheadline</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(generatedContent.hero_subheadline, 'subheadline')}
                        className="h-6 px-2 text-white/60 hover:text-white"
                      >
                        {copiedField === 'subheadline' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <p className="text-sm text-white/70">{generatedContent.hero_subheadline}</p>
                  </div>
                </div>
              </div>

              {/* SEO Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-medium text-white">SEO Optimization</h3>
                </div>

                <div className="p-4 rounded-lg bg-white/5 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/50">Meta Description</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(generatedContent.meta_description, 'meta')}
                        className="h-6 px-2 text-white/60 hover:text-white"
                      >
                        {copiedField === 'meta' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <p className="text-xs text-white/60">{generatedContent.meta_description}</p>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-xs mt-2">
                      {generatedContent.meta_description.length} characters
                    </Badge>
                  </div>

                  <div>
                    <span className="text-xs text-white/50 mb-2 block">SEO Keywords</span>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.seo_keywords?.map((keyword, i) => (
                        <Badge key={i} className="bg-white/10 text-white/70 border-0 text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Posts */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-medium text-white">Social Media Posts</h3>
                </div>

                <div className="space-y-2">
                  {Object.entries(generatedContent.social_posts || {}).map(([platform, post]) => (
                    <div key={platform} className="p-3 rounded-lg bg-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-white/10 text-white/70 border-0 text-xs capitalize">
                          {platform}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(post, platform)}
                          className="h-6 px-2 text-white/60 hover:text-white"
                        >
                          {copiedField === platform ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                      <p className="text-xs text-white/60">{post}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call-to-Action Variations */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-medium text-white">Call-to-Action Variations</h3>
                </div>

                <div className="space-y-2">
                  {generatedContent.cta_variations?.map((cta, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span className="text-sm text-white/70">{cta}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(cta, `cta-${i}`)}
                        className="h-6 px-2 text-white/60 hover:text-white"
                      >
                        {copiedField === `cta-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Subject */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-emerald-300 font-medium">Newsletter Subject Line</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(generatedContent.email_subject, 'email')}
                    className="h-6 px-2 text-emerald-400 hover:text-emerald-300"
                  >
                    {copiedField === 'email' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
                <p className="text-sm text-white">{generatedContent.email_subject}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}