# Dager Studios - Creative Portfolio & Social Media Management

A modern web application for managing creative studio projects and automating social media content creation and posting. Built with React, TypeScript, and Python-powered Supabase Edge Functions.

## Features

- Project portfolio management
- Automated social media content generation using AI
- Social media post scheduling and analytics
- Multi-platform social media integration (LinkedIn, Twitter)
- Modern, responsive design

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui component library
- Framer Motion for animations

### Backend (Supabase)
- PostgreSQL database
- Python Edge Functions for API integrations
- Storage for project media
- Row Level Security for data protection

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd dager-studios
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Environment Setup

The project requires several API keys and secrets for full functionality:

- OpenAI API key for content generation
- LinkedIn API credentials
- Twitter API credentials

These should be configured in your Supabase project's secrets management.

## Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   └── integrations/  # External service integrations
├── supabase/
│   └── functions/     # Python Edge Functions
└── public/           # Static assets
```

## API Documentation

The project uses three main Python-powered Edge Functions:

1. `generate-social-content`: AI-powered content generation
2. `enhance-description`: Project description enhancement
3. `post-to-social`: Social media posting automation

## Live Demo

Visit the live project at: https://lovable.dev/projects/d675ed93-072d-4e55-882d-5a2cbd39bdcd

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License

## Contact

For questions and support, please reach out through the project's GitHub issues page.