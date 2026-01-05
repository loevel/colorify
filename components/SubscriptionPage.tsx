
import React, { useState } from 'react';
import { Check, Star, Shield, Zap, Loader2, Crown } from 'lucide-react';
import { User, SubscriptionTier } from '../types';
import { PLANS, upgradeSubscription, cancelSubscription } from '../services/subscriptionService';

interface Props {
  user: User;
  onUpdateUser: () => void; // Callback to refresh user data after change
}

const SubscriptionPage: React.FC<Props> = ({ user, onUpdateUser }) => {
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (tier === user.subscriptionTier) return;
    
    if (confirm(`Are you sure you want to switch to the ${PLANS.find(p => p.id === tier)?.name} plan?`)) {
      setLoadingTier(tier);
      try {
        if (tier === 'free') {
           await cancelSubscription(user.id);
        } else {
           await upgradeSubscription(user.id, tier);
        }
        // Force a small delay to ensure Firestore propagates locally if using listeners
        await new Promise(r => setTimeout(r, 500));
        onUpdateUser(); // Trigger parent to reload user profile
      } catch (error) {
        alert("Failed to update subscription. Please try again.");
      } finally {
        setLoadingTier(null);
      }
    }
  };

  const currentPlan = PLANS.find(p => p.id === user.subscriptionTier);

  return (
    <div className="animate-fade-in-up pb-20">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-32 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 comic-font flex items-center gap-2">
              Current Plan: <span className="text-indigo-600">{currentPlan?.name}</span>
            </h2>
            <p className="text-slate-500 mt-1">
              {user.subscriptionTier === 'free' 
                ? "Upgrade to unlock unlimited creativity and HD downloads." 
                : "Thanks for being a premium member! You're supporting the magic."}
            </p>
          </div>
          
          <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-sm font-bold text-indigo-800 uppercase tracking-wide">Status: {user.subscriptionStatus}</span>
          </div>
        </div>
      </div>

      <div className="text-center mb-10">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Available Plans</h3>
        <p className="text-slate-500">Choose the magic level that fits your family.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {PLANS.map((plan) => {
          const isCurrent = user.subscriptionTier === plan.id;
          const isLoading = loadingTier === plan.id;

          return (
            <div 
              key={plan.id}
              className={`relative flex flex-col p-6 rounded-2xl bg-white transition-all duration-300 ${
                isCurrent 
                  ? 'border-2 border-green-500 ring-4 ring-green-50 shadow-lg order-first md:order-none' 
                  : plan.highlight 
                    ? 'border border-indigo-200 shadow-xl scale-105 z-10' 
                    : 'border border-slate-200 shadow-sm opacity-90 hover:opacity-100'
              }`}
            >
              {plan.highlight && !isCurrent && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                  POPULAR
                </div>
              )}
              {isCurrent && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                  <Check size={12} strokeWidth={4} /> Current Plan
                </div>
              )}

              <div className="mb-4">
                <h4 className="text-lg font-bold text-slate-800">{plan.name}</h4>
                <div className="flex items-baseline mt-1">
                  <span className="text-3xl font-extrabold text-slate-900">${plan.price / 100}</span>
                  <span className="text-slate-500 text-sm ml-1">/mo</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">{plan.description}</p>
              </div>

              <div className="flex-1">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className={`mt-0.5 min-w-[16px] ${feature.included ? 'text-green-500' : 'text-slate-300'}`}>
                        {feature.included ? <Check size={14} strokeWidth={3} /> : <span className="block w-1.5 h-1.5 rounded-full bg-slate-200 m-1"/>}
                      </div>
                      <span className={feature.included ? 'text-slate-700' : 'text-slate-400'}>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                disabled={isCurrent || loadingTier !== null}
                onClick={() => handleSubscribe(plan.id)}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  isCurrent
                    ? 'bg-green-50 text-green-700 cursor-default'
                    : plan.highlight
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : isCurrent ? (
                  "Active Plan"
                ) : plan.price === 0 ? (
                   "Downgrade to Free"
                ) : (
                   `Upgrade to ${plan.name}`
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-16 bg-slate-100 rounded-2xl p-6 text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-4 text-indigo-400">
           <Shield size={32} />
        </div>
        <h4 className="font-bold text-slate-800 mb-2">Secure Payment Processing</h4>
        <p className="text-sm text-slate-500">
          All payments are processed securely. You can cancel your subscription at any time. 
          Your access to premium features will continue until the end of your billing period.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPage;
