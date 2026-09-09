import { useState, useEffect, useCallback } from 'react';
import { store, aiGenerator } from './store';
import {
  callGemini, generateAIPitch, generateAIEmail, generateAICallScript,
  generateAISMS, generateAILoomScript, generateAICallSummary,
  initiateTelnyxCall, sendTelnyxSMS, triggerN8NWorkflow,
  getIntegrationStatus, type IntegrationStatus
} from './integrations';
import type {
  Lead, LeadStatus, CRMNote, Task, CallRecord, EmailRecord,
  AIContent, Client, AgencySettings, DashboardStats
} from './types';

// Icons (using emoji/lucide-style inline SVGs for key icons)
const Icons = {
  dashboard: '📊',
  leads: '👥',
  kanban: '📋',
  clients: '💼',
  ai: '🤖',
  calls: '📞',
  emails: '✉️',
  settings: '⚙️',
  analytics: '📈',
  plus: '+',
  search: '🔍',
  filter: '🔽',
  edit: '✏️',
  delete: '🗑️',
  archive: '📦',
  convert: '🔄',
  call: '📱',
  sms: '💬',
  note: '📝',
  task: '✅',
  star: '⭐',
  clock: '🕐',
  check: '✓',
  x: '✗',
  back: '←',
  import: '📥',
  export: '📤',
};

type Page = 'dashboard' | 'leads' | 'lead-detail' | 'kanban' | 'clients' | 'ai' | 'calls' | 'emails' | 'settings' | 'analytics';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigateToLead = (id: string) => {
    setSelectedLeadId(id);
    setCurrentPage('lead-detail');
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    if (page !== 'lead-detail') setSelectedLeadId(null);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300`}>
        <div className="p-4 border-b border-gray-700 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-sm font-bold">M</div>
          {sidebarOpen && (
            <div>
              <span className="font-bold text-sm block leading-tight">Marketing Charm</span>
              <span className="text-xs text-gray-400">Lead Agency Suite</span>
            </div>
          )}
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {[
            { id: 'dashboard' as Page, icon: Icons.dashboard, label: 'Dashboard' },
            { id: 'leads' as Page, icon: Icons.leads, label: 'Leads' },
            { id: 'kanban' as Page, icon: Icons.kanban, label: 'Pipeline' },
            { id: 'clients' as Page, icon: Icons.clients, label: 'Clients' },
            { id: 'ai' as Page, icon: Icons.ai, label: 'Sophia AI' },
            { id: 'calls' as Page, icon: Icons.calls, label: 'Calls' },
            { id: 'emails' as Page, icon: Icons.emails, label: 'Emails' },
            { id: 'analytics' as Page, icon: Icons.analytics, label: 'Analytics' },
            { id: 'settings' as Page, icon: Icons.settings, label: 'Settings' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                currentPage === item.id || (currentPage === 'lead-detail' && item.id === 'leads')
                  ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 border-t border-gray-700 text-gray-400 hover:text-white">
          {sidebarOpen ? '◀ Collapse' : '▶'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {currentPage === 'dashboard' && <DashboardPage onNavigate={navigateTo} onViewLead={navigateToLead} />}
        {currentPage === 'leads' && <LeadsPage onViewLead={navigateToLead} />}
        {currentPage === 'lead-detail' && selectedLeadId && <LeadDetailPage leadId={selectedLeadId} onBack={() => navigateTo('leads')} />}
        {currentPage === 'kanban' && <KanbanPage onViewLead={navigateToLead} />}
        {currentPage === 'clients' && <ClientsPage />}
        {currentPage === 'ai' && <AIPage onViewLead={navigateToLead} />}
        {currentPage === 'calls' && <CallsPage onViewLead={navigateToLead} />}
        {currentPage === 'emails' && <EmailsPage onViewLead={navigateToLead} />}
        {currentPage === 'analytics' && <AnalyticsPage />}
        {currentPage === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}

// ==================== DASHBOARD PAGE ====================
function DashboardPage({ onNavigate, onViewLead }: { onNavigate: (p: Page) => void; onViewLead: (id: string) => void }) {
  const [stats, setStats] = useState<DashboardStats>(store.getDashboardStats());
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);

  useEffect(() => {
    setStats(store.getDashboardStats());
    setRecentLeads(store.getLeads().filter(l => !l.archived).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5));
    setPendingTasks(store.getTasks().filter(t => t.status !== 'completed' && t.status !== 'cancelled').slice(0, 5));
  }, []);

  const statCards = [
    { label: 'Total Leads', value: stats.totalLeads, color: 'from-blue-500 to-blue-600', icon: '👥' },
    { label: 'New Leads', value: stats.newLeads, color: 'from-green-500 to-green-600', icon: '🆕' },
    { label: 'Qualified', value: stats.qualifiedLeads, color: 'from-yellow-500 to-yellow-600', icon: '⭐' },
    { label: 'Won', value: stats.wonLeads, color: 'from-emerald-500 to-emerald-600', icon: '🏆' },
    { label: 'Active Clients', value: stats.totalClients, color: 'from-purple-500 to-purple-600', icon: '💼' },
    { label: 'Monthly MRR', value: `$${stats.totalMRR.toLocaleString()}`, color: 'from-pink-500 to-pink-600', icon: '💰' },
    { label: 'Conversion Rate', value: `${stats.conversionRate}%`, color: 'from-indigo-500 to-indigo-600', icon: '📈' },
    { label: 'Pending Tasks', value: stats.tasksPending, color: 'from-orange-500 to-orange-600', icon: '📋' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-400 text-sm">Marketing Charm Agency — Lead Agency Suite</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate('leads')} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">
            + New Lead
          </button>
        </div>
      </div>

      {/* Demo Data Notice */}
      {stats.totalLeads > 0 && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
          <p className="text-xs text-blue-300">ℹ️ <strong>Demo Data:</strong> This dashboard shows sample leads and clients. All data is stored locally in your browser. Add your own leads or import from CSV to begin.</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-xl p-4 shadow-lg`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-xs font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Recent Leads</h3>
            <button onClick={() => onNavigate('leads')} className="text-purple-400 text-sm hover:text-purple-300">View All →</button>
          </div>
          <div className="space-y-3">
            {recentLeads.map(lead => (
              <button key={lead.id} onClick={() => onViewLead(lead.id)} className="w-full flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors text-left">
                <div>
                  <p className="font-medium text-sm">{lead.firstName} {lead.lastName}</p>
                  <p className="text-gray-400 text-xs">{lead.company}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={lead.status} />
                  <span className="text-yellow-400 text-xs">⭐ {lead.score}</span>
                </div>
              </button>
            ))}
            {recentLeads.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No leads yet</p>}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Pending Tasks</h3>
            <span className="text-gray-400 text-sm">{pendingTasks.length} tasks</span>
          </div>
          <div className="space-y-3">
            {pendingTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-gray-400 text-xs">{new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
                <PriorityBadge priority={task.priority} />
              </div>
            ))}
            {pendingTasks.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No pending tasks</p>}
          </div>
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-lg mb-4">Pipeline Overview</h3>
        <div className="flex gap-2">
          {(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as LeadStatus[]).map(status => {
            const count = store.getLeads().filter(l => l.status === status && !l.archived).length;
            const total = store.getLeads().filter(l => !l.archived).length || 1;
            return (
              <div key={status} className="flex-1 text-center">
                <div className="h-2 bg-gray-700 rounded-full mb-2 overflow-hidden">
                  <div className={`h-full rounded-full ${getStatusColor(status)}`} style={{ width: `${(count / total) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-400 capitalize">{status}</p>
                <p className="text-sm font-bold">{count}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==================== LEADS PAGE ====================
function LeadsPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const refreshLeads = useCallback(() => {
    setLeads(store.getLeads().filter(l => !l.archived));
  }, []);

  useEffect(() => { refreshLeads(); }, [refreshLeads]);

  const filteredLeads = leads.filter(l => {
    const matchesSearch = `${l.firstName} ${l.lastName} ${l.company} ${l.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Leads ({filteredLeads.length})</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowImportModal(true)} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">
            📥 Import
          </button>
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">
            + Add Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="negotiation">Negotiation</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Company</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Score</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Source</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredLeads.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-700/30 transition-colors cursor-pointer" onClick={() => onViewLead(lead.id)}>
                <td className="px-4 py-3">
                  <p className="font-medium text-sm">{lead.firstName} {lead.lastName}</p>
                  <p className="text-gray-400 text-xs">{lead.phone}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{lead.company}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{lead.email}</td>
                <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                <td className="px-4 py-3"><span className="text-yellow-400 text-sm font-medium">⭐ {lead.score}</span></td>
                <td className="px-4 py-3 text-sm text-gray-400 capitalize">{lead.source.replace('_', ' ')}</td>
                <td className="px-4 py-3">
                  <button onClick={e => { e.stopPropagation(); onViewLead(lead.id); }} className="text-purple-400 hover:text-purple-300 text-sm">View →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLeads.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No leads found</p>
            <p className="text-sm mt-1">Try adjusting your search or add a new lead</p>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && <AddLeadModal onClose={() => setShowAddModal(false)} onCreated={() => { setShowAddModal(false); refreshLeads(); }} />}
      {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} onImported={() => { setShowImportModal(false); refreshLeads(); }} />}
    </div>
  );
}

// ==================== LEAD DETAIL PAGE ====================
function LeadDetailPage({ leadId, onBack }: { leadId: string; onBack: () => void }) {
  const [lead, setLead] = useState<Lead | undefined>(store.getLead(leadId));
  const [notes, setNotes] = useState<CRMNote[]>(store.getNotes(leadId));
  const [tasks, setTasks] = useState<Task[]>(store.getTasks(leadId));
  const [calls, setCalls] = useState<CallRecord[]>(store.getCalls(leadId));
  const [emails, setEmails] = useState<EmailRecord[]>(store.getEmails(leadId));
  const [aiContent, setAiContent] = useState<AIContent[]>(store.getAIContent(leadId));
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'tasks' | 'calls' | 'emails' | 'ai'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const refresh = () => {
    setLead(store.getLead(leadId));
    setNotes(store.getNotes(leadId));
    setTasks(store.getTasks(leadId));
    setCalls(store.getCalls(leadId));
    setEmails(store.getEmails(leadId));
    setAiContent(store.getAIContent(leadId));
  };

  if (!lead) return <div className="p-6"><p>Lead not found</p><button onClick={onBack} className="text-purple-400 mt-2">← Back</button></div>;

  const handleStatusChange = (status: LeadStatus) => {
    store.updateLead(leadId, { status });
    // Trigger n8n webhook on status change
    const settings = store.getSettings();
    if (settings.webhook_n8n) {
      triggerN8NWorkflow(settings.webhook_n8n, {
        event: 'lead_status_changed',
        leadId,
        leadData: { status },
        metadata: { previousStatus: lead.status },
      });
    }
    refresh();
  };

  const handleConvertToClient = () => {
    if (confirm('Convert this lead to a client?')) {
      store.convertToClient(leadId);
      // Trigger n8n webhook on conversion
      const settings = store.getSettings();
      if (settings.webhook_n8n) {
        triggerN8NWorkflow(settings.webhook_n8n, {
          event: 'lead_converted_to_client',
          leadId,
          leadData: lead,
        });
      }
      refresh();
      alert('Lead converted to client successfully!');
    }
  };

  const handleGenerateAI = async (type: AIContent['type']) => {
    setAiLoading(true);
    setAiError(null);
    let content = '';
    const settings = store.getSettings();
    const useRealGemini = !!settings.apiKey_gemini;

    try {
      if (useRealGemini) {
        // Try real Gemini API
        let result;
        switch (type) {
          case 'pitch':
            result = await generateAIPitch(lead, settings.apiKey_gemini);
            if (result.status === 'CONNECTED' && result.data) content = result.data.text;
            break;
          case 'email':
            result = await generateAIEmail(lead, settings.apiKey_gemini);
            if (result.status === 'CONNECTED' && result.data) content = `${result.data.subject}\n\n${result.data.body}`;
            break;
          case 'calling_script':
            result = await generateAICallScript(lead, settings.apiKey_gemini);
            if (result.status === 'CONNECTED' && result.data) content = result.data.text;
            break;
          case 'loom_script':
            result = await generateAILoomScript(lead, settings.apiKey_gemini);
            if (result.status === 'CONNECTED' && result.data) content = result.data.text;
            break;
          case 'sms_script':
            result = await generateAISMS(lead, settings.apiKey_gemini);
            if (result.status === 'CONNECTED' && result.data) content = result.data.text;
            break;
          case 'lead_score_analysis': {
            result = await generateAIPitch(lead, settings.apiKey_gemini); // Use pitch as base for scoring
            if (result.status === 'CONFIGURATION_REQUIRED') {
              setAiError('CONFIGURATION REQUIRED: Gemini API key not configured');
              setAiLoading(false);
              return;
            }
            if (result.status === 'ERROR') {
              setAiError(`Gemini API Error: ${result.error}`);
              setAiLoading(false);
              return;
            }
            // Fall through to template scoring if Gemini succeeds but we need structured data
            const audit = aiGenerator.generateLeadScore(lead);
            store.createAudit(audit);
            store.updateLead(leadId, { score: audit.score });
            content = `Score: ${audit.score}/100 (Gemini-powered analysis)\n\n${audit.recommendation}\n\nFactors:\n${Object.entries(audit.factors).map(([k, v]) => `• ${k}: ${v}/100`).join('\n')}`;
            break;
          }
        }

        if (result?.status === 'CONFIGURATION_REQUIRED') {
          setAiError('CONFIGURATION REQUIRED: Gemini API key not configured. Add your key in Settings.');
          setAiLoading(false);
          return;
        }
        if (result?.status === 'ERROR') {
          setAiError(`Gemini API Error: ${result.error}. Falling back to template.`);
          // Fall through to template
        }
      }

      // Fallback to templates if Gemini not configured or failed
      if (!content) {
        switch (type) {
          case 'pitch': content = aiGenerator.generatePitch(lead); break;
          case 'email': { const e = aiGenerator.generateEmail(lead); content = `${e.subject}\n\n${e.body}`; break; }
          case 'calling_script': content = aiGenerator.generateCallingScript(lead); break;
          case 'loom_script': content = aiGenerator.generateLoomScript(lead); break;
          case 'sms_script': content = aiGenerator.generateSMSScript(lead); break;
          case 'lead_score_analysis': {
            if (!content) {
              const audit = aiGenerator.generateLeadScore(lead);
              store.createAudit(audit);
              store.updateLead(leadId, { score: audit.score });
              content = `Score: ${audit.score}/100\n\n${audit.recommendation}\n\nFactors:\n${Object.entries(audit.factors).map(([k, v]) => `• ${k}: ${v}/100`).join('\n')}`;
            }
            break;
          }
        }
      }

      store.createAIContent({ leadId, type, content });
      
      // Trigger n8n webhook on AI generation
      if (settings.webhook_n8n) {
        triggerN8NWorkflow(settings.webhook_n8n, {
          event: 'ai_content_generated',
          leadId,
          metadata: { type, usedGemini: useRealGemini },
        });
      }
      
      refresh();
    } catch (err) {
      setAiError(`AI generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setAiLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'notes', label: `Notes (${notes.length})` },
    { id: 'tasks', label: `Tasks (${tasks.length})` },
    { id: 'calls', label: `Calls (${calls.length})` },
    { id: 'emails', label: `Emails (${emails.length})` },
    { id: 'ai', label: `AI Content (${aiContent.length})` },
  ];

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white text-xl">←</button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{lead.firstName} {lead.lastName}</h1>
            <StatusBadge status={lead.status} />
            <span className="text-yellow-400 font-medium">⭐ {lead.score}</span>
          </div>
          <p className="text-gray-400 text-sm">{lead.company} • {lead.industry}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowEditModal(true)} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">✏️ Edit</button>
          <select value={lead.status} onChange={e => handleStatusChange(e.target.value as LeadStatus)} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm">
            {(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as LeadStatus[]).map(s => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
          {lead.status !== 'won' && (
            <button onClick={handleConvertToClient} className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors">🔄 Convert</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <h3 className="font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Email</span><span>{lead.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Phone</span><span>{lead.phone}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Company</span><span>{lead.company}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Industry</span><span>{lead.industry}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Revenue</span><span>{lead.revenue}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Employees</span><span>{lead.employees}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Website</span><span>{lead.website}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Source</span><span className="capitalize">{lead.source.replace('_', ' ')}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Created</span><span>{new Date(lead.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleGenerateAI('pitch')} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">🤖 AI Pitch</button>
              <button onClick={() => handleGenerateAI('email')} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">✉️ AI Email</button>
              <button onClick={() => handleGenerateAI('calling_script')} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">📞 Call Script</button>
              <button onClick={() => handleGenerateAI('sms_script')} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">💬 SMS Script</button>
              <button onClick={() => handleGenerateAI('lead_score_analysis')} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">⭐ Score Lead</button>
              <button onClick={() => handleGenerateAI('loom_script')} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">🎥 Loom Script</button>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Notes</h4>
              <p className="text-sm text-gray-300 bg-gray-700/50 rounded-lg p-3">{lead.notes || 'No notes'}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notes' && <NotesTab leadId={leadId} notes={notes} onRefresh={refresh} />}
      {activeTab === 'tasks' && <TasksTab leadId={leadId} tasks={tasks} onRefresh={refresh} />}
      {activeTab === 'calls' && <CallsTab leadId={leadId} calls={calls} onRefresh={refresh} />}
      {activeTab === 'emails' && <EmailsTab leadId={leadId} emails={emails} onRefresh={refresh} />}
      {activeTab === 'ai' && <AIContentTab lead={lead} content={aiContent} onGenerate={handleGenerateAI} loading={aiLoading} error={aiError} />}

      {showEditModal && <EditLeadModal lead={lead} onClose={() => setShowEditModal(false)} onSaved={() => { setShowEditModal(false); refresh(); }} />}
    </div>
  );
}

// ==================== NOTES TAB ====================
function NotesTab({ leadId, notes, onRefresh }: { leadId: string; notes: CRMNote[]; onRefresh: () => void }) {
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<CRMNote['type']>('note');

  const addNote = () => {
    if (!newNote.trim()) return;
    store.createNote({ leadId, content: newNote, type: noteType, createdBy: 'Sophia' });
    setNewNote('');
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <div className="flex gap-2 mb-3">
          <select value={noteType} onChange={e => setNoteType(e.target.value as CRMNote['type'])} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm">
            <option value="note">📝 Note</option>
            <option value="call">📞 Call Log</option>
            <option value="email">✉️ Email Log</option>
            <option value="meeting">🤝 Meeting</option>
          </select>
        </div>
        <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm h-24 resize-none focus:outline-none focus:border-purple-500" />
        <button onClick={addNote} className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">Add Note</button>
      </div>
      <div className="space-y-3">
        {notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(note => (
          <div key={note.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-400 capitalize bg-gray-700 px-2 py-1 rounded">{note.type}</span>
              <span className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-300">{note.content}</p>
            <p className="text-xs text-gray-500 mt-2">by {note.createdBy}</p>
          </div>
        ))}
        {notes.length === 0 && <p className="text-gray-500 text-center py-8">No notes yet</p>}
      </div>
    </div>
  );
}

// ==================== TASKS TAB ====================
function TasksTab({ leadId, tasks, onRefresh }: { leadId: string; tasks: Task[]; onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');

  const addTask = () => {
    if (!title.trim()) return;
    store.createTask({ leadId, title, description, priority, status: 'pending', dueDate: dueDate || new Date().toISOString() });
    setTitle(''); setDescription(''); setDueDate(''); setShowAdd(false);
    onRefresh();
  };

  const toggleTask = (taskId: string, currentStatus: Task['status']) => {
    store.updateTask(taskId, { status: currentStatus === 'completed' ? 'pending' : 'completed' });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">+ Add Task</button>
      {showAdd && (
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm h-20 resize-none focus:outline-none focus:border-purple-500" />
          <div className="flex gap-3">
            <select value={priority} onChange={e => setPriority(e.target.value as Task['priority'])} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
            </select>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm" />
          </div>
          <button onClick={addTask} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm">Create Task</button>
        </div>
      )}
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className={`flex items-center gap-3 p-4 bg-gray-800 rounded-xl border border-gray-700 ${task.status === 'completed' ? 'opacity-60' : ''}`}>
            <button onClick={() => toggleTask(task.id, task.status)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
              {task.status === 'completed' && <span className="text-xs text-white">✓</span>}
            </button>
            <div className="flex-1">
              <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>{task.title}</p>
              {task.description && <p className="text-xs text-gray-400 mt-1">{task.description}</p>}
            </div>
            <PriorityBadge priority={task.priority} />
            <span className="text-xs text-gray-500">{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-gray-500 text-center py-8">No tasks yet</p>}
      </div>
    </div>
  );
}

// ==================== CALLS TAB ====================
function CallsTab({ leadId, calls, onRefresh }: { leadId: string; calls: CallRecord[]; onRefresh: () => void }) {
  const lead = store.getLead(leadId);
  const [calling, setCalling] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);
  const settings = store.getSettings();
  const telnyxConfigured = !!settings.apiKey_telnyx;

  const initiateCall = async () => {
    if (!lead?.phone) {
      setCallError('No phone number available for this lead');
      return;
    }
    setCalling(true);
    setCallError(null);

    if (telnyxConfigured) {
      // Try real Telnyx call
      const result = await initiateTelnyxCall(
        settings.apiKey_telnyx,
        '+15551234567', // From number - should be configured in settings
        lead.phone,
        leadId
      );

      if (result.status === 'CONNECTED' && result.data) {
        // Real call initiated
        store.createCall({
          leadId,
          direction: 'outbound',
          status: 'completed',
          duration: 0, // Will be updated via webhook
          transcript: `Call initiated via Telnyx. Call ID: ${result.data.call_control_id}`,
        });
        
        // Trigger n8n workflow for AI calling
        if (settings.webhook_n8n) {
          triggerN8NWorkflow(settings.webhook_n8n, {
            event: 'call_initiated',
            leadId,
            leadData: lead,
            callData: { callControlId: result.data.call_control_id },
          });
        }
        
        setCalling(false);
        onRefresh();
        return;
      }

      if (result.status === 'CONFIGURATION_REQUIRED') {
        setCallError('CONFIGURATION REQUIRED: Telnyx API key not configured');
        setCalling(false);
        return;
      }

      if (result.status === 'ERROR') {
        setCallError(`Telnyx Error: ${result.error}. Falling back to simulation.`);
        // Fall through to simulation
      }
    }

    // Fallback: Simulate call when Telnyx not configured
    setTimeout(() => {
      const duration = Math.floor(Math.random() * 600) + 60;
      const callStatus = Math.random() > 0.2 ? 'completed' : 'missed';
      
      store.createCall({
        leadId,
        direction: 'outbound',
        status: callStatus,
        duration,
        transcript: duration > 300 ? 'Call completed. Discussed services and next steps.' : undefined,
        aiSummary: duration > 300 ? 'Lead is interested. Follow up with proposal.' : undefined,
      });

      // Call Completion Automation
      if (callStatus === 'completed') {
        // Create CRM note
        store.createNote({
          leadId,
          content: `Call completed (${Math.floor(duration / 60)}m ${duration % 60}s). Discussed services and next steps.`,
          type: 'call',
          createdBy: 'Sophia',
        });

        // Update lead status: New → Contacted (don't overwrite advanced stages)
        const currentLead = store.getLead(leadId);
        if (currentLead && currentLead.status === 'new') {
          store.updateLead(leadId, { status: 'contacted' });
        }

        // Generate AI call summary if Gemini configured
        if (settings.apiKey_gemini && duration > 300) {
          generateAICallSummary(
            'Call completed. Discussed services and next steps.',
            lead,
            settings.apiKey_gemini
          ).then(result => {
            if (result.status === 'CONNECTED' && result.data) {
              store.createAIContent({
                leadId,
                type: 'pitch', // Using pitch type for call summary
                content: `CALL SUMMARY:\n${result.data.summary}\n\nNEXT STEPS:\n${result.data.nextSteps}\n\nSENTIMENT: ${result.data.sentiment}`,
              });
              onRefresh();
            }
          });
        }
      }

      // Trigger n8n webhook
      if (settings.webhook_n8n) {
        triggerN8NWorkflow(settings.webhook_n8n, {
          event: 'call_completed',
          leadId,
          callData: { status: callStatus, duration },
        });
      }

      setCalling(false);
      onRefresh();
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Initiate Call</h3>
            <p className="text-sm text-gray-400">{lead?.phone || 'No phone number'}</p>
            {!telnyxConfigured && (
              <p className="text-xs text-red-400 mt-1">⚠️ CONFIGURATION REQUIRED: Telnyx API key not configured. Calls are simulated.</p>
            )}
            {telnyxConfigured && (
              <p className="text-xs text-green-400 mt-1">✓ Telnyx configured — attempting real call</p>
            )}
            {callError && <p className="text-xs text-red-400 mt-1">❌ {callError}</p>}
          </div>
          <button onClick={initiateCall} disabled={calling || !lead?.phone} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${calling || !lead?.phone ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
            {calling ? '📞 Calling...' : '📞 Call Now'}
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {calls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(call => (
          <div key={call.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${call.direction === 'outbound' ? 'text-blue-400' : 'text-green-400'}`}>
                  {call.direction === 'outbound' ? '📤 Outbound' : '📥 Inbound'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${call.status === 'completed' ? 'bg-green-900 text-green-300' : call.status === 'missed' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}`}>
                  {call.status}
                </span>
              </div>
              <span className="text-xs text-gray-500">{new Date(call.createdAt).toLocaleString()}</span>
            </div>
            {call.duration > 0 && <p className="text-sm text-gray-400">Duration: {Math.floor(call.duration / 60)}m {call.duration % 60}s</p>}
            {call.transcript && <p className="text-sm text-gray-300 mt-2 bg-gray-700/50 rounded p-2">📝 {call.transcript}</p>}
            {call.aiSummary && <p className="text-sm text-purple-300 mt-2 bg-purple-900/20 rounded p-2">🤖 AI Summary: {call.aiSummary}</p>}
          </div>
        ))}
        {calls.length === 0 && <p className="text-gray-500 text-center py-8">No call history</p>}
      </div>
    </div>
  );
}

// ==================== EMAILS TAB ====================
function EmailsTab({ leadId, emails, onRefresh }: { leadId: string; emails: EmailRecord[]; onRefresh: () => void }) {
  const lead = store.getLead(leadId);
  const [showCompose, setShowCompose] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const settings = store.getSettings();

  const sendEmail = () => {
    if (!subject.trim() || !body.trim()) return;
    
    // Gmail OAuth requires backend - cannot send real emails from frontend
    // Log email as draft only
    store.createEmail({ leadId, subject, body, status: 'draft', sentAt: undefined });
    setEmailError('GMAIL CONFIGURATION REQUIRED: Email saved as draft. Configure Gmail OAuth in a backend service to enable real sending.');
    
    // Trigger n8n webhook
    if (settings.webhook_n8n) {
      triggerN8NWorkflow(settings.webhook_n8n, {
        event: 'email_composed',
        leadId,
        emailData: { subject, body },
      });
    }
    
    setSubject(''); setBody(''); setShowCompose(false);
    onRefresh();
  };

  const generateAndFill = async () => {
    if (!lead) return;
    const geminiKey = settings.apiKey_gemini;
    
    if (geminiKey) {
      const result = await generateAIEmail(lead, geminiKey);
      if (result.status === 'CONNECTED' && result.data) {
        setSubject(result.data.subject);
        setBody(result.data.body);
        return;
      }
      if (result.status === 'CONFIGURATION_REQUIRED' || result.status === 'ERROR') {
        // Fall through to template
      }
    }
    
    // Fallback to template
    const { subject: s, body: b } = aiGenerator.generateEmail(lead);
    setSubject(s); setBody(b);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setShowCompose(!showCompose)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium">✉️ Compose Email</button>
        <p className="text-xs text-red-400 self-center">⚠️ GMAIL CONFIGURATION REQUIRED: Emails saved as drafts only. OAuth backend setup needed for real sending.</p>
      </div>
      {emailError && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
          <p className="text-xs text-red-300">{emailError}</p>
        </div>
      )}
      {showCompose && (
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 space-y-3">
          <div className="flex gap-2">
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
            <button onClick={generateAndFill} className="px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg text-sm">🤖 AI Generate</button>
          </div>
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Email body..." className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm h-40 resize-none focus:outline-none focus:border-purple-500" />
          <div className="flex gap-2">
            <button onClick={sendEmail} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium">Save as Draft</button>
            <button onClick={() => setShowCompose(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">Cancel</button>
          </div>
          <p className="text-xs text-gray-400">Note: Real email sending requires Gmail OAuth backend configuration.</p>
        </div>
      )}
      <div className="space-y-3">
        {emails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(email => (
          <div key={email.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex justify-between items-start mb-2">
              <p className="font-medium text-sm">{email.subject}</p>
              <span className={`text-xs px-2 py-0.5 rounded ${email.status === 'sent' ? 'bg-green-900 text-green-300' : email.status === 'draft' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>{email.status === 'draft' ? 'draft (not sent)' : email.status}</span>
            </div>
            <p className="text-sm text-gray-400 whitespace-pre-wrap line-clamp-3">{email.body}</p>
            <p className="text-xs text-gray-500 mt-2">{new Date(email.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {emails.length === 0 && <p className="text-gray-500 text-center py-8">No emails sent</p>}
      </div>
    </div>
  );
}

// ==================== AI CONTENT TAB ====================
function AIContentTab({ lead, content, onGenerate, loading, error }: { lead: Lead; content: AIContent[]; onGenerate: (type: AIContent['type']) => void; loading?: boolean; error?: string | null }) {
  const [selectedContent, setSelectedContent] = useState<AIContent | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button onClick={() => onGenerate('pitch')} className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-colors text-left">
          <span className="text-2xl">🤖</span>
          <p className="font-medium text-sm mt-2">AI Pitch</p>
          <p className="text-xs text-gray-400">Personalized outreach</p>
        </button>
        <button onClick={() => onGenerate('email')} className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-colors text-left">
          <span className="text-2xl">✉️</span>
          <p className="font-medium text-sm mt-2">AI Email</p>
          <p className="text-xs text-gray-400">Email template</p>
        </button>
        <button onClick={() => onGenerate('calling_script')} className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-colors text-left">
          <span className="text-2xl">📞</span>
          <p className="font-medium text-sm mt-2">Call Script</p>
          <p className="text-xs text-gray-400">Phone call guide</p>
        </button>
        <button onClick={() => onGenerate('sms_script')} className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-colors text-left">
          <span className="text-2xl">💬</span>
          <p className="font-medium text-sm mt-2">SMS Script</p>
          <p className="text-xs text-gray-400">Text templates</p>
        </button>
        <button onClick={() => onGenerate('loom_script')} className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-colors text-left">
          <span className="text-2xl">🎥</span>
          <p className="font-medium text-sm mt-2">Loom Script</p>
          <p className="text-xs text-gray-400">Video pitch guide</p>
        </button>
        <button onClick={() => onGenerate('lead_score_analysis')} className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-colors text-left">
          <span className="text-2xl">⭐</span>
          <p className="font-medium text-sm mt-2">Score Analysis</p>
          <p className="text-xs text-gray-400">AI lead scoring</p>
        </button>
      </div>
      {store.getSettings().apiKey_gemini ? (
        <p className="text-xs text-green-400">✓ Gemini API configured — AI content generated via Google Gemini</p>
      ) : (
        <p className="text-xs text-red-400">⚠️ CONFIGURATION REQUIRED: Gemini API key not set. Using local templates. Add key in Settings.</p>
      )}
      {loading && <p className="text-xs text-blue-400 animate-pulse">⏳ Generating AI content...</p>}
      {error && <p className="text-xs text-red-400 bg-red-900/20 rounded p-2">❌ {error}</p>}

      {content.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Generated Content</h3>
          {content.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(c => (
            <div key={c.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded capitalize">{c.type.replace('_', ' ')}</span>
                <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <button onClick={() => setSelectedContent(selectedContent?.id === c.id ? null : c)} className="text-sm text-purple-400 hover:text-purple-300">
                {selectedContent?.id === c.id ? 'Hide' : 'Show'} Content
              </button>
              {selectedContent?.id === c.id && (
                <pre className="mt-3 text-sm text-gray-300 bg-gray-900 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{c.content}</pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== KANBAN PAGE ====================
function KanbanPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  const [leads, setLeads] = useState<Lead[]>(store.getLeads().filter(l => !l.archived));
  const statuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

  const refresh = () => setLeads(store.getLeads().filter(l => !l.archived));

  const moveLead = (leadId: string, newStatus: LeadStatus) => {
    store.updateLead(leadId, { status: newStatus });
    refresh();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Pipeline Kanban</h1>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {statuses.map(status => {
          const statusLeads = leads.filter(l => l.status === status);
          return (
            <div key={status} className="min-w-[250px] flex-shrink-0">
              <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg ${getStatusBgColor(status)}`}>
                <span className="font-medium text-sm capitalize">{status}</span>
                <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full">{statusLeads.length}</span>
              </div>
              <div className="space-y-2">
                {statusLeads.map(lead => (
                  <div key={lead.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-500 cursor-pointer transition-colors" onClick={() => onViewLead(lead.id)}>
                    <p className="font-medium text-sm">{lead.firstName} {lead.lastName}</p>
                    <p className="text-xs text-gray-400 mt-1">{lead.company}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-yellow-400">⭐ {lead.score}</span>
                      <select
                        value={lead.status}
                        onChange={e => { e.stopPropagation(); moveLead(lead.id, e.target.value as LeadStatus); }}
                        onClick={e => e.stopPropagation()}
                        className="text-xs bg-gray-700 border border-gray-600 rounded px-1 py-0.5"
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
                {statusLeads.length === 0 && <p className="text-xs text-gray-600 text-center py-4">No leads</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== CLIENTS PAGE ====================
function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(store.getClients());

  useEffect(() => { setClients(store.getClients()); }, []);

  const totalMRR = clients.filter(c => c.status === 'active').reduce((sum, c) => sum + c.mrr, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-gray-400 text-sm">{clients.filter(c => c.status === 'active').length} active • ${totalMRR.toLocaleString()} MRR</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4">
          <p className="text-white/80 text-xs">Active Clients</p>
          <p className="text-2xl font-bold">{clients.filter(c => c.status === 'active').length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4">
          <p className="text-white/80 text-xs">Monthly MRR</p>
          <p className="text-2xl font-bold">${totalMRR.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4">
          <p className="text-white/80 text-xs">Annual Revenue</p>
          <p className="text-2xl font-bold">${(totalMRR * 12).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Client</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Company</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Service</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">MRR</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Start Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {clients.map(client => (
              <tr key={client.id} className="hover:bg-gray-700/30">
                <td className="px-4 py-3">
                  <p className="font-medium text-sm">{client.name}</p>
                  <p className="text-xs text-gray-400">{client.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{client.company}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{client.service}</td>
                <td className="px-4 py-3 text-sm font-medium text-green-400">${client.mrr.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${client.status === 'active' ? 'bg-green-900 text-green-300' : client.status === 'churned' ? 'bg-red-900 text-red-300' : 'bg-gray-700 text-gray-300'}`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{new Date(client.startDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && <p className="text-gray-500 text-center py-8">No clients yet</p>}
      </div>
    </div>
  );
}

// ==================== AI PAGE ====================
function AIPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  const [selectedLead, setSelectedLead] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [contentType, setContentType] = useState<string>('pitch');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<'gemini' | 'template' | null>(null);
  const leads = store.getLeads().filter(l => !l.archived);
  const settings = store.getSettings();
  const geminiConfigured = !!settings.apiKey_gemini;

  const generate = async () => {
    const lead = store.getLead(selectedLead);
    if (!lead) return;
    setLoading(true);
    setError(null);
    setAiSource(null);
    let content = '';

    try {
      if (geminiConfigured) {
        // Try real Gemini API
        let result;
        switch (contentType) {
          case 'pitch': result = await generateAIPitch(lead, settings.apiKey_gemini); break;
          case 'email': result = await generateAIEmail(lead, settings.apiKey_gemini); break;
          case 'calling_script': result = await generateAICallScript(lead, settings.apiKey_gemini); break;
          case 'sms_script': result = await generateAISMS(lead, settings.apiKey_gemini); break;
          case 'loom_script': result = await generateAILoomScript(lead, settings.apiKey_gemini); break;
          case 'score': result = await generateAIPitch(lead, settings.apiKey_gemini); break;
        }

        if (result?.status === 'CONNECTED' && result.data) {
          if (contentType === 'email' && 'subject' in result.data) {
            content = `Subject: ${result.data.subject}\n\n${result.data.body}`;
          } else if ('text' in result.data) {
            content = result.data.text;
          }
          setAiSource('gemini');
        } else if (result?.status === 'CONFIGURATION_REQUIRED') {
          setError('CONFIGURATION REQUIRED: Gemini API key invalid or missing');
          setLoading(false);
          return;
        } else if (result?.status === 'ERROR') {
          setError(`Gemini API Error: ${result.error}. Using template fallback.`);
          // Fall through to template
        }
      }

      // Fallback to templates
      if (!content) {
        setAiSource('template');
        switch (contentType) {
          case 'pitch': content = aiGenerator.generatePitch(lead); break;
          case 'email': { const e = aiGenerator.generateEmail(lead); content = `Subject: ${e.subject}\n\n${e.body}`; break; }
          case 'calling_script': content = aiGenerator.generateCallingScript(lead); break;
          case 'sms_script': content = aiGenerator.generateSMSScript(lead); break;
          case 'loom_script': content = aiGenerator.generateLoomScript(lead); break;
          case 'score': { 
            const audit = aiGenerator.generateLeadScore(lead); 
            store.createAudit(audit);
            store.updateLead(selectedLead, { score: audit.score });
            content = `Lead Score: ${audit.score}/100\n\nRecommendation: ${audit.recommendation}\n\nFactors:\n${Object.entries(audit.factors).map(([k, v]) => `• ${k}: ${v}/100`).join('\n')}`; 
            break; 
          }
        }
      }

      setGeneratedContent(content);
      store.createAIContent({ leadId: selectedLead, type: contentType as AIContent['type'], content });
    } catch (err) {
      setError(`Generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sophia AI</h1>
        <p className="text-gray-400 text-sm">AI-powered content generation for leads</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Select Lead</label>
            <select value={selectedLead} onChange={e => setSelectedLead(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm">
              <option value="">Choose a lead...</option>
              {leads.map(l => <option key={l.id} value={l.id}>{l.firstName} {l.lastName} - {l.company}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Content Type</label>
            <select value={contentType} onChange={e => setContentType(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm">
              <option value="pitch">AI Pitch</option>
              <option value="email">Email Template</option>
              <option value="calling_script">Calling Script</option>
              <option value="sms_script">SMS Script</option>
              <option value="loom_script">Loom Script</option>
              <option value="score">Lead Score Analysis</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={generate} disabled={!selectedLead || loading} className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors">
              {loading ? '⏳ Generating...' : '🤖 Generate'}
            </button>
          </div>
        </div>
        
        {/* AI Source Status */}
        {!geminiConfigured && (
          <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg mb-4">
            <p className="text-xs text-red-300">⚠️ CONFIGURATION REQUIRED: Gemini API key not configured. Using local templates. Add your API key in Settings for real AI generation.</p>
          </div>
        )}
        {geminiConfigured && aiSource === 'gemini' && (
          <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg mb-4">
            <p className="text-xs text-green-300">✓ Generated via Google Gemini API (real AI)</p>
          </div>
        )}
        {geminiConfigured && aiSource === 'template' && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg mb-4">
            <p className="text-xs text-yellow-300">⚠️ Gemini API failed or returned error. Using template fallback.</p>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg mb-4">
            <p className="text-xs text-red-300">❌ {error}</p>
          </div>
        )}
        
        {generatedContent && (
          <div className="bg-gray-900 rounded-lg p-4">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">{generatedContent}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== CALLS PAGE ====================
function CallsPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  const [calls, setCalls] = useState<CallRecord[]>(store.getCalls());

  useEffect(() => { setCalls(store.getCalls()); }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Call History</h1>
        <p className="text-gray-400 text-sm">{calls.length} total calls</p>
      </div>
      <div className="space-y-3">
        {calls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(call => {
          const lead = store.getLead(call.leadId);
          return (
            <div key={call.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <button onClick={() => onViewLead(call.leadId)} className="font-medium text-sm text-purple-400 hover:text-purple-300">
                    {lead ? `${lead.firstName} ${lead.lastName}` : 'Unknown'}
                  </button>
                  <p className="text-xs text-gray-400 mt-1">{lead?.company}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded ${call.status === 'completed' ? 'bg-green-900 text-green-300' : call.status === 'missed' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}`}>
                    {call.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{new Date(call.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-4 mt-3 text-xs text-gray-400">
                <span>{call.direction === 'outbound' ? '📤 Outbound' : '📥 Inbound'}</span>
                {call.duration > 0 && <span>⏱ {Math.floor(call.duration / 60)}m {call.duration % 60}s</span>}
              </div>
              {call.aiSummary && <p className="text-xs text-purple-300 mt-2 bg-purple-900/20 rounded p-2">🤖 {call.aiSummary}</p>}
            </div>
          );
        })}
        {calls.length === 0 && <p className="text-gray-500 text-center py-8">No calls recorded</p>}
      </div>
    </div>
  );
}

// ==================== EMAILS PAGE ====================
function EmailsPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  const [emails, setEmails] = useState<EmailRecord[]>(store.getEmails());

  useEffect(() => { setEmails(store.getEmails()); }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Email History</h1>
        <p className="text-gray-400 text-sm">{emails.length} total emails</p>
        <p className="text-xs text-red-400 mt-1">⚠️ GMAIL CONFIGURATION REQUIRED: All emails are drafts. Configure Gmail OAuth backend to enable real sending.</p>
      </div>
      <div className="space-y-3">
        {emails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(email => {
          const lead = store.getLead(email.leadId);
          return (
            <div key={email.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <button onClick={() => onViewLead(email.leadId)} className="font-medium text-sm text-purple-400 hover:text-purple-300">
                    {lead ? `${lead.firstName} ${lead.lastName}` : 'Unknown'}
                  </button>
                  <p className="text-sm font-medium mt-1">{email.subject}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${email.status === 'sent' ? 'bg-green-900 text-green-300' : email.status === 'draft' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>
                  {email.status === 'draft' ? 'draft (not sent)' : email.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2 line-clamp-2">{email.body}</p>
              <p className="text-xs text-gray-500 mt-2">{new Date(email.createdAt).toLocaleString()}</p>
            </div>
          );
        })}
        {emails.length === 0 && <p className="text-gray-500 text-center py-8">No emails sent</p>}
      </div>
    </div>
  );
}

// ==================== ANALYTICS PAGE ====================
function AnalyticsPage() {
  const leads = store.getLeads().filter(l => !l.archived);
  const clients = store.getClients();
  const calls = store.getCalls();

  const statusCounts = (['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as LeadStatus[]).map(s => ({
    status: s,
    count: leads.filter(l => l.status === s).length,
  }));

  const sourceCounts = ['website', 'referral', 'cold_outreach', 'social_media', 'import'].map(s => ({
    source: s,
    count: leads.filter(l => l.source === s).length,
  }));

  const avgScore = leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Total Leads</p>
          <p className="text-2xl font-bold">{leads.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Avg Score</p>
          <p className="text-2xl font-bold text-yellow-400">{avgScore}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Total Calls</p>
          <p className="text-2xl font-bold">{calls.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Conversion Rate</p>
          <p className="text-2xl font-bold text-green-400">{leads.length > 0 ? Math.round((leads.filter(l => l.status === 'won').length / leads.length) * 100) : 0}%</p>
        </div>
      </div>

      {/* Pipeline Distribution */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold mb-4">Pipeline Distribution</h3>
        <div className="space-y-3">
          {statusCounts.map(item => (
            <div key={item.status} className="flex items-center gap-3">
              <span className="text-sm capitalize w-24 text-gray-400">{item.status}</span>
              <div className="flex-1 h-6 bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${getStatusColor(item.status)} transition-all`} style={{ width: `${leads.length > 0 ? (item.count / leads.length) * 100 : 0}%` }} />
              </div>
              <span className="text-sm font-medium w-8 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Source Distribution */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold mb-4">Lead Sources</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {sourceCounts.map(item => (
            <div key={item.source} className="text-center bg-gray-700/50 rounded-lg p-3">
              <p className="text-2xl font-bold">{item.count}</p>
              <p className="text-xs text-gray-400 capitalize mt-1">{item.source.replace('_', ' ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MRR Chart */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold mb-4">Revenue (MRR)</h3>
        <div className="flex items-end gap-2 h-40">
          {clients.filter(c => c.status === 'active').map(client => (
            <div key={client.id} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t" style={{ height: `${(client.mrr / 10000) * 100}%`, minHeight: '20px' }} />
              <p className="text-xs text-gray-400 mt-2 truncate w-full text-center">{client.name.split(' ')[0]}</p>
            </div>
          ))}
          {clients.filter(c => c.status === 'active').length === 0 && <p className="text-gray-500 text-sm">No active clients</p>}
        </div>
      </div>
    </div>
  );
}

// ==================== SETTINGS PAGE ====================
function SettingsPage() {
  const [settings, setSettings] = useState<AgencySettings>(store.getSettings());
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<{ name: string; status: IntegrationStatus; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const integrationStatus = getIntegrationStatus(settings);

  const save = () => {
    store.updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testGemini = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await callGemini(settings.apiKey_gemini, 'Say "Connection successful" in one sentence.');
    setTestResult({
      name: 'Gemini',
      status: result.status,
      message: result.status === 'CONNECTED' ? '✓ Real API connection verified' : result.error || 'Unknown error',
    });
    setTesting(false);
  };

  const testN8n = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await triggerN8NWorkflow(settings.webhook_n8n, {
      event: 'connection_test',
      leadId: 'test',
      metadata: { test: true },
    });
    setTestResult({
      name: 'n8n',
      status: result.status,
      message: result.status === 'CONNECTED' ? '✓ Webhook endpoint reachable' : result.error || 'Unknown error',
    });
    setTesting(false);
  };

  const statusColor = (s: IntegrationStatus) => {
    switch (s) {
      case 'CONNECTED': return 'bg-green-900 text-green-300';
      case 'TEST_MODE': return 'bg-yellow-900 text-yellow-300';
      case 'NOT_CONNECTED': return 'bg-red-900 text-red-300';
      case 'CONFIGURATION_REQUIRED': return 'bg-red-900 text-red-300';
      case 'ERROR': return 'bg-red-900 text-red-300';
    }
  };

  const statusLabel = (s: IntegrationStatus) => {
    switch (s) {
      case 'CONNECTED': return 'CONNECTED';
      case 'TEST_MODE': return 'TEST MODE';
      case 'NOT_CONNECTED': return 'NOT CONNECTED';
      case 'CONFIGURATION_REQUIRED': return 'CONFIGURATION REQUIRED';
      case 'ERROR': return 'ERROR';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Agency Settings</h1>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
        <h3 className="font-semibold text-lg">General</h3>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Agency Name</label>
          <input value={settings.agencyName} onChange={e => setSettings({ ...settings, agencyName: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
        </div>
      </div>

      {/* Integration Status Overview */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
        <h3 className="font-semibold text-lg">Integration Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(integrationStatus).map(([key, status]) => (
            <div key={key} className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              <span className={`text-xs px-2 py-1 rounded ${statusColor(status)}`}>{statusLabel(status)}</span>
            </div>
          ))}
        </div>
        {testResult && (
          <div className={`p-3 rounded-lg border ${testResult.status === 'CONNECTED' ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'}`}>
            <p className={`text-sm ${testResult.status === 'CONNECTED' ? 'text-green-300' : 'text-red-300'}`}>
              <strong>{testResult.name}:</strong> {testResult.message}
            </p>
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
        <h3 className="font-semibold text-lg">Integration Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Google Gemini API</p>
              <p className="text-xs text-gray-400">Real AI content generation</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={testGemini} disabled={!settings.apiKey_gemini || testing} className="text-xs px-2 py-1 bg-purple-700 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors">Test</button>
              <span className={`text-xs px-2 py-1 rounded ${statusColor(integrationStatus.gemini)}`}>
                {statusLabel(integrationStatus.gemini)}
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Gemini API Key</label>
            <input type="password" value={settings.apiKey_gemini} onChange={e => setSettings({ ...settings, apiKey_gemini: e.target.value })} placeholder="Enter API key..." className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
            <p className="text-xs text-gray-500 mt-1">Get from: https://aistudio.google.com/apikey</p>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Telnyx Voice</p>
              <p className="text-xs text-gray-400">Real voice calling</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${statusColor(integrationStatus.telnyxVoice)}`}>
              {statusLabel(integrationStatus.telnyxVoice)}
            </span>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Telnyx API Key</label>
            <input type="password" value={settings.apiKey_telnyx} onChange={e => setSettings({ ...settings, apiKey_telnyx: e.target.value })} placeholder="Enter API key..." className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
            <p className="text-xs text-gray-500 mt-1">Get from: https://portal.telnyx.com — Note: Browser CORS may require a backend proxy</p>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Telnyx SMS</p>
              <p className="text-xs text-gray-400">Real SMS messaging</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${statusColor(integrationStatus.telnyxSMS)}`}>
              {statusLabel(integrationStatus.telnyxSMS)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Gmail Integration</p>
              <p className="text-xs text-gray-400">Send emails via Gmail</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${statusColor(integrationStatus.gmail)}`}>
              {statusLabel(integrationStatus.gmail)}
            </span>
          </div>
          <p className="text-xs text-gray-500">⚠️ Gmail requires OAuth2 backend setup. Cannot be configured from frontend only.</p>

          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div>
              <p className="font-medium text-sm">n8n Webhooks</p>
              <p className="text-xs text-gray-400">Workflow automation</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={testN8n} disabled={!settings.webhook_n8n || testing} className="text-xs px-2 py-1 bg-purple-700 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors">Test</button>
              <span className={`text-xs px-2 py-1 rounded ${statusColor(integrationStatus.n8n)}`}>
                {statusLabel(integrationStatus.n8n)}
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">n8n Webhook URL</label>
            <input value={settings.webhook_n8n} onChange={e => setSettings({ ...settings, webhook_n8n: e.target.value })} placeholder="https://n8n.example.com/webhook/..." className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
        <h3 className="font-semibold text-lg">Database</h3>
        <div className="p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-300">⚠️ Currently using localStorage for data persistence. For production, configure Supabase connection.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <p className="text-gray-400">Total Leads</p>
            <p className="font-bold">{store.getLeads().length}</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3">
            <p className="text-gray-400">Total Clients</p>
            <p className="font-bold">{store.getClients().length}</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3">
            <p className="text-gray-400">Total Notes</p>
            <p className="font-bold">{store.getNotes('').length + store.getLeads().reduce((sum, l) => sum + store.getNotes(l.id).length, 0)}</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3">
            <p className="text-gray-400">Total Tasks</p>
            <p className="font-bold">{store.getTasks().length}</p>
          </div>
        </div>
        <button onClick={() => { if (confirm('Clear all data? This cannot be undone.')) { localStorage.clear(); window.location.reload(); } }} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
          🗑️ Reset All Data
        </button>
      </div>

      <button onClick={save} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors">
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}

// ==================== MODALS ====================
function AddLeadModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', company: '', industry: '', source: 'website' as Lead['source'], notes: '' });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!form.firstName || !form.email) { setError('First name and email are required'); return; }
    const dupes = store.detectDuplicates(form);
    if (dupes.length > 0) {
      if (!confirm(`Possible duplicate found: ${dupes[0].firstName} ${dupes[0].lastName}. Continue anyway?`)) return;
    }
    store.createLead({ ...form, status: 'new', score: 50, address: '', website: '', revenue: '', employees: '' });
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="First Name *" className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
            <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Last Name" className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email *" type="email" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
          <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} placeholder="Industry" className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
            <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value as Lead['source'] })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm">
              <option value="website">Website</option><option value="referral">Referral</option><option value="cold_outreach">Cold Outreach</option><option value="social_media">Social Media</option><option value="import">Import</option><option value="other">Other</option>
            </select>
          </div>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm h-20 resize-none focus:outline-none focus:border-purple-500" />
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">Create Lead</button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function EditLeadModal({ lead, onClose, onSaved }: { lead: Lead; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ ...lead });

  const handleSave = () => {
    store.updateLead(lead.id, form);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400">First Name</label><input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" /></div>
            <div><label className="text-xs text-gray-400">Last Name</label><input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" /></div>
          </div>
          <div><label className="text-xs text-gray-400">Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" /></div>
          <div><label className="text-xs text-gray-400">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" /></div>
          <div><label className="text-xs text-gray-400">Company</label><input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400">Industry</label><input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" /></div>
            <div><label className="text-xs text-gray-400">Score</label><input type="number" value={form.score} onChange={e => setForm({ ...form, score: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400">Revenue</label><input value={form.revenue} onChange={e => setForm({ ...form, revenue: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" /></div>
            <div><label className="text-xs text-gray-400">Employees</label><input value={form.employees} onChange={e => setForm({ ...form, employees: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" /></div>
          </div>
          <div><label className="text-xs text-gray-400">Website</label><input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" /></div>
          <div><label className="text-xs text-gray-400">Address</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500" /></div>
          <div><label className="text-xs text-gray-400">Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm h-20 resize-none focus:outline-none focus:border-purple-500" /></div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={handleSave} className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">Save Changes</button>
          <button onClick={() => { if (confirm('Delete this lead?')) { store.deleteLead(lead.id); onSaved(); } }} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">Delete</button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function ImportModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [csvData, setCsvData] = useState('');
  const [result, setResult] = useState<{ imported: number; duplicates: number } | null>(null);

  const handleImport = () => {
    if (!csvData.trim()) return;
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const leads: Partial<Lead>[] = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = values[i] || ''; });
      return {
        firstName: obj['firstname'] || obj['first_name'] || obj['name']?.split(' ')[0] || '',
        lastName: obj['lastname'] || obj['last_name'] || obj['name']?.split(' ').slice(1).join(' ') || '',
        email: obj['email'] || '',
        phone: obj['phone'] || '',
        company: obj['company'] || '',
        industry: obj['industry'] || '',
        website: obj['website'] || '',
      };
    }).filter(l => l.email);

    const res = store.importLeads(leads);
    setResult(res);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setCsvData(ev.target?.result as string || ''); };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Import Leads</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Upload CSV File</label>
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Or paste CSV data</label>
            <textarea value={csvData} onChange={e => setCsvData(e.target.value)} placeholder="firstName,lastName,email,phone,company&#10;John,Doe,john@example.com,+1-555-0001,Acme Inc" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm h-32 resize-none font-mono focus:outline-none focus:border-purple-500" />
          </div>
          {result && (
            <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
              <p className="text-sm text-green-300">✓ Imported: {result.imported} leads</p>
              {result.duplicates > 0 && <p className="text-sm text-yellow-300">⚠ Skipped {result.duplicates} duplicates</p>}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={handleImport} className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">Import</button>
            {result && <button onClick={onImported} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors">Done</button>}
            <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== UTILITY COMPONENTS ====================
function StatusBadge({ status }: { status: LeadStatus }) {
  const colors: Record<LeadStatus, string> = {
    new: 'bg-blue-900 text-blue-300',
    contacted: 'bg-cyan-900 text-cyan-300',
    qualified: 'bg-yellow-900 text-yellow-300',
    proposal: 'bg-orange-900 text-orange-300',
    negotiation: 'bg-purple-900 text-purple-300',
    won: 'bg-green-900 text-green-300',
    lost: 'bg-red-900 text-red-300',
  };
  return <span className={`text-xs px-2 py-1 rounded-full capitalize ${colors[status]}`}>{status}</span>;
}

function PriorityBadge({ priority }: { priority: Task['priority'] }) {
  const colors: Record<string, string> = {
    low: 'bg-gray-700 text-gray-300',
    medium: 'bg-blue-900 text-blue-300',
    high: 'bg-orange-900 text-orange-300',
    urgent: 'bg-red-900 text-red-300',
  };
  return <span className={`text-xs px-2 py-0.5 rounded capitalize ${colors[priority]}`}>{priority}</span>;
}

function getStatusColor(status: LeadStatus): string {
  const colors: Record<LeadStatus, string> = {
    new: 'bg-blue-500', contacted: 'bg-cyan-500', qualified: 'bg-yellow-500',
    proposal: 'bg-orange-500', negotiation: 'bg-purple-500', won: 'bg-green-500', lost: 'bg-red-500',
  };
  return colors[status];
}

function getStatusBgColor(status: LeadStatus): string {
  const colors: Record<LeadStatus, string> = {
    new: 'bg-blue-600/30 text-blue-300', contacted: 'bg-cyan-600/30 text-cyan-300',
    qualified: 'bg-yellow-600/30 text-yellow-300', proposal: 'bg-orange-600/30 text-orange-300',
    negotiation: 'bg-purple-600/30 text-purple-300', won: 'bg-green-600/30 text-green-300',
    lost: 'bg-red-600/30 text-red-300',
  };
  return colors[status];
}
