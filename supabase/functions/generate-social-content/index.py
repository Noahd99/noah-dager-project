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

async def generate_content(data: Dict[str, Any]) -> Dict[str, str]:
    """Generate content using OpenAI API."""
    openai_key = os.environ.get('OPENAI_API_KEY')
    if not openai_key:
        raise ValueError("OpenAI API key not found")

    project_title = data.get('projectTitle')
    project_description = data.get('projectDescription')
    platform = data.get('platform')
    tone = data.get('tone')

    system_content = f"You are a social media expert that creates engaging {platform} posts. "
    if platform == "linkedin":
        system_content += "Create professional and insightful content."
    elif platform == "twitter":
        system_content += "Create concise and engaging content within 280 characters."
    system_content += f" Use a {tone} tone."

    user_content = f"Create a {platform} post about this project:\nTitle: {project_title}\nDescription: {project_description}"

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
                    {'role': 'system', 'content': system_content},
                    {'role': 'user', 'content': user_content}
                ],
            },
            timeout=30.0
        )
        
        if response.status_code != 200:
            print(f"OpenAI API error: {response.text}")
            raise Exception(f"OpenAI API error: {response.status_code}")

        data = response.json()
        content = data['choices'][0]['message']['content']
        return {'content': content}

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
            
            result = await generate_content(data)
            
            self.send_response(200)
            for key, value in CORS_HEADERS.items():
                self.send_header(key, value)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            print(f"Error in generate-social-content: {str(e)}")
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