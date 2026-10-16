import { createFileRoute } from "@tanstack/react-router";

// Auto-scaffolded from base44/emails/LeadFollowUp2.html.
// Edit this file to customize the page; content sync will refresh data.
export const Route = createFileRoute("/leadfollowup2")({
  head: () => ({
    meta: [
      { title: "Leadfollowup2" },
      { name: "description", content: "Leadfollowup2 — synced from repository content." },
      { property: "og:title", content: "Leadfollowup2" },
      { property: "og:description", content: "Leadfollowup2 — synced from repository content." },
    ],
  }),
  component: Leadfollowup2Page,
});

export function Leadfollowup2Page() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Leadfollowup2</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Content for this page is sourced from <code>base44/emails/LeadFollowUp2.html</code> in the repository.
      </p>
    </main>
  );
}
