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

### Client-Side Configuration

API keys are configured through the Settings → Integrations page in the application:
- Google Gemini API (for AI features)
- n8n Webhooks (for automation)

### Telnyx Voice API (Server-Side)

The Telnyx Voice API integration uses server-side environment variables for security. The API key is never exposed to the browser.

#### Required Environment Variables

Add these to your Vercel project settings (Settings → Environment Variables):

```bash
TELNYX_API_KEY=your_telnyx_api_key_here
TELNYX_PHONE_NUMBER=+14052853816
TELNYX_VOICE_APPLICATION_ID=your_voice_application_id_here
```

**Where to find these:**
- **TELNYX_API_KEY**: [Telnyx Portal](https://portal.telnyx.com) → API Keys
- **TELNYX_PHONE_NUMBER**: Your Telnyx phone number in E.164 format
- **TELNYX_VOICE_APPLICATION_ID**: [Telnyx Portal](https://portal.telnyx.com) → Voice → API Applications

#### Webhook Configuration

Set the webhook URL in your Telnyx Voice Application:

```
https://mca.marketingcharmagency.com/api/telnyx/voice/webhook
```

#### API Endpoints

**Initiate Outbound Call:**
```
POST /api/telnyx/voice/call
Content-Type: application/json

{
  "to": "+1234567890",
  "leadId": "uuid-optional"
}
```

**Webhook Handler:**
```
POST /api/telnyx/voice/webhook
```
Receives events: call.initiated, call.answered, call.hangup, call.failed, etc.

#### Security

- ✅ Telnyx API key stored server-side only
- ✅ Never exposed to browser/client-side code
- ✅ Phone numbers validated and sanitized
- ✅ Webhook events logged (non-sensitive data only)
- ✅ Error messages don't expose internal details

## Production

- Vercel: https://mca-leads-pi.vercel.app
- Custom Domain: https://mca.marketingcharmagency.com
