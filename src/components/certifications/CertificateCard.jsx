import { Badge } from "@/components/ui/badge";
import { Award, ShieldCheck, Calendar, Hash } from "lucide-react";

export default function CertificateCard({ cert }) {
  const isAdvisory = cert.recipient_type === "advisory_board";

  return (
    <div className="relative rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 overflow-hidden card-hover">
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-500/50 rounded-tl-xl" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-500/50 rounded-br-xl" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">{cert.recipient_name}</h3>
            <p className="text-amber-400/80 text-xs font-medium tracking-wide">{cert.recipient_title}</p>
          </div>
        </div>
        <Badge className={isAdvisory ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : "bg-blue-500/20 text-blue-300 border-blue-500/30"}>
          {isAdvisory ? "Advisory Board" : "C-Suite Agent"}
        </Badge>
      </div>

      <div className="my-5 text-center">
        <p className="text-white/40 text-xs uppercase tracking-widest">Certified as</p>
        <p className="text-white font-semibold text-xl mt-1">{cert.certification_name}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 text-xs font-medium">CPD Accredited · {cert.cpd_points} CPD Points</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2 text-white/50">
          <Hash className="w-3 h-3 shrink-0" />
          <span className="text-white/70 font-mono truncate">{cert.certificate_number}</span>
        </div>
        <div className="flex items-center gap-2 text-white/50 justify-end">
          <Calendar className="w-3 h-3 shrink-0" />
          <span>Issued {cert.issue_date}</span>
        </div>
        <div className="flex items-center gap-2 text-white/50">
          <ShieldCheck className="w-3 h-3 shrink-0" />
          <span className="text-white/70 font-mono truncate">Verify: {cert.verification_code}</span>
        </div>
        <div className="flex items-center gap-2 text-white/50 justify-end">
          <Calendar className="w-3 h-3 shrink-0" />
          <span>Valid until {cert.expiry_date}</span>
        </div>
      </div>

      {cert.competency_areas?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/10">
          {cert.competency_areas.map((a, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/40">{a}</span>
          ))}
        </div>
      )}

      <p className="text-white/30 text-xs text-center mt-4">
        Issued by {cert.issuing_authority} · Accredited by {cert.accreditation_body}
      </p>
    </div>
  );
}