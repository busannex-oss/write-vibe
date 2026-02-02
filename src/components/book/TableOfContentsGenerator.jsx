import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, Check, Loader2, FileText, Plus, Trash2, RefreshCw, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TableOfContentsGenerator({ book, onUpdate, isUpdating }) {
  const [generating, setGenerating] = useState(false);
  const [tableOfContents, setTableOfContents] = useState(book.table_of_contents || []);
  const [editingIndex, setEditingIndex] = useState(null);

  const generateTOC = async () => {
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a Table of Contents for a book with the following details:

Title: ${book.title}
Genre: ${book.category}
Target Audience: ${book.target_audience?.age_range}
Themes: ${book.subjects?.join(', ')}
Plot Summary: ${book.plot_summary}

Generate a comprehensive table of contents with 12-15 chapters. For each chapter, provide:
- A chapter number
- A compelling, relevant chapter title

The chapter titles should:
1. Follow a logical story progression
2. Be intriguing and thematic
3. Reflect the genre and audience
4. Build narrative momentum`,
        response_json_schema: {
          type: "object",
          properties: {
            chapters: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  chapter_number: { type: "number" },
                  chapter_title: { type: "string" }
                }
              }
            }
          }
        }
      });
      setTableOfContents(response.chapters || []);
    } catch (error) {
      console.error("Error generating TOC:", error);
    }
    setGenerating(false);
  };

  const updateChapter = (index, field, value) => {
    const newTOC = [...tableOfContents];
    newTOC[index] = { ...newTOC[index], [field]: value };
    setTableOfContents(newTOC);
  };

  const addChapter = () => {
    setTableOfContents([...tableOfContents, {
      chapter_number: tableOfContents.length + 1,
      chapter_title: ""
    }]);
  };

  const removeChapter = (index) => {
    const newTOC = tableOfContents.filter((_, i) => i !== index).map((ch, i) => ({
      ...ch,
      chapter_number: i + 1
    }));
    setTableOfContents(newTOC);
  };

  const saveTOC = () => {
    onUpdate({ table_of_contents: tableOfContents }, true);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Table of Contents
          </CardTitle>
          <CardDescription className="text-white/50">
            Generate chapter titles to structure your book
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={generateTOC}
              disabled={generating}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate TOC
                </>
              )}
            </Button>
            <Button
              onClick={generateTOC}
              disabled={generating || tableOfContents.length === 0}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
            <Button
              onClick={addChapter}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Chapter
            </Button>
            <Button
              onClick={saveTOC}
              disabled={tableOfContents.length === 0 || isUpdating}
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 ml-auto"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Save TOC
            </Button>
          </div>
        </CardContent>
      </Card>

      {tableOfContents.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence>
            {tableOfContents.map((chapter, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-amber-400">{chapter.chapter_number}</span>
                      </div>
                      <div className="flex-1">
                        {editingIndex === index ? (
                          <Input
                            value={chapter.chapter_title}
                            onChange={(e) => updateChapter(index, 'chapter_title', e.target.value)}
                            className="bg-white/5 border-white/20 text-white"
                            placeholder="Chapter title"
                            autoFocus
                          />
                        ) : (
                          <h4 className="font-medium text-white">
                            {chapter.chapter_title || "Untitled Chapter"}
                          </h4>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                          className="text-white/40 hover:text-white hover:bg-white/10"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeChapter(index)}
                          className="text-white/40 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {tableOfContents.length === 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No table of contents yet</h3>
            <p className="text-white/50">Generate chapter titles to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}