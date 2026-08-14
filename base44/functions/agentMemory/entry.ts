import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Agent Memory Store & Retrieval
 * 
 * Actions:
 *  - write:  Store a new memory for an agent
 *  - recall: Semantic search over memories for a given agent + query
 *  - list:   List all memories (optionally filtered by agent_name)
 *  - archive: Soft-delete a memory
 *  - clear:  Archive all memories for a specific agent
 *  - stats:  Return memory stats per agent
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Auth: admins get full access; any authenticated user can read/write memories; unauthenticated blocked
        let user = null;
        try { user = await base44.auth.me(); } catch (_) {}
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const { action } = body;

        // ── WRITE: Store a new memory ────────────────────────────────────────────
        if (action === 'write') {
            const { agent_name, memory_type, content, related_entity_id, related_entity_type, importance, session_id, tags } = body;

            if (!agent_name || !content) {
                return Response.json({ error: 'agent_name and content are required' }, { status: 400 });
            }

            // Extract semantic keywords via LLM for pseudo-vector search
            let embedding_keywords = [];
            try {
                const kwResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
                    prompt: `Extract 8-12 concise semantic keywords from this text that best represent its meaning for future retrieval. Return only a JSON array of lowercase strings, no explanations.\n\nText: "${content}"`,
                    response_json_schema: {
                        type: "object",
                        properties: { keywords: { type: "array", items: { type: "string" } } }
                    }
                });
                embedding_keywords = kwResult?.keywords || [];
            } catch (_) {
                // Fallback: simple word extraction
                embedding_keywords = content.toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')
                    .split(/\s+/)
                    .filter(w => w.length > 4)
                    .slice(0, 12);
            }

            const memory = await base44.asServiceRole.entities.AgentMemory.create({
                agent_name,
                memory_type: memory_type || 'observation',
                content,
                embedding_keywords,
                related_entity_id: related_entity_id || null,
                related_entity_type: related_entity_type || null,
                importance: importance || 'medium',
                recalled_count: 0,
                session_id: session_id || new Date().toISOString().slice(0, 10),
                tags: tags || [],
                is_archived: false
            });

            return Response.json({ success: true, memory });
        }

        // ── RECALL: Semantic search for relevant memories ────────────────────────
        if (action === 'recall') {
            const { agent_name, query, limit = 10 } = body;

            if (!agent_name || !query) {
                return Response.json({ error: 'agent_name and query are required' }, { status: 400 });
            }

            // Fetch all non-archived memories for this agent
            const allMemories = await base44.asServiceRole.entities.AgentMemory.filter({
                agent_name,
                is_archived: false
            }, '-created_date', 500);

            // Extract query keywords
            let queryKeywords = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);

            // Score each memory by keyword overlap (pseudo-vector similarity)
            const scored = allMemories.map(mem => {
                const memKeywords = mem.embedding_keywords || [];
                const contentWords = mem.content.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
                const allWords = [...new Set([...memKeywords, ...contentWords])];
                const overlap = queryKeywords.filter(qk => allWords.some(w => w.includes(qk) || qk.includes(w))).length;
                const score = overlap / Math.max(queryKeywords.length, 1);
                // Boost by importance
                const importanceBoost = { critical: 0.3, high: 0.2, medium: 0.1, low: 0 }[mem.importance] || 0;
                return { ...mem, _score: score + importanceBoost };
            });

            // Sort by score, return top N
            const results = scored
                .filter(m => m._score > 0)
                .sort((a, b) => b._score - a._score)
                .slice(0, limit);

            // Increment recalled_count for returned memories
            const updatePromises = results.map(m =>
                base44.asServiceRole.entities.AgentMemory.update(m.id, { recalled_count: (m.recalled_count || 0) + 1 })
            );
            await Promise.allSettled(updatePromises);

            return Response.json({ success: true, results, total_searched: allMemories.length });
        }

        // ── LIST: Get memories with optional filters ─────────────────────────────
        if (action === 'list') {
            const { agent_name, memory_type, importance, include_archived = false, page = 1, per_page = 50 } = body;

            const filter = { is_archived: include_archived ? undefined : false };
            if (agent_name) filter.agent_name = agent_name;
            if (memory_type) filter.memory_type = memory_type;
            if (importance) filter.importance = importance;

            // Remove undefined keys
            Object.keys(filter).forEach(k => filter[k] === undefined && delete filter[k]);

            const memories = await base44.asServiceRole.entities.AgentMemory.filter(
                filter, '-created_date', per_page * page
            );

            const paginated = memories.slice((page - 1) * per_page, page * per_page);
            return Response.json({ success: true, memories: paginated, total: memories.length });
        }

        // ── STATS: Memory stats per agent ────────────────────────────────────────
        if (action === 'stats') {
            const all = await base44.asServiceRole.entities.AgentMemory.filter({ is_archived: false }, '-created_date', 1000);

            const stats = {};
            for (const mem of all) {
                if (!stats[mem.agent_name]) {
                    stats[mem.agent_name] = { total: 0, by_type: {}, by_importance: {}, most_recalled: null };
                }
                const s = stats[mem.agent_name];
                s.total++;
                s.by_type[mem.memory_type] = (s.by_type[mem.memory_type] || 0) + 1;
                s.by_importance[mem.importance] = (s.by_importance[mem.importance] || 0) + 1;
                if (!s.most_recalled || mem.recalled_count > s.most_recalled.recalled_count) {
                    s.most_recalled = { content: mem.content.slice(0, 100), recalled_count: mem.recalled_count };
                }
            }

            return Response.json({ success: true, stats, total_memories: all.length });
        }

        // ── ARCHIVE: Soft-delete a memory ────────────────────────────────────────
        if (action === 'archive') {
            if (user.role !== 'admin') {
                return Response.json({ error: 'Forbidden: admin role required' }, { status: 403 });
            }
            const { memory_id } = body;
            if (!memory_id) return Response.json({ error: 'memory_id required' }, { status: 400 });
            await base44.asServiceRole.entities.AgentMemory.update(memory_id, { is_archived: true });
            return Response.json({ success: true });
        }

        // ── CLEAR: Archive all memories for an agent ─────────────────────────────
        if (action === 'clear') {
            if (user.role !== 'admin') {
                return Response.json({ error: 'Forbidden: admin role required' }, { status: 403 });
            }
            const { agent_name } = body;
            if (!agent_name) return Response.json({ error: 'agent_name required' }, { status: 400 });
            const mems = await base44.asServiceRole.entities.AgentMemory.filter({ agent_name, is_archived: false });
            await Promise.all(mems.map(m => base44.asServiceRole.entities.AgentMemory.update(m.id, { is_archived: true })));
            return Response.json({ success: true, archived: mems.length });
        }

        return Response.json({ error: 'Invalid action. Use: write, recall, list, stats, archive, clear' }, { status: 400 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});