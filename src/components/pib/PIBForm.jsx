import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Check } from "lucide-react";
import AIGenerateButton from "@/components/AIGenerateButton";

const EMPTY_PIB = {
  pen_name: "", author_bio: "", writing_style: "", author_voice: "",
  preferred_pov: "", content_rating: "", genres: [], core_themes: [],
  inspirations: "", unique_perspective: "", target_audience: "",
  ideal_reader: "", publishing_goals: "", experience_level: "", content_boundaries: "",
};

const parseArray = (val) => val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];

export default function PIBForm({ user, existingPIB, onSaved, onCancel }) {
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [form, setForm] = useState({
    ...EMPTY_PIB,
    ...existingPIB,
    genres: existingPIB?.genres || [],
    core_themes: existingPIB?.core_themes || [],
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        ...form,
        user_email: user.email,
        status: "completed",
        completed_at: new Date().toISOString(),
        version: (existingPIB?.version || 0) + 1,
      };
      if (existingPIB) {
        await base44.entities.PIBQuestionnaire.update(existingPIB.id, data);
      } else {
        await base44.entities.PIBQuestionnaire.create(data);
      }
      onSaved();
    } catch (err) {
      console.error("Error saving PIB:", err);
    }
    setSaving(false);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const prompt = `You are helping an author establish their Personal Intelligence Blueprint (PIB) for a book writing platform called Write Vibe.

CRITICAL PRINCIPLE: The PIB is the author's ORIGINAL VOICE and SOURCE OF TRUTH. It does not change. Your role is to clarify and enrich what the author has already expressed — never to replace, override, or fabricate their authentic voice. Stay true to who they are.

Author name: ${form.pen_name || user?.full_name || "Unknown"}
Current bio: ${form.author_bio || "None"}
Writing style: ${form.writing_style || "Unknown"}
Genres: ${(form.genres || []).join(", ") || "Unknown"}
Goals: ${form.publishing_goals || "Unknown"}
Experience: ${form.experience_level || "Unknown"}
Inspirations: ${form.inspirations || "Unknown"}

Based on the information above, enrich and clarify the author's PIB. Fill in or enhance ALL fields below with rich, specific content that authentically reflects who this author is. Preserve the author's original intent and voice — expand on what they've shared, don't replace it. Make the author bio compelling (2-3 paragraphs). Make writing style and voice descriptions vivid and specific. Suggest 3-5 core themes and 3-5 genres that fit. Make target audience and ideal reader descriptions detailed.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            author_bio: { type: "string" },
            writing_style: { type: "string" },
            author_voice: { type: "string" },
            unique_perspective: { type: "string" },
            target_audience: { type: "string" },
            ideal_reader: { type: "string" },
            inspirations: { type: "string" },
            publishing_goals: { type: "string" },
            content_boundaries: { type: "string" },
            genres: { type: "array", items: { type: "string" } },
            core_themes: { type: "array", items: { type: "string" } }
          }
        }
      });

      setForm(prev => ({
        ...prev,
        author_bio: response.author_bio || prev.author_bio,
        writing_style: response.writing_style || prev.writing_style,
        author_voice: response.author_voice || prev.author_voice,
        unique_perspective: response.unique_perspective || prev.unique_perspective,
        target_audience: response.target_audience || prev.target_audience,
        ideal_reader: response.ideal_reader || prev.ideal_reader,
        inspirations: response.inspirations || prev.inspirations,
        publishing_goals: response.publishing_goals || prev.publishing_goals,
        content_boundaries: response.content_boundaries || prev.content_boundaries,
        genres: response.genres?.length ? response.genres : prev.genres,
        core_themes: response.core_themes?.length ? response.core_themes : prev.core_themes,
      }));
    } catch (err) {
      console.error("Error regenerating PIB:", err);
    }
    setRegenerating(false);
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-white">
              {existingPIB ? "Refine Your Personal Intelligence Blueprint" : "Establish Your Personal Intelligence Blueprint"}
            </CardTitle>
            <CardDescription className="text-white/50 mt-1">
              Your original voice and source of truth — the foundation for every book you create. This does not change.
            </CardDescription>
          </div>
          <AIGenerateButton onClick={handleRegenerate} loading={regenerating} label="Regenerate with AI" size="sm" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">Author Identity</h3>
          <div>
            <Label className="text-white/70 mb-1.5 block">Pen Name / Author Name</Label>
            <Input value={form.pen_name} onChange={e => update("pen_name", e.target.value)} placeholder="Your pen name" className="bg-white/5 border-white/20 text-white placeholder:text-white/30" />
          </div>
          <div>
            <Label className="text-white/70 mb-1.5 block">Author Biography</Label>
            <Textarea value={form.author_bio} onChange={e => update("author_bio", e.target.value)} placeholder="Tell readers about yourself..." className="bg-white/5 border-white/20 text-white placeholder:text-white/30" rows={4} />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">Writing Voice & Style</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/70 mb-1.5 block">Writing Style</Label>
              <Input value={form.writing_style} onChange={e => update("writing_style", e.target.value)} placeholder="e.g., conversational, literary" className="bg-white/5 border-white/20 text-white placeholder:text-white/30" />
            </div>
            <div>
              <Label className="text-white/70 mb-1.5 block">Author Voice & Tone</Label>
              <Input value={form.author_voice} onChange={e => update("author_voice", e.target.value)} placeholder="e.g., warm, authoritative" className="bg-white/5 border-white/20 text-white placeholder:text-white/30" />
            </div>
            <div>
              <Label className="text-white/70 mb-1.5 block">Preferred Point of View</Label>
              <Select value={form.preferred_pov} onValueChange={v => update("preferred_pov", v)}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white"><SelectValue placeholder="Select POV" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="first_person">First Person</SelectItem>
                  <SelectItem value="third_person_limited">Third Person Limited</SelectItem>
                  <SelectItem value="third_person_omniscient">Third Person Omniscient</SelectItem>
                  <SelectItem value="second_person">Second Person</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70 mb-1.5 block">Content Rating</Label>
              <Select value={form.content_rating} onValueChange={v => update("content_rating", v)}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white"><SelectValue placeholder="Select rating" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="G">G — General</SelectItem>
                  <SelectItem value="PG">PG — Parental Guidance</SelectItem>
                  <SelectItem value="PG-13">PG-13 — Teens</SelectItem>
                  <SelectItem value="R">R — Restricted</SelectItem>
                  <SelectItem value="MA">MA — Mature</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">Creative Profile</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/70 mb-1.5 block">Preferred Genres (comma-separated)</Label>
              <Input value={(form.genres || []).join(", ")} onChange={e => update("genres", parseArray(e.target.value))} placeholder="Fiction, Fantasy, Romance" className="bg-white/5 border-white/20 text-white placeholder:text-white/30" />
            </div>
            <div>
              <Label className="text-white/70 mb-1.5 block">Core Themes (comma-separated)</Label>
              <Input value={(form.core_themes || []).join(", ")} onChange={e => update("core_themes", parseArray(e.target.value))} placeholder="Redemption, Coming of age" className="bg-white/5 border-white/20 text-white placeholder:text-white/30" />
            </div>
          </div>
          <div>
            <Label className="text-white/70 mb-1.5 block">Inspirations</Label>
            <Textarea value={form.inspirations} onChange={e => update("inspirations", e.target.value)} placeholder="Authors, books, or experiences that inspire you..." className="bg-white/5 border-white/20 text-white placeholder:text-white/30" rows={3} />
          </div>
          <div>
            <Label className="text-white/70 mb-1.5 block">Unique Perspective</Label>
            <Textarea value={form.unique_perspective} onChange={e => update("unique_perspective", e.target.value)} placeholder="What makes your voice unique..." className="bg-white/5 border-white/20 text-white placeholder:text-white/30" rows={3} />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">Audience & Market</h3>
          <div>
            <Label className="text-white/70 mb-1.5 block">Target Audience</Label>
            <Input value={form.target_audience} onChange={e => update("target_audience", e.target.value)} placeholder="e.g., Young adults, 18-35" className="bg-white/5 border-white/20 text-white placeholder:text-white/30" />
          </div>
          <div>
            <Label className="text-white/70 mb-1.5 block">Ideal Reader</Label>
            <Textarea value={form.ideal_reader} onChange={e => update("ideal_reader", e.target.value)} placeholder="Describe your ideal reader..." className="bg-white/5 border-white/20 text-white placeholder:text-white/30" rows={3} />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">Goals & Experience</h3>
          <div>
            <Label className="text-white/70 mb-1.5 block">Experience Level</Label>
            <Select value={form.experience_level} onValueChange={v => update("experience_level", v)}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white"><SelectValue placeholder="Select level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="experienced">Experienced</SelectItem>
                <SelectItem value="published">Published Author</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white/70 mb-1.5 block">Publishing Goals</Label>
            <Textarea value={form.publishing_goals} onChange={e => update("publishing_goals", e.target.value)} placeholder="What do you want to achieve..." className="bg-white/5 border-white/20 text-white placeholder:text-white/30" rows={3} />
          </div>
          <div>
            <Label className="text-white/70 mb-1.5 block">Content Boundaries (what to avoid)</Label>
            <Textarea value={form.content_boundaries} onChange={e => update("content_boundaries", e.target.value)} placeholder="Topics or content you want to avoid..." className="bg-white/5 border-white/20 text-white placeholder:text-white/30" rows={2} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Check className="w-4 h-4 mr-2" />Save PIB</>}
          </Button>
          {existingPIB && (
            <Button variant="outline" onClick={onCancel} className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}