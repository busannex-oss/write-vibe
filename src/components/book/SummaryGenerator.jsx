import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ai } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Check, Loader2, BookOpen, RefreshCw } from "lucide-react";

export default function SummaryGenerator({ book, onUpdate, isUpdating }) {
  const [generating, setGenerating] = useState(false);
  const [summaries, setSummaries] = useState({
    teaser: "",
    backCover: book.book_summary || "",
    extended: ""
  });
  const [activeVersion, setActiveVersion] = useState("backCover");

  const generateSummaries = async () => {
    setGenerating(true);
    try {
      const response = await ai.InvokeLLM({
        prompt: `Create compelling book summaries for marketing purposes.

Book Details:
Title: ${book.title}
Genre: ${book.category}
Target Audience: ${book.target_audience?.age_range}
Themes: ${book.subjects?.join(', ')}
Characters: ${JSON.stringify(book.characters?.map(c => ({ name: c.name, role: c.role })))}
Plot: ${book.plot_summary}
Outline: ${JSON.stringify(book.outline?.map(ch => ch.chapter_title))}

Create three versions:
1. Teaser (50 words) - A punchy hook for social media
2. Back Cover (150-200 words) - Standard back cover copy with hook, setup, and call-to-action
3. Extended Synopsis (400-500 words) - Detailed summary for publishers/reviewers

Each should:
- Hook readers immediately
- Match the genre tone
- Avoid spoilers
- End with intrigue`,
        response_json_schema: {
          type: "object",
          properties: {
            teaser: { type: "string" },
            back_cover: { type: "string" },
            extended: { type: "string" }
          }
        }
      });
      setSummaries({
        teaser: response.teaser || "",
        backCover: response.back_cover || "",
        extended: response.extended || ""
      });
    } catch (error) {
      console.error("Error generating summaries:", error);
    }
    setGenerating(false);
  };

  const saveSummary = () => {
    onUpdate({ book_summary: summaries.backCover, status: "editing" }, true);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            Book Summary
          </CardTitle>
          <CardDescription className="text-white/50">
            Create compelling summaries for marketing and back cover
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={generateSummaries}
              disabled={generating}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Summaries...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Summaries
                </>
              )}
            </Button>
            <Button
              onClick={saveSummary}
              disabled={!summaries.backCover || isUpdating}
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Save Back Cover Summary
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Versions */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="pt-6">
          <Tabs value={activeVersion} onValueChange={setActiveVersion}>
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="teaser" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
                Teaser (50 words)
              </TabsTrigger>
              <TabsTrigger value="backCover" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
                Back Cover
              </TabsTrigger>
              <TabsTrigger value="extended" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
                Extended Synopsis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teaser" className="mt-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-white/70">Social Media Teaser</Label>
                  <span className="text-xs text-white/40">{summaries.teaser.split(' ').length} words</span>
                </div>
                <Textarea
                  value={summaries.teaser}
                  onChange={(e) => setSummaries(prev => ({ ...prev, teaser: e.target.value }))}
                  placeholder="A punchy hook for social media..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="backCover" className="mt-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-white/70">Back Cover Copy</Label>
                  <span className="text-xs text-white/40">{summaries.backCover.split(' ').length} words</span>
                </div>
                <Textarea
                  value={summaries.backCover}
                  onChange={(e) => setSummaries(prev => ({ ...prev, backCover: e.target.value }))}
                  placeholder="Standard back cover copy..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  rows={8}
                />
                <p className="text-xs text-white/40 mt-2">This summary will appear on your book's back cover</p>
              </div>
            </TabsContent>

            <TabsContent value="extended" className="mt-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-white/70">Extended Synopsis</Label>
                  <span className="text-xs text-white/40">{summaries.extended.split(' ').length} words</span>
                </div>
                <Textarea
                  value={summaries.extended}
                  onChange={(e) => setSummaries(prev => ({ ...prev, extended: e.target.value }))}
                  placeholder="Detailed summary for publishers and reviewers..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  rows={12}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {summaries.backCover && (
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm">Back Cover Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
                {summaries.backCover}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}