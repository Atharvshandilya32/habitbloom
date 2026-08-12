'use client';

import React, { useMemo, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { NavTab } from './charts/TitleBanner';
import {
  calculateLongestStreakOverall,
  calculateOverallConsistencyScore,
  calculateActiveDaysCount,
  calculatePersonalRecords,
  calculateWeeklyReview,
} from '../../../lib/analyticsUtils';
import { calculateBloomScore } from '../../../lib/bloomScoreUtils';
import HabitGrid, { HabitGridProps } from './habitGrid';
import HabitGardenView from './HabitGardenView';
import BloomScoreModal from './BloomScoreModal';
import {
  Sparkles,
  Flame,
  Plus,
  TrendingUp,
  Target,
  ArrowRight,
  Quote,
  Users,
  Star
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from './ui/Card';
import { Badge } from './ui/Badge';

interface DashboardViewProps extends HabitGridProps {
  user: FirebaseUser | null;
  onNavigateTab: (tab: NavTab) => void;
  onOpenAuthModal?: () => void;
}

const DashboardView = React.memo(function DashboardView({
  user,
  habits,
  logs,
  year,
  month,
  daysInMonth,
  onToggleCell,
  onAddHabit,
  onDeleteHabit,
  onUpdateHabit,
  onNavigateTab,
  onOpenAuthModal,
}: DashboardViewProps) {
  const [isBloomModalOpen, setIsBloomModalOpen] = useState(false);
  const today = new Date();
  const todayDay = today.getDate();

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  // Performance Memoization
  const metrics = useMemo(() => {
    const todayCompletedCount = habits.filter(h => {
      const key = `${h.id}_${currentYear}_${currentMonth}_${todayDay}`;
      return !!logs[key];
    }).length;

    const todayProgressPct = habits.length > 0 ? Math.round((todayCompletedCount / habits.length) * 100) : 0;

    return {
      todayCompletedCount,
      todayProgressPct,
      streak: calculateLongestStreakOverall(habits, logs),
      consistency: calculateOverallConsistencyScore(habits, logs),
      activeDays: calculateActiveDaysCount(logs),
      records: calculatePersonalRecords(habits, logs),
      review: calculateWeeklyReview(habits, logs),
      bloom: calculateBloomScore(habits, logs)
    };
  }, [habits, logs, currentYear, currentMonth, todayDay]);

  const userName = user?.displayName ? user.displayName.split(' ')[0] : 'Blooming Star';

  const logCount = useMemo(() => Object.keys(logs).filter(k => logs[k]).length, [logs]);
  let userStage: 'NEW' | 'ESTABLISHED' | 'LONG_TERM' = 'NEW';
  if (logCount >= 150) userStage = 'LONG_TERM';
  else if (logCount >= 15) userStage = 'ESTABLISHED';

  const GardenSnapshot = (
    <div className="w-full animate-in slide-in-from-bottom-4 duration-700">
      <HabitGardenView 
        habits={habits}
        logs={logs}
        year={year}
        month={month}
        onToggleHabit={onToggleCell}
      />
    </div>
  );

  const MiddleSection = (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Main Tracker */}
      <div className="lg:col-span-8 space-y-6">
        <Card className="p-1">
          <HabitGrid
            habits={habits}
            logs={logs}
            year={year}
            month={month}
            daysInMonth={daysInMonth}
            onToggleCell={onToggleCell}
            onAddHabit={onAddHabit}
            onDeleteHabit={onDeleteHabit}
            onUpdateHabit={onUpdateHabit}
          />
        </Card>
      </div>

      {/* Right Sidebar (Motivation, Space Activity) */}
      <div className="lg:col-span-4 space-y-6">
        
        {userStage !== 'NEW' && (
          <Card className="bg-gradient-to-br from-teal-50/50 to-emerald-50/50 border-teal-100 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Quote size={16} className="text-teal-600" /> Daily Motivation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-teal-800/80 font-medium italic leading-relaxed">
                &quot;Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.&quot;
              </p>
            </CardContent>
          </Card>
        )}

        {userStage !== 'NEW' && (
          <Card className="bg-white/80 backdrop-blur-sm border-emerald-50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Users size={16} className="text-emerald-500" /> Space Activity
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">Live</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 py-4 text-center">
                <p className="text-sm text-slate-500">No recent activity.</p>
                <p className="text-xs text-slate-400">Join a space to see what others are up to.</p>
              </div>
              <Button variant="outline" className="w-full text-xs" onClick={() => onNavigateTab('spaces')}>
                Go to Spaces <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* ─────────────────────────────────────────────────────────────
          GUEST CALL TO ACTION
      ───────────────────────────────────────────────────────────── */}
      {!user && logCount > 0 && onOpenAuthModal && (
        <div className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-900/10 animate-in slide-in-from-top-4 duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
              <Sparkles className="text-yellow-300" />
              Your progress is ready.
            </h2>
            <p className="text-emerald-50 font-medium mt-2 max-w-xl text-sm md:text-base">
              You&apos;re doing great! Create a free account to save your habits securely to the cloud, unlock Spaces, and sync across all your devices.
            </p>
          </div>
          
          <button 
            onClick={onOpenAuthModal}
            className="relative z-10 w-full md:w-auto shrink-0 bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-black px-6 py-3 rounded-2xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Save My Progress <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. TOP COMMAND HUB (Welcome, Streak, Bloom Score)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Welcome & Today's Progress Card */}
        <Card className="lg:col-span-8 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 relative overflow-hidden flex flex-col justify-between border-emerald-100 bg-white/80 backdrop-blur-md">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
          
          <CardHeader className="relative z-10 pb-0">
            <div className="flex items-center justify-between">
              <Badge variant="glass" className="text-emerald-700 border-emerald-200 bg-white/50 backdrop-blur-sm">
                <Sparkles size={14} className="mr-1.5" />
                Daily Overview
              </Badge>
              <Button onClick={onAddHabit} size="sm" className="font-extrabold bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-105 transition-all duration-300">
                <Plus size={16} className="mr-1.5" /> Quick Add
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10 mt-4 space-y-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground">
                Welcome back, <span className="text-emerald-600">{userName}</span>! 👋
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xl leading-relaxed">
                You&apos;ve completed <span className="font-bold text-emerald-600">{metrics.todayCompletedCount} of {habits.length}</span> habits today. Keep your momentum going!
              </p>
            </div>

            <div className="pt-4 border-t border-emerald-100/50 space-y-3">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Target size={16} className="text-emerald-500" />
                  Today&apos;s Focus Rate
                </span>
                <span className="text-emerald-600 font-extrabold">{metrics.todayProgressPct}%</span>
              </div>
              <div className="w-full h-3 bg-emerald-100/50 rounded-full overflow-hidden p-0.5 border border-emerald-100">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.todayProgressPct}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level & Bloom Score Card */}
        <Card 
          onClick={() => setIsBloomModalOpen(true)}
          className="lg:col-span-4 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-300 transition-colors bg-white/80 backdrop-blur-sm border-emerald-50 cursor-pointer"
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="font-bold uppercase tracking-wider text-emerald-700/70">Bloom Score</CardDescription>
              <div className={`p-2 rounded-xl bg-emerald-100 text-emerald-600`}>
                <Star size={20} />
              </div>
            </div>
            <CardTitle className="text-4xl font-black mt-2">{metrics.bloom.totalBloomScore}</CardTitle>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-1">
              {metrics.bloom.tier.emoji} {metrics.bloom.tier.name} Tier
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Progress to Next Tier</span>
                <span>{metrics.bloom.progressToNextTier}%</span>
              </div>
              <div className="w-full h-2 bg-emerald-100/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.bloom.progressToNextTier}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-right">{metrics.bloom.pointsToNextTier} pts remaining</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
               <div className="bg-muted p-2.5 rounded-xl border border-border">
                 <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                   <Flame size={12} className="text-orange-500" /> Streak
                 </div>
                 <div className="text-lg font-black text-foreground">{metrics.streak} <span className="text-[10px] font-normal text-muted-foreground">days</span></div>
               </div>
               <div className="bg-muted p-2.5 rounded-xl border border-border">
                 <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                   <TrendingUp size={12} className="text-purple-500" /> Cons.
                 </div>
                 <div className="text-lg font-black text-foreground">{metrics.consistency}%</div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BloomScoreModal 
        isOpen={isBloomModalOpen} 
        onClose={() => setIsBloomModalOpen(false)} 
        breakdown={metrics.bloom} 
      />

      {/* ─────────────────────────────────────────────────────────────
          2 & 3. DYNAMIC ORDERING (Middle Section & Garden)
      ───────────────────────────────────────────────────────────── */}
      {userStage === 'LONG_TERM' ? (
        <>
          {GardenSnapshot}
          {MiddleSection}
        </>
      ) : (
        <>
          {MiddleSection}
          {GardenSnapshot}
        </>
      )}

    </div>
  );
});

export default DashboardView;
