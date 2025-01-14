from http.server import BaseHTTPRequestHandler
import json
import os
from typing import Dict, Any
import httpx

# CORS headers for all responses
CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async def enhance_description(data: Dict[str, Any]) -> Dict[str, str]:
    """Enhance project description using OpenAI API."""
    openai_key = os.environ.get('OPENAI_API_KEY')
    if not openai_key:
        raise ValueError("OpenAI API key not found")

    description = data.get('description')
    if not description:
        raise ValueError("Description is required")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {openai_key}',
                'Content-Type': 'application/json',
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are a professional content writer specializing in portfolio project descriptions. Enhance the given text to be more engaging and professional while maintaining its core message and keeping a similar length.'
                    },
                    {
                        'role': 'user',
                        'content': description
                    }
                ],
            },
            timeout=30.0
        )
        
        if response.status_code != 200:
            print(f"OpenAI API error: {response.text}")
            raise Exception(f"OpenAI API error: {response.status_code}")

        data = response.json()
        enhanced_text = data['choices'][0]['message']['content']
        return {'enhancedText': enhanced_text}

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
            
            result = await enhance_description(data)
            
            self.send_response(200)
            for key, value in CORS_HEADERS.items():
                self.send_header(key, value)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            print(f"Error in enhance-description: {str(e)}")
            self.send_response(500)
            for key, value in CORS_HEADERS.items():
                self.send_header(key, value)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            error_response = {'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode())

if __name__ == "__main__":
    from http.server import HTTPServer
    port = 8000
    server = HTTPServer(('localhost', port), Handler)
    print(f"Server running on port {port}")
    server.serve_forever()