import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AgentCard from '../components/AgentCard';
import { getAllAgents, deleteAgent, getTotalStats } from '../utils/agentStorage';
import { getUserSubscription, getMonthlyUsage, checkUsageLimits } from '../utils/subscription';
import { getCurrentUser } from '../utils/userStorage';
import CreateAgent from './CreateAgent';

export default function Dashboard() {
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalConversations: 0,
    totalApiCalls: 0,
    totalVoiceMinutes: 0
  });
  const [subscription, setSubscription] = useState(null);
  const [usageLimits, setUsageLimits] = useState(null);
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'create'
  const [editingAgent, setEditingAgent] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'recent', 'popular'

  useEffect(() => {
    loadAgents();
    loadStats();
    loadSubscription();
  }, []);

  const loadSubscription = () => {
    const user = getCurrentUser();
    if (user) {
      const userSub = getUserSubscription(user.id);
      const limits = checkUsageLimits(user.id);
      setSubscription(userSub);
      setUsageLimits(limits);
    }
  };

  const loadAgents = () => {
    const allAgents = getAllAgents();
    
    let filtered = allAgents;
    if (filter === 'recent') {
      filtered = [...allAgents].sort((a, b) => 
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
    } else if (filter === 'popular') {
      filtered = [...allAgents].sort((a, b) => 
        (b.conversations || 0) - (a.conversations || 0)
      );
    }
    
    setAgents(filtered);
  };

  const loadStats = () => {
    const totalStats = getTotalStats();
    setStats(totalStats);
  };

  const handleDelete = (id) => {
    if (deleteAgent(id)) {
      loadAgents();
      loadStats();
    }
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setView('create');
  };

  const handleAgentCreated = () => {
    loadAgents();
    loadStats();
    setView('dashboard');
    setEditingAgent(null);
  };

  const formatMinutes = (minutes) => {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (view === 'create') {
    return (
      <CreateAgent 
        editingAgent={editingAgent}
        onAgentCreated={handleAgentCreated}
        onCancel={() => {
          setView('dashboard');
          setEditingAgent(null);
        }}
      />
    );
  }

  return (
    <div className="relative pt-32 pb-20 w-full min-h-screen bg-background-dark">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-dark/20 blur-[100px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px] mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBWMGg0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-2">
                Your Dashboard
              </h1>
              <p className="text-lg text-secondary-grey">
                Manage your voice agents and track usage
              </p>
            </div>
            <button
              onClick={() => setView('create')}
              className="h-12 px-6 rounded-full bg-primary hover:bg-primary-glow text-white font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)] hover:scale-105 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Create Agent
            </button>
          </div>

          {/* Usage Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-secondary-grey">Total Agents</span>
                <span className="material-symbols-outlined text-primary">smart_toy</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalAgents}</div>
              {subscription && (
                <div className="text-xs text-secondary-grey mt-1">
                  {subscription.maxAgents === -1 ? 'Unlimited' : `Limit: ${subscription.maxAgents}`}
                </div>
              )}
            </div>
            <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-secondary-grey">Conversations</span>
                <span className="material-symbols-outlined text-primary">forum</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalConversations.toLocaleString()}</div>
            </div>
            <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-secondary-grey">API Calls</span>
                <span className="material-symbols-outlined text-primary">api</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalApiCalls.toLocaleString()}</div>
              {usageLimits && (
                <div className={`text-xs mt-1 ${
                  usageLimits.exceeded.apiCalls ? 'text-accent' : 'text-secondary-grey'
                }`}>
                  {usageLimits.usage.apiCalls.toLocaleString()} / {usageLimits.limits.apiCalls.toLocaleString()} this month
                </div>
              )}
            </div>
            <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-secondary-grey">Voice Minutes</span>
                <span className="material-symbols-outlined text-primary">timer</span>
              </div>
              <div className="text-3xl font-bold text-white">{formatMinutes(stats.totalVoiceMinutes)}</div>
              {usageLimits && (
                <div className={`text-xs mt-1 ${
                  usageLimits.exceeded.voiceMinutes ? 'text-accent' : 'text-secondary-grey'
                }`}>
                  {Math.round(usageLimits.usage.voiceMinutes)} / {usageLimits.limits.voiceMinutes} this month
                </div>
              )}
            </div>
          </div>

          {/* Subscription Status */}
          {subscription && (
            <div className="mb-8">
              <div className={`bg-surface-card rounded-2xl p-6 border ${
                subscription.id === 'free' ? 'border-white/5' : 'border-primary/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">Current Plan: {subscription.name}</h3>
                      {subscription.id !== 'free' && (
                        <span className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-primary text-xs font-bold">
                          ${subscription.price}/month
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-secondary-grey">
                      {subscription.id === 'free' 
                        ? 'Upgrade to unlock premium features and higher limits'
                        : 'You have access to all premium features'}
                    </p>
                  </div>
                  {subscription.id === 'free' && (
                    <Link
                      to="/pricing"
                      className="px-6 py-3 bg-primary hover:bg-primary-glow text-white rounded-full font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)]"
                    >
                      Upgrade
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters and Agents List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Agents</h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFilter('all');
                  loadAgents();
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-white/5 text-secondary-grey border border-white/10 hover:bg-white/10'
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setFilter('recent');
                  loadAgents();
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'recent'
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-white/5 text-secondary-grey border border-white/10 hover:bg-white/10'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => {
                  setFilter('popular');
                  loadAgents();
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'popular'
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-white/5 text-secondary-grey border border-white/10 hover:bg-white/10'
                }`}
              >
                Popular
              </button>
            </div>
          </div>

          {agents.length === 0 ? (
            <div className="bg-surface-card rounded-2xl p-12 border border-white/5 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-4xl">smart_toy</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No agents yet</h3>
              <p className="text-secondary-grey mb-6">
                Create your first voice agent to get started
              </p>
              <button
                onClick={() => setView('create')}
                className="h-12 px-8 rounded-full bg-primary hover:bg-primary-glow text-white font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)] hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <span className="material-symbols-outlined">add</span>
                Create Your First Agent
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

