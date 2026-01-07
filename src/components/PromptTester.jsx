import { useState } from 'react';
import { analyzePromptComplexity, validatePromptQuality, generateComplexityTests } from '../utils/promptTester';

export default function PromptTester({ prompt, onSelectTest }) {
  const [selectedTest, setSelectedTest] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const analysis = prompt ? analyzePromptComplexity(prompt) : null;
  const validation = prompt ? validatePromptQuality(prompt) : null;
  const complexityTests = prompt ? generateComplexityTests(prompt) : [];

  const handleSelectTest = (test) => {
    setSelectedTest(test);
    if (onSelectTest) {
      onSelectTest(test.prompt);
    }
  };

  if (!prompt) {
    return (
      <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
        <p className="text-secondary-grey text-sm text-center">
          Enter a prompt to analyze and test
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-card rounded-2xl p-6 border border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Prompt Analysis & Testing</h3>
        <button
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="text-sm text-primary hover:text-primary-glow transition-colors"
        >
          {showAnalysis ? 'Hide' : 'Show'} Analysis
        </button>
      </div>

      {/* Complexity Analysis */}
      {showAnalysis && analysis && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-dark rounded-xl p-4 border border-white/5">
              <div className="text-xs text-secondary-grey mb-1">Words</div>
              <div className="text-2xl font-bold text-white">{analysis.wordCount}</div>
            </div>
            <div className="bg-surface-dark rounded-xl p-4 border border-white/5">
              <div className="text-xs text-secondary-grey mb-1">Characters</div>
              <div className="text-2xl font-bold text-white">{analysis.charCount.toLocaleString()}</div>
            </div>
            <div className="bg-surface-dark rounded-xl p-4 border border-white/5">
              <div className="text-xs text-secondary-grey mb-1">Sentences</div>
              <div className="text-2xl font-bold text-white">{analysis.sentenceCount}</div>
            </div>
            <div className="bg-surface-dark rounded-xl p-4 border border-white/5">
              <div className="text-xs text-secondary-grey mb-1">Est. Tokens</div>
              <div className="text-2xl font-bold text-white">{analysis.estimatedTokens}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary-grey">Complexity:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              analysis.complexity === 'simple' ? 'bg-primary/20 text-primary border border-primary/30' :
              analysis.complexity === 'moderate' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
              analysis.complexity === 'complex' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
              'bg-accent/20 text-accent border border-accent/30'
            }`}>
              {analysis.complexity.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Validation Results */}
      {showAnalysis && validation && (
        <div className="space-y-3">
          {validation.issues.length > 0 && (
            <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
              <h4 className="text-sm font-bold text-accent mb-2">Issues Found</h4>
              <ul className="space-y-1">
                {validation.issues.map((issue, i) => (
                  <li key={i} className="text-xs text-accent flex items-start gap-2">
                    <span>•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validation.suggestions.length > 0 && (
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
              <h4 className="text-sm font-bold text-primary mb-2">Suggestions</h4>
              <ul className="space-y-1">
                {validation.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-xs text-secondary-grey flex items-start gap-2">
                    <span>•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validation.valid && validation.issues.length === 0 && (
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="text-sm font-bold text-primary">Prompt quality looks good!</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Complexity Tests */}
      {complexityTests.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-white mb-3">Test Different Complexities</h4>
          <div className="space-y-2">
            {complexityTests.map((test, i) => (
              <button
                key={i}
                onClick={() => handleSelectTest(test)}
                className={`w-full p-4 bg-surface-dark rounded-xl border text-left transition-all ${
                  selectedTest?.name === test.name
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-white/5 hover:border-primary/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">{test.name}</span>
                  <span className="text-xs text-secondary-grey">
                    {test.complexity.wordCount} words
                  </span>
                </div>
                <p className="text-xs text-secondary-grey">{test.description}</p>
                {selectedTest?.name === test.name && (
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <p className="text-xs text-white font-mono bg-black/30 p-2 rounded">
                      {test.prompt.substring(0, 200)}...
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

