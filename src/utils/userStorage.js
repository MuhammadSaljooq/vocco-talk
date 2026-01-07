/**
 * User storage utilities
 * In production, this would be replaced with API calls and proper authentication
 */

import { encryptAPIKey, decryptAPIKey } from './encryption';

const STORAGE_KEY_USERS = 'vocco_talk_users';
const STORAGE_KEY_CURRENT_USER = 'vocco_talk_current_user';
const STORAGE_KEY_CONVERSATIONS = 'vocco_talk_conversations';
const STORAGE_KEY_API_KEYS = 'vocco_talk_api_keys';

/**
 * Get all users (for demo purposes - in production this would be server-side)
 */
export function getAllUsers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USERS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

/**
 * Create a new user account
 * @param {Object} userData - { email, password, name }
 * @returns {Object} Created user object
 */
export function createUser(userData) {
  try {
    const users = getAllUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === userData.email)) {
      throw new Error('User with this email already exists');
    }

    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email,
      name: userData.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // In production, password would be hashed server-side
      passwordHash: btoa(userData.password), // Simple encoding for demo - NOT secure!
      preferences: {
        theme: 'dark',
        language: 'English',
        privacyLevel: 'standard', // 'standard', 'enhanced', 'maximum'
        conversationConsent: true, // User consent for conversation logging
        gdprConsent: false, // GDPR consent (explicit opt-in)
        ccpaOptOut: false // CCPA opt-out
      }
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Authenticate user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object|null} User object if authenticated, null otherwise
 */
export function authenticateUser(email, password) {
  try {
    const users = getAllUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return null;
    }

    // Simple comparison for demo - NOT secure!
    const passwordHash = btoa(password);
    if (user.passwordHash !== passwordHash) {
      return null;
    }

    // Set current user
    setCurrentUser(user);
    return user;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}

/**
 * Get current logged-in user
 * @returns {Object|null} Current user or null
 */
export function getCurrentUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading current user:', error);
    return null;
  }
}

/**
 * Set current user
 * @param {Object} user - User object
 */
export function setCurrentUser(user) {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error setting current user:', error);
  }
}

/**
 * Logout current user
 */
export function logoutUser() {
  localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Object} Updated user object
 */
export function updateUser(userId, updates) {
  try {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    
    // Update current user if it's the same user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(users[userIndex]);
    }

    return users[userIndex];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Store API key for user (encrypted)
 * @param {string} userId - User ID
 * @param {string} apiKey - API key (will be encrypted)
 */
export function saveUserAPIKey(userId, apiKey) {
  try {
    const keys = getAllAPIKeys();
    const encryptedKey = encryptAPIKey(apiKey);
    keys[userId] = {
      key: encryptedKey,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY_API_KEYS, JSON.stringify(keys));
  } catch (error) {
    console.error('Error saving API key:', error);
    throw error;
  }
}

/**
 * Get API key for user (decrypted)
 * @param {string} userId - User ID
 * @returns {string|null} API key or null
 */
export function getUserAPIKey(userId) {
  try {
    const keys = getAllAPIKeys();
    const userKey = keys[userId];
    if (!userKey) return null;
    
    // Decrypt
    return decryptAPIKey(userKey.key);
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
}

/**
 * Get all API keys (for internal use)
 */
function getAllAPIKeys() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_API_KEYS);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading API keys:', error);
    return {};
  }
}

/**
 * Save conversation history
 * @param {string} userId - User ID
 * @param {string} agentId - Agent ID
 * @param {Array} messages - Conversation messages
 * @param {Object} metadata - Additional metadata (duration, etc.)
 */
export function saveConversation(userId, agentId, messages, metadata = {}) {
  try {
    const conversations = getAllConversations();
    const conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      agentId,
      messages,
      metadata: {
        duration: metadata.duration || 0,
        messageCount: messages.length,
        startedAt: metadata.startedAt || new Date().toISOString(),
        endedAt: metadata.endedAt || new Date().toISOString(),
        ...metadata
      },
      createdAt: new Date().toISOString()
    };

    conversations.push(conversation);
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
    
    return conversation;
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
}

/**
 * Get conversations for user
 * @param {string} userId - User ID
 * @param {string} agentId - Optional agent ID to filter
 * @returns {Array} Array of conversations
 */
export function getUserConversations(userId, agentId = null) {
  try {
    const conversations = getAllConversations();
    let filtered = conversations.filter(c => c.userId === userId);
    
    if (agentId) {
      filtered = filtered.filter(c => c.agentId === agentId);
    }

    // Sort by most recent first
    return filtered.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
}

/**
 * Delete conversation
 * @param {string} conversationId - Conversation ID
 */
export function deleteConversation(conversationId) {
  try {
    const conversations = getAllConversations();
    const filtered = conversations.filter(c => c.id !== conversationId);
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }
}

/**
 * Get all conversations (for internal use)
 */
function getAllConversations() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
}

/**
 * Get user privacy level
 * @param {string} userId - User ID
 * @returns {string} Privacy level
 */
export function getUserPrivacyLevel(userId) {
  try {
    const user = getAllUsers().find(u => u.id === userId);
    return user?.preferences?.privacyLevel || 'standard';
  } catch (error) {
    return 'standard';
  }
}

/**
 * Check if conversation history should be stored based on privacy level
 * @param {string} userId - User ID
 * @returns {boolean} True if should store
 */
export function shouldStoreConversationHistory(userId) {
  const privacyLevel = getUserPrivacyLevel(userId);
  // 'maximum' privacy means no storage
  return privacyLevel !== 'maximum';
}

