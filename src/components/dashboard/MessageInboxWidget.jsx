import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight, Inbox } from "lucide-react";
import { motion } from "framer-motion";

export default function MessageInboxWidget({ user }) {
  const isAdmin = user?.role === "admin";

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['inbox-messages', user?.id, isAdmin],
    queryFn: () => base44.entities.InternalMessage.filter(
      { sender_type: isAdmin ? "user" : "agent" },
      '-created_date',
      5
    ),
    enabled: !!user,
    staleTime: 15000
  });

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-white">Customer Service Inbox</CardTitle>
              {unreadCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500 text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            <Link to={createPageUrl("InternalMessages")}>
              <Button variant="ghost" className="text-white/50 hover:text-white hover:bg-white/10">
                Open
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Inbox className="w-6 h-6 text-white/30" />
              </div>
              <p className="text-white/50 text-sm">No messages yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {messages.map(msg => (
                <Link
                  key={msg.id}
                  to={createPageUrl("InternalMessages")}
                  className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">
                        {isAdmin ? (msg.sender_name || "Unknown User") : "Customer Service"}
                      </p>
                      {!msg.is_read && <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-white/40 truncate mt-0.5">{msg.content}</p>
                    <p className="text-[10px] text-white/30 mt-1">
                      {new Date(msg.created_date).toLocaleDateString()} {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}