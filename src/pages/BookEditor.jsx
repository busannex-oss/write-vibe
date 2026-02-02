import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  FileText, 
  Image, 
  Video,
  Globe,
  Users,
  Loader2,
  Check,
  Edit3,
  RefreshCw,
  Download,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

import TitleGenerator from "@/components/book/TitleGenerator.jsx";
import UnifiedOutlineGenerator from "@/components/book/UnifiedOutlineGenerator.jsx";
import SummaryGenerator from "@/components/book/SummaryGenerator.jsx";
import ManuscriptWriter from "@/components/book/ManuscriptWriter.jsx";
import ManuscriptFormatter from "@/components/book/ManuscriptFormatter.jsx";
import ManuscriptViewer from "@/components/book/ManuscriptViewer.jsx";
import CoverDesigner from "@/components/book/CoverDesigner.jsx";
import VideoCommercial from "@/components/book/VideoCommercial.jsx";
import WebsiteBuilder from "@/components/book/WebsiteBuilder.jsx";
import CharacterCreator from "@/components/book/CharacterCreator.jsx";
import MarketingCampaignGenerator from "@/components/book/MarketingCampaignGenerator.jsx";

export default function BookEditor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");

  const [activeTab, setActiveTab] = useState("title");

  const { data: book, isLoading } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => base44.entities.Book.filter({ id: bookId }),
    select: (data) => data[0],
    enabled: !!bookId
  });

  const updateBookMutation = useMutation({
    mutationFn: (data) => base44.entities.Book.update(bookId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
    }
  });

  const handleUpdate = async (data, showSuccess = true) => {
    await updateBookMutation.mutateAsync(data);
  };

  const stages = [
    { id: "title", label: "Title", icon: Edit3, status: book?.title && book.title !== "Untitled Book" ? "complete" : "pending" },
    { id: "characters", label: "Characters", icon: Users, status: book?.characters?.length > 0 ? "complete" : "pending" },
    { id: "toc", label: "Table of Contents", icon: FileText, status: book?.table_of_contents?.length > 0 ? "complete" : "pending" },
    { id: "detailed_outline", label: "Detailed Outline", icon: FileText, status: book?.detailed_outline?.length > 0 ? "complete" : "pending" },
    { id: "industry_outline", label: "Industry Outline", icon: FileText, status: book?.industry_outline?.length > 0 ? "complete" : "pending" },
    { id: "summary", label: "Summary", icon: BookOpen, status: book?.book_summary ? "complete" : "pending" },
    { id: "format", label: "Format", icon: RefreshCw, status: book?.formatted_manuscript ? "complete" : "pending" },
    { id: "viewer", label: "View & Export", icon: Download, status: book?.formatted_manuscript ? "complete" : "pending" },
    { id: "cover", label: "Cover", icon: Image, status: book?.front_cover_url ? "complete" : "pending" },
    { id: "manuscript", label: "Manuscript", icon: BookOpen, status: book?.manuscript_chapters?.length > 0 ? "complete" : "pending" },
    { id: "marketing", label: "Marketing", icon: Sparkles, status: "pending" },
    { id: "video", label: "Video", icon: Video, status: book?.video_commercial_url ? "complete" : "pending" },
    { id: "website", label: "Website", icon: Globe, status: book?.website_config?.status ? "complete" : "pending" }
  ];

  const completedCount = stages.filter(s => s.status === "complete").length;
  const progress = (completedCount / stages.length) * 100;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="p-6 lg:p-8 text-center">
        <h2 className="text-xl font-semibold text-white">Book not found</h2>
        <Button onClick={() => navigate(createPageUrl("Books"))} className="mt-4">
          Back to Books
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Books"))}
          className="text-white/50 hover:text-white hover:bg-white/10 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Books
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">{book.title || "Untitled Book"}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">{book.category || "No category"}</Badge>
              <span className="text-white/40 text-sm">{book.characters?.length || 0} characters</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/50">{completedCount}/{stages.length} complete</span>
            <Progress value={progress} className="w-32 h-2 bg-white/10" />
          </div>
        </div>
      </div>

      {/* Stage Navigation */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setActiveTab(stage.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                activeTab === stage.id
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500/50 text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              } border`}
            >
              <stage.icon className={`w-4 h-4 ${stage.status === 'complete' ? 'text-emerald-400' : ''}`} />
              <span className="font-medium">{stage.label}</span>
              {stage.status === 'complete' && <Check className="w-4 h-4 text-emerald-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "title" && (
          <TitleGenerator 
            book={book} 
            onUpdate={handleUpdate}
            isUpdating={updateBookMutation.isPending}
          />
        )}
        {activeTab === "characters" && (
          <CharacterCreator 
            book={book} 
            onUpdate={handleUpdate}
            isUpdating={updateBookMutation.isPending}
          />
        )}
        {activeTab === "toc" && (
          <TableOfContentsGenerator 
            book={book} 
            onUpdate={handleUpdate}
            isUpdating={updateBookMutation.isPending}
          />
        )}
        {activeTab === "detailed_outline" && (
          <DetailedOutlineGenerator 
            book={book} 
            onUpdate={handleUpdate}
            isUpdating={updateBookMutation.isPending}
          />
        )}
        {activeTab === "industry_outline" && (
          <IndustryOutlineGenerator 
            book={book} 
            onUpdate={handleUpdate}
            isUpdating={updateBookMutation.isPending}
          />
        )}
        {activeTab === "summary" && (
          <SummaryGenerator 
            book={book} 
            onUpdate={handleUpdate}
            isUpdating={updateBookMutation.isPending}
          />
        )}
        {activeTab === "format" && (
          <ManuscriptFormatter 
            book={book} 
            onUpdate={handleUpdate}
            isUpdating={updateBookMutation.isPending}
          />
        )}
        {activeTab === "viewer" && (
          <ManuscriptViewer 
            book={book} 
            onUpdate={handleUpdate}
            isUpdating={updateBookMutation.isPending}
          />
        )}
        {activeTab === "cover" && (
          <CoverDesigner 
            book={book} 
            onUpdate={handleUpdate}
            isUpdating={updateBookMutation.isPending}
          />
        )}
        {activeTab === "manuscript" && (
          <ManuscriptWriter 
            book={book} 
            onUpdate={handleUpdate}
            isUpdating={updateBookMutation.isPending}
          />
        )}
        {activeTab === "marketing" && (
          <MarketingCampaignGenerator 
            book={book}
          />
        )}
        {activeTab === "video" && (
          <VideoCommercial 
            book={book} 
            onUpdate={handleUpdate}
            isUpdating={updateBookMutation.isPending}
          />
        )}
        {activeTab === "website" && (
          <WebsiteBuilder 
            book={book} 
            onUpdate={handleUpdate}
            isUpdating={updateBookMutation.isPending}
          />
        )}
      </motion.div>
    </div>
  );
}