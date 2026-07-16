import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  BookOpen, 
  FileText, 
  Video, 
  Globe,
  ArrowRight,
  Clock,
  TrendingUp,
  Users,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import MessageInboxWidget from "@/components/dashboard/MessageInboxWidget";
import TasksWidget from "@/components/dashboard/TasksWidget";

const STATUS_COLORS = {
  draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  outline: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  writing: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  editing: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  cover_design: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  marketing: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  published: "bg-green-500/20 text-green-300 border-green-500/30"
};

const STAGES = ["draft", "outline", "writing", "editing", "cover_design", "marketing", "published"];

const getProgressPercentage = (status) => {
  const index = STAGES.indexOf(status);
  return ((index + 1) / STAGES.length) * 100;
};

export default function Dashboard() {
  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list('-created_date', 10),
    staleTime: 30000
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    staleTime: 60000
  });

  const stats = useMemo(() => [
    { 
      label: "Total Books", 
      value: books.length, 
      icon: BookOpen, 
      color: "from-blue-500 to-cyan-500" 
    },
    { 
      label: "In Progress", 
      value: books.filter(b => !["published", "draft"].includes(b.status)).length, 
      icon: Clock, 
      color: "from-amber-500 to-orange-500" 
    },
    { 
      label: "Published", 
      value: books.filter(b => b.status === "published").length, 
      icon: TrendingUp, 
      color: "from-emerald-500 to-green-500" 
    },
    { 
      label: "Team Members", 
      value: "3", 
      icon: Users, 
      color: "from-purple-500 to-pink-500" 
    }
  ], [books]);

  const recentBooks = useMemo(() => books.slice(0, 5), [books]);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-white/50 mt-1">Manage your book projects and track progress</p>
          </div>
          <Link to={createPageUrl("CreateBook")}>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
              <Plus className="w-4 h-4 mr-2" />
              New Book
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-white/50">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Books + Activity Feed */}
      <div className="grid lg:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="lg:col-span-2"
      >
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="border-b border-white/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Recent Projects</CardTitle>
              <Link to={createPageUrl("Books")}>
                <Button variant="ghost" className="text-white/50 hover:text-white hover:bg-white/10">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {booksLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : books.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white/30" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No books yet</h3>
                <p className="text-white/50 mb-6">Start your first book project with AI assistance</p>
                <Link to={createPageUrl("CreateBook")}>
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Your First Book
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentBooks.map((book, index) => (
                  <Link 
                    key={book.id} 
                    to={createPageUrl(`BookEditor?id=${book.id}`)}
                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {book.front_cover_url ? (
                        <img src={book.front_cover_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-white/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{book.title || "Untitled Book"}</h3>
                      <p className="text-sm text-white/40 truncate">{book.category || "No category"}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <Progress 
                          value={getProgressPercentage(book.status)} 
                          className="h-1.5 flex-1 max-w-32 bg-white/10" 
                        />
                        <Badge className={`text-xs ${STATUS_COLORS[book.status] || STATUS_COLORS.draft}`}>
                          {book.status?.replace('_', ' ') || 'draft'}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/30" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="lg:col-span-1 space-y-6"
      >
        <TasksWidget user={user} />
        <ActivityFeed />
        <MessageInboxWidget user={user} />
      </motion.div>
      </div>


    </div>
  );
}