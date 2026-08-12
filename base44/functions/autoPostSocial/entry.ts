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

    // Credentials saved by the admin in the dashboard
    const creds = await base44.asServiceRole.entities.SocialCredential.filter({ is_active: true });
    const credFor = (p) => creds.find((c) => c.platform === p);

    // Post to Facebook Page
    if (platforms.includes('facebook')) {
      const fb = credFor('facebook');
      if (!fb) {
        errors.push('Facebook: no credentials saved — add your Page access token in Settings → Integrations.');
      } else {
        try {
          for (const postTime of scheduledTimes) {
            const target = fb.account_id || 'me';
            const body = {
              message: caption,
              published: false,
              scheduled_publish_time: Math.floor(new Date(postTime).getTime() / 1000),
              access_token: fb.access_token,
            };
            if (imageUrl) body.link = imageUrl;

            const response = await fetch(`https://graph.facebook.com/v18.0/${target}/feed`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });

            const data = await response.json();
            if (!response.ok) {
              errors.push(`Facebook: ${data?.error?.message || response.statusText}`);
            } else {
              results.facebook = { success: true, postId: data.id };
            }
          }
        } catch (error) {
          errors.push(`Facebook error: ${error.message}`);
        }
      }
    }

    // Post to Instagram Business
    if (platforms.includes('instagram')) {
      const ig = credFor('instagram');
      if (!ig?.account_id) {
        errors.push('Instagram: add your access token and Instagram Business Account ID in Settings → Integrations.');
      } else if (!imageUrl) {
        errors.push('Instagram: an image is required to publish a post.');
      } else {
        try {
          const createRes = await fetch(`https://graph.facebook.com/v18.0/${ig.account_id}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: imageUrl, caption, access_token: ig.access_token }),
          });
          const createData = await createRes.json();
          if (!createRes.ok) {
            errors.push(`Instagram: ${createData?.error?.message || createRes.statusText}`);
          } else {
            const pubRes = await fetch(`https://graph.facebook.com/v18.0/${ig.account_id}/media_publish`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ creation_id: createData.id, access_token: ig.access_token }),
            });
            const pubData = await pubRes.json();
            if (!pubRes.ok) {
              errors.push(`Instagram: ${pubData?.error?.message || pubRes.statusText}`);
            } else {
              results.instagram = { success: true, postId: pubData.id };
            }
          }
        } catch (error) {
          errors.push(`Instagram error: ${error.message}`);
        }
      }
    }

    // Post to LinkedIn
    if (platforms.includes('linkedin')) {
      const li = credFor('linkedin');
      if (!li?.account_id) {
        errors.push('LinkedIn: add your access token and author URN in Settings → Integrations.');
      } else {
        try {
          const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${li.access_token}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0',
            },
            body: JSON.stringify({
              author: li.account_id,
              lifecycleState: 'PUBLISHED',
              specificContent: {
                'com.linkedin.ugc.ShareContent': {
                  shareCommentary: { text: caption },
                  shareMediaCategory: imageUrl ? 'ARTICLE' : 'NONE',
                  ...(imageUrl ? { media: [{ status: 'READY', originalUrl: imageUrl }] } : {}),
                },
              },
              visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
            }),
          });

          if (!response.ok) {
            const text = await response.text();
            errors.push(`LinkedIn: ${text || response.statusText}`);
          } else {
            const data = await response.json();
            results.linkedin = { success: true, postId: data.id };
          }
        } catch (error) {
          errors.push(`LinkedIn error: ${error.message}`);
        }
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