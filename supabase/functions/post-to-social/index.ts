import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHmac } from "https://deno.land/std@0.182.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function postToLinkedIn(content: string) {
  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('LINKEDIN_ACCESS_TOKEN')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      author: `urn:li:person:${Deno.env.get('LINKEDIN_USER_ID')}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`LinkedIn API error: ${JSON.stringify(error)}`)
  }

  return response.json()
}

async function postToTwitter(content: string) {
  const url = 'https://api.twitter.com/2/tweets'
  const method = 'POST'
  
  const oauthParams = {
    oauth_consumer_key: Deno.env.get('TWITTER_CONSUMER_KEY')!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: Deno.env.get('TWITTER_ACCESS_TOKEN')!,
    oauth_version: '1.0',
  }

  const signingKey = `${encodeURIComponent(Deno.env.get('TWITTER_CONSUMER_SECRET')!)}&${encodeURIComponent(Deno.env.get('TWITTER_ACCESS_TOKEN_SECRET')!)}`
  
  const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
    Object.entries(oauthParams)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
  )}`

  const signature = createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64')

  const authHeader = 'OAuth ' + Object.entries({
    ...oauthParams,
    oauth_signature: signature,
  })
    .sort()
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(', ')

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: content }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Twitter API error: ${JSON.stringify(error)}`)
  }

  return response.json()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { platform, content } = await req.json()

    let result
    if (platform === 'linkedin') {
      result = await postToLinkedIn(content)
    } else if (platform === 'twitter') {
      result = await postToTwitter(content)
    } else {
      throw new Error(`Unsupported platform: ${platform}`)
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in post-to-social function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})