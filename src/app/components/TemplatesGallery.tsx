import React from 'react';
import { LayoutTemplate, PlusCircle } from 'lucide-react';
import { HabitTemplate, Habit } from '../../../lib/habitTypes';

interface TemplatesGalleryProps {
  onApplyTemplate: (template: HabitTemplate) => void;
}

const TEMPLATES: HabitTemplate[] = [
  {
    id: 't-morning',
    name: 'Morning Routine',
    description: 'Start your day right with these essential morning habits.',
    emoji: '🌅',
    habits: [
      { name: 'Wake up early', emoji: '⏰', category: '🎯 Personal Growth' },
      { name: 'Make the bed', emoji: '🛏️', category: '🎯 Personal Growth' },
      { name: 'Drink water', emoji: '💧', category: '🏃 Fitness' },
      { name: 'Meditation', emoji: '🧘', category: '🧠 Mental Health' }
    ]
  },
  {
    id: 't-student',
    name: 'Student Productivity',
    description: 'Stay on top of classes and assignments.',
    emoji: '🎓',
    habits: [
      { name: 'Study 2 hours', emoji: '📖', category: '📚 Learning' },
      { name: 'Review notes', emoji: '📝', category: '📚 Learning' },
      { name: 'Sleep 8 hours', emoji: '😴', category: '🧠 Mental Health' }
    ]
  },
  {
    id: 't-fitness',
    name: 'Fitness & Health',
    description: 'Build a stronger, healthier body.',
    emoji: '💪',
    habits: [
      { name: 'Workout', emoji: '🏋️', category: '🏃 Fitness' },
      { name: '10k Steps', emoji: '🚶', category: '🏃 Fitness' },
      { name: 'Eat vegetables', emoji: '🥗', category: '🏃 Fitness' }
    ]
  },
  {
    id: 't-deepwork',
    name: 'Deep Work',
    description: 'Focus on high-value tasks without distractions.',
    emoji: '🧠',
    habits: [
      { name: '2 hours Deep Work', emoji: '💻', category: '💼 Career' },
      { name: 'No social media', emoji: '📱', category: '🧠 Mental Health' },
      { name: 'Plan tomorrow', emoji: '📅', category: '💼 Career' }
    ]
  }
];

export default function TemplatesGallery({ onApplyTemplate }: TemplatesGalleryProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center space-y-3 mb-10">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LayoutTemplate size={32} />
        </div>
        <h2 className="text-3xl font-black text-slate-800">Habit Templates</h2>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">
          Kickstart your journey with curated habit bundles. Add a complete routine with one click.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEMPLATES.map(template => (
          <div key={template.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl bg-slate-50 w-16 h-16 flex items-center justify-center rounded-2xl">
                  {template.emoji}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{template.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{template.description}</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 space-y-2 mb-6">
              {template.habits.map((habit, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl text-sm font-semibold text-slate-700">
                  <span>{habit.emoji}</span>
                  <span>{habit.name}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => onApplyTemplate(template)}
              className="relative z-10 w-full py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-colors"
            >
              <PlusCircle size={18} />
              Add {template.habits.length} Habits
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
