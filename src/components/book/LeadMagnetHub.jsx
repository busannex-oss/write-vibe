import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, MessageSquare, Zap, Target } from "lucide-react";

export default function LeadMagnetHub({ bookId }) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Fetch book data for agent context
  const { data: book } = useQuery({
    queryKey: ["book", bookId],
    queryFn: () => base44.entities.Book.filter({ id: bookId }),
    select: (data) => data[0],
    enabled: !!bookId,
  });

  // Initialize agent conversation
  useEffect(() => {
    if (!showChat || conversationId) return;

    const initConversation = async () => {
      try {
        const conv = await base44.agents.createConversation({
          agent_name: "lead_magnet_designer",
          metadata: {
            book_id: bookId,
            book_title: book?.title,
            book_category: book?.category,
            name: `${book?.title} Lead Magnet Strategy`,
            description: `Strategic lead magnet design for ${book?.title}`,
          },
        });
        setConversationId(conv.id);
        setMessages(conv.messages || []);
      } catch (error) {
        console.error("Failed to initialize conversation:", error);
      }
    };

    initConversation();
  }, [showChat, bookId, book]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages);
    });

    return unsubscribe;
  }, [conversationId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !conversationId) return;

    setIsLoading(true);
    try {
      const conversation = await base44.agents.getConversation(conversationId);
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: inputMessage,
      });
      setInputMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Start Cards */}
      {!showChat && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/30 p-6 hover:border-amber-500/50 transition-all cursor-pointer group"
            onClick={() => setShowChat(true)}>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-500/20 group-hover:from-amber-500/40 group-hover:to-orange-500/30 transition-all">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Design Your Lead Magnet</h3>
                <p className="text-sm text-white/70">Get AI-powered strategies tailored to your book's audience and category</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/30 p-6 hover:border-emerald-500/50 transition-all cursor-pointer group"
            onClick={() => setShowChat(true)}>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/20 group-hover:from-emerald-500/40 group-hover:to-teal-500/30 transition-all">
                <Target className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Build Your Audience</h3>
                <p className="text-sm text-white/70">Create conversion-focused strategies to build loyal fans and boost sales</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Chat Interface */}
      {showChat && (
        <Card className="bg-slate-900/50 border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Lead Magnet Designer AI
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChat(false)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </Button>
          </div>

          {/* Messages */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/60 mb-4">
                  Hi! I'm your lead magnet strategist. Ask me about designing lead magnets for "{book?.title}"
                </p>
                <div className="space-y-2 text-sm text-white/50">
                  <p>💡 Try asking:</p>
                  <p>"What lead magnet would work best for my book?"</p>
                  <p>"How do I build an email list from this book?"</p>
                  <p>"Create a 30-day conversion strategy for my audience"</p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-amber-500/20 border border-amber-500/40 text-white"
                        : "bg-white/10 border border-white/20 text-white/90"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-lg">
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="space-y-3 border-t border-white/10 pt-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about lead magnets, audience building, conversions..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Get Strategy
                </>
              )}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}