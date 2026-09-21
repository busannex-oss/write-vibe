import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Check, Loader2 } from "lucide-react";

export default function NewsletterSignupForm({ headline = "Get new posts and book launches first", bookId }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setState("saving");
    try {
      const res = await base44.functions.invoke("subscribeNewsletter", { email, name, book_id: bookId });
      if (res.data?.error) throw new Error(res.data.error);
      setState("done");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
        <Check className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
        <p className="text-white font-medium">You're on the list.</p>
        <p className="text-sm text-white/50 mt-1">Watch your inbox for the next story.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="w-4 h-4 text-amber-400" />
        <p className="text-white font-semibold">{headline}</p>
      </div>
      <p className="text-sm text-white/50 mb-4">No spam — just new writing, launches and reader-only extras.</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" className="sm:max-w-[10rem]" />
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="flex-1" />
        <Button type="submit" disabled={state === "saving"} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
          {state === "saving" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
        </Button>
      </div>
      {error && <p className="text-xs text-red-300 mt-2">{error}</p>}
    </form>
  );
}