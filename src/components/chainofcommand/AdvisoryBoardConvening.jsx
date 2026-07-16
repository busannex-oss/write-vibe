import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, AlertTriangle, GitBranch, CheckCircle2, Loader2,
  Gavel, ChevronDown, ChevronUp, Crown, Zap
} from "lucide-react";
import { PRIORITY_STYLES } from "@/components/chainofcommand/advisoryConstants";
import { cn } from "@/lib/utils";

export default function AdvisoryBoardConvening({ agents, brandColors }) {
  const [convening, setConvening] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [expandedDept, setExpandedDept] = useState(null);

  const handleConvene = async () => {
    setConvening(true);
    setError(null);
    setResults(null);
    try {
      const departments = Object.entries(agents)
        .filter(([key]) => key !== "level7")
        .map(([, level]) => ({
          name: level.name,
          agents: level.agents.map(a => ({ name: a.name, title: a.title, role: a.role })),
        }));

      const advisors = (agents.level7?.agents || []).map(a => ({
        name: a.name,
        expertise_tags: a.expertise_tags || [],
      }));

      const response = await base44.functions.invoke("conveneAdvisoryBoard", {
        departments,
        advisors,
      });

      setResults(response.data);
    } catch (err) {
      setError(err.message || "Failed to convene advisory board");
    } finally {
      setConvening(false);
    }
  };

  const text = brandColors.text;
  const secondary = brandColors.secondary;
  const accent = brandColors.accent;

  return (
    <Card style={{ backgroundColor: secondary + "60", borderColor: accent + "40" }}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent + "20" }}>
              <Gavel className="w-5 h-5" style={{ color: accent }} />
            </div>
            <div>
              <CardTitle style={{ color: text }}>Advisory Board Convening</CardTitle>
              <p className="text-sm mt-1" style={{ color: text + "80" }}>
                Department evaluation · Director assignments · Bottleneck analysis
              </p>
            </div>
          </div>
          <Button onClick={handleConvene} disabled={convening} className="gap-2" style={{ backgroundColor: accent }}>
            {convening ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Convening...</>
            ) : (
              <><Gavel className="w-4 h-4" /> Convene Advisory Board</>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {convening && !results && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: accent }} />
            <p style={{ color: text + "80" }}>The Advisory Board is convening to evaluate department structure...</p>
          </div>
        )}

        {results && (
          <div className="space-y-6">
            {/* Meeting Summary */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: secondary + "80", borderLeft: `3px solid ${accent}` }}>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: accent }}>Executive Summary</p>
              <p className="text-sm leading-relaxed" style={{ color: text }}>{results.meeting_summary}</p>
            </div>

            {/* Department Evaluations */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: text + "80" }}>
                Department Evaluations & Director Assignments
              </h3>
              <div className="space-y-3">
                {results.departments?.map((dept, idx) => {
                  const priority = PRIORITY_STYLES[dept.priority] || PRIORITY_STYLES.medium;
                  const isExpanded = expandedDept === idx;
                  return (
                    <div key={idx} className="rounded-lg overflow-hidden" style={{ backgroundColor: secondary + "80", border: `1px solid ${accent}30` }}>
                      <button
                        onClick={() => setExpandedDept(isExpanded ? null : idx)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-1 min-w-0 text-left">
                            <p className="font-semibold truncate" style={{ color: text }}>{dept.department_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Crown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
                              <span className="text-sm truncate" style={{ color: text + "80" }}>Director: {dept.assigned_director}</span>
                            </div>
                          </div>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full border flex-shrink-0", priority.badge)}>
                            {priority.label}
                          </span>
                        </div>
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: text + "60" }} />
                          : <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: text + "60" }} />}
                      </button>
                      {isExpanded && (
                        <div className="p-4 pt-4 space-y-4 border-t" style={{ borderColor: accent + "20" }}>
                          <div>
                            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: accent }}>Director Rationale</p>
                            <p className="text-sm" style={{ color: text + "CC" }}>{dept.director_rationale}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "#fca5a5" }}>
                              <AlertTriangle className="w-3.5 h-3.5" /> Bottlenecks
                            </p>
                            <ul className="space-y-1">
                              {dept.bottlenecks?.map((b, i) => (
                                <li key={i} className="text-sm flex items-start gap-2" style={{ color: text + "CC" }}>
                                  <span className="mt-1.5 w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />{b}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "#fcd34d" }}>
                              <Zap className="w-3.5 h-3.5" /> Friction Points
                            </p>
                            <ul className="space-y-1">
                              {dept.friction_points?.map((f, i) => (
                                <li key={i} className="text-sm flex items-start gap-2" style={{ color: text + "CC" }}>
                                  <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />{f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "#86efac" }}>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Recommended Refinements
                            </p>
                            <ul className="space-y-1">
                              {dept.refinements?.map((r, i) => (
                                <li key={i} className="text-sm flex items-start gap-2" style={{ color: text + "CC" }}>
                                  <span className="mt-1.5 w-1 h-1 rounded-full bg-green-400 flex-shrink-0" />{r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Advisor Contributions */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: text + "80" }}>
                Advisor Contributions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.advisor_contributions?.map((advisor, idx) => (
                  <div key={idx} className="p-4 rounded-lg" style={{ backgroundColor: secondary + "80", border: `1px solid ${accent}20` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 flex-shrink-0" style={{ color: accent }} />
                      <p className="font-semibold text-sm" style={{ color: text }}>{advisor.advisor_name}</p>
                    </div>
                    <p className="text-sm mb-3" style={{ color: text + "CC" }}>{advisor.assessment}</p>
                    {advisor.recommendations?.length > 0 && (
                      <div className="space-y-1">
                        {advisor.recommendations.map((rec, i) => (
                          <div key={i} className="text-sm flex items-start gap-2" style={{ color: text + "AA" }}>
                            <GitBranch className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: accent + "80" }} />
                            {rec}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Assessment */}
            {results.overall_assessment && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: accent + "10", border: `1px solid ${accent}30` }}>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: accent }}>Overall Assessment</p>
                <p className="text-sm leading-relaxed" style={{ color: text }}>{results.overall_assessment}</p>
              </div>
            )}
          </div>
        )}

        {!results && !convening && !error && (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: text + "60" }}>
              Click "Convene Advisory Board" to initiate a department structure evaluation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}