import { useState, useEffect } from 'react';
import { updateUser, getUserAPIKey, saveUserAPIKey, getUserConversations, deleteConversation, updateUser as updateUserPrefs } from '../utils/userStorage';
import { getAllAgents } from '../utils/agentStorage';
import { getTodayCost, getMonthCost, getTotalCost } from '../utils/costTracker';

export default function Profile({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'api', 'history', 'privacy', 'costs'
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load API key (masked)
    const storedKey = getUserAPIKey(user.id);
    if (storedKey) {
      setApiKey(storedKey.substring(0, 10) + '...');
      setShowApiKey(false);
    }

    // Load conversations
    loadConversations();
    loadAgents();
  }, [user.id]);

  const loadConversations = () => {
    const userConvs = getUserConversations(user.id);
    setConversations(userConvs);
  };

  const loadAgents = () => {
    const userAgents = getAllAgents();
    setAgents(userAgents);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const updated = updateUser(user.id, {
        name: user.name,
        preferences: user.preferences
      });
      setUser(updated);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAPIKey = () => {
    if (!apiKey || apiKey.length < 10) {
      setMessage('Please enter a valid API key');
      return;
    }

    try {
      saveUserAPIKey(user.id, apiKey);
      setMessage('API key saved successfully!');
      setApiKey(apiKey.substring(0, 10) + '...');
      setShowApiKey(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save API key');
    }
  };

  const handleDeleteConversation = (convId) => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(convId);
      loadConversations();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="relative pt-32 pb-20 w-full min-h-screen bg-background-dark">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBWMGg0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-lg text-secondary-grey">
            Manage your account, API keys, and privacy settings
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.includes('success') 
              ? 'bg-primary/10 border-primary/30 text-primary' 
              : 'bg-accent/10 border-accent/30 text-accent'
          }`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/5 overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile', icon: 'person' },
            { id: 'api', label: 'API Keys', icon: 'key' },
            { id: 'history', label: 'Conversations', icon: 'history' },
            { id: 'privacy', label: 'Privacy', icon: 'lock' },
            { id: 'costs', label: 'Costs', icon: 'attach_money' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-primary border-primary'
                  : 'text-secondary-grey border-transparent hover:text-white hover:border-white/20'
              }`}
            >
              <span className="material-symbols-outlined text-sm align-middle mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-surface-card rounded-2xl p-8 border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-6">Account Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 bg-surface-dark border border-white/10 rounded-xl text-white opacity-60 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-secondary-grey">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-dark border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Account Created</label>
                <input
                  type="text"
                  value={new Date(user.createdAt).toLocaleDateString()}
                  disabled
                  className="w-full px-4 py-3 bg-surface-dark border border-white/10 rounded-xl text-white opacity-60 cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="h-12 px-8 rounded-full bg-primary hover:bg-primary-glow text-white font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)] hover:scale-105 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'api' && (
          <div className="bg-surface-card rounded-2xl p-8 border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-6">API Key Management</h2>
            <div className="space-y-6">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <p className="text-sm text-secondary-grey mb-2">
                  Your API key is stored securely and used for voice agent interactions. 
                  Never share your API key publicly.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Google Gemini API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="flex-1 px-4 py-3 bg-surface-dark border border-white/10 rounded-xl text-white placeholder-secondary-grey focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/50 transition-all font-mono"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
                  >
                    <span className="material-symbols-outlined">
                      {showApiKey ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <p className="mt-2 text-xs text-secondary-grey">
                  Get your API key from{' '}
                  <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Google AI Studio
                  </a>
                </p>
              </div>
              <button
                onClick={handleSaveAPIKey}
                className="h-12 px-8 rounded-full bg-primary hover:bg-primary-glow text-white font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)] hover:scale-105"
              >
                Save API Key
              </button>
            </div>
          </div>
        )}

        {/* Conversation History Tab */}
        {activeTab === 'history' && (
          <div className="bg-surface-card rounded-2xl p-8 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Conversation History</h2>
              <div className="text-sm text-secondary-grey">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </div>
            </div>
            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-secondary-grey mb-4">history</span>
                <p className="text-secondary-grey">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversations.map((conv) => {
                  const agent = agents.find(a => a.id === conv.agentId);
                  return (
                    <div key={conv.id} className="bg-surface-dark rounded-xl p-6 border border-white/5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-white font-bold mb-1">
                            {agent?.agentName || 'Unknown Agent'}
                          </h3>
                          <p className="text-xs text-secondary-grey">
                            {formatDate(conv.createdAt)} • {conv.messages.length} messages
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteConversation(conv.id)}
                          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-accent text-sm">delete</span>
                        </button>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {conv.messages.slice(0, 3).map((msg, i) => (
                          <div key={i} className={`text-sm ${
                            msg.sender === 'user' ? 'text-primary' : 'text-secondary-grey'
                          }`}>
                            <span className="font-medium">{msg.sender === 'user' ? 'You' : 'Agent'}:</span> {msg.text.substring(0, 100)}...
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Cost Tracking Tab */}
        {activeTab === 'costs' && (
          <div className="bg-surface-card rounded-2xl p-8 border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-6">API Cost Tracking</h2>
            <div className="space-y-6">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <p className="text-sm text-secondary-grey">
                  <span className="material-symbols-outlined text-xs align-middle mr-1">info</span>
                  Cost tracking helps monitor Gemini API usage during development. Costs are estimated based on API calls and voice minutes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface-dark rounded-xl p-6 border border-white/5">
                  <div className="text-xs text-secondary-grey mb-2">Today</div>
                  <div className="text-2xl font-bold text-white mb-1">
                    ${getTodayCost().cost.toFixed(4)}
                  </div>
                  <div className="text-xs text-secondary-grey">
                    {getTodayCost().apiCalls} calls • {getTodayCost().voiceMinutes.toFixed(1)} min
                  </div>
                </div>
                <div className="bg-surface-dark rounded-xl p-6 border border-white/5">
                  <div className="text-xs text-secondary-grey mb-2">This Month</div>
                  <div className="text-2xl font-bold text-white mb-1">
                    ${getMonthCost().cost.toFixed(4)}
                  </div>
                  <div className="text-xs text-secondary-grey">
                    {getMonthCost().apiCalls} calls • {getMonthCost().voiceMinutes.toFixed(1)} min
                  </div>
                </div>
                <div className="bg-surface-dark rounded-xl p-6 border border-white/5">
                  <div className="text-xs text-secondary-grey mb-2">Total</div>
                  <div className="text-2xl font-bold text-white mb-1">
                    ${getTotalCost().cost.toFixed(4)}
                  </div>
                  <div className="text-xs text-secondary-grey">
                    {getTotalCost().apiCalls} calls • {getTotalCost().voiceMinutes.toFixed(1)} min
                  </div>
                </div>
              </div>

              <div className="bg-surface-dark rounded-xl p-4 border border-white/5">
                <h4 className="text-sm font-bold text-white mb-3">Pricing Reference</h4>
                <div className="space-y-2 text-xs text-secondary-grey">
                  <div className="flex justify-between">
                    <span>API Call</span>
                    <span className="text-white">$0.0001</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Voice Minute</span>
                    <span className="text-white">$0.01</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="bg-surface-card rounded-2xl p-8 border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-6">Privacy Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Conversation History Storage
                </label>
                <select
                  value={user.preferences?.privacyLevel || 'standard'}
                  onChange={(e) => {
                    const updated = {
                      ...user,
                      preferences: {
                        ...user.preferences,
                        privacyLevel: e.target.value
                      }
                    };
                    updateUser(user.id, updated.preferences);
                    setUser(updated);
                  }}
                  className="w-full px-4 py-3 bg-surface-dark border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/50 transition-all"
                >
                  <option value="standard">Standard - Store conversation history</option>
                  <option value="enhanced">Enhanced - Store minimal metadata only</option>
                  <option value="maximum">Maximum - Do not store conversations</option>
                </select>
                <p className="mt-2 text-xs text-secondary-grey">
                  {user.preferences?.privacyLevel === 'maximum' 
                    ? 'Conversations will not be saved. This cannot be undone.'
                    : 'Conversation history helps improve your experience and analytics.'}
                </p>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <p className="text-sm text-secondary-grey">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                  Your data is stored locally in your browser. In production, data would be encrypted and stored securely on our servers.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

