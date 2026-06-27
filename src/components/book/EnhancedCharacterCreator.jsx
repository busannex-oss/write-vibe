import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Sparkles, Loader2, Plus, Trash2, RefreshCw, Save, User, Image as ImageIcon, Upload, X, Bookmark, Library } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AIGenerateButton from "@/components/AIGenerateButton";
import SaveTemplateDialog from "@/components/templates/SaveTemplateDialog";
import LoadTemplateDialog from "@/components/templates/LoadTemplateDialog";

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Other"];

export default function EnhancedCharacterCreator({ book, onUpdate, isUpdating }) {
  const [characters, setCharacters] = useState(book.characters || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(null);
  const [uploading, setUploading] = useState(null);
  const [saveTemplateFor, setSaveTemplateFor] = useState(null);
  const [loadTemplateOpen, setLoadTemplateOpen] = useState(false);

  const addNewCharacter = () => {
    const newChar = {
      name: "",
      role: "",
      age: "",
      gender: "",
      description: "",
      backstory: "",
      traits: [],
      appearance: "",
      image_url: "",
      images: []
    };
    setCharacters([...characters, newChar]);
    setEditingIndex(characters.length);
  };

  const updateCharacter = (index, field, value) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], [field]: value };
    setCharacters(updated);
  };

  const deleteCharacter = (index) => {
    if (confirm("Delete this character?")) {
      const updated = characters.filter((_, i) => i !== index);
      setCharacters(updated);
      if (editingIndex === index) setEditingIndex(null);
    }
  };

  // Normalize a character's image list: prefer the `images` gallery, fall back to legacy `image_url`.
  const getImages = (char) => (char.images && char.images.length ? char.images : (char.image_url ? [char.image_url] : []));

  const setCharacterImages = (index, images) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], images, image_url: images[0] || "" };
    setCharacters(updated);
  };

  const handlePhotoUpload = async (index, fileList) => {
    const files = Array.from(fileList);
    if (!files.length) return;
    setUploading(index);
    try {
      const uploaded = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploaded.push(file_url);
      }
      const existing = getImages(characters[index]);
      setCharacterImages(index, [...existing, ...uploaded]);
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert("Failed to upload photos");
    }
    setUploading(null);
  };

  const promoteImage = (index, imgIndex) => {
    const imgs = [...getImages(characters[index])];
    if (imgIndex === 0 || imgIndex >= imgs.length) return;
    const [moved] = imgs.splice(imgIndex, 1);
    imgs.unshift(moved);
    setCharacterImages(index, imgs);
  };

  const removeImage = (index, imgIndex) => {
    const imgs = [...getImages(characters[index])];
    imgs.splice(imgIndex, 1);
    setCharacterImages(index, imgs);
  };

  const generateCharacter = async (index) => {
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a detailed character for a ${book.category} book titled "${book.title}".

Target Audience: ${book.target_audience?.age_range}
Themes: ${book.subjects?.join(', ')}
Plot Summary: ${book.plot_summary}

Generate a compelling character with:
- Name (appropriate for the genre and setting)
- Role (protagonist, antagonist, supporting, mentor, etc.)
- Age (specific age or age range)
- Gender
- Description (personality, motivations, conflicts)
- Backstory (brief but impactful)
- Traits (3-5 personality traits)
- Appearance (detailed physical description)

Make the character memorable, complex, and appropriate for the target audience.`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            role: { type: "string" },
            age: { type: "string" },
            gender: { type: "string" },
            description: { type: "string" },
            backstory: { type: "string" },
            traits: { type: "array", items: { type: "string" } },
            appearance: { type: "string" }
          }
        }
      });

      const updated = [...characters];
      updated[index] = { ...updated[index], ...response, image_url: updated[index].image_url, images: updated[index].images };
      setCharacters(updated);
    } catch (error) {
      console.error("Error generating character:", error);
      alert("Failed to generate character");
    }
    setGenerating(false);
  };

  const regenerateCharacter = async (index) => {
    const char = characters[index];
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Regenerate and improve this character for a ${book.category} book:

Current Character:
- Name: ${char.name}
- Role: ${char.role}
- Age: ${char.age}
- Gender: ${char.gender}
- Description: ${char.description}

Book Context:
- Title: "${book.title}"
- Target Audience: ${book.target_audience?.age_range}
- Themes: ${book.subjects?.join(', ')}

Create an enhanced version with more depth, better backstory, and compelling traits. Keep the same general role but make the character more interesting and complex.`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            role: { type: "string" },
            age: { type: "string" },
            gender: { type: "string" },
            description: { type: "string" },
            backstory: { type: "string" },
            traits: { type: "array", items: { type: "string" } },
            appearance: { type: "string" }
          }
        }
      });

      const updated = [...characters];
      updated[index] = { ...updated[index], ...response };
      setCharacters(updated);
    } catch (error) {
      console.error("Error regenerating character:", error);
      alert("Failed to regenerate character");
    }
    setGenerating(false);
  };

  const generateCharacterImage = async (index) => {
    const char = characters[index];
    if (!char.appearance && !char.description) {
      alert("Please add appearance or description first");
      return;
    }

    setGeneratingImage(index);
    try {
      const response = await base44.integrations.Core.GenerateImage({
        prompt: `Professional character portrait for a ${book.category} book:

Character: ${char.name}
Role: ${char.role}
Age: ${char.age || "unspecified"}
Gender: ${char.gender || "unspecified"}
Appearance: ${char.appearance || char.description}
Traits: ${char.traits?.join(', ')}

Style: Professional book illustration, detailed character portrait, appropriate for ${book.target_audience?.age_range} audience, high quality, book cover quality.`,
      });

      const existing = getImages(characters[index]);
      setCharacterImages(index, [response.url, ...existing]);
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate character image");
    }
    setGeneratingImage(null);
  };

  const saveCharacters = async () => {
    await onUpdate({ characters }, true);
  };

  const charToTemplateData = (c) =>
    c
      ? {
          name: c.name,
          role: c.role,
          age: c.age,
          gender: c.gender,
          description: c.description,
          backstory: c.backstory,
          traits: c.traits,
          appearance: c.appearance,
        }
      : {};

  const applyCharacterTemplate = (template) => {
    const d = template.character_data || {};
    setCharacters([
      ...characters,
      {
        name: d.name || "",
        role: d.role || "",
        age: d.age || "",
        gender: d.gender || "",
        description: d.description || "",
        backstory: d.backstory || "",
        traits: d.traits || [],
        appearance: d.appearance || "",
        image_url: "",
        images: [],
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-amber-400" />
                Character Development
              </CardTitle>
              <CardDescription className="text-white/50">
                Create and manage your book's characters
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setLoadTemplateOpen(true)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Library className="w-4 h-4 mr-2" />
                Load Template
              </Button>
              <Button
                onClick={addNewCharacter}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Character
              </Button>
              <Button
                onClick={saveCharacters}
                disabled={isUpdating || characters.length === 0}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Characters
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Characters List */}
      <div className="grid gap-6">
        <AnimatePresence>
          {characters.map((char, index) => {
            const images = getImages(char);
            const primaryImage = images[0];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden flex items-center justify-center">
                          {primaryImage ? (
                            <img src={primaryImage} alt={char.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-white/30" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            {char.name || `Character ${index + 1}`}
                          </h3>
                          {char.role && (
                            <Badge className="bg-white/10 text-white/60 border-0 text-xs mt-1">
                              {char.role}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSaveTemplateFor(index)}
                          disabled={!char.name}
                          className="border-white/20 text-white hover:bg-white/10"
                          title="Save as template"
                        >
                          <Bookmark className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => regenerateCharacter(index)}
                          disabled={generating || !char.name}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <RefreshCw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteCharacter(index)}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* LEFT — Full-size image + photo gallery */}
                      <div className="space-y-3">
                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                          {generatingImage === index ? (
                            <div className="flex flex-col items-center gap-2 text-white/50">
                              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                              <span className="text-xs">Generating portrait...</span>
                            </div>
                          ) : primaryImage ? (
                            <img src={primaryImage} alt={char.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-white/30">
                              <User className="w-12 h-12" />
                              <span className="text-xs">No photo yet</span>
                            </div>
                          )}
                        </div>

                        {/* Gallery thumbnails */}
                        {images.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {images.map((img, i) => (
                              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 group">
                                <img
                                  src={img}
                                  alt={`${char.name || 'Character'} ${i + 1}`}
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={() => promoteImage(index, i)}
                                  title={i === 0 ? "Primary photo" : "Click to set as primary"}
                                />
                                <button
                                  onClick={() => removeImage(index, i)}
                                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-500/80 transition-colors"
                                  title="Remove photo"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Upload + Generate */}
                        <div className="flex flex-wrap gap-2">
                          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-white text-sm hover:bg-white/10 cursor-pointer transition-colors">
                            {uploading === index ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span>{uploading === index ? "Uploading..." : "Upload Photos"}</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handlePhotoUpload(index, e.target.files);
                                e.target.value = "";
                              }}
                              disabled={uploading === index}
                            />
                          </label>
                          <AIGenerateButton
                            onClick={() => generateCharacterImage(index)}
                            loading={generatingImage === index}
                            label="Generate Portrait"
                            icon={ImageIcon}
                            variant="outline"
                          />
                        </div>
                      </div>

                      {/* RIGHT — Comprehensive details */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-white/70">Name</Label>
                            <Input
                              value={char.name}
                              onChange={(e) => updateCharacter(index, 'name', e.target.value)}
                              placeholder="Character name"
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                            />
                          </div>
                          <div>
                            <Label className="text-white/70">Role</Label>
                            <Input
                              value={char.role}
                              onChange={(e) => updateCharacter(index, 'role', e.target.value)}
                              placeholder="e.g., Protagonist, Antagonist"
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-white/70">Age</Label>
                            <Input
                              type="number"
                              min="0"
                              value={char.age || ""}
                              onChange={(e) => updateCharacter(index, 'age', e.target.value)}
                              placeholder="e.g., 28"
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                            />
                          </div>
                          <div>
                            <Label className="text-white/70">Gender</Label>
                            <Select
                              value={char.gender || undefined}
                              onValueChange={(v) => updateCharacter(index, 'gender', v)}
                            >
                              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                {GENDER_OPTIONS.map((g) => (
                                  <SelectItem key={g} value={g}>{g}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label className="text-white/70">Description</Label>
                          <Textarea
                            value={char.description}
                            onChange={(e) => updateCharacter(index, 'description', e.target.value)}
                            placeholder="Personality, motivations, conflicts..."
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label className="text-white/70">Backstory</Label>
                          <Textarea
                            value={char.backstory}
                            onChange={(e) => updateCharacter(index, 'backstory', e.target.value)}
                            placeholder="Character's history and background..."
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label className="text-white/70">Appearance</Label>
                          <Textarea
                            value={char.appearance}
                            onChange={(e) => updateCharacter(index, 'appearance', e.target.value)}
                            placeholder="Physical description..."
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label className="text-white/70">Traits (comma-separated)</Label>
                          <Input
                            value={char.traits?.join(', ')}
                            onChange={(e) => updateCharacter(index, 'traits', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                            placeholder="brave, loyal, cunning"
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                          />
                        </div>

                        <div className="pt-1">
                          <AIGenerateButton
                            onClick={() => generateCharacter(index)}
                            loading={generating}
                            label="Generate Character"
                            icon={Sparkles}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {characters.length === 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <User className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No characters yet</h3>
            <p className="text-white/50 mb-4">Add characters to bring your story to life</p>
            <Button
              onClick={addNewCharacter}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Character
            </Button>
          </CardContent>
        </Card>
      )}

      {saveTemplateFor !== null && characters[saveTemplateFor] && (
        <SaveTemplateDialog
          open
          onClose={() => setSaveTemplateFor(null)}
          type="character"
          data={charToTemplateData(characters[saveTemplateFor])}
          defaultName={characters[saveTemplateFor]?.name || ""}
        />
      )}
      <LoadTemplateDialog
        open={loadTemplateOpen}
        onClose={() => setLoadTemplateOpen(false)}
        type="character"
        onApply={applyCharacterTemplate}
      />
    </div>
  );
}