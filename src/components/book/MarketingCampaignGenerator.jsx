import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Rocket, 
  Loader2, 
  Mail,
  Target,
  TrendingUp,
  Copy,
  Check,
  Zap,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";

export default function MarketingCampaignGenerator({ book }) {
  const [generating, setGenerating] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const generateCampaign = async () => {
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a comprehensive marketing campaign for this book:

Title: ${book.title}
Genre: ${book.category}
Summary: ${book.book_summary || 'Not available'}
Target Audience: ${JSON.stringify(book.target_audience || {})}

Generate:

1. SOCIAL MEDIA AD COPY (Facebook, Instagram, Twitter):
   - Multiple ad variations (short, medium, long)
   - Hooks, benefits, and CTAs
   - Hashtag strategies
   - Budget recommendations

2. EMAIL MARKETING CAMPAIGN:
   - Pre-launch announcement email
   - Launch day email
   - Post-launch follow-up
   - Newsletter series (3-5 emails)
   - Subject lines for each

3. PROMOTIONAL STRATEGIES:
   - Platform-specific tactics (Amazon, Goodreads, etc.)
   - Influencer outreach approach
   - Book club engagement strategy
   - Launch week timeline
   - Pricing strategy recommendations

4. CONTENT CALENDAR:
   - 30-day promotional schedule
   - Post ideas and themes
   - Engagement tactics

Make it actionable, conversion-focused, and genre-appropriate.`,
        response_json_schema: {
          type: "object",
          properties: {
            social_ads: {
              type: "object",
              properties: {
                facebook: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      length: { type: "string" },
                      copy: { type: "string" },
                      cta: { type: "string" }
                    }
                  }
                },
                instagram: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      caption: { type: "string" },
                      hashtags: { type: "string" }
                    }
                  }
                },
                twitter: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      tweet: { type: "string" }
                    }
                  }
                },
                budget_recommendations: { type: "string" }
              }
            },
            email_campaign: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  subject: { type: "string" },
                  body: { type: "string" },
                  timing: { type: "string" }
                }
              }
            },
            promotional_strategies: {
              type: "object",
              properties: {
                amazon_tactics: {
                  type: "array",
                  items: { type: "string" }
                },
                goodreads_strategy: {
                  type: "array",
                  items: { type: "string" }
                },
                influencer_outreach: { type: "string" },
                book_clubs: { type: "string" },
                launch_timeline: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day: { type: "string" },
                      action: { type: "string" }
                    }
                  }
                },
                pricing_strategy: { type: "string" }
              }
            },
            content_calendar: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  platform: { type: "string" },
                  content_idea: { type: "string" },
                  goal: { type: "string" }
                }
              }
            }
          }
        }
      });

      setCampaign(response);
    } catch (error) {
      console.error("Error generating campaign:", error);
    }
    setGenerating(false);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const saveCampaign = async () => {
    if (campaign && book.onUpdate) {
      await book.onUpdate({ marketing_campaign: campaign }, true);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/5 border-pink-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Rocket className="w-5 h-5 text-pink-400" />
          AI Marketing Campaign Generator
        </CardTitle>
        <CardDescription className="text-white/50">
          Complete marketing strategy with ads, emails, and promotional tactics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!campaign ? (
          <div className="text-center py-8">
            <Button
              onClick={generateCampaign}
              disabled={generating}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Campaign...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Generate Marketing Campaign
                </>
              )}
            </Button>
            <p className="text-xs text-white/40 mt-3">
              AI will create ads, email sequences, and promotional strategies
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 justify-end">
              <Button
                onClick={generateCampaign}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Zap className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button
                onClick={saveCampaign}
                className="bg-emerald-500 hover:bg-emerald-600 text-white border-0"
              >
                <Check className="w-4 h-4 mr-2" />
                Save Campaign
              </Button>
            </div>
            <Tabs defaultValue="social" className="w-full">
              <TabsList className="grid grid-cols-4 w-full bg-white/5">
              <TabsTrigger value="social">Social Ads</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>

            <TabsContent value="social" className="space-y-4 mt-4">
              {/* Facebook Ads */}
              <div>
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <span className="text-blue-400">📘</span> Facebook Ads
                </h3>
                <div className="space-y-3">
                  {campaign.social_ads?.facebook?.map((ad, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border-0 text-xs">
                          {ad.length}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(ad.copy, `fb-${i}`)}
                          className="h-6 px-2 text-white/60 hover:text-white"
                        >
                          {copiedField === `fb-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                      <p className="text-xs text-white/70 mb-2">{ad.copy}</p>
                      <Badge className="bg-pink-500/20 text-pink-300 border-0 text-xs">
                        CTA: {ad.cta}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Instagram Ads */}
              <div>
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <span className="text-pink-400">📷</span> Instagram Ads
                </h3>
                <div className="space-y-3">
                  {campaign.social_ads?.instagram?.map((ad, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/50">Post {i + 1}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`${ad.caption}\n\n${ad.hashtags}`, `ig-${i}`)}
                          className="h-6 px-2 text-white/60 hover:text-white"
                        >
                          {copiedField === `ig-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                      <p className="text-xs text-white/70 mb-2">{ad.caption}</p>
                      <p className="text-xs text-pink-300">{ad.hashtags}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Twitter Ads */}
              <div>
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <span className="text-blue-300">🐦</span> Twitter/X Ads
                </h3>
                <div className="space-y-2">
                  {campaign.social_ads?.twitter?.map((ad, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <p className="text-xs text-white/70 flex-1">{ad.tweet}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(ad.tweet, `tw-${i}`)}
                        className="h-6 px-2 text-white/60 hover:text-white"
                      >
                        {copiedField === `tw-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-pink-400" />
                  <span className="text-sm font-medium text-pink-300">Budget Recommendations</span>
                </div>
                <p className="text-xs text-white/70">{campaign.social_ads?.budget_recommendations}</p>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-3 mt-4">
              {campaign.email_campaign?.map((email, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Badge className="bg-pink-500/20 text-pink-300 border-0 text-xs mb-2">
                        {email.type}
                      </Badge>
                      <h4 className="text-sm font-medium text-white">{email.subject}</h4>
                      <p className="text-xs text-white/40 mt-1">Send: {email.timing}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(`Subject: ${email.subject}\n\n${email.body}`, `email-${i}`)}
                      className="h-7 px-2 text-white/60 hover:text-white"
                    >
                      {copiedField === `email-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                  <div className="p-3 rounded bg-white/5">
                    <p className="text-xs text-white/60 whitespace-pre-wrap">{email.body}</p>
                  </div>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="strategy" className="space-y-4 mt-4">
              {/* Amazon Tactics */}
              <div className="p-4 rounded-lg bg-white/5">
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-pink-400" />
                  Amazon Optimization
                </h3>
                <ul className="space-y-1">
                  {campaign.promotional_strategies?.amazon_tactics?.map((tactic, i) => (
                    <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                      <span className="text-pink-400">→</span>
                      {tactic}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Goodreads Strategy */}
              <div className="p-4 rounded-lg bg-white/5">
                <h3 className="text-sm font-medium text-white mb-3">Goodreads Strategy</h3>
                <ul className="space-y-1">
                  {campaign.promotional_strategies?.goodreads_strategy?.map((strategy, i) => (
                    <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                      <span className="text-pink-400">→</span>
                      {strategy}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Launch Timeline */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/30">
                <h3 className="text-sm font-medium text-pink-300 mb-3">Launch Week Timeline</h3>
                <div className="space-y-2">
                  {campaign.promotional_strategies?.launch_timeline?.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <Badge className="bg-pink-500/20 text-pink-300 border-0 text-xs h-fit">
                        {item.day}
                      </Badge>
                      <p className="text-xs text-white/60 flex-1">{item.action}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Strategy */}
              <div className="p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-medium text-white">Pricing Strategy</h3>
                </div>
                <p className="text-xs text-white/60">{campaign.promotional_strategies?.pricing_strategy}</p>
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-2 mt-4">
              <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                {campaign.content_calendar?.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
                  >
                    <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-pink-300">D{item.day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-white/10 text-white/60 border-0 text-xs">
                          {item.platform}
                        </Badge>
                        <Badge className="bg-pink-500/20 text-pink-300 border-0 text-xs">
                          {item.goal}
                        </Badge>
                      </div>
                      <p className="text-xs text-white/70">{item.content_idea}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          </div>
          )}
          </CardContent>
          </Card>
          );
}