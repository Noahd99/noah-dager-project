from http.server import BaseHTTPRequestHandler
import json
import os
from typing import Dict, Any
import httpx
import hmac
import hashlib
import time
import random
import string
from base64 import b64encode
from urllib.parse import quote

# CORS headers for all responses
CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

def validate_twitter_env_vars():
    """Validate Twitter environment variables."""
    required_vars = [
        'TWITTER_CONSUMER_KEY',
        'TWITTER_CONSUMER_SECRET',
        'TWITTER_ACCESS_TOKEN',
        'TWITTER_ACCESS_TOKEN_SECRET'
    ]
    for var in required_vars:
        if not os.environ.get(var):
            raise ValueError(f"Missing {var} environment variable")

def generate_oauth_signature(method: str, url: str, params: Dict[str, str], 
                           consumer_secret: str, token_secret: str) -> str:
    """Generate OAuth signature for Twitter API."""
    # Create signature base string
    base_string_parts = [
        method,
        quote(url, safe=''),
        quote('&'.join(f"{quote(k)}={quote(str(v))}" 
              for k, v in sorted(params.items())), safe='')
    ]
    base_string = '&'.join(base_string_parts)
    
    # Create signing key
    signing_key = f"{quote(consumer_secret)}&{quote(token_secret)}"
    
    # Generate signature
    hashed = hmac.new(
        signing_key.encode(),
        base_string.encode(),
        hashlib.sha1
    )
    signature = b64encode(hashed.digest()).decode()
    
    print(f"Base String: {base_string}")
    print(f"Signing Key: {signing_key}")
    print(f"Signature: {signature}")
    
    return signature

async def post_to_twitter(content: str) -> Dict:
    """Post content to Twitter."""
    validate_twitter_env_vars()
    
    url = 'https://api.twitter.com/2/tweets'
    method = 'POST'
    
    # OAuth parameters
    oauth_params = {
        'oauth_consumer_key': os.environ['TWITTER_CONSUMER_KEY'],
        'oauth_nonce': ''.join(random.choices(string.ascii_letters + string.digits, k=32)),
        'oauth_signature_method': 'HMAC-SHA1',
        'oauth_timestamp': str(int(time.time())),
        'oauth_token': os.environ['TWITTER_ACCESS_TOKEN'],
        'oauth_version': '1.0'
    }
    
    # Generate signature
    signature = generate_oauth_signature(
        method,
        url,
        oauth_params,
        os.environ['TWITTER_CONSUMER_SECRET'],
        os.environ['TWITTER_ACCESS_TOKEN_SECRET']
    )
    
    # Create Authorization header
    oauth_params['oauth_signature'] = signature
    auth_header = 'OAuth ' + ', '.join(
        f'{quote(k)}="{quote(v)}"'
        for k, v in sorted(oauth_params.items())
    )
    
    print(f"Auth Header: {auth_header}")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            headers={
                'Authorization': auth_header,
                'Content-Type': 'application/json'
            },
            json={'text': content},
            timeout=30.0
        )
        
        response_text = await response.aread()
        print(f"Twitter API Response: {response_text.decode()}")
        
        if response.status_code != 201:
            raise Exception(f"Twitter API error: {response.status_code} - {response_text.decode()}")
        
        return response.json()

async def post_to_linkedin(content: str, image_url: str = None) -> Dict:
    """Post content to LinkedIn."""
    access_token = os.environ.get('LINKEDIN_ACCESS_TOKEN')
    user_id = os.environ.get('LINKEDIN_USER_ID')
    
    if not access_token or not user_id:
        raise ValueError("LinkedIn credentials not properly configured")
    
    url = 'https://api.linkedin.com/rest/posts'
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202411',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    post_data = {
        'author': f'urn:li:person:{user_id}',
        'lifecycleState': 'PUBLISHED',
        'specificContent': {
            'com.linkedin.ugc.ShareContent': {
                'shareCommentary': {
                    'text': content
                },
                'shareMediaCategory': 'NONE'
            }
        },
        'visibility': {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
    }
    
    print(f"LinkedIn Request Headers: {json.dumps(headers, indent=2)}")
    print(f"LinkedIn Request Body: {json.dumps(post_data, indent=2)}")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            headers=headers,
            json=post_data,
            timeout=30.0
        )
        
        response_text = await response.aread()
        print(f"LinkedIn API Response Status: {response.status_code}")
        print(f"LinkedIn API Response Headers: {dict(response.headers)}")
        print(f"LinkedIn API Response Body: {response_text.decode()}")
        
        if not response.is_success:
            raise Exception(f"LinkedIn API error ({response.status_code}): {response_text.decode()}")
        
        return {'success': True, 'type': 'text'}

class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle preflight requests."""
        self.send_response(200)
        for key, value in CORS_HEADERS.items():
            self.send_header(key, value)
        self.end_headers()

    async def do_POST(self):
        """Handle POST requests."""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)
            
            platform = data.get('platform')
            content = data.get('content')
            image_url = data.get('imageUrl')
            
            if not platform or not content:
                raise ValueError("Platform and content are required")
            
            if platform == 'twitter':
                result = await post_to_twitter(content)
            elif platform == 'linkedin':
                result = await post_to_linkedin(content, image_url)
            else:
                raise ValueError(f"Unsupported platform: {platform}")
            
            self.send_response(200)
            for key, value in CORS_HEADERS.items():
                self.send_header(key, value)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            print(f"Error in post-to-social: {str(e)}")
            self.send_response(500)
            for key, value in CORS_HEADERS.items():
                self.send_header(key, value)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            error_response = {
                'error': str(e),
                'details': str(e)
            }
            self.wfile.write(json.dumps(error_response).encode())

if __name__ == "__main__":
    from http.server import HTTPServer
    port = 8000
    server = HTTPServer(('localhost', port), Handler)
    print(f"Server running on port {port}")
    server.serve_forever()