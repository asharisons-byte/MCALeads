import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Telnyx Voice Webhook Handler
 * 
 * Receives webhook events from Telnyx Voice API
 * Production URL: https://mca.marketingcharmagency.com/api/telnyx/voice/webhook
 * 
 * Supported events:
 * - call.initiated
 * - call.answered
 * - call.hangup
 * - call.failed
 * - call.machine.detection.ended
 * - recording events
 */

interface TelnyxWebhookEvent {
  data: {
    event_type: string;
    id: string;
    occurred_at: string;
    record_type: string;
    payload: Record<string, unknown>;
  };
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Only accept POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests',
    });
  }

  try {
    // Parse webhook payload
    const webhookEvent = request.body as TelnyxWebhookEvent;

    // Validate webhook structure
    if (!webhookEvent?.data?.event_type) {
      console.warn('[Telnyx Webhook] Invalid webhook payload structure');
      return response.status(400).json({
        error: 'Invalid payload',
        message: 'Missing required event data',
      });
    }

    const { event_type, id, occurred_at, payload } = webhookEvent.data;

    // Log event (non-sensitive information only)
    console.log(`[Telnyx Webhook] Event: ${event_type}`, {
      eventId: id,
      occurredAt: occurred_at,
      callId: payload.call_control_id || payload.call_leg_id || 'unknown',
    });

    // Handle different event types
    switch (event_type) {
      case 'call.initiated':
        await handleCallInitiated(payload);
        break;

      case 'call.answered':
        await handleCallAnswered(payload);
        break;

      case 'call.hangup':
        await handleCallHangup(payload);
        break;

      case 'call.failed':
        await handleCallFailed(payload);
        break;

      case 'call.machine.detection.ended':
        await handleMachineDetection(payload);
        break;

      case 'call.recording.saved':
        await handleRecordingSaved(payload);
        break;

      default:
        console.log(`[Telnyx Webhook] Unhandled event type: ${event_type}`);
    }

    // Always return 200 to acknowledge receipt
    return response.status(200).json({
      success: true,
      message: 'Webhook received',
      eventType: event_type,
    });

  } catch (error) {
    console.error('[Telnyx Webhook] Error processing webhook:', error);
    
    // Don't expose internal error details
    return response.status(500).json({
      error: 'Webhook processing failed',
      message: 'An error occurred while processing the webhook',
    });
  }
}

/**
 * Handle call.initiated event
 */
async function handleCallInitiated(payload: Record<string, unknown>) {
  console.log('[Telnyx Webhook] Call initiated', {
    callControlId: payload.call_control_id,
    from: payload.from,
    to: payload.to,
  });

  // TODO: Update lead status in database
  // TODO: Create call record
  // TODO: Trigger AI agent if configured
}

/**
 * Handle call.answered event
 */
async function handleCallAnswered(payload: Record<string, unknown>) {
  console.log('[Telnyx Webhook] Call answered', {
    callControlId: payload.call_control_id,
    duration: payload.duration,
  });

  // TODO: Update call record with answer time
  // TODO: Start recording if enabled
  // TODO: Trigger AI conversation flow
}

/**
 * Handle call.hangup event
 */
async function handleCallHangup(payload: Record<string, unknown>) {
  console.log('[Telnyx Webhook] Call hangup', {
    callControlId: payload.call_control_id,
    duration: payload.duration,
    hangupCause: payload.hangup_cause,
  });

  // TODO: Update call record with end time and duration
  // TODO: Update lead status based on call outcome
  // TODO: Generate AI call summary
  // TODO: Create CRM note
}

/**
 * Handle call.failed event
 */
async function handleCallFailed(payload: Record<string, unknown>) {
  console.log('[Telnyx Webhook] Call failed', {
    callControlId: payload.call_control_id,
    error: payload.error,
    hangupCause: payload.hangup_cause,
  });

  // TODO: Update call record with failure reason
  // TODO: Update lead status
  // TODO: Schedule retry if appropriate
}

/**
 * Handle machine detection event
 */
async function handleMachineDetection(payload: Record<string, unknown>) {
  console.log('[Telnyx Webhook] Machine detection', {
    callControlId: payload.call_control_id,
    machineType: payload.machine_type,
    detectionResult: payload.detection_result,
  });

  // TODO: Handle voicemail detection
  // TODO: Decide whether to continue or hangup
}

/**
 * Handle recording saved event
 */
async function handleRecordingSaved(payload: Record<string, unknown>) {
  console.log('[Telnyx Webhook] Recording saved', {
    callControlId: payload.call_control_id,
    recordingId: payload.recording_id,
    recordingUrl: payload.recording_url,
  });

  // TODO: Save recording URL to call record
  // TODO: Trigger AI transcription
}
