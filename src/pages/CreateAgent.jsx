import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { agentTemplates, languageOptions, toneOptions } from '../data/agentTemplates';
import { premiumTemplates } from '../data/premiumTemplates';
import VoiceAgentRuntime from '../components/VoiceAgentRuntime';
import VoiceExamples from '../components/VoiceExamples';
import PromptTester from '../components/PromptTester';
import { ApiKeyWarning } from '../components/FallbackUI';
import { saveAgent } from '../utils/agentStorage';
import { validatePrompt, sanitizePrompt } from '../utils/encryption';
import { checkRateLimit, recordRateLimit } from '../utils/rateLimiter';
import { getCurrentUser } from '../utils/userStorage';
import { checkSubscriptionLimit, recordUsage } from '../utils/subscription';

export default function CreateAgent({ editingAgent = null, onAgentCreated, onCancel }) {
  const [formData, setFormData] = useState({
    agentName: '',
    systemPrompt: '',
    language: 'English',
    tone: 'Professional',
    selectedTemplate: null
  });
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPremiumTemplates, setShowPremiumTemplates] = useState(false);
  const [errors, setErrors] = useState({});
  const [showRuntime, setShowRuntime] = useState(false);
  const [createdAgent, setCreatedAgent] = useState(null);

  // Load editing agent data if provided
  useEffect(() => {
    if (editingAgent) {
      setFormData({
        agentName: editingAgent.agentName || '',
        systemPrompt: editingAgent.systemPrompt || '',
        language: editingAgent.language || 'English',
        tone: editingAgent.tone || 'Professional',
        selectedTemplate: editingAgent.selectedTemplate || null
      });
    }
  }, [editingAgent]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleTemplateSelect = (template) => {
    const user = getCurrentUser();
    if (template.premium && user) {
      const subscriptionCheck = checkSubscriptionLimit(user.id, 'usePremiumTemplate');
      if (!subscriptionCheck.allowed) {
        alert(subscriptionCheck.reason);
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      selectedTemplate: template.id,
      systemPrompt: template.systemPrompt,
      language: template.defaultLanguage,
      tone: template.defaultTone
    }));
    setShowTemplates(false);
    setShowPremiumTemplates(false);
  };

  const handleClearTemplate = () => {
    setFormData(prev => ({
      ...prev,
      selectedTemplate: null,
      systemPrompt: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.agentName.trim()) {
      newErrors.agentName = 'Agent name is required';
    } else if (formData.agentName.trim().length < 3) {
      newErrors.agentName = 'Agent name must be at least 3 characters';
    }
    
    if (!formData.systemPrompt.trim()) {
      newErrors.systemPrompt = 'System prompt is required';
    } else {
      // Security validation
      const promptValidation = validatePrompt(formData.systemPrompt);
      if (!promptValidation.valid) {
        newErrors.systemPrompt = promptValidation.errors.join(', ');
      } else if (formData.systemPrompt.trim().length < 50) {
        newErrors.systemPrompt = 'System prompt should be at least 50 characters for best results';
      }
    }
    
    // Rate limiting check
    const user = getCurrentUser();
    if (user) {
      const rateLimit = checkRateLimit(user.id, 'agentCreations');
      if (!rateLimit.allowed) {
        newErrors.submit = `Rate limit exceeded. Please wait until ${rateLimit.resetAt.toLocaleTimeString()}`;
      }
      
      // Subscription limit check
      const subscriptionCheck = checkSubscriptionLimit(user.id, 'createAgent');
      if (!subscriptionCheck.allowed) {
        newErrors.submit = subscriptionCheck.reason;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Sanitize and create agent configuration
    const user = getCurrentUser();
    const sanitizedPrompt = sanitizePrompt(formData.systemPrompt.trim());
    
    const agentConfig = {
      id: editingAgent?.id, // Preserve ID if editing
      agentName: formData.agentName.trim(),
      systemPrompt: sanitizedPrompt, // Sanitized prompt
      language: formData.language,
      tone: formData.tone,
      voice: formData.voice || 'Kore',
      speakingSpeed: formData.speakingSpeed || 1.0,
      pitch: formData.pitch || 0,
      createdAt: editingAgent?.createdAt || new Date().toISOString()
    };

    // Navigate to Test Agent page with agent data
    navigate('/test-agent', {
      state: {
        agentData: agentConfig
      }
    });
  };

  const handleTestAgent = () => {
    if (!validateForm()) {
      return;
    }

    const agentConfig = {
      agentName: formData.agentName.trim() || 'Test Agent',
      systemPrompt: formData.systemPrompt.trim(),
      language: formData.language,
      tone: formData.tone
    };

    setCreatedAgent(agentConfig);
    setShowRuntime(true);
    
    setTimeout(() => {
      document.getElementById('voice-runtime')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const wordCount = formData.systemPrompt.trim().split(/\s+/).filter(Boolean).length;
  const charCount = formData.systemPrompt.length;

  return (
    <div className="relative pt-32 pb-20 w-full min-h-screen bg-background-dark">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-dark/20 blur-[100px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px] mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBWMGg0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          {onCancel && (
            <div className="flex justify-start mb-6">
              <button
                onClick={onCancel}
                className="flex items-center gap-2 px-4 py-2 text-secondary-grey hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Back to Dashboard
              </button>
            </div>
          )}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md mb-6 hover:bg-primary/10 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">
              {editingAgent ? 'Edit Agent' : 'Step 1: Agent Creation'}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 mb-6 drop-shadow-sm">
            {editingAgent ? 'Edit Your Voice Agent' : 'Create Your Voice Agent'}
          </h1>
          <p className="text-lg text-secondary-grey font-light leading-relaxed max-w-2xl mx-auto">
            {editingAgent 
              ? 'Update your agent\'s personality, behavior, and capabilities.'
              : 'Define your agent\'s personality, behavior, and capabilities with a custom prompt. Start from scratch or use our templates.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Agent Name */}
              <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
                <label className="block text-sm font-bold text-white mb-2">
                  Agent Name <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  value={formData.agentName}
                  onChange={(e) => handleInputChange('agentName', e.target.value)}
                  placeholder="e.g., Customer Support Bot, Sales Assistant"
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

              {/* Template Selection */}
              <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-bold text-white">
                    Start from Template (Optional)
                  </label>
                  {formData.selectedTemplate && (
                    <button
                      type="button"
                      onClick={handleClearTemplate}
                      className="text-xs text-secondary-grey hover:text-white transition-colors"
                    >
                      Clear Template
                    </button>
                  )}
                </div>
                
                {!formData.selectedTemplate ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowTemplates(!showTemplates);
                        setShowPremiumTemplates(false);
                      }}
                      className="w-full px-4 py-3 bg-surface-dark border border-white/10 rounded-xl text-white hover:border-primary/50 transition-all flex items-center justify-between"
                    >
                      <span className="text-secondary-grey">Browse Standard Templates</span>
                      <svg className="w-5 h-5 text-secondary-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const user = getCurrentUser();
                        if (!user) {
                          alert('Please sign in to access premium templates');
                          return;
                        }
                        const subscriptionCheck = checkSubscriptionLimit(user.id, 'usePremiumTemplate');
                        if (!subscriptionCheck.allowed) {
                          alert(subscriptionCheck.reason);
                          return;
                        }
                        setShowPremiumTemplates(!showPremiumTemplates);
                        setShowTemplates(false);
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-xl text-white hover:border-primary/50 transition-all flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-primary">⭐</span>
                        <span>Browse Premium Templates</span>
                      </span>
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {[...agentTemplates, ...premiumTemplates].find(t => t.id === formData.selectedTemplate)?.icon}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold">
                            {[...agentTemplates, ...premiumTemplates].find(t => t.id === formData.selectedTemplate)?.name}
                          </p>
                          {premiumTemplates.find(t => t.id === formData.selectedTemplate) && (
                            <span className="text-[10px] px-2 py-0.5 bg-primary/20 border border-primary/30 rounded-full text-primary font-bold">
                              PREMIUM
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-secondary-grey">
                          {[...agentTemplates, ...premiumTemplates].find(t => t.id === formData.selectedTemplate)?.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Standard Template Grid */}
                {showTemplates && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-2">
                    {agentTemplates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleTemplateSelect(template)}
                        className="p-4 bg-surface-dark border border-white/5 rounded-xl hover:border-primary/30 hover:bg-surface-card transition-all text-left group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{template.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                                {template.name}
                              </h4>
                              <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded-full text-secondary-grey">
                                {template.category}
                              </span>
                            </div>
                            <p className="text-xs text-secondary-grey leading-relaxed">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Premium Template Grid */}
                {showPremiumTemplates && (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                      <span className="material-symbols-outlined text-primary">star</span>
                      <span className="text-sm text-primary font-medium">Premium Templates - Pro Tier Required</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-2">
                      {premiumTemplates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => handleTemplateSelect(template)}
                          className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl hover:border-primary/40 hover:bg-primary/15 transition-all text-left group relative"
                        >
                          <div className="absolute top-2 right-2">
                            <span className="text-[10px] px-2 py-0.5 bg-primary/20 border border-primary/30 rounded-full text-primary font-bold">
                              PREMIUM
                            </span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{template.icon}</span>
                            <div className="flex-1 pr-8">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                                  {template.name}
                                </h4>
                              </div>
                              <p className="text-xs text-secondary-grey leading-relaxed">
                                {template.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* API Key Warning */}
              <ApiKeyWarning />

              {/* System Prompt */}
              <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-white">
                    System Prompt <span className="text-accent">*</span>
                  </label>
                  <div className="text-xs text-secondary-grey">
                    {wordCount} words • {charCount} characters
                  </div>
                </div>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                  placeholder="Describe your agent's personality, role, communication style, and key responsibilities. Be specific about how you want them to behave, respond, and interact with users..."
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
                <p className="mt-2 text-xs text-secondary-grey">
                  Tip: Include personality traits, communication style, key responsibilities, and example phrases for best results.
                </p>
              </div>

              {/* Prompt Tester */}
              {formData.systemPrompt.trim().length > 0 && (
                <PromptTester 
                  prompt={formData.systemPrompt}
                  onSelectTest={(testPrompt) => {
                    handleInputChange('systemPrompt', testPrompt);
                  }}
                />
              )}

              {/* Configuration Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language */}
                <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
                  <label className="block text-sm font-bold text-white mb-3">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-4 py-3 bg-surface-dark border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/50 transition-all"
                  >
                    {languageOptions.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tone */}
                <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
                  <label className="block text-sm font-bold text-white mb-3">
                    Tone / Personality
                  </label>
                  <select
                    value={formData.tone}
                    onChange={(e) => handleInputChange('tone', e.target.value)}
                    className="w-full px-4 py-3 bg-surface-dark border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/50 transition-all"
                  >
                    {toneOptions.map((tone) => (
                      <option key={tone.value} value={tone.value}>
                        {tone.label} - {tone.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 h-14 px-8 rounded-full bg-primary hover:bg-primary-glow text-white font-bold text-base transition-all shadow-[0_0_30px_-5px_rgba(91,140,90,0.5)] hover:scale-105 flex items-center justify-center gap-2"
                >
                  {editingAgent ? 'Save Changes' : 'Create & Test Agent'}
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
                <button
                  type="button"
                  onClick={handleTestAgent}
                  disabled={!formData.systemPrompt.trim()}
                  className="h-14 px-8 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold text-base transition-all flex items-center justify-center gap-2 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">mic</span>
                  Test Voice
                </button>
                <Link
                  to="/product"
                  className="h-14 px-8 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold text-base transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  View Examples
                </Link>
              </div>
            </form>

            {/* Voice Runtime Component */}
            {showRuntime && createdAgent && (
              <div id="voice-runtime" className="mt-12 animate-in fade-in slide-in-from-bottom-4">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Test Your Agent</h2>
                  <p className="text-secondary-grey">Start a voice conversation to test your agent in real-time</p>
                </div>
                <VoiceAgentRuntime 
                  agentConfig={createdAgent} 
                  onClose={() => {
                    setShowRuntime(false);
                    setCreatedAgent(null);
                  }}
                />
              </div>
            )}
          </div>

          {/* Sidebar - Tips & Preview */}
          <div className="space-y-6">
            {/* Voice Examples */}
            <VoiceExamples />

            {/* Tips Card */}
            <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">lightbulb</span>
                Tips for Great Prompts
              </h3>
              <ul className="space-y-3 text-sm text-secondary-grey">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Be specific about personality traits and communication style</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Include example phrases or responses you want to hear</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Define the agent's role and key responsibilities clearly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Specify how to handle edge cases or difficult situations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Mention cultural context if relevant (e.g., Urdu politeness)</span>
                </li>
              </ul>
            </div>

            {/* Preview Card */}
            <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">preview</span>
                Agent Preview
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-secondary-grey uppercase tracking-wider mb-1">Name</div>
                  <div className="text-white font-bold">
                    {formData.agentName || 'Untitled Agent'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-secondary-grey uppercase tracking-wider mb-1">Language</div>
                  <div className="text-white">{formData.language}</div>
                </div>
                <div>
                  <div className="text-xs text-secondary-grey uppercase tracking-wider mb-1">Tone</div>
                  <div className="text-white">{formData.tone}</div>
                </div>
                <div>
                  <div className="text-xs text-secondary-grey uppercase tracking-wider mb-1">Prompt Length</div>
                  <div className="text-white">{wordCount} words</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
              <h3 className="text-lg font-bold text-white mb-4">Platform Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-grey">Active Agents</span>
                  <span className="text-xl font-bold text-primary">850+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-grey">Avg. Latency</span>
                  <span className="text-xl font-bold text-primary">42ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-grey">Success Rate</span>
                  <span className="text-xl font-bold text-primary">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

