import { useState } from 'react';
import { Link } from 'react-router-dom';
import VoiceAgentRuntime from './VoiceAgentRuntime';

export default function AgentCard({ agent, onDelete, onEdit }) {
  const [showRuntime, setShowRuntime] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareType, setShareType] = useState('link'); // 'link' or 'embed'

  const shareUrl = `${window.location.origin}/agent/${agent.id}`;
  const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0" allow="microphone"></iframe>`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatMinutes = (minutes) => {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <>
      <div className="bg-surface-card rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-all group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl border border-primary/20">
                {agent.agentName?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                  {agent.agentName}
                </h3>
                <p className="text-xs text-secondary-grey">
                  Created {formatDate(agent.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-secondary-grey mb-4">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">language</span>
                {agent.language}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">tone</span>
                {agent.tone}
              </span>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mb-4 p-3 bg-surface-dark rounded-xl border border-white/5">
          <p className="text-xs text-secondary-grey line-clamp-2">
            {agent.systemPrompt.substring(0, 150)}...
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-surface-dark rounded-lg p-3 border border-white/5">
            <div className="text-xs text-secondary-grey mb-1">Conversations</div>
            <div className="text-lg font-bold text-white">{agent.conversations || 0}</div>
          </div>
          <div className="bg-surface-dark rounded-lg p-3 border border-white/5">
            <div className="text-xs text-secondary-grey mb-1">API Calls</div>
            <div className="text-lg font-bold text-white">{agent.apiCalls || 0}</div>
          </div>
          <div className="bg-surface-dark rounded-lg p-3 border border-white/5">
            <div className="text-xs text-secondary-grey mb-1">Voice Time</div>
            <div className="text-lg font-bold text-white">{formatMinutes(agent.voiceMinutes || 0)}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowRuntime(true)}
            className="flex-1 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-primary text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">mic</span>
            Test
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">share</span>
            Share
          </button>
          <button
            onClick={() => onEdit(agent)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete "${agent.agentName}"?`)) {
                onDelete(agent.id);
              }
            }}
            className="px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-lg text-accent text-sm font-medium transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Delete
          </button>
        </div>
      </div>

      {/* Runtime Modal */}
      {showRuntime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <VoiceAgentRuntime 
              agentConfig={agent}
              onClose={() => setShowRuntime(false)}
            />
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-surface-card rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Share Agent</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-secondary-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Share Type Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setShareType('link')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  shareType === 'link'
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-white/5 text-secondary-grey border border-white/10 hover:bg-white/10'
                }`}
              >
                Share Link
              </button>
              <button
                onClick={() => setShareType('embed')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  shareType === 'embed'
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-white/5 text-secondary-grey border border-white/10 hover:bg-white/10'
                }`}
              >
                Embed Code
              </button>
            </div>

            {/* Share Link */}
            {shareType === 'link' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Shareable Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-4 py-2 bg-surface-dark border border-white/10 rounded-lg text-white text-sm"
                    />
                    <button
                      onClick={() => handleCopy(shareUrl)}
                      className="px-6 py-2 bg-primary hover:bg-primary-glow text-white rounded-lg font-medium transition-all"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-secondary-grey">
                    Anyone with this link can interact with your agent. Share it via email, social media, or embed it on your website.
                  </p>
                </div>
              </div>
            )}

            {/* Embed Code */}
            {shareType === 'embed' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Embed Code</label>
                  <div className="flex gap-2">
                    <textarea
                      value={embedCode}
                      readOnly
                      rows={4}
                      className="flex-1 px-4 py-2 bg-surface-dark border border-white/10 rounded-lg text-white text-sm font-mono resize-none"
                    />
                    <button
                      onClick={() => handleCopy(embedCode)}
                      className="px-6 py-2 bg-primary hover:bg-primary-glow text-white rounded-lg font-medium transition-all self-start"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-secondary-grey mb-2">
                    Paste this code into your website's HTML to embed the agent:
                  </p>
                  <div className="bg-surface-dark rounded p-2 text-xs text-secondary-grey font-mono">
                    {embedCode}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

