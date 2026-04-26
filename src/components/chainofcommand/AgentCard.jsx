import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function AgentCard({
  agent,
  brandColors,
  isSelected,
  pillars
}) {
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateAvatar();
  }, [agent.id]);

  const generateAvatar = async () => {
    try {
      setLoading(true);
      const prompt = `Create a professional cinematic portrait of an AI operative named ${agent.name} who works as a ${agent.title}. 
      Style: clean, modern, professional, high-tech aesthetic. 
      Keep the avatar professional and appropriate for an organizational hierarchy system.
      Return a single portrait image.`;

      const { url } = await window.base44?.integrations?.Core?.GenerateImage?.({ prompt });
      setAvatar(url);
    } catch (error) {
      console.error("Error generating avatar:", error);
      setAvatar(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (agent.status) {
      case "active":
        return "#10b981";
      case "in_development":
        return "#f59e0b";
      case "planned":
        return "#6366f1";
      default:
        return brandColors.accent;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="h-full cursor-pointer"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`relative rounded-xl p-6 backdrop-blur-xl border-2 transition-all h-full ${
          isSelected ? "ring-2" : ""
        }`}
        style={{
          backgroundColor: brandColors.secondary + "60",
          borderColor: isSelected ? brandColors.accent : brandColors.accent + "40",
          boxShadow: isSelected
            ? `0 0 20px ${brandColors.accent}40`
            : `0 0 10px ${brandColors.accent}20`,
          ringColor: brandColors.accent
        }}
      >
        {/* Status Indicator */}
        <div
          className="absolute top-3 right-3 w-3 h-3 rounded-full"
          style={{
            backgroundColor: getStatusColor(),
            boxShadow: `0 0 8px ${getStatusColor()}`
          }}
        />

        {/* Avatar */}
        {agent.role === "admin" ? (
          <div
            className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{
              backgroundColor: brandColors.accent + "30",
              border: `2px solid ${brandColors.accent}`,
              boxShadow: `0 0 15px ${brandColors.accent}60`
            }}
          >
            <Zap className="w-10 h-10" style={{ color: brandColors.accent }} />
          </div>
        ) : (
          <div className="mx-auto w-20 h-20 rounded-full overflow-hidden mb-4 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border-2" style={{ borderColor: brandColors.accent + "60" }}>
            {agent.image ? (
              <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
            ) : loading ? (
              <div
                className="w-full h-full animate-pulse"
                style={{ backgroundColor: brandColors.accent + "30" }}
              />
            ) : avatar ? (
              <img src={avatar} alt={agent.name} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-sm font-bold"
                style={{ color: brandColors.text }}
              >
                {agent.name.charAt(0)}
              </div>
            )}
          </div>
        )}

        {/* Name & Age */}
        <h3
          className="text-center font-bold text-lg mb-1"
          style={{ color: brandColors.text }}
        >
          {agent.name}
        </h3>
        {agent.age && (
          <p className="text-center text-xs text-white/40 mb-2">
            Age {agent.age}
          </p>
        )}

        {/* Title */}
        <p
          className="text-center text-xs font-bold uppercase tracking-wider mb-4"
          style={{ color: brandColors.accent }}
        >
          {agent.title}
        </p>

        {/* Pillar Tags */}
        <div className="flex flex-wrap gap-2 justify-center">
          {agent.pillars?.slice(0, 2).map((pillar, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-1 rounded-full uppercase tracking-wider font-semibold"
              style={{
                backgroundColor: brandColors.accent + "20",
                color: brandColors.accent,
                fontSize: "10px"
              }}
            >
              {pillar.split(" ")[0]}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}