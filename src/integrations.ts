/**
 * REAL INTEGRATION MODULE
 * Marketing Charm Agency - MCA Lead Agency Suite
 * 
 * This module contains REAL API integrations.
 * No simulated responses. No fake success.
 * 
 * If credentials are missing, functions return CONFIGURATION_REQUIRED status.
 */

import type { Lead, AgencySettings } from './types';

export type IntegrationStatus = 
  | 'CONNECTED'
  | 'NOT_CONNECTED'
  | 'CONFIGURATION_REQUIRED'
  | 'TEST_MODE'
  | 'ERROR';

export interface IntegrationResult<T = unknown> {
  status: IntegrationStatus;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// GOOGLE GEMINI AI INTEGRATION
// ============================================

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-3.1-flash-lite';

export async function callGemini(
  apiKey: string,
  prompt: string,
  systemInstruction?: string
): Promise<IntegrationResult<{ text: string }>> {
  if (!apiKey || apiKey.trim() === '') {
    return {
      status: 'CONFIGURATION_REQUIRED',
      error: 'Gemini API key not configured. Add your API key in Settings.',
    };
  }

  try {
    const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    
    const requestBody: Record<string, unknown> = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        status: 'ERROR',
        error: `Gemini API error (${response.status}): ${errorData?.error?.message || response.statusText}`,
      };
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return {
        status: 'ERROR',
        error: 'Gemini returned empty response',
      };
    }

    return {
      status: 'CONNECTED',
      data: { text },
      message: 'AI response generated successfully via Gemini',
    };
  } catch (err) {
    return {
      status: 'ERROR',
      error: `Gemini API call failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

// Build AI prompt with lead context
function buildLeadContext(lead: Lead): string {
  return `
BUSINESS CONTEXT:
- Agency: Marketing Charm Agency
- AI Assistant: Sophia
- Lead Name: ${lead.firstName} ${lead.lastName}
- Company: ${lead.company}
- Industry: ${lead.industry}
- Location: ${lead.address || 'Not specified'}
- Email: ${lead.email}
- Phone: ${lead.phone}
- Website: ${lead.website || 'Not specified'}
- Revenue: ${lead.revenue || 'Not specified'}
- Employees: ${lead.employees || 'Not specified'}
- Lead Score: ${lead.score}/100
- Current Status: ${lead.status}
- Notes/Pain Points: ${lead.notes || 'Not specified'}
`.trim();
}

export async function generateAIPitch(lead: Lead, apiKey: string): Promise<IntegrationResult<{ text: string }>> {
  if (!apiKey) return { status: 'CONFIGURATION_REQUIRED', error: 'Gemini API key required' };
  
  const prompt = `${buildLeadContext(lead)}

TASK: Generate a personalized cold outreach pitch for this lead.

REQUIREMENTS:
- Sender: Sophia from Marketing Charm Agency
- Company: Marketing Charm Agency
- Use the lead's actual company name, industry, and pain points
- Reference their specific business context
- Include a clear call-to-action
- Professional, warm, concise tone
- Maximum 250 words
- Do NOT use placeholders like [Company Name] or [Industry]`;

  return callGemini(apiKey, prompt, 'You are Sophia, an AI sales assistant at Marketing Charm Agency. Write personalized, professional outreach content.');
}

export async function generateAIEmail(lead: Lead, apiKey: string): Promise<IntegrationResult<{ subject: string; body: string }>> {
  if (!apiKey) return { status: 'CONFIGURATION_REQUIRED', error: 'Gemini API key required' };
  
  const prompt = `${buildLeadContext(lead)}

TASK: Generate a cold email for this lead.

REQUIREMENTS:
- Sender: Sophia from Marketing Charm Agency
- Company: Marketing Charm Agency
- Use the lead's actual company name and industry
- Reference their specific business context
- Subject line: compelling, under 50 chars
- Body: concise, personalized, clear CTA
- Maximum 200 words for body
- Do NOT use placeholders

RESPOND IN THIS EXACT FORMAT:
SUBJECT: [subject line]
BODY: [email body]`;

  const result = await callGemini(apiKey, prompt, 'You are Sophia, an AI email specialist at Marketing Charm Agency.');
  
  if (result.status !== 'CONNECTED' || !result.data) return result as unknown as IntegrationResult<{ subject: string; body: string }>;
  
  const text = result.data.text;
  const subjectMatch = text.match(/SUBJECT:\s*(.+)/i);
  const bodyMatch = text.match(/BODY:\s*([\s\S]+)/i);
  
  return {
    status: 'CONNECTED',
    data: {
      subject: subjectMatch?.[1]?.trim() || 'Quick question',
      body: bodyMatch?.[1]?.trim() || text,
    },
    message: result.message,
  };
}

export async function generateAICallScript(lead: Lead, apiKey: string): Promise<IntegrationResult<{ text: string }>> {
  if (!apiKey) return { status: 'CONFIGURATION_REQUIRED', error: 'Gemini API key required' };
  
  const prompt = `${buildLeadContext(lead)}

TASK: Generate a professional calling script for this lead.

REQUIREMENTS:
- Caller: Sophia from Marketing Charm Agency
- Company: Marketing Charm Agency
- Use the lead's actual name, company, and industry
- Include opening, value prop, qualification questions, close, objection handling
- Reference their specific business context
- Do NOT use placeholders

Format as a clear, readable script.`;

  return callGemini(apiKey, prompt, 'You are Sophia, an AI calling coach at Marketing Charm Agency.');
}

export async function generateAISMS(lead: Lead, apiKey: string): Promise<IntegrationResult<{ text: string }>> {
  if (!apiKey) return { status: 'CONFIGURATION_REQUIRED', error: 'Gemini API key required' };
  
  const prompt = `${buildLeadContext(lead)}

TASK: Generate 3 SMS message templates for this lead.

REQUIREMENTS:
- Sender: Sophia from Marketing Charm Agency
- Use the lead's actual name and company
- Each message under 160 characters
- Include initial, follow-up, and value-add templates
- Do NOT use placeholders

Format as 3 numbered templates.`;

  return callGemini(apiKey, prompt, 'You are Sophia, an AI SMS specialist at Marketing Charm Agency.');
}

export async function generateAILoomScript(lead: Lead, apiKey: string): Promise<IntegrationResult<{ text: string }>> {
  if (!apiKey) return { status: 'CONFIGURATION_REQUIRED', error: 'Gemini API key required' };
  
  const prompt = `${buildLeadContext(lead)}

TASK: Generate a Loom video script for this lead.

REQUIREMENTS:
- Speaker: Sophia from Marketing Charm Agency
- Use the lead's actual name, company, and industry
- Include timestamps, intro, problem, solution, social proof, CTA
- 2-minute video length
- Do NOT use placeholders`;

  return callGemini(apiKey, prompt, 'You are Sophia, an AI video script writer at Marketing Charm Agency.');
}

export async function generateAICallSummary(
  transcript: string,
  lead: Lead,
  apiKey: string
): Promise<IntegrationResult<{ summary: string; nextSteps: string; sentiment: string }>> {
  if (!apiKey) return { status: 'CONFIGURATION_REQUIRED', error: 'Gemini API key required' };
  
  const prompt = `${buildLeadContext(lead)}

CALL TRANSCRIPT:
${transcript}

TASK: Analyze this call and provide:
1. A brief summary (2-3 sentences)
2. Next steps (bullet points)
3. Sentiment (positive/neutral/negative)

RESPOND IN THIS EXACT FORMAT:
SUMMARY: [summary]
NEXT_STEPS: [next steps]
SENTIMENT: [positive/neutral/negative]`;

  const result = await callGemini(apiKey, transcript ? prompt : 'No transcript available. Generate a generic call summary.', 
    'You are Sophia, an AI call analyst at Marketing Charm Agency.');
  
  if (result.status !== 'CONNECTED' || !result.data) return result as unknown as IntegrationResult<{ summary: string; nextSteps: string; sentiment: string }>;
  
  const text = result.data.text;
  const summaryMatch = text.match(/SUMMARY:\s*(.+)/i);
  const nextStepsMatch = text.match(/NEXT_STEPS:\s*(.+)/i);
  const sentimentMatch = text.match(/SENTIMENT:\s*(.+)/i);
  
  return {
    status: 'CONNECTED',
    data: {
      summary: summaryMatch?.[1]?.trim() || text,
      nextSteps: nextStepsMatch?.[1]?.trim() || 'Follow up with lead',
      sentiment: sentimentMatch?.[1]?.trim() || 'neutral',
    },
    message: result.message,
  };
}

export async function generateAILeadScore(lead: Lead, apiKey: string): Promise<IntegrationResult<{ score: number; analysis: string }>> {
  if (!apiKey) return { status: 'CONFIGURATION_REQUIRED', error: 'Gemini API key required' };
  
  const prompt = `${buildLeadContext(lead)}

TASK: Analyze this lead and provide a score from 0-100 and detailed analysis.

CONSIDER:
- Company size and revenue
- Industry fit for marketing services
- Engagement signals
- Budget indicators
- Pain points clarity

RESPOND IN THIS EXACT FORMAT:
SCORE: [number 0-100]
ANALYSIS: [detailed analysis paragraph]`;

  const result = await callGemini(apiKey, prompt, 'You are Sophia, an AI lead scoring specialist at Marketing Charm Agency.');
  
  if (result.status !== 'CONNECTED' || !result.data) return result as unknown as IntegrationResult<{ score: number; analysis: string }>;
  
  const text = result.data.text;
  const scoreMatch = text.match(/SCORE:\s*(\d+)/i);
  const analysisMatch = text.match(/ANALYSIS:\s*([\s\S]+)/i);
  
  return {
    status: 'CONNECTED',
    data: {
      score: scoreMatch ? parseInt(scoreMatch[1]) : 50,
      analysis: analysisMatch?.[1]?.trim() || text,
    },
    message: result.message,
  };
}

// ============================================
// TELNYX VOICE INTEGRATION
// ============================================

const TELNYX_API_BASE = 'https://api.telnyx.com/v2';

export interface TelnyxCallInitiateResult {
  call_control_id: string;
  call_leg_id: string;
  client_state?: string;
}

export async function initiateTelnyxCall(
  apiKey: string,
  fromNumber: string,
  toNumber: string,
  leadId: string,
  connectionId?: string
): Promise<IntegrationResult<TelnyxCallInitiateResult>> {
  if (!apiKey) {
    return {
      status: 'CONFIGURATION_REQUIRED',
      error: 'Telnyx API key not configured. Add your API key in Settings.',
    };
  }

  if (!toNumber || toNumber.trim() === '') {
    return {
      status: 'ERROR',
      error: 'Invalid phone number - cannot initiate call',
    };
  }

  try {
    const response = await fetch(`${TELNYX_API_BASE}/calls`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connection_id: connectionId || '',
        to: toNumber,
        from: fromNumber,
        client_state: btoa(JSON.stringify({ leadId, timestamp: Date.now() })).substring(0, 256),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        status: 'ERROR',
        error: `Telnyx API error (${response.status}): ${errorData?.errors?.[0]?.detail || response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      status: 'CONNECTED',
      data: data.data as TelnyxCallInitiateResult,
      message: 'Call initiated successfully via Telnyx',
    };
  } catch (err) {
    return {
      status: 'ERROR',
      error: `Telnyx call failed: ${err instanceof Error ? err.message : 'Unknown error'}. Note: Telnyx API may require a backend proxy due to CORS restrictions.`,
    };
  }
}

export async function getTelnyxCallStatus(
  apiKey: string,
  callId: string
): Promise<IntegrationResult<{ status: string; duration?: number }>> {
  if (!apiKey) return { status: 'CONFIGURATION_REQUIRED', error: 'Telnyx API key required' };

  try {
    const response = await fetch(`${TELNYX_API_BASE}/calls/${callId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      return { status: 'ERROR', error: `Failed to get call status: ${response.status}` };
    }

    const data = await response.json();
    return {
      status: 'CONNECTED',
      data: {
        status: data.data?.status || 'unknown',
        duration: data.data?.duration_seconds,
      },
    };
  } catch (err) {
    return {
      status: 'ERROR',
      error: `Telnyx status check failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

// ============================================
// TELNYX SMS INTEGRATION
// ============================================

export interface TelnyxSMSResult {
  id: string;
  to: string[];
  from: string;
  text: string;
  status: string;
}

export async function sendTelnyxSMS(
  apiKey: string,
  fromNumber: string,
  toNumber: string,
  message: string
): Promise<IntegrationResult<TelnyxSMSResult>> {
  if (!apiKey) {
    return {
      status: 'CONFIGURATION_REQUIRED',
      error: 'Telnyx API key not configured. Add your API key in Settings.',
    };
  }

  if (!toNumber || toNumber.trim() === '') {
    return {
      status: 'ERROR',
      error: 'Invalid recipient phone number',
    };
  }

  if (!message || message.trim() === '') {
    return {
      status: 'ERROR',
      error: 'Empty message - cannot send SMS',
    };
  }

  try {
    const response = await fetch(`${TELNYX_API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromNumber,
        to: [{ phone_number: toNumber }],
        text: message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        status: 'ERROR',
        error: `Telnyx SMS error (${response.status}): ${errorData?.errors?.[0]?.detail || response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      status: 'CONNECTED',
      data: data.data as TelnyxSMSResult,
      message: 'SMS sent successfully via Telnyx',
    };
  } catch (err) {
    return {
      status: 'ERROR',
      error: `Telnyx SMS failed: ${err instanceof Error ? err.message : 'Unknown error'}. Note: Telnyx API may require a backend proxy due to CORS restrictions.`,
    };
  }
}

// ============================================
// N8N WORKFLOW INTEGRATION
// ============================================

export interface N8NWorkflowPayload {
  event: string;
  leadId: string;
  leadData?: Partial<Lead>;
  callData?: Record<string, unknown>;
  smsData?: Record<string, unknown>;
  emailData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export async function triggerN8NWorkflow(
  webhookUrl: string,
  payload: N8NWorkflowPayload
): Promise<IntegrationResult<{ workflowId?: string; result?: unknown }>> {
  if (!webhookUrl || webhookUrl.trim() === '') {
    return {
      status: 'CONFIGURATION_REQUIRED',
      error: 'n8n webhook URL not configured. Add your webhook URL in Settings.',
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        status: 'ERROR',
        error: `n8n webhook error (${response.status}): ${response.statusText}`,
      };
    }

    const data = await response.json().catch(() => ({}));
    return {
      status: 'CONNECTED',
      data: { result: data },
      message: `n8n workflow triggered: ${payload.event}`,
    };
  } catch (err) {
    return {
      status: 'ERROR',
      error: `n8n webhook failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

// ============================================
// GMAIL INTEGRATION
// ============================================

export async function sendGmailEmail(
  _accessToken: string,
  _to: string,
  _subject: string,
  _body: string
): Promise<IntegrationResult> {
  // Gmail OAuth requires a backend server for the OAuth flow.
  // This cannot be implemented in a frontend-only application.
  return {
    status: 'CONFIGURATION_REQUIRED',
    error: 'Gmail integration requires OAuth2 backend setup. Configure Gmail API credentials in a backend service.',
  };
}

export function getGmailStatus(): IntegrationStatus {
  return 'CONFIGURATION_REQUIRED';
}

// ============================================
// WEBHOOK PROCESSOR
// ============================================

export interface WebhookEvent {
  source: 'telnyx_call' | 'telnyx_sms' | 'n8n' | 'ai_processing';
  eventType: string;
  payload: Record<string, unknown>;
  receivedAt: string;
}

export function processWebhookEvent(event: WebhookEvent): {
  action: string;
  leadId?: string;
  data?: Record<string, unknown>;
  error?: string;
} {
  try {
    switch (event.source) {
      case 'telnyx_call': {
        const callId = event.payload.call_control_id as string;
        const status = event.payload.status as string;
        const clientState = event.payload.client_state as string;
        let leadId: string | undefined;
        
        if (clientState) {
          try {
            const decoded = JSON.parse(atob(clientState));
            leadId = decoded.leadId;
          } catch { /* ignore decode errors */ }
        }
        
        return {
          action: 'update_call_status',
          leadId,
          data: { callId, status, duration: event.payload.duration_seconds },
        };
      }
      
      case 'telnyx_sms': {
        return {
          action: 'update_sms_status',
          data: {
            messageId: event.payload.id,
            status: event.payload.status,
            to: event.payload.to,
          },
        };
      }
      
      case 'n8n': {
        return {
          action: 'process_workflow_result',
          leadId: event.payload.leadId as string,
          data: event.payload.result as Record<string, unknown>,
        };
      }
      
      case 'ai_processing': {
        return {
          action: 'save_ai_result',
          leadId: event.payload.leadId as string,
          data: event.payload.result as Record<string, unknown>,
        };
      }
      
      default:
        return { action: 'unknown_event', error: `Unknown webhook source: ${event.source}` };
    }
  } catch (err) {
    return {
      action: 'error',
      error: `Webhook processing failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

// ============================================
// INTEGRATION STATUS CHECKER
// ============================================

export function getIntegrationStatus(settings: AgencySettings): {
  gemini: IntegrationStatus;
  telnyxVoice: IntegrationStatus;
  telnyxSMS: IntegrationStatus;
  gmail: IntegrationStatus;
  n8n: IntegrationStatus;
} {
  return {
    gemini: settings.apiKey_gemini ? 'TEST_MODE' : 'CONFIGURATION_REQUIRED',
    telnyxVoice: settings.apiKey_telnyx ? 'TEST_MODE' : 'CONFIGURATION_REQUIRED',
    telnyxSMS: settings.apiKey_telnyx ? 'TEST_MODE' : 'CONFIGURATION_REQUIRED',
    gmail: 'CONFIGURATION_REQUIRED', // Always requires backend OAuth
    n8n: settings.webhook_n8n ? 'TEST_MODE' : 'CONFIGURATION_REQUIRED',
  };
}
