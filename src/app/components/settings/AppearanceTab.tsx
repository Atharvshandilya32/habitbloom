import React from 'react';
import { useTheme } from '../ThemeProvider';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AppearanceTab() {
  const { themeMode, setThemeMode } = useTheme();

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Appearance & Styling</h2>

        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-700 block">Theme Mode</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setThemeMode('light')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-xs font-bold transition-all ${
                themeMode === 'light'
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-500/20'
                  : 'border-emerald-100 text-slate-700 hover:bg-emerald-50/50 hover:border-emerald-300'
              }`}
            >
              <Sun size={20} className="text-amber-500" />
              <span>Light Mode</span>
            </button>

            <button
              onClick={() => {
                setThemeMode('dark');
                toast.info('Dark mode preset selected');
              }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-xs font-bold transition-all ${
                themeMode === 'dark'
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-500/20'
                  : 'border-emerald-100 text-slate-700 hover:bg-emerald-50/50 hover:border-emerald-300'
              }`}
            >
              <Moon size={20} className="text-indigo-500" />
              <span>Dark Mode</span>
            </button>

            <button
              onClick={() => setThemeMode('system')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-xs font-bold transition-all ${
                themeMode === 'system'
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-500/20'
                  : 'border-emerald-100 text-slate-700 hover:bg-emerald-50/50 hover:border-emerald-300'
              }`}
            >
              <Sparkles size={20} className="text-emerald-500" />
              <span>System Default</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Ambient Soundscapes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['None', 'Rain', 'Forest', 'Ocean'].map(sound => (
            <button
              key={sound}
              onClick={() => toast.success(`${sound} ambient audio selected (coming soon)`)}
              className={`p-4 rounded-xl border text-xs font-bold transition-all ${
                sound === 'None'
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-500/20'
                  : 'border-emerald-100 text-slate-700 hover:bg-emerald-50/50 hover:border-emerald-300'
              }`}
            >
              {sound}
            </button>
          ))}
        </div>
        <p className="text-[11px] font-medium text-slate-500">
          Lightweight browser audio will play in the background when you are in the Habit Garden.
        </p>
      </div>
    </div>
  );
}
