import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function GreetingBubble({ text, onOpen, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-72 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-3 flex gap-3"
    >
      <button onClick={onOpen} className="flex gap-3 text-left flex-1">
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
          <img src="https://media.base44.com/images/public/6975e45ac14c500ed1fcdcf2/1394b08c0_generated_image.png" alt="Sherry Givens" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-300">Sherry Givens</p>
          <p className="text-xs text-white/80 leading-snug mt-0.5">{text}</p>
        </div>
      </button>
      <button onClick={onDismiss} className="text-white/40 hover:text-white self-start" aria-label="Dismiss greeting">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}