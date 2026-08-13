// Publishes a caption + optional image immediately to Facebook, Instagram, and LinkedIn
// using credentials stored in the SocialCredential entity.
export async function publishToSocial({ creds, caption, imageUrl, platforms }) {
  const results = {};
  const errors = [];
  const credFor = (p) => creds.find((c) => c.platform === p);

  if (platforms.includes('facebook')) {
    const fb = credFor('facebook');
    if (!fb) {
      errors.push('Facebook: no credentials saved.');
    } else {
      try {
        const target = fb.account_id || 'me';
        const body = { message: caption, access_token: fb.access_token };
        if (imageUrl) body.link = imageUrl;
        const response = await fetch(`https://graph.facebook.com/v18.0/${target}/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) errors.push(`Facebook: ${data?.error?.message || response.statusText}`);
        else results.facebook = { success: true, postId: data.id };
      } catch (error) {
        errors.push(`Facebook error: ${error.message}`);
      }
    }
  }

  if (platforms.includes('instagram')) {
    const ig = credFor('instagram');
    if (!ig?.account_id) {
      errors.push('Instagram: missing access token or Business Account ID.');
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
          if (!pubRes.ok) errors.push(`Instagram: ${pubData?.error?.message || pubRes.statusText}`);
          else results.instagram = { success: true, postId: pubData.id };
        }
      } catch (error) {
        errors.push(`Instagram error: ${error.message}`);
      }
    }
  }

  if (platforms.includes('linkedin')) {
    const li = credFor('linkedin');
    if (!li?.account_id) {
      errors.push('LinkedIn: missing access token or author URN.');
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

  return { results, errors };
}