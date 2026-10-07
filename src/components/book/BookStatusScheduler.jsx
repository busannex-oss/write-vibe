import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarClock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["draft", "outline", "writing", "editing", "cover_design", "marketing", "published"];
const label = (s) => s.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase());

export default function BookStatusScheduler({ book, onUpdate, isUpdating }) {
  const [status, setStatus] = useState("published");
  const [when, setWhen] = useState("");
  const pending = book.scheduled_status && book.scheduled_status_at;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
      <div className="flex items-center gap-2 text-white font-semibold">
        <CalendarClock className="w-5 h-5 text-amber-400" /> Schedule a status change
      </div>
      {pending ? (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <span>Will change to <b>{label(book.scheduled_status)}</b> on {format(new Date(book.scheduled_status_at), "PPP p")}</span>
          <Button size="sm" variant="ghost" disabled={isUpdating}
            onClick={() => onUpdate({ scheduled_status: null, scheduled_status_at: null })}>
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="sm:w-60" />
          <Button disabled={!when || isUpdating}
            onClick={() => onUpdate({ scheduled_status: status, scheduled_status_at: new Date(when).toISOString() })}>
            Schedule
          </Button>
        </div>
      )}
    </div>
  );
}