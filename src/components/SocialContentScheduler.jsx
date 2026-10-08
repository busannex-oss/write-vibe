import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ai } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Loader2,
  Check,
  Copy,
  Share2,
  Image as ImageIcon,
  Calendar,
  Send,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
];

const SOCIAL_PLATFORMS = [
  { key: "facebook", label: "Facebook", color: "bg-blue-600", icon: "📘" },
  { key: "twitter", label: "Twitter/X", color: "bg-sky-500", icon: "🐦" },
  { key: "google", label: "Google My Business", color: "bg-red-500", icon: "🔍" },
  { key: "instagram", label: "Instagram", color: "bg-pink-500", icon: "📷" },
  { key: "linkedin", label: "LinkedIn", color: "bg-blue-700", icon: "💼" },
];

export default function SocialContentScheduler({ posts = [], onUpdate }) {
  const [expandedPost, setExpandedPost] = useState(null);
  const [generatingImages, setGeneratingImages] = useState({});
  const [posting, setPosting] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [queued, setQueued] = useState({});

  const queueForDailyPush = async (post) => {
    setQueued(prev => ({ ...prev, [post.id]: "saving" }));
    try {
      await base44.entities.SocialPost.create({
        caption: post.caption,
        image_url: post.image_url || "",
        platforms: (post.platforms || []).filter(p => ["facebook", "instagram", "linkedin"].includes(p)),
        status: "queued",
      });
      setQueued(prev => ({ ...prev, [post.id]: "done" }));
    } catch (error) {
      console.error("Error queueing post:", error);
      setQueued(prev => ({ ...prev, [post.id]: null }));
    }
  };

  const generateImageForPost = async (postId, caption) => {
    setGeneratingImages(prev => ({ ...prev, [postId]: true }));
    try {
      const imageResponse = await ai.GenerateImage({
        prompt: `Create an engaging social media post image based on this caption: "${caption}". 
        Make it visually appealing, on-brand, and suitable for social platforms. 
        Include relevant graphics or visuals that match the content.`,
      });

      if (onUpdate) {
        const updatedPosts = posts.map(p =>
          p.id === postId ? { ...p, image_url: imageResponse.url } : p
        );
        onUpdate(updatedPosts);
      }
    } catch (error) {
      console.error("Error generating image:", error);
    }
    setGeneratingImages(prev => ({ ...prev, [postId]: false }));
  };

  const postToSocialMedia = async (postId, platforms) => {
    setPosting(prev => ({ ...prev, [postId]: true }));
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      await base44.functions.invoke("autoPostSocial", {
        postId,
        caption: post.caption,
        imageUrl: post.image_url,
        platforms,
        scheduledDays: post.scheduled_days,
      });

      if (onUpdate) {
        const updatedPosts = posts.map(p =>
          p.id === postId ? { ...p, posted: true, posted_at: new Date().toISOString() } : p
        );
        onUpdate(updatedPosts);
      }
    } catch (error) {
      console.error("Error posting to social media:", error);
    }
    setPosting(prev => ({ ...prev, [postId]: false }));
  };

  const copyCaption = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleScheduledDay = (postId, day) => {
    if (onUpdate) {
      const post = posts.find(p => p.id === postId);
      const updatedDays = post.scheduled_days?.includes(day)
        ? post.scheduled_days.filter(d => d !== day)
        : [...(post.scheduled_days || []), day];

      const updatedPosts = posts.map(p =>
        p.id === postId ? { ...p, scheduled_days: updatedDays } : p
      );
      onUpdate(updatedPosts);
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-white/5 border-white/10 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-white text-base line-clamp-2">
                      {post.caption?.slice(0, 60)}...
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {post.platforms?.map(platform => {
                        const plat = SOCIAL_PLATFORMS.find(p => p.key === platform);
                        return (
                          <Badge key={platform} className={`${plat?.color} text-white border-0`}>
                            {plat?.icon} {plat?.label}
                          </Badge>
                        );
                      })}
                      {post.image_url && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-0">
                          ✓ Image Ready
                        </Badge>
                      )}
                      {post.posted && (
                        <Badge className="bg-blue-500/20 text-blue-300 border-0">
                          Posted
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {expandedPost === post.id ? "▼" : "▶"}
                  </Button>
                </div>
              </CardHeader>

              <AnimatePresence>
                {expandedPost === post.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent className="space-y-4 border-t border-white/10 pt-4">
                      {/* Caption Display */}
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                          {post.caption}
                        </p>
                      </div>

                      {/* Image Preview */}
                      {post.image_url ? (
                        <div className="rounded-lg overflow-hidden bg-black h-48">
                          <img
                            src={post.image_url}
                            alt="Post preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <Button
                          onClick={() => generateImageForPost(post.id, post.caption)}
                          disabled={generatingImages[post.id]}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                        >
                          {generatingImages[post.id] ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating Image...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Generate AI Image
                            </>
                          )}
                        </Button>
                      )}

                      {/* Scheduled Days */}
                      <div>
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-2">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Schedule for
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {DAYS_OF_WEEK.map(day => (
                            <label
                              key={day.key}
                              className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/8 transition-all"
                            >
                              <Checkbox
                                checked={post.scheduled_days?.includes(day.key) || false}
                                onCheckedChange={() => toggleScheduledDay(post.id, day.key)}
                              />
                              <span className="text-xs text-white/70">{day.short}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => copyCaption(post.caption, post.id)}
                          size="sm"
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          {copiedId === post.id ? (
                            <>
                              <Check className="w-3 h-3 mr-2" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 mr-2" />
                              Copy Caption
                            </>
                          )}
                        </Button>

                        {post.image_url && (
                          <Button
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = post.image_url;
                              link.download = `social-post-${post.id}.jpg`;
                              link.click();
                            }}
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Download className="w-3 h-3 mr-2" />
                            Download Image
                          </Button>
                        )}

                        <Button
                          onClick={() => queueForDailyPush(post)}
                          disabled={queued[post.id] === "saving" || queued[post.id] === "done"}
                          size="sm"
                          variant="outline"
                          className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                        >
                          {queued[post.id] === "saving" ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                              Queueing...
                            </>
                          ) : queued[post.id] === "done" ? (
                            <>
                              <Check className="w-3 h-3 mr-2" />
                              Queued for Daily Push
                            </>
                          ) : (
                            <>
                              <Calendar className="w-3 h-3 mr-2" />
                              Queue Daily Auto-Post
                            </>
                          )}
                        </Button>

                        {post.platforms?.length > 0 && (
                          <Button
                            onClick={() => postToSocialMedia(post.id, post.platforms)}
                            disabled={posting[post.id] || !post.image_url}
                            size="sm"
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 ml-auto"
                          >
                            {posting[post.id] ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                Posting...
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3 mr-2" />
                                Auto Post
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}