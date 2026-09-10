export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type LeadSource = 'website' | 'referral' | 'cold_outreach' | 'social_media' | 'import' | 'other';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type CallStatus = 'completed' | 'missed' | 'voicemail' | 'busy' | 'failed';
export type EmailStatus = 'sent' | 'draft' | 'failed' | 'scheduled';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  status: LeadStatus;
  source: LeadSource;
  score: number;
  notes: string;
  address: string;
  website: string;
  revenue: string;
  employees: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  duplicateOf?: string;
}

export interface CRMNote {
  id: string;
  leadId: string;
  content: string;
  type: 'note' | 'call' | 'email' | 'meeting';
  createdAt: string;
  createdBy: string;
}

export interface Task {
  id: string;
  leadId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
}

export interface Activity {
  id: string;
  leadId: string;
  type: 'call' | 'email' | 'sms' | 'note' | 'status_change' | 'created' | 'imported' | 'ai_generated';
  description: string;
  metadata?: Record<string, string>;
  createdAt: string;
}

export interface CallRecord {
  id: string;
  leadId: string;
  direction: 'outbound' | 'inbound';
  status: CallStatus;
  duration: number;
  transcript?: string;
  aiSummary?: string;
  recordingUrl?: string;
  createdAt: string;
}

export interface EmailRecord {
  id: string;
  leadId: string;
  subject: string;
  body: string;
  status: EmailStatus;
  sentAt?: string;
  createdAt: string;
}

export interface SMSRecord {
  id: string;
  leadId: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  createdAt: string;
}

export interface AIContent {
  id: string;
  leadId: string;
  type: 'pitch' | 'email' | 'calling_script' | 'loom_script' | 'sms_script' | 'lead_score_analysis';
  content: string;
  createdAt: string;
}

export interface LeadAudit {
  id: string;
  leadId: string;
  score: number;
  factors: Record<string, number>;
  recommendation: string;
  createdAt: string;
}

export interface Client {
  id: string;
  leadId?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  mrr: number;
  startDate: string;
  status: 'active' | 'inactive' | 'churned';
  createdAt: string;
}

export interface ClientService {
  id: string;
  clientId: string;
  name: string;
  price: number;
  status: 'active' | 'paused' | 'completed';
  startDate: string;
}

export interface AgencySettings {
  id: string;
  agencyName: string;
  apiKey_gemini: string;
  apiKey_telnyx: string;
  webhook_n8n: string;
  gmailConnected: boolean;
  telnyxVoiceConnected: boolean;
  telnyxSMSConnected: boolean;
  n8nConnected: boolean;
  updatedAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  wonLeads: number;
  lostLeads: number;
  totalClients: number;
  totalMRR: number;
  conversionRate: number;
  callsToday: number;
  emailsToday: number;
  tasksPending: number;
}
