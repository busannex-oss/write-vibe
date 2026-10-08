import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Users, 
  Plus, 
  Mail,
  Loader2,
  Check,
  X,
  Crown,
  Edit3,
  Trash2,
  BookOpen,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import TeamActivityFeed from "@/components/team/TeamActivityFeed";

const ROLES = [
  { id: "author", label: "Author", description: "Full access to all features", color: "from-amber-500 to-orange-500" },
  { id: "co_author", label: "Co-Author", description: "Can edit content and collaborate", color: "from-blue-500 to-cyan-500" },
  { id: "editor", label: "Editor", description: "Can review and edit content", color: "from-purple-500 to-pink-500" },
  { id: "publisher", label: "Publisher", description: "Can view and download materials", color: "from-emerald-500 to-green-500" },
  { id: "marketing", label: "Marketing", description: "Access to promotional materials", color: "from-rose-500 to-red-500" },
  { id: "assistant", label: "Assistant", description: "Limited access to help with tasks", color: "from-slate-500 to-slate-600" }
];

export default function Team() {
  const queryClient = useQueryClient();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [selectedBook, setSelectedBook] = useState("");
  const [inviting, setInviting] = useState(false);

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list()
  });

  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['team', selectedBook],
    queryFn: () => selectedBook 
      ? base44.entities.TeamMember.filter({ book_id: selectedBook })
      : base44.entities.TeamMember.list()
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const inviteMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('inviteTeamMember', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      setInviteDialogOpen(false);
      setInviteEmail("");
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: (id) => base44.entities.TeamMember.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team'] })
  });

  const handleInvite = async () => {
    if (!inviteEmail || !selectedBook) return;
    setInviting(true);
    try {
      await inviteMutation.mutateAsync({
        book_id: selectedBook,
        user_email: inviteEmail,
        role: inviteRole,
        status: "invited"
      });
    } catch (error) {
      console.error("Error inviting:", error);
    }
    setInviting(false);
  };

  const getRoleConfig = (roleId) => ROLES.find(r => r.id === roleId) || ROLES[5];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Team</h1>
          <p className="text-white/50 mt-1">Manage collaborators and permissions</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedBook} onValueChange={setSelectedBook}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
              <BookOpen className="w-4 h-4 mr-2 text-white/50" />
              <SelectValue placeholder="All books" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All Books</SelectItem>
              {books.map((book) => (
                <SelectItem key={book.id} value={book.id}>
                  {book.title || "Untitled Book"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                disabled={books.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Invite Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-white/70">Email Address</Label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
                <div>
                  <Label className="text-white/70">Book</Label>
                  <Select value={selectedBook} onValueChange={setSelectedBook}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select a book" />
                    </SelectTrigger>
                    <SelectContent>
                      {books.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.title || "Untitled Book"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white/70">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            <span>{role.label}</span>
                            <span className="text-xs text-white/40">- {role.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail || !selectedBook || inviting}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                >
                  {inviting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Invite...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Roles Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {ROLES.map((role) => (
          <Card key={role.id} className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${role.color} mx-auto mb-2 flex items-center justify-center`}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-medium text-white text-sm">{role.label}</h4>
              <p className="text-xs text-white/40 mt-1">{role.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Members */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Team Members
          </CardTitle>
          <CardDescription className="text-white/50">
            {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''} across your projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No team members yet</h3>
              <p className="text-white/50">Invite collaborators to work on your book projects</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Current User */}
              {user && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      {user.author_photo_url ? (
                        <img src={user.author_photo_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white font-medium">
                          {user.full_name?.charAt(0) || user.email?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">{user.full_name || "You"}</h4>
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                          <Crown className="w-3 h-3 mr-1" />
                          Owner
                        </Badge>
                      </div>
                      <p className="text-sm text-white/50">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Team Members */}
              {teamMembers.map((member, index) => {
                const roleConfig = getRoleConfig(member.role);
                const memberBook = books.find(b => b.id === member.book_id);
                
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${roleConfig.color} flex items-center justify-center`}>
                        <span className="text-white font-medium">
                          {member.name?.charAt(0) || member.user_email?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-white">{member.name || member.user_email}</h4>
                          <Badge className={`bg-gradient-to-r ${roleConfig.color} text-white border-0 text-xs`}>
                            {roleConfig.label}
                          </Badge>
                          {member.status === "invited" && (
                            <Badge className="bg-white/10 text-white/60 border-0 text-xs">
                              Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-white/50">{member.user_email}</p>
                        {memberBook && (
                          <p className="text-xs text-white/30 mt-1">
                            <BookOpen className="w-3 h-3 inline mr-1" />
                            {memberBook.title}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMemberMutation.mutate(member.id)}
                        className="text-white/40 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <div className="mt-6">
        <TeamActivityFeed selectedBook={selectedBook} />
      </div>
    </div>
  );
}