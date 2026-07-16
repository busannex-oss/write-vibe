import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ChevronDown, ChevronUp, Loader2, Calendar, Users, ClipboardList } from "lucide-react";

export default function MeetingMinutesArchive({ brandColors, refreshKey }) {
  const [minutes, setMinutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const text = brandColors.text;
  const secondary = brandColors.secondary;
  const accent = brandColors.accent;

  useEffect(() => {
    const fetchMinutes = async () => {
      setLoading(true);
      try {
        const records = await base44.entities.AdvisoryBoardMinutes.list("-meeting_date", 50);
        setMinutes(records);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMinutes();
  }, [refreshKey]);

  if (loading) {
    return (
      <Card style={{ backgroundColor: secondary + "60", borderColor: accent + "40" }}>
        <CardContent className="py-6 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: accent }} />
          <span style={{ color: text + "80" }}>Loading meeting minutes...</span>
        </CardContent>
      </Card>
    );
  }

  if (minutes.length === 0) {
    return null;
  }

  return (
    <Card style={{ backgroundColor: secondary + "60", borderColor: accent + "40" }}>
      <style>{`
        .minutes-content h1 { font-size: 1.1rem; font-weight: bold; margin-bottom: 0.75rem; }
        .minutes-content h2 { font-size: 0.95rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; color: ${accent}; }
        .minutes-content h3 { font-size: 0.85rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.25rem; }
        .minutes-content h4 { font-size: 0.8rem; font-weight: 500; margin-top: 0.75rem; margin-bottom: 0.25rem; color: ${text + "AA" }; }
        .minutes-content p { font-size: 0.85rem; line-height: 1.6; margin-bottom: 0.5rem; color: ${text + "CC" }; }
        .minutes-content ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.5rem; }
        .minutes-content li { font-size: 0.85rem; line-height: 1.6; margin-bottom: 0.15rem; color: ${text + "CC" }; }
        .minutes-content .meeting-meta { margin-bottom: 1rem; padding: 0.75rem; border-radius: 0.5rem; background: ${secondary}; border-left: 3px solid ${accent}; }
        .minutes-content .meeting-meta p { margin-bottom: 0.15rem; }
      `}</style>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent + "20" }}>
            <FileText className="w-5 h-5" style={{ color: accent }} />
          </div>
          <div>
            <CardTitle style={{ color: text }}>Meeting Minutes Archive</CardTitle>
            <p className="text-sm mt-1" style={{ color: text + "80" }}>
              Comprehensive records of all Advisory Board convenings
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {minutes.map((m) => {
            const isExpanded = expandedId === m.id;
            return (
              <div key={m.id} className="rounded-lg overflow-hidden" style={{ backgroundColor: secondary + "80", border: `1px solid ${accent}20` }}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : m.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold truncate" style={{ color: text }}>{m.meeting_title}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs flex-wrap" style={{ color: text + "60" }}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {m.meeting_date ? new Date(m.meeting_date).toLocaleDateString() : "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {(m.attendees || []).length} attendees
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardList className="w-3 h-3" />
                        {m.recommendations_total || 0} recommendations
                      </span>
                    </div>
                  </div>
                  {isExpanded
                    ? <ChevronUp className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: text + "60" }} />
                    : <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: text + "60" }} />}
                </button>
                {isExpanded && m.minutes_html && (
                  <div className="p-4 pt-4 border-t" style={{ borderColor: accent + "20" }}>
                    <div
                      className="minutes-content"
                      style={{ color: text }}
                      dangerouslySetInnerHTML={{ __html: m.minutes_html }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}