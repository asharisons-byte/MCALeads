import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/telnyx/voice/call
 * Initiates an outbound call via Telnyx Voice API
 * Validates phone number BEFORE making any API calls
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set JSON content type immediately
  res.setHeader('Content-Type', 'application/json');

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Validate request body exists
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
      });
    }

    const { to, leadId } = req.body;

    // Validate phone number is provided
    if (!to || typeof to !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    // Validate E.164 format BEFORE any other processing
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    if (!e164Regex.test(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)',
      });
    }

    // Check environment variables
    const apiKey = process.env.TELNYX_API_KEY;
    const phoneNumber = process.env.TELNYX_PHONE_NUMBER;
    const voiceApplicationId = process.env.TELNYX_VOICE_APPLICATION_ID;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Telnyx API key is not configured',
      });
    }

    if (!phoneNumber) {
      return res.status(500).json({
        success: false,
        error: 'Telnyx phone number is not configured',
      });
    }

    if (!voiceApplicationId) {
      return res.status(500).json({
        success: false,
        error: 'Telnyx Voice Application ID is not configured',
      });
    }

    // Prepare Telnyx API request
    const webhookUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api/telnyx/voice/webhook`
      : 'https://mca.marketingcharmagency.com/api/telnyx/voice/webhook';

    const telnyxPayload = {
      connection_id: voiceApplicationId,
      to: to,
      from: phoneNumber,
      webhook_url: webhookUrl,
      webhook_url_method: 'POST',
      client_state: leadId || 'manual-dial',
    };

    // Make Telnyx API call
    const response = await fetch('https://api.telnyx.com/v2/calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telnyxPayload),
    });

    // Handle Telnyx API response
    if (!response.ok) {
      let errorDetail = 'Unknown error';
      try {
        const errorData = await response.json();
        errorDetail = errorData.errors?.[0]?.detail || response.statusText;
      } catch {
        errorDetail = response.statusText;
      }

      console.error('Telnyx API error:', {
        status: response.status,
        error: errorDetail,
      });

      return res.status(response.status).json({
        success: false,
        error: `Telnyx API error: ${errorDetail}`,
      });
    }

    // Parse successful response
    const data = await response.json();

    return res.status(200).json({
      success: true,
      callControlId: data.data?.call_control_id,
      callLegId: data.data?.call_leg_id,
      callSessionId: data.data?.call_session_id,
      status: data.data?.status || 'initiated',
      to: to,
      from: phoneNumber,
      leadId: leadId || null,
    });

  } catch (error) {
    // Never crash - always return JSON
    console.error('Call endpoint error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
