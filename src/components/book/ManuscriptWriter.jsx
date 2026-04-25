import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { sanitizeText } from "@/utils/sanitizeText";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Check,
  Loader2,
  BookOpen,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Users,
  Save,
  Wand2,
  Zap } from
"lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AIEditorPanel from "./AIEditorPanel";
import ManuscriptAnalytics from "./ManuscriptAnalytics";
import ChapterVersionHistory from "./ChapterVersionHistory";
import AIFeedbackSidebar from "./AIFeedbackSidebar";

export default function ManuscriptWriter({ book, onUpdate, isUpdating }) {
  const [manuscript, setManuscript] = useState(book.manuscript_chapters || []);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [generatingChapter, setGeneratingChapter] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(null);
  const [coAuthorMode, setCoAuthorMode] = useState(false);
  const [coAuthorPrompt, setCoAuthorPrompt] = useState("");
  const [chapterVersions, setChapterVersions] = useState(book.chapter_versions || {});
  const [feedbackChapterIndex, setFeedbackChapterIndex] = useState(null);

  const chapters = book.industry_outline || book.detailed_outline || book.table_of_contents || [];

  const generateChapter = async (chapterIndex) => {
    setGeneratingChapter(chapterIndex);
    try {
      const chapter = chapters[chapterIndex];
      const existingChapter = manuscript[chapterIndex];

      const prompt = coAuthorMode && coAuthorPrompt ?
      `Continue or revise this chapter based on the author's notes: "${coAuthorPrompt}"

Existing content:
${existingChapter?.content || 'No existing content'}

Chapter ${chapter.chapter_number}: ${chapter.chapter_title}
${chapter.summary || chapter.scene_breakdown || ''}

Write engaging, literary prose that matches the book's style and genre.` :
      `Write Chapter ${chapter.chapter_number}: ${chapter.chapter_title}

Book: ${book.title}
Genre: ${book.category}
Characters: ${JSON.stringify(book.characters?.slice(0, 3).map((c) => c.name))}

Chapter Details:
${chapter.summary || ''}
${chapter.scene_breakdown || ''}
${chapter.narrative_arc || ''}
Key Events: ${chapter.key_events?.join(', ') || 'None specified'}

Write 2000-3000 words of engaging, well-paced prose. Include dialogue, vivid descriptions, and character development.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            content: { type: "string" }
          }
        }
      });

      const newManuscript = [...manuscript];
      newManuscript[chapterIndex] = {
        chapter_number: chapter.chapter_number,
        chapter_title: chapter.chapter_title,
        content: response.content,
        word_count: response.content.split(/\s+/).length,
        images: existingChapter?.images || []
      };
      setManuscript(newManuscript);
      setCoAuthorPrompt("");
    } catch (error) {
      console.error("Error generating chapter:", error);
    }
    setGeneratingChapter(null);
  };

  const generateChapterImage = async (chapterIndex) => {
    setGeneratingImage(chapterIndex);
    try {
      const chapter = manuscript[chapterIndex];
      const bookChapter = chapters[chapterIndex];

      // Use book cover and character images as reference for consistent quality and style
      const referenceImages = [
        book.front_cover_url,
        ...(book.characters?.map((c) => c.image_url).filter(Boolean) || [])
      ].filter(Boolean);

      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: `Professional book illustration for Chapter ${chapter.chapter_number}: ${chapter.chapter_title}

Book: "${book.title}"
Genre: ${book.category}
Chapter Summary: ${bookChapter.summary || bookChapter.scene_breakdown || chapter.content?.substring(0, 300)}

CRITICAL - Visual Consistency:
- Match the exact artistic style, color palette, and quality of the book cover
- Maintain consistent character appearances and visual motifs
- Use the same level of detail and professional polish as the cover art
- ${book.category} genre aesthetics

Create ONE compelling, publication-quality illustration that captures the key moment of this chapter.
High quality, professional book illustration, suitable for print publication.`,
        existing_image_urls: referenceImages.slice(0, 3)
      });

      const newManuscript = [...manuscript];
      newManuscript[chapterIndex] = {
        ...newManuscript[chapterIndex],
        images: [url] // One image per chapter
      };
      setManuscript(newManuscript);
    } catch (error) {
      console.error("Error generating chapter image:", error);
    }
    setGeneratingImage(null);
  };

  const updateChapterContent = (chapterIndex, content) => {
    const newManuscript = [...manuscript];
    newManuscript[chapterIndex] = {
      ...newManuscript[chapterIndex],
      content,
      word_count: content.split(/\s+/).length
    };
    setManuscript(newManuscript);
  };

  const applySuggestion = (chapterIndex, original, suggested) => {
    const manuscriptChapter = manuscript[chapterIndex];
    if (!manuscriptChapter?.content) return;

    const updatedContent = manuscriptChapter.content.replace(original, suggested);
    updateChapterContent(chapterIndex, updatedContent);
  };

  const saveManuscript = () => {
    // Filter out any undefined/null holes and ensure each item is a valid object
    const cleanManuscript = manuscript
      .filter(ch => ch && typeof ch === 'object' && ch.chapter_number !== undefined)
      .map(ch => ({
        chapter_number: ch.chapter_number || 0,
        chapter_title: ch.chapter_title || '',
        content: ch.content || '',
        word_count: ch.word_count || 0,
        images: Array.isArray(ch.images) ? ch.images : []
      }));
    onUpdate({ manuscript_chapters: cleanManuscript }, true);
  };

  const saveChapterVersion = async (versionData) => {
    const chapterKey = `chapter_${versionData.chapter_number}`;
    const currentVersions = chapterVersions[chapterKey] || [];
    const newVersions = [...currentVersions, versionData];
    
    const updatedVersions = {
      ...chapterVersions,
      [chapterKey]: newVersions
    };
    
    setChapterVersions(updatedVersions);
    onUpdate({ chapter_versions: updatedVersions }, false);
  };

  const restoreChapterVersion = (chapterIndex, version) => {
    const newManuscript = [...manuscript];
    newManuscript[chapterIndex] = {
      chapter_number: version.chapter_number,
      chapter_title: version.chapter_title,
      content: version.content,
      word_count: version.word_count,
      images: newManuscript[chapterIndex]?.images || []
    };
    setManuscript(newManuscript);
  };

  const generateAllChapters = async () => {
    for (let i = 0; i < chapters.length; i++) {
      if (!manuscript[i]?.content) {
        await generateChapter(i);
      }
    }
  };

  const totalWords = manuscript.reduce((sum, ch) => sum + (ch?.word_count || 0), 0);

  const feedbackChapter = feedbackChapterIndex !== null ? manuscript[feedbackChapterIndex] : null;

  return (
    <div className="space-y-6">
      {/* Analytics */}
      {manuscript.length > 0 &&
      <ManuscriptAnalytics book={book} manuscript={manuscript} />
      }

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            AI Manuscript Writer
          </CardTitle>
          <CardDescription className="text-white/50">
            Generate your complete manuscript chapter by chapter with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div>
              <div className="text-sm text-white/50">Total Manuscript</div>
              <div className="text-2xl font-bold text-white">{totalWords.toLocaleString()} words</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/50">Chapters Written</div>
              <div className="text-2xl font-bold text-amber-400">
                {manuscript.filter((ch) => ch?.content).length} / {chapters.length}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={generateAllChapters}
              disabled={generatingChapter !== null}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">

              <Sparkles className="w-4 h-4 mr-2" />
              Generate All Chapters
            </Button>
            <Button
              onClick={() => setCoAuthorMode(!coAuthorMode)}
              className={coAuthorMode 
                ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0"
                : "border-white/20 text-white hover:bg-white/10"
              }>
              <Users className="w-4 h-4 mr-2" />
              {coAuthorMode ? "Co-Author Mode Active" : "Co-Author Mode"}
            </Button>
            <Button
              onClick={saveManuscript}
              disabled={manuscript.length === 0 || isUpdating}
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 ml-auto">

              {isUpdating ?
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :

              <Save className="w-4 h-4 mr-2" />
              }
              Save Manuscript
            </Button>
          </div>

          {coAuthorMode &&
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">

              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Co-Author Instructions</span>
              </div>
              <Input
              value={coAuthorPrompt}
              onChange={(e) => setCoAuthorPrompt(e.target.value)}
              placeholder="E.g., 'Add more dialogue', 'Make it darker', 'Focus on character emotions'..."
              className="bg-white/5 border-white/20 text-white" />

              <p className="text-xs text-white/40 mt-2">
                AI will use your notes to revise or continue the chapter
              </p>
            </motion.div>
          }
        </CardContent>
      </Card>

      {feedbackChapter && (
        <div className="fixed inset-y-0 right-0 z-50 flex items-stretch">
          <AIFeedbackSidebar
            chapter={feedbackChapter}
            book={book}
            onClose={() => setFeedbackChapterIndex(null)}
          />
        </div>
      )}

      {chapters.length > 0 ?
      <div className="space-y-3">
          <AnimatePresence>
            {chapters.map((chapter, index) => {
            const manuscriptChapter = manuscript[index];
            const hasContent = manuscriptChapter?.content;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}>

                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div
                      className="flex items-start gap-4 cursor-pointer"
                      onClick={() => setExpandedChapter(expandedChapter === index ? null : index)}>

                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center flex-shrink-0">
                          <span className="font-semibold text-amber-400">{chapter.chapter_number}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white">{chapter.chapter_title}</h4>
                          {hasContent &&
                        <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-emerald-400 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                {manuscriptChapter.word_count.toLocaleString()} words
                              </span>
                              {manuscriptChapter.images?.length > 0 &&
                          <span className="text-xs text-purple-400 flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3" />
                                  {manuscriptChapter.images.length} image{manuscriptChapter.images.length > 1 ? 's' : ''}
                                </span>
                          }
                            </div>
                        }
                          {!hasContent &&
                        <p className="text-xs text-white/40 mt-1">Not written yet</p>
                        }
                        </div>
                        <div className="flex items-center gap-2">
                          {hasContent && (
                            <Button
                              onClick={(e) => { e.stopPropagation(); setFeedbackChapterIndex(feedbackChapterIndex === index ? null : index); }}
                              size="sm" variant="outline"
                              className="border-white/20 text-white/70 hover:text-white hover:bg-white/10">
                              <Zap className="w-3 h-3 mr-1" /> AI Feedback
                            </Button>
                          )}
                          <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            generateChapter(index);
                          }}
                          disabled={generatingChapter === index}
                          size="sm"
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">

                            {generatingChapter === index ?
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" /> :
                          hasContent ?
                          <RefreshCw className="w-3 h-3 mr-1" /> :

                          <Wand2 className="w-3 h-3 mr-1" />
                          }
                            {generatingChapter === index ? "Writing..." : hasContent ? "Rewrite" : "Write"}
                          </Button>
                          {expandedChapter === index ?
                        <ChevronUp className="w-5 h-5 text-white/40" /> :

                        <ChevronDown className="w-5 h-5 text-white/40" />
                        }
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedChapter === index &&
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 pt-4 border-t border-white/10 space-y-4">

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <label className="text-sm text-white/50">Chapter Content</label>
                                  <ChapterVersionHistory
                                    chapterNumber={chapter.chapter_number}
                                    chapterTitle={chapter.chapter_title}
                                    currentContent={manuscriptChapter?.content}
                                    versions={chapterVersions[`chapter_${chapter.chapter_number}`] || []}
                                    onSaveVersion={saveChapterVersion}
                                    onRestore={(version) => restoreChapterVersion(index, version)}
                                  />
                                </div>
                                <Button
                               onClick={() => generateChapterImage(index)}
                               disabled={!hasContent || generatingImage === index}
                               size="sm"
                               variant="outline"
                               className="border-white/20 text-white hover:bg-white/10">

                                  {generatingImage === index ?
                               <Loader2 className="w-3 h-3 mr-1 animate-spin" /> :

                               <ImageIcon className="w-3 h-3 mr-1" />
                               }
                                  Generate Image
                                </Button>
                              </div>
                              <Textarea
                            value={sanitizeText(manuscriptChapter?.content) || ""}
                            onChange={(e) => updateChapterContent(index, e.target.value)}
                            className="bg-white/5 border-white/20 text-white font-mono text-sm"
                            rows={12}
                            placeholder="Chapter content will appear here..." />

                            </div>

                            {hasContent &&
                        <AIEditorPanel
                          content={manuscriptChapter.content}
                          onApplySuggestion={(original, suggested) => applySuggestion(index, original, suggested)} />

                        }

                            {manuscriptChapter?.images?.length > 0 &&
                        <div>
                                <label className="text-sm text-white/50 mb-2 block">Chapter Illustrations</label>
                                <div className="grid grid-cols-2 gap-3">
                                  {manuscriptChapter.images.map((img, imgIndex) =>
                            <img
                              key={imgIndex}
                              src={img}
                              alt={`Chapter ${chapter.chapter_number} illustration ${imgIndex + 1}`}
                              className="rounded-lg border border-white/10 w-full h-48 object-cover" />

                            )}
                                </div>
                              </div>
                        }
                          </motion.div>
                      }
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>);

          })}
          </AnimatePresence>
        </div> :

      <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No chapters yet</h3>
            <p className="text-white/50">Create a table of contents or outline first</p>
          </CardContent>
        </Card>
      }
    </div>);

}