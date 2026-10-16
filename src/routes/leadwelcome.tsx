import { createFileRoute } from "@tanstack/react-router";

// Auto-scaffolded from base44/emails/LeadWelcome.html.
// Edit this file to customize the page; content sync will refresh data.
export const Route = createFileRoute("/leadwelcome")({
  head: () => ({
    meta: [
      { title: "Leadwelcome" },
      { name: "description", content: "Leadwelcome — synced from repository content." },
      { property: "og:title", content: "Leadwelcome" },
      { property: "og:description", content: "Leadwelcome — synced from repository content." },
    ],
  }),
  component: LeadwelcomePage,
});

export function LeadwelcomePage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Leadwelcome</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Content for this page is sourced from <code>base44/emails/LeadWelcome.html</code> in the repository.
      </p>
    </main>
  );
}
