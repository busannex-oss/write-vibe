import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Wand2, Download, X, Loader2, ZoomIn, Crop, Droplet, Palette } from "lucide-react";
import { motion } from "framer-motion";

export default function LogoEditor({ onSave, currentLogoUrl, websiteTitle }) {
  const [step, setStep] = useState("upload"); // upload, edit, ai, confirm
  const [selectedFile, setSelectedFile] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgTransparent, setBgTransparent] = useState(false);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedFile(event.target.result);
        setStep("edit");
        setZoom(1);
        setCropX(0);
        setCropY(0);
        setOpacity(100);
        setBgColor("#ffffff");
        setBgTransparent(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current || !imageRef.current.complete) return;

    const ctx = canvas.getContext("2d");
    const img = imageRef.current;
    
    canvas.width = 400;
    canvas.height = 400;

    if (bgTransparent) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const size = 300 / zoom;
    ctx.globalAlpha = opacity / 100;
    ctx.drawImage(
      img,
      cropX,
      cropY,
      size,
      size,
      50,
      50,
      300,
      300
    );
    ctx.globalAlpha = 1;
  };

  useEffect(() => {
    if (selectedFile && step === "edit") {
      const timer = setTimeout(drawCanvas, 100);
      return () => clearTimeout(timer);
    }
  }, [zoom, cropX, cropY, opacity, bgColor, bgTransparent, selectedFile, step]);

  const handleRemoveBackground = async () => {
    if (!canvasRef.current) return;
    setLoading(true);
    try {
      const imageData = canvasRef.current.toDataURL("image/png");
      const blob = await (await fetch(imageData)).blob();
      
      const { file_url } = await base44.integrations.Core.UploadFile({ file: blob });
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Remove the background from this image and keep only the logo. Return the processed image with a transparent background. The image URL is: ${file_url}`,
        file_urls: [file_url]
      });

      setEditedImage(file_url);
      setStep("confirm");
    } catch (error) {
      console.error("Error removing background:", error);
    }
    setLoading(false);
  };

  const handleApplyAdjustments = async () => {
    if (!canvasRef.current) return;
    setLoading(true);
    try {
      const imageData = canvasRef.current.toDataURL("image/png");
      const blob = await (await fetch(imageData)).blob();
      const { file_url } = await base44.integrations.Core.UploadFile({ file: blob });
      setEditedImage(file_url);
      setStep("confirm");
    } catch (error) {
      console.error("Error applying adjustments:", error);
      alert("Failed to apply adjustments");
    }
    setLoading(false);
  };

  const handleGenerateLogoAI = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a professional, modern logo for "${websiteTitle}". The logo should:
- Be clean and memorable
- Work well at any size
- Have a transparent or neutral background
- Reflect professionalism and creativity
- Be suitable for use on a publishing/book platform
- Be a single icon or wordmark, not too complex
Create a professional logo that looks premium and trustworthy.`;

      const { url } = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: currentLogoUrl ? [currentLogoUrl] : undefined
      });

      setEditedImage(url);
      setStep("confirm");
    } catch (error) {
      console.error("Error generating logo:", error);
    }
    setLoading(false);
  };

  const handleConfirmAndSave = async () => {
    if (editedImage && onSave) {
      onSave(editedImage);
      resetEditor();
    }
  };

  const resetEditor = () => {
    setStep("upload");
    setSelectedFile(null);
    setEditedImage(null);
    setZoom(1);
    setCropX(0);
    setCropY(0);
    setOpacity(100);
    setBgColor("#ffffff");
    setBgTransparent(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {step === "upload" && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <div className="flex items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-all">
                  <Upload className="w-5 h-5 text-white/60" />
                  <div>
                    <p className="text-white font-medium">Upload Logo Image</p>
                    <p className="text-xs text-white/40">PNG or JPG • Any size</p>
                  </div>
                </div>
              </Label>
              <Input
                ref={fileInputRef}
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateLogoAI}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "edit" && selectedFile && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Edit Logo</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStep("upload")}
                className="text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preview Canvas */}
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                className="border-2 border-white/20 rounded-lg bg-white"
                width={400}
                height={400}
              />
              <img
                ref={imageRef}
                src={selectedFile}
                style={{ display: "none" }}
                onLoad={drawCanvas}
              />
            </div>

            {/* Zoom Control */}
            <div className="space-y-2">
              <Label className="text-white/70 flex items-center gap-2">
                <ZoomIn className="w-4 h-4" />
                Zoom
              </Label>
              <Slider
                value={[zoom]}
                onValueChange={(v) => setZoom(v[0])}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-white/40">{(zoom * 100).toFixed(0)}%</p>
            </div>

            {/* Crop Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70 flex items-center gap-2">
                  <Crop className="w-4 h-4" />
                  Position X
                </Label>
                <Slider
                  value={[cropX]}
                  onValueChange={(v) => setCropX(v[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Position Y</Label>
                <Slider
                  value={[cropY]}
                  onValueChange={(v) => setCropY(v[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Transparency */}
            <div className="space-y-2">
              <Label className="text-white/70 flex items-center gap-2">
                <Droplet className="w-4 h-4" />
                Transparency
              </Label>
              <Slider
                value={[opacity]}
                onValueChange={(v) => setOpacity(v[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-white/40">{opacity}% opacity</p>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <Label className="text-white/70 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Background
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                {["#ffffff", "#000000", "#0f172a", "#f59e0b", "#1e40af", "#059669"].map((c) => (
                  <button
                    key={c}
                    onClick={() => { setBgColor(c); setBgTransparent(false); }}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${!bgTransparent && bgColor === c ? "border-amber-400 scale-110" : "border-white/20"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <button
                  onClick={() => setBgTransparent(true)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center ${bgTransparent ? "border-amber-400 scale-110" : "border-white/20"}`}
                  style={{ backgroundImage: "linear-gradient(45deg, #64748b 25%, transparent 25%), linear-gradient(-45deg, #64748b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #64748b 75%), linear-gradient(-45deg, transparent 75%, #64748b 75%)", backgroundSize: "8px 8px" }}
                  title="Transparent"
                >
                  <X className="w-3 h-3 text-white/70" />
                </button>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => { setBgColor(e.target.value); setBgTransparent(false); }}
                  className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                  title="Custom color"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                onClick={handleRemoveBackground}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Remove Background"
                )}
              </Button>
              <Button
                onClick={handleApplyAdjustments}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Apply & Save
              </Button>
              <Button
                onClick={() => setStep("upload")}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "confirm" && editedImage && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Confirm Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center p-8 bg-white rounded-lg">
              <img src={editedImage} alt="Logo preview" className="max-w-xs max-h-40" />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleConfirmAndSave}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Save Logo
                  </>
                )}
              </Button>
              <Button
                onClick={() => setStep("upload")}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}