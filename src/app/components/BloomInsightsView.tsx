import React, { useMemo, useState, useEffect } from 'react';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { IntelligenceEngine } from '../../../lib/intelligence/intelligenceEngine';
import { Sparkles, TrendingUp, Zap, Target } from 'lucide-react';
import { NavTab } from './charts/TitleBanner';
import { User } from 'firebase/auth';
import { canAccessFeature, getUserPlan, UserPlan, AccessState } from '../../../lib/featureAccess';
import { PremiumInterestPreview } from './social/PremiumInterestPreview';
import { PremiumInsightsDashboard } from './premium/PremiumInsightsDashboard';

interface BloomInsightsViewProps {
  user: User | null | undefined;
  habits: Habit[];
  logs: HabitLog;
  onNavigateTab: (tab: NavTab) => void;
}

export const BloomInsightsView: React.FC<BloomInsightsViewProps> = ({ user, habits, logs, onNavigateTab }) => {
  const { insights, recommendations, trends } = useMemo(() => {
    const targetDate = new Date();
    return {
      insights: IntelligenceEngine.generateInsights(habits, logs, targetDate),
      recommendations: IntelligenceEngine.generateRecommendations(habits, logs, targetDate),
      trends: IntelligenceEngine.generateTrends(habits, logs, targetDate)
    };
  }, [habits, logs]);

  const [userPlan, setUserPlan] = useState<UserPlan>('FREE');
  
  useEffect(() => {
    getUserPlan(user).then(setUserPlan);
  }, [user]);

  const improvingTrends = trends.filter(t => t.status === 'IMPROVING');
  const decliningTrends = trends.filter(t => t.status === 'DECLINING');

  if (habits.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
        <Sparkles size={32} className="mx-auto text-emerald-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-800">Growth Intelligence</h2>
        <p className="text-slate-600 mt-2">Add some habits and complete them to unlock your personal intelligence engine.</p>
        <button 
          onClick={() => onNavigateTab('dashboard')}
          className="mt-6 px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Zap size={120} />
        </div>
        <h1 className="text-3xl font-black relative z-10 flex items-center gap-3">
          <Sparkles className="text-amber-300" />
          Growth Intelligence
        </h1>
        <p className="mt-2 text-indigo-100 font-medium relative z-10 max-w-lg">
          Your personal habit patterns, decoded. Here is what HabitBloom understands about your progress so far.
        </p>
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <section>
          <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
            <Target className="text-rose-500" />
            Actionable Advice
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {recommendations.map(rec => (
              <div key={rec.id} className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{rec.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => onNavigateTab('dashboard')}
                    className="text-xs font-bold bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-100 transition"
                  >
                    {rec.actionLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Insights Section */}
      <section>
        <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles className="text-emerald-500" />
          Discovered Patterns
        </h2>
        {insights.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 italic">
            Keep building your routine. More history will unlock deeper insights.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {insights.map(insight => (
              <div key={insight.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{insight.icon}</span>
                  <h3 className="font-bold text-slate-900">{insight.title}</h3>
                </div>
                <p className="text-sm text-slate-700 font-medium mb-3">{insight.description}</p>
                <div className="bg-slate-50 text-slate-600 text-[11px] font-mono px-3 py-2 rounded-lg border border-slate-100">
                  Evidence: {insight.evidence}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trends Section */}
      {(improvingTrends.length > 0 || decliningTrends.length > 0) && (
        <section>
          <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-500" />
            Active Trends
          </h2>
          <div className="space-y-3">
            {improvingTrends.map(trend => (
              <div key={trend.id} className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-700 w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm">
                    {trend.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{trend.description}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{trend.evidence}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {decliningTrends.map(trend => (
              <div key={trend.id} className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 text-orange-700 w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm">
                    {trend.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{trend.description}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{trend.evidence}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Phase 12: Premium Validation Wedge */}
      <section className="pt-8">
        {(canAccessFeature(userPlan, 'advanced_insights') === AccessState.EARLY_ACCESS || 
          canAccessFeature(userPlan, 'advanced_insights') === AccessState.PREMIUM) ? (
          <PremiumInsightsDashboard 
            habits={habits}
            logs={logs}
            userId={user?.uid || ''}
          />
        ) : (
          <PremiumInterestPreview 
            user={user}
            featureId="advanced_insights"
            featureName="Advanced Growth Insights"
            description="Go deeper into your habit history, patterns, and long-term progress with AI-powered personalized analysis."
            accessState={canAccessFeature(userPlan, 'advanced_insights')}
          />
        )}
      </section>

    </div>
  );
};
