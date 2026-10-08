import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ai } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { sanitizeText } from "@/utils/sanitizeText";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, Loader2, Edit3 } from "lucide-react";

export default function TitleGenerator({ book, onUpdate, isUpdating }) {
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [customTitle, setCustomTitle] = useState(book.title || "");
  const [customSubtitle, setCustomSubtitle] = useState(book.subtitle || "");

  // Auto-generate suggestions if book has data and no title yet
  useEffect(() => {
    const hasBookData = book.characters?.length > 0 || book.target_audience?.age_range || book.category || book.plot_summary;
    const isTitleEmpty = !book.title || book.title === "Untitled Book";
    
    if (hasBookData && isTitleEmpty && suggestions.length === 0 && !generating) {
      generateTitles();
    }
  }, [book.id]);

  const generateTitles = async () => {
    setGenerating(true);
    try {
      const response = await ai.InvokeLLM({
        prompt: `Generate 8 compelling book title suggestions based on the following:
        
Characters: ${JSON.stringify(book.characters?.map(c => ({ name: c.name, role: c.role })))}
Target Audience: ${book.target_audience?.age_range}
Genre: ${book.category}
Themes: ${book.subjects?.join(', ')}
Plot: ${book.plot_summary}

For each title, provide:
1. The main title
2. An optional subtitle
3. A brief explanation of why it works

Make titles memorable, marketable, and appropriate for the genre.`,
        response_json_schema: {
          type: "object",
          properties: {
            titles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  subtitle: { type: "string" },
                  reasoning: { type: "string" }
                }
              }
            }
          }
        }
      });
      setSuggestions(response.titles || []);
    } catch (error) {
      console.error("Error generating titles:", error);
    }
    setGenerating(false);
  };

  const selectTitle = (title, subtitle) => {
    setCustomTitle(title);
    setCustomSubtitle(subtitle || "");
  };

  const saveTitle = () => {
    onUpdate({ title: customTitle, subtitle: customSubtitle }, true);
  };

  return (
    <div className="space-y-6">
      {/* Current Info Card */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-amber-400" />
            Book Title
          </CardTitle>
          <CardDescription className="text-white/50">
            Choose a compelling title that captures your book's essence
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white/70">Title</Label>
            <Input
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Enter your book title..."
              className="bg-white/5 border-white/20 text-white placeholder:text-white/30 text-lg"
            />
          </div>
          <div>
            <Label className="text-white/70">Subtitle (optional)</Label>
            <Input
              value={customSubtitle}
              onChange={(e) => setCustomSubtitle(e.target.value)}
              placeholder="Add a subtitle..."
              className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={generateTitles}
              disabled={generating}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Suggestions
                </>
              )}
            </Button>
            <Button
              onClick={saveTitle}
              disabled={!customTitle || isUpdating}
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Save Title
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">AI Suggestions</CardTitle>
            <CardDescription className="text-white/50">Click a suggestion to use it</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => selectTitle(suggestion.title, suggestion.subtitle)}
                  className={`p-4 rounded-xl text-left transition-all border ${
                    customTitle === suggestion.title
                      ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <h4 className="font-semibold text-white">{sanitizeText(suggestion.title)}</h4>
                  {suggestion.subtitle && (
                    <p className="text-sm text-amber-400 mt-1">{sanitizeText(suggestion.subtitle)}</p>
                  )}
                  <p className="text-sm text-white/50 mt-2">{sanitizeText(suggestion.reasoning)}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Book Info Summary */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm">Book Details (for title generation)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-white/10 text-white/70 border-0">{book.category}</Badge>
            {book.subjects?.slice(0, 3).map((s) => (
              <Badge key={s} className="bg-amber-500/20 text-amber-300 border-0">{s}</Badge>
            ))}
          </div>
          <p className="text-sm text-white/50">
            {book.characters?.length || 0} characters • {book.target_audience?.age_range || "No audience set"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}