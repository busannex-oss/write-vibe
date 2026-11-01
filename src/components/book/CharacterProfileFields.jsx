import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const FIELDS = [
  { key: "occupation", label: "Occupation / Job", placeholder: "e.g. trauma surgeon, detective, barista..." },
  { key: "hobbies", label: "Hobbies", placeholder: "e.g. rock climbing, painting, chess..." },
  { key: "education", label: "Education", placeholder: "Schools, degrees, self-taught knowledge..." },
  { key: "skills", label: "Skills", placeholder: "What they're good at..." },
  { key: "special_training", label: "Special Training", placeholder: "Military, martial arts, magic, medical, etc..." },
];

export default function CharacterProfileFields({ char, onChange }) {
  return (
    <>
      {FIELDS.map((f) => (
        <div key={f.key}>
          <Label className="text-white/70">{f.label}</Label>
          <Textarea
            value={char[f.key] || ""}
            onChange={(e) => onChange(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
            rows={2}
          />
        </div>
      ))}
      <div>
        <Label className="text-white/70">Sexual Orientation</Label>
        <Input
          value={char.sexual_orientation || ""}
          onChange={(e) => onChange("sexual_orientation", e.target.value)}
          placeholder="e.g. heterosexual, gay, bisexual, asexual..."
          className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
        />
      </div>
    </>
  );
}