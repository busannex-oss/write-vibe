import { createFileRoute } from "@tanstack/react-router";

// Auto-scaffolded from public/offline.html.
// Edit this file to customize the page; content sync will refresh data.
export const Route = createFileRoute("/offline")({
  head: () => ({
    meta: [
      { title: "Offline" },
      { name: "description", content: "Offline — synced from repository content." },
      { property: "og:title", content: "Offline" },
      { property: "og:description", content: "Offline — synced from repository content." },
    ],
  }),
  component: OfflinePage,
});

export function OfflinePage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Offline</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Content for this page is sourced from <code>public/offline.html</code> in the repository.
      </p>
    </main>
  );
}
