import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function postToLinkedIn(content: string, imageUrl?: string) {
  console.log('Attempting to post to LinkedIn...');
  
  const accessToken = Deno.env.get('LINKEDIN_ACCESS_TOKEN');
  const userId = '506763489';  // LinkedIn member ID

  if (!accessToken || !userId) {
    throw new Error('LinkedIn credentials not properly configured');
  }

  console.log('Using LinkedIn Member ID:', userId);

  let mediaId: string | undefined;
  
  if (imageUrl) {
    console.log('Uploading image to LinkedIn:', imageUrl);
    
    try {
      // First, register the image upload
      const registerUpload = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'LinkedIn-Version': '202311',
        },
        body: JSON.stringify({
          initializeUploadRequest: {
            owner: `urn:li:person:${userId}`,
          }
        })
      });

      if (!registerUpload.ok) {
        const errorText = await registerUpload.text();
        console.error('LinkedIn register upload error:', errorText);
        throw new Error(`Failed to register image upload: ${errorText}`);
      }

      const uploadData = await registerUpload.json();
      console.log('Upload registration response:', uploadData);

      // Download the image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to download image');
      }
      const imageBlob = await imageResponse.blob();

      // Upload the image to LinkedIn
      const upload = await fetch(uploadData.value.uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: imageBlob
      });

      if (!upload.ok) {
        const errorText = await upload.text();
        console.error('LinkedIn image upload error:', errorText);
        throw new Error(`Failed to upload image: ${errorText}`);
      }

      mediaId = uploadData.value.image;
      console.log('Successfully uploaded image, got media ID:', mediaId);
    } catch (error) {
      console.error('Error during image upload:', error);
      throw error;
    }
  }

  // New Posts API structure
  const postBody: any = {
    author: `urn:li:person:${userId}`,
    commentary: content,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: []
    },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false
  };

  if (mediaId) {
    postBody.content = {
      media: {
        id: mediaId,
        title: {
          text: "Project Image"
        },
        altText: "Project Image"
      }
    };
  }

  console.log('LinkedIn post payload:', JSON.stringify(postBody, null, 2));

  try {
    const response = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202311',
      },
      body: JSON.stringify(postBody),
    });

    const responseText = await response.text();
    console.log('LinkedIn API Response Status:', response.status);
    console.log('LinkedIn API Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    console.log('LinkedIn API Response Body:', responseText);

    if (!response.ok) {
      throw new Error(`LinkedIn API error (${response.status}): ${responseText}`);
    }

    return response.status === 201 ? { success: true } : JSON.parse(responseText);
  } catch (error) {
    console.error('Error posting to LinkedIn:', error);
    throw error;
  }
}

async function postToTwitter(content: string) {
  const url = 'https://api.twitter.com/2/tweets';
  const method = 'POST';
  
  const oauthParams = {
    oauth_consumer_key: Deno.env.get('TWITTER_CONSUMER_KEY')!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: Deno.env.get('TWITTER_ACCESS_TOKEN')!,
    oauth_version: '1.0',
  };

  // Create HMAC-SHA1 signature using Web Crypto API
  const signingKey = `${encodeURIComponent(Deno.env.get('TWITTER_CONSUMER_SECRET')!)}&${encodeURIComponent(Deno.env.get('TWITTER_ACCESS_TOKEN_SECRET')!)}`;
  
  const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
    Object.entries(oauthParams)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
  )}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(signingKey);
  const messageData = encoder.encode(baseString);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );

  const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)));

  const authHeader = 'OAuth ' + Object.entries({
    ...oauthParams,
    oauth_signature: base64Signature,
  })
    .sort()
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(', ');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Twitter API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received request to post-to-social function');
    const { platform, content, imageUrl } = await req.json();
    console.log('Platform:', platform);
    console.log('Content length:', content?.length);
    console.log('Image URL:', imageUrl);

    let result;
    if (platform === 'linkedin') {
      result = await postToLinkedIn(content, imageUrl);
    } else if (platform === 'twitter') {
      result = await postToTwitter(content);
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in post-to-social function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
