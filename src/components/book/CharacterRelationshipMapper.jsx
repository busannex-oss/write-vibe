import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Users, X, Plus, Trash2, Link as LinkIcon, Heart, Sword, Shield, User, Home, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const RELATIONSHIP_TYPES = [
  { value: "family", label: "Family", icon: Home, color: "bg-emerald-500" },
  { value: "friend", label: "Friend", icon: Heart, color: "bg-blue-500" },
  { value: "rival", label: "Rival", icon: Sword, color: "bg-red-500" },
  { value: "ally", label: "Ally", icon: Shield, color: "bg-amber-500" },
  { value: "romantic", label: "Romantic", icon: Heart, color: "bg-pink-500" },
  { value: "professional", label: "Professional", icon: Briefcase, color: "bg-slate-500" },
  { value: "mentor", label: "Mentor/Mentee", icon: User, color: "bg-purple-500" },
  { value: "other", label: "Other", icon: LinkIcon, color: "bg-gray-500" },
];

const RELATIONSHIP_COLORS = {
  family: "#10b981",
  friend: "#3b82f6",
  rival: "#ef4444",
  ally: "#f59e0b",
  romantic: "#ec4899",
  professional: "#64748b",
  mentor: "#a855f7",
  other: "#6b7280",
};

export default function CharacterRelationshipMapper({ characters = [], onUpdate }) {
  const [relationships, setRelationships] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState(null);
  const [draggedNodes, setDraggedNodes] = useState({});
  const containerRef = useRef(null);

  const [newRelationship, setNewRelationship] = useState({
    character1_id: "",
    character2_id: "",
    type: "friend",
    description: "",
    strength: "medium",
  });

  useEffect(() => {
    if (onUpdate) {
      onUpdate(relationships);
    }
  }, [relationships]);

  const handleAddRelationship = () => {
    if (!newRelationship.character1_id || !newRelationship.character2_id) return;
    
    const relationship = {
      id: Date.now().toString(),
      ...newRelationship,
      created_at: new Date().toISOString(),
    };
    
    setRelationships([...relationships, relationship]);
    setNewRelationship({
      character1_id: "",
      character2_id: "",
      type: "friend",
      description: "",
      strength: "medium",
    });
    setIsDialogOpen(false);
  };

  const handleDeleteRelationship = (id) => {
    setRelationships(relationships.filter(r => r.id !== id));
  };

  const getCharacterById = (id) => {
    return characters.find(c => c.id === id || c.name === id);
  };

  const getRelationshipsForCharacter = (characterId) => {
    return relationships.filter(
      r => r.character1_id === characterId || r.character2_id === characterId
    );
  };

  const calculateNodePosition = (index, total) => {
    const angle = (2 * Math.PI * index) / total;
    const radius = 200;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  return (
    <div className="w-full h-[600px] bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
      <CardHeader className="border-b border-white/10 bg-slate-900/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">Character Relationship Map</CardTitle>
              <p className="text-sm text-white/40">
                Visualize connections between {characters.length} characters
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                <Plus className="w-4 h-4" />
                Add Relationship
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>Add Character Relationship</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Character 1</Label>
                  <Select
                    value={newRelationship.character1_id}
                    onValueChange={(value) =>
                      setNewRelationship({ ...newRelationship, character1_id: value })
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-white/10">
                      <SelectValue placeholder="Select character" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10">
                      {characters.map((char) => (
                        <SelectItem key={char.id || char.name} value={char.id || char.name}>
                          {char.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Character 2</Label>
                  <Select
                    value={newRelationship.character2_id}
                    onValueChange={(value) =>
                      setNewRelationship({ ...newRelationship, character2_id: value })
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-white/10">
                      <SelectValue placeholder="Select character" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10">
                      {characters
                        .filter((char) => char.id !== newRelationship.character1_id && char.name !== newRelationship.character1_id)
                        .map((char) => (
                          <SelectItem key={char.id || char.name} value={char.id || char.name}>
                            {char.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Relationship Type</Label>
                  <Select
                    value={newRelationship.type}
                    onValueChange={(value) =>
                      setNewRelationship({ ...newRelationship, type: value })
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10">
                      {RELATIONSHIP_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Strength</Label>
                  <Select
                    value={newRelationship.strength}
                    onValueChange={(value) =>
                      setNewRelationship({ ...newRelationship, strength: value })
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10">
                      <SelectItem value="weak">Weak</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="strong">Strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input
                    placeholder="e.g., Childhood friends, bitter rivals"
                    value={newRelationship.description}
                    onChange={(e) =>
                      setNewRelationship({ ...newRelationship, description: e.target.value })
                    }
                    className="bg-slate-800 border-white/10"
                  />
                </div>
                <Button
                  onClick={handleAddRelationship}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={!newRelationship.character1_id || !newRelationship.character2_id}
                >
                  Add Relationship
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-0 h-[calc(600px-80px)] relative">
        {characters.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white/40">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No characters yet. Add characters to see the relationship map.</p>
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="w-full h-full relative overflow-hidden">
            {/* Relationship Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {relationships.map((rel) => {
                const char1 = getCharacterById(rel.character1_id);
                const char2 = getCharacterById(rel.character2_id);
                if (!char1 || !char2) return null;

                const index1 = characters.findIndex(
                  c => c.id === rel.character1_id || c.name === rel.character1_id
                );
                const index2 = characters.findIndex(
                  c => c.id === rel.character2_id || c.name === rel.character2_id
                );
                const pos1 = calculateNodePosition(index1, characters.length);
                const pos2 = calculateNodePosition(index2, characters.length);

                const strokeWidth = rel.strength === "strong" ? 4 : rel.strength === "medium" ? 2 : 1;
                const color = RELATIONSHIP_COLORS[rel.type] || "#6b7280";

                return (
                  <g key={rel.id}>
                    <line
                      x1={pos1.x + 300}
                      y1={pos1.y + 300}
                      x2={pos2.x + 300}
                      y2={pos2.y + 300}
                      stroke={color}
                      strokeWidth={strokeWidth}
                      opacity="0.6"
                    />
                    {rel.description && (
                      <foreignObject
                        x={(pos1.x + pos2.x) / 2 + 280}
                        y={(pos1.y + pos2.y) / 2 + 290}
                        width="200"
                        height="40"
                      >
                        <div className="text-xs text-white/60 text-center bg-slate-900/80 rounded px-2 py-1">
                          {rel.description}
                        </div>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Character Nodes */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-[600px] h-[600px]">
                {characters.map((char, index) => {
                  const pos = calculateNodePosition(index, characters.length);
                  const nodeRelationships = getRelationshipsForCharacter(char.id || char.name);
                  const RelationIcon = nodeRelationships.length > 0 ? LinkIcon : null;

                  return (
                    <motion.div
                      key={char.id || char.name}
                      className="absolute"
                      style={{
                        x: pos.x + 300,
                        y: pos.y + 300,
                        translateX: "-50%",
                        translateY: "-50%",
                      }}
                      whileHover={{ scale: 1.1 }}
                      drag
                      dragMomentum={false}
                      onDragEnd={(e, info) => {
                        setDraggedNodes({
                          ...draggedNodes,
                          [char.id || char.name]: {
                            x: info.point.x - 300,
                            y: info.point.y - 300,
                          },
                        });
                      }}
                    >
                      <div className="relative group">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 border-2 border-white/10">
                          {char.image_url ? (
                            <img
                              src={char.image_url}
                              alt={char.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-white" />
                          )}
                        </div>
                        
                        {nodeRelationships.length > 0 && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                            <RelationIcon className="w-3 h-3 text-amber-400" />
                          </div>
                        )}

                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/95 border border-white/10 rounded-lg px-3 py-2 z-10">
                          <p className="text-sm font-medium text-white">{char.name}</p>
                          {char.role && (
                            <p className="text-xs text-white/40">{char.role}</p>
                          )}
                          {nodeRelationships.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {nodeRelationships.slice(0, 3).map((rel) => {
                                const otherChar = getCharacterById(
                                  rel.character1_id === (char.id || char.name)
                                    ? rel.character2_id
                                    : rel.character1_id
                                );
                                const TypeIcon = RELATIONSHIP_TYPES.find(
                                  t => t.value === rel.type
                                )?.icon || LinkIcon;
                                return (
                                  <Badge
                                    key={rel.id}
                                    className="text-[10px] px-1.5 py-0.5"
                                    style={{
                                      backgroundColor: RELATIONSHIP_COLORS[rel.type],
                                    }}
                                  >
                                    <TypeIcon className="w-2 h-2 mr-1" />
                                    {otherChar?.name || "Unknown"}
                                  </Badge>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Relationships List */}
      {relationships.length > 0 && (
        <div className="border-t border-white/10 bg-slate-900/50 p-4">
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {relationships.map((rel) => {
                const char1 = getCharacterById(rel.character1_id);
                const char2 = getCharacterById(rel.character2_id);
                const TypeIcon = RELATIONSHIP_TYPES.find(t => t.value === rel.type)?.icon || LinkIcon;
                const color = RELATIONSHIP_COLORS[rel.type] || "#6b7280";

                return (
                  <div
                    key={rel.id}
                    className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2 border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <TypeIcon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div>
                        <p className="text-sm text-white">
                          <span className="font-medium">{char1?.name}</span>
                          <span className="text-white/40 mx-2">↔</span>
                          <span className="font-medium">{char2?.name}</span>
                        </p>
                        {rel.description && (
                          <p className="text-xs text-white/40">{rel.description}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/40 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => handleDeleteRelationship(rel.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}