import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function postToLinkedIn(content: string, imageUrl?: string) {
  console.log('Attempting to post to LinkedIn...');
  
  const accessToken = Deno.env.get('LINKEDIN_ACCESS_TOKEN');
  const userId = Deno.env.get('LINKEDIN_USER_ID');

  if (!accessToken || !userId) {
    throw new Error('LinkedIn credentials not properly configured');
  }

  const baseUrl = 'https://api.linkedin.com/v2/ugcPosts';
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'X-Restli-Protocol-Version': '2.0.0',
  };

  const requestBody = {
    author: `urn:li:person:${userId}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text: content
        },
        shareMediaCategory: "NONE"
      }
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
    }
  };

  try {
    console.log('LinkedIn Request Headers:', JSON.stringify(headers, null, 2));
    console.log('LinkedIn Request Body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('LinkedIn API Response Status:', response.status);
    console.log('LinkedIn API Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    console.log('LinkedIn API Response Body:', responseText);

    if (!response.ok) {
      throw new Error(`LinkedIn API error (${response.status}): ${responseText}`);
    }

    return { success: true, type: 'text' };
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
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in post-to-social function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
