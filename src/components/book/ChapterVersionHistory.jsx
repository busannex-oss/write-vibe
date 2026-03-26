import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Clock, RotateCcw, Trash2, Eye, Save, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";

export default function ChapterVersionHistory({ chapterNumber, chapterTitle, currentContent, onSaveVersion, versions = [], onRestore }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingVersion, setViewingVersion] = useState(null);
  const [saveNote, setSaveNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveCurrentVersion = async () => {
    if (!currentContent) return;
    
    setIsSaving(true);
    await onSaveVersion({
      chapter_number: chapterNumber,
      chapter_title: chapterTitle,
      content: currentContent,
      word_count: currentContent.split(/\s+/).length,
      saved_at: new Date().toISOString(),
      note: saveNote || `Manual save - ${new Date().toLocaleDateString()}`
    });
    setSaveNote("");
    setIsSaving(false);
  };

  const handleRestoreVersion = (version) => {
    if (onRestore) {
      onRestore(version);
      setIsDialogOpen(false);
      setViewingVersion(null);
    }
  };

  const sortedVersions = [...versions].sort((a, b) => 
    new Date(b.saved_at) - new Date(a.saved_at)
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 text-white hover:bg-white/10 gap-2"
        >
          <History className="w-4 h-4" />
          Version History
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg">Chapter {chapterNumber}: {chapterTitle}</div>
              <div className="text-sm text-white/40 font-normal">
                {sortedVersions.length} saved version{sortedVersions.length !== 1 ? 's' : ''}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mt-4">
          {/* Left Column - Save Current & Version List */}
          <div className="col-span-1 space-y-4">
            {/* Save Current Version */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Save className="w-4 h-4 text-amber-400" />
                  Save Current Version
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={saveNote}
                  onChange={(e) => setSaveNote(e.target.value)}
                  placeholder="Add a note (optional)..."
                  className="bg-slate-800 border-white/10 text-white text-sm min-h-[80px]"
                />
                <Button
                  onClick={handleSaveCurrentVersion}
                  disabled={!currentContent || isSaving}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {isSaving ? (
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Version
                </Button>
              </CardContent>
            </Card>

            {/* Version List */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {sortedVersions.length === 0 ? (
                  <div className="text-center py-8 text-white/40">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No saved versions yet</p>
                    <p className="text-xs mt-1">Save your work to create versions</p>
                  </div>
                ) : (
                  sortedVersions.map((version, index) => (
                    <motion.div
                      key={version.saved_at}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        viewingVersion?.saved_at === version.saved_at
                          ? "bg-amber-500/20 border-amber-500/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                      onClick={() => setViewingVersion(version)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                          v{sortedVersions.length - index}
                        </Badge>
                        <span className="text-xs text-white/40">
                          {formatDistanceToNow(new Date(version.saved_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-white mb-1">
                        {version.note || "Untitled version"}
                      </div>
                      <div className="text-xs text-white/40">
                        {version.word_count?.toLocaleString()} words
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Column - Preview & Actions */}
          <div className="col-span-2">
            <Card className="bg-white/5 border-white/10 h-full">
              <CardHeader className="pb-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-400" />
                    {viewingVersion ? "Preview Version" : "Select a version to preview"}
                  </CardTitle>
                  {viewingVersion && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRestoreVersion(viewingVersion)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        size="sm"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restore This Version
                      </Button>
                      <Button
                        onClick={() => setViewingVersion(null)}
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {viewingVersion ? (
                  <ScrollArea className="h-[450px]">
                    <div className="p-4 space-y-4">
                      <div className="flex items-center gap-4 text-sm text-white/40 pb-3 border-b border-white/10">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(viewingVersion.saved_at).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Save className="w-3 h-3" />
                          {viewingVersion.word_count?.toLocaleString()} words
                        </span>
                      </div>
                      {viewingVersion.note && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <p className="text-sm text-amber-300">{viewingVersion.note}</p>
                        </div>
                      )}
                      <div className="prose prose-invert max-w-none">
                        <Textarea
                          value={viewingVersion.content}
                          readOnly
                          className="bg-transparent border-0 text-white/80 font-mono text-sm min-h-[300px] resize-none"
                          rows={20}
                        />
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-[450px] text-white/40">
                    <div className="text-center">
                      <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Select a version from the list to preview</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}