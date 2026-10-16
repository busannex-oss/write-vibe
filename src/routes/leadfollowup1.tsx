import { createFileRoute } from "@tanstack/react-router";

// Auto-scaffolded from base44/emails/LeadFollowUp1.html.
// Edit this file to customize the page; content sync will refresh data.
export const Route = createFileRoute("/leadfollowup1")({
  head: () => ({
    meta: [
      { title: "Leadfollowup1" },
      { name: "description", content: "Leadfollowup1 — synced from repository content." },
      { property: "og:title", content: "Leadfollowup1" },
      { property: "og:description", content: "Leadfollowup1 — synced from repository content." },
    ],
  }),
  component: Leadfollowup1Page,
});

export function Leadfollowup1Page() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Leadfollowup1</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Content for this page is sourced from <code>base44/emails/LeadFollowUp1.html</code> in the repository.
      </p>
    </main>
  );
}
