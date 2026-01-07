import { useState } from 'react';
import { SUBSCRIPTION_TIERS, setUserSubscription, getUserSubscription, checkUsageLimits } from '../utils/subscription';
import { getCurrentUser } from '../utils/userStorage';

export default function Pricing() {
  const [selectedTier, setSelectedTier] = useState(null);
  const user = getCurrentUser();
  const currentSubscription = user ? getUserSubscription(user.id) : SUBSCRIPTION_TIERS.FREE;
  const usageLimits = user ? checkUsageLimits(user.id) : null;

  const handleUpgrade = (tierId) => {
    if (!user) {
      alert('Please sign in to upgrade your plan');
      return;
    }

    // In production, this would integrate with payment processing
    if (confirm(`Upgrade to ${SUBSCRIPTION_TIERS[tierId.toUpperCase()].name} plan?`)) {
      setUserSubscription(user.id, tierId);
      alert('Subscription updated! Refresh the page to see changes.');
      window.location.reload();
    }
  };

  const tiers = Object.values(SUBSCRIPTION_TIERS);

  return (
    <div className="relative pt-32 pb-20 w-full min-h-screen bg-background-dark">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBWMGg0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-lg text-secondary-grey max-w-2xl mx-auto">
            Flexible pricing that scales with your needs. Start free and upgrade anytime.
          </p>
        </div>

        {/* Current Usage (if logged in) */}
        {user && usageLimits && (
          <div className="mb-12 max-w-4xl mx-auto">
            <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4">Current Usage (This Month)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-secondary-grey">API Calls</span>
                    <span className="text-sm font-bold text-white">
                      {usageLimits.usage.apiCalls.toLocaleString()} / {usageLimits.limits.apiCalls.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-dark rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        usageLimits.exceeded.apiCalls ? 'bg-accent' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(100, (usageLimits.usage.apiCalls / usageLimits.limits.apiCalls) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-secondary-grey">Voice Minutes</span>
                    <span className="text-sm font-bold text-white">
                      {Math.round(usageLimits.usage.voiceMinutes)} / {usageLimits.limits.voiceMinutes}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-dark rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        usageLimits.exceeded.voiceMinutes ? 'bg-accent' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(100, (usageLimits.usage.voiceMinutes / usageLimits.limits.voiceMinutes) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              {usageLimits.exceeded && (
                <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
                  <p className="text-sm text-accent">
                    You've exceeded your usage limits. Upgrade to continue using the service.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => {
            const isCurrentPlan = currentSubscription.id === tier.id;
            const isPro = tier.id === 'pro';
            
            return (
              <div
                key={tier.id}
                className={`relative bg-surface-card rounded-2xl p-8 border transition-all ${
                  isPro
                    ? 'border-primary/50 shadow-[0_0_40px_-10px_rgba(91,140,90,0.3)] scale-105'
                    : 'border-white/5 hover:border-white/20'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full text-white text-xs font-bold">
                    MOST POPULAR
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-primary text-xs font-bold">
                    CURRENT
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">${tier.price}</span>
                    {tier.price > 0 && <span className="text-secondary-grey">/month</span>}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-2 text-sm text-secondary-grey">
                    <span className="material-symbols-outlined text-primary text-lg">check</span>
                    <span>{tier.monthlyApiCalls.toLocaleString()} API calls/month</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-secondary-grey">
                    <span className="material-symbols-outlined text-primary text-lg">check</span>
                    <span>{tier.monthlyVoiceMinutes} voice minutes/month</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-secondary-grey">
                    <span className="material-symbols-outlined text-primary text-lg">check</span>
                    <span>
                      {tier.maxAgents === -1 ? 'Unlimited' : tier.maxAgents} agents
                    </span>
                  </div>
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-secondary-grey">
                      <span className="material-symbols-outlined text-primary text-lg">check</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 rounded-full font-bold transition-all ${
                    isCurrentPlan
                      ? 'bg-white/5 text-secondary-grey cursor-not-allowed'
                      : isPro
                      ? 'bg-primary hover:bg-primary-glow text-white shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)] hover:scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : tier.price === 0 ? 'Get Started' : 'Upgrade'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Usage-Based Pricing Info */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-surface-card rounded-2xl p-8 border border-white/5">
            <h3 className="text-2xl font-bold text-white mb-4">Usage-Based Pricing</h3>
            <p className="text-secondary-grey mb-6">
              All plans include base usage limits. Additional usage is charged based on actual API costs:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-dark rounded-xl p-4 border border-white/5">
                <div className="text-sm text-secondary-grey mb-1">API Calls</div>
                <div className="text-2xl font-bold text-white">$0.0001</div>
                <div className="text-xs text-secondary-grey mt-1">per API call</div>
              </div>
              <div className="bg-surface-dark rounded-xl p-4 border border-white/5">
                <div className="text-sm text-secondary-grey mb-1">Voice Minutes</div>
                <div className="text-2xl font-bold text-white">$0.01</div>
                <div className="text-xs text-secondary-grey mt-1">per minute</div>
              </div>
            </div>
            <p className="text-sm text-secondary-grey mt-6">
              * Pricing aligned with Google Gemini API costs. You only pay for what you use beyond your plan limits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

