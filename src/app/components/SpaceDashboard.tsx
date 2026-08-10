import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Space, SpaceAnnouncement, SpaceHabitTemplate, SpaceChallenge, SpaceChallengeType, CustomRole } from '../../../lib/spaceTypes';
import { hasPermission } from '../../../lib/spacePermissions';
import { getSpaceUILabels } from '../../../lib/spaceUILabels';
import { ref, onValue, set, remove } from 'firebase/database';
import { database } from '../../../lib/firebase';
import { Habit } from '../../../lib/habitTypes';
import { ArrowLeft, Users, Trophy, Target, Settings, Link as LinkIcon, Megaphone, BarChart3, BrainCircuit, Activity } from 'lucide-react';
import SpaceSettingsModal from './spaces/SpaceSettingsModal';
import AnnouncementsFeed from './spaces/AnnouncementsFeed';
import SpaceHabitTemplates from './spaces/SpaceHabitTemplates';
import SpaceChallenges from './spaces/SpaceChallenges';
import SpaceMembers from './spaces/SpaceMembers';
import { CardSkeleton } from './ui/Skeleton';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { toast } from 'sonner';

const OrganizationAnalytics = lazy(() => import('./spaces/admin/OrganizationAnalytics'));
const CoachDashboard = lazy(() => import('./spaces/coach/CoachDashboard'));

type SpaceTab = 'home' | 'challenges' | 'templates' | 'members' | 'analytics' | 'coach';

interface SpaceDashboardProps {
  space: Space;
  role: CustomRole | null | undefined;
  currentUserId: string;
  currentUserName?: string;
  personalHabits: Habit[];
  habitLogsArray: Record<string, number[]>;
  onBack: () => void;
  onInstallTemplate: (template: SpaceHabitTemplate) => void;
}

export default function SpaceDashboard({ 
  space, 
  role, 
  currentUserId,
  currentUserName = 'Member',
  personalHabits,
  habitLogsArray,
  onBack,
  onInstallTemplate
}: SpaceDashboardProps) {
  const [activeTab, setActiveTab] = useState<SpaceTab>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'general' | 'branding' | 'invites'>('general');
  
  // Mock Data for UI demonstration -> Now Firebase Connected
  const [announcements, setAnnouncements] = useState<SpaceAnnouncement[]>([]);
  const [templates, setTemplates] = useState<SpaceHabitTemplate[]>([]);
  const [challenges, setChallenges] = useState<SpaceChallenge[]>([]);
  const [totalCompletions, setTotalCompletions] = useState(0);

  useEffect(() => {
    if (!database) return;
    const annRef = ref(database, `spaces/${space.id}/announcements`);
    const tplRef = ref(database, `spaces/${space.id}/templates`);
    const chalRef = ref(database, `spaces/${space.id}/challenges`);
    const progressRef = ref(database, `spaceChallenges/${space.id}`);

    const unsubAnn = onValue(annRef, snap => {
      if (snap.exists()) setAnnouncements(Object.values(snap.val()));
      else setAnnouncements([]);
    });
    const unsubTpl = onValue(tplRef, snap => {
      if (snap.exists()) setTemplates(Object.values(snap.val()));
      else setTemplates([]);
    });
    const unsubChal = onValue(chalRef, snap => {
      if (snap.exists()) setChallenges(Object.values(snap.val()));
      else setChallenges([]);
    });
    const unsubProgress = onValue(progressRef, snap => {
      if (snap.exists()) {
        const challengesData = snap.val();
        let total = 0;
        Object.keys(challengesData).forEach(chalId => {
          const progressData = challengesData[chalId]?.progress || {};
          Object.keys(progressData).forEach(uid => {
            total += (progressData[uid]?.count || 0);
          });
        });
        setTotalCompletions(total);
      } else {
        setTotalCompletions(0);
      }
    });

    return () => {
      unsubAnn();
      unsubTpl();
      unsubChal();
      unsubProgress();
    };
  }, [space.id]);

  const handlePostAnnouncement = (title: string, content: string, isPinned: boolean) => {
    const id = `ann-${Date.now()}`;
    const newAnnouncement: SpaceAnnouncement = {
      id, spaceId: space.id, title, content, authorId: currentUserId,
      createdAt: new Date().toISOString(), isPinned
    };
    if (database) {
      set(ref(database, `spaces/${space.id}/announcements/${id}`), newAnnouncement)
        .catch(() => toast.error("Failed to post announcement."));
    }
  };
  
  const handleDeleteAnnouncement = (id: string) => {
    if (database) {
      remove(ref(database, `spaces/${space.id}/announcements/${id}`))
        .catch(() => toast.error("Failed to delete announcement."));
    }
  };

  const handleCreateTemplate = (name: string, emoji: string, category: string, description: string) => {
    const id = `tpl-${Date.now()}`;
    const newTemplate: SpaceHabitTemplate = {
      id, spaceId: space.id, name, emoji, category, description, createdBy: currentUserId
    };
    if (database) {
      set(ref(database, `spaces/${space.id}/templates/${id}`), newTemplate)
        .catch(() => toast.error("Failed to create template."));
    }
  };

  const handleCreateChallenge = (title: string, description: string, type: SpaceChallengeType, totalDays: number) => {
    const id = `chal-${Date.now()}`;
    const newChallenge: SpaceChallenge = {
      id, spaceId: space.id, title, description, type, totalDays,
      startDate: new Date().toISOString(), createdBy: currentUserId, participants: []
    };
    if (database) {
      set(ref(database, `spaces/${space.id}/challenges/${id}`), newChallenge)
        .catch(() => toast.error("Failed to create challenge."));
    }
  };

  const handleJoinChallenge = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    const updated = {
      ...challenge,
      participants: [...(challenge.participants || []), currentUserId]
    };
    if (database) {
      set(ref(database, `spaces/${space.id}/challenges/${challengeId}`), updated)
        .catch(() => toast.error("Failed to join challenge."));
    }
  };

  const branding = space.branding || {};
  const themeColorClass = branding.themeColor ? `bg-${branding.themeColor}` : 'bg-emerald-600';
  const labels = getSpaceUILabels(space.type);
  
  const getMilestones = (total: number) => {
    const milestones = [100, 500, 1000, 2500, 5000, 10000, 25000];
    for (let i = 0; i < milestones.length; i++) {
      if (total < milestones[i]) {
        return { current: i > 0 ? milestones[i-1] : 0, next: milestones[i] };
      }
    }
    const highest = milestones[milestones.length - 1];
    return { current: highest, next: highest * 2 };
  };
  
  const { next: nextMilestone } = getMilestones(totalCompletions);
  const milestoneProgress = Math.min(100, (totalCompletions / nextMilestone) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Navigation & Context Switcher */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 transition-colors bg-white dark:bg-slate-900/50 dark:border-slate-800 px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft size={16} />
          Back to Spaces Hub
        </button>

        <div className="flex gap-2">
          {hasPermission(role, 'manageBranding') && (
            <>
              <button 
                onClick={() => {
                  setSettingsInitialTab('general');
                  setSettingsOpen(true);
                }}
                className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900/50 dark:border-slate-800 px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors"
              >
                <Settings size={16} />
                Settings
              </button>
            </>
          )}
          {hasPermission(role, 'inviteMembers') && (
            <button 
                onClick={() => {
                  setSettingsInitialTab('invites');
                  setSettingsOpen(true);
                }}
                className={`flex items-center gap-2 text-sm font-bold text-white ${themeColorClass} hover:opacity-90 px-4 py-2 rounded-xl shadow-sm transition-colors`}
              >
                <LinkIcon size={16} />
                Invite
              </button>
          )}
          {hasPermission(role, 'viewAnalytics') && (
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
          <div className="flex items-end gap-5 flex-1 min-w-0">
            <div className="w-20 h-20 bg-white dark:bg-slate-900/50 dark:border-slate-800 rounded-2xl flex items-center justify-center text-4xl shadow-lg shrink-0">
              {space.type === 'gym' ? '🏋️' : space.type === 'school' ? '🎓' : space.type === 'company' ? '🏢' : '🚀'}
            </div>
            <div className="pb-1 text-white flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-900/50 dark:border-slate-800/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                  {space.type}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-900/50 dark:border-slate-800/30 backdrop-blur-md text-xs font-bold capitalize text-white truncate max-w-[120px]">
                  Role: {role?.name || 'Member'}
                </span>
              </div>
              <h1 className="text-3xl font-black drop-shadow-md truncate">{space.name}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-2">
        <p className="text-slate-600 font-medium">{space.description}</p>
        {branding.welcomeMessage && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 rounded-xl text-sm text-slate-700">
            <strong>Welcome:</strong> {branding.welcomeMessage}
          </div>
        )}
      </div>

      <div 
        role="tablist" 
        aria-label="Space Navigation" 
        className="flex gap-2 border-b border-slate-200 pb-px overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <button 
          role="tab"
          aria-selected={activeTab === 'home'}
          aria-controls="tabpanel-home"
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'home' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
        >
          <Megaphone size={16} aria-hidden="true" /> {labels.announcementsTitle}
        </button>
        <button 
          role="tab"
          aria-selected={activeTab === 'challenges'}
          aria-controls="tabpanel-challenges"
          onClick={() => setActiveTab('challenges')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'challenges' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
        >
          <Trophy size={16} aria-hidden="true" /> {labels.challengesTitle}
        </button>
        <button 
          role="tab"
          aria-selected={activeTab === 'templates'}
          aria-controls="tabpanel-templates"
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'templates' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
        >
          <Target size={16} aria-hidden="true" /> {labels.templatesTitle}
        </button>
        <button 
          role="tab"
          aria-selected={activeTab === 'members'}
          aria-controls="tabpanel-members"
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'members' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
        >
          <Users size={16} aria-hidden="true" /> {labels.membersTitle}
        </button>
        {(hasPermission(role, 'manageMembers') || hasPermission(role, 'createChallenges')) && (
          <button 
            role="tab"
            aria-selected={activeTab === 'coach'}
            aria-controls="tabpanel-coach"
            onClick={() => setActiveTab('coach')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'coach' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
          >
            <BrainCircuit size={16} aria-hidden="true" /> {labels.coachDashboardTitle}
          </button>
        )}
        {hasPermission(role, 'viewAnalytics') && (
          <button 
            role="tab"
            aria-selected={activeTab === 'analytics'}
            aria-controls="tabpanel-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'analytics' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
          >
            <BarChart3 size={16} aria-hidden="true" /> Analytics
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="py-2" role="tabpanel" id={`tabpanel-${activeTab}`}>
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* Community Progress Banner */}
            <div className="bg-white dark:bg-slate-900/50 dark:border-slate-800 border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Activity size={18} className="text-emerald-500" />
                    Community Progress
                  </h3>
                  <div className="text-sm font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                    {totalCompletions} / {nextMilestone} completions
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${themeColorClass} transition-all duration-1000 ease-out`}
                    style={{ width: `${milestoneProgress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-xs font-medium text-slate-400">
                  <span>Growing together</span>
                  <span>{milestoneProgress.toFixed(1)}% to next milestone</span>
                </div>
              </div>
            </div>

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
              <div className="bg-white dark:bg-slate-900/50 dark:border-slate-800/80 backdrop-blur-sm p-6 rounded-3xl border border-emerald-50 shadow-sm transition-all hover:shadow-md">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                  <Target size={16} className="text-emerald-500"/> Active Templates
                </h3>
                {templates.length > 0 ? (
                  <p className="text-sm font-medium text-slate-600">{templates.length} templates shared by the community.</p>
                ) : (
                  <p className="text-sm text-slate-400">No templates yet. Create one to share your workflow!</p>
                )}
                <button onClick={() => setActiveTab('templates')} className="mt-4 w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 font-bold text-sm rounded-xl transition-colors">
                  {templates.length > 0 ? 'View All' : 'Create First Template'}
                </button>
              </div>
              <div className="bg-white dark:bg-slate-900/50 dark:border-slate-800/80 backdrop-blur-sm p-6 rounded-3xl border border-emerald-50 shadow-sm transition-all hover:shadow-md">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                  <Trophy size={16} className="text-emerald-500"/> Active Challenges
                </h3>
                {challenges.length > 0 ? (
                  <p className="text-sm font-medium text-slate-600">{challenges.length} challenges active right now.</p>
                ) : (
                  <p className="text-sm text-slate-400">No active challenges. Start one to build consistency together!</p>
                )}
                <button onClick={() => setActiveTab('challenges')} className="mt-4 w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 font-bold text-sm rounded-xl transition-colors">
                  {challenges.length > 0 ? 'View All' : 'Launch Challenge'}
                </button>
              </div>
            </div>
          </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <SpaceChallenges 
            challenges={challenges}
            role={role}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            spaceId={space.id}
            spaceType={space.type}
            personalHabits={personalHabits}
            habitLogsArray={habitLogsArray}
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
          <SpaceMembers space={space} currentUserRole={role} />
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
              <CoachDashboard role={role} challenges={challenges} totalCompletions={totalCompletions} />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>

      <SpaceSettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        space={space}
        initialTab={settingsInitialTab}
        onSave={(updates) => {
          if (database) {
            set(ref(database, `spaces/${space.id}`), {
              ...space,
              ...updates
            }).catch(() => toast.error("Failed to save space settings."));
          }
        }}
      />

    </div>
  );
}
