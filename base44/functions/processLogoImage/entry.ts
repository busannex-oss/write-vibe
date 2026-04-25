import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Process logo images using LLM:
 * - Analyze logo composition
 * - Provide cropping instructions
 * - Recommend transparent background placement
 * - Return optimized logo data
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { logo_url } = await req.json();

    if (!logo_url) {
      return Response.json({ error: 'logo_url required' }, { status: 400 });
    }

    // Use LLM to analyze logo and provide optimization guidance
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a logo design expert. Analyze this logo image and provide detailed processing instructions.

For the logo at: ${logo_url}

Analyze and respond with JSON containing:
1. dominant_colors: array of hex colors in the logo
2. background_type: "transparent", "solid", "gradient", or "complex"
3. cropping_suggestion: "tight" (minimize whitespace), "standard" (normal padding), or "minimal" (very close crop)
4. recommended_padding: number of pixels for transparent padding around logo
5. optimal_formats: array of recommended use cases (e.g., ["web", "print", "favicon"])
6. quality_issues: array of any issues found (empty if good)
7. processing_steps: array of suggested steps to optimize for transparent background
8. target_canvas_size: suggested size for final logo (e.g., "256x256", "512x512")

Focus on making the logo work well with transparent backgrounds for web and print use.`,
      response_json_schema: {
        type: 'object',
        properties: {
          dominant_colors: { type: 'array', items: { type: 'string' } },
          background_type: { type: 'string' },
          cropping_suggestion: { type: 'string' },
          recommended_padding: { type: 'number' },
          optimal_formats: { type: 'array', items: { type: 'string' } },
          quality_issues: { type: 'array', items: { type: 'string' } },
          processing_steps: { type: 'array', items: { type: 'string' } },
          target_canvas_size: { type: 'string' }
        }
      },
      file_urls: [logo_url],
      model: 'gemini_3_flash'
    });

    return Response.json({
      success: true,
      logo_analysis: analysis,
      optimization_guide: {
        crop_level: analysis.cropping_suggestion,
        padding_px: analysis.recommended_padding,
        final_size: analysis.target_canvas_size,
        use_cases: analysis.optimal_formats,
        steps_summary: analysis.processing_steps,
        colors: analysis.dominant_colors
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});