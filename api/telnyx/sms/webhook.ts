import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/telnyx/sms/webhook
 * Handles Telnyx Messaging API webhook events
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const event = req.body;

    // Log the webhook event (without sensitive data)
    console.log('Telnyx SMS webhook received:', {
      event_type: event.data?.event_type,
      message_id: event.data?.payload?.id,
      direction: event.data?.payload?.direction,
      status: event.data?.payload?.status,
      timestamp: new Date().toISOString(),
    });

    // Handle different event types
    const eventType = event.data?.event_type;

    switch (eventType) {
      case 'message.sent':
        console.log('SMS sent:', event.data?.payload);
        break;

      case 'message.delivered':
        console.log('SMS delivered:', event.data?.payload);
        break;

      case 'message.failed':
        console.log('SMS failed:', event.data?.payload);
        break;

      case 'message.received':
        console.log('SMS received:', event.data?.payload);
        break;

      default:
        console.log('Unhandled SMS event type:', eventType);
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({
      success: true,
      message: 'Webhook received',
    });

  } catch (error) {
    console.error('SMS webhook processing error:', error);
    
    // Still return 200 to prevent Telnyx from retrying
    return res.status(200).json({
      success: false,
      error: 'Webhook processing error',
    });
  }
}
