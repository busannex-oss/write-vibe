import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Check, Loader2, FileText, Plus, Trash2, Edit3, ChevronDown, ChevronUp, Bookmark, Library } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SaveTemplateDialog from "@/components/templates/SaveTemplateDialog";
import LoadTemplateDialog from "@/components/templates/LoadTemplateDialog";

export default function UnifiedOutlineGenerator({ book, onUpdate, isUpdating }) {
  const [generating, setGenerating] = useState(false);
  const [outline, setOutline] = useState(book.table_of_contents || []);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);
  const [viewMode, setViewMode] = useState("simple");
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [loadTemplateOpen, setLoadTemplateOpen] = useState(false);

  const generateOutline = async () => {
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a comprehensive book outline based on:

Title: ${book.title}
Genre: ${book.category}
Target Audience: ${book.target_audience?.age_range}
Themes: ${book.subjects?.join(', ')}
Characters: ${JSON.stringify(book.characters?.map(c => ({ name: c.name, role: c.role })))}
Plot Summary: ${book.plot_summary}

Generate a complete outline with the following for EACH chapter:
1. **Chapter Title** (compelling and descriptive)
2. **Summary** (2-3 sentences describing what happens)
3. **Key Events** (3-5 important moments or scenes)
4. **Scene Breakdown** (3-5 scenes with locations)
5. **Narrative Arc** (opening, conflict, resolution)
6. **Word Count Target** (2,000-5,000 words)
7. **Pacing** (Fast/Medium/Slow)
8. **Character Focus** (main characters in this chapter)
9. **Plot Threads** (storylines advanced)

Follow industry best practices with proper story structure, rising tension, character development arcs, and thematic consistency.`,
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
                  key_events: { type: "array", items: { type: "string" } },
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
      setOutline(response.chapters || []);
      setViewMode("simple");
    } catch (error) {
      console.error("Error generating outline:", error);
    }
    setGenerating(false);
  };

  const updateChapter = (index, field, value) => {
    const newOutline = [...outline];
    newOutline[index] = { ...newOutline[index], [field]: value };
    setOutline(newOutline);
  };

  const removeChapter = (index) => {
    const newOutline = outline.filter((_, i) => i !== index).map((ch, i) => ({
      ...ch,
      chapter_number: i + 1
    }));
    setOutline(newOutline);
  };

  const addChapter = () => {
    const newChapter = {
      chapter_number: outline.length + 1,
      chapter_title: "New Chapter",
      summary: "",
      key_events: [],
      scene_breakdown: "",
      narrative_arc: "",
      word_count_target: 3000,
      pacing: "Medium",
      character_focus: [],
      plot_threads: []
    };
    setOutline([...outline, newChapter]);
  };

  const saveOutline = () => {
    onUpdate({ 
      table_of_contents: outline,
      detailed_outline: outline,
      industry_outline: outline
    }, true);
  };

  const applyOutlineTemplate = (template) => {
    setOutline(template.outline_data || []);
    setViewMode("simple");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Book Outline
          </CardTitle>
          <CardDescription className="text-white/50">
            Generate a complete, publication-ready outline with all chapter details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={generateOutline}
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
                  Generate Complete Outline
                </>
              )}
            </Button>
            <Button
              onClick={addChapter}
              disabled={outline.length === 0}
              variant="ghost"
              className="border-white/20 text-white/60 hover:text-white hover:bg-white/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Chapter
            </Button>
            <Button
              onClick={saveOutline}
              disabled={outline.length === 0 || isUpdating}
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 ml-auto"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Save Outline
            </Button>
            <Button
              onClick={() => setSaveTemplateOpen(true)}
              disabled={outline.length === 0}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Save as Template
            </Button>
            <Button
              onClick={() => setLoadTemplateOpen(true)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Library className="w-4 h-4 mr-2" />
              Load Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {outline.length > 0 && (
        <div className="space-y-3">
          <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-4">
            <TabsList className="bg-white/5 border-white/10">
              <TabsTrigger value="simple">Simple View</TabsTrigger>
              <TabsTrigger value="detailed">Detailed View</TabsTrigger>
            </TabsList>

            <TabsContent value="simple" className="space-y-3 mt-0">
              <AnimatePresence>
                {outline.map((chapter, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center flex-shrink-0">
                            <span className="font-semibold text-amber-400">{chapter.chapter_number}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            {editingChapter === index ? (
                              <Input
                                value={chapter.chapter_title}
                                onChange={(e) => updateChapter(index, 'chapter_title', e.target.value)}
                                className="bg-slate-800/50 border-white/20 text-white placeholder:text-white/40 mb-2"
                                placeholder="Chapter title"
                              />
                            ) : (
                              <h4 className="font-semibold text-white">{chapter.chapter_title}</h4>
                            )}
                            <p className="text-sm text-white/50 mt-1 line-clamp-2">{chapter.summary}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingChapter(editingChapter === index ? null : index)}
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
            </TabsContent>

            <TabsContent value="detailed" className="space-y-3 mt-0">
              <AnimatePresence>
                {outline.map((chapter, index) => (
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
                            <h4 className="font-semibold text-white">{chapter.chapter_title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-white/40">{chapter.word_count_target?.toLocaleString()} words</span>
                              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">{chapter.pacing}</span>
                            </div>
                          </div>
                          {expandedChapter === index ? (
                            <ChevronUp className="w-5 h-5 text-white/40 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-white/40 flex-shrink-0" />
                          )}
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
                                <label className="text-sm text-white/50">Summary</label>
                                <Textarea
                                  value={chapter.summary}
                                  onChange={(e) => updateChapter(index, 'summary', e.target.value)}
                                  className="bg-white/5 border-white/20 text-white mt-1"
                                  rows={2}
                                />
                              </div>

                              <div>
                                <label className="text-sm text-white/50">Scene Breakdown</label>
                                <Textarea
                                  value={chapter.scene_breakdown}
                                  onChange={(e) => updateChapter(index, 'scene_breakdown', e.target.value)}
                                  className="bg-white/5 border-white/20 text-white mt-1"
                                  rows={3}
                                />
                              </div>

                              <div>
                                <label className="text-sm text-white/50">Narrative Arc</label>
                                <Textarea
                                  value={chapter.narrative_arc}
                                  onChange={(e) => updateChapter(index, 'narrative_arc', e.target.value)}
                                  className="bg-white/5 border-white/20 text-white mt-1"
                                  rows={2}
                                />
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm text-white/50">Word Count Target</label>
                                  <Input
                                    type="number"
                                    value={chapter.word_count_target}
                                    onChange={(e) => updateChapter(index, 'word_count_target', parseInt(e.target.value))}
                                    className="bg-white/5 border-white/20 text-white mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-white/50">Pacing</label>
                                  <Input
                                    value={chapter.pacing}
                                    onChange={(e) => updateChapter(index, 'pacing', e.target.value)}
                                    className="bg-white/5 border-white/20 text-white mt-1"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-sm text-white/50">Key Events</label>
                                <div className="space-y-2 mt-2">
                                  {chapter.key_events?.map((event, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <span className="text-amber-400">•</span>
                                      <Input
                                        value={event}
                                        onChange={(e) => {
                                          const newEvents = [...chapter.key_events];
                                          newEvents[i] = e.target.value;
                                          updateChapter(index, 'key_events', newEvents);
                                        }}
                                        className="bg-white/5 border-white/20 text-white flex-1"
                                      />
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
            </TabsContent>
          </Tabs>
        </div>
      )}

      {outline.length === 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No outline yet</h3>
            <p className="text-white/50">Generate a complete outline or manually add chapters</p>
          </CardContent>
        </Card>
      )}

      <SaveTemplateDialog
        open={saveTemplateOpen}
        onClose={() => setSaveTemplateOpen(false)}
        type="outline"
        data={outline}
        defaultName={book.title ? `${book.title} Outline` : "Book Outline"}
      />
      <LoadTemplateDialog
        open={loadTemplateOpen}
        onClose={() => setLoadTemplateOpen(false)}
        type="outline"
        onApply={applyOutlineTemplate}
      />
    </div>
  );
}