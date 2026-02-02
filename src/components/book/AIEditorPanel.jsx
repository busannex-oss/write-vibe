import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Target,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIEditorPanel({ content, onApplySuggestion }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [appliedSuggestions, setAppliedSuggestions] = useState(new Set());

  const analyzeContent = async () => {
    if (!content) return;
    
    setAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this manuscript content and provide detailed editorial feedback:

${content}

Provide:
1. Grammar & Style Issues (specific line references)
2. Readability Score (0-100) with explanation
3. Pacing Analysis (too fast, too slow, or good)
4. Plot Holes or Inconsistencies
5. Character Dialogue Quality
6. Specific Suggestions for Improvement

Format as structured analysis with actionable recommendations.`,
        response_json_schema: {
          type: "object",
          properties: {
            grammar_issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  suggestion: { type: "string" },
                  severity: { type: "string" }
                }
              }
            },
            readability: {
              type: "object",
              properties: {
                score: { type: "number" },
                explanation: { type: "string" }
              }
            },
            pacing: {
              type: "object",
              properties: {
                rating: { type: "string" },
                feedback: { type: "string" }
              }
            },
            plot_holes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            dialogue_quality: {
              type: "object",
              properties: {
                score: { type: "number" },
                suggestions: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            improvements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  original: { type: "string" },
                  suggested: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });
      
      setAnalysis(response);
    } catch (error) {
      console.error("Error analyzing content:", error);
    }
    setAnalyzing(false);
  };

  const applySuggestion = (index, suggestion) => {
    onApplySuggestion(suggestion.original, suggestion.suggested);
    setAppliedSuggestions(new Set([...appliedSuggestions, index]));
  };

  const rejectSuggestion = (index) => {
    setAppliedSuggestions(new Set([...appliedSuggestions, index]));
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          AI Editor Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-center py-8">
            <Button
              onClick={analyzeContent}
              disabled={analyzing || !content}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze Chapter
                </>
              )}
            </Button>
            <p className="text-xs text-white/40 mt-3">
              AI will check grammar, style, pacing, dialogue, and plot consistency
            </p>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-4 w-full bg-white/5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="grammar">Grammar</TabsTrigger>
              <TabsTrigger value="dialogue">Dialogue</TabsTrigger>
              <TabsTrigger value="improvements">Suggestions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Readability Score */}
              <div className="p-4 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">Readability Score</span>
                  <Badge className={`${
                    analysis.readability.score >= 70 ? 'bg-emerald-500/20 text-emerald-300' :
                    analysis.readability.score >= 50 ? 'bg-amber-500/20 text-amber-300' :
                    'bg-red-500/20 text-red-300'
                  } border-0`}>
                    {analysis.readability.score}/100
                  </Badge>
                </div>
                <p className="text-xs text-white/50">{analysis.readability.explanation}</p>
              </div>

              {/* Pacing */}
              <div className="p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white/70">Pacing: {analysis.pacing.rating}</span>
                </div>
                <p className="text-xs text-white/50">{analysis.pacing.feedback}</p>
              </div>

              {/* Plot Holes */}
              {analysis.plot_holes?.length > 0 && (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-300">Plot Inconsistencies</span>
                  </div>
                  <div className="space-y-2">
                    {analysis.plot_holes.map((hole, i) => (
                      <div key={i} className="text-xs">
                        <p className="text-white/70">{hole.issue}</p>
                        <p className="text-amber-300/60 mt-1">Impact: {hole.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dialogue Quality */}
              <div className="p-4 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-white/70">Dialogue Quality</span>
                  </div>
                  <Badge className="bg-white/10 text-white/70 border-0">
                    {analysis.dialogue_quality.score}/10
                  </Badge>
                </div>
                {analysis.dialogue_quality.suggestions?.length > 0 && (
                  <ul className="space-y-1 mt-2">
                    {analysis.dialogue_quality.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-xs text-white/50 flex items-start gap-2">
                        <span className="text-purple-400">→</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Button
                onClick={() => setAnalysis(null)}
                variant="outline"
                size="sm"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <Sparkles className="w-3 h-3 mr-2" />
                Re-analyze
              </Button>
            </TabsContent>

            <TabsContent value="grammar" className="space-y-3 mt-4">
              {analysis.grammar_issues?.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
                  <p className="text-sm">No major grammar issues found</p>
                </div>
              ) : (
                analysis.grammar_issues?.map((issue, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-3 rounded-lg border ${
                      issue.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
                      issue.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                      'bg-white/5 border-white/10'
                    }`}
                  >
                    <p className="text-sm text-white mb-1">{issue.issue}</p>
                    <p className="text-xs text-white/50">{issue.suggestion}</p>
                    <Badge className={`mt-2 ${
                      issue.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                      issue.severity === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-blue-500/20 text-blue-300'
                    } border-0 text-xs`}>
                      {issue.severity}
                    </Badge>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="dialogue" className="mt-4">
              <div className="p-4 rounded-lg bg-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Overall Quality</span>
                  <Badge className="bg-purple-500/20 text-purple-300 border-0">
                    {analysis.dialogue_quality.score}/10
                  </Badge>
                </div>
                <div className="space-y-2">
                  {analysis.dialogue_quality.suggestions?.map((suggestion, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-white/60">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="improvements" className="space-y-3 mt-4">
              {analysis.improvements?.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
                  <p className="text-sm">Content looks great!</p>
                </div>
              ) : (
                analysis.improvements?.map((improvement, i) => {
                  const isApplied = appliedSuggestions.has(i);
                  
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-3 rounded-lg border ${
                        isApplied ? 'bg-white/5 border-white/10 opacity-50' : 'bg-purple-500/10 border-purple-500/30'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="text-xs">
                          <span className="text-white/40">Original:</span>
                          <p className="text-white/60 mt-1 italic">"{improvement.original}"</p>
                        </div>
                        <div className="text-xs">
                          <span className="text-purple-300">Suggested:</span>
                          <p className="text-white mt-1">"{improvement.suggested}"</p>
                        </div>
                        <p className="text-xs text-white/40">{improvement.reason}</p>
                      </div>
                      {!isApplied && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => applySuggestion(i, improvement)}
                            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white border-0 text-xs h-7"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Apply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectSuggestion(i)}
                            className="flex-1 border-white/20 text-white hover:bg-white/10 text-xs h-7"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {isApplied && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-xs mt-2">
                          Processed
                        </Badge>
                      )}
                    </motion.div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}