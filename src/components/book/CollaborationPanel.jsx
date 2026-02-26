import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserPlus, Mail, Trash2, Shield, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function CollaborationPanel({ book }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const queryClient = useQueryClient();

  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['team-members', book.id],
    queryFn: () => base44.entities.TeamMember.filter({ book_id: book.id })
  });

  const inviteMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamMember.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', book.id] });
      setInviteEmail("");
      setInviteRole("editor");
    }
  });

  const removeMutation = useMutation({
    mutationFn: (id) => base44.entities.TeamMember.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', book.id] });
    }
  });

  const handleInvite = async () => {
    if (!inviteEmail) return;
    await inviteMutation.mutateAsync({
      book_id: book.id,
      user_email: inviteEmail,
      role: inviteRole,
      status: "invited"
    });
  };

  const roleColors = {
    author: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    co_author: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    editor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    publisher: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    marketing: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    assistant: "bg-slate-500/20 text-slate-300 border-slate-500/30"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Team Collaboration</CardTitle>
              <CardDescription className="text-white/50">Invite team members to collaborate on this book</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Invite Form */}
          <div className="flex gap-3">
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@email.com"
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="co_author">Co-Author</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="publisher">Publisher</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail || inviteMutation.isPending}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
            >
              {inviteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite
                </>
              )}
            </Button>
          </div>

          {/* Role Permissions Info */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-xs text-blue-300 mb-2 font-medium">Role Permissions:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
              <div>• <strong>Co-Author:</strong> Full edit access</div>
              <div>• <strong>Editor:</strong> Edit manuscript</div>
              <div>• <strong>Publisher:</strong> View & export</div>
              <div>• <strong>Marketing:</strong> Marketing tools</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm">Team Members ({teamMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <Users className="w-8 h-8 mx-auto mb-2 text-white/20" />
              <p>No team members yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                      <span className="text-sm font-medium text-white/60">
                        {member.user_email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{member.name || member.user_email}</p>
                      <p className="text-xs text-white/40">{member.user_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={roleColors[member.role]}>
                      {member.role.replace('_', ' ')}
                    </Badge>
                    {member.status === "invited" && (
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                        <Mail className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMutation.mutate(member.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Status */}
      <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-emerald-300">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium">Real-time collaboration enabled</span>
          </div>
          <p className="text-xs text-white/50 mt-2">
            Team members can work together simultaneously. Changes sync automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}