import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TestChatInterface from '../components/TestChatInterface';
import { saveAgent } from '../utils/agentStorage';
import { getCurrentUser } from '../utils/userStorage';
import { sanitizePrompt } from '../utils/encryption';
import { recordUsage } from '../utils/subscription';
import { languageOptions, toneOptions } from '../data/agentTemplates';

// Voice options for Gemini API
const voiceOptions = [
  { value: 'Kore', label: 'Kore (Neutral)' },
  { value: 'Puck', label: 'Puck (British)' },
  { value: 'Charon', label: 'Charon (Deep)' },
  { value: 'Fenrir', label: 'Fenrir (Warm)' }
];

export default function TestAgent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [agentConfig, setAgentConfig] = useState({
    agentName: '',
    systemPrompt: '',
    language: 'English',
    tone: 'Professional',
    voice: 'Kore',
    speakingSpeed: 1.0,
    pitch: 0
  });
  const [isDraft, setIsDraft] = useState(true);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const runtimeRef = useRef(null);

  // Load agent data from location state (passed from CreateAgent page)
  useEffect(() => {
    if (location.state?.agentData) {
      setAgentConfig({
        agentName: location.state.agentData.agentName || '',
        systemPrompt: location.state.agentData.systemPrompt || '',
        language: location.state.agentData.language || 'English',
        tone: location.state.agentData.tone || 'Professional',
        voice: location.state.agentData.voice || 'Kore',
        speakingSpeed: location.state.agentData.speakingSpeed || 1.0,
        pitch: location.state.agentData.pitch || 0
      });
    }
  }, [location.state]);

  const handleInputChange = (field, value) => {
    setAgentConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDraft(true);
    setSaved(false);
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateAgent = () => {
    const newErrors = {};
    
    if (!agentConfig.agentName.trim()) {
      newErrors.agentName = 'Agent name is required';
    } else if (agentConfig.agentName.trim().length < 3) {
      newErrors.agentName = 'Agent name must be at least 3 characters';
    }
    
    if (!agentConfig.systemPrompt.trim()) {
      newErrors.systemPrompt = 'System prompt is required';
    } else if (agentConfig.systemPrompt.trim().length < 50) {
      newErrors.systemPrompt = 'System prompt should be at least 50 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = () => {
    if (!validateAgent()) {
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      alert('Please sign in to save drafts');
      return;
    }

    const sanitizedPrompt = sanitizePrompt(agentConfig.systemPrompt.trim());
    
    const draftAgent = {
      ...agentConfig,
      systemPrompt: sanitizedPrompt,
      isDraft: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      saveAgent(draftAgent);
      setIsDraft(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert('Failed to save draft. Please try again.');
    }
  };

  const handleDeploy = () => {
    if (!validateAgent()) {
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      alert('Please sign in to deploy agents');
      return;
    }

    const sanitizedPrompt = sanitizePrompt(agentConfig.systemPrompt.trim());
    
    const deployedAgent = {
      ...agentConfig,
      systemPrompt: sanitizedPrompt,
      isDraft: false,
      isDeployed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deployedAt: new Date().toISOString()
    };

    try {
      const savedAgent = saveAgent(deployedAgent);
      recordUsage(user.id, { agentsCreated: 1 });
      
      // Navigate to dashboard or show success message
      alert('Agent deployed successfully!');
      navigate('/dashboard');
    } catch (error) {
      alert('Failed to deploy agent. Please try again.');
    }
  };

  const wordCount = agentConfig.systemPrompt.split(/\s+/).filter(Boolean).length;
  const charCount = agentConfig.systemPrompt.length;

  return (
    <div className="relative min-h-screen bg-background-dark">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBWMGg0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 pt-24 pb-20">
        <div className="max-w-[1600px] mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/create-agent')}
              className="flex items-center gap-2 px-4 py-2 text-secondary-grey hover:text-white transition-colors mb-4"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Create Agent
            </button>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Test & Deploy Agent</h1>
            <p className="text-secondary-grey">Configure your agent, test it in real-time, and deploy when ready</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Agent Configuration Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-surface-card rounded-2xl p-6 border border-white/5 sticky top-24 space-y-6">
                {/* Agent Name */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Agent Name <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    value={agentConfig.agentName}
                    onChange={(e) => handleInputChange('agentName', e.target.value)}
                    placeholder="e.g., Customer Support Bot"
                    className={`w-full px-4 py-3 bg-surface-dark border rounded-xl text-white placeholder-secondary-grey focus:outline-none focus:ring-2 transition-all ${
                      errors.agentName 
                        ? 'border-accent focus:ring-accent/50' 
                        : 'border-white/10 focus:border-primary focus:ring-primary/50'
                    }`}
                  />
                  {errors.agentName && (
                    <p className="mt-2 text-sm text-accent">{errors.agentName}</p>
                  )}
                </div>

                {/* System Prompt Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-white">
                      System Prompt <span className="text-accent">*</span>
                    </label>
                    <div className="text-xs text-secondary-grey">
                      {wordCount} words • {charCount} chars
                    </div>
                  </div>
                  <textarea
                    value={agentConfig.systemPrompt}
                    onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                    placeholder="Define your agent's personality, role, communication style, and key responsibilities..."
                    rows={12}
                    className={`w-full px-4 py-3 bg-surface-dark border rounded-xl text-white placeholder-secondary-grey focus:outline-none focus:ring-2 transition-all resize-none font-mono text-sm ${
                      errors.systemPrompt 
                        ? 'border-accent focus:ring-accent/50' 
                        : 'border-white/10 focus:border-primary focus:ring-primary/50'
                    }`}
                  />
                  {errors.systemPrompt && (
                    <p className="mt-2 text-sm text-accent">{errors.systemPrompt}</p>
                  )}
                </div>

                {/* Voice Settings */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="text-sm font-bold text-white">Voice Settings</h3>
                  
                  {/* Language */}
                  <div>
                    <label className="block text-xs font-medium text-secondary-grey mb-2">Language</label>
                    <select
                      value={agentConfig.language}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      className="w-full px-4 py-2 bg-surface-dark border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/50 transition-all"
                    >
                      {languageOptions.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tone */}
                  <div>
                    <label className="block text-xs font-medium text-secondary-grey mb-2">Voice Tone</label>
                    <select
                      value={agentConfig.tone}
                      onChange={(e) => handleInputChange('tone', e.target.value)}
                      className="w-full px-4 py-2 bg-surface-dark border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/50 transition-all"
                    >
                      {toneOptions.map((tone) => (
                        <option key={tone.value} value={tone.value}>
                          {tone.label} - {tone.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Voice Selection */}
                  <div>
                    <label className="block text-xs font-medium text-secondary-grey mb-2">Voice</label>
                    <select
                      value={agentConfig.voice}
                      onChange={(e) => handleInputChange('voice', e.target.value)}
                      className="w-full px-4 py-2 bg-surface-dark border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/50 transition-all"
                    >
                      {voiceOptions.map((voice) => (
                        <option key={voice.value} value={voice.value}>
                          {voice.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Speech Speed */}
                  <div>
                    <label className="block text-xs font-medium text-secondary-grey mb-2">
                      Speech Speed: {agentConfig.speakingSpeed.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={agentConfig.speakingSpeed}
                      onChange={(e) => handleInputChange('speakingSpeed', parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-secondary-grey mt-1">
                      <span>0.5x</span>
                      <span>1.0x</span>
                      <span>2.0x</span>
                    </div>
                  </div>

                  {/* Pitch */}
                  <div>
                    <label className="block text-xs font-medium text-secondary-grey mb-2">
                      Pitch: {agentConfig.pitch}
                    </label>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      step="1"
                      value={agentConfig.pitch}
                      onChange={(e) => handleInputChange('pitch', parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-secondary-grey mt-1">
                      <span>-20</span>
                      <span>0</span>
                      <span>+20</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  {saved && (
                    <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 text-center">
                      <p className="text-xs text-primary font-medium">✓ Draft saved successfully!</p>
                    </div>
                  )}
                  
                  <button
                    onClick={handleSaveDraft}
                    className="w-full h-12 px-6 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                  >
                    <span className="material-symbols-outlined text-lg">save</span>
                    Save Draft
                  </button>
                  
                  <button
                    onClick={handleDeploy}
                    className="w-full h-12 px-6 rounded-full bg-primary hover:bg-primary-glow text-white font-bold text-sm transition-all shadow-[0_0_30px_-5px_rgba(91,140,90,0.5)] hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">rocket_launch</span>
                    Deploy Agent
                  </button>
                </div>
              </div>
            </div>

            {/* Center Panel - Testing Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Live Testing Interface */}
              <div className="bg-surface-card rounded-2xl border border-white/5 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-white">Live Testing Interface</h2>
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-xs text-primary font-medium">Real-time</span>
                    </div>
                  </div>
                  <p className="text-sm text-secondary-grey">
                    Test your agent configuration in real-time. Adjust settings on the left and see changes immediately.
                  </p>
                </div>

                {/* Test Chat/Voice Window */}
                <div className="p-6 min-h-[600px]">
                  <TestChatInterface 
                    agentConfig={agentConfig}
                    onConfigChange={setAgentConfig}
                  />
                </div>
              </div>

              {/* Configuration Preview */}
              <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-bold text-white mb-4">Configuration Preview</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-grey">Agent Name:</span>
                    <span className="text-white font-medium">{agentConfig.agentName || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-grey">Language:</span>
                    <span className="text-white font-medium">{agentConfig.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-grey">Tone:</span>
                    <span className="text-white font-medium">{agentConfig.tone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-grey">Voice:</span>
                    <span className="text-white font-medium">{agentConfig.voice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-grey">Speech Speed:</span>
                    <span className="text-white font-medium">{agentConfig.speakingSpeed.toFixed(1)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-grey">Pitch:</span>
                    <span className="text-white font-medium">{agentConfig.pitch}</span>
                  </div>
                  <div className="pt-3 border-t border-white/5">
                    <div className="text-secondary-grey mb-2">System Prompt Preview:</div>
                    <div className="bg-surface-dark rounded-lg p-3 text-xs text-white/80 font-mono max-h-32 overflow-y-auto">
                      {agentConfig.systemPrompt || 'No prompt set yet...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

