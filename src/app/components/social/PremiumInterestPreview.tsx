import React, { useState } from 'react';
import { Sparkles, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { User } from 'firebase/auth';
import { logInfo } from '../../../../lib/logger';
import { AccessState } from '../../../../lib/featureAccess';

interface PremiumInterestPreviewProps {
  user: User | null | undefined;
  featureName: string;
  description: string;
  featureId: string;
  accessState: AccessState;
}

export const PremiumInterestPreview: React.FC<PremiumInterestPreviewProps> = ({ user, featureName, description, featureId, accessState }) => {
  const [interestState, setInterestState] = useState<'IDLE' | 'INTERESTED'>('IDLE');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLearnMore = () => {
    setIsExpanded(true);
    if (user?.uid) {
      logInfo('premium_learn_more', { userId: user.uid, featureId });
    }
  };

  const handleInterest = () => {
    setInterestState('INTERESTED');
    if (user?.uid) {
      logInfo('premium_prebook', { userId: user.uid, featureId });
    }
  };

  React.useEffect(() => {
    if (user?.uid) {
      logInfo('premium_feature_viewed', { userId: user.uid, featureId });
    }
  }, [user?.uid, featureId]);
  
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-slate-700">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Sparkles size={120} />
      </div>
      
      <div className="relative z-10">
        {(accessState === AccessState.COMING_LATER || accessState === AccessState.FREE) && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest text-emerald-300 mb-4 border border-white/10 backdrop-blur-sm">
            <Lock size={12} />
            Coming in 2027
          </div>
        )}
        
        {(accessState === AccessState.EARLY_ACCESS || accessState === AccessState.PREMIUM) && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest text-emerald-300 mb-4 border border-white/10 backdrop-blur-sm">
            <CheckCircle2 size={12} />
            {accessState === AccessState.EARLY_ACCESS ? 'Early Access' : 'Premium Feature'}
          </div>
        )}
        
        <h2 className="text-2xl font-black mb-2">{featureName}</h2>
        <p className="text-slate-300 font-medium max-w-lg mb-6">
          {description}
        </p>
        
        {accessState === AccessState.EARLY_ACCESS || accessState === AccessState.PREMIUM ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition shadow-sm hover:shadow-md flex items-center gap-2"
            >
              Use Feature <ArrowRight size={16} />
            </button>
          </div>
        ) : interestState === 'IDLE' ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button 
              onClick={handleInterest}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition shadow-sm hover:shadow-md flex items-center gap-2"
            >
              Pre-book Premium (Free)
            </button>
            {!isExpanded && (
              <button 
                onClick={handleLearnMore}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2"
              >
                Learn More <ArrowRight size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-100 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="text-emerald-400" />
            <div>
              <p className="font-bold">Premium Pre-booked!</p>
              <p className="text-sm opacity-80">You&apos;re on the list. We&apos;ll notify you when it launches in 2027.</p>
            </div>
          </div>
        )}
        
        {isExpanded && interestState === 'IDLE' && (accessState === AccessState.COMING_LATER || accessState === AccessState.FREE) && (
          <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-500 text-sm text-slate-300 max-w-xl space-y-3">
            <p>
              HabitBloom is currently free during our validation phase. In 2027, we plan to introduce <strong>HabitBloom Premium</strong> to support sustainable development.
            </p>
            <p>
              We&apos;re exploring features like deeper historical trends, habit pattern analysis, and long-term personal growth reports. Let us know if this is something you&apos;d value!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
