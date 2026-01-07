import { useState } from 'react';
import { updateUser, getCurrentUser } from '../utils/userStorage';

export default function ConsentModal({ onAccept, onDecline }) {
  const [consents, setConsents] = useState({
    conversationLogging: false,
    gdpr: false,
    ccpa: false
  });
  const [showDetails, setShowDetails] = useState(false);

  const handleAccept = () => {
    const user = getCurrentUser();
    if (user) {
      updateUser(user.id, {
        preferences: {
          ...user.preferences,
          conversationConsent: consents.conversationLogging,
          gdprConsent: consents.gdpr,
          ccpaOptOut: !consents.ccpa
        }
      });
    }
    onAccept(consents);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-surface-card rounded-2xl border border-white/10 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Privacy & Data Consent</h2>
          <p className="text-secondary-grey">
            We respect your privacy. Please review and choose your preferences.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {/* Conversation Logging */}
          <label className="flex items-start gap-3 p-4 bg-surface-dark rounded-xl border border-white/5 cursor-pointer hover:border-primary/30 transition-colors">
            <input
              type="checkbox"
              checked={consents.conversationLogging}
              onChange={(e) => setConsents({ ...consents, conversationLogging: e.target.checked })}
              className="mt-1 w-5 h-5 rounded border-white/20 bg-surface-dark text-primary focus:ring-primary focus:ring-2"
            />
            <div className="flex-1">
              <div className="font-medium text-white mb-1">Conversation Logging</div>
              <p className="text-sm text-secondary-grey">
                Allow us to store your conversation history for analytics and improvement. You can change this anytime in settings.
              </p>
            </div>
          </label>

          {/* GDPR Consent */}
          <label className="flex items-start gap-3 p-4 bg-surface-dark rounded-xl border border-white/5 cursor-pointer hover:border-primary/30 transition-colors">
            <input
              type="checkbox"
              checked={consents.gdpr}
              onChange={(e) => setConsents({ ...consents, gdpr: e.target.checked })}
              className="mt-1 w-5 h-5 rounded border-white/20 bg-surface-dark text-primary focus:ring-primary focus:ring-2"
            />
            <div className="flex-1">
              <div className="font-medium text-white mb-1">GDPR Consent (EU Users)</div>
              <p className="text-sm text-secondary-grey">
                I consent to the processing of my personal data as described in the privacy policy.
              </p>
            </div>
          </label>

          {/* CCPA Opt-Out */}
          <label className="flex items-start gap-3 p-4 bg-surface-dark rounded-xl border border-white/5 cursor-pointer hover:border-primary/30 transition-colors">
            <input
              type="checkbox"
              checked={consents.ccpa}
              onChange={(e) => setConsents({ ...consents, ccpa: e.target.checked })}
              className="mt-1 w-5 h-5 rounded border-white/20 bg-surface-dark text-primary focus:ring-primary focus:ring-2"
            />
            <div className="flex-1">
              <div className="font-medium text-white mb-1">CCPA Opt-Out (California Users)</div>
              <p className="text-sm text-secondary-grey">
                Opt-out of the sale of your personal information (if applicable).
              </p>
            </div>
          </label>
        </div>

        {/* Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full p-3 bg-surface-dark rounded-xl border border-white/5 hover:border-primary/30 transition-colors text-left mb-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">Privacy Policy Details</span>
            <span className="material-symbols-outlined text-secondary-grey">
              {showDetails ? 'expand_less' : 'expand_more'}
            </span>
          </div>
        </button>

        {showDetails && (
          <div className="mb-6 p-4 bg-surface-dark rounded-xl border border-white/5 text-sm text-secondary-grey space-y-3">
            <div>
              <h4 className="font-medium text-white mb-1">Data Collection</h4>
              <p>We collect conversation data, usage statistics, and account information to provide and improve our services.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Data Usage</h4>
              <p>Your data is used to improve voice agent responses, analyze usage patterns, and provide personalized experiences.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Data Storage</h4>
              <p>Data is stored securely and encrypted. You can request deletion at any time through your profile settings.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Your Rights</h4>
              <p>You have the right to access, modify, or delete your data. Contact us through the support page for assistance.</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onDecline}
            className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors"
          >
            Decline All
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 px-6 py-3 bg-primary hover:bg-primary-glow rounded-xl text-white font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)]"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

