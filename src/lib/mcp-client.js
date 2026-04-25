import { base44 } from '@/api/base44Client';

/**
 * MCP Client Utility
 * Provides standardized access to MCP server resources and tools
 */

const MCP_SERVER_URL = '/mcp-server';

export const mcpClient = {
  /**
   * List available MCP resources
   */
  async listResources() {
    const response = await base44.functions.invoke('mcp-server', {
      method: 'resources/list'
    });
    return response.data.resources;
  },

  /**
   * List available MCP tools
   */
  async listTools() {
    const response = await base44.functions.invoke('mcp-server', {
      method: 'tools/list'
    });
    return response.data.tools;
  },

  /**
   * Call an MCP tool
   * @param {string} toolName - Tool name
   * @param {object} args - Tool arguments
   */
  async callTool(toolName, args = {}) {
    const response = await base44.functions.invoke('mcp-server', {
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    });
    return response.data.result;
  },

  /**
   * Read an MCP resource
   * @param {string} uri - Resource URI
   */
  async readResource(uri) {
    const response = await base44.functions.invoke('mcp-server', {
      method: 'resources/read',
      params: { uri }
    });
    return response.data.contents;
  },

  /**
   * Helper: Get all books
   */
  async getBooks(limit = 50, offset = 0) {
    return this.callTool('book_list', { limit, offset });
  },

  /**
   * Helper: Get a book
   */
  async getBook(bookId) {
    return this.callTool('book_get', { book_id: bookId });
  },

  /**
   * Helper: Create a book
   */
  async createBook(data) {
    return this.callTool('book_create', data);
  },

  /**
   * Helper: Update a book
   */
  async updateBook(bookId, data) {
    return this.callTool('book_update', { book_id: bookId, data });
  },

  /**
   * Helper: List documents
   */
  async getDocuments(bookId) {
    return this.callTool('document_list', { book_id: bookId });
  },

  /**
   * Helper: Create a document
   */
  async createDocument(data) {
    return this.callTool('document_create', data);
  },

  /**
   * Helper: Invoke a backend function via MCP
   */
  async invokeFunction(functionName, params = {}) {
    return this.callTool('invoke_function', { function_name: functionName, params });
  }
};