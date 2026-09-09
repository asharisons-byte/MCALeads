import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTelnyxConfig, validatePhoneNumber, sanitizePhoneNumber, TELNYX_API_BASE } from '../config';

/**
 * Telnyx SMS - Send SMS Message
 * 
 * Sends an SMS message via Telnyx Messaging API
 * Production URL: https://mca.marketingcharmagency.com/api/telnyx/sms/send
 * 
 * Request body:
 * {
 *   "to": "+1234567890",        // Required: destination phone number
 *   "text": "message content",  // Required: SMS message text
 *   "leadId": "uuid"            // Optional: lead ID for tracking
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "messageId": "uuid",
 *   "status": "sent"
 * }
 */

interface SMSRequest {
  to: string;
  text: string;
  leadId?: string;
}

interface TelnyxSMSResponse {
   {
    id: string;
    direction: string;
    status: string;
    type: string;
    to: Array<{ phone_number: string; status: string }>;
    from: { phone_number: string };
    text: string;
    cost: Record<string, unknown>;
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
    const { to, text, leadId } = request.body as SMSRequest;

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

    // Validate message text
    if (!text || text.trim() === '') {
      return response.status(400).json({
        error: 'Missing message text',
        message: 'The "text" parameter is required',
      });
    }

    if (text.length > 1600) {
      return response.status(400).json({
        error: 'Message too long',
        message: 'SMS message cannot exceed 1600 characters',
      });
    }

    const sanitizedTo = sanitizePhoneNumber(to);

    // Call Telnyx Messaging API
    const telnyxResponse = await fetch(`${TELNYX_API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.phoneNumber,
        to: [{ phone_number: sanitizedTo }],
        text: text.trim(),
        webhook_url: 'https://mca.marketingcharmagency.com/api/telnyx/voice/webhook',
        webhook_url_method: 'POST',
      }),
    });

    // Handle Telnyx API errors
    if (!telnyxResponse.ok) {
      const errorData = await telnyxResponse.json().catch(() => ({}));
      
      console.error('[Telnyx SMS] API error:', {
        status: telnyxResponse.status,
        statusText: telnyxResponse.statusText,
      });

      // Don't expose full error details to client
      return response.status(telnyxResponse.status).json({
        error: 'Telnyx API error',
        message: 'Failed to send SMS',
        statusCode: telnyxResponse.status,
      });
    }

    // Parse successful response
    const smsData = (await telnyxResponse.json()) as TelnyxSMSResponse;

    console.log('[Telnyx SMS] SMS sent successfully', {
      messageId: smsData.data.id,
      to: sanitizedTo,
      leadId: leadId || 'none',
    });

    // Return safe response (no sensitive data)
    return response.status(200).json({
      success: true,
      messageId: smsData.data.id,
      status: smsData.data.status,
      to: sanitizedTo,
      from: config.phoneNumber,
    });

  } catch (error) {
    // Handle configuration errors
    if (error instanceof Error && error.message.includes('TELNYX_API_KEY')) {
      console.error('[Telnyx SMS] Configuration error:', error.message);
      return response.status(500).json({
        error: 'Server configuration error',
        message: 'Telnyx API is not configured',
      });
    }

    // Handle other errors
    console.error('[Telnyx SMS] Unexpected error:', error);
    return response.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
    });
  }
}
