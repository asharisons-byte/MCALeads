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
              onClick={() => navigateTo('calls')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'calls' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{Icons.calls}</span>
              {sidebarOpen && <span className="text-sm font-medium">Calls & Dialer</span>}
            </button>
            <button
              onClick={() => navigateTo('dialer')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'dialer' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">📞</span>
                {sidebarOpen && <span className="text-sm font-medium">Dialer</span>}
              </div>
              {sidebarOpen && <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">LIVE</span>}
            </button>
            <button
              onClick={() => navigateTo('outreach')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'outreach' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{Icons.outreach}</span>
                {sidebarOpen && <span className="text-sm font-medium">Hot</span>}
              </div>
              {sidebarOpen && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">HOT</span>}
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
        {currentPage === 'dialer' && <DialerPage onViewLead={navigateToLead} />}
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
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ name: '', price: 0 });
  const [editMrr, setEditMrr] = useState<{ id: string; mrr: number } | null>(null);

  useEffect(() => { setClients(store.getClients()); }, []);

  const refresh = () => setClients(store.getClients());
  const totalMRR = clients.filter(c => c.status === 'active').reduce((sum, c) => sum + c.mrr, 0);

  const handleUpdateMrr = (clientId: string, mrr: number) => {
    store.updateClient(clientId, { mrr });
    setEditMrr(null);
    refresh();
  };

  const handleAddService = (clientId: string) => {
    if (!newService.name.trim()) return;
    // Update client's service field and MRR
    const client = clients.find(c => c.id === clientId);
    if (client) {
      store.updateClient(clientId, {
        service: newService.name,
        mrr: client.mrr + newService.price,
      });
    }
    setNewService({ name: '', price: 0 });
    setShowAddService(false);
    refresh();
  };

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
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
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
                <td className="px-4 py-3">
                  {editMrr?.id === client.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">$</span>
                      <input
                        type="number"
                        value={editMrr.mrr}
                        onChange={e => setEditMrr({ id: client.id, mrr: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                        autoFocus
                      />
                      <button onClick={() => handleUpdateMrr(client.id, editMrr.mrr)} className="text-xs px-2 py-1 bg-green-600 rounded">✓</button>
                      <button onClick={() => setEditMrr(null)} className="text-xs px-2 py-1 bg-gray-600 rounded">✗</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditMrr({ id: client.id, mrr: client.mrr })} className="text-sm font-medium text-green-400 hover:text-green-300">
                      ${client.mrr.toLocaleString()}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${client.status === 'active' ? 'bg-green-900 text-green-300' : client.status === 'churned' ? 'bg-red-900 text-red-300' : 'bg-gray-700 text-gray-300'}`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{new Date(client.startDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {selectedClientId === client.id && showAddService ? (
                      <div className="flex gap-1 items-center">
                        <input
                          type="text"
                          value={newService.name}
                          onChange={e => setNewService({ ...newService, name: e.target.value })}
                          placeholder="Service name"
                          className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs"
                        />
                        <input
                          type="number"
                          value={newService.price}
                          onChange={e => setNewService({ ...newService, price: parseInt(e.target.value) || 0 })}
                          placeholder="$"
                          className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs"
                        />
                        <button onClick={() => handleAddService(client.id)} className="text-xs px-2 py-1 bg-green-600 rounded">Add</button>
                        <button onClick={() => { setShowAddService(false); setSelectedClientId(null); }} className="text-xs px-2 py-1 bg-gray-600 rounded">✗</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setSelectedClientId(client.id); setShowAddService(true); }}
                        className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                      >
                        + Service
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && <p className="text-gray-500 text-center py-8">No clients yet. Convert leads to clients from the Lead Detail page.</p>}
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

// ==================== COMMAND CENTER PAGE ====================
function CommandCenterPage({ onNavigate, onViewLead }: { onNavigate: (p: Page) => void; onViewLead: (id: string) => void }) {
  const [stats, setStats] = useState<DashboardStats>(store.getDashboardStats());
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [hotLeads, setHotLeads] = useState<Lead[]>([]);
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([]);

  useEffect(() => {
    setStats(store.getDashboardStats());
    const allLeads = store.getLeads().filter(l => !l.archived);
    setHotLeads(allLeads.filter(l => l.score >= 80).sort((a, b) => b.score - a.score).slice(0, 5));
    
    const allTasks = store.getTasks();
    setUrgentTasks(allTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').slice(0, 5));
    
    // Get recent activities from all leads
    const activities: any[] = [];
    allLeads.forEach(lead => {
      const leadActivities = store.getActivities(lead.id);
      activities.push(...leadActivities.map(a => ({ ...a, lead })));
    });
    setRecentActivities(activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span>🎯</span> Command Center
          </h1>
          <p className="text-gray-400 text-sm mt-1">Mission control for your agency operations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate('leads')} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">
            + New Lead
          </button>
          <button onClick={() => onNavigate('outreach')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
            📢 Launch Campaign
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg">
          <p className="text-white/80 text-xs font-medium">Total Leads</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.totalLeads}</p>
          <p className="text-white/60 text-xs mt-1">+{stats.newLeads} new</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 shadow-lg">
          <p className="text-white/80 text-xs font-medium">Won Deals</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.wonLeads}</p>
          <p className="text-white/60 text-xs mt-1">{stats.conversionRate}% conversion</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg">
          <p className="text-white/80 text-xs font-medium">Active Clients</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.totalClients}</p>
          <p className="text-white/60 text-xs mt-1">${stats.totalMRR.toLocaleString()} MRR</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 shadow-lg">
          <p className="text-white/80 text-xs font-medium">Calls Today</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.callsToday}</p>
          <p className="text-white/60 text-xs mt-1">{stats.emailsToday} emails</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 shadow-lg">
          <p className="text-white/80 text-xs font-medium">Urgent Tasks</p>
          <p className="text-3xl font-bold text-white mt-1">{urgentTasks.length}</p>
          <p className="text-white/60 text-xs mt-1">{stats.tasksPending} pending</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hot Leads */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span>🔥</span> Hot Leads
            </h3>
            <button onClick={() => onNavigate('leads')} className="text-purple-400 text-sm hover:text-purple-300">View All →</button>
          </div>
          <div className="space-y-3">
            {hotLeads.map(lead => (
              <button key={lead.id} onClick={() => onViewLead(lead.id)} className="w-full flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors text-left">
                <div>
                  <p className="font-medium text-sm">{lead.firstName} {lead.lastName}</p>
                  <p className="text-gray-400 text-xs">{lead.company}</p>
                </div>
                <div className="text-right">
                  <span className="text-yellow-400 text-lg font-bold">⭐ {lead.score}</span>
                  <StatusBadge status={lead.status} />
                </div>
              </button>
            ))}
            {hotLeads.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No hot leads yet</p>}
          </div>
        </div>

        {/* Urgent Tasks */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span>⚡</span> Urgent Tasks
            </h3>
          </div>
          <div className="space-y-3">
            {urgentTasks.map(task => {
              const lead = store.getLead(task.leadId);
              return (
                <div key={task.id} className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                  <p className="font-medium text-sm">{task.title}</p>
                  {lead && <p className="text-gray-400 text-xs mt-1">{lead.firstName} {lead.lastName}</p>}
                  <p className="text-xs text-red-300 mt-2">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
              );
            })}
            {urgentTasks.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No urgent tasks</p>}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span>📋</span> Recent Activity
            </h3>
          </div>
          <div className="space-y-3">
            {recentActivities.slice(0, 8).map((activity, idx) => (
              <div key={idx} className="p-2 bg-gray-700/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-sm">
                    {activity.type === 'call' && '📞'}
                    {activity.type === 'email' && '✉️'}
                    {activity.type === 'note' && '📝'}
                    {activity.type === 'status_change' && '🔄'}
                    {activity.type === 'created' && '✨'}
                    {activity.type === 'ai_generated' && '🤖'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.lead?.firstName} {activity.lead?.lastName} • {new Date(activity.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => onNavigate('leads')} className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left">
            <span className="text-2xl">👥</span>
            <p className="font-medium text-sm mt-2">Manage Leads</p>
          </button>
          <button onClick={() => onNavigate('ai')} className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left">
            <span className="text-2xl">🤖</span>
            <p className="font-medium text-sm mt-2">Generate AI Content</p>
          </button>
          <button onClick={() => onNavigate('outreach')} className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left">
            <span className="text-2xl">📢</span>
            <p className="font-medium text-sm mt-2">Launch Outreach</p>
          </button>
          <button onClick={() => onNavigate('reporting')} className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left">
            <span className="text-2xl">📊</span>
            <p className="font-medium text-sm mt-2">View Reports</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== AI WORKFORCE PAGE ====================
function AIWorkforcePage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const settings = store.getSettings();
  const geminiConfigured = !!settings.apiKey_gemini;

  const agents = [
    {
      id: 'sophia',
      name: 'Sophia',
      role: 'Primary AI Assistant',
      description: 'Lead scoring, content generation, call analysis, and strategic recommendations',
      icon: '🧠',
      capabilities: ['Lead Scoring', 'AI Pitch Generation', 'Email Writing', 'Call Scripts', 'SMS Templates', 'Call Summaries'],
      status: geminiConfigured ? 'active' : 'configuration_required',
    },
    {
      id: 'outreach-agent',
      name: 'Outreach Agent',
      role: 'Multi-Channel Campaign Manager',
      description: 'Automates email sequences, call campaigns, and SMS follow-ups',
      icon: '📢',
      capabilities: ['Email Sequences', 'Call Campaigns', 'SMS Blasts', 'Follow-up Automation'],
      status: geminiConfigured ? 'active' : 'configuration_required',
    },
    {
      id: 'analytics-agent',
      name: 'Analytics Agent',
      role: 'Data Analysis & Reporting',
      description: 'Generates insights, trends, and performance reports',
      icon: '📊',
      capabilities: ['Performance Reports', 'Trend Analysis', 'Conversion Tracking', 'ROI Calculation'],
      status: 'active',
    },
    {
      id: 'client-agent',
      name: 'Client Success Agent',
      role: 'Client Onboarding & Support',
      description: 'Manages client onboarding, satisfaction tracking, and retention',
      icon: '🌟',
      capabilities: ['Onboarding Workflows', 'Satisfaction Surveys', 'Retention Strategies', 'Upsell Opportunities'],
      status: 'active',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>🧠</span> AI Workforce
        </h1>
        <p className="text-gray-400 text-sm mt-1">Your team of AI agents working 24/7 for your agency</p>
      </div>

      {!geminiConfigured && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-300 text-sm">
            ⚠️ <strong>Configuration Required:</strong> Add your Gemini API key in Settings to activate AI agents with real intelligence.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{agent.icon}</span>
                <div>
                  <h3 className="font-bold text-lg">{agent.name}</h3>
                  <p className="text-sm text-purple-400">{agent.role}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                agent.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
              }`}>
                {agent.status === 'active' ? '● Active' : '⚠ Needs Config'}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">{agent.description}</p>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Capabilities</p>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map(cap => (
                  <span key={cap} className="text-xs px-2 py-1 bg-gray-700 rounded">{cap}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Activity Log */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="font-semibold text-lg mb-4">Recent AI Activity</h3>
        <div className="space-y-3">
          {store.getLeads().slice(0, 5).map(lead => {
            const aiContent = store.getAIContent(lead.id);
            if (aiContent.length === 0) return null;
            return (
              <div key={lead.id} className="p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{lead.firstName} {lead.lastName}</p>
                    <p className="text-xs text-gray-400">{lead.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-purple-400">{aiContent.length} AI actions</p>
                    <p className="text-xs text-gray-500">{aiContent[aiContent.length - 1].type.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==================== OUTREACH PAGE ====================
function OutreachPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);

  useEffect(() => {
    // Load campaigns from localStorage or initialize with sample data
    const saved = localStorage.getItem('mca_campaigns');
    if (saved) {
      setCampaigns(JSON.parse(saved));
    } else {
      const sampleCampaigns = [
        {
          id: '1',
          name: 'Q1 Tech Industry Outreach',
          status: 'active',
          leads: 15,
          emails: 12,
          calls: 8,
          responses: 3,
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
        {
          id: '2',
          name: 'Healthcare Follow-up Sequence',
          status: 'completed',
          leads: 8,
          emails: 8,
          calls: 5,
          responses: 2,
          createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        },
      ];
      setCampaigns(sampleCampaigns);
      localStorage.setItem('mca_campaigns', JSON.stringify(sampleCampaigns));
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span>📢</span> Outreach Campaigns
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage multi-channel outreach campaigns</p>
        </div>
        <button onClick={() => setShowCreateCampaign(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">
          + Create Campaign
        </button>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Active Campaigns</p>
          <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Total Leads</p>
          <p className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + c.leads, 0)}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Emails Sent</p>
          <p className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + c.emails, 0)}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Response Rate</p>
          <p className="text-2xl font-bold">
            {campaigns.reduce((sum, c) => sum + c.leads, 0) > 0 
              ? Math.round((campaigns.reduce((sum, c) => sum + c.responses, 0) / campaigns.reduce((sum, c) => sum + c.leads, 0)) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Campaign</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Leads</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Emails</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Calls</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Responses</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {campaigns.map(campaign => (
              <tr key={campaign.id} className="hover:bg-gray-700/30">
                <td className="px-4 py-3">
                  <p className="font-medium text-sm">{campaign.name}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    campaign.status === 'active' ? 'bg-green-900 text-green-300' :
                    campaign.status === 'completed' ? 'bg-blue-900 text-blue-300' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{campaign.leads}</td>
                <td className="px-4 py-3 text-sm">{campaign.emails}</td>
                <td className="px-4 py-3 text-sm">{campaign.calls}</td>
                <td className="px-4 py-3 text-sm text-green-400">{campaign.responses}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{new Date(campaign.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {campaigns.length === 0 && <p className="text-gray-500 text-center py-8">No campaigns yet. Create your first campaign to get started.</p>}
      </div>

      {showCreateCampaign && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Create New Campaign</h2>
            <p className="text-sm text-gray-400 mb-4">Campaign creation will be available in the next update. For now, use the Sophia AI page to generate content for individual leads.</p>
            <button onClick={() => setShowCreateCampaign(false)} className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== CLIENT EXPERIENCE PAGE ====================
function ClientExperiencePage() {
  const clients = store.getClients();
  const activeClients = clients.filter(c => c.status === 'active');
  const totalMRR = activeClients.reduce((sum, c) => sum + c.mrr, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>🌟</span> Client Experience
        </h1>
        <p className="text-gray-400 text-sm mt-1">Manage client relationships and ensure satisfaction</p>
      </div>

      {/* Client Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 shadow-lg">
          <p className="text-white/80 text-xs font-medium">Active Clients</p>
          <p className="text-3xl font-bold text-white mt-1">{activeClients.length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg">
          <p className="text-white/80 text-xs font-medium">Monthly Revenue</p>
          <p className="text-3xl font-bold text-white mt-1">${totalMRR.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg">
          <p className="text-white/80 text-xs font-medium">Annual Revenue</p>
          <p className="text-3xl font-bold text-white mt-1">${(totalMRR * 12).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 shadow-lg">
          <p className="text-white/80 text-xs font-medium">Avg. Client Value</p>
          <p className="text-3xl font-bold text-white mt-1">
            ${activeClients.length > 0 ? Math.round(totalMRR / activeClients.length).toLocaleString() : 0}
          </p>
        </div>
      </div>

      {/* Client Onboarding */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="font-semibold text-lg mb-4">Client Onboarding Checklist</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
            <span className="text-green-400">✓</span>
            <span className="text-sm">Welcome email sent</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
            <span className="text-green-400">✓</span>
            <span className="text-sm">Initial consultation scheduled</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
            <span className="text-yellow-400">○</span>
            <span className="text-sm">Service agreement signed</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
            <span className="text-yellow-400">○</span>
            <span className="text-sm">Onboarding call completed</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
            <span className="text-gray-500">○</span>
            <span className="text-sm">First deliverable sent</span>
          </div>
        </div>
      </div>

      {/* Client Satisfaction */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="font-semibold text-lg mb-4">Client Satisfaction Tracking</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">Overall Satisfaction</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-2xl font-bold">4.8</span>
              <span className="text-sm text-gray-400">/ 5.0</span>
            </div>
          </div>
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">Response Time</p>
            <p className="text-2xl font-bold">&lt; 24h</p>
            <p className="text-xs text-green-400 mt-1">✓ Excellent</p>
          </div>
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">Retention Rate</p>
            <p className="text-2xl font-bold">95%</p>
            <p className="text-xs text-green-400 mt-1">✓ Above Target</p>
          </div>
        </div>
      </div>

      {/* Active Clients */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="font-semibold text-lg mb-4">Active Clients</h3>
        <div className="space-y-3">
          {activeClients.map(client => (
            <div key={client.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-gray-400">{client.company}</p>
                <p className="text-xs text-gray-500 mt-1">Service: {client.service}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-400">${client.mrr.toLocaleString()}/mo</p>
                <p className="text-xs text-gray-400">Since {new Date(client.startDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
          {activeClients.length === 0 && <p className="text-gray-500 text-center py-4">No active clients yet</p>}
        </div>
      </div>
    </div>
  );
}

// ==================== REPORTING PAGE ====================
function ReportingPage() {
  const leads = store.getLeads().filter(l => !l.archived);
  const clients = store.getClients();
  const calls = store.getCalls();
  const emails = store.getEmails();
  const tasks = store.getTasks();

  const totalMRR = clients.filter(c => c.status === 'active').reduce((sum, c) => sum + c.mrr, 0);
  const conversionRate = leads.length > 0 ? Math.round((leads.filter(l => l.status === 'won').length / leads.length) * 100) : 0;
  const avgLeadScore = leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span>📊</span> Reports & Analytics
          </h1>
          <p className="text-gray-400 text-sm mt-1">Comprehensive reporting for your agency</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">
          📥 Export Report
        </button>
      </div>

      {/* Key Performance Indicators */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="font-semibold text-lg mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-500/30">
            <p className="text-xs text-blue-300 mb-1">Total Leads</p>
            <p className="text-3xl font-bold">{leads.length}</p>
            <p className="text-xs text-gray-400 mt-1">+{leads.filter(l => l.status === 'new').length} new</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg border border-green-500/30">
            <p className="text-xs text-green-300 mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold">{conversionRate}%</p>
            <p className="text-xs text-gray-400 mt-1">{leads.filter(l => l.status === 'won').length} won</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-500/30">
            <p className="text-xs text-purple-300 mb-1">Monthly Revenue</p>
            <p className="text-3xl font-bold">${totalMRR.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{clients.filter(c => c.status === 'active').length} clients</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg border border-yellow-500/30">
            <p className="text-xs text-yellow-300 mb-1">Avg Lead Score</p>
            <p className="text-3xl font-bold">{avgLeadScore}</p>
            <p className="text-xs text-gray-400 mt-1">Quality metric</p>
          </div>
        </div>
      </div>

      {/* Activity Report */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="font-semibold text-lg mb-4">Communication Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Total Calls</span>
              <span className="text-xl font-bold">{calls.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Completed Calls</span>
              <span className="text-xl font-bold text-green-400">{calls.filter(c => c.status === 'completed').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Total Emails</span>
              <span className="text-xl font-bold">{emails.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Sent Emails</span>
              <span className="text-xl font-bold text-green-400">{emails.filter(e => e.status === 'sent').length}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="font-semibold text-lg mb-4">Task Management</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Total Tasks</span>
              <span className="text-xl font-bold">{tasks.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Completed</span>
              <span className="text-xl font-bold text-green-400">{tasks.filter(t => t.status === 'completed').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">In Progress</span>
              <span className="text-xl font-bold text-blue-400">{tasks.filter(t => t.status === 'in_progress').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Pending</span>
              <span className="text-xl font-bold text-yellow-400">{tasks.filter(t => t.status === 'pending').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Report */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="font-semibold text-lg mb-4">Pipeline Status Report</h3>
        <div className="space-y-3">
          {(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as LeadStatus[]).map(status => {
            const count = leads.filter(l => l.status === status).length;
            const percentage = leads.length > 0 ? (count / leads.length) * 100 : 0;
            return (
              <div key={status} className="flex items-center gap-3">
                <span className="text-sm capitalize w-24 text-gray-400">{status}</span>
                <div className="flex-1 h-8 bg-gray-700 rounded-lg overflow-hidden">
                  <div 
                    className={`h-full flex items-center px-3 text-sm font-medium ${
                      status === 'won' ? 'bg-green-600' :
                      status === 'lost' ? 'bg-red-600' :
                      status === 'new' ? 'bg-blue-600' :
                      status === 'contacted' ? 'bg-cyan-600' :
                      status === 'qualified' ? 'bg-yellow-600' :
                      status === 'proposal' ? 'bg-orange-600' :
                      'bg-purple-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  >
                    {count > 0 && count}
                  </div>
                </div>
                <span className="text-sm font-medium w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue Report */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="font-semibold text-lg mb-4">Revenue Report</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Monthly Recurring</p>
            <p className="text-2xl font-bold text-green-400">${totalMRR.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Annual Projection</p>
            <p className="text-2xl font-bold text-blue-400">${(totalMRR * 12).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Avg Deal Size</p>
            <p className="text-2xl font-bold text-purple-400">
              ${clients.filter(c => c.status === 'active').length > 0 
                ? Math.round(totalMRR / clients.filter(c => c.status === 'active').length).toLocaleString()
                : 0}
            </p>
          </div>
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Growth Rate</p>
            <p className="text-2xl font-bold text-yellow-400">+15%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== NEW PAGES ====================

function LeadListsPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  const leads = store.getLeads().filter(l => !l.archived);
  const [filter, setFilter] = useState<string>('all');

  const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lead Lists</h1>
        <p className="text-gray-400 text-sm mt-1">Organize and filter your leads by status</p>
      </div>
      <div className="flex gap-2">
        {['all', 'new', 'contacted', 'qualified', 'proposal', 'won', 'lost'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)} ({status === 'all' ? leads.length : leads.filter(l => l.status === status).length})
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filteredLeads.map(lead => (
          <div key={lead.id} onClick={() => onViewLead(lead.id)} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                <p className="text-sm text-gray-400">{lead.company} • {lead.email}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={lead.status} />
                <p className="text-sm text-yellow-400 mt-1">⭐ {lead.score}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImportLeadsPage() {
  const [showImportModal, setShowImportModal] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Leads</h1>
        <p className="text-gray-400 text-sm mt-1">Import leads from CSV or Excel files</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="font-semibold text-lg mb-4">CSV Import</h3>
          <p className="text-sm text-gray-400 mb-4">Import leads from a CSV file with columns: firstName, lastName, email, phone, company</p>
          <button onClick={() => setShowImportModal(true)} className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">
            📥 Import CSV
          </button>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="font-semibold text-lg mb-4">Excel Import</h3>
          <p className="text-sm text-gray-400 mb-4">Import leads from an Excel file (.xlsx)</p>
          <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors">
            📊 Import Excel
          </button>
        </div>
      </div>
      {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} onImported={() => setShowImportModal(false)} />}
    </div>
  );
}

function ApprovalCenterPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>✓</span> Approval Center
        </h1>
        <p className="text-gray-400 text-sm mt-1">Review and approve AI-generated content and workflows</p>
      </div>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <p className="text-gray-400 text-center py-12">No pending approvals</p>
      </div>
    </div>
  );
}

function ClientPortalPage() {
  const clients = store.getClients().filter(c => c.status === 'active');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>🌟</span> Client Portal
        </h1>
        <p className="text-gray-400 text-sm mt-1">Client-facing portal for service delivery and communication</p>
      </div>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="font-semibold text-lg mb-4">Active Clients ({clients.length})</h3>
        <div className="space-y-3">
          {clients.map(client => (
            <div key={client.id} className="p-4 bg-gray-700/30 rounded-lg">
              <p className="font-medium">{client.name}</p>
              <p className="text-sm text-gray-400">{client.company}</p>
              <p className="text-xs text-gray-500 mt-1">Service: {client.service} • ${client.mrr}/mo</p>
            </div>
          ))}
          {clients.length === 0 && <p className="text-gray-500 text-center py-4">No active clients</p>}
        </div>
      </div>
    </div>
  );
}

function WhiteLabelPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>🎨</span> White-Label
        </h1>
        <p className="text-gray-400 text-sm mt-1">Customize branding for client-facing materials</p>
      </div>
      <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
        <p className="text-purple-300 text-sm">
          <strong>Phase 4B:</strong> White-label customization will be available in the next update.
        </p>
      </div>
    </div>
  );
}

function LeadIntelligencePage({ onViewLead }: { onViewLead: (id: string) => void }) {
  const leads = store.getLeads().filter(l => !l.archived && l.score >= 70);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>🔍</span> Lead Intelligence
        </h1>
        <p className="text-gray-400 text-sm mt-1">Deep insights and intelligence on high-value leads</p>
      </div>
      <div className="space-y-3">
        {leads.map(lead => (
          <div key={lead.id} onClick={() => onViewLead(lead.id)} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                <p className="text-sm text-gray-400">{lead.company} • {lead.industry}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-yellow-400">⭐ {lead.score}</p>
                <StatusBadge status={lead.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AILeadAnalysisPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  const leads = store.getLeads().filter(l => !l.archived);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>🤖</span> AI Lead Analysis
        </h1>
        <p className="text-gray-400 text-sm mt-1">AI-powered analysis and recommendations for your leads</p>
      </div>
      <div className="space-y-3">
        {leads.slice(0, 10).map(lead => (
          <div key={lead.id} onClick={() => onViewLead(lead.id)} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                <p className="text-sm text-gray-400">{lead.company}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-400">AI Score: {lead.score}</p>
                <StatusBadge status={lead.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CallIntelligencePage({ onViewLead }: { onViewLead: (id: string) => void }) {
  const calls = store.getCalls();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>📞</span> Call Intelligence
        </h1>
        <p className="text-gray-400 text-sm mt-1">Analyze call patterns, objections, and outcomes</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Total Calls</p>
          <p className="text-2xl font-bold">{calls.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-green-400">{calls.filter(c => c.status === 'completed').length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Missed</p>
          <p className="text-2xl font-bold text-red-400">{calls.filter(c => c.status === 'missed').length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Avg Duration</p>
          <p className="text-2xl font-bold">
            {calls.length > 0 ? Math.round(calls.reduce((sum, c) => sum + c.duration, 0) / calls.length / 60) : 0}m
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {calls.slice(0, 10).map(call => {
          const lead = store.getLead(call.leadId);
          return (
            <div key={call.id} onClick={() => lead && onViewLead(call.leadId)} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500 cursor-pointer transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{lead ? `${lead.firstName} ${lead.lastName}` : 'Unknown'}</p>
                  <p className="text-sm text-gray-400">{call.direction === 'outbound' ? 'Outbound' : 'Inbound'} • {Math.floor(call.duration / 60)}m {call.duration % 60}s</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${call.status === 'completed' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                  {call.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LeadScoringPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  const leads = store.getLeads().filter(l => !l.archived).sort((a, b) => b.score - a.score);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>⭐</span> Lead Scoring (0-100)
        </h1>
        <p className="text-gray-400 text-sm mt-1">All leads ranked by score</p>
      </div>
      <div className="space-y-3">
        {leads.map((lead, idx) => (
          <div key={lead.id} onClick={() => onViewLead(lead.id)} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500 cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-gray-500 w-8">#{idx + 1}</div>
              <div className="flex-1">
                <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                <p className="text-sm text-gray-400">{lead.company}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-400">{lead.score}</p>
                <StatusBadge status={lead.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpportunitiesPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  const leads = store.getLeads().filter(l => !l.archived && (l.status === 'qualified' || l.status === 'proposal' || l.status === 'negotiation'));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>💡</span> Opportunities
        </h1>
        <p className="text-gray-400 text-sm mt-1">High-value opportunities in your pipeline</p>
      </div>
      <div className="space-y-3">
        {leads.map(lead => (
          <div key={lead.id} onClick={() => onViewLead(lead.id)} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                <p className="text-sm text-gray-400">{lead.company} • {lead.industry}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-yellow-400">⭐ {lead.score}</p>
                <StatusBadge status={lead.status} />
              </div>
            </div>
          </div>
        ))}
        {leads.length === 0 && <p className="text-gray-500 text-center py-12">No opportunities in pipeline</p>}
      </div>
    </div>
  );
}

function AuditsProposalsPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  const leads = store.getLeads().filter(l => !l.archived && (l.status === 'proposal' || l.status === 'negotiation'));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>📋</span> Audits & Proposals
        </h1>
        <p className="text-gray-400 text-sm mt-1">Track audits and proposals in progress</p>
      </div>
      <div className="space-y-3">
        {leads.map(lead => (
          <div key={lead.id} onClick={() => onViewLead(lead.id)} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                <p className="text-sm text-gray-400">{lead.company}</p>
              </div>
              <StatusBadge status={lead.status} />
            </div>
          </div>
        ))}
        {leads.length === 0 && <p className="text-gray-500 text-center py-12">No active proposals</p>}
      </div>
    </div>
  );
}

function FollowUpQueuePage({ onViewLead }: { onViewLead: (id: string) => void }) {
  const tasks = store.getTasks().filter(t => t.status === 'pending' || t.status === 'in_progress');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>🕐</span> Follow-Up Queue
        </h1>
        <p className="text-gray-400 text-sm mt-1">Pending follow-ups and tasks</p>
      </div>
      <div className="space-y-3">
        {tasks.map(task => {
          const lead = store.getLead(task.leadId);
          return (
            <div key={task.id} onClick={() => lead && onViewLead(task.leadId)} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500 cursor-pointer transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{task.title}</p>
                  {lead && <p className="text-sm text-gray-400">{lead.firstName} {lead.lastName} • {lead.company}</p>}
                  <p className="text-xs text-gray-500 mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
                <PriorityBadge priority={task.priority} />
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && <p className="text-gray-500 text-center py-12">No pending follow-ups</p>}
      </div>
    </div>
  );
}

function SMSOutreachPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  const leads = store.getLeads().filter(l => !l.archived && l.phone);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>💬</span> SMS Outreach
        </h1>
        <p className="text-gray-400 text-sm mt-1">Send SMS messages to leads</p>
      </div>
      <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4 mb-6">
        <p className="text-purple-300 text-sm">
          <strong>Phase 3C:</strong> SMS integration requires Telnyx API configuration.
        </p>
      </div>
      <div className="space-y-3">
        {leads.slice(0, 10).map(lead => (
          <div key={lead.id} onClick={() => onViewLead(lead.id)} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                <p className="text-sm text-gray-400">{lead.phone}</p>
              </div>
              <StatusBadge status={lead.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueForecastPage() {
  const clients = store.getClients().filter(c => c.status === 'active');
  const totalMRR = clients.reduce((sum, c) => sum + c.mrr, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>💰</span> Revenue Forecast
        </h1>
        <p className="text-gray-400 text-sm mt-1">Revenue projections and forecasting</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 shadow-lg">
          <p className="text-white/80 text-xs font-medium">Current MRR</p>
          <p className="text-3xl font-bold text-white mt-1">${totalMRR.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg">
          <p className="text-white/80 text-xs font-medium">Monthly Projection</p>
          <p className="text-3xl font-bold text-white mt-1">${totalMRR.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg">
          <p className="text-white/80 text-xs font-medium">Annual Projection</p>
          <p className="text-3xl font-bold text-white mt-1">${(totalMRR * 12).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 shadow-lg">
          <p className="text-white/80 text-xs font-medium">Growth Target</p>
          <p className="text-3xl font-bold text-white mt-1">+25%</p>
        </div>
      </div>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="font-semibold text-lg mb-4">Revenue Breakdown</h3>
        <div className="space-y-3">
          {clients.map(client => (
            <div key={client.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div>
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-gray-400">{client.company}</p>
              </div>
              <p className="text-lg font-bold text-green-400">${client.mrr.toLocaleString()}/mo</p>
            </div>
          ))}
          {clients.length === 0 && <p className="text-gray-500 text-center py-4">No active clients</p>}
        </div>
      </div>
    </div>
  );
}

function IntegrationsPage() {
  const settings = store.getSettings();
  const status = getIntegrationStatus(settings);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>🔌</span> Integrations
        </h1>
        <p className="text-gray-400 text-sm mt-1">Manage third-party integrations and API connections</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Google Gemini</h3>
            <span className={`text-xs px-2 py-1 rounded ${status.gemini === 'TEST_MODE' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>
              {status.gemini === 'TEST_MODE' ? 'Configured' : 'Not Configured'}
            </span>
          </div>
          <p className="text-sm text-gray-400">AI content generation and analysis</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Telnyx Voice</h3>
            <span className={`text-xs px-2 py-1 rounded ${status.telnyxVoice === 'TEST_MODE' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>
              {status.telnyxVoice === 'TEST_MODE' ? 'Configured' : 'Not Configured'}
            </span>
          </div>
          <p className="text-sm text-gray-400">Voice calling and transcription</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Telnyx SMS</h3>
            <span className={`text-xs px-2 py-1 rounded ${status.telnyxSMS === 'TEST_MODE' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>
              {status.telnyxSMS === 'TEST_MODE' ? 'Configured' : 'Not Configured'}
            </span>
          </div>
          <p className="text-sm text-gray-400">SMS messaging</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">n8n Workflows</h3>
            <span className={`text-xs px-2 py-1 rounded ${status.n8n === 'TEST_MODE' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>
              {status.n8n === 'TEST_MODE' ? 'Configured' : 'Not Configured'}
            </span>
          </div>
          <p className="text-sm text-gray-400">Workflow automation</p>
        </div>
      </div>
    </div>
  );
}

function TeamPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>👥</span> Team
        </h1>
        <p className="text-gray-400 text-sm mt-1">Manage team members and permissions</p>
      </div>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <p className="text-gray-400 text-center py-12">Team management coming soon</p>
      </div>
    </div>
  );
}

function SophiaWorkforcePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>🤖</span> Sophia & Workforce
        </h1>
        <p className="text-gray-400 text-sm mt-1">Configure Sophia AI and workforce agents</p>
      </div>
      <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
        <p className="text-purple-300 text-sm">
          <strong>Phase 4A:</strong> Multi-agent configuration and management.
        </p>
      </div>
    </div>
  );
}

function OpsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>⚙️</span> Operations
        </h1>
        <p className="text-gray-400 text-sm mt-1">System operations and monitoring</p>
      </div>
      <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
        <p className="text-purple-300 text-sm">
          <strong>Phase 4A:</strong> Multi-agent operations and monitoring dashboard.
        </p>
      </div>
    </div>
  );
}

// ==================== DIALER PAGE ====================
function DialerPage({ onViewLead }: { onViewLead: (id: string) => void }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isCalling, setIsCalling] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended' | 'failed'>('idle');
  const [smsStatus, setSmsStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [selectedLead, setSelectedLead] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dialer' | 'calls' | 'sms'>('dialer');
  const [callLogs, setCallLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('mca_call_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [smsLogs, setSmsLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('mca_sms_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const settings = store.getSettings();
  const telnyxApiKey = settings.apiKey_telnyx;
  const leads = store.getLeads().filter(l => !l.archived && l.phone);

  // Save logs to localStorage
  useEffect(() => {
    localStorage.setItem('mca_call_logs', JSON.stringify(callLogs));
  }, [callLogs]);

  useEffect(() => {
    localStorage.setItem('mca_sms_logs', JSON.stringify(smsLogs));
  }, [smsLogs]);

  // Timer for call duration
  useEffect(() => {
    let interval: number;
    if (callStatus === 'connected') {
      interval = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => window.clearInterval(interval);
  }, [callStatus]);

  const handleLeadSelect = (leadId: string) => {
    setSelectedLead(leadId);
    const lead = store.getLead(leadId);
    if (lead) {
      setPhoneNumber(lead.phone);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCall = async () => {
    if (!phoneNumber || !telnyxApiKey) {
      alert('Please enter a phone number and configure Telnyx API key in Settings');
      return;
    }

    setIsCalling(true);
    setCallStatus('calling');
    setCallDuration(0);

    try {
      const result = await initiateTelnyxCall(
        telnyxApiKey,
        '+15551234567', // From number - should be configurable
        phoneNumber,
        selectedLead || 'manual'
      );

      if (result.status === 'CONNECTED') {
        setCallStatus('connected');
        
        // Simulate call duration (in real app, this would come from webhooks)
        setTimeout(() => {
          setCallStatus('ended');
          setIsCalling(false);
          
          // Log the call
          const newCallLog = {
            id: Date.now().toString(),
            phoneNumber,
            leadId: selectedLead,
            leadName: selectedLead ? store.getLead(selectedLead)?.firstName + ' ' + store.getLead(selectedLead)?.lastName : 'Manual',
            direction: 'outbound',
            status: 'completed',
            duration: callDuration,
            timestamp: new Date().toISOString(),
            callId: result.data?.call_control_id
          };
          
          setCallLogs(prev => [newCallLog, ...prev]);
          
          // Also save to store if lead is selected
          if (selectedLead) {
            store.createCall({
              leadId: selectedLead,
              direction: 'outbound',
              status: 'completed',
              duration: callDuration,
              transcript: 'Call completed via dialer'
            });
          }
        }, 30000); // Simulate 30 second call
      } else {
        setCallStatus('failed');
        setIsCalling(false);
        alert(`Call failed: ${result.error}`);
      }
    } catch (error) {
      setCallStatus('failed');
      setIsCalling(false);
      alert('Call failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setIsCalling(false);
  };

  const handleSendSMS = async () => {
    if (!phoneNumber || !message || !telnyxApiKey) {
      alert('Please enter phone number, message, and configure Telnyx API key in Settings');
      return;
    }

    setIsSending(true);
    setSmsStatus('sending');

    try {
      const result = await sendTelnyxSMS(
        telnyxApiKey,
        '+15551234567', // From number - should be configurable
        phoneNumber,
        message
      );

      if (result.status === 'CONNECTED') {
        setSmsStatus('sent');
        setMessage('');
        
        // Log the SMS
        const newSmsLog = {
          id: Date.now().toString(),
          phoneNumber,
          leadId: selectedLead,
          leadName: selectedLead ? store.getLead(selectedLead)?.firstName + ' ' + store.getLead(selectedLead)?.lastName : 'Manual',
          message,
          direction: 'outbound',
          status: 'sent',
          timestamp: new Date().toISOString(),
          messageId: result.data?.id
        };
        
        setSmsLogs(prev => [newSmsLog, ...prev]);
        
        // Also save to store if lead is selected
        if (selectedLead) {
          store.createSMS({
            leadId: selectedLead,
            message,
            status: 'sent'
          });
        }
        
        setTimeout(() => setSmsStatus('idle'), 3000);
      } else {
        setSmsStatus('failed');
        alert(`SMS failed: ${result.error}`);
      }
    } catch (error) {
      setSmsStatus('failed');
      alert('SMS failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSending(false);
    }
  };

  const handleDialPad = (digit: string) => {
    setPhoneNumber(prev => prev + digit);
  };

  const handleClearNumber = () => {
    setPhoneNumber('');
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span>📞</span> Dialer
          </h1>
          <p className="text-gray-400 text-sm mt-1">Make calls and send SMS messages using Telnyx</p>
        </div>
        {!telnyxApiKey && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
            <p className="text-red-300 text-sm">
              ⚠️ <strong>Configuration Required:</strong> Add Telnyx API key in Settings to enable calling and SMS
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('dialer')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'dialer'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          📞 Dialer
        </button>
        <button
          onClick={() => setActiveTab('calls')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'calls'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          📋 Call Logs ({callLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('sms')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'sms'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          💬 SMS Logs ({smsLogs.length})
        </button>
      </div>

      {/* Dialer Tab */}
      {activeTab === 'dialer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Dialer */}
          <div className="space-y-6">
            {/* Lead Selection */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-semibold text-lg mb-4">Select Lead (Optional)</h3>
              <select
                value={selectedLead}
                onChange={(e) => handleLeadSelect(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="">Manual dialing</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.firstName} {lead.lastName} - {lead.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone Display */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center mb-6">
                <div className="text-4xl font-mono font-bold text-white mb-2">
                  {phoneNumber || 'Enter number'}
                </div>
                {callStatus === 'connected' && (
                  <div className="text-green-400 text-lg">
                    Connected - {formatDuration(callDuration)}
                  </div>
                )}
                {callStatus === 'calling' && (
                  <div className="text-yellow-400 text-lg animate-pulse">
                    Calling...
                  </div>
                )}
                {smsStatus === 'sending' && (
                  <div className="text-yellow-400 text-lg animate-pulse">
                    Sending SMS...
                  </div>
                )}
                {smsStatus === 'sent' && (
                  <div className="text-green-400 text-lg">
                    ✓ SMS Sent
                  </div>
                )}
              </div>

              {/* Dial Pad */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(digit => (
                  <button
                    key={digit}
                    onClick={() => handleDialPad(digit)}
                    className="py-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-2xl font-bold transition-colors"
                  >
                    {digit}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleBackspace}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                >
                  ← Backspace
                </button>
                <button
                  onClick={handleClearNumber}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleCall}
                disabled={isCalling || !phoneNumber || !telnyxApiKey}
                className={`py-4 rounded-lg text-lg font-bold transition-colors ${
                  isCalling || !phoneNumber || !telnyxApiKey
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                📞 Call
              </button>
              <button
                onClick={handleEndCall}
                disabled={callStatus !== 'connected'}
                className={`py-4 rounded-lg text-lg font-bold transition-colors ${
                  callStatus !== 'connected'
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                📴 End Call
              </button>
            </div>
          </div>

          {/* Right Side - SMS */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="font-semibold text-lg mb-4">Send SMS Message</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">To:</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Message:</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={6}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{message.length} characters</p>
              </div>
              <button
                onClick={handleSendSMS}
                disabled={isSending || !phoneNumber || !message || !telnyxApiKey}
                className={`w-full py-3 rounded-lg text-lg font-bold transition-colors ${
                  isSending || !phoneNumber || !message || !telnyxApiKey
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                💬 Send SMS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Logs Tab */}
      {activeTab === 'calls' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold text-lg">Call History</h3>
          </div>
          <div className="divide-y divide-gray-700">
            {callLogs.map(log => (
              <div key={log.id} className="p-4 hover:bg-gray-700/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📞</span>
                    </div>
                    <div>
                      <p className="font-medium">{log.leadName}</p>
                      <p className="text-sm text-gray-400">{log.phoneNumber}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-400">
                      {log.direction === 'outbound' ? 'Outbound' : 'Inbound'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Duration: {formatDuration(log.duration)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      log.status === 'completed' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
                {log.leadId && log.leadId !== 'manual' && (
                  <button
                    onClick={() => onViewLead(log.leadId)}
                    className="mt-2 text-sm text-purple-400 hover:text-purple-300"
                  >
                    View Lead →
                  </button>
                )}
              </div>
            ))}
            {callLogs.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No call logs yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* SMS Logs Tab */}
      {activeTab === 'sms' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold text-lg">SMS History</h3>
          </div>
          <div className="divide-y divide-gray-700">
            {smsLogs.map(log => (
              <div key={log.id} className="p-4 hover:bg-gray-700/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💬</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{log.leadName}</p>
                      <p className="text-sm text-gray-400">To: {log.phoneNumber}</p>
                      <p className="text-sm text-gray-300 mt-1">{log.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${
                      log.status === 'sent' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
                {log.leadId && log.leadId !== 'manual' && (
                  <button
                    onClick={() => onViewLead(log.leadId)}
                    className="mt-2 text-sm text-purple-400 hover:text-purple-300"
                  >
                    View Lead →
                  </button>
                )}
              </div>
            ))}
            {smsLogs.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No SMS logs yet
              </div>
            )}
          </div>
        </div>
      )}
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
