import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ai } from "@/lib/ai";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  CreditCard, 
  Palette,
  Bell,
  Shield,
  Loader2,
  Check,
  Upload,
  Crown,
  Sparkles,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AIGenerateButton from "@/components/AIGenerateButton";
import HeroImageManager from "@/components/HeroImageManager";
import WhiteLabelBranding from "@/components/WhiteLabelBranding";
import WebsiteBranding from "@/components/WebsiteBranding";
import EmailPreferences from "@/components/EmailPreferences";
import PIBQuestionnaire from "@/components/pib/PIBQuestionnaire";

const SOCIAL_PLATFORMS = [
  { id: "facebook", name: "Facebook", icon: Facebook },
  { id: "twitter", name: "X (Twitter)", icon: Twitter },
  { id: "instagram", name: "Instagram", icon: Instagram },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin },
  { id: "youtube", name: "YouTube", icon: Youtube },
  { id: "tiktok", name: "TikTok", icon: null },
  { id: "pinterest", name: "Pinterest", icon: null },
  { id: "goodreads", name: "Goodreads", icon: null }
];

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    biography: "",
    author_photo_url: "",
    social_media: {},
    email_preferences: {}
  });

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        biography: user.biography || "",
        author_photo_url: user.author_photo_url || "",
        social_media: user.social_media || {},
        email_preferences: user.email_preferences || {}
      });
    }
  }, [user]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setProfile(prev => ({ ...prev, author_photo_url: file_url }));
      } catch (error) {
        console.error("Error uploading photo:", error);
      }
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(profile);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch (error) {
      console.error("Error saving profile:", error);
    }
    setSaving(false);
  };

  const updateSocialLink = (id, value) => {
    setProfile(prev => ({
      ...prev,
      social_media: { ...prev.social_media, [id]: value }
    }));
  };

  const updateEmailPreference = (id, value) => {
    setProfile(prev => ({
      ...prev,
      email_preferences: { ...prev.email_preferences, [id]: value }
    }));
  };

  const generateBio = async () => {
    setGeneratingBio(true);
    try {
      const authorName = profile.first_name && profile.last_name 
        ? `${profile.first_name} ${profile.last_name}`
        : user?.full_name || user?.email;
      
      const prompt = `Generate a professional author biography for:
Name: ${authorName}
Current Bio: ${profile.biography || "No bio yet"}

Create a compelling 2-3 paragraph author biography that sounds professional and engaging. This will be used on the back cover of their books.`;

      const response = await ai.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            biography: { type: "string" }
          }
        }
      });

      setProfile(prev => ({ ...prev, biography: response.biography }));
    } catch (error) {
      console.error("Error generating bio:", error);
    }
    setGeneratingBio(false);
  };

  const tiers = [
    { 
      id: "starter", 
      name: "Starter", 
      price: "$19", 
      features: ["3 Books", "Basic AI Tools", "Email Support"] 
    },
    { 
      id: "professional", 
      name: "Professional", 
      price: "$49", 
      features: ["10 Books", "Advanced AI", "Priority Support", "Video Commercials"],
      popular: true
    },
    { 
      id: "enterprise", 
      name: "Enterprise", 
      price: "$99", 
      features: ["Unlimited Books", "All AI Features", "Dedicated Support", "Team Collaboration"]
    },
    { 
      id: "white_label", 
      name: "White Label", 
      price: "$299", 
      features: ["Everything in Enterprise", "Custom Branding", "API Access", "White Label Website"]
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Settings</h1>
        <p className="text-white/50 mt-1">Manage your account and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger value="profile" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="pib" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <FileText className="w-4 h-4 mr-2" />
            PIB Questionnaire
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <Palette className="w-4 h-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="website" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <Sparkles className="w-4 h-4 mr-2" />
            Website
          </TabsTrigger>
          {user?.subscription_tier === "white_label" && (
            <TabsTrigger value="branding" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              <Palette className="w-4 h-4 mr-2" />
              Branding
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Author Profile */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Author Profile</CardTitle>
              <CardDescription className="text-white/50">
                Your author information for book back covers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo Upload */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden flex-shrink-0">
                  {profile.author_photo_url ? (
                    <img src={profile.author_photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white/30" />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="photo" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                      <Upload className="w-4 h-4 text-white" />
                      <span className="text-white">Upload Photo</span>
                    </div>
                  </Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-white/40 mt-2">For book back covers • Recommended: 400x400px, JPG or PNG</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70">First Name</Label>
                  <Input
                    value={profile.first_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Your first name"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
                <div>
                  <Label className="text-white/70">Last Name</Label>
                  <Input
                    value={profile.last_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Your last name"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white/70 mb-2 block">Email</Label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="bg-white/5 border-white/20 text-white/50"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-white/70">Author Biography</Label>
                  <AIGenerateButton
                    onClick={generateBio}
                    loading={generatingBio}
                    label="Generate Bio"
                    size="sm"
                  />
                </div>
                <p className="text-xs text-white/40 mb-2">This will appear on the back cover of your books</p>
                <Textarea
                  value={profile.biography}
                  onChange={(e) => setProfile(prev => ({ ...prev, biography: e.target.value }))}
                  placeholder="Tell readers about yourself as an author..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Social Media</CardTitle>
              <CardDescription className="text-white/50">
                Your social profiles for book websites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <div key={platform.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      {platform.icon ? (
                        <platform.icon className="w-5 h-5 text-white/60" />
                      ) : (
                        <span className="text-sm text-white/60">{platform.name.charAt(0)}</span>
                      )}
                    </div>
                    <Input
                      value={profile.social_media?.[platform.id] || ""}
                      onChange={(e) => updateSocialLink(platform.id, e.target.value)}
                      placeholder={`${platform.name} URL`}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email Subscriptions */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                Email Subscriptions
              </CardTitle>
              <CardDescription className="text-white/50">
                Choose which reports, updates, and information you'd like to receive via email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailPreferences
                preferences={profile.email_preferences}
                onChange={updateEmailPreference}
              />
            </CardContent>
          </Card>

          <Button
            onClick={saveProfile}
            disabled={saving}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </TabsContent>

        {/* PIB Tab */}
        <TabsContent value="pib" className="space-y-6">
          <PIBQuestionnaire user={user} />
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          {/* Current Plan */}
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/30">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50">Current Plan</p>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="text-2xl font-bold text-white capitalize">
                      {user?.subscription_tier || "Trial"}
                    </h3>
                    {user?.subscription_tier === "trial" && (
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                        7 days remaining
                      </Badge>
                    )}
                  </div>
                </div>
                <Crown className="w-10 h-10 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          {/* Pricing Plans */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <Card 
                key={tier.id}
                className={`relative overflow-hidden ${
                  tier.popular 
                    ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/50' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-medium text-white rounded-bl-lg">
                    Popular
                  </div>
                )}
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-white">{tier.price}</span>
                    <span className="text-white/50">/month</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-white/70">
                        <Check className="w-4 h-4 text-emerald-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-6 ${
                      tier.popular
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0'
                        : 'bg-white/10 hover:bg-white/20 text-white border-0'
                    }`}
                    disabled={user?.subscription_tier === tier.id}
                  >
                    {user?.subscription_tier === tier.id ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Methods */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5 mr-2" />
                  Apple Pay
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Google Pay
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Credit Card
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <HeroImageManager />
        </TabsContent>

        {/* Website Tab */}
        <TabsContent value="website" className="space-y-6">
          <WebsiteBranding 
            user={user} 
            onUpdate={() => {
              queryClient.invalidateQueries({ queryKey: ['user'] });
              // Force a full page reload to update the logo everywhere
              window.location.reload();
            }} 
          />
        </TabsContent>

        {/* White Label Branding Tab */}
        {user?.subscription_tier === "white_label" && (
          <TabsContent value="branding" className="space-y-6">
            <WhiteLabelBranding user={user} onUpdate={() => queryClient.invalidateQueries({ queryKey: ['user'] })} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}