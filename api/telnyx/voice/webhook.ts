import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/telnyx/voice/webhook
 * Handles Telnyx Voice API webhook events
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
    console.log('Telnyx webhook received:', {
      event_type: event.data?.event_type || 'unknown',
      call_control_id: event.data?.payload?.call_control_id || 'unknown',
      timestamp: new Date().toISOString(),
    });

    // Handle different event types
    const eventType = event.data?.event_type;

    switch (eventType) {
      case 'call.initiated':
        console.log('Call initiated');
        break;
      case 'call.answered':
        console.log('Call answered');
        break;
      case 'call.hangup':
        console.log('Call hangup');
        break;
      case 'call.failed':
        console.log('Call failed');
        break;
      default:
        console.log('Event type:', eventType || 'unknown');
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({
      success: true,
      message: 'Webhook received',
    });

  } catch (error) {
    // Never crash - always acknowledge receipt
    console.error('Webhook error:', error);
    return res.status(200).json({
      success: true,
      message: 'Webhook received with errors',
    });
  }
}
