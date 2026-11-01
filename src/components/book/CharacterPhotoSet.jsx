import React, { useState } from "react";
import { ai } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, Lock, RefreshCw } from "lucide-react";
import { PHOTO_SET, buildCharacterImagePrompt } from "@/components/book/characterImageStyles";

// Headshot, full body, professional and casual photos — all the same locked identity.
export default function CharacterPhotoSet({ char, book, onPatch }) {
  const [busy, setBusy] = useState(null);
  const set = char.photo_set || {};

  const gen = (shot, ref) =>
    ai.GenerateImage({
      ...(ref ? { existing_image_urls: [ref] } : {}),
      prompt: buildCharacterImagePrompt(char, book, shot.prompt(char), !!ref),
    }).then((r) => r.url);

  const run = async (keys) => {
    if (!char.appearance && !char.description) return alert("Please add appearance or description first");
    setBusy(keys.length > 1 ? "all" : keys[0]);
    try {
      let identity = char.identity_image_url;
      const next = { ...set };
      if (!identity) {
        identity = await gen(PHOTO_SET[0], null); // headshot becomes the locked identity
        next.headshot = identity;
        keys = keys.filter((k) => k !== "headshot");
      }
      const shots = PHOTO_SET.filter((s) => keys.includes(s.key));
      const urls = await Promise.all(shots.map((s) => gen(s, identity)));
      shots.forEach((s, i) => (next[s.key] = urls[i]));
      onPatch({ identity_image_url: identity, photo_set: next, images: [...new Set([...Object.values(next), ...(char.images || [])])] });
    } catch (e) {
      alert("Failed to generate photos: " + e.message);
    }
    setBusy(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-white flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-amber-400" />Identity Photo Set</p>
        <Button size="sm" onClick={() => run(PHOTO_SET.map((s) => s.key))} disabled={!!busy} className="bg-amber-500 hover:bg-amber-600 text-slate-950 border-0">
          {busy === "all" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Camera className="w-3 h-3 mr-1" />}
          {busy === "all" ? "Generating…" : "Generate All 4"}
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {PHOTO_SET.map((s) => (
          <div key={s.key} className="space-y-1">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center group">
              {busy === s.key || (busy === "all") ? <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                : set[s.key] ? <img src={set[s.key]} alt={`${char.name} ${s.label}`} className="w-full h-full object-cover" />
                : <Camera className="w-5 h-5 text-white/20" />}
              {!busy && (
                <button onClick={() => run([s.key])} title={`Regenerate ${s.label}`} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <RefreshCw className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-center text-white/50">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/40">The locked identity photo is used as the reference for every shot, so the face and body stay the same. Add Occupation and Hobbies below for the professional and casual photos.</p>
    </div>
  );
}