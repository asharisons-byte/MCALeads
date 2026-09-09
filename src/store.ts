import { v4 as uuidv4 } from 'uuid';
import type {
  Lead, CRMNote, Task, Activity, CallRecord, EmailRecord,
  SMSRecord, AIContent, LeadAudit, Client,
  AgencySettings, DashboardStats, LeadStatus
} from './types';

const STORAGE_KEYS = {
  leads: 'mca_leads',
  notes: 'mca_notes',
  tasks: 'mca_tasks',
  activities: 'mca_activities',
  calls: 'mca_calls',
  emails: 'mca_emails',
  sms: 'mca_sms',
  aiContent: 'mca_ai_content',
  audits: 'mca_audits',
  clients: 'mca_clients',
  clientServices: 'mca_client_services',
  settings: 'mca_settings',
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Seed data
function seedData() {
  const existingLeads = getItem<Lead[]>(STORAGE_KEYS.leads, []);
  if (existingLeads.length > 0) return;

  const leads: Lead[] = [
    { id: uuidv4(), firstName: 'John', lastName: 'Smith', email: 'john@techcorp.com', phone: '+1-555-0101', company: 'TechCorp Solutions', industry: 'Technology', status: 'new', source: 'website', score: 85, notes: 'Interested in marketing automation', address: '123 Tech Blvd, Austin, TX', website: 'techcorp.com', revenue: '$2M-$5M', employees: '50-100', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date().toISOString(), archived: false },
    { id: uuidv4(), firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@greenleaf.co', phone: '+1-555-0102', company: 'GreenLeaf Organics', industry: 'Food & Beverage', status: 'contacted', source: 'referral', score: 72, notes: 'Referred by existing client', address: '456 Organic Ave, Portland, OR', website: 'greenleaf.co', revenue: '$500K-$1M', employees: '10-25', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString(), archived: false },
    { id: uuidv4(), firstName: 'Michael', lastName: 'Chen', email: 'mchen@buildright.com', phone: '+1-555-0103', company: 'BuildRight Construction', industry: 'Construction', status: 'qualified', source: 'cold_outreach', score: 91, notes: 'High budget, ready to start', address: '789 Builder Lane, Denver, CO', website: 'buildright.com', revenue: '$5M-$10M', employees: '100-250', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(), archived: false },
    { id: uuidv4(), firstName: 'Emily', lastName: 'Davis', email: 'emily@stylehub.com', phone: '+1-555-0104', company: 'StyleHub Fashion', industry: 'Retail', status: 'proposal', source: 'social_media', score: 68, notes: 'Reviewing our proposal', address: '321 Fashion St, Los Angeles, CA', website: 'stylehub.com', revenue: '$1M-$2M', employees: '25-50', createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(), archived: false },
    { id: uuidv4(), firstName: 'Robert', lastName: 'Wilson', email: 'rwilson@medplus.com', phone: '+1-555-0105', company: 'MedPlus Health', industry: 'Healthcare', status: 'won', source: 'referral', score: 95, notes: 'Signed contract - $5K/month', address: '654 Health Dr, Chicago, IL', website: 'medplus.com', revenue: '$10M+', employees: '250+', createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(), archived: false },
    { id: uuidv4(), firstName: 'Lisa', lastName: 'Martinez', email: 'lisa@edulearn.com', phone: '+1-555-0106', company: 'EduLearn Platform', industry: 'Education', status: 'new', source: 'website', score: 60, notes: 'Submitted contact form', address: '987 Learn Way, Boston, MA', website: 'edulearn.com', revenue: '$500K-$1M', employees: '10-25', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString(), archived: false },
    { id: uuidv4(), firstName: 'David', lastName: 'Brown', email: 'david@autopro.com', phone: '+1-555-0107', company: 'AutoPro Mechanics', industry: 'Automotive', status: 'contacted', source: 'cold_outreach', score: 45, notes: 'Low budget concern', address: '147 Motor Rd, Detroit, MI', website: 'autopro.com', revenue: '$250K-$500K', employees: '5-10', createdAt: new Date(Date.now() - 86400000 * 8).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(), archived: false },
    { id: uuidv4(), firstName: 'Amanda', lastName: 'Taylor', email: 'amanda@luxstay.com', phone: '+1-555-0108', company: 'LuxStay Hotels', industry: 'Hospitality', status: 'negotiation', source: 'referral', score: 88, notes: 'Negotiating pricing terms', address: '258 Luxury Ave, Miami, FL', website: 'luxstay.com', revenue: '$5M-$10M', employees: '100-250', createdAt: new Date(Date.now() - 86400000 * 20).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString(), archived: false },
  ];

  setItem(STORAGE_KEYS.leads, leads);

  const clients: Client[] = [
    { id: uuidv4(), leadId: leads[4].id, name: 'Robert Wilson', email: 'rwilson@medplus.com', phone: '+1-555-0105', company: 'MedPlus Health', service: 'Full Marketing Suite', mrr: 5000, startDate: new Date(Date.now() - 86400000 * 7).toISOString(), status: 'active', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
    { id: uuidv4(), name: 'TechFlow Inc', email: 'contact@techflow.com', phone: '+1-555-0200', company: 'TechFlow Inc', service: 'SEO & Content', mrr: 3000, startDate: new Date(Date.now() - 86400000 * 45).toISOString(), status: 'active', createdAt: new Date(Date.now() - 86400000 * 45).toISOString() },
    { id: uuidv4(), name: 'FreshFoods Co', email: 'hello@freshfoods.com', phone: '+1-555-0300', company: 'FreshFoods Co', service: 'Social Media Management', mrr: 2500, startDate: new Date(Date.now() - 86400000 * 60).toISOString(), status: 'active', createdAt: new Date(Date.now() - 86400000 * 60).toISOString() },
  ];
  setItem(STORAGE_KEYS.clients, clients);

  const tasks: Task[] = [
    { id: uuidv4(), leadId: leads[0].id, title: 'Follow up with John', description: 'Send personalized email about our services', priority: 'high', status: 'pending', dueDate: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString() },
    { id: uuidv4(), leadId: leads[2].id, title: 'Prepare proposal for BuildRight', description: 'Custom proposal with ROI projections', priority: 'urgent', status: 'in_progress', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: uuidv4(), leadId: leads[3].id, title: 'Schedule demo call', description: 'Demo our platform capabilities', priority: 'medium', status: 'pending', dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  ];
  setItem(STORAGE_KEYS.tasks, tasks);

  const notes: CRMNote[] = [
    { id: uuidv4(), leadId: leads[0].id, content: 'Initial contact via website form. Very interested in automation.', type: 'note', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), createdBy: 'Sophia AI' },
    { id: uuidv4(), leadId: leads[2].id, content: 'Had discovery call. Budget confirmed at $8K/month. Decision maker is the CEO.', type: 'call', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), createdBy: 'Sophia AI' },
    { id: uuidv4(), leadId: leads[4].id, content: 'Contract signed! Onboarding starts next week.', type: 'note', createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), createdBy: 'Sophia AI' },
  ];
  setItem(STORAGE_KEYS.notes, notes);

  const activities: Activity[] = [
    { id: uuidv4(), leadId: leads[0].id, type: 'created', description: 'Lead created from website form', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: uuidv4(), leadId: leads[1].id, type: 'email', description: 'Introduction email sent', createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
    { id: uuidv4(), leadId: leads[2].id, type: 'call', description: 'Discovery call completed - 25 minutes', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: uuidv4(), leadId: leads[4].id, type: 'status_change', description: 'Status changed to Won', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
    { id: uuidv4(), leadId: leads[3].id, type: 'ai_generated', description: 'AI pitch generated for StyleHub', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  ];
  setItem(STORAGE_KEYS.activities, activities);

  const calls: CallRecord[] = [
    { id: uuidv4(), leadId: leads[2].id, direction: 'outbound', status: 'completed', duration: 1500, transcript: 'Discussed marketing needs. Client interested in full suite.', aiSummary: 'Qualified lead with $8K/month budget. Decision maker engaged.', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: uuidv4(), leadId: leads[1].id, direction: 'outbound', status: 'completed', duration: 600, transcript: 'Brief intro call. Sarah wants to review proposal first.', createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
    { id: uuidv4(), leadId: leads[6].id, direction: 'outbound', status: 'missed', duration: 0, createdAt: new Date(Date.now() - 86400000 * 6).toISOString() },
  ];
  setItem(STORAGE_KEYS.calls, calls);

  const settings: AgencySettings = {
    id: uuidv4(),
    agencyName: 'Marketing Charm Agency',
    apiKey_gemini: '',
    apiKey_telnyx: '',
    webhook_n8n: '',
    gmailConnected: false,
    telnyxVoiceConnected: false,
    telnyxSMSConnected: false,
    n8nConnected: false,
    updatedAt: new Date().toISOString(),
  };
  setItem(STORAGE_KEYS.settings, settings);
}

// Initialize seed data
seedData();

// CRUD Operations
export const store = {
  // Leads
  getLeads: (): Lead[] => getItem<Lead[]>(STORAGE_KEYS.leads, []),
  getLead: (id: string): Lead | undefined => getItem<Lead[]>(STORAGE_KEYS.leads, []).find(l => l.id === id),
  createLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'archived'>): Lead => {
    const leads = getItem<Lead[]>(STORAGE_KEYS.leads, []);
    const newLead: Lead = { ...lead, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), archived: false };
    leads.push(newLead);
    setItem(STORAGE_KEYS.leads, leads);
    store.addActivity(newLead.id, 'created', 'Lead created');
    return newLead;
  },
  updateLead: (id: string, updates: Partial<Lead>): Lead | undefined => {
    const leads = getItem<Lead[]>(STORAGE_KEYS.leads, []);
    const idx = leads.findIndex(l => l.id === id);
    if (idx === -1) return undefined;
    const oldStatus = leads[idx].status;
    leads[idx] = { ...leads[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.leads, leads);
    if (updates.status && updates.status !== oldStatus) {
      store.addActivity(id, 'status_change', `Status changed from ${oldStatus} to ${updates.status}`);
    }
    return leads[idx];
  },
  deleteLead: (id: string): boolean => {
    const leads = getItem<Lead[]>(STORAGE_KEYS.leads, []);
    const filtered = leads.filter(l => l.id !== id);
    setItem(STORAGE_KEYS.leads, filtered);
    return true;
  },
  archiveLead: (id: string): void => {
    store.updateLead(id, { archived: true });
  },

  // Duplicate detection
  detectDuplicates: (lead: Partial<Lead>): Lead[] => {
    const leads = getItem<Lead[]>(STORAGE_KEYS.leads, []);
    return leads.filter(l =>
      (lead.email && l.email.toLowerCase() === lead.email.toLowerCase()) ||
      (lead.phone && l.phone === lead.phone)
    );
  },

  // Notes
  getNotes: (leadId: string): CRMNote[] => getItem<CRMNote[]>(STORAGE_KEYS.notes, []).filter(n => n.leadId === leadId),
  createNote: (note: Omit<CRMNote, 'id' | 'createdAt'>): CRMNote => {
    const notes = getItem<CRMNote[]>(STORAGE_KEYS.notes, []);
    const newNote: CRMNote = { ...note, id: uuidv4(), createdAt: new Date().toISOString() };
    notes.push(newNote);
    setItem(STORAGE_KEYS.notes, notes);
    return newNote;
  },

  // Tasks
  getTasks: (leadId?: string): Task[] => {
    const tasks = getItem<Task[]>(STORAGE_KEYS.tasks, []);
    return leadId ? tasks.filter(t => t.leadId === leadId) : tasks;
  },
  createTask: (task: Omit<Task, 'id' | 'createdAt'>): Task => {
    const tasks = getItem<Task[]>(STORAGE_KEYS.tasks, []);
    const newTask: Task = { ...task, id: uuidv4(), createdAt: new Date().toISOString() };
    tasks.push(newTask);
    setItem(STORAGE_KEYS.tasks, tasks);
    return newTask;
  },
  updateTask: (id: string, updates: Partial<Task>): Task | undefined => {
    const tasks = getItem<Task[]>(STORAGE_KEYS.tasks, []);
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    tasks[idx] = { ...tasks[idx], ...updates };
    if (updates.status === 'completed') tasks[idx].completedAt = new Date().toISOString();
    setItem(STORAGE_KEYS.tasks, tasks);
    return tasks[idx];
  },

  // Activities
  getActivities: (leadId: string): Activity[] => getItem<Activity[]>(STORAGE_KEYS.activities, []).filter(a => a.leadId === leadId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  addActivity: (leadId: string, type: Activity['type'], description: string, metadata?: Record<string, string>): Activity => {
    const activities = getItem<Activity[]>(STORAGE_KEYS.activities, []);
    const activity: Activity = { id: uuidv4(), leadId, type, description, metadata, createdAt: new Date().toISOString() };
    activities.push(activity);
    setItem(STORAGE_KEYS.activities, activities);
    return activity;
  },

  // Calls
  getCalls: (leadId?: string): CallRecord[] => {
    const calls = getItem<CallRecord[]>(STORAGE_KEYS.calls, []);
    return leadId ? calls.filter(c => c.leadId === leadId) : calls;
  },
  createCall: (call: Omit<CallRecord, 'id' | 'createdAt'>): CallRecord => {
    const calls = getItem<CallRecord[]>(STORAGE_KEYS.calls, []);
    const newCall: CallRecord = { ...call, id: uuidv4(), createdAt: new Date().toISOString() };
    calls.push(newCall);
    setItem(STORAGE_KEYS.calls, calls);
    store.addActivity(call.leadId, 'call', `Call ${call.direction} - ${call.status} (${Math.floor(call.duration / 60)}m ${call.duration % 60}s)`);
    return newCall;
  },

  // Emails
  getEmails: (leadId?: string): EmailRecord[] => {
    const emails = getItem<EmailRecord[]>(STORAGE_KEYS.emails, []);
    return leadId ? emails.filter(e => e.leadId === leadId) : emails;
  },
  createEmail: (email: Omit<EmailRecord, 'id' | 'createdAt'>): EmailRecord => {
    const emails = getItem<EmailRecord[]>(STORAGE_KEYS.emails, []);
    const newEmail: EmailRecord = { ...email, id: uuidv4(), createdAt: new Date().toISOString() };
    emails.push(newEmail);
    setItem(STORAGE_KEYS.emails, emails);
    store.addActivity(email.leadId, 'email', `Email sent: ${email.subject}`);
    return newEmail;
  },

  // SMS
  getSMS: (leadId?: string): SMSRecord[] => {
    const sms = getItem<SMSRecord[]>(STORAGE_KEYS.sms, []);
    return leadId ? sms.filter(s => s.leadId === leadId) : sms;
  },
  createSMS: (sms: Omit<SMSRecord, 'id' | 'createdAt'>): SMSRecord => {
    const records = getItem<SMSRecord[]>(STORAGE_KEYS.sms, []);
    const newSms: SMSRecord = { ...sms, id: uuidv4(), createdAt: new Date().toISOString() };
    records.push(newSms);
    setItem(STORAGE_KEYS.sms, records);
    store.addActivity(sms.leadId, 'sms', `SMS sent: ${sms.message.substring(0, 50)}...`);
    return newSms;
  },

  // AI Content
  getAIContent: (leadId: string): AIContent[] => getItem<AIContent[]>(STORAGE_KEYS.aiContent, []).filter(c => c.leadId === leadId),
  createAIContent: (content: Omit<AIContent, 'id' | 'createdAt'>): AIContent => {
    const contents = getItem<AIContent[]>(STORAGE_KEYS.aiContent, []);
    const newContent: AIContent = { ...content, id: uuidv4(), createdAt: new Date().toISOString() };
    contents.push(newContent);
    setItem(STORAGE_KEYS.aiContent, contents);
    store.addActivity(content.leadId, 'ai_generated', `AI ${content.type} generated`);
    return newContent;
  },

  // Audits
  getAudits: (leadId: string): LeadAudit[] => getItem<LeadAudit[]>(STORAGE_KEYS.audits, []).filter(a => a.leadId === leadId),
  createAudit: (audit: Omit<LeadAudit, 'id' | 'createdAt'>): LeadAudit => {
    const audits = getItem<LeadAudit[]>(STORAGE_KEYS.audits, []);
    const newAudit: LeadAudit = { ...audit, id: uuidv4(), createdAt: new Date().toISOString() };
    audits.push(newAudit);
    setItem(STORAGE_KEYS.audits, audits);
    return newAudit;
  },

  // Clients
  getClients: (): Client[] => getItem<Client[]>(STORAGE_KEYS.clients, []),
  createClient: (client: Omit<Client, 'id' | 'createdAt'>): Client => {
    const clients = getItem<Client[]>(STORAGE_KEYS.clients, []);
    const newClient: Client = { ...client, id: uuidv4(), createdAt: new Date().toISOString() };
    clients.push(newClient);
    setItem(STORAGE_KEYS.clients, clients);
    return newClient;
  },
  updateClient: (id: string, updates: Partial<Client>): Client | undefined => {
    const clients = getItem<Client[]>(STORAGE_KEYS.clients, []);
    const idx = clients.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    clients[idx] = { ...clients[idx], ...updates };
    setItem(STORAGE_KEYS.clients, clients);
    return clients[idx];
  },

  // Settings
  getSettings: (): AgencySettings => getItem<AgencySettings>(STORAGE_KEYS.settings, {
    id: '', agencyName: 'Marketing Charm Agency', apiKey_gemini: '', apiKey_telnyx: '',
    webhook_n8n: '', gmailConnected: false, telnyxVoiceConnected: false,
    telnyxSMSConnected: false, n8nConnected: false, updatedAt: new Date().toISOString()
  }),
  updateSettings: (updates: Partial<AgencySettings>): AgencySettings => {
    const settings = store.getSettings();
    const updated = { ...settings, ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.settings, updated);
    return updated;
  },

  // Dashboard Stats
  getDashboardStats: (): DashboardStats => {
    const leads = store.getLeads();
    const clients = store.getClients();
    const tasks = store.getTasks();
    const calls = store.getCalls();
    const emails = store.getEmails();
    const today = new Date().toDateString();

    return {
      totalLeads: leads.filter(l => !l.archived).length,
      newLeads: leads.filter(l => l.status === 'new' && !l.archived).length,
      contactedLeads: leads.filter(l => l.status === 'contacted' && !l.archived).length,
      qualifiedLeads: leads.filter(l => l.status === 'qualified' && !l.archived).length,
      wonLeads: leads.filter(l => l.status === 'won' && !l.archived).length,
      lostLeads: leads.filter(l => l.status === 'lost' && !l.archived).length,
      totalClients: clients.filter(c => c.status === 'active').length,
      totalMRR: clients.filter(c => c.status === 'active').reduce((sum, c) => sum + c.mrr, 0),
      conversionRate: leads.length > 0 ? Math.round((leads.filter(l => l.status === 'won').length / leads.length) * 100) : 0,
      callsToday: calls.filter(c => new Date(c.createdAt).toDateString() === today).length,
      emailsToday: emails.filter(e => new Date(e.createdAt).toDateString() === today).length,
      tasksPending: tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length,
    };
  },

  // Import leads from CSV/Excel data
  importLeads: (data: Partial<Lead>[]): { imported: number; duplicates: number } => {
    let imported = 0;
    let duplicates = 0;
    data.forEach(row => {
      const dupes = store.detectDuplicates(row);
      if (dupes.length > 0) {
        duplicates++;
        return;
      }
      store.createLead({
        firstName: row.firstName || '',
        lastName: row.lastName || '',
        email: row.email || '',
        phone: row.phone || '',
        company: row.company || '',
        industry: row.industry || '',
        status: 'new',
        source: 'import',
        score: 50,
        notes: row.notes || '',
        address: row.address || '',
        website: row.website || '',
        revenue: row.revenue || '',
        employees: row.employees || '',
      });
      imported++;
    });
    return { imported, duplicates };
  },

  // Convert lead to client
  convertToClient: (leadId: string): Client | undefined => {
    const lead = store.getLead(leadId);
    if (!lead) return undefined;
    const client = store.createClient({
      leadId,
      name: `${lead.firstName} ${lead.lastName}`,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      service: 'TBD',
      mrr: 0,
      startDate: new Date().toISOString(),
      status: 'active',
    });
    store.updateLead(leadId, { status: 'won' });
    return client;
  },
};

// AI Generation Functions (Simulated - requires Gemini API key for real)
export const aiGenerator = {
  generateLeadScore: (lead: Lead): LeadAudit => {
    const factors: Record<string, number> = {
      engagement: Math.min(100, lead.score + Math.floor(Math.random() * 10 - 5)),
      budget_fit: lead.revenue.includes('$5M') || lead.revenue.includes('$10M') ? 90 : lead.revenue.includes('$2M') ? 70 : 50,
      industry_match: ['Technology', 'Healthcare', 'Finance'].includes(lead.industry) ? 85 : 65,
      company_size: parseInt(lead.employees) > 50 ? 80 : parseInt(lead.employees) > 10 ? 65 : 40,
      responsiveness: lead.status === 'qualified' ? 90 : lead.status === 'contacted' ? 70 : 50,
    };
    const avgScore = Math.round(Object.values(factors).reduce((a, b) => a + b, 0) / Object.keys(factors).length);
    const recommendation = avgScore > 80 ? 'High priority - immediate outreach recommended' :
      avgScore > 60 ? 'Medium priority - nurture sequence recommended' : 'Low priority - add to long-term nurture';
    return { id: uuidv4(), leadId: lead.id, score: avgScore, factors, recommendation, createdAt: new Date().toISOString() };
  },

  generatePitch: (lead: Lead): string => {
    return `Dear ${lead.firstName},

I hope this message finds you well. I'm reaching out from Marketing Charm Agency because I noticed ${lead.company} is positioned for significant growth in the ${lead.industry} space.

Based on our analysis, companies like yours with ${lead.employees} employees and $${lead.revenue} in revenue typically see 3-5x ROI when implementing our data-driven marketing strategies.

Here's what makes us different:
• AI-powered lead scoring that identifies your best prospects
• Automated multi-channel outreach (email, SMS, calls)
• Real-time analytics and optimization
• Dedicated account management

I'd love to schedule a 15-minute call to discuss how we can help ${lead.company} achieve its growth targets.

Would ${lead.firstName === 'John' ? 'Tuesday' : 'Wednesday'} at 2 PM work for a quick chat?

Best regards,
Sophia AI
Marketing Charm Agency`;
  },

  generateEmail: (lead: Lead): { subject: string; body: string } => {
    const subject = `Quick question about ${lead.company}'s growth strategy`;
    const body = `Hi ${lead.firstName},

I came across ${lead.company} and was impressed by what you're building in the ${lead.industry} industry.

We've helped similar companies increase their qualified leads by 200% in just 90 days using our AI-driven marketing system.

Would you be open to a brief 15-minute call this week to explore if there's a fit?

No pressure either way - just wanted to reach out.

Best,
Marketing Charm Agency`;
    return { subject, body };
  },

  generateCallingScript: (lead: Lead): string => {
    return `CALLING SCRIPT FOR: ${lead.firstName} ${lead.lastName} - ${lead.company}

OPENING (15 seconds):
"Hi ${lead.firstName}, this is [Your Name] from Marketing Charm Agency. I know you're busy, so I'll be brief. I'm calling because we've been working with ${lead.industry} companies like yours and found some interesting opportunities. Do you have 2 minutes?"

VALUE PROPOSITION (30 seconds):
"We specialize in helping ${lead.industry} companies like ${lead.company} generate more qualified leads using AI-powered marketing. Our clients typically see a 3-5x return on their marketing investment within the first quarter."

QUALIFICATION QUESTIONS:
1. "How are you currently handling your lead generation?"
2. "What's your biggest challenge with marketing right now?"
3. "If you could improve one thing about your current marketing, what would it be?"
4. "What does your ideal customer look like?"

CLOSE:
"Based on what you've shared, I think we could really help. Would it make sense to schedule a 30-minute deep dive where I can show you exactly how this would work for ${lead.company}? I have availability ${lead.firstName === 'John' ? 'Tuesday or Wednesday' : 'Thursday or Friday'}."

OBJECTION HANDLING:
- "Not interested" → "I understand. Just out of curiosity, is it the timing or the offering?"
- "Send me info" → "Absolutely, I'll send that over. When would be a good time to follow up?"
- "We have someone" → "That's great! Most of our clients did too. We usually complement existing efforts."`;
  },

  generateLoomScript: (lead: Lead): string => {
    return `LOOM VIDEO SCRIPT FOR: ${lead.company}

[0:00-0:15] INTRO:
"Hey ${lead.firstName}! I made this quick video specifically for ${lead.company} because I noticed something interesting about your current marketing approach."

[0:15-0:45] THE PROBLEM:
"Looking at the ${lead.industry} space, most companies your size are leaving money on the table because their lead generation isn't optimized for today's digital landscape."

[0:45-1:30] THE SOLUTION:
"Here's what we'd do for ${lead.company}: [Show dashboard/case study]. This is exactly the kind of system we'd build for you."

[1:30-2:00] SOCIAL PROOF:
"We did something similar for [Client Name] and they saw [specific result] in just [timeframe]."

[2:00-2:15] CTA:
"I'd love to walk you through this live. Here's my calendar link - pick a time that works for you. Talk soon!"`;
  },

  generateSMSScript: (lead: Lead): string => {
    return `SMS TEMPLATES FOR: ${lead.firstName} ${lead.lastName}

TEMPLATE 1 (Initial):
"Hi ${lead.firstName}! This is Sophia from Marketing Charm Agency. I noticed ${lead.company} could benefit from our AI marketing system. Quick 2-min chat this week? Reply YES or call ${lead.phone}"

TEMPLATE 2 (Follow-up):
"Hey ${lead.firstName}, just following up! We helped a similar ${lead.industry} company increase leads by 200%. Worth a quick call? - Sophia"

TEMPLATE 3 (Value-add):
"${lead.firstName}, I put together a quick analysis of ${lead.company}'s online presence. Mind if I send it over? No strings attached. - Sophia"`;
  },
};
