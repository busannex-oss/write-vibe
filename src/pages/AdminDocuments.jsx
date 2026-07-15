import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, FileText } from "lucide-react";
import ConstitutionEditor from "@/components/admin/ConstitutionEditor";
import ConfidentialWhitePapers from "@/components/admin/ConfidentialWhitePapers";

export default function AdminDocuments() {
  const urlParams = new URLSearchParams(window.location.search);
  const [tab, setTab] = useState(urlParams.get("tab") || "constitution");

  const onTabChange = (value) => {
    setTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    window.history.replaceState({}, "", url);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Constitution & White Paper</h1>
        <p className="text-white/50 mt-1">Combined admin documentation (admin only)</p>
      </div>

      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger value="constitution" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <Scale className="w-4 h-4 mr-2" /> Constitution
          </TabsTrigger>
          <TabsTrigger value="white_paper" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <FileText className="w-4 h-4 mr-2" /> White Paper
          </TabsTrigger>
        </TabsList>
        <TabsContent value="constitution">
          <ConstitutionEditor />
        </TabsContent>
        <TabsContent value="white_paper">
          <ConfidentialWhitePapers />
        </TabsContent>
      </Tabs>
    </div>
  );
}