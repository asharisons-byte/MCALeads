import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/telnyx/voice/webhook
 * Handles Telnyx Voice API webhook events
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
    console.log('Telnyx webhook received:', {
      event_type: event.data?.event_type,
      call_control_id: event.data?.payload?.call_control_id,
      call_leg_id: event.data?.payload?.call_leg_id,
      call_session_id: event.data?.payload?.call_session_id,
      timestamp: new Date().toISOString(),
    });

    // Handle different event types
    const eventType = event.data?.event_type;

    switch (eventType) {
      case 'call.initiated':
        console.log('Call initiated:', event.data?.payload);
        break;

      case 'call.answered':
        console.log('Call answered:', event.data?.payload);
        break;

      case 'call.hangup':
        console.log('Call hangup:', event.data?.payload);
        break;

      case 'call.failed':
        console.log('Call failed:', event.data?.payload);
        break;

      case 'call.machine.detection.ended':
        console.log('Machine detection ended:', event.data?.payload);
        break;

      case 'call.recording.saved':
        console.log('Recording saved:', event.data?.payload);
        break;

      default:
        console.log('Unhandled event type:', eventType);
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({
      success: true,
      message: 'Webhook received',
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Still return 200 to prevent Telnyx from retrying
    return res.status(200).json({
      success: false,
      error: 'Webhook processing error',
    });
  }
}
