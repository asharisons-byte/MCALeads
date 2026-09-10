import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTelnyxConfig } from './config';

/**
 * GET /api/telnyx/status
 * Returns Telnyx configuration status (no secrets exposed)
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const config = getTelnyxConfig();
    
    return res.status(200).json({
      success: true,
      configured: true,
      hasApiKey: !!config.apiKey,
      hasPhoneNumber: !!config.phoneNumber,
      hasVoiceApplicationId: !!config.voiceApplicationId,
      phoneNumber: config.phoneNumber,
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      configured: false,
      hasApiKey: false,
      hasPhoneNumber: false,
      hasVoiceApplicationId: false,
      error: error instanceof Error ? error.message : 'Configuration error',
    });
  }
}
