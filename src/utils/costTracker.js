/**
 * API Cost Tracking and Monitoring
 * Tracks Gemini API usage costs for development and production
 */

const COST_STORAGE_KEY = 'vocco_talk_cost_tracking';

// Gemini API pricing (approximate, update based on actual pricing)
const PRICING = {
  apiCall: 0.0001, // $0.0001 per API call
  voiceMinute: 0.01, // $0.01 per voice minute
  inputToken: 0.000000125, // $0.000000125 per 1K input tokens (if tracking tokens)
  outputToken: 0.0000005 // $0.0000005 per 1K output tokens (if tracking tokens)
};

/**
 * Get cost tracking data
 */
function getCostData() {
  try {
    const stored = localStorage.getItem(COST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      daily: {},
      monthly: {},
      total: {
        apiCalls: 0,
        voiceMinutes: 0,
        cost: 0
      }
    };
  } catch (error) {
    console.error('Error loading cost data:', error);
    return {
      daily: {},
      monthly: {},
      total: {
        apiCalls: 0,
        voiceMinutes: 0,
        cost: 0
      }
    };
  }
}

/**
 * Save cost tracking data
 */
function saveCostData(data) {
  try {
    localStorage.setItem(COST_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving cost data:', error);
  }
}

/**
 * Record API usage and calculate cost
 * @param {Object} usage - { apiCalls, voiceMinutes, tokens? }
 */
export function recordCost(usage) {
  const costData = getCostData();
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Calculate cost
  const apiCost = (usage.apiCalls || 0) * PRICING.apiCall;
  const voiceCost = (usage.voiceMinutes || 0) * PRICING.voiceMinute;
  const tokenCost = ((usage.inputTokens || 0) * PRICING.inputToken) + 
                   ((usage.outputTokens || 0) * PRICING.outputToken);
  const totalCost = apiCost + voiceCost + tokenCost;

  // Update daily tracking
  if (!costData.daily[today]) {
    costData.daily[today] = {
      apiCalls: 0,
      voiceMinutes: 0,
      cost: 0,
      tokens: { input: 0, output: 0 }
    };
  }
  costData.daily[today].apiCalls += usage.apiCalls || 0;
  costData.daily[today].voiceMinutes += usage.voiceMinutes || 0;
  costData.daily[today].cost += totalCost;
  if (usage.inputTokens) costData.daily[today].tokens.input += usage.inputTokens;
  if (usage.outputTokens) costData.daily[today].tokens.output += usage.outputTokens;

  // Update monthly tracking
  if (!costData.monthly[month]) {
    costData.monthly[month] = {
      apiCalls: 0,
      voiceMinutes: 0,
      cost: 0,
      tokens: { input: 0, output: 0 }
    };
  }
  costData.monthly[month].apiCalls += usage.apiCalls || 0;
  costData.monthly[month].voiceMinutes += usage.voiceMinutes || 0;
  costData.monthly[month].cost += totalCost;
  if (usage.inputTokens) costData.monthly[month].tokens.input += usage.inputTokens;
  if (usage.outputTokens) costData.monthly[month].tokens.output += usage.outputTokens;

  // Update total
  costData.total.apiCalls += usage.apiCalls || 0;
  costData.total.voiceMinutes += usage.voiceMinutes || 0;
  costData.total.cost += totalCost;

  saveCostData(costData);

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`💰 Cost tracked: $${totalCost.toFixed(4)} | API Calls: ${usage.apiCalls || 0} | Voice: ${(usage.voiceMinutes || 0).toFixed(2)}min`);
  }

  return totalCost;
}

/**
 * Get today's cost
 */
export function getTodayCost() {
  const costData = getCostData();
  const today = new Date().toISOString().split('T')[0];
  return costData.daily[today] || {
    apiCalls: 0,
    voiceMinutes: 0,
    cost: 0,
    tokens: { input: 0, output: 0 }
  };
}

/**
 * Get this month's cost
 */
export function getMonthCost() {
  const costData = getCostData();
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return costData.monthly[month] || {
    apiCalls: 0,
    voiceMinutes: 0,
    cost: 0,
    tokens: { input: 0, output: 0 }
  };
}

/**
 * Get total cost
 */
export function getTotalCost() {
  const costData = getCostData();
  return costData.total;
}

/**
 * Get cost estimate for usage
 * @param {Object} usage - { apiCalls, voiceMinutes }
 * @returns {number} Estimated cost in USD
 */
export function estimateCost(usage) {
  const apiCost = (usage.apiCalls || 0) * PRICING.apiCall;
  const voiceCost = (usage.voiceMinutes || 0) * PRICING.voiceMinute;
  return apiCost + voiceCost;
}

/**
 * Check if daily cost limit exceeded (for development)
 * @param {number} limit - Daily cost limit in USD
 * @returns {Object} { exceeded: boolean, current: number, limit: number }
 */
export function checkDailyCostLimit(limit = 10) {
  const todayCost = getTodayCost();
  return {
    exceeded: todayCost.cost >= limit,
    current: todayCost.cost,
    limit,
    remaining: Math.max(0, limit - todayCost.cost)
  };
}

/**
 * Reset cost tracking (use with caution)
 */
export function resetCostTracking() {
  localStorage.removeItem(COST_STORAGE_KEY);
}

