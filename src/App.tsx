import { useState, useEffect } from 'react';
import { store } from './store';
import { aiGenerator } from './store';
import type { Lead, LeadStatus, Client, Task, CallRecord, EmailRecord } from './types';

// Main App Component
export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setLeads(store.getLeads());
    setClients(store.getClients());
  }, []);

  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead);
    setCurrentPage('lead-detail');
  };

  const handleBack = () => {
    setSelectedLead(null);
    setCurrentPage('leads');
  };

  const refreshData = () => {
    setLeads(store.getLeads());
    setClients(store.getClients());
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {currentPage === 'dashboard' && <Dashboard leads={leads} clients={clients} onNavigate={setCurrentPage} />}
        {currentPage === 'leads' && <LeadsPage leads={leads} onLeadSelect={handleLeadSelect} onRefresh={refreshData} />}
        {currentPage === 'lead-detail' && selectedLead && (
          <LeadDetailPage lead={selectedLead} onBack={handleBack} onRefresh={refreshData} />
        )}
        {currentPage === 'pipeline' && <PipelinePage leads={leads} onRefresh={refreshData} />}
        {currentPage === 'clients' && <ClientsPage clients={clients} onRefresh={refreshData} />}
        {currentPage === 'dialer' && <DialerPage />}
        {currentPage === 'calls' && <CallLogsPage />}
        {currentPage === 'sms' && <SMSLogsPage />}
        {currentPage === 'ai' && <SophiaAIPage leads={leads} />}
        {currentPage === 'settings' && <SettingsPage />}
        {currentPage === 'admin-diagnostic' && <TelnyxDiagnosticTool />}
      </main>
    </div>
  );
}

// Sidebar Component
function Sidebar({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', section: 'WORKSPACE' },
    { id: 'leads', label: 'Leads', icon: '👥', section: 'WORKSPACE' },
    { id: 'pipeline', label: 'Pipeline', icon: '🔄', section: 'WORKSPACE' },
    { id: 'clients', label: 'Clients', icon: '💼', section: 'CLIENT EXPERIENCE' },
    { id: 'dialer', label: 'Dialer', icon: '📞', section: 'OUTREACH' },
    { id: 'calls', label: 'Call Logs', icon: '📋', section: 'OUTREACH' },
    { id: 'sms', label: 'SMS Logs', icon: '💬', section: 'OUTREACH' },
    { id: 'ai', label: 'Sophia AI', icon: '🤖', section: 'AI WORKFORCE' },
    { id: 'settings', label: 'Settings', icon: '⚙️', section: 'SETTINGS' },
    { id: 'admin-diagnostic', label: 'API Diagnostic', icon: '🔧', section: 'ADMIN' },
  ];

  const sections = Array.from(new Set(menuItems.map(item => item.section)));

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">MCA Lead Suite</h1>
        <p className="text-xs text-gray-500 mt-1">Marketing Charm Agency</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        {sections.map(section => (
          <div key={section} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{section}</h3>
            {menuItems.filter(item => item.section === section).map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors mb-1 ${
                  currentPage === item.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

// Dashboard Component
function Dashboard({ leads, clients, onNavigate }: { leads: Lead[]; clients: Client[]; onNavigate: (page: string) => void }) {
  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === 'new').length,
    qualifiedLeads: leads.filter(l => l.status === 'qualified').length,
    wonLeads: leads.filter(l => l.status === 'won').length,
    totalClients: clients.filter(c => c.status === 'active').length,
    totalMRR: clients.filter(c => c.status === 'active').reduce((sum, c) => sum + c.mrr, 0),
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to MCA Lead Agency Suite</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Leads" value={stats.totalLeads} icon="👥" color="blue" />
        <StatCard title="New Leads" value={stats.newLeads} icon="✨" color="green" />
        <StatCard title="Qualified" value={stats.qualifiedLeads} icon="⭐" color="yellow" />
        <StatCard title="Won" value={stats.wonLeads} icon="🏆" color="purple" />
        <StatCard title="Active Clients" value={stats.totalClients} icon="💼" color="indigo" />
        <StatCard title="Monthly MRR" value={`$${stats.totalMRR.toLocaleString()}`} icon="💰" color="pink" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => onNavigate('leads')} className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
            <span className="text-2xl">👥</span>
            <p className="font-medium mt-2">Manage Leads</p>
          </button>
          <button onClick={() => onNavigate('dialer')} className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
            <span className="text-2xl">📞</span>
            <p className="font-medium mt-2">Open Dialer</p>
          </button>
          <button onClick={() => onNavigate('ai')} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
            <span className="text-2xl">🤖</span>
            <p className="font-medium mt-2">Sophia AI</p>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    purple: 'bg-purple-50 text-purple-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    pink: 'bg-pink-50 text-pink-700',
  };

  return (
    <div className={`rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <span className="text-4xl opacity-50">{icon}</span>
      </div>
    </div>
  );
}

// Leads Page Component
function LeadsPage({ leads, onLeadSelect, onRefresh }: { leads: Lead[]; onLeadSelect: (lead: Lead) => void; onRefresh: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = `${lead.firstName} ${lead.lastName} ${lead.company} ${lead.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
        <p className="text-gray-600 mt-1">Manage your leads and prospects</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeads.map(lead => (
                <tr key={lead.id} onClick={() => onLeadSelect(lead)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{lead.firstName} {lead.lastName}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lead.company}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-yellow-600 font-medium">⭐ {lead.score}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLeads.length === 0 && (
            <div className="text-center py-12 text-gray-500">No leads found</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const statusColors: Record<LeadStatus, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    qualified: 'bg-green-100 text-green-700',
    proposal: 'bg-purple-100 text-purple-700',
    negotiation: 'bg-orange-100 text-orange-700',
    won: 'bg-emerald-100 text-emerald-700',
    lost: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {status}
    </span>
  );
}

// Lead Detail Page Component
function LeadDetailPage({ lead, onBack, onRefresh }: { lead: Lead; onBack: () => void; onRefresh: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-8">
      <button onClick={onBack} className="mb-4 text-purple-600 hover:text-purple-700 font-medium">
        ← Back to Leads
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{lead.firstName} {lead.lastName}</h1>
            <p className="text-gray-600 mt-1">{lead.company} • {lead.industry}</p>
          </div>
          <StatusBadge status={lead.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{lead.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{lead.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Score</p>
            <p className="font-medium text-yellow-600">⭐ {lead.score}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Source</p>
            <p className="font-medium">{lead.source}</p>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex gap-4">
            {['overview', 'notes', 'tasks', 'calls', 'emails', 'ai'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Overview</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p>{lead.address || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Website</p>
                <p>{lead.website || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p>{lead.revenue || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Employees</p>
                <p>{lead.employees || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p>{lead.notes || 'No notes'}</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'notes' && <NotesTab leadId={lead.id} />}
        {activeTab === 'tasks' && <TasksTab leadId={lead.id} />}
        {activeTab === 'calls' && <CallsTab leadId={lead.id} />}
        {activeTab === 'emails' && <EmailsTab leadId={lead.id} />}
        {activeTab === 'ai' && <AITab lead={lead} />}
      </div>
    </div>
  );
}

function NotesTab({ leadId }: { leadId: string }) {
  const notes = store.getNotes(leadId);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Notes</h2>
      {notes.length === 0 ? (
        <p className="text-gray-500">No notes yet</p>
      ) : (
        <div className="space-y-4">
          {notes.map(note => (
            <div key={note.id} className="border border-gray-200 rounded-lg p-4">
              <p className="text-gray-900">{note.content}</p>
              <p className="text-sm text-gray-500 mt-2">{note.type} • {new Date(note.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TasksTab({ leadId }: { leadId: string }) {
  const tasks = store.getTasks(leadId);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks yet</p>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="border border-gray-200 rounded-lg p-4">
              <p className="font-medium">{task.title}</p>
              <p className="text-gray-600 text-sm mt-1">{task.description}</p>
              <p className="text-sm text-gray-500 mt-2">{task.priority} • Due: {new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CallsTab({ leadId }: { leadId: string }) {
  const calls = store.getCalls(leadId);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Call History</h2>
      {calls.length === 0 ? (
        <p className="text-gray-500">No calls yet</p>
      ) : (
        <div className="space-y-4">
          {calls.map(call => (
            <div key={call.id} className="border border-gray-200 rounded-lg p-4">
              <p className="font-medium">{call.direction} • {call.status}</p>
              <p className="text-gray-600 text-sm mt-1">Duration: {Math.floor(call.duration / 60)}m {call.duration % 60}s</p>
              {call.transcript && <p className="text-gray-600 text-sm mt-2">{call.transcript}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmailsTab({ leadId }: { leadId: string }) {
  const emails = store.getEmails(leadId);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Email History</h2>
      {emails.length === 0 ? (
        <p className="text-gray-500">No emails yet</p>
      ) : (
        <div className="space-y-4">
          {emails.map(email => (
            <div key={email.id} className="border border-gray-200 rounded-lg p-4">
              <p className="font-medium">{email.subject}</p>
              <p className="text-gray-600 text-sm mt-1">{email.body}</p>
              <p className="text-sm text-gray-500 mt-2">{email.status} • {new Date(email.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AITab({ lead }: { lead: Lead }) {
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);

  const generateContent = async (type: string) => {
    setLoading(true);
    try {
      let content = '';
      switch (type) {
        case 'pitch':
          content = aiGenerator.generatePitch(lead);
          break;
        case 'email':
          const email = aiGenerator.generateEmail(lead);
          content = `Subject: ${email.subject}\n\n${email.body}`;
          break;
        case 'callScript':
          content = aiGenerator.generateCallingScript(lead);
          break;
        case 'sms':
          content = aiGenerator.generateSMSScript(lead);
          break;
      }
      setGeneratedContent(content);
      store.createAIContent({ leadId: lead.id, type: type as any, content });
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">AI Content Generation</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button onClick={() => generateContent('pitch')} disabled={loading} className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
          <span className="text-2xl">📝</span>
          <p className="font-medium mt-2">Generate Pitch</p>
        </button>
        <button onClick={() => generateContent('email')} disabled={loading} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
          <span className="text-2xl">✉️</span>
          <p className="font-medium mt-2">Generate Email</p>
        </button>
        <button onClick={() => generateContent('callScript')} disabled={loading} className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
          <span className="text-2xl">📞</span>
          <p className="font-medium mt-2">Call Script</p>
        </button>
        <button onClick={() => generateContent('sms')} disabled={loading} className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
          <span className="text-2xl">💬</span>
          <p className="font-medium mt-2">SMS Script</p>
        </button>
      </div>
      {loading && <p className="text-gray-600">Generating...</p>}
      {generatedContent && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Generated Content</h3>
          <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
        </div>
      )}
    </div>
  );
}

// Pipeline Page Component
function PipelinePage({ leads, onRefresh }: { leads: Lead[]; onRefresh: () => void }) {
  const statuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pipeline</h1>
        <p className="text-gray-600 mt-1">Visual pipeline view</p>
      </div>

      <div className="flex gap-4 overflow-x-auto">
        {statuses.map(status => {
          const statusLeads = leads.filter(l => l.status === status);
          return (
            <div key={status} className="flex-shrink-0 w-80">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-4 flex items-center justify-between">
                  <StatusBadge status={status} />
                  <span className="text-sm text-gray-500">{statusLeads.length}</span>
                </h3>
                <div className="space-y-3">
                  {statusLeads.map(lead => (
                    <div key={lead.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                      <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                      <p className="text-sm text-gray-600">{lead.company}</p>
                      <p className="text-sm text-yellow-600 mt-1">⭐ {lead.score}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Clients Page Component
function ClientsPage({ clients, onRefresh }: { clients: Client[]; onRefresh: () => void }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-600 mt-1">Manage your active clients</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MRR</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{client.name}</td>
                  <td className="px-4 py-3 text-gray-600">{client.company}</td>
                  <td className="px-4 py-3 text-gray-600">{client.service}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">${client.mrr.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Dialer Page Component - Uses server-side Telnyx endpoint
function DialerPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended' | 'failed'>('idle');
  const [smsStatus, setSmsStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleCall = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    setCallStatus('calling');
    setError(null);

    try {
      const response = await fetch('/api/telnyx/voice/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phoneNumber }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server error: ${text.substring(0, 200)}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Call failed');
      }

      setCallStatus('connected');
      setTimeout(() => setCallStatus('ended'), 30000);
    } catch (err) {
      setCallStatus('failed');
      setError(err instanceof Error ? err.message : 'Call failed');
    }
  };

  const handleSendSMS = async () => {
    if (!phoneNumber || !message) {
      setError('Please enter phone number and message');
      return;
    }

    setSmsStatus('sending');
    setError(null);

    try {
      const response = await fetch('/api/telnyx/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phoneNumber, text: message }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server error: ${text.substring(0, 200)}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'SMS failed');
      }

      setSmsStatus('sent');
      setMessage('');
      setTimeout(() => setSmsStatus('idle'), 3000);
    } catch (err) {
      setSmsStatus('failed');
      setError(err instanceof Error ? err.message : 'SMS failed');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dialer</h1>
        <p className="text-gray-600 mt-1">Make calls and send SMS messages via Telnyx</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Make a Call</h2>
          <input
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleCall}
            disabled={callStatus === 'calling' || callStatus === 'connected'}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:bg-gray-400"
          >
            {callStatus === 'calling' ? 'Calling...' : callStatus === 'connected' ? 'Connected' : 'Call'}
          </button>
          {callStatus === 'ended' && <p className="text-green-600 mt-2">Call completed</p>}
          {callStatus === 'failed' && <p className="text-red-600 mt-2">Call failed</p>}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Send SMS</h2>
          <input
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <textarea
            placeholder="Your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={4}
          />
          <button
            onClick={handleSendSMS}
            disabled={smsStatus === 'sending'}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:bg-gray-400"
          >
            {smsStatus === 'sending' ? 'Sending...' : 'Send SMS'}
          </button>
          {smsStatus === 'sent' && <p className="text-green-600 mt-2">SMS sent</p>}
          {smsStatus === 'failed' && <p className="text-red-600 mt-2">SMS failed</p>}
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

// Call Logs Page Component
function CallLogsPage() {
  const calls = store.getCalls();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Call Logs</h1>
        <p className="text-gray-600 mt-1">View all call history</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {calls.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No calls yet</p>
        ) : (
          <div className="space-y-4">
            {calls.map(call => (
              <div key={call.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{call.direction} • {call.status}</p>
                    <p className="text-sm text-gray-600 mt-1">Duration: {Math.floor(call.duration / 60)}m {call.duration % 60}s</p>
                    {call.transcript && <p className="text-sm text-gray-600 mt-2">{call.transcript}</p>}
                  </div>
                  <p className="text-sm text-gray-500">{new Date(call.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// SMS Logs Page Component
function SMSLogsPage() {
  const smsLogs = store.getSMS();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SMS Logs</h1>
        <p className="text-gray-600 mt-1">View all SMS history</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {smsLogs.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No SMS messages yet</p>
        ) : (
          <div className="space-y-4">
            {smsLogs.map(sms => (
              <div key={sms.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{sms.status}</p>
                    <p className="text-sm text-gray-600 mt-1">{sms.message}</p>
                  </div>
                  <p className="text-sm text-gray-500">{new Date(sms.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Sophia AI Page Component
function SophiaAIPage({ leads }: { leads: Lead[] }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sophia AI</h1>
        <p className="text-gray-600 mt-1">AI-powered lead analysis and content generation</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">Select a lead from the Leads page to generate AI content.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">AI Pitch Generation</h3>
            <p className="text-sm text-gray-600">Generate personalized pitches for leads</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Email Templates</h3>
            <p className="text-sm text-gray-600">Create customized email templates</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Call Scripts</h3>
            <p className="text-sm text-gray-600">Generate call scripts for outreach</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">SMS Templates</h3>
            <p className="text-sm text-gray-600">Create SMS message templates</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Page Component
function SettingsPage() {
  const [settings, setSettings] = useState(store.getSettings());

  const handleSave = () => {
    store.updateSettings(settings);
    alert('Settings saved successfully');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your application settings</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Agency Name</label>
            <input
              type="text"
              value={settings.agencyName}
              onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gemini API Key</label>
            <input
              type="password"
              value={settings.apiKey_gemini}
              onChange={(e) => setSettings({ ...settings, apiKey_gemini: e.target.value })}
              placeholder="Enter your Gemini API key"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-sm text-gray-500 mt-1">Server-side only - never exposed to browser</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">n8n Webhook URL</label>
            <input
              type="text"
              value={settings.webhook_n8n}
              onChange={(e) => setSettings({ ...settings, webhook_n8n: e.target.value })}
              placeholder="https://your-n8n-instance.com/webhook/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

// Telnyx Diagnostic Tool Component (Admin/Testing)
function TelnyxDiagnosticTool() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/telnyx/status');
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
      }
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testCallEndpoint = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/telnyx/voice/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'invalid-number' }),
      });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
      }
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Telnyx API Diagnostic Tool</h1>
        <p className="text-gray-600 mt-1">Admin tool for testing Telnyx API endpoints</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={testStatus}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:bg-gray-400"
          >
            Test /api/telnyx/status
          </button>
          <button
            onClick={testCallEndpoint}
            disabled={loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:bg-gray-400"
          >
            Test /api/telnyx/voice/call (validation only)
          </button>
        </div>

        {loading && <p className="text-gray-600">Loading...</p>}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-red-600 font-medium">Error:</p>
            <pre className="mt-2 text-sm whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {status && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 font-medium">Response:</p>
            <pre className="mt-2 text-sm whitespace-pre-wrap">{JSON.stringify(status, null, 2)}</pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Expected Behavior:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>/api/telnyx/status should return configuration status (no secrets)</li>
            <li>/api/telnyx/voice/call with invalid number should return validation error</li>
            <li>All responses should be JSON with consistent structure</li>
            <li>No real calls should be made during testing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
