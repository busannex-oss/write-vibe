import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, MessageSquare, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      await base44.integrations.Core.SendEmail({
        to: "support@writevibe.ai",
        subject: `Contact Form: ${formData.name}`,
        body: `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      });

      setSent(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <Link to={createPageUrl("Landing")}>
          <Button variant="ghost" className="text-white/60 hover:text-white mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-xl text-white/60">
            Have questions? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-slate-800/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              {sent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                  <p className="text-white/60">We'll get back to you soon.</p>
                  <Button
                    onClick={() => setSent(false)}
                    variant="outline"
                    className="mt-4 border-white/10 text-white hover:bg-white/10"
                  >
                    Send Another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-slate-900/50 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-slate-900/50 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Your Message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={6}
                      className="bg-slate-900/50 border-white/10 text-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    {sending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-white/10">
              <CardContent className="p-6">
                <Mail className="w-8 h-8 text-amber-400 mb-4" />
                <h3 className="font-semibold text-white mb-2">Email Us</h3>
                <p className="text-white/60 text-sm">support@writevibe.ai</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-white/10">
              <CardContent className="p-6">
                <MessageSquare className="w-8 h-8 text-amber-400 mb-4" />
                <h3 className="font-semibold text-white mb-2">Live Chat</h3>
                <p className="text-white/60 text-sm">Available 9am-5pm EST</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}