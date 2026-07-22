'use client';

import { useState } from 'react';
import { Bell, BellOff, Volume2, VolumeX, Send, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { ReminderConfig } from '../../../lib/useHabitReminders';
import { Habit } from '../../../lib/habitTypes';

interface HabitReminderSettingsProps {
  config: ReminderConfig;
  permission: NotificationPermission;
  habits: Habit[];
  onUpdateConfig: (newConfig: Partial<ReminderConfig>) => void;
  onRequestPermission: () => Promise<boolean>;
  onSendTestNotification: (title: string, options?: NotificationOptions) => void;
  onUpdateHabit: (habitId: string, updates: Partial<Habit>) => void;
}

export default function HabitReminderSettings({
  config,
  permission,
  habits,
  onUpdateConfig,
  onRequestPermission,
  onSendTestNotification,
  onUpdateHabit,
}: HabitReminderSettingsProps) {
  const [testSent, setTestSent] = useState(false);

  const handleTestNotification = () => {
    onSendTestNotification('🔔 HabitBloom Test Reminder', {
      body: 'Notifications are working perfectly! You will get daily reminders for your habits.',
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Bell className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Habit Reminders</h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Never miss a day. Get customizable daily browser notifications for incomplete habits.
          </p>
        </div>

        {/* Permission status badge / Action button */}
        {permission !== 'granted' ? (
          <button
            onClick={onRequestPermission}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all active:scale-[0.98]"
          >
            <Bell className="h-4 w-4" />
            Enable Notifications
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Notifications Active
            </span>
            <button
              onClick={handleTestNotification}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-all"
            >
              <Send className="h-3.5 w-3.5 text-slate-500" />
              {testSent ? 'Sent!' : 'Test'}
            </button>
          </div>
        )}
      </div>

      {permission === 'denied' && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-xs sm:text-sm text-amber-800 border border-amber-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-bold">Notifications are blocked in your browser settings.</span>
            <p className="mt-0.5 text-amber-700">
              Please click the lock/settings icon near your address bar to allow notifications for HabitBloom.
            </p>
          </div>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Global Toggle */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:bg-slate-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">Daily Global Reminder</span>
            <button
              disabled={permission !== 'granted'}
              onClick={() => onUpdateConfig({ globalEnabled: !config.globalEnabled })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                config.globalEnabled && permission === 'granted' ? 'bg-emerald-600' : 'bg-slate-300 opacity-60'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  config.globalEnabled && permission === 'granted' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Triggers a single summary notification if any habits remain uncompleted by your chosen time.
          </p>
        </div>

        {/* Global Time Selector */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:bg-slate-50">
          <label htmlFor="global-reminder-time" className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Clock className="h-4 w-4 text-emerald-600" />
            Global Reminder Time
          </label>
          <div className="mt-3 flex items-center gap-3">
            <input
              id="global-reminder-time"
              type="time"
              value={config.globalTime}
              onChange={(e) => onUpdateConfig({ globalTime: e.target.value })}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <span className="text-xs text-slate-500">Local time</span>
          </div>
        </div>

        {/* Sound Alert Toggle */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:bg-slate-50">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              {config.soundEnabled ? (
                <Volume2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-400" />
              )}
              Notification Sound
            </span>
            <button
              onClick={() => onUpdateConfig({ soundEnabled: !config.soundEnabled })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                config.soundEnabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  config.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Play a pleasant chime audio cue when a habit reminder pops up.
          </p>
        </div>
      </div>

      {/* Per-Habit Reminder Configuration */}
      <div className="mt-8">
        <h3 className="text-base font-bold text-slate-900 mb-3">Custom Per-Habit Schedules</h3>
        <p className="text-xs text-slate-500 mb-4">
          Set specific reminder times for individual habits to keep yourself accountable throughout the day.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="text-xl shrink-0">{habit.emoji}</span>
                <span className="text-sm font-semibold text-slate-800 truncate">{habit.name}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="time"
                  value={habit.reminderTime || config.globalTime}
                  onChange={(e) =>
                    onUpdateHabit(habit.id, {
                      reminderTime: e.target.value,
                      reminderEnabled: habit.reminderEnabled ?? true,
                    })
                  }
                  className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  title={habit.reminderEnabled ? 'Disable custom reminder' : 'Enable custom reminder'}
                  onClick={() =>
                    onUpdateHabit(habit.id, {
                      reminderEnabled: !habit.reminderEnabled,
                      reminderTime: habit.reminderTime || config.globalTime,
                    })
                  }
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all ${
                    habit.reminderEnabled
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {habit.reminderEnabled ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
