import React, { useState, Suspense, lazy } from 'react';
import { Space, SpaceRole, SpaceAnnouncement, SpaceHabitTemplate, SpaceChallenge, SpaceChallengeType } from '../../../lib/spaceTypes';
import { Habit } from '../../../lib/habitTypes';
import { ArrowLeft, Users, Trophy, Target, Settings, Link as LinkIcon, Megaphone, BarChart3, BrainCircuit } from 'lucide-react';
import SpaceSettingsModal from './spaces/SpaceSettingsModal';
import AnnouncementsFeed from './spaces/AnnouncementsFeed';
import SpaceHabitTemplates from './spaces/SpaceHabitTemplates';
import SpaceChallenges from './spaces/SpaceChallenges';
import { CardSkeleton } from './ui/Skeleton';
import { ErrorBoundary } from './ui/ErrorBoundary';

const OrganizationAnalytics = lazy(() => import('./spaces/admin/OrganizationAnalytics'));
const CoachDashboard = lazy(() => import('./spaces/coach/CoachDashboard'));

type SpaceTab = 'home' | 'challenges' | 'templates' | 'members' | 'analytics' | 'coach';

interface SpaceDashboardProps {
  space: Space;
  role: SpaceRole;
  currentUserId: string;
  personalHabits: Habit[];
  onBack: () => void;
  onGenerateInvite: () => void;
  onInstallTemplate: (template: SpaceHabitTemplate) => void;
}

export default function SpaceDashboard({ 
  space, 
  role, 
  currentUserId,
  personalHabits,
  onBack, 
  onGenerateInvite,
  onInstallTemplate
}: SpaceDashboardProps) {
  const [activeTab, setActiveTab] = useState<SpaceTab>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Mock Data for UI demonstration
  const [announcements, setAnnouncements] = useState<SpaceAnnouncement[]>([]);
  const [templates, setTemplates] = useState<SpaceHabitTemplate[]>([]);
  const [challenges, setChallenges] = useState<SpaceChallenge[]>([]);

  // Handlers for mock data
  const handlePostAnnouncement = (title: string, content: string, isPinned: boolean) => {
    const newAnnouncement: SpaceAnnouncement = {
      id: `ann-${Date.now()}`, spaceId: space.id, title, content, authorId: currentUserId,
      createdAt: new Date().toISOString(), isPinned
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
  };
  
  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const handleCreateTemplate = (name: string, emoji: string, category: string, description: string) => {
    const newTemplate: SpaceHabitTemplate = {
      id: `tpl-${Date.now()}`, spaceId: space.id, name, emoji, category, description, createdBy: currentUserId
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const handleCreateChallenge = (title: string, description: string, type: SpaceChallengeType, totalDays: number) => {
    const newChallenge: SpaceChallenge = {
      id: `chal-${Date.now()}`, spaceId: space.id, title, description, type, totalDays,
      startDate: new Date().toISOString(), createdBy: currentUserId, participants: []
    };
    setChallenges(prev => [...prev, newChallenge]);
  };

  const handleJoinChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(c => 
      c.id === challengeId ? { ...c, participants: [...c.participants, currentUserId] } : c
    ));
    // Usually also installs a habit tracking logic here
  };

  const branding = space.branding || {};
  const themeColorClass = branding.themeColor ? `bg-${branding.themeColor}` : 'bg-indigo-600';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Navigation & Context Switcher */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft size={16} />
          Back to Spaces Hub
        </button>

        <div className="flex gap-2">
          {role === 'admin' && (
            <>
              <button 
                onClick={() => setSettingsOpen(true)}
                className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors"
              >
                <Settings size={16} />
                Settings
              </button>
              <button 
                onClick={onGenerateInvite}
                className={`flex items-center gap-2 text-sm font-bold text-white ${themeColorClass} hover:opacity-90 px-4 py-2 rounded-xl shadow-sm transition-colors`}
              >
                <LinkIcon size={16} />
                Invite
              </button>
            </>
          )}
          {(role === 'admin' || role === 'owner') && (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-200">
               Health: 84
            </div>
          )}
        </div>
      </div>

      {/* Space Header Banner */}
      <div className="relative w-full h-48 bg-slate-900 rounded-3xl overflow-hidden shadow-md">
        {branding.coverUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={branding.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900"></div>
        )}
        <div className={`absolute inset-0 opacity-40 mix-blend-color ${themeColorClass}`}></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>
        
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div className="flex items-end gap-5">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-lg">
              {space.type === 'gym' ? '🏋️' : space.type === 'school' ? '🎓' : space.type === 'company' ? '🏢' : '🚀'}
            </div>
            <div className="pb-1 text-white">
              <div className="flex items-center gap-3 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                  {space.type}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white/30 backdrop-blur-md text-xs font-bold capitalize text-white">
                  Role: {role}
                </span>
              </div>
              <h1 className="text-3xl font-black drop-shadow-md">{space.name}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-2">
        <p className="text-slate-600 font-medium">{space.description}</p>
        {branding.welcomeMessage && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700">
            <strong>Welcome:</strong> {branding.welcomeMessage}
          </div>
        )}
      </div>

      {/* Internal Space Navigation */}
      <div 
        role="tablist" 
        aria-label="Space Navigation" 
        className="flex gap-2 border-b border-slate-200 pb-px overflow-x-auto no-scrollbar"
      >
        <button 
          role="tab"
          aria-selected={activeTab === 'home'}
          aria-controls="tabpanel-home"
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'home' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Megaphone size={16} aria-hidden="true" /> Home & Announcements
        </button>
        <button 
          role="tab"
          aria-selected={activeTab === 'challenges'}
          aria-controls="tabpanel-challenges"
          onClick={() => setActiveTab('challenges')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'challenges' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Trophy size={16} aria-hidden="true" /> Challenges
        </button>
        <button 
          role="tab"
          aria-selected={activeTab === 'templates'}
          aria-controls="tabpanel-templates"
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'templates' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Target size={16} aria-hidden="true" /> Shared Templates
        </button>
        <button 
          role="tab"
          aria-selected={activeTab === 'members'}
          aria-controls="tabpanel-members"
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'members' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Users size={16} aria-hidden="true" /> Members
        </button>
        {(role === 'admin' || role === 'owner' || role === 'coach') && (
          <button 
            role="tab"
            aria-selected={activeTab === 'coach'}
            aria-controls="tabpanel-coach"
            onClick={() => setActiveTab('coach')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'coach' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <BrainCircuit size={16} aria-hidden="true" /> Coach
          </button>
        )}
        {(role === 'admin' || role === 'owner') && (
          <button 
            role="tab"
            aria-selected={activeTab === 'analytics'}
            aria-controls="tabpanel-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'analytics' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <BarChart3 size={16} aria-hidden="true" /> Analytics
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="py-2" role="tabpanel" id={`tabpanel-${activeTab}`}>
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <AnnouncementsFeed 
                announcements={announcements} 
                role={role} 
                onPostAnnouncement={handlePostAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
              />
            </div>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Target size={16} className="text-slate-400"/> Active Templates</h3>
                <p className="text-sm text-slate-500">{templates.length} templates shared.</p>
                <button onClick={() => setActiveTab('templates')} className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl transition-colors">View All</button>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Trophy size={16} className="text-slate-400"/> Active Challenges</h3>
                <p className="text-sm text-slate-500">{challenges.length} active right now.</p>
                <button onClick={() => setActiveTab('challenges')} className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl transition-colors">View All</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <SpaceChallenges 
            challenges={challenges}
            role={role}
            currentUserId={currentUserId}
            spaceType={space.type}
            onCreateChallenge={handleCreateChallenge}
            onJoinChallenge={handleJoinChallenge}
          />
        )}

        {activeTab === 'templates' && (
          <SpaceHabitTemplates 
            templates={templates}
            role={role}
            personalHabits={personalHabits}
            spaceType={space.type}
            onCreateTemplate={handleCreateTemplate}
            onInstallTemplate={onInstallTemplate}
          />
        )}

        {activeTab === 'members' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-center">
            <Users size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Member Directory</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2">
              (Coming soon) You&apos;ll be able to see other members, coaches, and their public achievements here.
            </p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <ErrorBoundary fallbackMessage="Failed to load analytics dashboard.">
            <Suspense fallback={<CardSkeleton />}>
              <OrganizationAnalytics space={space} role={role} />
            </Suspense>
          </ErrorBoundary>
        )}

        {activeTab === 'coach' && (
          <ErrorBoundary fallbackMessage="Failed to load coach dashboard.">
            <Suspense fallback={<CardSkeleton />}>
              <CoachDashboard space={space} role={role} />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>

      <SpaceSettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        space={space}
        onSave={() => {
          // Real app would update firebase

        }}
      />

    </div>
  );
}
