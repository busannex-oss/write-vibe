import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight, 
  Users, 
  BookOpen, 
  Target, 
  Lightbulb,
  Sparkles,
  Check,
  Plus,
  X,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AIGenerateButton from "@/components/AIGenerateButton";

const STEPS = [
  { id: 1, title: "Characters", icon: Users, description: "Create your book characters" },
  { id: 2, title: "Audience", icon: Target, description: "Define your target readers" },
  { id: 3, title: "Category", icon: BookOpen, description: "Select book genre" },
  { id: 4, title: "Subjects", icon: Lightbulb, description: "Choose themes & issues" },
  { id: 5, title: "Plot", icon: Sparkles, description: "Write your plot summary" }
];

const CATEGORIES = [
  "Fiction", "Non-Fiction", "Romance", "Mystery & Thriller", "Science Fiction",
  "Fantasy", "Horror", "Biography", "Self-Help", "Business", "History",
  "Children's", "Young Adult", "Poetry", "Drama", "Religious & Spiritual"
];

const AUDIENCES = [
  { id: "children", label: "Children (5-12)", demographics: ["kids", "parents"] },
  { id: "teens", label: "Teenagers (13-17)", demographics: ["teens", "young readers"] },
  { id: "young_adults", label: "Young Adults (18-25)", demographics: ["college students", "new professionals"] },
  { id: "adults", label: "Adults (26-45)", demographics: ["professionals", "parents"] },
  { id: "mature", label: "Mature Adults (46+)", demographics: ["retirees", "grandparents"] },
  { id: "all_ages", label: "All Ages", demographics: ["families", "general audience"] }
];

const SUBJECTS = [
  "Love & Relationships", "Family", "Friendship", "Coming of Age", "Identity",
  "Social Justice", "Mental Health", "Trauma & Healing", "Adventure", "Survival",
  "Power & Corruption", "Technology", "Environment", "War & Peace", "Faith & Spirituality",
  "Success & Achievement", "Loss & Grief", "Redemption", "Freedom", "Equality"
];

export default function CreateBook() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [bookData, setBookData] = useState({
    characters: [],
    target_audience: { age_range: "", demographics: [], interests: [] },
    category: "",
    subjects: [],
    plot_summary: ""
  });

  const [newCharacter, setNewCharacter] = useState({
    name: "",
    role: "",
    description: "",
    traits: []
  });
  const [newTrait, setNewTrait] = useState("");
  const [generatingChar, setGeneratingChar] = useState(false);
  const [generatingPlot, setGeneratingPlot] = useState(false);

  const handleAddCharacter = () => {
    if (newCharacter.name && newCharacter.role) {
      setBookData(prev => ({
        ...prev,
        characters: [...prev.characters, { ...newCharacter, id: Date.now() }]
      }));
      setNewCharacter({ name: "", role: "", description: "", traits: [] });
    }
  };

  const handleRemoveCharacter = (id) => {
    setBookData(prev => ({
      ...prev,
      characters: prev.characters.filter(c => c.id !== id)
    }));
  };

  const handleAddTrait = () => {
    if (newTrait.trim()) {
      setNewCharacter(prev => ({
        ...prev,
        traits: [...prev.traits, newTrait.trim()]
      }));
      setNewTrait("");
    }
  };

  const handleSelectAudience = (audience) => {
    setBookData(prev => ({
      ...prev,
      target_audience: {
        ...prev.target_audience,
        age_range: audience.label,
        demographics: audience.demographics
      }
    }));
  };

  const handleToggleSubject = (subject) => {
    setBookData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleCreateBook = async () => {
    setLoading(true);
    try {
      const book = await base44.entities.Book.create({
        ...bookData,
        status: "draft",
        title: "Untitled Book"
      });
      navigate(createPageUrl(`BookEditor?id=${book.id}`));
    } catch (error) {
      console.error("Error creating book:", error);
    }
    setLoading(false);
  };

  const generateCharacter = async () => {
    setGeneratingChar(true);
    try {
      const prompt = `Generate a compelling book character based on:
Category: ${bookData.category || "Fiction"}
Target Audience: ${bookData.target_audience?.age_range || "General"}
Subjects: ${bookData.subjects?.join(", ") || "General themes"}
Existing Characters: ${bookData.characters.map(c => c.name + " (" + c.role + ")").join(", ") || "None yet"}

Create a unique character that fits this book.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            role: { type: "string" },
            description: { type: "string" },
            traits: { type: "array", items: { type: "string" } }
          }
        }
      });

      setNewCharacter(response);
    } catch (error) {
      console.error("Error generating character:", error);
    }
    setGeneratingChar(false);
  };

  const generatePlot = async () => {
    setGeneratingPlot(true);
    try {
      const prompt = `Write a compelling plot summary for a book with:
Category: ${bookData.category}
Target Audience: ${bookData.target_audience?.age_range}
Subjects: ${bookData.subjects?.join(", ")}
Characters: ${bookData.characters.map(c => `${c.name} (${c.role}): ${c.description}`).join("\n")}

Create an engaging plot that brings these elements together with clear conflict, rising action, and resolution.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            plot: { type: "string" }
          }
        }
      });

      setBookData(prev => ({ ...prev, plot_summary: response.plot }));
    } catch (error) {
      console.error("Error generating plot:", error);
    }
    setGeneratingPlot(false);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return bookData.characters.length > 0;
      case 2: return bookData.target_audience.age_range;
      case 3: return bookData.category;
      case 4: return bookData.subjects.length > 0;
      case 5: return bookData.plot_summary.trim().length > 50;
      default: return false;
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="text-white/50 hover:text-white hover:bg-white/10 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Create New Book</h1>
        <p className="text-white/50 mt-1">Let's build your book step by step with AI assistance</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-2 ${step >= s.id ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  step > s.id 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : step === s.id 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' 
                      : 'bg-white/10 text-white/50'
                }`}>
                  {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className="hidden lg:block text-sm font-medium text-white/70">{s.title}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-8 lg:w-16 h-0.5 mx-2 lg:mx-4 ${step > s.id ? 'bg-emerald-500/50' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                {React.createElement(STEPS[step - 1].icon, { className: "w-6 h-6 text-amber-400" })}
                {STEPS[step - 1].title}
              </CardTitle>
              <CardDescription className="text-white/50">{STEPS[step - 1].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 1: Characters */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Existing Characters */}
                  {bookData.characters.length > 0 && (
                    <div className="space-y-3">
                      {bookData.characters.map((char) => (
                        <div key={char.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-white">{char.name}</h4>
                            <p className="text-sm text-amber-400">{char.role}</p>
                            <p className="text-sm text-white/50 mt-1">{char.description}</p>
                            {char.traits.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {char.traits.map((trait, i) => (
                                  <Badge key={i} className="bg-white/10 text-white/70 border-0">{trait}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveCharacter(char.id)}
                            className="text-white/30 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Character Form */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 border-dashed space-y-4">
                    <div className="flex justify-end">
                      <AIGenerateButton
                        onClick={generateCharacter}
                        loading={generatingChar}
                        label="Generate Character"
                        size="sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/70">Character Name</Label>
                        <Input
                          value={newCharacter.name}
                          onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., John Smith"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                        />
                      </div>
                      <div>
                        <Label className="text-white/70">Role</Label>
                        <Input
                          value={newCharacter.role}
                          onChange={(e) => setNewCharacter(prev => ({ ...prev, role: e.target.value }))}
                          placeholder="e.g., Protagonist, Villain"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-white/70">Description</Label>
                      <Textarea
                        value={newCharacter.description}
                        onChange={(e) => setNewCharacter(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe their appearance, personality, and backstory..."
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label className="text-white/70">Personality Traits</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newTrait}
                          onChange={(e) => setNewTrait(e.target.value)}
                          placeholder="Add a trait..."
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTrait()}
                        />
                        <Button onClick={handleAddTrait} className="bg-white/10 hover:bg-white/20 text-white border-0">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {newCharacter.traits.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {newCharacter.traits.map((trait, i) => (
                            <Badge key={i} className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                              {trait}
                              <button 
                                onClick={() => setNewCharacter(prev => ({ ...prev, traits: prev.traits.filter((_, idx) => idx !== i) }))}
                                className="ml-2 hover:text-red-400"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button onClick={handleAddCharacter} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Character
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Audience */}
              {step === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {AUDIENCES.map((audience) => (
                    <button
                      key={audience.id}
                      onClick={() => handleSelectAudience(audience)}
                      className={`p-4 rounded-xl text-left transition-all ${
                        bookData.target_audience.age_range === audience.label
                          ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/50 ring-2 ring-amber-500/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      } border`}
                    >
                      <h4 className="font-medium text-white">{audience.label}</h4>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {audience.demographics.map((d) => (
                          <Badge key={d} className="text-xs bg-white/10 text-white/60 border-0">{d}</Badge>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 3: Category */}
              {step === 3 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => setBookData(prev => ({ ...prev, category }))}
                      className={`p-4 rounded-xl text-center transition-all ${
                        bookData.category === category
                          ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/50 ring-2 ring-amber-500/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      } border`}
                    >
                      <span className="font-medium text-white">{category}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 4: Subjects */}
              {step === 4 && (
                <div className="space-y-4">
                  <p className="text-white/50">Select the themes, causes, or issues your book addresses (select multiple)</p>
                  <div className="flex flex-wrap gap-3">
                    {SUBJECTS.map((subject) => (
                      <button
                        key={subject}
                        onClick={() => handleToggleSubject(subject)}
                        className={`px-4 py-2 rounded-full transition-all ${
                          bookData.subjects.includes(subject)
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Plot */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-white/70">Plot Summary</Label>
                    <AIGenerateButton
                      onClick={generatePlot}
                      loading={generatingPlot}
                      label="Generate Plot"
                      size="sm"
                    />
                  </div>
                  <div>
                    <Textarea
                      value={bookData.plot_summary}
                      onChange={(e) => setBookData(prev => ({ ...prev, plot_summary: e.target.value }))}
                      placeholder="Write a detailed summary of your book's plot. Include the main conflict, key events, and resolution..."
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/30 min-h-[200px]"
                    />
                    <p className="text-sm text-white/40 mt-2">
                      {bookData.plot_summary.length} characters (minimum 50 required)
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 1}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        {step < 5 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleCreateBook}
            disabled={!canProceed() || loading}
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Book
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}