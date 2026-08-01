import React, { useState } from 'react';
import { MessageSquare, Bug, Lightbulb, X, Send } from 'lucide-react';

interface BetaFeedbackProps {
  onClose: () => void;
  onSubmit: (type: string, message: string) => void;
}

export default function BetaFeedback({ onClose, onSubmit }: BetaFeedbackProps) {
  const [type, setType] = useState('feedback');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!message.trim()) return;
    onSubmit(type, message);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-80 bg-slate-900 text-white rounded-2xl p-6 shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-8">
        <h4 className="font-bold mb-2 text-emerald-400">Thank you!</h4>
        <p className="text-sm font-medium text-slate-300">Your feedback helps us make HabitBloom better for everyone.</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-8">
      <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2">
          <MessageSquare size={16} className="text-indigo-400" />
          Beta Feedback
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-5">
        <div className="flex gap-2 mb-4 p-1 bg-slate-100 rounded-xl">
          <button 
            onClick={() => setType('feedback')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${type === 'feedback' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <MessageSquare size={14} /> General
          </button>
          <button 
            onClick={() => setType('bug')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${type === 'bug' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Bug size={14} /> Bug
          </button>
          <button 
            onClick={() => setType('feature')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${type === 'feature' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Lightbulb size={14} /> Idea
          </button>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={type === 'bug' ? 'What went wrong?' : type === 'feature' ? 'What should we build next?' : 'How can we improve?'}
          rows={4}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium resize-none mb-4"
        />

        <button 
          onClick={handleSubmit}
          disabled={!message.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Send size={16} /> Submit Feedback
        </button>
      </div>
    </div>
  );
}
