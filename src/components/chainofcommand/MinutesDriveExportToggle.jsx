import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FolderSync, Loader2, ExternalLink } from "lucide-react";

const KEY = "minutes_drive_export";

export default function MinutesDriveExportToggle() {
  const [setting, setSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    base44.entities.AppSetting.filter({ key: KEY }).then((r) => {
      setSetting(r[0] || null);
      setLoading(false);
    });
  }, []);

  const exportAll = async () => {
    setBusy(true);
    setMessage("");
    const res = await base44.functions.invoke("exportMinutesToDrive", { export_all: true });
    setMessage(res.data.error ? res.data.error : `Exported ${res.data.exported} meeting minutes to Google Drive.`);
    const [fresh] = await base44.entities.AppSetting.filter({ key: KEY });
    setSetting(fresh);
    setBusy(false);
  };

  const toggle = async (enabled) => {
    const saved = setting
      ? await base44.entities.AppSetting.update(setting.id, { enabled })
      : await base44.entities.AppSetting.create({ key: KEY, enabled });
    setSetting(saved);
    setMessage(enabled ? "On: new meeting minutes will be saved to Google Drive automatically." : "Off: automatic Drive export paused.");
  };

  if (loading) return null;
  const on = !!setting?.enabled;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FolderSync className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-white">Auto-export minutes to Google Drive</p>
            <p className="text-xs text-white/50">Saves each new book planning meeting's minutes as a Google Doc in the "Write Vibe Meeting Minutes" folder.</p>
          </div>
        </div>
        <Switch checked={on} onCheckedChange={toggle} />
      </div>
      {on && (
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" onClick={exportAll} disabled={busy} className="bg-amber-500 text-black hover:bg-amber-400">
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FolderSync className="w-4 h-4 mr-2" />}
            Export all existing minutes now
          </Button>
          {setting?.folder_id && (
            <a href={`https://drive.google.com/drive/folders/${setting.folder_id}`} target="_blank" rel="noreferrer" className="text-xs text-amber-400 inline-flex items-center gap-1">
              Open folder <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
      {message && <p className="text-xs text-white/60">{message}</p>}
    </div>
  );
}