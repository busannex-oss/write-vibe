import React, { useState } from "react";
import { Check, X, Pencil, Save } from "lucide-react";

const STATUS_CONFIG = {
  pending:  { color: null,      decoration: "none",          badge: null },
  accepted: { color: "#86efac", decoration: "none",          badge: "ACCEPTED" },
  rejected: { color: "#fca5a5", decoration: "line-through",  badge: "REJECTED" },
  refined:  { color: "#93c5fd", decoration: "none",          badge: "REFINED" },
};

export default function RecommendationRow({
  text, status, onStatusChange, onTextChange,
  accent, textColor, bulletColor, icon: Icon
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  const handleSave = () => {
    onTextChange(editText.trim() || text);
    onStatusChange("refined");
    setEditing(false);
  };

  return (
    <div className="flex items-start gap-2 group">
      {Icon ? (
        <Icon className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: accent + "80" }} />
      ) : (
        <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: bulletColor }} />
      )}

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full text-sm p-2 rounded resize-none bg-black/20 outline-none"
              style={{ color: textColor, border: `1px solid ${accent}40` }}
              rows={2}
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleSave} className="text-xs px-2 py-1 rounded flex items-center gap-1" style={{ backgroundColor: accent + "30", color: accent }}>
                <Save className="w-3 h-3" /> Save
              </button>
              <button onClick={() => { setEditText(text); setEditing(false); }} className="text-xs px-2 py-1 rounded" style={{ color: textColor + "80" }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm leading-relaxed" style={{
              color: cfg.color || textColor,
              textDecoration: cfg.decoration,
            }}>
              {text}
            </span>
            {cfg.badge && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{
                backgroundColor: (cfg.color || accent) + "20",
                color: cfg.color || accent,
              }}>
                {cfg.badge}
              </span>
            )}
          </div>
        )}
      </div>

      {!editing && (
        <div className="flex gap-0.5 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onStatusChange(status === "accepted" ? "pending" : "accepted")}
            title="Accept"
            className="p-1 rounded hover:bg-green-500/20 transition-colors"
            style={{ color: status === "accepted" ? "#86efac" : textColor + "60" }}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onStatusChange(status === "rejected" ? "pending" : "rejected")}
            title="Reject"
            className="p-1 rounded hover:bg-red-500/20 transition-colors"
            style={{ color: status === "rejected" ? "#fca5a5" : textColor + "60" }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setEditText(text); setEditing(true); }}
            title="Refine"
            className="p-1 rounded hover:bg-blue-500/20 transition-colors"
            style={{ color: status === "refined" ? "#93c5fd" : textColor + "60" }}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}