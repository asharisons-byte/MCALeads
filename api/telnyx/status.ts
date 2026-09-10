import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/telnyx/status
 * Returns Telnyx configuration status (no secrets exposed)
 * This is the simplest possible endpoint - no external API calls
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set JSON content type
  res.setHeader('Content-Type', 'application/json');

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Read environment variables directly
    const apiKey = process.env.TELNYX_API_KEY;
    const phoneNumber = process.env.TELNYX_PHONE_NUMBER;
    const voiceApplicationId = process.env.TELNYX_VOICE_APPLICATION_ID;

    // Return configuration status (no secrets)
    return res.status(200).json({
      success: true,
      configured: !!apiKey,
      hasApiKey: !!apiKey,
      hasPhoneNumber: !!phoneNumber,
      hasVoiceApplicationId: !!voiceApplicationId,
      phoneNumber: phoneNumber || null,
    });
  } catch (error) {
    // Never crash - always return JSON
    console.error('Status endpoint error:', error);
    return res.status(200).json({
      success: false,
      configured: false,
      hasApiKey: false,
      hasPhoneNumber: false,
      hasVoiceApplicationId: false,
      error: 'Internal error checking configuration',
    });
  }
}
