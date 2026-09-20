import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, X, Send, Volume2, VolumeX, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ChatMessage from "@/components/chat/ChatMessage";
import GreetingBubble from "@/components/chat/GreetingBubble";

const STORAGE_KEY = 'cs_chat_history';
const SESSION_KEY = 'sherry_session_id';
const GREETED_KEY = 'sherry_greeted';
const SEEN_KEY = 'sherry_seen_before';

const buildWelcome = (firstName, returning) => ({
  role: 'agent',
  content: firstName
    ? `${returning ? 'Welcome back' : 'Hey'}, ${firstName}! 👋 It's Sherry. I've got your projects pulled up — what are we working on today?`
    : returning
      ? "Well hey, welcome back! 👋 It's Sherry Givens. Good to see you again — what can I help you with today?"
      : "Hey there! 👋 I'm Sherry Givens — I'm here to help you make the most of Write Vibe. Whether you're just starting your first book or you're deep in the publishing weeds, I've got you. So — what are you working on these days?",
});

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [greeting, setGreeting] = useState(null);
  const messagesEndRef = useRef(null);

  // Greet + log every visitor once per browser session
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let history = null;
    if (saved) {
      try { history = JSON.parse(saved); } catch { history = null; }
    }

    if (sessionStorage.getItem(GREETED_KEY)) {
      setMessages(history?.length ? history : [buildWelcome(null, !!localStorage.getItem(SEEN_KEY))]);
      return;
    }

    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    const returning = !!localStorage.getItem(SEEN_KEY);
    sessionStorage.setItem(GREETED_KEY, '1');
    localStorage.setItem(SEEN_KEY, '1');

    base44.functions.invoke('logVisitor', {
      session_id: sessionId,
      page: window.location.pathname,
      referrer: document.referrer || '',
      returning,
    }).then((res) => {
      const welcome = buildWelcome(res.data?.first_name || null, returning);
      setMessages(history?.length ? [...history, welcome] : [welcome]);
      setGreeting(welcome.content);
    }).catch(() => {
      const welcome = buildWelcome(null, returning);
      setMessages(history?.length ? history : [welcome]);
      setGreeting(welcome.content);
    });
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
        {!isOpen && greeting && (
          <GreetingBubble
            text={greeting}
            onOpen={() => { setGreeting(null); setIsOpen(true); }}
            onDismiss={() => setGreeting(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => { setGreeting(null); setIsOpen(true); }}
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
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <img src="https://media.base44.com/images/public/6975e45ac14c500ed1fcdcf2/1394b08c0_generated_image.png" alt="Sherry Givens" className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Sherry Givens</p>
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
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <img src="https://media.base44.com/images/public/6975e45ac14c500ed1fcdcf2/1394b08c0_generated_image.png" alt="" className="w-full h-full object-cover" />
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