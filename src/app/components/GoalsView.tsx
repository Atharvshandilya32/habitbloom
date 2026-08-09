import React, { useState } from 'react';
import { Target, Plus, ChevronRight, Calendar, Flag, Trophy, CheckCircle2 } from 'lucide-react';
import { Goal as GoalType, Habit, HabitLog } from '../../../lib/habitTypes';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from './ui/Card';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';

interface GoalsViewProps {
  goals: GoalType[];
  habits: Habit[];
  logs: HabitLog;
  onAddGoal: (goal: GoalType) => void;
  onUpdateGoal: (goalId: string, updates: Partial<GoalType>) => void;
}

export default function GoalsView({ goals, habits, logs, onAddGoal, onUpdateGoal }: GoalsViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState(100);
  const [newMetric, setNewMetric] = useState('completions');
  const [newLinkedHabitId, setNewLinkedHabitId] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleAdd = () => {
    if (!newTitle.trim() || !newLinkedHabitId) return;
    onAddGoal({
      id: `goal-${Date.now()}`,
      title: newTitle,
      targetCount: newTarget,
      currentProgress: 0,
      metric: newMetric,
      linkedHabitIds: [newLinkedHabitId],
      createdAt: new Date().toISOString(),
    });
    setNewTitle('');
    setNewTarget(100);
    setNewMetric('completions');
    setNewLinkedHabitId('');
    setIsAdding(false);
  };

  const getGoalProgress = (goal: GoalType) => {
    if (!goal.linkedHabitIds || goal.linkedHabitIds.length === 0) return goal.currentProgress || 0;
    const linkedId = goal.linkedHabitIds[0];
    const count = Object.keys(logs).filter(k => k.startsWith(linkedId + '_') && logs[k] === true).length;
    return count;
  };

  const filteredGoals = goals.filter(goal => {
    const progress = getGoalProgress(goal);
    const isCompleted = progress >= goal.targetCount;
    if (filter === 'active') return !isCompleted;
    if (filter === 'completed') return isCompleted;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & CONTROLS
      ───────────────────────────────────────────────────────────── */}
      <Card className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border border-emerald-100 bg-white/80 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <Badge variant="glass" className="mb-2 text-emerald-700 border-emerald-200 bg-white/50 backdrop-blur-sm">
              <Target size={14} className="mr-1.5" />
              Unified Goals Hub
            </Badge>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Macro Goals</h1>
            <p className="text-sm font-medium text-muted-foreground mt-1 max-w-lg">
              Set long-term objectives and track your progress across multiple habits. Your overarching North Stars.
            </p>
          </div>
          <Button onClick={() => setIsAdding(!isAdding)} className="font-extrabold shadow-sm bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-105 transition-all duration-300">
            {isAdding ? 'Cancel' : <><Plus size={18} className="mr-1.5" /> New Goal</>}
          </Button>
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────────────────────────
          2. NEW GOAL FORM
      ───────────────────────────────────────────────────────────── */}
      {isAdding && (
        <Card className="animate-in slide-in-from-top-4 duration-300 border-emerald-200 bg-white/90 backdrop-blur-md shadow-md">
          <CardHeader>
            <CardTitle>Create a New Macro Goal</CardTitle>
            <CardDescription>Define the target metric you want to achieve.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Goal Title</label>
                <Input 
                  type="text" 
                  placeholder="E.g., Read 50 books this year" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Target Number</label>
                <Input 
                  type="number" 
                  placeholder="100" 
                  value={newTarget}
                  onChange={e => setNewTarget(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Metric Name</label>
                <Input 
                  type="text" 
                  placeholder="times, books, hours" 
                  value={newMetric}
                  onChange={e => setNewMetric(e.target.value)}
                />
              </div>
              <div className="md:col-span-4">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Linked Habit</label>
                <select 
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={newLinkedHabitId}
                  onChange={e => setNewLinkedHabitId(e.target.value)}
                >
                  <option value="" disabled>Select a habit to track this goal automatically</option>
                  {habits.map(h => (
                    <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-border bg-muted/50 py-4">
            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button variant="default" onClick={handleAdd}>Save Goal</Button>
          </CardFooter>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. GOALS LIST
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-2">
          <Button variant={filter === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('all')}>All Goals</Button>
          <Button variant={filter === 'active' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('active')}>Active</Button>
          <Button variant={filter === 'completed' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('completed')}>Completed</Button>
        </div>

        {goals.length === 0 && !isAdding ? (
          <div className="text-center py-20 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-3xl border border-emerald-100 border-dashed flex flex-col items-center bg-white/80 backdrop-blur-sm">
            <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">No macro goals defined yet</h3>
            <p className="text-slate-600 font-medium max-w-md mx-auto mt-2 text-sm">
              Set long-term goals like reading 100 books or working out 200 days this year. HabitBloom will track them automatically based on your daily habits.
            </p>
            <Button onClick={() => setIsAdding(true)} className="mt-6 font-extrabold shadow-sm bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-105 transition-all duration-300">
              Create First Goal
            </Button>
          </div>
        ) : filteredGoals.length === 0 ? (
           <div className="text-center py-12 text-muted-foreground">No goals match the selected filter.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGoals.map(goal => {
              const currentProgress = getGoalProgress(goal);
              const pct = Math.min(100, Math.round((currentProgress / goal.targetCount) * 100));
              const isCompleted = pct >= 100;
              const linkedHabit = habits.find(h => goal.linkedHabitIds?.includes(h.id));

              return (
                <Card key={goal.id} className={`group transition-all hover:shadow-md bg-white/80 backdrop-blur-sm border-emerald-50 hover:border-emerald-200 ${isCompleted ? 'border-emerald-300 bg-emerald-50/30' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        {isCompleted && (
                          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white mb-2 shadow-sm">
                            <Trophy size={12} className="mr-1" /> Goal Reached
                          </Badge>
                        )}
                        <h3 className="font-bold text-xl text-slate-800 leading-tight pr-4">{goal.title}</h3>
                        <div className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                          <Target size={14} />
                          {currentProgress} / {goal.targetCount} {goal.metric}
                        </div>
                        {linkedHabit && (
                          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-1">
                            Tracking from: {linkedHabit.emoji} {linkedHabit.name}
                          </div>
                        )}
                      </div>
                      <div className={`text-3xl font-black ${isCompleted ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {pct}%
                      </div>
                    </div>
                    
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-6 p-0.5 border border-slate-200/50">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-700'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar size={13} />
                        Started {new Date(goal.createdAt).toLocaleDateString()}
                      </div>
                      
                      {isCompleted && (
                        <div className="text-emerald-600 flex items-center gap-1 text-xs font-bold">
                          <CheckCircle2 size={14} /> Completed
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
