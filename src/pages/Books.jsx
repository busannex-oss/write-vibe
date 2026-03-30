import React, { useState, useEffect } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  BookOpen, 
  Filter,
  Grid,
  List,
  ArrowRight,
  CheckSquare,
  Square,
  SortAsc,
  Users as UsersIcon,
  User,
  Trash2
} from "lucide-react";
import { motion } from "framer-motion";

export default function Books() {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("-created_date");
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books', sortBy],
    queryFn: () => base44.entities.Book.list(sortBy)
  });

  const { data: allTeamMembers = [] } = useQuery({
    queryKey: ['all-team-members'],
    queryFn: () => base44.entities.TeamMember.list()
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (e) {
        // Not logged in
      }
    };
    loadUser();
  }, []);

  const getBookTeam = (bookId) => {
    return allTeamMembers.filter(tm => tm.book_id === bookId);
  };

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

  const toggleBookSelection = (bookId) => {
    setSelectedBooks(prev => 
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  const selectAll = () => {
    setSelectedBooks(filteredBooks.map(b => b.id));
  };

  const deselectAll = () => {
    setSelectedBooks([]);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedBooks.length} books?`)) return;
    for (const id of selectedBooks) {
      await base44.entities.Book.delete(id);
    }
    setSelectedBooks([]);
    setBulkEditMode(false);
  };

  const handleBulkStatusChange = async (newStatus) => {
    for (const id of selectedBooks) {
      await base44.entities.Book.update(id, { status: newStatus });
    }
    setSelectedBooks([]);
    setBulkEditMode(false);
  };

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

      {/* Filters & Actions */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or category..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 sm:w-40 bg-white/5 border-white/10 text-white">
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
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36 sm:w-40 bg-white/5 border-white/10 text-white">
              <SortAsc className="w-4 h-4 mr-2 text-white/50" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-created_date">Newest First</SelectItem>
              <SelectItem value="created_date">Oldest First</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="-title">Title Z-A</SelectItem>
              <SelectItem value="-updated_date">Recently Updated</SelectItem>
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
          <Button
            variant={bulkEditMode ? "default" : "outline"}
            onClick={() => {
              setBulkEditMode(!bulkEditMode);
              setSelectedBooks([]);
            }}
            className={bulkEditMode ? "bg-amber-500 hover:bg-amber-600 text-white border-0" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            {bulkEditMode ? "Done" : "Select"}
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {bulkEditMode && selectedBooks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between"
        >
          <span className="text-amber-300 font-medium">{selectedBooks.length} selected</span>
          <div className="flex flex-wrap gap-2">
            <Button onClick={selectAll} size="sm" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              Select All ({filteredBooks.length})
            </Button>
            <Button onClick={deselectAll} size="sm" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              Deselect All
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0">
                  Change Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkStatusChange("draft")}>Draft</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange("outline")}>Outline</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange("writing")}>Writing</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange("editing")}>Editing</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange("published")}>Published</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleBulkDelete} size="sm" variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </motion.div>
      )}

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
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all group overflow-hidden relative">
                {bulkEditMode && (
                  <div className="absolute top-3 left-3 z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleBookSelection(book.id);
                      }}
                      className="w-6 h-6 rounded bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-all"
                    >
                      {selectedBooks.includes(book.id) ? (
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Square className="w-4 h-4 text-white/50" />
                      )}
                    </button>
                  </div>
                )}
                <Link to={`/BookEditor?id=${book.id}`} className={bulkEditMode ? "pointer-events-none" : ""}>
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
                      <h3 className="font-semibold text-white line-clamp-2 mb-1">{book.title || "Untitled Book"}</h3>
                      <p className="text-sm text-white/60">{book.category || "No category"}</p>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-xs text-white/60">{book.created_by || currentUser?.email || "Unknown"}</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Badge className={`text-xs ${statusColors[book.status] || statusColors.draft}`}>
                          {book.status?.replace('_', ' ') || 'draft'}
                        </Badge>
                        <span className="text-xs font-medium text-white/70">{Math.round(getProgressPercentage(book.status))}%</span>
                      </div>
                      <Progress 
                        value={getProgressPercentage(book.status)} 
                        className="h-1.5 bg-white/10" 
                      />
                    </div>
                    {getBookTeam(book.id).length > 0 && (
                      <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                        <UsersIcon className="w-3.5 h-3.5 text-white/40" />
                        <span className="text-xs text-white/60">
                          {getBookTeam(book.id).length} team {getBookTeam(book.id).length === 1 ? 'member' : 'members'}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Link>
              </Card>
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
              <Link to={`/BookEditor?id=${book.id}`}>
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
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h3 className="font-semibold text-white truncate">{book.title || "Untitled Book"}</h3>
                        <p className="text-xs text-white/50">{book.category || "No category"}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <User className="w-3 h-3" />
                        <span>{book.created_by || currentUser?.email || "Unknown"}</span>
                        {getBookTeam(book.id).length > 0 && (
                          <>
                            <span className="text-white/30">•</span>
                            <UsersIcon className="w-3 h-3" />
                            <span>{getBookTeam(book.id).length} team</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <Progress 
                            value={getProgressPercentage(book.status)} 
                            className="h-1.5 flex-1 max-w-24 bg-white/10" 
                          />
                          <span className="text-xs text-white/50 w-10">{Math.round(getProgressPercentage(book.status))}%</span>
                        </div>
                        <Badge className={`text-xs ${statusColors[book.status] || statusColors.draft}`}>
                          {book.status?.replace('_', ' ') || 'draft'}
                        </Badge>
                      </div>
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