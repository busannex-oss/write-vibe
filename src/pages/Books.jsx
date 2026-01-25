import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  BookOpen, 
  Filter,
  Grid,
  List,
  ArrowRight,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Books() {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list('-created_date')
  });

  const statusColors = {
    draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    outline: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    writing: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    editing: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    cover_design: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    marketing: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    published: "bg-green-500/20 text-green-300 border-green-500/30"
  };

  const getProgressPercentage = (status) => {
    const stages = ["draft", "outline", "writing", "editing", "cover_design", "marketing", "published"];
    const index = stages.indexOf(status);
    return ((index + 1) / stages.length) * 100;
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || book.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">My Books</h1>
          <p className="text-white/50 mt-1">Manage all your book projects</p>
        </div>
        <Link to={createPageUrl("CreateBook")}>
          <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
            <Plus className="w-4 h-4 mr-2" />
            New Book
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
              <Filter className="w-4 h-4 mr-2 text-white/50" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="writing">Writing</SelectItem>
              <SelectItem value="editing">Editing</SelectItem>
              <SelectItem value="cover_design">Cover Design</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex bg-white/5 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-white/10 text-white" : "text-white/50"}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-white/10 text-white" : "text-white/50"}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Books Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredBooks.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {searchQuery || statusFilter !== "all" ? "No books found" : "No books yet"}
            </h3>
            <p className="text-white/50 mb-6">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Start your first book project"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link to={createPageUrl("CreateBook")}>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Book
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={createPageUrl(`BookEditor?id=${book.id}`)}>
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer group overflow-hidden">
                  <div className="aspect-[3/4] relative bg-gradient-to-br from-slate-700 to-slate-800">
                    {book.front_cover_url ? (
                      <img src={book.front_cover_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <Badge className={`text-xs mb-2 ${statusColors[book.status] || statusColors.draft}`}>
                        {book.status?.replace('_', ' ') || 'draft'}
                      </Badge>
                      <h3 className="font-semibold text-white line-clamp-2">{book.title || "Untitled Book"}</h3>
                      <p className="text-sm text-white/60 mt-1">{book.category || "No category"}</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <Progress 
                      value={getProgressPercentage(book.status)} 
                      className="h-1.5 bg-white/10" 
                    />
                    <div className="flex items-center justify-between mt-3 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(book.created_date), "MMM d, yyyy")}
                      </span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={createPageUrl(`BookEditor?id=${book.id}`)}>
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex-shrink-0 overflow-hidden">
                      {book.front_cover_url ? (
                        <img src={book.front_cover_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{book.title || "Untitled Book"}</h3>
                      <p className="text-sm text-white/50">{book.category || "No category"}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Progress 
                          value={getProgressPercentage(book.status)} 
                          className="h-1.5 flex-1 max-w-32 bg-white/10" 
                        />
                        <Badge className={`text-xs ${statusColors[book.status] || statusColors.draft}`}>
                          {book.status?.replace('_', ' ') || 'draft'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-white/40">
                      {format(new Date(book.created_date), "MMM d, yyyy")}
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/30" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}