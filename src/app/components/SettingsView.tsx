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
} from 'lucide-react';
import UserProfile from './UserProfile';
import HabitReminderSettings from './HabitReminderSettings';
import DataExportModal from './DataExportModal';
import { Star } from 'lucide-react';
import AppearanceTab from './settings/AppearanceTab';
import HabitsTab from './settings/HabitsTab';
import DataTab from './settings/DataTab';
import UpcomingTab from './settings/UpcomingTab';
import PrivacyTab from './settings/PrivacyTab';
import AboutTab from './settings/AboutTab';

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

  const navItems: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'appearance', label: 'Appearance & Audio', icon: <Palette size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'habits', label: 'Habits', icon: <SlidersHorizontal size={16} /> },
    { id: 'data', label: 'Data', icon: <Database size={16} /> },
    { id: 'export', label: 'Export', icon: <Download size={16} /> },
    { id: 'upcoming', label: 'Upcoming Features', icon: <Star size={16} /> },
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
          {activeTab === 'appearance' && <AppearanceTab />}

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
          {activeTab === 'habits' && <HabitsTab habits={habits} />}

          {/* Data Tab */}
          {activeTab === 'data' && <DataTab habits={habits} logs={logs} onClearData={onClearData} />}

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

          {/* Upcoming Features Tab */}
          {activeTab === 'upcoming' && <UpcomingTab />}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && <PrivacyTab />}

          {/* About Tab */}
          {activeTab === 'about' && <AboutTab />}
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
