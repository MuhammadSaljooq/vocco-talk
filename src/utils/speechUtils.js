/**
 * Web Speech API utilities for speech-to-text fallback
 */

/**
 * Initialize Web Speech API recognition (browser fallback)
 * @returns {SpeechRecognition|null} Speech recognition object or null if not supported
 */
export function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  return recognition;
}

/**
 * Initialize Web Speech API synthesis (text-to-speech fallback)
 * @returns {SpeechSynthesis} Speech synthesis object
 */
export function initSpeechSynthesis() {
  return window.speechSynthesis;
}

/**
 * Speak text using Web Speech API
 * @param {string} text - Text to speak
 * @param {string} lang - Language code (default: 'en-US')
 * @param {number} rate - Speech rate (0.1 to 10, default: 1)
 * @param {number} pitch - Speech pitch (0 to 2, default: 1)
 * @param {number} volume - Speech volume (0 to 1, default: 1)
 */
export function speakText(text, lang = 'en-US', rate = 1, pitch = 1, volume = 1) {
  if (!window.speechSynthesis) {
    console.warn('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;

  window.speechSynthesis.speak(utterance);
  
  return utterance;
}

/**
 * Stop any ongoing speech synthesis
 */
export function stopSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Get available voices for speech synthesis
 * @returns {Array} Array of available voices
 */
export function getAvailableVoices() {
  if (!window.speechSynthesis) {
    return [];
  }
  
  return window.speechSynthesis.getVoices();
}

/**
 * Check if Web Speech API is supported
 * @returns {boolean} True if supported
 */
export function isSpeechAPISupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition) && !!window.speechSynthesis;
}

