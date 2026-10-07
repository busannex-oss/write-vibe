import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import BackupRow from "./BackupRow";

export default function BookBackupsSection() {
  const { data: backups = [], isLoading } = useQuery({
    queryKey: ["bookBackups"],
    queryFn: () => base44.entities.BookBackup.list("-created_date", 30)
  });

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-white">Daily Book Backups</h2>
      <p className="text-white/40 text-sm mt-1 mb-4">Open a backup to see its books, then restore any one to that saved draft.</p>
      {isLoading ? <Loader2 className="w-5 h-5 text-amber-400 animate-spin" /> : backups.length === 0 ? (
        <p className="text-sm text-white/40">No backups yet. The first one runs automatically tonight.</p>
      ) : (
        <div className="space-y-2">{backups.map((b) => <BackupRow key={b.id} backup={b} />)}</div>
      )}
    </section>
  );
}