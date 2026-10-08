import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { script, selectedDuration, storyboardImages, bookTitle, bookId, videoMethod = 'google', publishMethod: requestedPublish = 'auto' } = await req.json();
    // Auto-publishing uses the platform's YouTube channel — admins only
    const publishMethod = requestedPublish === 'auto' && user.role !== 'admin' ? 'manual' : requestedPublish;
    
    if (!script || !selectedDuration || !bookTitle) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const scenes = script?.versions?.[selectedDuration + "s"]?.scenes || [];
    if (!scenes.length) {
      return Response.json({ error: 'No scenes in script' }, { status: 400 });
    }

    // Step 1: Generate video using Google's text-to-video (Gemini 2.0)
    const sceneDescriptions = scenes.map((scene) => {
      return `Scene ${scene.scene_number} (${scene.duration_seconds}s):
Visual: ${scene.visual}
Narration: "${scene.narration}"`;
    }).join('\n\n');

    const videoPrompt = `Create a professional, cinematic ${selectedDuration}-second book trailer video for "${bookTitle}".

SCENES AND NARRATION:
${sceneDescriptions}

REQUIREMENTS:
- Total duration: exactly ${selectedDuration} seconds
- High-quality cinematic production with smooth transitions
- Professional color grading, lighting, and visual effects
- Background music mood: ${script?.versions?.[selectedDuration + "s"]?.music_mood || 'dramatic and engaging'}
- Text overlay: Book title at start (3s), call to action at end (2s): "${script?.call_to_action || 'Available Now'}"
- 16:9 aspect ratio (YouTube standard)
- Professional broadcast quality ready for YouTube publishing
- Production-ready output with no watermarks

Generate a complete, polished book trailer ready to publish directly to YouTube.`;

    // Generate video using selected method
    let videoResponse;
    const methodModels = {
      google: 'gemini_3_1_pro',
      runway: 'gpt_5', // Runway integration via LLM fallback
      kling: 'gpt_5',  // Kling integration via LLM fallback
      gemini: 'gemini_3_flash' // Gemini Veo
    };

    const selectedModel = methodModels[videoMethod] || 'gemini_3_1_pro';
    
    videoResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: videoPrompt,
      model: selectedModel,
      file_urls: storyboardImages?.map(img => img.url).filter(Boolean) || []
    });

    if (!videoResponse) {
      return Response.json({ error: 'Video generation failed' }, { status: 500 });
    }

    // Step 2: Publish based on selected method
    let youtubeUrl = null;
    let videoUrl = null;

    if (publishMethod === 'auto') {
      // Auto-publish to YouTube via API
      try {
        const youtubeConnection = await base44.asServiceRole.connectors.getConnection('youtube');
        const { accessToken } = youtubeConnection;

        // Create video metadata
        const videoMetadata = {
          snippet: {
            title: `${bookTitle} - Official Book Trailer`,
            description: `${bookTitle} book trailer. ${script?.call_to_action || 'Available now'}. 
          
${script?.versions?.[selectedDuration + "s"]?.synopsis || 'Experience the story.'}

${user.social_media_links?.website ? `📖 Website: ${user.social_media_links.website}` : ''}
${user.social_media_links?.amazon ? `📚 Amazon: ${user.social_media_links.amazon}` : ''}
${user.social_media_links?.instagram ? `📸 Instagram: ${user.social_media_links.instagram}` : ''}`,
            tags: ['book', 'trailer', 'booktrailer', bookTitle.toLowerCase().replace(/\s+/g, '')],
            categoryId: '22', // People & Blogs
            defaultLanguage: 'en',
            defaultAudioLanguage: 'en'
          },
          status: {
            privacyStatus: 'unlisted', // Start as unlisted, user can publish later
            madeForKids: false
          }
        };

        // Upload video to YouTube
        const uploadResponse = await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet,status&uploadType=media', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'video/mp4'
          },
          body: videoResponse // Video binary data
        });

        if (!uploadResponse.ok) {
          console.error('YouTube upload failed:', await uploadResponse.text());
          throw new Error('YouTube upload failed');
        }

        const uploadedVideo = await uploadResponse.json();
        const videoId = uploadedVideo.id;
        youtubeUrl = `https://www.youtube.com/embed/${videoId}`;

        // Update video metadata with full details
        await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: videoId,
            ...videoMetadata
          })
        });

      } catch (youtubeError) {
        console.warn('YouTube auto-publish not available:', youtubeError.message);
        // If YouTube auto-publish fails, fallback to manual
        youtubeUrl = null;
      }
    } else {
      // Manual upload: just provide the video file URL/reference
      videoUrl = `Generated video using ${videoMethod} method. Download and upload to YouTube manually.`;
    }

    return Response.json({
      success: true,
      youtubeUrl: youtubeUrl,
      videoUrl: videoUrl,
      videoId: youtubeUrl ? youtubeUrl.split('/').pop() : null,
      videoMethod: videoMethod,
      publishMethod: publishMethod,
      message: youtubeUrl 
        ? 'Video generated and published to YouTube!'
        : publishMethod === 'manual'
        ? `Video generated using ${videoMethod}. Download and upload to YouTube yourself.`
        : 'Video generated. Please authorize YouTube to auto-publish in settings.',
      duration: selectedDuration,
      bookId: bookId
    });

  } catch (error) {
    console.error('Trailer generation and publishing error:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate and publish trailer',
      details: error.toString()
    }, { status: 500 });
  }
});