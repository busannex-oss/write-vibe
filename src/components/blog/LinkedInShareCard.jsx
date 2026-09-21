import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Linkedin, Check, Loader2 } from "lucide-react";

const CONNECTOR_ID = "6ab0d2b6d40b8f5bf63e96da";

export default function LinkedInShareCard({ posts = [] }) {
  const [authed, setAuthed] = useState(false);
  const [connected, setConnected] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [sharingId, setSharingId] = useState(null);
  const [message, setMessage] = useState("");

  const checkConnection = async () => {
    try {
      const res = await base44.functions.invoke("shareBlogPostLinkedIn", {});
      setConnected(!!res.data?.connected);
      setProfileName(res.data?.profileName || "");
    } catch {
      setConnected(false);
    }
  };

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (ok) => {
      setAuthed(ok);
      if (ok) await checkConnection();
      setLoading(false);
    });
  }, []);

  const handleConnect = async () => {
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, "_blank");
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        checkConnection();
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    await base44.connectors.disconnectAppUser(CONNECTOR_ID);
    setConnected(false);
    setProfileName("");
  };

  const share = async (post) => {
    setSharingId(post.id);
    setMessage("");
    try {
      const articleUrl = `${window.location.origin}/BlogPost?slug=${encodeURIComponent(post.slug || post.id)}`;
      const res = await base44.functions.invoke("shareBlogPostLinkedIn", { postId: post.id, articleUrl });
      setMessage(res.data?.shared ? `Shared "${post.title}" to LinkedIn.` : "Share failed.");
    } catch (e) {
      setMessage(e?.response?.data?.error || "Share failed.");
    }
    setSharingId(null);
  };

  if (loading) return null;

  const published = posts.filter((p) => p.status === "published").slice(0, 5);

  return (
    <Card className="bg-white/5 border-white/10 mb-6">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0A66C2]/20 flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-[#0A66C2]" />
            </div>
            <div>
              <p className="text-white font-medium">LinkedIn</p>
              <p className="text-xs text-white/40">
                {connected ? `Connected${profileName ? ` as ${profileName}` : ""}` : "Share posts with your professional network"}
              </p>
            </div>
          </div>
          {!authed ? (
            <Button onClick={() => base44.auth.redirectToLogin()} variant="outline" className="border-white/20 text-white">
              Sign in
            </Button>
          ) : connected ? (
            <Button onClick={handleDisconnect} variant="ghost" className="text-white/50 hover:text-white">
              Disconnect
            </Button>
          ) : (
            <Button onClick={handleConnect} className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white border-0">
              Connect LinkedIn
            </Button>
          )}
        </div>

        {connected && published.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
            {published.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <p className="flex-1 min-w-0 truncate text-sm text-white/70">{p.title}</p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={sharingId === p.id}
                  onClick={() => share(p)}
                  className="border-white/20 text-white/80 hover:text-white"
                >
                  {sharingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Share"}
                </Button>
              </div>
            ))}
          </div>
        )}

        {message && (
          <p className="mt-3 text-xs text-amber-300 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}