import { createFileRoute } from "@tanstack/react-router";

// Auto-scaffolded from index.html.
// Edit this file to customize the page; content sync will refresh data.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Index" },
      { name: "description", content: "Index — synced from repository content." },
      { property: "og:title", content: "Index" },
      { property: "og:description", content: "Index — synced from repository content." },
    ],
  }),
  component: IndexPage,
});

export function IndexPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Index</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Content for this page is sourced from <code>index.html</code> in the repository.
      </p>
    </main>
  );
}
