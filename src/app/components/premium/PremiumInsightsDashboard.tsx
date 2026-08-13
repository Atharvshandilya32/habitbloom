import React, { useMemo, useState, useEffect } from 'react';
import { Habit, HabitLog } from '../../../../lib/habitTypes';
import { IntelligenceEngine } from '../../../../lib/intelligence/intelligenceEngine';
import { Sparkles, TrendingUp, TrendingDown, Target, BarChart2, Star, Trophy } from 'lucide-react';
import { logInfo } from '../../../../lib/logger';

interface PremiumInsightsDashboardProps {
  habits: Habit[];
  logs: HabitLog;
  userId: string;
}

export const PremiumInsightsDashboard: React.FC<PremiumInsightsDashboardProps> = ({ habits, logs, userId }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30); // 14, 30, 60, 90
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (userId) {
      logInfo('premium_feature_opened', { userId, feature: 'advanced_insights' });
    }
  }, [userId]);

  // Re-calculate when habits, logs, or period changes
  const { trends, patterns } = useMemo(() => {
    const targetDate = new Date();
    // Only generate trends for the selected period to save computation on render
    const allTrends = IntelligenceEngine.generateTrends(habits, logs, targetDate, [selectedPeriod]);
    
    // Patterns usually rely on all-time or fixed periods, but we get them here
    // In our deterministic engine, generateInsights returns patterns as part of insights
    const insights = IntelligenceEngine.generateInsights(habits, logs, targetDate);
    
    return {
      trends: allTrends,
      patterns: insights.filter(i => i.type === 'PERFORMANCE' || i.type === 'RECORD')
    };
  }, [habits, logs, selectedPeriod]);

  // Handle feedback
  const handleFeedback = (rating: string) => {
    if (feedbackSubmitted) return;
    setFeedbackSubmitted(true);
    logInfo('premium_feedback_submitted', { 
      userId, 
      feature: 'advanced_insights', 
      rating 
    });
  };

  const improving = trends.filter(t => t.status === 'IMPROVING');
  const declining = trends.filter(t => t.status === 'DECLINING');
  
  // Calculate average consistency for overview
  let totalConsistency = 0;
  let count = 0;
  let totalAbsoluteChange = 0;

  trends.forEach(t => {
    if (t.currentValue !== undefined && t.absoluteChange !== undefined) {
      totalConsistency += t.currentValue;
      totalAbsoluteChange += t.absoluteChange;
      count++;
    }
  });

  const avgConsistency = count > 0 ? Math.round(totalConsistency / count) : 0;
  const avgChange = count > 0 ? Math.round(totalAbsoluteChange / count) : 0;

  if (habits.length === 0) {
    return (
      <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-center">
        <Sparkles size={32} className="mx-auto text-emerald-500 mb-4" />
        <h2 className="text-xl font-black text-slate-800">More history is needed</h2>
        <p className="text-slate-600 mt-2">Keep using HabitBloom to unlock longer-term growth analysis.</p>
      </div>
    );
  }

  // Determine if we have enough data to show insights
  const hasInsufficientData = trends.every(t => t.status === 'INSUFFICIENT_DATA') && patterns.length === 0;

  if (hasInsufficientData) {
    return (
      <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <BarChart2 size={120} />
        </div>
        <Sparkles size={32} className="mx-auto text-emerald-500 mb-4 relative z-10" />
        <h2 className="text-xl font-black text-slate-800 relative z-10">Your deeper growth story is still developing.</h2>
        <p className="text-slate-600 mt-2 relative z-10">Keep using HabitBloom to unlock longer-term trend analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-widest mb-2 border border-emerald-200 shadow-sm">
        <Sparkles size={12} />
        Early Access
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <BarChart2 className="text-emerald-500" />
          Advanced Growth Insights
        </h2>
        
        <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200/50">
          {[14, 30, 60, 90].map(days => (
            <button
              key={days}
              onClick={() => setSelectedPeriod(days)}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${
                selectedPeriod === days 
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      {/* Growth Overview */}
      <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
        <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-2">Growth Overview</h3>
        {count > 0 ? (
          <p className="text-lg text-emerald-900 font-medium">
            Your average consistency is <strong>{avgConsistency}%</strong> over the last {selectedPeriod} days. 
            {avgChange > 0 
              ? ` This is an average improvement of ${avgChange} percentage points from the previous period. Great momentum!`
              : avgChange < 0
              ? ` This is a dip of ${Math.abs(avgChange)} percentage points from the previous period.`
              : ' You are maintaining a highly stable routine.'}
          </p>
        ) : (
          <p className="text-lg text-emerald-900 font-medium">
            Not enough data yet for an overview of this period.
          </p>
        )}
      </div>

      {/* Habit Trends */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <Target className="text-blue-500" size={20} />
          {selectedPeriod}-Day Habit Trends
        </h3>
        
        {improving.length > 0 && (
          <div className="space-y-3">
            {improving.map(trend => (
              <div key={trend.id} className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition">
                <div className="bg-emerald-100 text-emerald-700 w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{trend.description}</h4>
                  <p className="text-sm text-slate-600 mt-1">{trend.evidence}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {declining.length > 0 && (
          <div className="space-y-3">
            {declining.map(trend => (
              <div key={trend.id} className="bg-rose-50/50 border border-rose-100 p-4 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition">
                <div className="bg-rose-100 text-rose-700 w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0">
                  <TrendingDown size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{trend.description}</h4>
                  <p className="text-sm text-slate-600 mt-1">{trend.evidence}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {improving.length === 0 && declining.length === 0 && count > 0 && (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center text-slate-600 shadow-sm">
            Your habits have been stable over this period.
          </div>
        )}
      </div>

      {/* Long-Term Patterns */}
      {patterns.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Trophy className="text-amber-500" size={20} />
            Historical Patterns
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {patterns.map(pattern => (
              <div key={pattern.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{pattern.icon}</span>
                  <h4 className="font-bold text-slate-900">{pattern.title}</h4>
                </div>
                <p className="text-sm text-slate-700 mb-3">{pattern.description}</p>
                <div className="bg-slate-50 text-slate-600 text-xs font-mono px-3 py-2 rounded-lg border border-slate-100">
                  {pattern.evidence}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Mechanism */}
      <div className="mt-8 pt-8 border-t border-slate-100">
        {!feedbackSubmitted ? (
          <div className="flex flex-col items-center">
            <p className="text-sm font-bold text-slate-500 mb-4">How useful was this insight?</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button 
                onClick={() => handleFeedback('Very useful')}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-200 hover:bg-emerald-100 hover:scale-105 transition-all shadow-sm"
              >
                Very useful
              </button>
              <button 
                onClick={() => handleFeedback('Useful')}
                className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-100 hover:scale-105 transition-all shadow-sm"
              >
                Useful
              </button>
              <button 
                onClick={() => handleFeedback('Not useful')}
                className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-100 hover:scale-105 transition-all shadow-sm"
              >
                Not useful
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-emerald-600 text-sm font-bold flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Star size={16} className="fill-emerald-600" />
            Thank you for your feedback!
          </div>
        )}
      </div>
    </div>
  );
};
