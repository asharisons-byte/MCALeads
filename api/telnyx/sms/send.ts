import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/telnyx/sms/send
 * Sends an SMS message via Telnyx Messaging API
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    // Validate request body
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
      });
    }

    const { to, text, leadId } = req.body;

    // Validate phone number
    if (!to || typeof to !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    // Validate E.164 format
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    if (!e164Regex.test(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)',
      });
    }

    // Validate message text
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message text is required',
      });
    }

    // Check environment variables
    const apiKey = process.env.TELNYX_API_KEY;
    const phoneNumber = process.env.TELNYX_PHONE_NUMBER;

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

    // Prepare Telnyx SMS API request
    const webhookUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api/telnyx/sms/webhook`
      : 'https://mca.marketingcharmagency.com/api/telnyx/sms/webhook';

    const telnyxPayload = {
      from: phoneNumber,
      to: to,
      text: text.trim(),
      webhook_url: webhookUrl,
      type: 'application',
    };

    // Make Telnyx API call
    const response = await fetch('https://api.telnyx.com/v2/messages', {
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

      console.error('Telnyx SMS API error:', {
        status: response.status,
        error: errorDetail,
      });

      return res.status(response.status).json({
        success: false,
        error: `Telnyx SMS API error: ${errorDetail}`,
      });
    }

    // Parse successful response
    const data = await response.json();

    return res.status(200).json({
      success: true,
      messageId: data.data?.id,
      status: data.data?.status || 'queued',
      to: to,
      from: phoneNumber,
      leadId: leadId || null,
    });

  } catch (error) {
    // Never crash - always return JSON
    console.error('SMS endpoint error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
