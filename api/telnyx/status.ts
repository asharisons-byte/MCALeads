import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Telnyx Configuration Status
 * 
 * Returns whether Telnyx is configured on the server
 * Production URL: https://mca.marketingcharmagency.com/api/telnyx/status
 * 
 * This endpoint does NOT expose any secrets or API keys.
 */

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Only accept GET requests
  if (request.method !== 'GET') {
    return response.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only accepts GET requests',
    });
  }

  try {
    // Check if Telnyx API key is configured (server-side only)
    const apiKey = process.env.TELNYX_API_KEY;
    const phoneNumber = process.env.TELNYX_PHONE_NUMBER || '+14052853816';
    const voiceApplicationId = process.env.TELNYX_VOICE_APPLICATION_ID;

    const hasApiKey = !!apiKey;
    const hasPhoneNumber = !!phoneNumber;
    const hasVoiceApplicationId = !!voiceApplicationId;
    
    // Telnyx is configured if we have at least the API key
    const isConfigured = hasApiKey;

    // Return safe diagnostic status (no secrets)
    return response.status(200).json({
      configured: isConfigured,
      hasApiKey,
      hasPhoneNumber,
      hasVoiceApplicationId,
      phoneNumber: isConfigured ? phoneNumber : null,
    });

  } catch (error) {
    console.error('[Telnyx Status] Error checking configuration:', error);
    
    return response.status(500).json({
      error: 'Status check failed',
      message: 'An error occurred while checking configuration',
    });
  }
}
