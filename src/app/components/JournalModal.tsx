import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Habit, JournalEntry, MoodType } from '../../../lib/habitTypes';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit?: Habit;
  dateStr: string; // YYYY-MM-DD
  existingEntry?: JournalEntry;
  onSave: (entry: JournalEntry) => void;
}

const MOODS: { type: MoodType; emoji: string; label: string }[] = [
  { type: '😁 Excellent', emoji: '😁', label: 'Excellent' },
  { type: '😊 Good', emoji: '😊', label: 'Good' },
  { type: '😐 Okay', emoji: '😐', label: 'Okay' },
  { type: '😔 Bad', emoji: '😔', label: 'Bad' },
  { type: '😴 Tired', emoji: '😴', label: 'Tired' },
];

export default function JournalModal({
  isOpen,
  onClose,
  habit,
  dateStr,
  existingEntry,
  onSave
}: JournalModalProps) {
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<MoodType | undefined>(undefined);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [wins, setWins] = useState('');
  const [challenges, setChallenges] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (existingEntry) {
        setNotes(existingEntry.notes || '');
        setMood(existingEntry.mood);
        setEnergyLevel(existingEntry.energyLevel || 3);
        setWins(existingEntry.wins || '');
        setChallenges(existingEntry.challenges || '');
      } else {
        setNotes('');
        setMood(undefined);
        setEnergyLevel(3);
        setWins('');
        setChallenges('');
      }
    }
  }, [isOpen, existingEntry]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      id: existingEntry?.id || `journal-${Date.now()}`,
      habitId: habit?.id,
      date: dateStr,
      notes,
      mood,
      energyLevel,
      wins,
      challenges,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {habit ? `${habit.emoji} ${habit.name} Journal` : 'Daily Journal'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Mood Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">How are you feeling?</label>
            <div className="flex items-center justify-between gap-2">
              {MOODS.map(m => (
                <button
                  key={m.type}
                  onClick={() => setMood(m.type)}
                  className={`flex flex-col items-center p-3 rounded-2xl flex-1 transition-all ${
                    mood === m.type 
                      ? 'bg-emerald-50 border-2 border-emerald-500 shadow-sm' 
                      : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100 opacity-60 hover:opacity-100'
                  }`}
                >
                  <span className="text-3xl mb-1">{m.emoji}</span>
                  <span className="text-xs font-medium text-slate-600">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div className="space-y-3">
            <label className="flex justify-between text-sm font-semibold text-slate-700">
              <span>Energy Level</span>
              <span className="text-emerald-600">{energyLevel} / 5</span>
            </label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={energyLevel}
              onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">Notes & Reflections</label>
            <textarea
              className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
              placeholder="How did it go? Any thoughts?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Wins & Challenges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">Wins</label>
              <input
                type="text"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                placeholder="Small victories..."
                value={wins}
                onChange={(e) => setWins(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">Challenges</label>
              <input
                type="text"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                placeholder="Obstacles faced..."
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
          >
            <Save size={16} />
            Save Journal
          </button>
        </div>
      </div>
    </div>
  );
}
