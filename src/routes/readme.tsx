import { createFileRoute } from "@tanstack/react-router";

// Auto-scaffolded from README.md.
// Edit this file to customize the page; content sync will refresh data.
export const Route = createFileRoute("/readme")({
  head: () => ({
    meta: [
      { title: "Readme" },
      { name: "description", content: "Readme — synced from repository content." },
      { property: "og:title", content: "Readme" },
      { property: "og:description", content: "Readme — synced from repository content." },
    ],
  }),
  component: ReadmePage,
});

export function ReadmePage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Readme</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Content for this page is sourced from <code>README.md</code> in the repository.
      </p>
    </main>
  );
}
