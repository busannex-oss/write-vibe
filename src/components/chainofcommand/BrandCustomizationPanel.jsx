import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function BrandCustomizationPanel({
  onSave,
  onCancel,
  currentCustomization,
  agents,
  onAgentsUpdate,
  brandColors
}) {
  const [customization, setCustomization] = useState(
    currentCustomization || {
      backgroundColor: "#0f172a",
      cardColor: "#1f2937",
      accentColor: "#3b82f6",
      textColor: "#ffffff",
      logo: null,
      siteName: "Write Vibe",
      pageTitle: "CHAIN OF COMMAND",
      pageSubtitle: "ORGANIZATIONAL HIERARCHY NODE",
      fontFamily: "Inter",
      headingWeight: "700",
      bodyWeight: "400"
    }
  );

  const [agentRenames, setAgentRenames] = useState({});

  const handleColorChange = (key, value) => {
    setCustomization(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(customization);
  };

  const handleReset = () => {
    setCustomization({
      backgroundColor: "#0f172a",
      cardColor: "#1f2937",
      accentColor: "#3b82f6",
      textColor: "#ffffff",
      logo: null,
      siteName: "Write Vibe",
      pageTitle: "CHAIN OF COMMAND",
      pageSubtitle: "ORGANIZATIONAL HIERARCHY NODE",
      fontFamily: "Inter",
      headingWeight: "700",
      bodyWeight: "400"
    });
    setAgentRenames({});
  };

  const colors = [
    { key: "backgroundColor", label: "Background Color" },
    { key: "cardColor", label: "Card Surface Color" },
    { key: "accentColor", label: "Accent Color" },
    { key: "textColor", label: "Primary Text Color" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 space-y-6"
    >
      <Card className="border-white/10" style={{ backgroundColor: brandColors.secondary + "60" }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Brand Customization</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Colors */}
          <div className="space-y-4">
            <h3 className="font-bold text-white uppercase tracking-wider">Colors</h3>
            <div className="grid grid-cols-2 gap-6">
              {colors.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label className="text-white/70 text-sm">{label}</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customization[key]}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="w-12 h-10 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={customization[key]}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="flex-1 bg-white/5 border-white/20 text-white text-sm font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-4">
            <h3 className="font-bold text-white uppercase tracking-wider">Typography</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Font Family</Label>
                <Input
                  value={customization.fontFamily}
                  onChange={(e) => setCustomization(prev => ({ ...prev, fontFamily: e.target.value }))}
                  placeholder="Inter"
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Heading Weight</Label>
                <select
                  value={customization.headingWeight}
                  onChange={(e) => setCustomization(prev => ({ ...prev, headingWeight: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white text-sm"
                >
                  <option value="400">Regular</option>
                  <option value="600">Semibold</option>
                  <option value="700">Bold</option>
                  <option value="800">Extra Bold</option>
                </select>
              </div>
            </div>
          </div>

          {/* Logo & Identity */}
          <div className="space-y-4">
            <h3 className="font-bold text-white uppercase tracking-wider">Logo & Identity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Site Name</Label>
                <Input
                  value={customization.siteName}
                  onChange={(e) => setCustomization(prev => ({ ...prev, siteName: e.target.value }))}
                  placeholder="Write Vibe"
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Page Title</Label>
                <Input
                  value={customization.pageTitle}
                  onChange={(e) => setCustomization(prev => ({ ...prev, pageTitle: e.target.value }))}
                  placeholder="CHAIN OF COMMAND"
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70 text-sm">Page Subtitle</Label>
              <Input
                value={customization.pageSubtitle}
                onChange={(e) => setCustomization(prev => ({ ...prev, pageSubtitle: e.target.value }))}
                placeholder="ORGANIZATIONAL HIERARCHY NODE"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-white/10">
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              style={{ backgroundColor: brandColors.accent }}
            >
              Save & Apply
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}