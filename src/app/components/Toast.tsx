import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl shadow-slate-900/20 border border-slate-700/50">
        <div className="bg-emerald-500/20 text-emerald-400 rounded-full p-1">
          <CheckCircle2 size={18} />
        </div>
        <span className="text-sm font-medium pr-2">{message}</span>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
