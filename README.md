# MCA Lead Agency Suite

Complete CRM and agency automation platform for Marketing Charm Agency.

## Features

- **Lead Management**: Import, track, and manage leads with AI-powered scoring
- **Pipeline Management**: Kanban board with drag-and-drop status updates
- **AI Integration**: Real Google Gemini API integration for content generation
- **Dialer**: Professional calling and SMS system via Telnyx
- **Client Management**: Track clients, services, and MRR
- **Analytics**: Real-time dashboard with conversion metrics
- **Campaign Management**: Multi-channel outreach campaigns
- **Call Intelligence**: Call logs, transcripts, and AI summaries

## Tech Stack

- React 18.2.0
- TypeScript 5.7.0
- Vite 6.3.5
- Tailwind CSS 4.1.7
- React Router DOM 6.8.0

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment

This project is configured for Vercel deployment:
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

## Configuration

API keys are configured through the Settings → Integrations page in the application:
- Google Gemini API (for AI features)
- Telnyx API (for calling/SMS)
- n8n Webhooks (for automation)

## Production

- Vercel: https://mca-leads-pi.vercel.app
- Custom Domain: https://mca.marketingcharmagency.com
