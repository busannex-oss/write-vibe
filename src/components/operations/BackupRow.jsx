import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Loader2, RotateCcw, Archive } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function BackupRow({ backup }) {
  const [open, setOpen] = useState(false);
  const [books, setBooks] = useState(null);
  const [restoring, setRestoring] = useState(null);

  const toggle = async () => {
    setOpen(!open);
    if (!books) {
      const res = await base44.functions.invoke("bookBackups", { action: "list", backup_id: backup.id });
      setBooks(res.data.books);
    }
  };

  const restore = async (book) => {
    if (!window.confirm(`Restore "${book.title}" to this backup? Current changes to this book will be replaced.`)) return;
    setRestoring(book.id);
    await base44.functions.invoke("bookBackups", { action: "restore", backup_id: backup.id, book_id: book.id });
    setRestoring(null);
    toast({ title: `"${book.title}" restored` });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900">
      <button onClick={toggle} className="w-full flex items-center gap-3 p-3 text-left">
        {open ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
        <Archive className="w-4 h-4 text-amber-400" />
        <span className="text-sm text-white font-medium flex-1">{new Date(backup.backed_up_at || backup.created_date).toLocaleString()}</span>
        <span className="text-xs text-white/40">{backup.book_count ?? 0} books</span>
      </button>
      {open && (
        <div className="border-t border-white/10 p-3 space-y-2">
          {!books ? <Loader2 className="w-4 h-4 text-amber-400 animate-spin" /> : books.length === 0 ? (
            <p className="text-xs text-white/40">No books in this backup.</p>
          ) : books.map((b) => (
            <div key={b.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{b.title || "Untitled"}</p>
                <p className="text-[11px] text-white/35">{b.status} · {b.chapters} chapters</p>
              </div>
              <Button size="sm" variant="outline" disabled={restoring === b.id} onClick={() => restore(b)}
                className="border-white/15 text-white/80 gap-1.5">
                {restoring === b.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                Restore
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}