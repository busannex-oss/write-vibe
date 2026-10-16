import { createFileRoute } from "@tanstack/react-router";

// Auto-scaffolded from base44/emails/NewPostDigest.html.
// Edit this file to customize the page; content sync will refresh data.
export const Route = createFileRoute("/newpostdigest")({
  head: () => ({
    meta: [
      { title: "Newpostdigest" },
      { name: "description", content: "Newpostdigest — synced from repository content." },
      { property: "og:title", content: "Newpostdigest" },
      { property: "og:description", content: "Newpostdigest — synced from repository content." },
    ],
  }),
  component: NewpostdigestPage,
});

export function NewpostdigestPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Newpostdigest</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Content for this page is sourced from <code>base44/emails/NewPostDigest.html</code> in the repository.
      </p>
    </main>
  );
}
