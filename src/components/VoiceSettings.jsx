import { useState } from 'react';

const VOICE_OPTIONS = [
  { value: 'Kore', label: 'Kore (Neutral)' },
  { value: 'Puck', label: 'Puck (British)' },
  { value: 'Charon', label: 'Charon (Deep)' },
  { value: 'Fenrir', label: 'Fenrir (Warm)' }
];

export default function VoiceSettings({ settings, onChange, onClose }) {
  const [localSettings, setLocalSettings] = useState({
    voiceName: settings?.voiceName || 'Kore',
    speakingRate: settings?.speakingRate || 1.0,
    pitch: settings?.pitch || 0,
    ...settings
  });

  const handleChange = (field, value) => {
    const updated = { ...localSettings, [field]: value };
    setLocalSettings(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  return (
    <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Voice Settings</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-secondary-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Voice Selection */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Voice Character
          </label>
          <select
            value={localSettings.voiceName}
            onChange={(e) => handleChange('voiceName', e.target.value)}
            className="w-full px-4 py-3 bg-surface-dark border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/50 transition-all"
          >
            {VOICE_OPTIONS.map(voice => (
              <option key={voice.value} value={voice.value}>
                {voice.label}
              </option>
            ))}
          </select>
        </div>

        {/* Speaking Rate */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-white">
              Speaking Speed
            </label>
            <span className="text-sm text-secondary-grey">
              {localSettings.speakingRate.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={localSettings.speakingRate}
            onChange={(e) => handleChange('speakingRate', parseFloat(e.target.value))}
            className="w-full h-2 bg-surface-dark rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-secondary-grey mt-1">
            <span>Slow</span>
            <span>Normal</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Pitch */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-white">
              Pitch
            </label>
            <span className="text-sm text-secondary-grey">
              {localSettings.pitch > 0 ? '+' : ''}{localSettings.pitch.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="-20"
            max="20"
            step="1"
            value={localSettings.pitch}
            onChange={(e) => handleChange('pitch', parseInt(e.target.value))}
            className="w-full h-2 bg-surface-dark rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-secondary-grey mt-1">
            <span>Lower</span>
            <span>Normal</span>
            <span>Higher</span>
          </div>
        </div>

        {/* Preview Note */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
          <p className="text-xs text-secondary-grey">
            <span className="material-symbols-outlined text-xs align-middle mr-1">info</span>
            Voice settings will apply to new conversations. Some settings may have limited support depending on the voice selected.
          </p>
        </div>
      </div>
    </div>
  );
}

