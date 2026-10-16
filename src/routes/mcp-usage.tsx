import { createFileRoute } from "@tanstack/react-router";

// Auto-scaffolded from src/docs/MCP_USAGE.md.
// Edit this file to customize the page; content sync will refresh data.
export const Route = createFileRoute("/mcp-usage")({
  head: () => ({
    meta: [
      { title: "Mcp Usage" },
      { name: "description", content: "Mcp Usage — synced from repository content." },
      { property: "og:title", content: "Mcp Usage" },
      { property: "og:description", content: "Mcp Usage — synced from repository content." },
    ],
  }),
  component: McpUsagePage,
});

export function McpUsagePage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Mcp Usage</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Content for this page is sourced from <code>src/docs/MCP_USAGE.md</code> in the repository.
      </p>
    </main>
  );
}
