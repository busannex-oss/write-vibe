import { createFileRoute } from "@tanstack/react-router";

// Auto-scaffolded from base44/emails/MemberTip1.html.
// Edit this file to customize the page; content sync will refresh data.
export const Route = createFileRoute("/membertip1")({
  head: () => ({
    meta: [
      { title: "Membertip1" },
      { name: "description", content: "Membertip1 — synced from repository content." },
      { property: "og:title", content: "Membertip1" },
      { property: "og:description", content: "Membertip1 — synced from repository content." },
    ],
  }),
  component: Membertip1Page,
});

export function Membertip1Page() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Membertip1</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Content for this page is sourced from <code>base44/emails/MemberTip1.html</code> in the repository.
      </p>
    </main>
  );
}
