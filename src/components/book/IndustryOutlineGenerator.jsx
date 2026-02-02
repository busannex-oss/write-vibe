import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Check, Loader2, FileText, RefreshCw, Edit3, ChevronDown, ChevronUp, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function IndustryOutlineGenerator({ book, onUpdate, isUpdating }) {
  const [generating, setGenerating] = useState(false);
  const [industryOutline, setIndustryOutline] = useState(book.industry_outline || []);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);

  const generateIndustryOutline = async () => {
    setGenerating(true);
    try {
      const detailedOutlineData = book.detailed_outline?.map(ch => 
        `Chapter ${ch.chapter_number}: ${ch.chapter_title}\nSummary: ${ch.summary}\nKey Events: ${ch.key_events?.join(', ')}`
      ).join('\n\n') || book.table_of_contents?.map(ch => 
        `Chapter ${ch.chapter_number}: ${ch.chapter_title}`
      ).join('\n') || 'No outline available';

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a professional, industry-standard book outline following publishing best practices:

Title: ${book.title}
Genre: ${book.category}
Target Audience: ${book.target_audience?.age_range}
Themes: ${book.subjects?.join(', ')}
Characters: ${JSON.stringify(book.characters?.map(c => ({ name: c.name, role: c.role })))}
Plot Summary: ${book.plot_summary}

Current Outline:
${detailedOutlineData}

Transform this into a publication-ready outline with:

For EACH chapter:
1. **Scene Breakdown**: Divide into 3-5 scenes with specific locations and participants
2. **Narrative Arc**: Opening hook, conflict/tension, character development, resolution/cliffhanger
3. **Word Count Target**: Estimated words per chapter (2,000-5,000)
4. **Pacing Notes**: Fast/Medium/Slow pacing indicators
5. **Character Focus**: Which characters are central to this chapter
6. **Plot Threads**: Which storylines are advanced

Follow industry standards for:
- Three-act structure with proper turning points
- Rising tension and stakes
- Character development arcs
- Subplots integration
- Thematic consistency`,
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
                  scene_breakdown: { type: "string" },
                  narrative_arc: { type: "string" },
                  word_count_target: { type: "number" },
                  pacing: { type: "string" },
                  character_focus: { type: "array", items: { type: "string" } },
                  plot_threads: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });
      setIndustryOutline(response.chapters || []);
    } catch (error) {
      console.error("Error generating industry outline:", error);
    }
    setGenerating(false);
  };

  const updateChapter = (index, field, value) => {
    const newOutline = [...industryOutline];
    newOutline[index] = { ...newOutline[index], [field]: value };
    setIndustryOutline(newOutline);
  };

  const saveOutline = () => {
    onUpdate({ industry_outline: industryOutline, outline: industryOutline }, true);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Industry-Standard Book Outline
          </CardTitle>
          <CardDescription className="text-white/50">
            Professional outline with scene breakdowns, pacing, and industry best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={generateIndustryOutline}
              disabled={generating}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Professional Outline...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Industry Outline
                </>
              )}
            </Button>
            <Button
              onClick={generateIndustryOutline}
              disabled={generating || industryOutline.length === 0}
              variant="ghost"
              className="border-white/20 text-white/60 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
            <Button
              onClick={saveOutline}
              disabled={industryOutline.length === 0 || isUpdating}
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

      {industryOutline.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence>
            {industryOutline.map((chapter, index) => (
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
                          <>
                            <h4 className="font-semibold text-white">
                              {chapter.chapter_title || "Untitled Chapter"}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-white/40">{chapter.word_count_target?.toLocaleString()} words</span>
                              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">{chapter.pacing}</span>
                            </div>
                          </>
                        )}
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
                          className="mt-4 pt-4 border-t border-white/10 space-y-4"
                        >
                          <div>
                            <label className="text-sm font-medium text-white/70">Scene Breakdown</label>
                            <Textarea
                              value={chapter.scene_breakdown}
                              onChange={(e) => updateChapter(index, 'scene_breakdown', e.target.value)}
                              className="bg-white/5 border-white/20 text-white mt-1"
                              rows={3}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-white/70">Narrative Arc</label>
                            <Textarea
                              value={chapter.narrative_arc}
                              onChange={(e) => updateChapter(index, 'narrative_arc', e.target.value)}
                              className="bg-white/5 border-white/20 text-white mt-1"
                              rows={2}
                            />
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-white/70">Word Count Target</label>
                              <Input
                                type="number"
                                value={chapter.word_count_target}
                                onChange={(e) => updateChapter(index, 'word_count_target', parseInt(e.target.value))}
                                className="bg-white/5 border-white/20 text-white mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-white/70">Pacing</label>
                              <Input
                                value={chapter.pacing}
                                onChange={(e) => updateChapter(index, 'pacing', e.target.value)}
                                className="bg-white/5 border-white/20 text-white mt-1"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-white/70">Character Focus</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {chapter.character_focus?.map((char, i) => (
                                <span key={i} className="px-2 py-1 rounded bg-white/10 text-white text-xs">
                                  {char}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-white/70">Plot Threads</label>
                            <div className="space-y-1 mt-2">
                              {chapter.plot_threads?.map((thread, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-white/60">
                                  <span className="text-amber-400">→</span>
                                  {thread}
                                </div>
                              ))}
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

      {industryOutline.length === 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <Award className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No industry outline yet</h3>
            <p className="text-white/50">Generate a professional, publication-ready outline</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}