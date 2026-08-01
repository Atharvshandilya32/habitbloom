import React, { useState } from 'react';
import { Target, Plus, ChevronRight, Calendar } from 'lucide-react';
import { Goal as GoalType } from '../../../lib/habitTypes';

interface GoalsViewProps {
  goals: GoalType[];
  onAddGoal: (goal: GoalType) => void;
  onUpdateGoal: (goalId: string, updates: Partial<GoalType>) => void;
}

export default function GoalsView({ goals, onAddGoal, onUpdateGoal }: GoalsViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState(100);
  const [newMetric, setNewMetric] = useState('days');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAddGoal({
      id: `goal-${Date.now()}`,
      title: newTitle,
      targetCount: newTarget,
      currentProgress: 0,
      metric: newMetric,
      createdAt: new Date().toISOString(),
    });
    setNewTitle('');
    setNewTarget(100);
    setNewMetric('days');
    setIsAdding(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Target size={24} className="text-emerald-500" />
            Macro Goals
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Track long-term objectives linked to your daily habits.
          </p>
        </div>
        
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm"
        >
          <Plus size={18} />
          New Goal
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-top-4">
          <h3 className="font-bold text-slate-800 mb-4">Create a New Goal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="E.g., Read 50 books" 
              className="md:col-span-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
            <input 
              type="number" 
              placeholder="Target Number" 
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              value={newTarget}
              onChange={e => setNewTarget(Number(e.target.value))}
            />
            <input 
              type="text" 
              placeholder="Metric (e.g., books, days, hours)" 
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              value={newMetric}
              onChange={e => setNewMetric(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleAdd}
              className="px-4 py-2 font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors"
            >
              Save Goal
            </button>
          </div>
        </div>
      )}

      {goals.length === 0 && !isAdding ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed">
          <Target size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No goals yet</h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto mt-2">
            Set long-term goals like reading 100 books or working out 200 days this year.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => {
            const pct = Math.min(100, Math.round((goal.currentProgress / goal.targetCount) * 100));
            return (
              <div key={goal.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{goal.title}</h3>
                    <div className="text-sm font-medium text-slate-500 flex items-center gap-1 mt-1">
                      <Target size={14} />
                      {goal.currentProgress} / {goal.targetCount} {goal.metric}
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-600">
                    {pct}%
                  </div>
                </div>
                
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    Started {new Date(goal.createdAt).toLocaleDateString()}
                  </div>
                  <button 
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      onUpdateGoal(goal.id, { currentProgress: goal.currentProgress + 1 });
                    }}
                  >
                    Log Progress
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
