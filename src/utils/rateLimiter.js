/**
 * Rate limiting utilities
 * Prevents API abuse by limiting requests per user
 */

const RATE_LIMIT_STORAGE_KEY = 'vocco_talk_rate_limits';

// Rate limit configuration
const RATE_LIMITS = {
  apiCalls: {
    window: 60 * 1000, // 1 minute
    max: 30 // 30 calls per minute
  },
  voiceSessions: {
    window: 60 * 60 * 1000, // 1 hour
    max: 10 // 10 sessions per hour
  },
  agentCreations: {
    window: 60 * 60 * 1000, // 1 hour
    max: 20 // 20 agents per hour
  }
};

/**
 * Get rate limit data for user
 */
function getRateLimitData(userId) {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const allData = stored ? JSON.parse(stored) : {};
    return allData[userId] || {};
  } catch (error) {
    console.error('Error loading rate limit data:', error);
    return {};
  }
}

/**
 * Save rate limit data for user
 */
function saveRateLimitData(userId, data) {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const allData = stored ? JSON.parse(stored) : {};
    allData[userId] = data;
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(allData));
  } catch (error) {
    console.error('Error saving rate limit data:', error);
  }
}

/**
 * Check if user has exceeded rate limit
 * @param {string} userId - User ID
 * @param {string} type - Rate limit type ('apiCalls', 'voiceSessions', 'agentCreations')
 * @returns {Object} { allowed: boolean, remaining: number, resetAt: Date }
 */
export function checkRateLimit(userId, type) {
  if (!userId) {
    return { allowed: false, remaining: 0, resetAt: null };
  }

  const config = RATE_LIMITS[type];
  if (!config) {
    return { allowed: true, remaining: Infinity, resetAt: null };
  }

  const userData = getRateLimitData(userId);
  const limitData = userData[type] || { count: 0, resetAt: Date.now() + config.window };

  const now = Date.now();

  // Reset if window expired
  if (now > limitData.resetAt) {
    limitData.count = 0;
    limitData.resetAt = now + config.window;
  }

  const remaining = Math.max(0, config.max - limitData.count);
  const allowed = limitData.count < config.max;

  return {
    allowed,
    remaining,
    resetAt: new Date(limitData.resetAt),
    limit: config.max
  };
}

/**
 * Record a rate limit event
 * @param {string} userId - User ID
 * @param {string} type - Rate limit type
 */
export function recordRateLimit(userId, type) {
  if (!userId) return;

  const config = RATE_LIMITS[type];
  if (!config) return;

  const userData = getRateLimitData(userId);
  const limitData = userData[type] || { count: 0, resetAt: Date.now() + config.window };

  const now = Date.now();

  // Reset if window expired
  if (now > limitData.resetAt) {
    limitData.count = 0;
    limitData.resetAt = now + config.window;
  }

  limitData.count += 1;
  userData[type] = limitData;
  saveRateLimitData(userId, userData);
}

/**
 * Get rate limit status for display
 * @param {string} userId - User ID
 * @returns {Object} Rate limit status for all types
 */
export function getRateLimitStatus(userId) {
  return {
    apiCalls: checkRateLimit(userId, 'apiCalls'),
    voiceSessions: checkRateLimit(userId, 'voiceSessions'),
    agentCreations: checkRateLimit(userId, 'agentCreations')
  };
}

