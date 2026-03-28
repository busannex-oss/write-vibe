import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  Mail, 
  Crown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Settings,
  Lock,
  BarChart3,
  Briefcase,
  Zap,
  Film,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";
import IntegrationSettings from "@/components/admin/IntegrationSettings";
import AIBusinessPlan from "@/components/admin/AIBusinessPlan";
import ConfidentialWhitePapers from "@/components/admin/ConfidentialWhitePapers.jsx";
import ComprehensiveAnalytics from "@/components/admin/ComprehensiveAnalytics";
import ClickgrowSettings from "@/components/admin/ClickgrowSettings";
import AIVideoProduction from "@/components/admin/AIVideoProduction";
import PaymentsAccounting from "@/components/admin/PaymentsAccounting";

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");

  const { data: currentUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list('created_date', 200);
      return allUsers;
    },
    enabled: !!currentUser
  });

  // The first admin (earliest created_date) is the super admin by default
  const adminUsers = users.filter(u => u.role === 'admin');
  const firstAdmin = adminUsers.length > 0 
    ? adminUsers.reduce((earliest, u) => 
        new Date(u.created_date) < new Date(earliest.created_date) ? u : earliest
      )
    : null;
  const isSuperAdmin = currentUser && firstAdmin && currentUser.id === firstAdmin.id;

  const inviteMutation = useMutation({
    mutationFn: async (data) => {
      await base44.users.inviteUser(data.email, data.role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      setInviteEmail("");
      alert("User invited successfully");
    },
    onError: (error) => {
      alert(`Failed to invite user: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      const userToDelete = users.find(u => u.id === userId);
      
      // Prevent deleting super admin
      if (userToDelete?.is_super_admin) {
        throw new Error("Cannot delete super admin");
      }
      
      await base44.entities.User.delete(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      alert("User deleted successfully");
    },
    onError: (error) => {
      alert(`Failed to delete user: ${error.message}`);
    }
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ userId, status }) => {
      const userToUpdate = users.find(u => u.id === userId);
      
      // Prevent suspending super admin
      if (userToUpdate?.is_super_admin) {
        throw new Error("Cannot suspend super admin");
      }
      
      await base44.entities.User.update(userId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
    onError: (error) => {
      alert(`Failed to update user: ${error.message}`);
    }
  });

  const handleInvite = () => {
    if (!inviteEmail) {
      alert("Please enter an email");
      return;
    }
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const handleDelete = (userId) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate(userId);
    }
  };

  const toggleSuspend = (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    suspendMutation.mutate({ userId, status: newStatus });
  };

  // Check if current user is super admin (first admin by creation date)
  if (!currentUser || (users.length > 0 && !isSuperAdmin)) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="py-8 text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-white/60">Only the super admin (first admin) can access user management</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-amber-400" />
          Admin Panel
        </h1>
        <p className="text-white/50 mt-1">Manage users, permissions, and platform integrations</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger value="users" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <Settings className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="confidential" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-300">
            <Lock className="w-4 h-4 mr-2" />
            Confidential
          </TabsTrigger>
          <TabsTrigger value="bizplan" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
            <Briefcase className="w-4 h-4 mr-2" />
            Business Plan
          </TabsTrigger>
          <TabsTrigger value="video" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
            <Film className="w-4 h-4 mr-2" />
            Video AI
          </TabsTrigger>
          <TabsTrigger value="clickgrow" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
            <Zap className="w-4 h-4 mr-2" />
            Clickgrow.AI
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
            <DollarSign className="w-4 h-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Invite User */}
      <Card className="bg-white/5 border-white/10 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            Invite New User
          </CardTitle>
          <CardDescription className="text-white/50">
            Send an invitation to join the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label className="text-white/70">Email Address</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
            </div>
            <div>
              <Label className="text-white/70">Role</Label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/20 text-white"
              >
                <option value="author">Author</option>
                <option value="publisher">Publisher</option>
                <option value="assistant">Assistant</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <Button
            onClick={handleInvite}
            disabled={inviteMutation.isPending}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
          >
            {inviteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">All Users</CardTitle>
            <Badge className="bg-white/10 text-white/70 border-0">
              {users.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50">No users yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border transition-all ${
                    firstAdmin?.id === user.id
                      ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-amber-500/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {user.author_photo_url ? (
                          <img src={user.author_photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium text-white/60">
                            {user.full_name?.charAt(0) || user.email?.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-white truncate">
                            {user.full_name || user.email}
                          </p>
                          {firstAdmin?.id === user.id && (
                            <Badge className="bg-amber-500 text-white border-0 text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Super Admin
                            </Badge>
                          )}
                          {user.role === "admin" && firstAdmin?.id !== user.id && (
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          {user.status === "suspended" && (
                            <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                              <XCircle className="w-3 h-3 mr-1" />
                              Suspended
                            </Badge>
                          )}
                          {user.status === "invited" && (
                            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-white/50 truncate">{user.email}</p>
                        {user.subscription_tier && (
                          <p className="text-xs text-white/40 mt-1 capitalize">
                            {user.subscription_tier} plan
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {firstAdmin?.id !== user.id && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleSuspend(user.id, user.status)}
                          disabled={suspendMutation.isPending}
                          className={`border-white/20 text-white hover:bg-white/10 ${
                            user.status === "suspended" ? 'border-green-500/30 text-green-400' : ''
                          }`}
                        >
                          {user.status === "suspended" ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Activate
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-1" />
                              Suspend
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(user.id)}
                          disabled={deleteMutation.isPending}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-amber-500/10 border-amber-500/30 mt-6">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-300 space-y-2">
              <p className="font-medium">Super Admin Protection</p>
              <ul className="list-disc list-inside space-y-1 text-amber-300/80">
                <li>Super admin account cannot be deleted</li>
                <li>Super admin permissions cannot be altered</li>
                <li>Only one super admin exists per application</li>
                <li>Super admin has full control over user management</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationSettings user={currentUser} />
        </TabsContent>

        <TabsContent value="confidential">
          <ConfidentialWhitePapers />
        </TabsContent>

        <TabsContent value="bizplan">
          <AIBusinessPlan />
        </TabsContent>

        <TabsContent value="video">
          <AIVideoProduction user={currentUser} />
        </TabsContent>

        <TabsContent value="clickgrow">
          <ClickgrowSettings user={currentUser} />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentsAccounting />
        </TabsContent>

        <TabsContent value="analytics">
          <ComprehensiveAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}