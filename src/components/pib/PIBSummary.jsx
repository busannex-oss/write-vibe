import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Pencil, FileText, Calendar, Lock } from "lucide-react";

const POV_LABELS = {
  first_person: "First Person",
  third_person_limited: "Third Person Limited",
  third_person_omniscient: "Third Person Omniscient",
  second_person: "Second Person",
  mixed: "Mixed",
};

const EXP_LABELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  experienced: "Experienced",
  published: "Published Author",
};

function Field({ label, value }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div>
      <p className="text-xs text-white/40 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-white/90 whitespace-pre-wrap">{Array.isArray(value) ? value.join(", ") : value}</p>
    </div>
  );
}

export default function PIBSummary({ pib, onEdit }) {
  const completedDate = pib.completed_at
    ? new Date(pib.completed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Personal Intelligence Blueprint
            </CardTitle>
            <CardDescription className="text-white/50 mt-1">
              Your original voice and source of truth — the foundation for every book you create
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
              <Lock className="w-3 h-3 mr-1" />
              Source of Truth
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed
            </Badge>
            <Button onClick={onEdit} variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Refine Details
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <Lock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-white/70 leading-relaxed">
            This is your <span className="text-amber-300 font-medium">original voice</span> — the source of truth that guides all AI-assisted writing in Write Vibe. It does not change. Every book, chapter, and character you create will stay true to who you are as an author.
          </p>
        </div>
        {completedDate && (
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Calendar className="w-3.5 h-3.5" />
            Version {pib.version || 1} • Established {completedDate}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Pen Name" value={pib.pen_name} />
          <Field label="Writing Style" value={pib.writing_style} />
          <Field label="Author Voice" value={pib.author_voice} />
          <Field label="Preferred POV" value={POV_LABELS[pib.preferred_pov]} />
          <Field label="Content Rating" value={pib.content_rating} />
          <Field label="Experience Level" value={EXP_LABELS[pib.experience_level]} />
          <Field label="Genres" value={pib.genres} />
          <Field label="Core Themes" value={pib.core_themes} />
          <Field label="Target Audience" value={pib.target_audience} />
        </div>

        <Field label="Author Biography" value={pib.author_bio} />
        <Field label="Inspirations" value={pib.inspirations} />
        <Field label="Unique Perspective" value={pib.unique_perspective} />
        <Field label="Ideal Reader" value={pib.ideal_reader} />
        <Field label="Publishing Goals" value={pib.publishing_goals} />
        <Field label="Content Boundaries" value={pib.content_boundaries} />
      </CardContent>
    </Card>
  );
}