import { createFileRoute } from "@tanstack/react-router";

// Auto-scaffolded from base44/emails/MemberTip3.html.
// Edit this file to customize the page; content sync will refresh data.
export const Route = createFileRoute("/membertip3")({
  head: () => ({
    meta: [
      { title: "Membertip3" },
      { name: "description", content: "Membertip3 — synced from repository content." },
      { property: "og:title", content: "Membertip3" },
      { property: "og:description", content: "Membertip3 — synced from repository content." },
    ],
  }),
  component: Membertip3Page,
});

export function Membertip3Page() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Membertip3</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Content for this page is sourced from <code>base44/emails/MemberTip3.html</code> in the repository.
      </p>
    </main>
  );
}
