import React from "react";
import { Input } from "@/components/ui/input";
import { Facebook, Instagram, Linkedin, Twitter, Globe, Music2 } from "lucide-react";

export const SOCIAL_FIELDS = [
  { key: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/yourname" },
  { key: "facebook", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/yourpage" },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/in/yourname" },
  { key: "x", label: "X / Twitter", icon: Twitter, placeholder: "https://x.com/yourname" },
  { key: "tiktok", label: "TikTok", icon: Music2, placeholder: "https://tiktok.com/@yourname" },
  { key: "website", label: "Website", icon: Globe, placeholder: "https://yourwebsite.com" },
];

export default function SocialProfilesStep({ value, onChange }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
      {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
        <label key={key} className="space-y-1.5">
          <span className="flex items-center gap-2 text-sm text-white/70"><Icon className="w-4 h-4" />{label}</span>
          <Input placeholder={placeholder} value={value[key] || ""} onChange={(e) => onChange({ ...value, [key]: e.target.value })} />
        </label>
      ))}
      <p className="sm:col-span-2 text-xs text-white/40">Optional. Your marketing team uses these for campaigns and your book website.</p>
    </div>
  );
}