import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Loader2, 
  BarChart3,
  Users,
  Target,
  Award,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function ManuscriptAnalytics({ book, manuscript }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  const analyzeManuscript = async () => {
    setAnalyzing(true);
    try {
      const fullText = manuscript.map(ch => ch.content).join('\n\n');
      const characterNames = book.characters?.map(c => c.name) || [];

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this complete manuscript for advanced insights:

Title: ${book.title}
Genre: ${book.category}
Characters: ${characterNames.join(', ')}

FULL MANUSCRIPT:
${fullText}

Provide comprehensive analysis:

1. SENTIMENT ANALYSIS (by chapter):
   - Overall emotional tone for each chapter
   - Sentiment score (-100 to 100)
   - Emotional arc progression

2. CHARACTER ARC TRACKING:
   - Development score for each main character (0-100)
   - Consistency issues or gaps
   - Growth trajectory assessment

3. GENRE PERFORMANCE PREDICTION:
   - Commercial viability score (0-100)
   - Comparison to successful ${book.category} books
   - Strengths and weaknesses for target market
   - Recommended improvements for better performance

4. PACING & STRUCTURE:
   - Act structure adherence
   - Tension curve analysis
   - Peak moments identification`,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment_by_chapter: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  chapter: { type: "number" },
                  tone: { type: "string" },
                  score: { type: "number" },
                  key_emotions: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            character_arcs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  character: { type: "string" },
                  development_score: { type: "number" },
                  consistency: { type: "string" },
                  growth_trajectory: { type: "string" },
                  issues: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            performance_prediction: {
              type: "object",
              properties: {
                commercial_score: { type: "number" },
                market_fit: { type: "string" },
                strengths: {
                  type: "array",
                  items: { type: "string" }
                },
                weaknesses: {
                  type: "array",
                  items: { type: "string" }
                },
                recommendations: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            pacing_structure: {
              type: "object",
              properties: {
                act_structure_score: { type: "number" },
                tension_curve: { type: "string" },
                peak_chapters: {
                  type: "array",
                  items: { type: "number" }
                },
                notes: { type: "string" }
              }
            }
          }
        }
      });

      setAnalytics(response);
    } catch (error) {
      console.error("Error analyzing manuscript:", error);
    }
    setAnalyzing(false);
  };

  const getSentimentColor = (score) => {
    if (score > 50) return 'text-emerald-400';
    if (score > 0) return 'text-blue-400';
    if (score > -50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return { color: 'bg-emerald-500/20 text-emerald-300', label: 'Excellent' };
    if (score >= 60) return { color: 'bg-blue-500/20 text-blue-300', label: 'Good' };
    if (score >= 40) return { color: 'bg-amber-500/20 text-amber-300', label: 'Fair' };
    return { color: 'bg-red-500/20 text-red-300', label: 'Needs Work' };
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-indigo-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          Advanced Manuscript Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!analytics ? (
          <div className="text-center py-8">
            <Button
              onClick={analyzeManuscript}
              disabled={analyzing || manuscript.length === 0}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Manuscript...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Run Advanced Analytics
                </>
              )}
            </Button>
            <p className="text-xs text-white/40 mt-3">
              Deep analysis of sentiment, character arcs, and market performance
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Performance Prediction */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-medium text-white">Market Performance Prediction</h3>
                </div>
                <Badge className={`${getScoreBadge(analytics.performance_prediction.commercial_score).color} border-0`}>
                  {analytics.performance_prediction.commercial_score}/100
                </Badge>
              </div>
              
              <Progress value={analytics.performance_prediction.commercial_score} className="h-2 mb-3" />
              
              <p className="text-sm text-white/70 mb-4">{analytics.performance_prediction.market_fit}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs text-emerald-300 font-medium">Strengths</span>
                  {analytics.performance_prediction.strengths?.map((strength, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Award className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-white/60">{strength}</p>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <span className="text-xs text-amber-300 font-medium">Areas to Improve</span>
                  {analytics.performance_prediction.weaknesses?.map((weakness, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertCircle className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-white/60">{weakness}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="text-xs text-indigo-300 font-medium mb-2 block">Recommendations</span>
                <ul className="space-y-1">
                  {analytics.performance_prediction.recommendations?.map((rec, i) => (
                    <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                      <span className="text-indigo-400">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sentiment Analysis */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Emotional Arc by Chapter
              </h3>
              <div className="space-y-2">
                {analytics.sentiment_by_chapter?.map((chapter, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-lg bg-white/5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/70">Chapter {chapter.chapter}</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white/10 text-white/60 border-0 text-xs">
                          {chapter.tone}
                        </Badge>
                        <span className={`text-sm font-semibold ${getSentimentColor(chapter.score)}`}>
                          {chapter.score > 0 ? '+' : ''}{chapter.score}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {chapter.key_emotions?.map((emotion, ei) => (
                        <Badge key={ei} className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                          {emotion}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Character Arc Tracking */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Character Development Tracking
              </h3>
              <div className="space-y-3">
                {analytics.character_arcs?.map((arc, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-white">{arc.character}</span>
                      <Badge className={`${getScoreBadge(arc.development_score).color} border-0`}>
                        {arc.development_score}/100
                      </Badge>
                    </div>
                    
                    <Progress value={arc.development_score} className="h-2 mb-3" />
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/50">Consistency</span>
                        <span className="text-white/70">{arc.consistency}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/50">Growth Trajectory</span>
                        <span className="text-white/70">{arc.growth_trajectory}</span>
                      </div>
                    </div>

                    {arc.issues?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <span className="text-xs text-amber-300 font-medium mb-1 block">Issues Found</span>
                        {arc.issues.map((issue, ii) => (
                          <p key={ii} className="text-xs text-white/50 flex items-start gap-1 mb-1">
                            <AlertCircle className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                            {issue}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pacing & Structure */}
            <div className="p-4 rounded-lg bg-white/5">
              <h3 className="text-sm font-medium text-white mb-3">Pacing & Structure Analysis</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Act Structure Score</span>
                  <Badge className={`${getScoreBadge(analytics.pacing_structure.act_structure_score).color} border-0`}>
                    {analytics.pacing_structure.act_structure_score}/100
                  </Badge>
                </div>
                <div>
                  <span className="text-xs text-white/50 block mb-1">Tension Curve</span>
                  <p className="text-xs text-white/70">{analytics.pacing_structure.tension_curve}</p>
                </div>
                {analytics.pacing_structure.peak_chapters?.length > 0 && (
                  <div>
                    <span className="text-xs text-white/50 block mb-1">Peak Chapters</span>
                    <div className="flex flex-wrap gap-1">
                      {analytics.pacing_structure.peak_chapters.map((ch, i) => (
                        <Badge key={i} className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                          Chapter {ch}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-white/50 italic">{analytics.pacing_structure.notes}</p>
              </div>
            </div>

            <Button
              onClick={analyzeManuscript}
              variant="outline"
              size="sm"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              <TrendingUp className="w-3 h-3 mr-2" />
              Re-analyze
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}