import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const AGENTS = [
  { name: "Preston Prime", title: "EXECUTIVE PROJECT MANAGER", age: 48 },
  { name: "Valerie Vance", title: "HUMAN RESOURCES MANAGER", age: 42 },
  { name: "Nova Sterling", title: "CHIEF AGENTIC ORCHESTRATOR", age: 35 },
  { name: "Atlas Thorne", title: "GEOSPATIAL INTELLIGENCE ANALYST", age: 38 },
  { name: "Echo Vance", title: "OMNISYNC SWITCHBOARD LEAD", age: 45 },
  { name: "Kaelen Vane", title: "INTEGRATION GATEWAY GUARDIAN", age: 32 },
  { name: "Sage Evergreen", title: "SYSTEM MAINTENANCE & MEMORY GUARDIAN", age: 51 },
  { name: "Lyra Core", title: "COGNITIVE CREATIVE ARCHITECT", age: 34 },
  { name: "Aria Vale", title: "EXECUTIVE ADMINISTRATIVE ASSISTANT", age: 36 },
  { name: "Pixel Prism", title: "BRAND IDENTITY ARCHITECT", age: 29 },
  { name: "Scribe Protocol", title: "EXECUTIVE PROTOCOL RECORDER", age: 47 }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user?.role === 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const portraits = [];

    for (const agent of AGENTS) {
      const prompt = `Create a highly realistic professional portrait photograph of a real person named ${agent.name}. 
Age: ${agent.age}. 
Title: ${agent.title}.
Style: Professional headshot, corporate style, cinematic lighting, detailed facial features, modern attire.
High quality, lifelike, as if for a corporate directory.
Focus on the face, clear professional appearance, slight smile, confidence, modern professional look.`;

      const result = await base44.integrations.Core.GenerateImage({ prompt });
      portraits.push({
        name: agent.name,
        title: agent.title,
        age: agent.age,
        image: result.url
      });
    }

    return Response.json({ portraits, success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});