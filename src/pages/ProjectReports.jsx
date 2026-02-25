import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Users,
  BookOpen,
  Activity
} from "lucide-react";

export default function ProjectReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      if (userData?.role === 'admin') {
        loadReport();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateProjectReport');
      setReport(data);
    } catch (error) {
      console.error("Failed to load report:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-white/10 max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Admin Access Required</h2>
            <p className="text-white/60">This page is only accessible to administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Project Manager Dashboard</h1>
            <p className="text-white/60">AI-powered insights and quality assurance</p>
          </div>
          <Button
            onClick={loadReport}
            disabled={loading}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Report
              </>
            )}
          </Button>
        </div>

        {!report && !loading && (
          <Card className="bg-slate-800/50 border-white/10">
            <CardContent className="p-12 text-center">
              <Activity className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Generate Your First Report</h3>
              <p className="text-white/60 mb-6">Click the button above to generate a comprehensive project analysis</p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="text-center py-20">
            <RefreshCw className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
            <p className="text-white/60">Analyzing all projects and generating report...</p>
          </div>
        )}

        {report && (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge 
                className={report.status === 'healthy' 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}
              >
                {report.status === 'healthy' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    System Healthy
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Needs Attention
                  </>
                )}
              </Badge>
              <span className="text-sm text-white/40">
                Generated: {new Date(report.generated_at).toLocaleString()}
              </span>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-6">
                  <BookOpen className="w-8 h-8 text-amber-400 mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">
                    {report.summary.total_books}
                  </div>
                  <div className="text-sm text-white/60">Total Books</div>
                  <Progress value={report.summary.completion_rate} className="mt-3 h-2" />
                  <div className="text-xs text-white/40 mt-1">
                    {report.summary.completion_rate}% completed
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-6">
                  <TrendingUp className="w-8 h-8 text-emerald-400 mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">
                    {report.summary.in_progress_books}
                  </div>
                  <div className="text-sm text-white/60">In Progress</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-6">
                  <FileText className="w-8 h-8 text-blue-400 mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">
                    {report.summary.total_documents}
                  </div>
                  <div className="text-sm text-white/60">Documents</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-6">
                  <Users className="w-8 h-8 text-purple-400 mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">
                    {report.summary.total_team_members}
                  </div>
                  <div className="text-sm text-white/60">Team Members</div>
                </CardContent>
              </Card>
            </div>

            {/* Project Health */}
            <Card className="bg-slate-800/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  Project Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-2xl font-bold text-emerald-400 mb-1">
                      {report.project_health.projects_on_track}
                    </div>
                    <div className="text-white/60">Projects On Track</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-400 mb-1">
                      {report.project_health.projects_needing_attention}
                    </div>
                    <div className="text-white/60">Need Attention</div>
                  </div>
                </div>

                {report.project_health.at_risk_projects.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-white font-semibold mb-3">At-Risk Projects</h4>
                    <div className="space-y-2">
                      {report.project_health.at_risk_projects.slice(0, 5).map((project) => (
                        <div key={project.id} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-white font-medium">{project.title}</div>
                              <div className="text-sm text-white/60">{project.status}</div>
                            </div>
                            <Badge variant="outline" className="text-amber-400 border-amber-500/30">
                              {project.days_since_created} days
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quality Assurance */}
            <Card className="bg-slate-800/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  Quality Assurance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-2xl font-bold text-white mb-1">
                    {report.quality_assurance.total_issues}
                  </div>
                  <div className="text-white/60">Total Issues Found</div>
                </div>

                {report.quality_assurance.critical_issues.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      Critical Issues
                    </h4>
                    <div className="space-y-2">
                      {report.quality_assurance.critical_issues.map((issue) => (
                        <div key={issue.id} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                          <div className="text-white font-medium">{issue.title}</div>
                          <div className="text-sm text-red-300">{issue.issue}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {report.quality_assurance.quality_issues.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-white font-semibold mb-3">Quality Improvements</h4>
                    <div className="space-y-2">
                      {report.quality_assurance.quality_issues.slice(0, 5).map((issue, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <div className="text-white font-medium">{issue.title}</div>
                          <div className="text-sm text-amber-300">{issue.issue}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <Card className="bg-slate-800/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {report.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-white/70">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}