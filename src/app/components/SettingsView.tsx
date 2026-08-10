'use client';

import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { ReminderConfig } from '../../../lib/useHabitReminders';
import {
  User,
  Palette,
  Bell,
  SlidersHorizontal,
  Database,
  Download,
  ShieldCheck,
  Info,
  Moon,
  Sun,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import UserProfile from './UserProfile';
import HabitReminderSettings from './HabitReminderSettings';
import DataExportModal from './DataExportModal';
import { toast } from 'sonner';
import { useFeatureFlags } from '../../../lib/FeatureFlagContext';

interface SettingsViewProps {
  user: FirebaseUser | null;
  habits: Habit[];
  logs: HabitLog;
  reminderConfig: ReminderConfig;
  notificationPermission: NotificationPermission | string;
  updateReminderConfig: (updates: Partial<ReminderConfig>) => void;
  requestNotificationPermission: () => void;
  sendTestNotification: (title?: string, options?: NotificationOptions) => void;
  onUpdateHabit?: (habitId: string, updates: Partial<Habit>) => void;
  onClearData?: () => void;
}

type SettingsTab = 'profile' | 'appearance' | 'notifications' | 'habits' | 'data' | 'export' | 'privacy' | 'about' | 'upcoming';

export default function SettingsView({
  user,
  habits,
  logs,
  reminderConfig,
  notificationPermission,
  updateReminderConfig,
  requestNotificationPermission,
  sendTestNotification,
  onUpdateHabit = () => {},
  onClearData,
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const { themeMode, setThemeMode } = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { flags, togglePremium } = useFeatureFlags();

  const navItems: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'appearance', label: 'Appearance & Audio', icon: <Palette size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'habits', label: 'Habits', icon: <SlidersHorizontal size={16} /> },
    { id: 'data', label: 'Data', icon: <Database size={16} /> },
    { id: 'export', label: 'Export', icon: <Download size={16} /> },
    { id: 'privacy', label: 'Privacy', icon: <ShieldCheck size={16} /> },
    { id: 'about', label: 'About', icon: <Info size={16} /> },
  ];

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Title Header */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-emerald-100 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p className="text-xs font-medium text-slate-500 mt-0.5">
          Manage your account, preferences, notifications, data export, and application configurations.
        </p>
      </div>

      {/* Main Container with Left Sidebar Navigation */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Sidebar Nav */}
        <div className="w-full md:col-span-3 lg:col-span-3 bg-white/80 backdrop-blur-sm p-2 rounded-2xl border border-emerald-100 shadow-sm space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === item.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50/50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Panel */}
        <div className="w-full md:col-span-9 lg:col-span-9 bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-emerald-100 shadow-sm min-h-[400px]">
          {/* Profile Tab */}
          {activeTab === 'profile' && user && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">User Profile</h2>
              <UserProfile
                user={user}
                habits={habits}
                logs={logs}
                currentYear={currentYear}
                currentMonth={currentMonth}
              />
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
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
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Reminders & Notifications</h2>
              <HabitReminderSettings
                config={reminderConfig}
                permission={notificationPermission as NotificationPermission}
                habits={habits}
                onUpdateConfig={updateReminderConfig}
                onRequestPermission={async () => {
                  requestNotificationPermission();
                  return true;
                }}
                onSendTestNotification={(title, options) => sendTestNotification(title, options)}
                onUpdateHabit={onUpdateHabit}
              />
            </div>
          )}

          {/* Habits Tab */}
          {activeTab === 'habits' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Habit Management</h2>
              <p className="text-xs text-slate-500">You currently have {habits.length} active habits configured.</p>

              <div className="divide-y divide-emerald-50 border border-emerald-100 rounded-xl overflow-hidden">
                {habits.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-3.5 hover:bg-emerald-50/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{h.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{h.name}</div>
                        <div className="text-[11px] text-slate-500">{h.category || 'General'} • Goal: {h.goal} days/mo</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Data Storage & Storage Options</h2>
              <p className="text-xs text-slate-500">
                HabitBloom seamlessly mirrors your data between local browser storage and your free Firebase Realtime Database.
              </p>

              <div className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-100 space-y-2">
                <div className="text-xs font-bold text-slate-800">Storage Summary</div>
                <div className="text-xs text-slate-600">Total Habits: <span className="font-bold">{habits.length}</span></div>
                <div className="text-xs text-slate-600">Logged Entries: <span className="font-bold">{Object.keys(logs).length}</span></div>
              </div>

              {onClearData && (
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to reset your local habit cache? This cannot be undone.')) {
                        onClearData();
                        toast.success('Local cache cleared');
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-all"
                  >
                    <Trash2 size={15} />
                    Reset Local Habit Cache
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Data Export Hub</h2>
              <p className="text-xs text-slate-500">
                Export your habits, progress records, and logs anytime in CSV, JSON, or Printable PDF format.
              </p>

              <button
                onClick={() => setExportModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 hover:scale-105 text-white text-xs font-bold shadow-sm hover:shadow transition-all duration-300"
              >
                <Download size={16} />
                Open Data Export Center
              </button>
            </div>
          )}



          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Privacy & Security</h2>
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <ShieldCheck size={16} />
                  Zero Paid APIs & Zero Third-Party Trackers
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  HabitBloom guarantees complete data privacy. Your data remains strictly within your browser and your private Firebase RTDB container.
                </p>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">About HabitBloom</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌱</span>
                  <span className="text-base font-extrabold text-slate-900">HabitBloom v2.0 Premium</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                  Designed inspired by Linear, Notion, Arc Browser, Todoist, and TickTick. Built to run fast and light on free Vercel + Firebase infrastructure.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      <DataExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        habits={habits}
        logs={logs}
      />
    </div>
  );
}
