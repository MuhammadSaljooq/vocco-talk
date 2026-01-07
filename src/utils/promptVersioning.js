/**
 * Agent Prompt Versioning System
 * Tracks versions of agent prompts for improvement and rollback capabilities
 */

const VERSION_STORAGE_KEY = 'vocco_talk_prompt_versions';

/**
 * Get version history for an agent
 * @param {string} agentId - Agent ID
 * @returns {Array} Array of version objects
 */
export function getPromptVersions(agentId) {
  try {
    const stored = localStorage.getItem(VERSION_STORAGE_KEY);
    const allVersions = stored ? JSON.parse(stored) : {};
    return allVersions[agentId] || [];
  } catch (error) {
    console.error('Error loading prompt versions:', error);
    return [];
  }
}

/**
 * Save a new version of agent prompt
 * @param {string} agentId - Agent ID
 * @param {string} prompt - System prompt
 * @param {Object} metadata - Additional metadata (reason, notes, etc.)
 * @returns {Object} Version object
 */
export function savePromptVersion(agentId, prompt, metadata = {}) {
  try {
    const stored = localStorage.getItem(VERSION_STORAGE_KEY);
    const allVersions = stored ? JSON.parse(stored) : {};
    
    if (!allVersions[agentId]) {
      allVersions[agentId] = [];
    }

    const version = {
      version: allVersions[agentId].length + 1,
      prompt,
      createdAt: new Date().toISOString(),
      metadata: {
        reason: metadata.reason || 'Manual update',
        notes: metadata.notes || '',
        changedBy: metadata.changedBy || 'user',
        ...metadata
      },
      isActive: true // Latest version is always active
    };

    // Mark previous versions as inactive
    allVersions[agentId].forEach(v => {
      v.isActive = false;
    });

    allVersions[agentId].push(version);
    
    // Keep only last 10 versions per agent
    if (allVersions[agentId].length > 10) {
      allVersions[agentId] = allVersions[agentId].slice(-10);
    }

    localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(allVersions));
    return version;
  } catch (error) {
    console.error('Error saving prompt version:', error);
    throw error;
  }
}

/**
 * Get current active version
 * @param {string} agentId - Agent ID
 * @returns {Object|null} Active version or null
 */
export function getActiveVersion(agentId) {
  const versions = getPromptVersions(agentId);
  return versions.find(v => v.isActive) || versions[versions.length - 1] || null;
}

/**
 * Restore a specific version
 * @param {string} agentId - Agent ID
 * @param {number} versionNumber - Version number to restore
 * @returns {Object} Restored version
 */
export function restoreVersion(agentId, versionNumber) {
  try {
    const versions = getPromptVersions(agentId);
    const versionToRestore = versions.find(v => v.version === versionNumber);
    
    if (!versionToRestore) {
      throw new Error(`Version ${versionNumber} not found`);
    }

    // Create new version from restored one
    const restoredVersion = savePromptVersion(agentId, versionToRestore.prompt, {
      reason: `Restored from version ${versionNumber}`,
      notes: `Original version created: ${versionToRestore.createdAt}`,
      restoredFrom: versionNumber
    });

    return restoredVersion;
  } catch (error) {
    console.error('Error restoring version:', error);
    throw error;
  }
}

/**
 * Compare two versions
 * @param {string} agentId - Agent ID
 * @param {number} version1 - First version number
 * @param {number} version2 - Second version number
 * @returns {Object} Comparison result
 */
export function compareVersions(agentId, version1, version2) {
  const versions = getPromptVersions(agentId);
  const v1 = versions.find(v => v.version === version1);
  const v2 = versions.find(v => v.version === version2);

  if (!v1 || !v2) {
    throw new Error('One or both versions not found');
  }

  return {
    version1: {
      version: v1.version,
      prompt: v1.prompt,
      createdAt: v1.createdAt,
      length: v1.prompt.length
    },
    version2: {
      version: v2.version,
      prompt: v2.prompt,
      createdAt: v2.createdAt,
      length: v2.prompt.length
    },
    differences: {
      lengthDiff: v2.prompt.length - v1.prompt.length,
      wordDiff: v2.prompt.split(/\s+/).length - v1.prompt.split(/\s+/).length,
      changed: v1.prompt !== v2.prompt
    }
  };
}

/**
 * Get version statistics
 * @param {string} agentId - Agent ID
 * @returns {Object} Statistics
 */
export function getVersionStats(agentId) {
  const versions = getPromptVersions(agentId);
  return {
    totalVersions: versions.length,
    currentVersion: versions.length,
    firstVersion: versions[0]?.createdAt || null,
    lastVersion: versions[versions.length - 1]?.createdAt || null,
    averageLength: versions.length > 0
      ? Math.round(versions.reduce((sum, v) => sum + v.prompt.length, 0) / versions.length)
      : 0
  };
}

