import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, X, Send, Volume2, VolumeX, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ChatMessage from "@/components/chat/ChatMessage";

const STORAGE_KEY = 'cs_chat_history';

const WELCOME_MESSAGE = {
  role: 'agent',
  content: "Hey there! 👋 I'm Sam — I help folks navigate Write Vibe. Whether you're dreaming up your first book or trying to figure out the whole publishing thing, I've got you. What are you working on?",
};

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        setMessages([WELCOME_MESSAGE]);
      }
    } else {
      setMessages([WELCOME_MESSAGE]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await base44.functions.invoke('customerServiceChat', {
        messages: newMessages.slice(-10),
        enableVoice: voiceEnabled,
      });
      const agentMessage = {
        role: 'agent',
        content: response.data?.text || "I apologize, I had trouble processing that. Could you try again?",
        audioUrl: response.data?.audio_url || null,
      };
      setMessages(prev => [...prev, agentMessage]);

      if (voiceEnabled && agentMessage.audioUrl) {
        const audio = new Audio(agentMessage.audioUrl);
        audio.play().catch(() => {});
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: "I'm having trouble connecting right now. Please try again in a moment!",
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 flex items-center justify-center hover:scale-105 transition-transform"
            aria-label="Open customer service chat"
          >
            <MessageSquare className="w-6 h-6 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[32rem] max-h-[calc(100vh-6rem)] flex flex-col bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Sam</p>
                  <p className="text-xs text-green-400">● Customer Service • Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={cn("p-2 rounded-lg transition-colors", voiceEnabled ? "text-amber-400 bg-amber-400/10" : "text-white/40 hover:bg-white/10")}
                  title={voiceEnabled ? "Voice on" : "Voice off"}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <ChatMessage
                  key={idx}
                  message={msg}
                  onReplay={() => {
                    if (msg.audioUrl) {
                      const audio = new Audio(msg.audioUrl);
                      audio.play().catch(() => {});
                    }
                  }}
                />
              ))}
              {loading && (
                <div className="flex items-end gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/10 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Type your message..."
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-amber-500/50"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}