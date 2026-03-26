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
  Volume2,
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
import { useErrorLogger } from "@/components/useErrorLogger";

import TitleGenerator from "@/components/book/TitleGenerator.jsx";
import UnifiedOutlineGenerator from "@/components/book/UnifiedOutlineGenerator.jsx";
import SummaryGenerator from "@/components/book/SummaryGenerator.jsx";
import ManuscriptWriter from "@/components/book/ManuscriptWriter.jsx";
import ManuscriptFormatter from "@/components/book/ManuscriptFormatter.jsx";
import ManuscriptViewer from "@/components/book/ManuscriptViewer.jsx";
import CoverDesigner from "@/components/book/CoverDesigner.jsx";
import VideoCommercial from "@/components/book/VideoCommercial.jsx";
import AudiobookGenerator from "@/components/book/AudiobookGenerator.jsx";
import WebsiteBuilder from "@/components/book/WebsiteBuilder.jsx";
import EnhancedCharacterCreator from "@/components/book/EnhancedCharacterCreator.jsx";
import MarketingCampaignGenerator from "@/components/book/MarketingCampaignGenerator.jsx";
import CollaborationPanel from "@/components/book/CollaborationPanel.jsx";

export default function BookEditor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");

  const [activeTab, setActiveTab] = useState("title");

  const { data: book, isLoading, error } = useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      if (!bookId) return null;
      try {
        console.log('Fetching book with ID:', bookId);
        const bookData = await base44.entities.Book.get(bookId);
        console.log('Book data received:', bookData);
        return bookData;
      } catch (err) {
        console.error('Error fetching book:', err);
        return null;
      }
    },
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

  // Production stages - must complete sequentially
  const productionStages = [
    { id: "title", label: "Title", icon: Edit3, status: book?.title && book.title !== "Untitled Book" ? "complete" : "pending" },
    { id: "characters", label: "Characters", icon: Users, status: book?.characters?.length > 0 ? "complete" : "pending" },
    { id: "outline", label: "Outline", icon: FileText, status: book?.table_of_contents?.length > 0 ? "complete" : "pending" },
    { id: "manuscript", label: "Manuscript", icon: BookOpen, status: book?.manuscript_chapters?.length > 0 ? "complete" : "pending" },
    { id: "cover", label: "Cover", icon: Image, status: book?.front_cover_url ? "complete" : "pending" },
    { id: "video", label: "Video", icon: Video, status: book?.video_commercial_url ? "complete" : "pending" },
  ];

  // Refinement stages - available after production complete
  const refinementStages = [
    { id: "format", label: "Format", icon: RefreshCw, status: book?.formatted_manuscript ? "complete" : "pending" },
    { id: "audiobook", label: "Audiobook", icon: Volume2, status: book?.audiobook_url ? "complete" : "pending" },
    { id: "viewer", label: "View & Export", icon: Download, status: book?.formatted_manuscript ? "complete" : "pending" },
    { id: "website", label: "Website", icon: Globe, status: book?.website_config?.status ? "complete" : "pending" },
    { id: "team", label: "Team", icon: Users, status: "available" },
  ];

  const isProductionComplete = productionStages.every(s => s.status === "complete");
  const completedCount = [...productionStages, ...refinementStages].filter(s => s.status === "complete").length;
  const totalCount = productionStages.length + refinementStages.length;
  const progress = (completedCount / totalCount) * 100;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  // Check if book is null, undefined, or empty object (no id means no data loaded)
  if ((!book || !book.id) && !isLoading) {
    React.useEffect(() => {
      base44.entities.ErrorLog.create({
        error_type: "not_found_404",
        message: `Book not found or empty: ${bookId}`,
        page: window.location.pathname + window.location.search,
        component: "BookEditor",
        severity: "medium",
        status_code: 404
      }).catch(() => {});
    }, []);
    useErrorLogger(null);
    return (
      <div className="p-6 lg:p-8 text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Book not found</h2>
        <p className="text-white/50 mb-4">This book may have been deleted or you don't have access to it.</p>
        <Button 
          onClick={() => navigate(createPageUrl("Books"))} 
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
        >
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
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-white/20 text-white/70 hover:text-white hover:bg-white/10" onClick={() => navigate(`/BookWebsite?id=${bookId}`)}>
                <ExternalLink className="w-4 h-4 mr-1" /> View Website
              </Button>
            <span className="text-sm text-white/50">{completedCount}/{totalCount} complete</span>
            <Progress value={progress} className="w-32 h-2 bg-white/10" />
          </div>
        </div>
      </div>

      {/* Stage Navigation */}
      <div className="mb-6 space-y-4">
        {/* Production */}
        <div>
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Production</h3>
          <div className="flex gap-2 overflow-x-auto">
            {productionStages.map((stage, idx) => {
              const isAccessible = idx === 0 || productionStages.slice(0, idx).every(s => s.status === 'complete');
              return (
                <button
                  key={stage.id}
                  onClick={() => isAccessible && setActiveTab(stage.id)}
                  disabled={!isAccessible}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    !isAccessible 
                      ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed opacity-50'
                      : activeTab === stage.id
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  } border whitespace-nowrap`}
                >
                  <stage.icon className={`w-4 h-4 ${stage.status === 'complete' ? 'text-emerald-400' : ''}`} />
                  <span className="font-medium">{stage.label}</span>
                  {stage.status === 'complete' && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Refinement */}
        {isProductionComplete && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-3">Refinement</h3>
            <div className="flex gap-2 overflow-x-auto">
              {refinementStages.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => setActiveTab(stage.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    activeTab === stage.id
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  } border whitespace-nowrap`}
                >
                  <stage.icon className={`w-4 h-4 ${stage.status === 'complete' ? 'text-emerald-400' : ''}`} />
                  <span className="font-medium">{stage.label}</span>
                  {stage.status === 'complete' && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {!isProductionComplete && (
          <div className="text-sm text-white/40 italic">Complete all production stages to unlock refinement features</div>
        )}
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
          <EnhancedCharacterCreator 
            book={book} 
            onUpdate={handleUpdate}
            isUpdating={updateBookMutation.isPending}
          />
        )}
        {activeTab === "outline" && (
          <UnifiedOutlineGenerator 
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
        {activeTab === "cover" && (
          <CoverDesigner 
            book={book} 
            onUpdate={handleUpdate}
            isUpdating={updateBookMutation.isPending}
          />
        )}
        {activeTab === "video" && (
          <VideoCommercial 
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
        {activeTab === "audiobook" && (
          <AudiobookGenerator 
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
        {activeTab === "website" && (
          <WebsiteBuilder 
            book={book} 
            onUpdate={handleUpdate}
            isUpdating={updateBookMutation.isPending}
          />
        )}
        {activeTab === "team" && (
          <CollaborationPanel book={book} />
        )}
      </motion.div>
    </div>
  );
}