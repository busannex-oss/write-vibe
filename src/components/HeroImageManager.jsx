import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroImageManager() {
  const [heroImage, setHeroImage] = useState("https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400&h=800&fit=crop&q=80");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setHeroImage(file_url);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
      setLoading(false);
    }
  };

  const generateHeroImage = async () => {
    setGenerating(true);
    try {
      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: "Professional photograph of diverse authors proudly holding their published books. Include multiple people of different ethnicities and backgrounds, all smiling and displaying their finished novels with confidence. Modern, bright lighting, bookshelf or library background. Professional, inspiring, and celebratory mood. High resolution, 1400x800 pixels."
      });
      setHeroImage(url);
    } catch (error) {
      console.error("Error generating image:", error);
    }
    setGenerating(false);
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Landing Page Hero Image
        </CardTitle>
        <CardDescription className="text-white/50">
          Customize the hero image shown on your landing page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl overflow-hidden border border-white/10 h-64">

          <img
            src={heroImage}
            alt="Hero Preview"
            className="w-full h-full object-cover" />

        </motion.div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Upload Button */}
          <div>
            <Label htmlFor="hero-upload" className="cursor-pointer">
              <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors h-full">
                {loading ?
                <>
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    <span className="text-white text-sm">Uploading...</span>
                  </> :

                <>
                    <Upload className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">Upload Image</span>
                  </>
                }
              </div>
            </Label>
            <Input
              id="hero-upload"
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={loading || generating} />

          </div>

          {/* Generate Button */}
          <Button
            onClick={generateHeroImage}
            disabled={generating || loading}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">

            {generating ?
            <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </> :

            <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate
              </>
            }
          </Button>

          {/* Regenerate Button */}
          <Button
            onClick={generateHeroImage}
            disabled={generating || loading}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10">


            {generating ?
            <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Regenerating...
              </> :

            <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </>
            }
          </Button>
        </div>

        <p className="text-xs text-white/40">
          💡 Upload your own image (1400x800px recommended) or use AI to generate one automatically.
        </p>
      </CardContent>
    </Card>);

}