import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, BookOpen, Users, Award } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">About AuthorForge</h1>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Empowering authors worldwide with AI-powered tools to bring their stories to life
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-slate-800/50 border-white/10">
            <CardContent className="p-8">
              <BookOpen className="w-12 h-12 text-amber-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-white/60">
                To democratize book publishing by providing cutting-edge AI tools that help authors 
                create, design, and publish professional-quality books without the traditional barriers.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-white/10">
            <CardContent className="p-8">
              <Sparkles className="w-12 h-12 text-amber-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-white/60">
                A world where every story gets told, where technology empowers creativity, 
                and where authors have complete control over their publishing journey.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Why Choose AuthorForge?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Award, title: "Professional Quality", desc: "Industry-standard tools and AI assistance" },
              { icon: Users, title: "Community Driven", desc: "Built by authors, for authors" },
              { icon: Sparkles, title: "Innovation First", desc: "Cutting-edge AI technology" }
            ].map((item, idx) => (
              <Card key={idx} className="bg-slate-800/30 border-white/10">
                <CardContent className="p-6 text-center">
                  <item.icon className="w-10 h-10 text-amber-400 mx-auto mb-4" />
                  <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-white/60">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to={createPageUrl("Landing")}>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}