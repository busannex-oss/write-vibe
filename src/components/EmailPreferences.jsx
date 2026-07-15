import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  DollarSign,
  Sparkles,
  BarChart2,
  Megaphone,
  FileText,
  BookOpen,
  Mail,
} from "lucide-react";

const EMAIL_OPTIONS = [
  {
    id: "weekly_progress",
    label: "Weekly Writing Progress Report",
    description: "A summary of your writing activity, word counts, and chapter milestones each week.",
    icon: TrendingUp,
  },
  {
    id: "sales_royalties",
    label: "Book Sales & Royalties Report",
    description: "Monthly breakdown of sales, royalties, and revenue across all platforms.",
    icon: DollarSign,
  },
  {
    id: "marketing_updates",
    label: "Marketing Performance Updates",
    description: "Campaign results, audience growth, and engagement metrics for your books.",
    icon: Megaphone,
  },
  {
    id: "feature_announcements",
    label: "New Feature Announcements",
    description: "Be the first to know when we launch new tools and capabilities.",
    icon: Sparkles,
  },
  {
    id: "ai_tips",
    label: "AI Tips & Best Practices",
    description: "Practical guidance on getting the most out of the AI writing tools.",
    icon: BarChart2,
  },
  {
    id: "industry_news",
    label: "Industry News & Trends",
    description: "Curated publishing industry news, trends, and opportunities.",
    icon: FileText,
  },
  {
    id: "launch_reminders",
    label: "Book Launch Reminders",
    description: "Timely reminders and checklists leading up to your book releases.",
    icon: BookOpen,
  },
  {
    id: "advisory_reviews",
    label: "Advisory Board Review Summaries",
    description: "Digests of advisory board feedback and recommendations on your work.",
    icon: Mail,
  },
];

export default function EmailPreferences({ preferences = {}, onChange }) {
  return (
    <div className="space-y-3">
      {EMAIL_OPTIONS.map((opt) => {
        const enabled = !!preferences[opt.id];
        const Icon = opt.icon;
        return (
          <div
            key={opt.id}
            className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <Label className="text-white font-medium cursor-pointer">{opt.label}</Label>
                <p className="text-xs text-white/50 mt-0.5">{opt.description}</p>
              </div>
            </div>
            <Switch checked={enabled} onCheckedChange={(v) => onChange(opt.id, v)} />
          </div>
        );
      })}
    </div>
  );
}