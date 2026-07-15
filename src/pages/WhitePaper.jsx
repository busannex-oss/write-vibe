import ConfidentialWhitePapers from "@/components/admin/ConfidentialWhitePapers";

export default function WhitePaper() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">White Paper</h1>
        <p className="text-white/50 mt-1">Confidential, AI-generated industry white papers (admin only)</p>
      </div>
      <ConfidentialWhitePapers />
    </div>
  );
}