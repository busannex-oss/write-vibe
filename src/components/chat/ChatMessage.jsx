import React from "react";
import { Sparkles, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatMessage({ message, onReplay }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn("flex items-end gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 mb-1">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={cn(
        "max-w-[78%] rounded-2xl px-4 py-2",
        isUser
          ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-br-md"
          : "bg-white/10 text-white rounded-bl-md"
      )}>
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        {!isUser && message.audioUrl && (
          <button
            onClick={onReplay}
            className="mt-1.5 flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 transition-colors"
          >
            <Volume2 className="w-3 h-3" />
            Replay voice
          </button>
        )}
      </div>
    </div>
  );
}