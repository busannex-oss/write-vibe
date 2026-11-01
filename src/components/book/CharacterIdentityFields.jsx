import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const inputCls = "bg-white/5 border-white/20 text-white placeholder:text-white/30";

export default function CharacterIdentityFields({ char, genderOptions, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-white/70">Character Name</Label>
        <Input value={char.name || ""} onChange={(e) => onChange("name", e.target.value)} placeholder="Character name" className={inputCls} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-white/70">Age</Label>
          <Input value={char.age || ""} onChange={(e) => onChange("age", e.target.value)} placeholder="e.g., 28" className={inputCls} />
        </div>
        <div>
          <Label className="text-white/70">Gender</Label>
          <Select value={char.gender || undefined} onValueChange={(v) => onChange("gender", v)}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {genderOptions.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-white/70">Role</Label>
          <Input value={char.role || ""} onChange={(e) => onChange("role", e.target.value)} placeholder="Protagonist" className={inputCls} />
        </div>
      </div>
    </div>
  );
}