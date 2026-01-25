import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, Loader2, Image, Upload, RefreshCw, Download, Star, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function CoverDesigner({ book, onUpdate, isUpdating }) {
  const [generating, setGenerating] = useState(false);
  const [frontCover, setFrontCover] = useState(book.front_cover_url || "");
  const [backCover, setBackCover] = useState(book.back_cover_url || "");
  const [authorPhoto, setAuthorPhoto] = useState(book.author_photo_url || "");
  const [includeAuthorPhoto, setIncludeAuthorPhoto] = useState(!!book.author_photo_url);
  const [coverStyle, setCoverStyle] = useState("modern");
  const [coverGenerations, setCoverGenerations] = useState(book.cover_generations || []);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    setCoverGenerations(book.cover_generations || []);
  }, [book.cover_generations]);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setCurrentUser(userData);
    } catch (e) {}
  };

  const styles = [
    { id: "modern", label: "Modern & Minimal" },
    { id: "classic", label: "Classic & Elegant" },
    { id: "bold", label: "Bold & Dramatic" },
    { id: "illustrated", label: "Illustrated" },
    { id: "photographic", label: "Photographic" },
    { id: "artistic", label: "Artistic & Abstract" }
  ];

  const generateFrontCover = async () => {
    setGenerating(true);
    try {
      const mainCharacter = book.characters?.find(c => c.role?.toLowerCase().includes('protagonist')) || book.characters?.[0];
      
      const prompt = `Professional book cover design for "${book.title}" - a ${book.category} book.
        
Style: ${coverStyle}
Themes: ${book.subjects?.join(', ')}
${mainCharacter ? `Main character: ${mainCharacter.name} - ${mainCharacter.appearance || mainCharacter.description}` : ''}

The cover should:
- Be appropriate for ${book.target_audience?.age_range} readers
- Feature compelling imagery that hints at the story
- Have clear space for the title at the top
- Look professional and marketable
- Match the ${coverStyle} aesthetic

High quality, professional book cover design, 6x9 aspect ratio, publishing quality.`;

      const response = await base44.integrations.Core.GenerateImage({ prompt });
      
      setFrontCover(response.url);

      // Save generation
      const newGeneration = {
        id: Date.now().toString(),
        type: "front",
        image_url: response.url,
        prompt,
        style: coverStyle,
        created_at: new Date().toISOString(),
        votes: []
      };

      const updatedGenerations = [...(book.cover_generations || []), newGeneration];
      setCoverGenerations(updatedGenerations);
      await onUpdate({ cover_generations: updatedGenerations }, false);
    } catch (error) {
      console.error("Error generating cover:", error);
    }
    setGenerating(false);
  };

  const rateGeneration = async (generationId, rating) => {
    if (!currentUser) return;
    
    const updatedGenerations = coverGenerations.map(gen => {
      if (gen.id === generationId) {
        const existingVoteIndex = gen.votes.findIndex(v => v.user_email === currentUser.email);
        const newVotes = [...gen.votes];
        
        if (existingVoteIndex >= 0) {
          newVotes[existingVoteIndex] = { user_email: currentUser.email, rating };
        } else {
          newVotes.push({ user_email: currentUser.email, rating });
        }
        
        return { ...gen, votes: newVotes };
      }
      return gen;
    });

    setCoverGenerations(updatedGenerations);
    await onUpdate({ cover_generations: updatedGenerations }, false);
  };

  const selectAsFinal = async (generationId) => {
    const generation = coverGenerations.find(g => g.id === generationId);
    if (!generation) return;

    if (generation.type === "front") {
      setFrontCover(generation.image_url);
      await onUpdate({ front_cover_url: generation.image_url }, false);
    }
  };

  const getAverageRating = (votes) => {
    if (!votes || votes.length === 0) return 0;
    const sum = votes.reduce((acc, v) => acc + v.rating, 0);
    return sum / votes.length;
  };

  const getUserRating = (votes) => {
    if (!currentUser || !votes) return 0;
    const vote = votes.find(v => v.user_email === currentUser.email);
    return vote ? vote.rating : 0;
  };

  const sortedGenerations = [...coverGenerations]
    .filter(g => g.type === "front")
    .sort((a, b) => getAverageRating(b.votes) - getAverageRating(a.votes));

  const handleUploadAuthorPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setAuthorPhoto(file_url);
      } catch (error) {
        console.error("Error uploading photo:", error);
      }
    }
  };

  const saveCover = () => {
    onUpdate({ 
      front_cover_url: frontCover, 
      back_cover_url: backCover,
      author_photo_url: includeAuthorPhoto ? authorPhoto : null,
      status: "cover_design" 
    }, true);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Image className="w-5 h-5 text-amber-400" />
            Book Cover Design
          </CardTitle>
          <CardDescription className="text-white/50">
            Create professional front and back covers for your book
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Style Selection */}
          <div>
            <Label className="text-white/70 mb-3 block">Cover Style</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setCoverStyle(style.id)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    coverStyle === style.id
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500/50 text-amber-300'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  } border`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={generateFrontCover}
              disabled={generating}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Cover...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Front Cover
                </>
              )}
            </Button>
            <Button
              onClick={saveCover}
              disabled={!frontCover || isUpdating}
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Save Cover Design
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cover Preview */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Front Cover */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm">Front Cover</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[2/3] rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden relative">
              {frontCover ? (
                <img src={frontCover} alt="Front Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Image className="w-12 h-12 text-white/20 mx-auto mb-2" />
                    <p className="text-sm text-white/40">Generate a cover</p>
                  </div>
                </div>
              )}
            </div>
            {frontCover && (
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={generateFrontCover}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  disabled={generating}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => window.open(frontCover, '_blank')}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Cover */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm">Back Cover Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[2/3] rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex flex-col">
              {/* Summary */}
              <div className="flex-1">
                <p className="text-sm text-white/70 leading-relaxed line-clamp-[12]">
                  {book.book_summary || "Your book summary will appear here..."}
                </p>
              </div>
              
              {/* Author Section */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  {includeAuthorPhoto && authorPhoto ? (
                    <img src={authorPhoto} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10" />
                  )}
                  <div>
                    <p className="font-medium text-white text-sm">About the Author</p>
                    <p className="text-xs text-white/50">Author bio will go here</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Author Photo Upload */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white/70">Include Author Photo</Label>
                <Switch
                  checked={includeAuthorPhoto}
                  onCheckedChange={setIncludeAuthorPhoto}
                />
              </div>
              {includeAuthorPhoto && (
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadAuthorPhoto}
                    className="bg-white/5 border-white/20 text-white file:bg-amber-500 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-3"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Previous Generations */}
      {sortedGenerations.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Cover Versions
              <Badge className="bg-white/10 text-white/60 border-0 ml-2">
                {sortedGenerations.length} generated
              </Badge>
            </CardTitle>
            <CardDescription className="text-white/50">
              Rate covers and let your team vote on their favorites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedGenerations.map((gen, index) => {
                const avgRating = getAverageRating(gen.votes);
                const userRating = getUserRating(gen.votes);
                const isSelected = gen.image_url === frontCover;

                return (
                  <motion.div
                    key={gen.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected 
                        ? 'bg-amber-500/10 border-amber-500/30' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="w-24 h-36 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 relative">
                        <img src={gen.image_url} alt="" className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-amber-500 rounded-full p-1">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-white/10 text-white/70 border-0 text-xs">
                                {gen.style}
                              </Badge>
                              {avgRating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span className="text-sm text-white/70">
                                    {avgRating.toFixed(1)}
                                  </span>
                                  <span className="text-xs text-white/40">
                                    ({gen.votes.length} {gen.votes.length === 1 ? 'vote' : 'votes'})
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-white/40 line-clamp-2">
                              {gen.prompt}
                            </p>
                          </div>
                        </div>

                        {/* Rating Stars */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-white/50">Your rating:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => rateGeneration(gen.id, star)}
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    star <= userRating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-white/20 hover:text-amber-400/50'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {!isSelected && (
                            <Button
                              size="sm"
                              onClick={() => selectAsFinal(gen.id)}
                              className="bg-amber-500 hover:bg-amber-600 text-white border-0 text-xs h-7"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Select This
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 text-xs h-7"
                            onClick={() => window.open(gen.image_url, '_blank')}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Character Consistency Note */}
      <Card className="bg-amber-500/10 border-amber-500/30">
        <CardContent className="py-4">
          <p className="text-sm text-amber-300">
            <Sparkles className="w-4 h-4 inline mr-2" />
            The AI maintains character consistency across your cover design and video commercial using your character descriptions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}