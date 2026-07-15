import { base44 } from '@/api/base44Client';

/**
 * Adaptable MCP Client for WriteVibe
 * Provides standardized access to the MCP server:
 * - Generic entity CRUD across all allowlisted entities
 * - Dynamic backend function invocation
 * - Cloudflare resource tools (zones, DNS, Workers, KV, R2)
 * - LLM model registry + unified invoke (all available models)
 */

export const mcpClient = {
  // ---- Protocol primitives ----
  async _call(method, params) {
    const response = await base44.functions.invoke('mcp-server', { method, params });
    return response.data;
  },

  async listResources() {
    return (await this._call('resources/list')).resources;
  },

  async listTools() {
    return (await this._call('tools/list')).tools;
  },

  async callTool(toolName, args = {}) {
    const data = await this._call('tools/call', { name: toolName, arguments: args });
    if (data.error) throw new Error(data.error.message || data.error.code);
    return data.result;
  },

  async readResource(uri) {
    return (await this._call('resources/read', { uri })).contents;
  },

  async ping() {
    return this._call('ping');
  },

  // ---- Adaptable entity CRUD (works for any allowlisted entity) ----
  async listEntities(entityName, opts = {}) {
    return this.callTool(`${entityName.toLowerCase()}_list`, opts);
  },

  async getEntity(entityName, id) {
    return this.callTool(`${entityName.toLowerCase()}_get`, { id });
  },

  async createEntity(entityName, data) {
    return this.callTool(`${entityName.toLowerCase()}_create`, { data });
  },

  async updateEntity(entityName, id, data) {
    return this.callTool(`${entityName.toLowerCase()}_update`, { id, data });
  },

  async deleteEntity(entityName, id) {
    return this.callTool(`${entityName.toLowerCase()}_delete`, { id });
  },

  // ---- Function invocation ----
  async listFunctions() {
    return this.callTool('functions_list');
  },

  async invokeFunction(functionName, params = {}) {
    return this.callTool('invoke_function', { function_name: functionName, params });
  },

  // ---- LLM tools ----
  async listLLMModels() {
    return this.callTool('llm_models_list');
  },

  async invokeLLM({ prompt, model, add_context_from_internet, response_json_schema, file_urls }) {
    return this.callTool('llm_invoke', { prompt, model, add_context_from_internet, response_json_schema, file_urls });
  },

  // ---- Cloudflare tools (admin only; pass api_token + account_id per call) ----
  async cfListZones(apiToken) {
    return this.callTool('cf_zones_list', { api_token: apiToken });
  },

  async cfListDNSRecords(apiToken, zoneId) {
    return this.callTool('cf_dns_records_list', { api_token: apiToken, zone_id: zoneId });
  },

  async cfListWorkers(apiToken, accountId) {
    return this.callTool('cf_workers_list', { api_token: apiToken, account_id: accountId });
  },

  async cfListKVNamespaces(apiToken, accountId) {
    return this.callTool('cf_kv_namespaces_list', { api_token: apiToken, account_id: accountId });
  },

  async cfListR2Buckets(apiToken, accountId) {
    return this.callTool('cf_r2_buckets_list', { api_token: apiToken, account_id: accountId });
  },

  // ---- Legacy convenience helpers (preserved for backward compat) ----
  async getBooks(limit = 50) { return this.listEntities('Book', { limit }); },
  async getBook(bookId) { return this.getEntity('Book', bookId); },
  async createBook(data) { return this.createEntity('Book', data); },
  async updateBook(bookId, data) { return this.updateEntity('Book', bookId, data); },
  async getDocuments(bookId) { return this.listEntities('Document', { filter: { book_id: bookId } }); },
  async createDocument(data) { return this.createEntity('Document', data); }
};