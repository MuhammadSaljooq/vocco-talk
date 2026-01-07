/**
 * Prompt Testing Utilities
 * Helps test various prompt complexities and patterns
 */

/**
 * Analyze prompt complexity
 * @param {string} prompt - System prompt to analyze
 * @returns {Object} Complexity metrics
 */
export function analyzePromptComplexity(prompt) {
  if (!prompt) {
    return {
      wordCount: 0,
      charCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      complexity: 'empty',
      estimatedTokens: 0
    };
  }

  const words = prompt.trim().split(/\s+/).filter(Boolean);
  const sentences = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = prompt.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  // Rough token estimation (1 token ≈ 4 characters for English)
  const estimatedTokens = Math.ceil(prompt.length / 4);

  let complexity = 'simple';
  if (words.length > 500) complexity = 'very-complex';
  else if (words.length > 200) complexity = 'complex';
  else if (words.length > 100) complexity = 'moderate';
  else if (words.length > 50) complexity = 'simple';

  return {
    wordCount: words.length,
    charCount: prompt.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    complexity,
    estimatedTokens,
    averageWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
    averageCharsPerWord: words.length > 0 ? Math.round(prompt.length / words.length) : 0
  };
}

/**
 * Test prompt with different complexity levels
 * @param {string} basePrompt - Base prompt to test
 * @returns {Array} Array of test prompts with varying complexity
 */
export function generateComplexityTests(basePrompt) {
  const tests = [];

  // Simple version (50-100 words)
  const simpleWords = basePrompt.split(/\s+/).slice(0, 100).join(' ');
  tests.push({
    name: 'Simple',
    prompt: simpleWords,
    description: 'Concise version (50-100 words)',
    complexity: analyzePromptComplexity(simpleWords)
  });

  // Moderate version (100-200 words)
  const moderateWords = basePrompt.split(/\s+/).slice(0, 200).join(' ');
  tests.push({
    name: 'Moderate',
    prompt: moderateWords,
    description: 'Balanced version (100-200 words)',
    complexity: analyzePromptComplexity(moderateWords)
  });

  // Complex version (200-500 words)
  const complexWords = basePrompt.split(/\s+/).slice(0, 500).join(' ');
  tests.push({
    name: 'Complex',
    prompt: complexWords,
    description: 'Detailed version (200-500 words)',
    complexity: analyzePromptComplexity(complexWords)
  });

  // Full version
  tests.push({
    name: 'Full',
    prompt: basePrompt,
    description: 'Complete original prompt',
    complexity: analyzePromptComplexity(basePrompt)
  });

  return tests;
}

/**
 * Validate prompt for common issues
 * @param {string} prompt - Prompt to validate
 * @returns {Object} Validation results
 */
export function validatePromptQuality(prompt) {
  const issues = [];
  const suggestions = [];

  if (!prompt || prompt.trim().length === 0) {
    issues.push('Prompt is empty');
    return { valid: false, issues, suggestions };
  }

  const complexity = analyzePromptComplexity(prompt);

  // Check length
  if (complexity.wordCount < 50) {
    issues.push('Prompt is too short (less than 50 words)');
    suggestions.push('Add more details about personality, behavior, and responsibilities');
  }

  if (complexity.wordCount > 1000) {
    issues.push('Prompt is very long (over 1000 words)');
    suggestions.push('Consider breaking into sections or simplifying');
  }

  // Check structure
  if (complexity.paragraphCount === 0) {
    issues.push('No paragraph breaks detected');
    suggestions.push('Use paragraphs to organize information');
  }

  // Check for key elements
  const hasPersonality = /personality|tone|style|character/i.test(prompt);
  const hasResponsibilities = /responsibilit|role|task|duty/i.test(prompt);
  const hasExamples = /example|instance|case|scenario/i.test(prompt);

  if (!hasPersonality) {
    suggestions.push('Consider adding personality traits or tone description');
  }

  if (!hasResponsibilities) {
    suggestions.push('Consider adding role and responsibilities');
  }

  if (!hasExamples) {
    suggestions.push('Consider adding example phrases or scenarios');
  }

  // Check for common mistakes
  if (/as an ai|as a language model/i.test(prompt)) {
    issues.push('Contains generic AI language');
    suggestions.push('Remove phrases like "as an AI" - be specific about the agent\'s role');
  }

  if (prompt.length > 5000) {
    issues.push('Prompt exceeds recommended length');
    suggestions.push('Very long prompts may impact performance - consider condensing');
  }

  return {
    valid: issues.length === 0,
    issues,
    suggestions,
    complexity
  };
}

/**
 * Compare two prompts
 * @param {string} prompt1 - First prompt
 * @param {string} prompt2 - Second prompt
 * @returns {Object} Comparison results
 */
export function comparePrompts(prompt1, prompt2) {
  const complexity1 = analyzePromptComplexity(prompt1);
  const complexity2 = analyzePromptComplexity(prompt2);

  return {
    prompt1: {
      ...complexity1,
      prompt: prompt1
    },
    prompt2: {
      ...complexity2,
      prompt: prompt2
    },
    differences: {
      wordDiff: complexity2.wordCount - complexity1.wordCount,
      charDiff: complexity2.charCount - complexity1.charCount,
      tokenDiff: complexity2.estimatedTokens - complexity1.estimatedTokens,
      complexityChange: complexity2.complexity !== complexity1.complexity
    }
  };
}

