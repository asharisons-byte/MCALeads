/**
 * Telnyx API Configuration
 * Server-side only - never exposed to client
 */

export interface TelnyxConfig {
  apiKey: string;
  phoneNumber: string;
  voiceApplicationId?: string;
}

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

export function validatePhoneNumber(phone: string): boolean {
  // E.164 format validation
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

export function sanitizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except leading +
  return phone.replace(/[^\d+]/g, '');
}

export const TELNYX_API_BASE = 'https://api.telnyx.com/v2';
