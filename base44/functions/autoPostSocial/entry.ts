import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId, caption, imageUrl, platforms, scheduledDays } = await req.json();

    if (!caption || !platforms || platforms.length === 0) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const results = {};
    const errors = [];

    // Helper to determine posting times for scheduled days
    const getScheduledTimes = () => {
      const times = [];
      const now = new Date();
      
      if (!scheduledDays || scheduledDays.length === 0) {
        // Post immediately if no days specified
        return [now.toISOString()];
      }

      // Generate dates for next 2 weeks for each scheduled day
      for (let i = 0; i < 14; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() + i);
        const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
        
        if (scheduledDays.includes(dayName)) {
          date.setHours(10, 0, 0, 0); // Post at 10 AM
          times.push(date.toISOString());
        }
      }
      
      return times.length > 0 ? times : [now.toISOString()];
    };

    const scheduledTimes = getScheduledTimes();

    // Post to Facebook
    if (platforms.includes('facebook')) {
      try {
        const fbConnection = await base44.asServiceRole.connectors.getConnection('facebook');
        
        for (const postTime of scheduledTimes) {
          const response = await fetch('https://graph.facebook.com/v18.0/me/feed', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${fbConnection.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: caption,
              picture: imageUrl,
              link: imageUrl,
              published: false, // Draft until scheduled time
              scheduled_publish_time: Math.floor(new Date(postTime).getTime() / 1000),
            }),
          });

          if (!response.ok) {
            errors.push(`Facebook: ${response.statusText}`);
          } else {
            const data = await response.json();
            results.facebook = { success: true, postId: data.id };
          }
        }
      } catch (error) {
        errors.push(`Facebook error: ${error.message}`);
      }
    }

    // Post to Twitter/X
    if (platforms.includes('twitter')) {
      try {
        const twitterConnection = await base44.asServiceRole.connectors.getConnection('twitter');
        const tweetText = caption.length > 280 ? caption.substring(0, 277) + '...' : caption;
        
        const tweetBody = {
          text: tweetText,
        };

        if (imageUrl) {
          // Upload media first
          const imageResponse = await fetch(imageUrl);
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

          const mediaResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${twitterConnection.accessToken}`,
            },
            body: new URLSearchParams({
              media_data: base64Image,
            }),
          });

          if (mediaResponse.ok) {
            const mediaData = await mediaResponse.json();
            tweetBody.media = { media_ids: [mediaData.media_id_string] };
          }
        }

        const response = await fetch('https://api.twitter.com/2/tweets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${twitterConnection.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tweetBody),
        });

        if (!response.ok) {
          errors.push(`Twitter: ${response.statusText}`);
        } else {
          const data = await response.json();
          results.twitter = { success: true, postId: data.data.id };
        }
      } catch (error) {
        errors.push(`Twitter error: ${error.message}`);
      }
    }

    // Post to Google My Business
    if (platforms.includes('google')) {
      try {
        const googleConnection = await base44.asServiceRole.connectors.getConnection('googlebusiness');
        
        const postData = {
          summary: caption.substring(0, 300),
          media: imageUrl ? [{ mediaUrl: imageUrl }] : [],
        };

        // This requires Google My Business API v4.9+
        const response = await fetch('https://mybusiness.googleapis.com/v4/accounts/*/locations/*/posts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${googleConnection.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        });

        if (!response.ok) {
          errors.push(`Google My Business: ${response.statusText}`);
        } else {
          const data = await response.json();
          results.google = { success: true, postId: data.name };
        }
      } catch (error) {
        // Google My Business might not be configured
        console.warn(`Google My Business error: ${error.message}`);
      }
    }

    return Response.json({
      success: errors.length === 0,
      postId,
      results,
      errors: errors.length > 0 ? errors : null,
      scheduledTimes,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});