import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTelnyxConfig, validatePhoneNumber, sanitizePhoneNumber, TELNYX_API_BASE } from '../config';

/**
 * POST /api/telnyx/sms/send
 * Sends an SMS message via Telnyx Messaging API
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
    // Get Telnyx configuration
    const config = getTelnyxConfig();

    // Validate request body
    const { to, text, leadId } = req.body || {};

    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Message text is required',
      });
    }

    // Sanitize and validate phone number
    const sanitizedPhone = sanitizePhoneNumber(to);
    if (!validatePhoneNumber(sanitizedPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)',
      });
    }

    // Prepare Telnyx SMS API request
    const telnyxPayload = {
      from: config.phoneNumber,
      to: sanitizedPhone,
      text: text,
      webhook_url: `${process.env.VERCEL_URL || 'https://mca.marketingcharmagency.com'}/api/telnyx/sms/webhook`,
      type: 'application',
    };

    // Make Telnyx API call
    const response = await fetch(`${TELNYX_API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telnyxPayload),
    });

    // Handle Telnyx API response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Telnyx SMS API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      return res.status(response.status).json({
        success: false,
        error: `Telnyx SMS API error: ${errorData.errors?.[0]?.detail || response.statusText}`,
        details: errorData,
      });
    }

    // Parse successful response
    const data = await response.json();

    return res.status(200).json({
      success: true,
      messageId: data.data?.id,
      status: data.data?.status || 'queued',
      to: sanitizedPhone,
      from: config.phoneNumber,
      leadId: leadId || null,
    });

  } catch (error) {
    console.error('SMS send error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a configuration error
    if (errorMessage.includes('TELNYX_API_KEY')) {
      return res.status(500).json({
        success: false,
        error: 'Telnyx API key is not configured',
      });
    }

    return res.status(500).json({
      success: false,
      error: `Failed to send SMS: ${errorMessage}`,
    });
  }
}
