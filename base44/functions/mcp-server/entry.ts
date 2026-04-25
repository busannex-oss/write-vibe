import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * MCP Server for WriteVibe
 * Exposes Base44 entities and functions as MCP resources and tools
 * Used by agents and external clients for standardized data access
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { method, params } = body;

    // MCP Protocol: List available resources
    if (method === 'resources/list') {
      return Response.json({
        resources: [
          {
            uri: 'book://list',
            name: 'Books',
            description: 'List all books for the user',
            mimeType: 'application/json'
          },
          {
            uri: 'book://create',
            name: 'Create Book',
            description: 'Create a new book',
            mimeType: 'application/json'
          },
          {
            uri: 'document://list',
            name: 'Documents',
            description: 'List all documents',
            mimeType: 'application/json'
          },
          {
            uri: 'agentcomment://list',
            name: 'Agent Comments',
            description: 'List all agent comments',
            mimeType: 'application/json'
          }
        ]
      });
    }

    // MCP Protocol: List available tools
    if (method === 'tools/list') {
      return Response.json({
        tools: [
          {
            name: 'book_list',
            description: 'Retrieve all books for the current user',
            inputSchema: {
              type: 'object',
              properties: {
                limit: { type: 'number', description: 'Max results (default 50)' },
                offset: { type: 'number', description: 'Skip N results (default 0)' }
              }
            }
          },
          {
            name: 'book_get',
            description: 'Get a specific book by ID',
            inputSchema: {
              type: 'object',
              properties: {
                book_id: { type: 'string', description: 'Book ID' }
              },
              required: ['book_id']
            }
          },
          {
            name: 'book_create',
            description: 'Create a new book',
            inputSchema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                category: { type: 'string' },
                status: { type: 'string', enum: ['draft', 'outline', 'writing', 'editing', 'cover_design', 'marketing', 'published'] }
              },
              required: ['title']
            }
          },
          {
            name: 'book_update',
            description: 'Update a book',
            inputSchema: {
              type: 'object',
              properties: {
                book_id: { type: 'string' },
                data: { type: 'object', description: 'Fields to update' }
              },
              required: ['book_id', 'data']
            }
          },
          {
            name: 'document_list',
            description: 'List documents for a book',
            inputSchema: {
              type: 'object',
              properties: {
                book_id: { type: 'string' }
              },
              required: ['book_id']
            }
          },
          {
            name: 'document_create',
            description: 'Create a new document',
            inputSchema: {
              type: 'object',
              properties: {
                book_id: { type: 'string' },
                type: { type: 'string', enum: ['publisher_letter', 'press_release', 'social_image', 'promotional_material', 'white_paper'] },
                title: { type: 'string' },
                content: { type: 'string' }
              },
              required: ['book_id', 'type', 'title']
            }
          },
          {
            name: 'invoke_function',
            description: 'Call a backend function',
            inputSchema: {
              type: 'object',
              properties: {
                function_name: { type: 'string' },
                params: { type: 'object', description: 'Function parameters' }
              },
              required: ['function_name']
            }
          }
        ]
      });
    }

    // MCP Protocol: Call a tool
    if (method === 'tools/call') {
      const { name, arguments: args } = params;

      if (name === 'book_list') {
        const books = await base44.entities.Book.list();
        return Response.json({ result: books });
      }

      if (name === 'book_get') {
        const book = await base44.entities.Book.get(args.book_id);
        return Response.json({ result: book });
      }

      if (name === 'book_create') {
        const book = await base44.entities.Book.create(args);
        return Response.json({ result: book });
      }

      if (name === 'book_update') {
        const updated = await base44.entities.Book.update(args.book_id, args.data);
        return Response.json({ result: updated });
      }

      if (name === 'document_list') {
        const docs = await base44.entities.Document.filter({ book_id: args.book_id });
        return Response.json({ result: docs });
      }

      if (name === 'document_create') {
        const doc = await base44.entities.Document.create(args);
        return Response.json({ result: doc });
      }

      if (name === 'invoke_function') {
        const result = await base44.asServiceRole.functions.invoke(args.function_name, args.params || {});
        return Response.json({ result });
      }

      return Response.json({ error: 'Unknown tool' }, { status: 400 });
    }

    // MCP Protocol: Read resource
    if (method === 'resources/read') {
      const { uri } = params;

      if (uri === 'book://list') {
        const books = await base44.entities.Book.list();
        return Response.json({ contents: books });
      }

      if (uri === 'document://list') {
        const docs = await base44.entities.Document.list();
        return Response.json({ contents: docs });
      }

      if (uri === 'agentcomment://list') {
        const comments = await base44.entities.AgentComment.list();
        return Response.json({ contents: comments });
      }

      return Response.json({ error: 'Unknown resource' }, { status: 404 });
    }

    return Response.json({ error: 'Unknown method' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});