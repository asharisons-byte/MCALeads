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
  command: '🎯',
  leads: '👥',
  kanban: '📋',
  clients: '💼',
  ai: '🤖',
  aiWorkforce: '🧠',
  calls: '📞',
  emails: '✉️',
  outreach: '📢',
  clientExperience: '🌟',
  reporting: '📊',
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

type Page = 
  | 'dashboard' 
  | 'command' 
  | 'leads' 
  | 'lead-lists'
  | 'import-leads'
  | 'lead-detail' 
  | 'kanban' 
  | 'clients' 
  | 'ai' 
  | 'ai-workforce' 
  | 'approval-center'
  | 'client-portal'
  | 'white-label'
  | 'lead-intelligence'
  | 'ai-lead-analysis'
  | 'call-intelligence'
  | 'lead-scoring'
  | 'opportunities'
  | 'audits-proposals'
  | 'follow-up-queue'
  | 'calls' 
  | 'emails' 
  | 'sms-outreach'
  | 'outreach' 
  | 'client-experience' 
  | 'reporting' 
  | 'revenue-forecast'
  | 'settings' 
  | 'integrations'
  | 'team'
  | 'sophia-workforce'
  | 'ops'
  | 'analytics'
  | 'dialer';

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
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {/* WORKSPACE */}
          <div className="mb-2">
            {sidebarOpen && <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-1 font-semibold">WORKSPACE</div>}
            <button
              onClick={() => navigateTo('command')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'command' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{Icons.command}</span>
                {sidebarOpen && <span className="text-sm font-medium">Command Center</span>}
              </div>
              {sidebarOpen && <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">00</span>}
            </button>
            <button
              onClick={() => navigateTo('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'dashboard' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{Icons.dashboard}</span>
              {sidebarOpen && <span className="text-sm font-medium">Dashboard</span>}
            </button>
            <button
              onClick={() => navigateTo('leads')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'leads' || currentPage === 'lead-detail' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{Icons.leads}</span>
              {sidebarOpen && <span className="text-sm font-medium">Leads</span>}
            </button>
            <button
              onClick={() => navigateTo('lead-lists')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'lead-lists' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{Icons.leads}</span>
              {sidebarOpen && <span className="text-sm font-medium">Lead Lists</span>}
            </button>
            <button
              onClick={() => navigateTo('import-leads')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'import-leads' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{Icons.import}</span>
              {sidebarOpen && <span className="text-sm font-medium">Import Leads</span>}
            </button>
          </div>

          {/* AI WORKFORCE */}
          <div className="mb-2">
            {sidebarOpen && <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-1 font-semibold">AI WORKFORCE</div>}
            <button
              onClick={() => navigateTo('ai')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'ai' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{Icons.ai}</span>
                {sidebarOpen && <span className="text-sm font-medium">Sophia AI</span>}
              </div>
              {sidebarOpen && <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded">Phase 5A</span>}
            </button>
            <button
              onClick={() => navigateTo('ai-workforce')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'ai-workforce' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{Icons.aiWorkforce}</span>
                {sidebarOpen && <span className="text-sm font-medium">Agency AI Workforce</span>}
              </div>
              {sidebarOpen && <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded">7 Agents</span>}
            </button>
            <button
              onClick={() => navigateTo('approval-center')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'approval-center' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">✓</span>
              {sidebarOpen && <span className="text-sm font-medium">Approval Center</span>}
            </button>
          </div>

          {/* CLIENT EXPERIENCE */}
          <div className="mb-2">
            {sidebarOpen && <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-1 font-semibold">CLIENT EXPERIENCE</div>}
            <button
              onClick={() => navigateTo('white-label')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'white-label' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{Icons.clientExperience}</span>
                {sidebarOpen && <span className="text-sm font-medium">White-Label</span>}
              </div>
              {sidebarOpen && <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded">Phase 4B</span>}
            </button>
            <button
              onClick={() => navigateTo('client-portal')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'client-portal' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{Icons.clientExperience}</span>
              {sidebarOpen && <span className="text-sm font-medium">Client Portal</span>}
            </button>
          </div>

          {/* INTELLIGENCE */}
          <div className="mb-2">
            {sidebarOpen && <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-1 font-semibold">INTELLIGENCE</div>}
            <button
              onClick={() => navigateTo('lead-intelligence')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'lead-intelligence' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{Icons.search}</span>
                {sidebarOpen && <span className="text-sm font-medium">Lead Intelligence</span>}
              </div>
              {sidebarOpen && <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded">Phase 3B</span>}
            </button>
            <button
              onClick={() => navigateTo('ai-lead-analysis')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'ai-lead-analysis' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{Icons.ai}</span>
              {sidebarOpen && <span className="text-sm font-medium">AI Lead Analysis</span>}
            </button>
            <button
              onClick={() => navigateTo('call-intelligence')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'call-intelligence' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{Icons.calls}</span>
              {sidebarOpen && <span className="text-sm font-medium">Call Intelligence</span>}
            </button>
            <button
              onClick={() => navigateTo('lead-scoring')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'lead-scoring' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{Icons.star}</span>
              {sidebarOpen && <span className="text-sm font-medium">Lead Scoring (0-100)</span>}
            </button>
            <button
              onClick={() => navigateTo('opportunities')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'opportunities' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">💡</span>
              {sidebarOpen && <span className="text-sm font-medium">Opportunities</span>}
            </button>
          </div>

          {/* PIPELINE */}
          <div className="mb-2">
            {sidebarOpen && <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-1 font-semibold">PIPELINE</div>}
            <button
              onClick={() => navigateTo('kanban')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'kanban' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{Icons.kanban}</span>
              {sidebarOpen && <span className="text-sm font-medium">Pipeline / Kanban</span>}
            </button>
            <button
              onClick={() => navigateTo('audits-proposals')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'audits-proposals' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">📋</span>
              {sidebarOpen && <span className="text-sm font-medium">Audits & Proposals</span>}
            </button>
            <button
              onClick={() => navigateTo('follow-up-queue')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'follow-up-queue' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{Icons.clock}</span>
              {sidebarOpen && <span className="text-sm font-medium">Follow-Up Queue</span>}
            </button>
          </div>

          {/* OUTREACH */}
          <div className="mb-2">
            {sidebarOpen && <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-1 font-semibold">OUTREACH</div>}
            <button
              onClick={() => navigateTo('emails')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'emails' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{Icons.emails}</span>
              {sidebarOpen && <span className="text-sm font-medium">Email Outreach</span>}
            </button>
            <button
              onClick={() => navigateTo('sms-outreach')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'sms-outreach' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{Icons.sms}</span>
                {sidebarOpen && <span className="text-sm font-medium">SMS Outreach</span>}
              </div>
              {sidebarOpen && <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded">Phase 3C</span>}
            </button>
            <button
              onClick={() => navigateTo('dialer')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'dialer' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{Icons.calls}</span>
              {sidebarOpen && <span className="text-sm font-medium">Calls & Dialer</span>}
            </button>
          </div>

          {/* REPORTING */}
          <div className="mb-2">
            {sidebarOpen && <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-1 font-semibold">REPORTING</div>}
            <button
              onClick={() => navigateTo('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'analytics' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{Icons.analytics}</span>
              {sidebarOpen && <span className="text-sm font-medium">Analytics</span>}
            </button>
            <button
              onClick={() => navigateTo('revenue-forecast')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'revenue-forecast' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">💰</span>
              {sidebarOpen && <span className="text-sm font-medium">Revenue Forecast</span>}
            </button>
          </div>

          {/* SETTINGS */}
          <div className="mb-2">
            {sidebarOpen && <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-1 font-semibold">SETTINGS</div>}
            <button
              onClick={() => navigateTo('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'settings' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{Icons.settings}</span>
              {sidebarOpen && <span className="text-sm font-medium">Agency Settings</span>}
            </button>
            <button
              onClick={() => navigateTo('integrations')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'integrations' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">🔌</span>
              {sidebarOpen && <span className="text-sm font-medium">Integrations</span>}
            </button>
            <button
              onClick={() => navigateTo('team')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'team' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">👥</span>
              {sidebarOpen && <span className="text-sm font-medium">Team</span>}
            </button>
            <button
              onClick={() => navigateTo('sophia-workforce')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'sophia-workforce' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{Icons.ai}</span>
                {sidebarOpen && <span className="text-sm font-medium">Sophia & Workforce</span>}
              </div>
              {sidebarOpen && <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded">Phase 4A</span>}
            </button>
          </div>

          {/* OPS */}
          <div className="mb-2">
            {sidebarOpen && <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-1 font-semibold">OPS</div>}
            <button
              onClick={() => navigateTo('ops')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'ops' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">⚙️</span>
                {sidebarOpen && <span className="text-sm font-medium">Operations</span>}
              </div>
              {sidebarOpen && <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded">Phase 4A</span>}
            </button>
          </div>
        </nav>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 border-t border-gray-700 text-gray-400 hover:text-white">
          {sidebarOpen ? '◀ Collapse' : '▶'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {currentPage === 'dashboard' && <DashboardPage onNavigate={navigateTo} onViewLead={navigateToLead} />}
        {currentPage === 'command' && <CommandCenterPage onNavigate={navigateTo} onViewLead={navigateToLead} />}
        {currentPage === 'leads' && <LeadsPage onViewLead={navigateToLead} />}
        {currentPage === 'lead-lists' && <LeadListsPage onViewLead={navigateToLead} />}
        {currentPage === 'import-leads' && <ImportLeadsPage />}
        {currentPage === 'lead-detail' && selectedLeadId && <LeadDetailPage leadId={selectedLeadId} onBack={() => navigateTo('leads')} />}
        {currentPage === 'kanban' && <KanbanPage onViewLead={navigateToLead} />}
        {currentPage === 'clients' && <ClientsPage />}
        {currentPage === 'ai' && <AIPage onViewLead={navigateToLead} />}
        {currentPage === 'ai-workforce' && <AIWorkforcePage />}
        {currentPage === 'approval-center' && <ApprovalCenterPage />}
        {currentPage === 'client-portal' && <ClientPortalPage />}
        {currentPage === 'white-label' && <WhiteLabelPage />}
        {currentPage === 'lead-intelligence' && <LeadIntelligencePage onViewLead={navigateToLead} />}
        {currentPage === 'ai-lead-analysis' && <AILeadAnalysisPage onViewLead={navigateToLead} />}
        {currentPage === 'call-intelligence' && <CallIntelligencePage onViewLead={navigateToLead} />}
        {currentPage === 'lead-scoring' && <LeadScoringPage onViewLead={navigateToLead} />}
        {currentPage === 'opportunities' && <OpportunitiesPage onViewLead={navigateToLead} />}
        {currentPage === 'audits-proposals' && <AuditsProposalsPage onViewLead={navigateToLead} />}
        {currentPage === 'follow-up-queue' && <FollowUpQueuePage onViewLead={navigateToLead} />}
        {currentPage === 'calls' && <CallsPage onViewLead={navigateToLead} />}
        {currentPage === 'emails' && <EmailsPage onViewLead={navigateToLead} />}
        {currentPage === 'sms-outreach' && <SMSOutreachPage onViewLead={navigateToLead} />}
        {currentPage === 'outreach' && <OutreachPage onViewLead={navigateToLead} />}
        {currentPage === 'client-experience' && <ClientExperiencePage />}
        {currentPage === 'reporting' && <ReportingPage />}
        {currentPage === 'revenue-forecast' && <RevenueForecastPage />}
        {currentPage === 'analytics' && <AnalyticsPage />}
        {currentPage === 'settings' && <SettingsPage />}
        {currentPage === 'integrations' && <IntegrationsPage />}
        {currentPage === 'team' && <TeamPage />}
        {currentPage === 'sophia-workforce' && <SophiaWorkforcePage />}
        {currentPage === 'ops' && <OpsPage />}
        {currentPage === 'dialer' && <DialerPage onViewLead={navigateToLead} />}
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
          <button onClick={() => onNavigate('dialer')} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <span>📞</span>
            <span>Dialer</span>
          </button>
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

      {/* Quick Dialer Access */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📞</span> Quick Dialer
            </h3>
            <p className="text-white/80 text-sm mt-1">Make calls and send SMS messages instantly</p>
          </div>
          <button 
            onClick={() => onNavigate('dialer')}
            className="px-6 py-3 bg-white text-green-700 hover:bg-gray-100 rounded-lg font-bold transition-colors"
          >
            Open Dialer →
          </button>
        </div>
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

// Placeholder pages - these will be implemented in subsequent parts
function CommandCenterPage({ onNavigate, onViewLead }: { onNavigate: (p: Page) => void; onViewLead: (id: string) => void }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Command Center</h1><p className="text-gray-400 mt-2">Mission control for your agency operations</p></div>;
}

function LeadsPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Leads</h1><p className="text-gray-400 mt-2">Manage your leads</p></div>;
}

function LeadListsPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Lead Lists</h1><p className="text-gray-400 mt-2">Organize leads into lists</p></div>;
}

function ImportLeadsPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Import Leads</h1><p className="text-gray-400 mt-2">Import leads from CSV/Excel</p></div>;
}

function LeadDetailPage({ leadId, onBack }: { leadId: string; onBack: () => void }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Lead Detail</h1><p className="text-gray-400 mt-2">Lead ID: {leadId}</p></div>;
}

function KanbanPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Pipeline / Kanban</h1><p className="text-gray-400 mt-2">Visual pipeline view</p></div>;
}

function ClientsPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Clients</h1><p className="text-gray-400 mt-2">Manage your clients</p></div>;
}

function AIPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Sophia AI</h1><p className="text-gray-400 mt-2">AI-powered lead analysis</p></div>;
}

function AIWorkforcePage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Agency AI Workforce</h1><p className="text-gray-400 mt-2">7 AI agents working for you</p></div>;
}

function ApprovalCenterPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Approval Center</h1><p className="text-gray-400 mt-2">Review and approve AI-generated content</p></div>;
}

function ClientPortalPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Client Portal</h1><p className="text-gray-400 mt-2">Client-facing portal</p></div>;
}

function WhiteLabelPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">White-Label</h1><p className="text-gray-400 mt-2">Customize branding for clients</p></div>;
}

function LeadIntelligencePage({ onViewLead }: { onViewLead: (id: string) => void }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Lead Intelligence</h1><p className="text-gray-400 mt-2">Deep insights on leads</p></div>;
}

function AILeadAnalysisPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">AI Lead Analysis</h1><p className="text-gray-400 mt-2">AI-powered analysis</p></div>;
}

function CallIntelligencePage({ onViewLead }: { onViewLead: (id: string) => void }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Call Intelligence</h1><p className="text-gray-400 mt-2">Call analytics and insights</p></div>;
}

function LeadScoringPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Lead Scoring (0-100)</h1><p className="text-gray-400 mt-2">Score and rank leads</p></div>;
}

function OpportunitiesPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Opportunities</h1><p className="text-gray-400 mt-2">High-value opportunities</p></div>;
}

function AuditsProposalsPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Audits & Proposals</h1><p className="text-gray-400 mt-2">Track audits and proposals</p></div>;
}

function FollowUpQueuePage({ onViewLead }: { onViewLead: (id: string) => void }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Follow-Up Queue</h1><p className="text-gray-400 mt-2">Pending follow-ups</p></div>;
}

function CallsPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Calls</h1><p className="text-gray-400 mt-2">Call history</p></div>;
}

function EmailsPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Emails</h1><p className="text-gray-400 mt-2">Email history</p></div>;
}

function SMSOutreachPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">SMS Outreach</h1><p className="text-gray-400 mt-2">SMS campaigns</p></div>;
}

function OutreachPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Outreach</h1><p className="text-gray-400 mt-2">Multi-channel outreach</p></div>;
}

function ClientExperiencePage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Client Experience</h1><p className="text-gray-400 mt-2">Client satisfaction and retention</p></div>;
}

function ReportingPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Reporting</h1><p className="text-gray-400 mt-2">Reports and analytics</p></div>;
}

function RevenueForecastPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Revenue Forecast</h1><p className="text-gray-400 mt-2">Revenue projections</p></div>;
}

function AnalyticsPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1><p className="text-gray-400 mt-2">Detailed analytics</p></div>;
}

function SettingsPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Agency Settings</h1><p className="text-gray-400 mt-2">Configure your agency</p></div>;
}

function IntegrationsPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Integrations</h1><p className="text-gray-400 mt-2">Manage integrations</p></div>;
}

function TeamPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Team</h1><p className="text-gray-400 mt-2">Team management</p></div>;
}

function SophiaWorkforcePage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Sophia & Workforce</h1><p className="text-gray-400 mt-2">AI workforce configuration</p></div>;
}

function OpsPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Operations</h1><p className="text-gray-400 mt-2">System operations</p></div>;
}

function DialerPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Dialer</h1><p className="text-gray-400 mt-2">Make calls and send SMS</p></div>;
}
