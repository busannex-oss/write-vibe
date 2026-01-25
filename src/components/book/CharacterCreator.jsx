import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Loader2, Image as ImageIcon, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AIGenerateButton from "@/components/AIGenerateButton";

export default function CharacterCreator({ book, onUpdate, isUpdating }) {
  const [characters, setCharacters] = useState(book?.characters || []);
  const [editingId, setEditingId] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(null);

  const [newChar, setNewChar] = useState({
    name: "",
    role: "",
    description: "",
    backstory: "",
    appearance: "",
    traits: [],
    image_url: ""
  });

  const generateCharacter = async () => {
    setGenerating(true);
    try {
      const prompt = `Create a detailed character for this book:
Title: ${book.title}
Genre: ${book.category}
Existing characters: ${characters.map(c => `${c.name} (${c.role})`).join(", ")}
Plot: ${book.plot_summary}

Generate a unique, well-developed character with distinct personality.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            role: { type: "string" },
            description: { type: "string" },
            backstory: { type: "string" },
            appearance: { type: "string" },
            traits: { type: "array", items: { type: "string" } }
          }
        }
      });

      setNewChar({ ...response, image_url: "" });
    } catch (error) {
      console.error("Error generating character:", error);
    }
    setGenerating(false);
  };

  const generateCharacterImage = async (character) => {
    setGeneratingImage(character.name);
    try {
      const prompt = `A detailed character portrait of ${character.name}, ${character.role} from a ${book.category} novel.

Appearance: ${character.appearance}
Personality traits: ${character.traits?.join(", ")}
Setting: ${book.category} book aesthetic

Create a professional book character illustration.`;

      const response = await base44.integrations.Core.GenerateImage({ prompt });
      
      const updatedChars = characters.map(c => 
        c.name === character.name ? { ...c, image_url: response.url } : c
      );
      setCharacters(updatedChars);
      await onUpdate({ characters: updatedChars });
    } catch (error) {
      console.error("Error generating image:", error);
    }
    setGeneratingImage(null);
  };

  const addCharacter = () => {
    if (newChar.name && newChar.role) {
      const updated = [...characters, { ...newChar, id: Date.now() }];
      setCharacters(updated);
      onUpdate({ characters: updated });
      setNewChar({ name: "", role: "", description: "", backstory: "", appearance: "", traits: [], image_url: "" });
    }
  };

  const removeCharacter = (id) => {
    const updated = characters.filter(c => c.id !== id);
    setCharacters(updated);
    onUpdate({ characters: updated });
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Characters</CardTitle>
          <AIGenerateButton
            onClick={generateCharacter}
            loading={generating}
            label="Generate Character"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Character Form */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 border-dashed space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/70">Name</Label>
              <Input
                value={newChar.name}
                onChange={(e) => setNewChar(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Character name"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
            </div>
            <div>
              <Label className="text-white/70">Role</Label>
              <Input
                value={newChar.role}
                onChange={(e) => setNewChar(prev => ({ ...prev, role: e.target.value }))}
                placeholder="e.g., Protagonist, Antagonist"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
            </div>
          </div>

          <div>
            <Label className="text-white/70">Description</Label>
            <Textarea
              value={newChar.description}
              onChange={(e) => setNewChar(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief character description..."
              className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              rows={2}
            />
          </div>

          <div>
            <Label className="text-white/70">Backstory</Label>
            <Textarea
              value={newChar.backstory}
              onChange={(e) => setNewChar(prev => ({ ...prev, backstory: e.target.value }))}
              placeholder="Character's background and history..."
              className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-white/70">Appearance</Label>
            <Textarea
              value={newChar.appearance}
              onChange={(e) => setNewChar(prev => ({ ...prev, appearance: e.target.value }))}
              placeholder="Physical appearance details..."
              className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              rows={2}
            />
          </div>

          <Button onClick={addCharacter} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Character
          </Button>
        </div>

        {/* Characters List */}
        <div className="space-y-4">
          {characters.map((char) => (
            <div key={char.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex gap-4">
                {/* Character Image */}
                <div className="w-24 h-24 rounded-lg bg-white/10 flex-shrink-0 overflow-hidden">
                  {generatingImage === char.name ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                    </div>
                  ) : char.image_url ? (
                    <img src={char.image_url} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <button
                      onClick={() => generateCharacterImage(char)}
                      className="w-full h-full flex flex-col items-center justify-center text-white/40 hover:text-amber-400 hover:bg-white/5 transition-colors"
                    >
                      <Sparkles className="w-5 h-5 mb-1" />
                      <span className="text-xs">Generate</span>
                    </button>
                  )}
                </div>

                {/* Character Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-white">{char.name}</h4>
                      <p className="text-sm text-amber-400">{char.role}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCharacter(char.id)}
                      className="text-white/30 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-white/60 mt-2">{char.description}</p>
                  {char.traits?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {char.traits.map((trait, i) => (
                        <Badge key={i} className="bg-white/10 text-white/70 border-0 text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}