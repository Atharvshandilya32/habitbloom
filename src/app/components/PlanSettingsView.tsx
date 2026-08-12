import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { ShieldCheck, CheckCircle2, Lock, Zap, ArrowRight, X } from 'lucide-react';
import { UserPlan } from '../../../lib/featureAccess';

interface PlanSettingsViewProps {
  user: User | null;
  plan: UserPlan;
}

export default function PlanSettingsView({ plan }: PlanSettingsViewProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [prebookState, setPrebookState] = useState<'IDLE' | 'INTERESTED'>('IDLE');

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };

  const isFree = plan === 'FREE';
  const isPremium = plan === 'PREMIUM';
  const isEarlyAccess = plan === 'EARLY_ACCESS';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <h2 className="text-xl font-black text-slate-900 mb-1">Your Plan</h2>
          <p className="text-sm text-slate-500 font-medium mb-6">Manage your subscription and features.</p>
          
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-6 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
                  {isFree ? 'Free Plan' : isPremium ? 'Premium Plan' : 'Early Access'}
                </span>
                {(isPremium || isEarlyAccess) && (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                )}
              </div>
              <p className="text-slate-600 text-sm font-medium mt-2">
                {isFree 
                  ? 'Your core HabitBloom experience is available at no cost. Premium features are planned for 2027.' 
                  : isPremium 
                    ? 'You have access to all premium features. Thank you for your support!' 
                    : 'You have exclusive early access to upcoming premium features.'}
              </p>
            </div>
            
            <button 
              onClick={handleUpgradeClick}
              className={`whitespace-nowrap px-5 py-2.5 rounded-xl font-bold transition-all ${
                isFree 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              {isFree ? 'Learn About Premium' : 'Manage Subscription'}
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Plan Benefits</h3>
            
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 bg-emerald-100 p-1 rounded-full text-emerald-600">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Unlimited Habit Tracking</p>
                  <p className="text-xs text-slate-500 font-medium">Build as many habits as you need.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 bg-emerald-100 p-1 rounded-full text-emerald-600">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Basic Insights & Analytics</p>
                  <p className="text-xs text-slate-500 font-medium">View your streaks and completion history.</p>
                </div>
              </li>
              
              <li className={`flex items-start gap-3 ${isFree ? 'opacity-60 grayscale' : ''}`}>
                <div className={`mt-0.5 p-1 rounded-full ${isFree ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                  {isFree ? <Lock size={14} /> : <CheckCircle2 size={14} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800">Advanced Growth Insights</p>
                    {isFree && <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Premium</span>}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Deep historical patterns and correlation analysis.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="relative h-32 bg-emerald-600 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 p-8">
                  <Zap size={120} className="text-white" />
                </div>
              </div>
              <div className="relative z-10 text-center px-6">
                <h2 className="text-2xl font-black text-white">HabitBloom Premium</h2>
                <div className="mt-2 inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-emerald-50 uppercase tracking-widest border border-white/20">
                  Coming in 2027
                </div>
              </div>
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full transition"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-8 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-amber-100 text-amber-600 flex items-center justify-center rounded-2xl mb-2">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900">Payments are not available yet</h3>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">
                HabitBloom is currently free during our validation phase. We plan to introduce paid access after January 1, 2027. 
              </p>
              <div className="pt-4 border-t border-slate-100 mt-4">
                <p className="text-xs text-slate-500 font-medium mb-3">Proposed 2027 Price: <span className="font-bold text-slate-800 line-through">₹999/year</span></p>
                {prebookState === 'IDLE' ? (
                  <div className="space-y-2">
                    <button 
                      onClick={() => setPrebookState('INTERESTED')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-2"
                    >
                      Pre-book Premium (Free)
                    </button>
                    <button 
                      onClick={() => setShowUpgradeModal(false)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
                    >
                      Maybe Later
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl flex items-center gap-2 justify-center text-sm font-bold border border-emerald-100">
                      <CheckCircle2 size={16} />
                      You're on the list!
                    </div>
                    <button 
                      onClick={() => setShowUpgradeModal(false)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
                    >
                      Close <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
