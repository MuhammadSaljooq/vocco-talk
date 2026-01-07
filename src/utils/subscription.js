/**
 * Subscription and monetization utilities
 */

export const SUBSCRIPTION_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    monthlyApiCalls: 1000,
    monthlyVoiceMinutes: 60,
    maxAgents: 3,
    features: [
      'Basic voice agents',
      'Standard templates',
      'Community support',
      'Basic analytics'
    ],
    limitations: [
      'Limited to 3 agents',
      '1000 API calls/month',
      '60 voice minutes/month'
    ]
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    monthlyApiCalls: 10000,
    monthlyVoiceMinutes: 600,
    maxAgents: 20,
    features: [
      'Unlimited basic agents',
      'Premium templates',
      'Custom voice options',
      'Advanced analytics',
      'Priority support',
      'API access',
      'White-label options'
    ],
    limitations: []
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    monthlyApiCalls: 100000,
    monthlyVoiceMinutes: 6000,
    maxAgents: -1, // Unlimited
    features: [
      'Everything in Pro',
      'Unlimited agents',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'On-premise deployment',
      'Custom training'
    ],
    limitations: []
  }
};

/**
 * Get subscription tier for user
 * @param {string} userId - User ID
 * @returns {Object} Subscription tier object
 */
export function getUserSubscription(userId) {
  try {
    const stored = localStorage.getItem('vocco_talk_subscriptions');
    const subscriptions = stored ? JSON.parse(stored) : {};
    const userSub = subscriptions[userId];
    
    if (userSub && userSub.tier) {
      return {
        ...SUBSCRIPTION_TIERS[userSub.tier.toUpperCase()],
        ...userSub,
        startDate: userSub.startDate || new Date().toISOString()
      };
    }
    
    // Default to FREE tier
    return {
      ...SUBSCRIPTION_TIERS.FREE,
      startDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    return SUBSCRIPTION_TIERS.FREE;
  }
}

/**
 * Set subscription tier for user
 * @param {string} userId - User ID
 * @param {string} tierId - Tier ID ('free', 'pro', 'enterprise')
 */
export function setUserSubscription(userId, tierId) {
  try {
    const stored = localStorage.getItem('vocco_talk_subscriptions');
    const subscriptions = stored ? JSON.parse(stored) : {};
    
    subscriptions[userId] = {
      tier: tierId,
      startDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('vocco_talk_subscriptions', JSON.stringify(subscriptions));
    return true;
  } catch (error) {
    console.error('Error setting subscription:', error);
    return false;
  }
}

/**
 * Check if user can perform action based on subscription
 * @param {string} userId - User ID
 * @param {string} action - Action type ('createAgent', 'usePremiumTemplate', 'customVoice')
 * @returns {Object} { allowed: boolean, reason?: string }
 */
export function checkSubscriptionLimit(userId, action) {
  const subscription = getUserSubscription(userId);
  
  switch (action) {
    case 'createAgent':
      // Check agent count limit
      const { getAllAgents } = require('./agentStorage');
      const agents = getAllAgents();
      if (subscription.maxAgents !== -1 && agents.length >= subscription.maxAgents) {
        return {
          allowed: false,
          reason: `You've reached the limit of ${subscription.maxAgents} agents for ${subscription.name} tier. Upgrade to create more agents.`
        };
      }
      return { allowed: true };
      
    case 'usePremiumTemplate':
      if (subscription.id === 'free') {
        return {
          allowed: false,
          reason: 'Premium templates are available in Pro tier and above. Upgrade to access premium templates.'
        };
      }
      return { allowed: true };
      
    case 'customVoice':
      if (subscription.id === 'free') {
        return {
          allowed: false,
          reason: 'Custom voice options are available in Pro tier and above. Upgrade to customize voice settings.'
        };
      }
      return { allowed: true };
      
    default:
      return { allowed: true };
  }
}

/**
 * Get usage statistics for current month
 * @param {string} userId - User ID
 * @returns {Object} Usage stats
 */
export function getMonthlyUsage(userId) {
  try {
    const stored = localStorage.getItem('vocco_talk_usage');
    const allUsage = stored ? JSON.parse(stored) : {};
    const userUsage = allUsage[userId] || {};
    
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthUsage = userUsage[currentMonth] || {
      apiCalls: 0,
      voiceMinutes: 0,
      agentsCreated: 0
    };
    
    return monthUsage;
  } catch (error) {
    console.error('Error getting usage:', error);
    return { apiCalls: 0, voiceMinutes: 0, agentsCreated: 0 };
  }
}

/**
 * Record usage
 * @param {string} userId - User ID
 * @param {Object} usage - { apiCalls, voiceMinutes, agentsCreated }
 */
export function recordUsage(userId, usage) {
  try {
    const stored = localStorage.getItem('vocco_talk_usage');
    const allUsage = stored ? JSON.parse(stored) : {};
    
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    if (!allUsage[userId]) {
      allUsage[userId] = {};
    }
    
    if (!allUsage[userId][currentMonth]) {
      allUsage[userId][currentMonth] = {
        apiCalls: 0,
        voiceMinutes: 0,
        agentsCreated: 0
      };
    }
    
    allUsage[userId][currentMonth].apiCalls += usage.apiCalls || 0;
    allUsage[userId][currentMonth].voiceMinutes += usage.voiceMinutes || 0;
    allUsage[userId][currentMonth].agentsCreated += usage.agentsCreated || 0;
    
    localStorage.setItem('vocco_talk_usage', JSON.stringify(allUsage));
  } catch (error) {
    console.error('Error recording usage:', error);
  }
}

/**
 * Check if user has exceeded usage limits
 * @param {string} userId - User ID
 * @returns {Object} { exceeded: boolean, limits: Object, usage: Object }
 */
export function checkUsageLimits(userId) {
  const subscription = getUserSubscription(userId);
  const usage = getMonthlyUsage(userId);
  
  const exceeded = {
    apiCalls: usage.apiCalls >= subscription.monthlyApiCalls,
    voiceMinutes: usage.voiceMinutes >= subscription.monthlyVoiceMinutes
  };
  
  return {
    exceeded: exceeded.apiCalls || exceeded.voiceMinutes,
    limits: {
      apiCalls: subscription.monthlyApiCalls,
      voiceMinutes: subscription.monthlyVoiceMinutes
    },
    usage,
    remaining: {
      apiCalls: Math.max(0, subscription.monthlyApiCalls - usage.apiCalls),
      voiceMinutes: Math.max(0, subscription.monthlyVoiceMinutes - usage.voiceMinutes)
    }
  };
}

/**
 * Calculate estimated cost based on usage
 * @param {Object} usage - Usage object
 * @returns {number} Estimated cost in USD
 */
export function calculateUsageCost(usage) {
  // Base cost per API call (approximate Gemini API pricing)
  const costPerApiCall = 0.0001; // $0.0001 per call
  const costPerVoiceMinute = 0.01; // $0.01 per minute
  
  const apiCost = (usage.apiCalls || 0) * costPerApiCall;
  const voiceCost = (usage.voiceMinutes || 0) * costPerVoiceMinute;
  
  return apiCost + voiceCost;
}

