/**
 * Telnyx Voice API Configuration
 * 
 * Server-side only - never exposed to browser
 */

export interface TelnyxConfig {
  apiKey: string;
  phoneNumber: string;
  voiceApplicationId?: string;
}

/**
 * Get Telnyx configuration from environment variables
 * These are server-side only and never exposed to the browser
 */
export function getTelnyxConfig(): TelnyxConfig {
  const apiKey = process.env.TELNYX_API_KEY;
  const phoneNumber = process.env.TELNYX_PHONE_NUMBER || '+14052853816';
  const voiceApplicationId = process.env.TELNYX_VOICE_APPLICATION_ID;

  if (!apiKey) {
    throw new Error('TELNYX_API_KEY environment variable is not set');
  }

  return {
    apiKey,
    phoneNumber,
    voiceApplicationId,
  };
}

/**
 * Validate phone number format
 * Accepts E.164 format: +[country code][number]
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // E.164 format: + followed by 1-15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Sanitize phone number to E.164 format
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '');
}

/**
 * Telnyx API base URL
 */
export const TELNYX_API_BASE = 'https://api.telnyx.com/v2';
