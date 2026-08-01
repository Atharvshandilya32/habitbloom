import React from 'react';
import { Clock, CheckCircle2, MessageSquare, Target } from 'lucide-react';
import { JournalEntry, Habit } from '../../../lib/habitTypes';

interface TimelineEvent {
  id: string;
  type: 'journal' | 'habit_completion' | 'goal_reached' | 'challenge_update';
  title: string;
  description?: string;
  timestamp: Date;
  icon: React.ReactNode;
  colorClass: string;
}

interface TimelineViewProps {
  journals: JournalEntry[];
  habits: Habit[];
  // we could pass logs or goals here to construct a full timeline, but for simplicity let's stick to journals
}

export default function TimelineView({ journals, habits }: TimelineViewProps) {
  
  // Construct timeline events from journals
  const events: TimelineEvent[] = journals.map(j => {
    const habit = habits.find(h => h.id === j.habitId);
    return {
      id: j.id,
      type: 'journal',
      title: habit ? `Journaled about ${habit.name}` : 'Daily Journal Entry',
      description: j.notes || (j.mood ? `Felt ${j.mood}` : undefined),
      timestamp: new Date(j.date), // In a real app we'd use exact timestamps
      icon: <MessageSquare size={16} />,
      colorClass: 'bg-blue-500 text-white',
    };
  });

  // Sort descending
  events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Clock size={24} className="text-blue-500" />
          Activity Timeline
        </h2>
        <p className="text-slate-500 text-sm font-medium mt-1">
          A chronological history of your journals, completed habits, and milestones.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200">
        {events.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
            <Clock size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Your timeline is empty.</p>
            <p className="text-slate-400 text-sm mt-1">Complete habits and add journals to see them here.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
            {events.map((event, index) => (
              <div key={event.id} className="relative pl-8">
                {/* Timeline Dot */}
                <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${event.colorClass}`}>
                  {event.icon}
                </div>
                
                {/* Content */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800">{event.title}</h3>
                    <span className="text-xs font-semibold text-slate-400">
                      {event.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                  {/* Additional Journal Details can go here */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
