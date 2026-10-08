import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ai } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Check, Loader2, FileText, Plus, Trash2, RefreshCw, Edit3, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DetailedOutlineGenerator({ book, onUpdate, isUpdating }) {
  const [generating, setGenerating] = useState(false);
  const [detailedOutline, setDetailedOutline] = useState(book.detailed_outline || []);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);

  const generateDetailedOutline = async () => {
    setGenerating(true);
    try {
      const tocData = book.table_of_contents?.map(ch => 
        `Chapter ${ch.chapter_number}: ${ch.chapter_title}`
      ).join('\n') || 'No TOC available';

      const response = await ai.InvokeLLM({
        prompt: `Create a detailed outline for a book based on:

Title: ${book.title}
Genre: ${book.category}
Target Audience: ${book.target_audience?.age_range}
Themes: ${book.subjects?.join(', ')}
Characters: ${JSON.stringify(book.characters?.map(c => ({ name: c.name, role: c.role })))}
Plot Summary: ${book.plot_summary}

Table of Contents:
${tocData}

For each chapter in the TOC, create:
1. Chapter summary (2-3 sentences describing what happens)
2. Key events (3-5 important moments or scenes)

Ensure proper story structure and pacing.`,
        response_json_schema: {
          type: "object",
          properties: {
            chapters: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  chapter_number: { type: "number" },
                  chapter_title: { type: "string" },
                  summary: { type: "string" },
                  key_events: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });
      setDetailedOutline(response.chapters || []);
    } catch (error) {
      console.error("Error generating detailed outline:", error);
    }
    setGenerating(false);
  };

  const updateChapter = (index, field, value) => {
    const newOutline = [...detailedOutline];
    newOutline[index] = { ...newOutline[index], [field]: value };
    setDetailedOutline(newOutline);
  };

  const removeChapter = (index) => {
    const newOutline = detailedOutline.filter((_, i) => i !== index).map((ch, i) => ({
      ...ch,
      chapter_number: i + 1
    }));
    setDetailedOutline(newOutline);
  };

  const saveOutline = () => {
    onUpdate({ detailed_outline: detailedOutline }, true);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Detailed Book Outline
          </CardTitle>
          <CardDescription className="text-white/50">
            Expand your table of contents with summaries and key events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={generateDetailedOutline}
              disabled={generating}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Outline...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Outline
                </>
              )}
            </Button>
            <Button
              onClick={generateDetailedOutline}
              disabled={generating || detailedOutline.length === 0}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
            <Button
              onClick={saveOutline}
              disabled={detailedOutline.length === 0 || isUpdating}
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 ml-auto"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Save Outline
            </Button>
          </div>
        </CardContent>
      </Card>

      {detailedOutline.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence>
            {detailedOutline.map((chapter, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div 
                      className="flex items-start gap-4 cursor-pointer"
                      onClick={() => setExpandedChapter(expandedChapter === index ? null : index)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-semibold text-amber-400">{chapter.chapter_number}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {editingChapter === index ? (
                          <Input
                            value={chapter.chapter_title}
                            onChange={(e) => updateChapter(index, 'chapter_title', e.target.value)}
                            className="bg-slate-800/50 border-white/20 text-white placeholder:text-white/40"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <h4 className="font-semibold text-white">
                            {chapter.chapter_title || "Untitled Chapter"}
                          </h4>
                        )}
                        <p className="text-sm text-white/50 mt-1 line-clamp-2">{chapter.summary}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChapter(editingChapter === index ? null : index);
                          }}
                          className="text-white/40 hover:text-white hover:bg-white/10"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeChapter(index);
                          }}
                          className="text-white/40 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {expandedChapter === index ? (
                          <ChevronUp className="w-5 h-5 text-white/40" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white/40" />
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedChapter === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t border-white/10"
                        >
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm text-white/50">Chapter Summary</label>
                              <Textarea
                                value={chapter.summary}
                                onChange={(e) => updateChapter(index, 'summary', e.target.value)}
                                className="bg-white/5 border-white/20 text-white mt-1"
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="text-sm text-white/50">Key Events</label>
                              <div className="space-y-2 mt-2">
                                {chapter.key_events?.map((event, eventIndex) => (
                                  <div key={eventIndex} className="flex items-center gap-2">
                                    <span className="text-amber-400">•</span>
                                    <Input
                                      value={event}
                                      onChange={(e) => {
                                        const newEvents = [...chapter.key_events];
                                        newEvents[eventIndex] = e.target.value;
                                        updateChapter(index, 'key_events', newEvents);
                                      }}
                                      className="bg-white/5 border-white/20 text-white flex-1"
                                    />
                                  </div>
                                ))}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateChapter(index, 'key_events', [...(chapter.key_events || []), ""])}
                                  className="text-white/50 hover:text-white"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Event
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {detailedOutline.length === 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No outline yet</h3>
            <p className="text-white/50">Generate a detailed outline based on your table of contents</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}