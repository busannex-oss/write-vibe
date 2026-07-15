import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Loader2, ShieldCheck, Users, Briefcase, Sparkles } from "lucide-react";
import CertificateCard from "@/components/certifications/CertificateCard";

export default function Certifications() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Certification.list("-issue_date", 100);
      setCerts(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const issue = async () => {
    setIssuing(true);
    try {
      await base44.functions.invoke("issueCertifications", {});
      await load();
    } catch (e) {
      console.error(e);
      alert("Failed to issue certifications");
    }
    setIssuing(false);
  };

  const advisoryCount = certs.filter((c) => c.recipient_type === "advisory_board").length;
  const cSuiteCount = certs.filter((c) => c.recipient_type === "c_suite_agent").length;
  const activeCount = certs.filter((c) => c.status === "active").length;

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
              <Award className="w-7 h-7 text-amber-400" /> AI Consultant Certifications
            </h1>
            <p className="text-white/40 text-sm">
              CPD-accredited certifications issued to Advisory Board members and C-Suite Agents.
            </p>
          </div>
          <Button onClick={issue} disabled={issuing} className="bg-amber-500 hover:bg-amber-600 text-black">
            {issuing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {issuing ? "Issuing..." : "Issue Certifications"}
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Award} label="Total Certified" value={certs.length} />
          <StatCard icon={ShieldCheck} label="Active" value={activeCount} />
          <StatCard icon={Users} label="Advisory Board" value={advisoryCount} />
          <StatCard icon={Briefcase} label="C-Suite Agents" value={cSuiteCount} />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : certs.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-16 text-center">
              <Award className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No certifications issued yet</h3>
              <p className="text-white/50 mb-4">
                Click "Issue Certifications" to accredit all Advisory Board members and C-Suite Agents.
              </p>
              <Button onClick={issue} disabled={issuing} className="bg-amber-500 hover:bg-amber-600 text-black">
                <Sparkles className="w-4 h-4 mr-2" /> Issue Now
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {certs.map((c) => (
              <CertificateCard key={c.id} cert={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white leading-none">{value}</p>
          <p className="text-white/40 text-xs mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}