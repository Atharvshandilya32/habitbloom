import React, { useState } from 'react';
import { SpaceChallenge, SpaceChallengeType, CustomRole } from '../../../../lib/spaceTypes';
import { hasPermission } from '../../../../lib/spacePermissions';
import { Trophy, Plus, CheckCircle2, Clock, Users, BrainCircuit, Loader2, EyeOff, Eye } from 'lucide-react';
import { generateSmartSpaceChallengeIdeas } from '../../../../lib/spaceSmartUtils';

interface SpaceChallengesProps {
  challenges: SpaceChallenge[];
  role: CustomRole | null | undefined;
  currentUserId: string;
  spaceId: string;
  spaceType: import('../../../../lib/spaceTypes').SpaceType;
  personalHabits: import('../../../../lib/habitTypes').Habit[];
  habitLogsArray: Record<string, number[]>;
  currentUserName: string;
  onCreateChallenge: (title: string, description: string, type: SpaceChallengeType, totalDays: number) => void;
  onJoinChallenge: (challengeId: string) => void;
}

interface ChallengeProgress {
  count: number;
  anonymous: boolean;
  name: string;
  lastUpdated: string;
}

export default function SpaceChallenges({
  challenges,
  role,
  currentUserId,
  spaceId,
  spaceType,
  personalHabits,
  habitLogsArray,
  currentUserName,
  onCreateChallenge,
  onJoinChallenge
}: SpaceChallengesProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<SpaceChallengeType>('7-day');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{title: string, description: string, type: SpaceChallengeType, totalDays: number}[]>([]);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const ideas = await generateSmartSpaceChallengeIdeas(spaceType);
      setAiSuggestions(ideas);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCreate = () => {
    if (!title.trim()) return;
    let days = 7;
    if (type === '21-day') days = 21;
    if (type === 'custom') days = 30; // default for custom in this UI
    
    onCreateChallenge(title, description, type, days);
    setTitle('');
    setDescription('');
    setType('7-day');
    setShowForm(false);
  };

  // Sync personal progress to Firebase for active challenges we joined
  React.useEffect(() => {
    if (!challenges || challenges.length === 0 || !personalHabits) return;
    
    challenges.forEach(challenge => {
      if (challenge.participants?.includes(currentUserId)) {
        // Calculate completions in challenge window
        const start = new Date(challenge.startDate).getTime();
        const end = challenge.endDate ? new Date(challenge.endDate).getTime() : start + (challenge.totalDays * 24 * 60 * 60 * 1000);
        
        let count = 0;
        personalHabits.forEach(habit => {
          const logs = habitLogsArray[habit.id];
          if (logs) {
            logs.forEach(logTime => {
              if (logTime >= start && logTime <= end) count++;
            });
          }
        });

        // Use dynamic import of firebase to avoid passing it as prop if we can, but since this is client component we can import database
        import('../../../../lib/firebase').then(({ database }) => {
           if (database) {
             import('firebase/database').then(({ ref, get, set }) => {
               const progRef = ref(database, `spaceChallenges/${spaceId}/${challenge.id}/progress/${currentUserId}`);
               get(progRef).then(snap => {
                 const isAnonymous = snap.exists() ? snap.val().anonymous : false;
                 set(progRef, { count, anonymous: isAnonymous, name: currentUserName, lastUpdated: new Date().toISOString() });
               });
             });
           }
        });
      }
    });
  }, [challenges, personalHabits, currentUserId, spaceId, currentUserName, habitLogsArray]);

  // Fetch all progress for leaderboard
  const [challengeProgress, setChallengeProgress] = useState<Record<string, Record<string, ChallengeProgress>>>({});
  React.useEffect(() => {
    import('../../../../lib/firebase').then(({ database }) => {
       if (database) {
         import('firebase/database').then(({ ref, onValue }) => {
           const unsubscribes = challenges.map(c => {
             const progRef = ref(database, `spaceChallenges/${spaceId}/${c.id}/progress`);
             return onValue(progRef, snap => {
               if (snap.exists()) {
                 setChallengeProgress(prev => ({ ...prev, [c.id]: snap.val() }));
               }
             });
           });
           return () => unsubscribes.forEach(unsub => unsub());
         });
       }
    });
  }, [challenges, spaceId]);

  const handleToggleAnonymous = (challengeId: string) => {
    const currentData = challengeProgress[challengeId]?.[currentUserId];
    const isAnon = currentData?.anonymous || false;
    
    import('../../../../lib/firebase').then(({ database }) => {
       if (database) {
         import('firebase/database').then(({ ref, update }) => {
           const progRef = ref(database, `spaceChallenges/${spaceId}/${challengeId}/progress/${currentUserId}`);
           update(progRef, { anonymous: !isAnon });
         });
       }
    });
  };

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center bg-amber-50 border border-amber-100 p-5 rounded-3xl">
        <div>
          <h3 className="font-bold text-amber-900 flex items-center gap-2">
            <Trophy size={18} className="text-amber-600" />
            Community Challenges
          </h3>
          <p className="text-sm text-amber-700/80 mt-1 max-w-md">
            Join time-bound challenges with your organization.
          </p>
        </div>
        {hasPermission(role, 'createChallenges') && !showForm && (
          <div className="flex gap-2">
            <button 
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-70"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
              Generate Suggestions
            </button>
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 text-sm font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-sm"
            >
              <Plus size={16} />
              New Challenge
            </button>
          </div>
        )}
      </div>

      {aiSuggestions.length > 0 && !showForm && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-6 shadow-sm animate-in slide-in-from-top-2">
          <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <BrainCircuit size={18} className="text-indigo-600" />
            Smart Recommended Challenges
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiSuggestions.map((idea, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-indigo-100/50 shadow-sm">
                <h5 className="font-bold text-slate-800 text-sm">{idea.title}</h5>
                <p className="text-xs text-slate-500 mt-1 mb-3">{idea.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{idea.totalDays} Days</span>
                  <button 
                    onClick={() => {
                      onCreateChallenge(idea.title, idea.description, idea.type, idea.totalDays);
                      setAiSuggestions(prev => prev.filter((_, i) => i !== idx));
                    }}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Launch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasPermission(role, 'createChallenges') && showForm && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-in slide-in-from-top-2">
          <h4 className="font-bold text-slate-800 mb-4">Create Organization Challenge</h4>
          
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Challenge Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 7 Days of Mindfulness"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are we trying to achieve?"
                rows={2}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Duration</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SpaceChallengeType)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
              >
                <option value="7-day">7 Days</option>
                <option value="21-day">21 Days</option>
                <option value="custom">Custom (30 Days)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button 
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreate}
              disabled={!title.trim()}
              className="px-5 py-2 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-colors shadow-sm"
            >
              Launch Challenge
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.length === 0 ? (
          <div className="col-span-1 md:col-span-2 text-center px-6 py-16 bg-white rounded-3xl border border-slate-200 border-dashed animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-sm border border-amber-100">
              <Trophy size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-3">Build consistency, together.</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto mb-8 leading-relaxed">
              Challenges are time-bound events where the entire community tracks the same habits. They are the best way to ignite engagement.
            </p>
            {hasPermission(role, 'createChallenges') ? (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
                  Smart-Generate
                </button>
                <button 
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Create Custom
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold border border-slate-200">
                <Clock size={16} /> Waiting for admins to launch a challenge...
              </div>
            )}
          </div>
        ) : (
          challenges.map(challenge => {
            const participants = challenge.participants || [];
            const hasJoined = participants.includes(currentUserId);
            const progressMap = challengeProgress[challenge.id] || {};
            const progressList = Object.entries(progressMap).map(([uid, data]) => ({ uid, ...data }));
            progressList.sort((a, b) => b.count - a.count);
            
            const myProgress = progressMap[currentUserId]?.count || 0;
            const target = challenge.totalDays; // simplified target
            const completed = myProgress >= target;
            const remaining = Math.max(0, target - myProgress);

            return (
              <div key={challenge.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-slate-800 text-lg pr-4">{challenge.title}</h4>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock size={10} />
                      {challenge.totalDays} Days
                    </span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Users size={12} />
                      {participants.length}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 font-medium mb-5 line-clamp-2">
                  {challenge.description}
                </p>
                
                {hasJoined ? (
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                       <div className="flex justify-between items-center mb-2">
                         <span className="text-sm font-bold text-slate-700">Your Progress</span>
                         <span className="text-sm font-bold text-emerald-600">{myProgress} / {target}</span>
                       </div>
                       <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-3">
                         <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (myProgress/target)*100)}%`}}></div>
                       </div>
                       
                       {completed ? (
                         <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-100/50 px-3 py-2 rounded-xl border border-emerald-100 justify-center">
                           <CheckCircle2 size={16} /> Challenge Complete!
                         </div>
                       ) : (
                         <div className="text-center text-xs font-bold text-slate-500">
                           Keep going. {remaining} completions to reach the goal.
                         </div>
                       )}
                       
                       <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                         <span className="text-xs font-medium text-slate-500">Leaderboard Privacy</span>
                         <button 
                           onClick={() => handleToggleAnonymous(challenge.id)}
                           className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold transition-colors ${progressMap[currentUserId]?.anonymous ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}
                         >
                           {progressMap[currentUserId]?.anonymous ? (
                             <><EyeOff size={12} /> Anonymous</>
                           ) : (
                             <><Eye size={12} /> Visible</>
                           )}
                         </button>
                       </div>
                    </div>
                    
                    {/* No Shame Leaderboard */}
                    {progressList.length > 0 && (
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Community Progress</h5>
                        <div className="space-y-2">
                          {progressList.slice(0, 3).map((p, i) => (
                            <div key={p.uid} className="flex justify-between items-center text-sm">
                              <span className="font-medium text-slate-700 flex items-center gap-2">
                                {i === 0 && <Trophy size={14} className="text-amber-500"/>}
                                {p.anonymous ? 'Anonymous Participant' : p.name}
                              </span>
                              <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">{p.count}</span>
                            </div>
                          ))}
                          {progressList.length > 3 && (
                            <div className="text-center text-xs font-medium text-slate-400 pt-1">
                              + {progressList.length - 3} more growing together
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => onJoinChallenge(challenge.id)}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm mt-4"
                  >
                    Join Challenge
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
