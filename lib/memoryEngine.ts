import { Habit, HabitLog, JournalEntry } from './habitTypes';
import { calculateTotalXp, getLevelFromXp } from './xpEngine';

export interface ChronicleEvent {
  id: string;
  type: 'milestone' | 'memory' | 'journal' | 'creation';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  colorClass: string;
}

function parseLogKeyDate(key: string): Date | null {
  const parts = key.split('_');
  if (parts.length >= 4) {
    const year = parseInt(parts[parts.length - 3]);
    const month = parseInt(parts[parts.length - 2]);
    const day = parseInt(parts[parts.length - 1]);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month - 1, day);
    }
  }
  return null;
}

export function generateChronicleEvents(habits: Habit[], logs: HabitLog, journals: JournalEntry[]): ChronicleEvent[] {
  const events: ChronicleEvent[] = [];
  const logKeys = Object.keys(logs).filter(k => logs[k] === true);
  
  // 1. Add Journal Events
  journals.forEach(j => {
    events.push({
      id: j.id,
      type: 'journal',
      title: 'A Moment of Reflection',
      description: j.notes || (j.mood ? `You noted feeling ${j.mood}.` : 'You wrote a journal entry.'),
      timestamp: new Date(j.date),
      icon: '📖',
      colorClass: 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-indigo-100/50'
    });
  });

  if (logKeys.length === 0 && journals.length === 0 && habits.length === 0) {
    return events;
  }

  // 1.5 Add Habit Creation Event
  const sortedHabits = [...habits].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeA - timeB;
  });

  if (sortedHabits.length > 0 && sortedHabits[0].createdAt) {
    events.push({
      id: 'first-habit',
      type: 'creation',
      title: 'First Habit Created',
      description: `You created your first habit: ${sortedHabits[0].name}.`,
      timestamp: new Date(sortedHabits[0].createdAt),
      icon: '✨',
      colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-100/50'
    });
  }

  // 2. Discover Firsts from Logs
  const logDates = logKeys.map(k => ({ key: k, date: parseLogKeyDate(k) })).filter(item => item.date !== null) as { key: string, date: Date }[];
  
  logDates.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  if (logDates.length > 0) {
    const firstLog = logDates[0];
    events.push({
      id: 'first-log',
      type: 'creation',
      title: 'The First Seed Planted',
      description: 'You took your first step and logged a habit. The journey began.',
      timestamp: firstLog.date,
      icon: '🌱',
      colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-100/50'
    });
    
    // Check milestones based on total logs completed chronologically
    let cumulative = 0;
    for (let i = 0; i < logDates.length; i++) {
      cumulative++;
      if (cumulative === 10) {
        events.push({
          id: 'milestone-10',
          type: 'milestone',
          title: 'Taking Root',
          description: 'You completed 10 habits. Consistency is starting to build.',
          timestamp: logDates[i].date,
          icon: '🌿',
          colorClass: 'bg-teal-50 text-teal-600 border-teal-200 shadow-teal-100/50'
        });
      }
      if (cumulative === 50) {
        events.push({
          id: 'milestone-50',
          type: 'milestone',
          title: 'A Flourishing Garden',
          description: '50 habits completed. You are cultivating a new lifestyle.',
          timestamp: logDates[i].date,
          icon: '🌸',
          colorClass: 'bg-pink-50 text-pink-600 border-pink-200 shadow-pink-100/50'
        });
      }
      if (cumulative === 100) {
        events.push({
          id: 'milestone-100',
          type: 'milestone',
          title: 'A Centurion of Growth',
          description: '100 habits completed! An incredible testament to your dedication.',
          timestamp: logDates[i].date,
          icon: '🌳',
          colorClass: 'bg-amber-50 text-amber-600 border-amber-200 shadow-amber-100/50'
        });
      }
    }
  }

  // 3. Add Memory Events (Anniversaries)
  const now = new Date();
  if (logDates.length > 0) {
    const firstLogDate = logDates[0].date;
    const diffTime = Math.abs(now.getTime() - firstLogDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays >= 365) {
      events.push({
        id: 'memory-1year',
        type: 'memory',
        title: 'One Year of Growth',
        description: 'Today marks one year since you planted your first habit.',
        timestamp: now,
        icon: '✨',
        colorClass: 'bg-gradient-to-br from-amber-200 to-yellow-400 text-amber-900 border-amber-300 shadow-amber-200/50'
      });
    } else if (diffDays >= 30 && diffDays < 32) { // show around 1 month
      events.push({
        id: 'memory-1month',
        type: 'memory',
        title: 'One Month Milestone',
        description: 'You have been nurturing your garden for a month.',
        timestamp: now,
        icon: '🌙',
        colorClass: 'bg-slate-50 text-slate-700 border-slate-200 shadow-slate-100/50'
      });
    }
  }

  // 4. Add XP & Level Milestones (Using latest log date as milestone date)
  const totalXp = calculateTotalXp(habits, logs);
  const currentLevel = getLevelFromXp(totalXp);
  const latestLogDate = logDates.length > 0 ? logDates[logDates.length - 1].date : now;

  if (totalXp >= 100) {
    events.push({
      id: 'xp-100', type: 'milestone', title: '100 XP Reached',
      description: 'You earned your first 100 Experience Points.', timestamp: latestLogDate, icon: '🌟',
      colorClass: 'bg-yellow-50 text-yellow-600 border-yellow-200 shadow-yellow-100/50'
    });
  }
  if (totalXp >= 500) {
    events.push({
      id: 'xp-500', type: 'milestone', title: '500 XP Milestone',
      description: 'Halfway to a thousand! Incredible momentum.', timestamp: latestLogDate, icon: '🔥',
      colorClass: 'bg-orange-50 text-orange-600 border-orange-200 shadow-orange-100/50'
    });
  }
  if (totalXp >= 1000) {
    events.push({
      id: 'xp-1000', type: 'milestone', title: '1K XP Achieved',
      description: 'You have amassed 1,000 XP. A true HabitBloom master.', timestamp: latestLogDate, icon: '👑',
      colorClass: 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-indigo-100/50'
    });
  }
  if (currentLevel >= 5) {
    events.push({
      id: 'level-5', type: 'milestone', title: 'Level 5 Unlocked',
      description: 'Your dedication is blooming.', timestamp: latestLogDate, icon: '🌿',
      colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-100/50'
    });
  }
  if (currentLevel >= 10) {
    events.push({
      id: 'level-10', type: 'milestone', title: 'Level 10 Achieved',
      description: 'Double digits! You are in the top tier of consistency.', timestamp: latestLogDate, icon: '🌸',
      colorClass: 'bg-pink-50 text-pink-600 border-pink-200 shadow-pink-100/50'
    });
  }

  // Sort descending
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
