import { useState } from 'react';
import { getAllExamples } from '../data/voiceExamples';

export default function VoiceExamples({ onSelectExample }) {
  const [selectedExample, setSelectedExample] = useState(null);
  const examples = getAllExamples();

  const handleSelect = (example) => {
    setSelectedExample(example);
    if (onSelectExample) {
      onSelectExample(example);
    }
  };

  return (
    <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-2">Voice Interaction Examples</h3>
        <p className="text-sm text-secondary-grey">
          See how voice agents interact in real conversations
        </p>
      </div>

      <div className="space-y-4">
        {examples.map((example) => (
          <button
            key={example.id}
            onClick={() => handleSelect(example)}
            className={`w-full p-4 bg-surface-dark rounded-xl border text-left transition-all ${
              selectedExample?.id === example.id
                ? 'border-primary/50 bg-primary/5'
                : 'border-white/5 hover:border-primary/30'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-bold text-white mb-1">{example.title}</h4>
                <p className="text-xs text-secondary-grey">{example.description}</p>
              </div>
              <span className="material-symbols-outlined text-primary">
                {selectedExample?.id === example.id ? 'check_circle' : 'play_circle'}
              </span>
            </div>
            
            {selectedExample?.id === example.id && (
              <div className="mt-4 space-y-3 pt-4 border-t border-white/5">
                {example.interactions.map((interaction, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                        U
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-secondary-grey mb-1">User</div>
                        <div className="text-sm text-white bg-primary/10 rounded-lg p-2">
                          {interaction.user}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-card border border-white/10 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        AI
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-secondary-grey mb-1">{example.agentName}</div>
                        <div className="text-sm text-white bg-surface-card border border-white/10 rounded-lg p-2">
                          {interaction.agent}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
        <p className="text-xs text-secondary-grey">
          <span className="material-symbols-outlined text-xs align-middle mr-1">lightbulb</span>
          These examples show natural conversation flows. Your agents will adapt based on your custom prompts.
        </p>
      </div>
    </div>
  );
}

