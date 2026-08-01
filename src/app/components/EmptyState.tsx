'use client';

import React from 'react';
import { Sparkles, Plus, Search, BarChart3, Calendar } from 'lucide-react';

interface EmptyStateProps {
  type?: 'habits' | 'search' | 'analytics' | 'review' | 'general';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  type = 'habits',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const getDefaultContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: <Search className="w-8 h-8 text-slate-400" />,
          title: title || 'No habits found',
          description: description || 'No habits match your current search or category filter. Try clearing your filters.',
          actionLabel: actionLabel || 'Clear Search',
        };
      case 'analytics':
        return {
          icon: <BarChart3 className="w-8 h-8 text-emerald-500" />,
          title: title || 'No analytics data yet',
          description: description || 'Start checking off habits to populate your heatmap, trends, and consistency graphs.',
          actionLabel: actionLabel || 'Add Your First Habit',
        };
      case 'review':
        return {
          icon: <Calendar className="w-8 h-8 text-teal-500" />,
          title: title || 'Weekly review pending',
          description: description || 'Track your habits throughout the week to generate automated productivity summaries.',
          actionLabel: actionLabel || 'Go to Dashboard',
        };
      case 'habits':
      default:
        return {
          icon: <Sparkles className="w-8 h-8 text-emerald-500" />,
          title: title || 'No habits created yet',
          description: description || 'Build powerful daily routines. Add your first habit to start blooming today.',
          actionLabel: actionLabel || 'Create First Habit',
        };
    }
  };

  const content = getDefaultContent();

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 my-4 shadow-inner transition-all hover:bg-slate-50/80">
      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4 transform hover:scale-105 transition-transform duration-300">
        {content.icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">{content.title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        {content.description}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm hover:shadow transition-all duration-200"
        >
          <Plus size={15} />
          {content.actionLabel}
        </button>
      )}
    </div>
  );
}
