/**
 * Encryption utilities for sensitive data
 * Note: This is a basic implementation. For production, use a proper encryption library
 */

const ENCRYPTION_KEY = 'vocco_talk_encryption_key'; // In production, use environment variable

/**
 * Simple encryption (XOR cipher for demo)
 * In production, use AES-256-GCM or similar
 */
function simpleEncrypt(text, key) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result); // Base64 encode
}

/**
 * Simple decryption
 */
function simpleDecrypt(encryptedText, key) {
  try {
    const text = atob(encryptedText);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

/**
 * Encrypt API key
 * @param {string} apiKey - API key to encrypt
 * @returns {string} Encrypted API key
 */
export function encryptAPIKey(apiKey) {
  if (!apiKey) return null;
  return simpleEncrypt(apiKey, ENCRYPTION_KEY);
}

/**
 * Decrypt API key
 * @param {string} encryptedKey - Encrypted API key
 * @returns {string} Decrypted API key
 */
export function decryptAPIKey(encryptedKey) {
  if (!encryptedKey) return null;
  return simpleDecrypt(encryptedKey, ENCRYPTION_KEY);
}

/**
 * Sanitize user input to prevent prompt injection
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizePrompt(input) {
  if (!input) return '';
  
  // Remove potential injection patterns
  let sanitized = input
    // Remove system instruction attempts
    .replace(/system\s*instruction/gi, '')
    .replace(/system\s*prompt/gi, '')
    .replace(/ignore\s+previous/gi, '')
    .replace(/forget\s+all/gi, '')
    // Remove role switching attempts
    .replace(/you\s+are\s+now/gi, '')
    .replace(/act\s+as/gi, '')
    .replace(/pretend\s+to\s+be/gi, '')
    // Remove command execution attempts
    .replace(/execute\s+/gi, '')
    .replace(/run\s+/gi, '')
    .replace(/eval\s*\(/gi, '')
    // Remove data extraction attempts
    .replace(/show\s+me\s+your/gi, '')
    .replace(/reveal\s+your/gi, '')
    .replace(/what\s+is\s+your\s+system/gi, '');
  
  // Limit length to prevent abuse
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }
  
  return sanitized.trim();
}

/**
 * Validate prompt for security
 * @param {string} prompt - Prompt to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validatePrompt(prompt) {
  const errors = [];
  
  if (!prompt || prompt.trim().length === 0) {
    errors.push('Prompt cannot be empty');
  }
  
  if (prompt.length < 10) {
    errors.push('Prompt must be at least 10 characters');
  }
  
  if (prompt.length > 10000) {
    errors.push('Prompt must be less than 10,000 characters');
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /system\s*instruction/gi,
    /ignore\s+previous/gi,
    /forget\s+all/gi,
    /you\s+are\s+now/gi,
    /act\s+as/gi,
    /execute\s+/gi,
    /eval\s*\(/gi
  ];
  
  const foundSuspicious = suspiciousPatterns.some(pattern => pattern.test(prompt));
  if (foundSuspicious) {
    errors.push('Prompt contains potentially unsafe patterns');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

