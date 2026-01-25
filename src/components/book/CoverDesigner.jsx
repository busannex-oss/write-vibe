import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Check, Loader2, Image, Upload, RefreshCw, Download } from "lucide-react";

export default function CoverDesigner({ book, onUpdate, isUpdating }) {
  const [generating, setGenerating] = useState(false);
  const [frontCover, setFrontCover] = useState(book.front_cover_url || "");
  const [backCover, setBackCover] = useState(book.back_cover_url || "");
  const [authorPhoto, setAuthorPhoto] = useState(book.author_photo_url || "");
  const [includeAuthorPhoto, setIncludeAuthorPhoto] = useState(!!book.author_photo_url);
  const [coverStyle, setCoverStyle] = useState("modern");

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
      
      const response = await base44.integrations.Core.GenerateImage({
        prompt: `Professional book cover design for "${book.title}" - a ${book.category} book.
        
Style: ${coverStyle}
Themes: ${book.subjects?.join(', ')}
${mainCharacter ? `Main character: ${mainCharacter.name} - ${mainCharacter.appearance || mainCharacter.description}` : ''}

The cover should:
- Be appropriate for ${book.target_audience?.age_range} readers
- Feature compelling imagery that hints at the story
- Have clear space for the title at the top
- Look professional and marketable
- Match the ${coverStyle} aesthetic

High quality, professional book cover design, 6x9 aspect ratio, publishing quality.`
      });
      
      setFrontCover(response.url);
    } catch (error) {
      console.error("Error generating cover:", error);
    }
    setGenerating(false);
  };

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
    });
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