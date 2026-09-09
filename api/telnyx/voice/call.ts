import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTelnyxConfig, validatePhoneNumber, sanitizePhoneNumber, TELNYX_API_BASE } from '../config';

/**
 * Telnyx Voice - Initiate Outbound Call
 * 
 * Creates an outbound call via Telnyx Voice API
 * Production URL: https://mca.marketingcharmagency.com/api/telnyx/voice/call
 * 
 * Request body:
 * {
 *   "to": "+1234567890",        // Required: destination phone number
 *   "leadId": "uuid",           // Optional: lead ID for tracking
 *   "clientState": "base64"     // Optional: client state for webhook context
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "callControlId": "uuid",
 *   "callLegId": "uuid",
 *   "status": "initiated"
 * }
 */

interface CallRequest {
  to: string;
  leadId?: string;
  clientState?: string;
}

interface TelnyxCallResponse {
  data: {
    call_control_id: string;
    call_leg_id: string;
    call_session_id: string;
    client_state?: string;
    is_alive: boolean;
    record_type: string;
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
    // Get Telnyx configuration (server-side only)
    const config = getTelnyxConfig();

    // Parse request body
    const { to, leadId, clientState } = request.body as CallRequest;

    // Validate destination number
    if (!to) {
      return response.status(400).json({
        error: 'Missing destination number',
        message: 'The "to" parameter is required',
      });
    }

    if (!validatePhoneNumber(to)) {
      return response.status(400).json({
        error: 'Invalid phone number',
        message: 'Phone number must be in E.164 format (e.g., +1234567890)',
      });
    }

    const sanitizedTo = sanitizePhoneNumber(to);

    // Prepare client state for webhook context
    const encodedClientState = clientState || Buffer.from(
      JSON.stringify({
        leadId: leadId || null,
        initiatedAt: new Date().toISOString(),
      })
    ).toString('base64').substring(0, 256); // Telnyx limit

    // Call Telnyx API
    const telnyxResponse = await fetch(`${TELNYX_API_BASE}/calls`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connection_id: config.voiceApplicationId,
        to: sanitizedTo,
        from: config.phoneNumber,
        client_state: encodedClientState,
        webhook_url: 'https://mca.marketingcharmagency.com/api/telnyx/voice/webhook',
        webhook_url_method: 'POST',
      }),
    });

    // Handle Telnyx API errors
    if (!telnyxResponse.ok) {
      const errorData = await telnyxResponse.json().catch(() => ({}));
      
      console.error('[Telnyx Call] API error:', {
        status: telnyxResponse.status,
        statusText: telnyxResponse.statusText,
      });

      // Don't expose full error details to client
      return response.status(telnyxResponse.status).json({
        error: 'Telnyx API error',
        message: 'Failed to initiate call',
        statusCode: telnyxResponse.status,
      });
    }

    // Parse successful response
    const callData = (await telnyxResponse.json()) as TelnyxCallResponse;

    console.log('[Telnyx Call] Call initiated successfully', {
      callControlId: callData.data.call_control_id,
      to: sanitizedTo,
      leadId: leadId || 'none',
    });

    // Return safe response (no sensitive data)
    return response.status(200).json({
      success: true,
      callControlId: callData.data.call_control_id,
      callLegId: callData.data.call_leg_id,
      status: 'initiated',
      to: sanitizedTo,
      from: config.phoneNumber,
    });

  } catch (error) {
    // Handle configuration errors
    if (error instanceof Error && error.message.includes('TELNYX_API_KEY')) {
      console.error('[Telnyx Call] Configuration error:', error.message);
      return response.status(500).json({
        error: 'Server configuration error',
        message: 'Telnyx API is not configured',
      });
    }

    // Handle other errors
    console.error('[Telnyx Call] Unexpected error:', error);
    return response.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
    });
  }
}
