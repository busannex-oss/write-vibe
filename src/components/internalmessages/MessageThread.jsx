import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MessageThread({ messages, onSend, sending, placeholder, agentPerspective }) {
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSend(newMessage.trim());
    setNewMessage("");
  };

  const isOwnMessage = (msg) =>
    agentPerspective ? msg.sender_type === "agent" : msg.sender_type === "user";

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-white/20 mb-3" />
            <p className="text-white/50">No messages yet. Start the conversation below.</p>
          </div>
        ) : (
          messages.map(msg => {
            const isOwn = isOwnMessage(msg);
            return (
              <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2",
                  isOwn ? "bg-amber-500 text-white" : "bg-white/10 text-white"
                )}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-[10px] mt-1 opacity-60">
                    {new Date(msg.created_date).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="p-4 border-t border-white/10 flex gap-2">
        <Input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder={placeholder}
          className="bg-white/10 border-white/20 text-white"
          disabled={sending}
        />
        <Button onClick={handleSend} disabled={sending || !newMessage.trim()} className="bg-amber-500 hover:bg-amber-600">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}