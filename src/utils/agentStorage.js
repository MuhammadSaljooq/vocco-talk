/**
 * Local storage utilities for agent management
 * Updated to be user-specific
 */

import { getCurrentUser } from './userStorage';
import { savePromptVersion } from './promptVersioning';

const STORAGE_KEY = 'vocco_talk_agents';

/**
 * Get all saved agents for current user
 * @returns {Array} Array of agent objects
 */
export function getAllAgents() {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const stored = localStorage.getItem(STORAGE_KEY);
    const allAgents = stored ? JSON.parse(stored) : [];
    
    // Filter by user ID
    return allAgents.filter(agent => agent.userId === currentUser.id);
  } catch (error) {
    console.error('Error loading agents:', error);
    return [];
  }
}

/**
 * Save an agent
 * @param {Object} agent - Agent object to save
 * @returns {Object} Saved agent with ID and timestamp
 */
export function saveAgent(agent) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User must be logged in to save agents');
    }

    const agents = getAllAgents();
    const allAgents = getAllAgentsFromStorage();
    
    const isNewAgent = !agent.id;
    const newAgent = {
      ...agent,
      id: agent.id || `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id, // Associate with current user
      createdAt: agent.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      conversations: agent.conversations || 0,
      apiCalls: agent.apiCalls || 0,
      voiceMinutes: agent.voiceMinutes || 0,
      promptVersion: agent.promptVersion || 1 // Track prompt version
    };

    // Save prompt version if prompt changed or is new agent
    if (newAgent.systemPrompt) {
      const existingIndex = allAgents.findIndex(a => a.id === newAgent.id);
      const existingAgent = existingIndex >= 0 ? allAgents[existingIndex] : null;
      
      if (isNewAgent || !existingAgent || existingAgent.systemPrompt !== newAgent.systemPrompt) {
        try {
          savePromptVersion(newAgent.id, newAgent.systemPrompt, {
            reason: isNewAgent ? 'Initial creation' : 'Prompt updated',
            changedBy: currentUser.id
          });
          newAgent.promptVersion = (newAgent.promptVersion || 0) + 1;
        } catch (error) {
          console.warn('Failed to save prompt version:', error);
        }
      }
    }

    // Find in all agents (not just user's)
    const existingIndex = allAgents.findIndex(a => a.id === newAgent.id);
    if (existingIndex >= 0) {
      allAgents[existingIndex] = newAgent;
    } else {
      allAgents.push(newAgent);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allAgents));
    return newAgent;
  } catch (error) {
    console.error('Error saving agent:', error);
    throw error;
  }
}

/**
 * Get all agents from storage (internal use)
 */
function getAllAgentsFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading agents:', error);
    return [];
  }
}

/**
 * Get a single agent by ID
 * @param {string} id - Agent ID
 * @returns {Object|null} Agent object or null
 */
export function getAgentById(id) {
  const agents = getAllAgentsFromStorage();
  return agents.find(a => a.id === id) || null;
}

/**
 * Delete an agent
 * @param {string} id - Agent ID to delete
 * @returns {boolean} True if deleted successfully
 */
export function deleteAgent(id) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    const allAgents = getAllAgentsFromStorage();
    const agent = allAgents.find(a => a.id === id);
    
    // Check if agent belongs to current user
    if (!agent || agent.userId !== currentUser.id) {
      return false;
    }

    const filtered = allAgents.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting agent:', error);
    return false;
  }
}

/**
 * Update agent usage statistics
 * @param {string} id - Agent ID
 * @param {Object} stats - Stats to update {conversations, apiCalls, voiceMinutes}
 */
export function updateAgentStats(id, stats) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    const agent = getAgentById(id);
    if (!agent || agent.userId !== currentUser.id) {
      return false;
    }

    agent.conversations = (agent.conversations || 0) + (stats.conversations || 0);
    agent.apiCalls = (agent.apiCalls || 0) + (stats.apiCalls || 0);
    agent.voiceMinutes = (agent.voiceMinutes || 0) + (stats.voiceMinutes || 0);
    agent.updatedAt = new Date().toISOString();

    saveAgent(agent);
    return true;
  } catch (error) {
    console.error('Error updating agent stats:', error);
    return false;
  }
}

/**
 * Get total usage statistics across all agents for current user
 * @returns {Object} Total stats
 */
export function getTotalStats() {
  const agents = getAllAgents();
  return {
    totalAgents: agents.length,
    totalConversations: agents.reduce((sum, a) => sum + (a.conversations || 0), 0),
    totalApiCalls: agents.reduce((sum, a) => sum + (a.apiCalls || 0), 0),
    totalVoiceMinutes: agents.reduce((sum, a) => sum + (a.voiceMinutes || 0), 0)
  };
}
