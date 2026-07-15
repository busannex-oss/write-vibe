# MCP Integration Guide

## Overview
WriteVibe's MCP server provides standardized, adaptable access to backend entities, functions, Cloudflare resources, and LLMs. It is secure (auth on all, admin-only for sensitive ops), resilient (timeouts, sanitized errors, graceful degradation), and adaptable (extend by adding names to the allowlists).

## MCP Server
**Location:** `base44/functions/mcp-server/entry.ts`

### Capabilities
- **Adaptable entity CRUD** — generic list/get/create/update/delete tools auto-generated for every entity in `ENTITY_ALLOWLIST`. Add an entity name to expose it.
- **Dynamic function invocation** — call any backend function in `FUNCTION_ALLOWLIST` (admin only).
- **Cloudflare MCP** — list zones, DNS records, Workers, KV namespaces, R2 buckets (admin only; credentials passed per call).
- **LLM registry** — all available InvokeLLM models exposed via `llm_models_list`, unified `llm_invoke` tool with model selection + web search + vision + structured JSON output.
- **Protocol** — JSON-RPC over HTTP: `resources/list`, `resources/read`, `tools/list`, `tools/call`, `ping`.

## Using MCP in Frontend Code

```javascript
import { mcpClient } from '@/lib/mcp-client';

// Health check
await mcpClient.ping();

// Adaptable entity CRUD (works for any allowlisted entity)
const books = await mcpClient.listEntities('Book', { limit: 20 });
const book = await mcpClient.getEntity('Book', bookId);
await mcpClient.createEntity('Book', { title: 'New Book' });
await mcpClient.updateEntity('Book', bookId, { status: 'writing' });
await mcpClient.deleteEntity('Book', bookId);

// List available entities / functions
const entities = await mcpClient.listEntities; // see entities_list tool
await mcpClient.listFunctions();

// Invoke a backend function (admin only)
const result = await mcpClient.invokeFunction('generateBookTrailer', { book_id: bookId });

// LLM models + unified invoke
const models = await mcpClient.listLLMModels();
const answer = await mcpClient.invokeLLM({
  prompt: 'Summarize this chapter',
  model: 'claude_sonnet_4_6',
  response_json_schema: { type: 'object', properties: { summary: { type: 'string' } } }
});
// Web search (only with web_search-capable models: gemini_3_flash, gemini_3_1_pro)
const research = await mcpClient.invokeLLM({
  prompt: 'Latest trends in self-publishing',
  model: 'gemini_3_flash',
  add_context_from_internet: true
});

// Cloudflare (admin only; pass your API token + account ID per call)
const zones = await mcpClient.cfListZones('your-cf-token');
const dns = await mcpClient.cfListDNSRecords('your-cf-token', zoneId);
const workers = await mcpClient.cfListWorkers('your-cf-token', 'your-account-id');
const kv = await mcpClient.cfListKVNamespaces('your-cf-token', 'your-account-id');
const r2 = await mcpClient.cfListR2Buckets('your-cf-token', 'your-account-id');
```

## Security
- All MCP methods require authenticated user.
- `invoke_function` and all `cf_*` tools require admin role.
- Entity names and function names validated against allowlists.
- Request body capped at 1MB.
- Errors are sanitized (stable error codes, no internal leakage).

## Resilience
- External (Cloudflare) calls use a 15s timeout via AbortController.
- Missing Cloudflare credentials return a clear `CF_NOT_CONFIGURED` error instead of crashing.
- All errors return structured `{ error: { code, message } }` with appropriate HTTP status.

## Extending MCP
- **New entity:** add its name to `ENTITY_ALLOWLIST` — CRUD tools generate automatically.
- **New function:** add its name to `FUNCTION_ALLOWLIST` — invocable via `invoke_function`.
- **New LLM model:** add to `LLM_MODELS` array with `web_search`/`vision` flags.

## Available LLM Models
| Model | Web Search | Vision |
|-------|-----------|--------|
| automatic | ✗ | ✓ |
| gpt_5_mini | ✗ | ✓ |
| gemini_3_flash | ✓ | ✓ |
| gpt_5_4 | ✗ | ✓ |
| gpt_5_5 | ✗ | ✓ |
| gemini_3_1_pro | ✓ | ✓ |
| claude_sonnet_4_6 | ✗ | ✓ |
| claude_opus_4_6 | ✗ | ✓ |
| claude_opus_4_7 | ✗ | ✓ |
| claude_opus_4_8 | ✗ | ✓ |
| claude-sonnet-5 | ✗ | ✓ |