# MCP Integration Guide

## Overview
WriteVibe now uses the Model Context Protocol (MCP) to provide standardized access to backend resources, entities, and functions. This enables agents, automations, and external clients to interact with the platform consistently.

## MCP Server

**Location:** `functions/mcp-server.js`

The MCP server exposes:
- **Resources:** Book, Document, AgentComment entities
- **Tools:** CRUD operations, function invocation
- **Protocol:** JSON-RPC over HTTP

## Using MCP in Frontend Code

### Quick Start

```javascript
import { mcpClient } from '@/lib/mcp-client';

// Get all books
const books = await mcpClient.getBooks();

// Get a specific book
const book = await mcpClient.getBook(bookId);

// Create a book
const newBook = await mcpClient.createBook({
  title: 'My New Book',
  category: 'fiction',
  status: 'draft'
});

// Update a book
await mcpClient.updateBook(bookId, {
  status: 'writing',
  subtitle: 'Updated subtitle'
});

// Create a document
await mcpClient.createDocument({
  book_id: bookId,
  type: 'press_release',
  title: 'Press Release',
  content: 'Content here'
});

// Invoke a backend function via MCP
const result = await mcpClient.invokeFunction('generateBookTrailer', {
  book_id: bookId,
  duration: 60
});
```

### Available Tools

- `book_list` - List all books
- `book_get` - Get a book by ID
- `book_create` - Create a new book
- `book_update` - Update a book
- `document_list` - List documents for a book
- `document_create` - Create a document
- `invoke_function` - Call any backend function

## Using MCP in Agent Configs

Agents now declare `tool_configs` and `backend_function_tools` for MCP access:

```json
{
  "description": "My Agent",
  "instructions": "...",
  "tool_configs": [
    {
      "entity_name": "Book",
      "allowed_operations": ["read", "update", "create"]
    },
    {
      "entity_name": "Document",
      "allowed_operations": ["read", "create"]
    }
  ],
  "backend_function_tools": [
    {
      "name": "generateBookTrailer",
      "description": "Generate a book trailer"
    }
  ]
}
```

## Using MCP in Automations

Automations can use MCP tools to access entities:

```javascript
// In a backend function triggered by an automation
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { data: { book_id } } = await req.json();
  
  // Use MCP via SDK
  const book = await base44.entities.Book.get(book_id);
  // ... process book data
});
```

## MCP Protocol Details

### Methods

- `resources/list` - List available resources
- `resources/read` - Read a resource by URI
- `tools/list` - List available tools
- `tools/call` - Call a tool with arguments

### Resource URIs

- `book://list` - All books
- `document://list` - All documents
- `agentcomment://list` - All agent comments

## Best Practices

1. **Use MCP Client Helpers** - Use `mcpClient.getBooks()` instead of `callTool('book_list')`
2. **Error Handling** - Always wrap MCP calls in try/catch
3. **Authorization** - MCP validates user auth automatically
4. **Consistency** - Prefer MCP over direct SDK calls for standardization
5. **Caching** - Consider caching MCP results in components

## Migration Guide

### From Direct SDK to MCP

**Before:**
```javascript
const books = await base44.entities.Book.list();
```

**After:**
```javascript
const books = await mcpClient.getBooks();
```

## Extending MCP

To add new resources or tools:

1. Add method handling in `functions/mcp-server.js`
2. Add helper in `lib/mcp-client.js`
3. Update agent configs to use new tools
4. Document in this file