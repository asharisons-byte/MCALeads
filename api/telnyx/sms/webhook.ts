import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/telnyx/sms/webhook
 * Handles Telnyx Messaging API webhook events
 * Always returns 200 to acknowledge receipt (prevents Telnyx retries)
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set JSON content type
  res.setHeader('Content-Type', 'application/json');

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const event = req.body || {};

    // Log the webhook event (without sensitive data)
    console.log('Telnyx SMS webhook received:', {
      event_type: event.data?.event_type || 'unknown',
      message_id: event.data?.payload?.id || 'unknown',
      timestamp: new Date().toISOString(),
    });

    // Handle different event types
    const eventType = event.data?.event_type;

    switch (eventType) {
      case 'message.sent':
        console.log('SMS sent');
        break;
      case 'message.delivered':
        console.log('SMS delivered');
        break;
      case 'message.failed':
        console.log('SMS failed');
        break;
      case 'message.received':
        console.log('SMS received');
        break;
      default:
        console.log('SMS event type:', eventType || 'unknown');
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({
      success: true,
      message: 'Webhook received',
    });

  } catch (error) {
    // Never crash - always acknowledge receipt
    console.error('SMS webhook error:', error);
    return res.status(200).json({
      success: true,
      message: 'Webhook received with errors',
    });
  }
}
