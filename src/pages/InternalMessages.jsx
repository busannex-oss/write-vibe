import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import MessageThread from "@/components/internalmessages/MessageThread";

export default function InternalMessages() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadThreads, setUnreadThreads] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.role === "admin") {
        base44.entities.User.list().then(allUsers => {
          setUsers(allUsers.filter(x => x.id !== u.id));
          setLoading(false);
        }).catch(() => setLoading(false));
      } else {
        setSelectedUser({ id: u.id, full_name: u.full_name, email: u.email });
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  const threadId = isAdmin ? selectedUser?.id : user?.id;

  useEffect(() => {
    if (!threadId) return;
    const fetchMessages = async () => {
      try {
        const msgs = await base44.entities.InternalMessage.filter({ thread_id: threadId });
        msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        setMessages(msgs);
        const unreadCount = msgs.filter(m => !m.is_read && (isAdmin ? m.sender_type === "user" : m.sender_type === "agent")).length;
        if (unreadCount > 0) {
          await base44.entities.InternalMessage.updateMany(
            { thread_id: threadId, sender_type: isAdmin ? "user" : "agent", is_read: false },
            { $set: { is_read: true } }
          );
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
    const unsubscribe = base44.entities.InternalMessage.subscribe(() => fetchMessages());
    return () => unsubscribe();
  }, [threadId, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchUnread = async () => {
      try {
        const unread = await base44.entities.InternalMessage.filter({ sender_type: "user", is_read: false });
        setUnreadThreads(new Set(unread.map(m => m.thread_id)));
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnread();
    const unsubscribe = base44.entities.InternalMessage.subscribe(() => fetchUnread());
    return () => unsubscribe();
  }, [isAdmin]);

  const handleSend = async (text) => {
    if (!threadId) return;
    setSending(true);
    try {
      await base44.entities.InternalMessage.create({
        thread_id: threadId,
        sender_type: isAdmin ? "agent" : "user",
        sender_id: isAdmin ? "master_customer_service" : user.id,
        sender_name: isAdmin ? "Master Customer Service Agent" : (user.full_name || user.email),
        recipient_id: isAdmin ? selectedUser.id : "master_customer_service",
        recipient_name: isAdmin ? (selectedUser.full_name || selectedUser.email) : "Master Customer Service Agent",
        agent_id: "master_customer_service",
        content: text,
        is_read: false,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-white">Customer Service</h1>
          <p className="text-sm text-white/50">Chat with the Master Customer Service Agent</p>
        </div>
        <Card className="overflow-hidden bg-slate-900 border-white/10">
          <CardContent className="p-0">
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">Master Customer Service</p>
                <p className="text-xs text-white/50">We typically respond within 24 hours</p>
              </div>
            </div>
            <div className="h-[500px]">
              <MessageThread
                messages={messages}
                onSend={handleSend}
                sending={sending}
                placeholder="Type your message..."
                agentPerspective={false}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    !searchQuery ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white">Internal Messages</h1>
        <p className="text-sm text-white/50">Master Customer Service Agent — send and receive messages from all users</p>
      </div>

      <Card className="overflow-hidden bg-slate-900 border-white/10">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
            <div className="border-r border-white/10 flex flex-col">
              <div className="p-3 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white/5 border-white/10 text-white text-sm"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredUsers.map(u => {
                  const isSelected = selectedUser?.id === u.id;
                  const hasUnread = unreadThreads.has(u.id);
                  return (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={cn(
                        "w-full text-left p-3 border-b border-white/5 hover:bg-white/5 transition-colors",
                        isSelected && "bg-amber-500/10 border-l-2 border-l-amber-500"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-medium text-white">
                          {u.full_name?.charAt(0) || u.email?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{u.full_name || u.email}</p>
                          <p className="text-xs text-white/40 truncate">{u.email}</p>
                        </div>
                        {hasUnread && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <p className="text-center text-white/40 text-sm py-8">No users found</p>
                )}
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col">
              {selectedUser ? (
                <>
                  <div className="p-4 border-b border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{selectedUser.full_name || selectedUser.email}</p>
                      <p className="text-xs text-white/50">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <MessageThread
                      messages={messages}
                      onSend={handleSend}
                      sending={sending}
                      placeholder="Type a message as Customer Service Agent..."
                      agentPerspective={true}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto text-white/20 mb-3" />
                    <p className="text-white/50">Select a user to view or start a conversation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}