import React, { useState } from 'react';
import { X, ShieldCheck, Copy, Check, Hash, CreditCard, Building2 } from 'lucide-react';
import { UserProfile } from '../../../../lib/userProfile';
import { formatHbId } from '../../../../lib/identityUtils';
import DigitalIDCard from './DigitalIDCard';
import { Space } from '../../../../lib/spaceTypes';

interface IdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  userSpaces?: Space[];
  userOrgIds?: Record<string, string>; // spaceId -> orgId
}

export default function IdentityModal({
  isOpen,
  onClose,
  profile,
  userSpaces = [],
  userOrgIds = {}
}: IdentityModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'card'>('profile');
  const [selectedSpaceForCard, setSelectedSpaceForCard] = useState<Space | null>(userSpaces[0] || null);

  if (!isOpen || !profile) return null;

  const handleCopy = () => {
    if (profile.hbId && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(profile.hbId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeSpace = selectedSpaceForCard || userSpaces[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <X size={18} />
        </button>

        {/* Tab Navigation Header */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'profile'
                ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Hash size={14} />
            <span>Universal Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('card')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'card'
                ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CreditCard size={14} />
            <span>Digital ID Card</span>
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Header User Card */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                {profile.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                    {profile.displayName}
                  </h3>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck size={11} /> Verified User
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Universal HabitBloom 10-Digit ID Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">
                  Universal HabitBloom ID
                </span>
                <span className="bg-white/20 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md backdrop-blur-sm">
                  10-DIGIT PERMANENT
                </span>
              </div>

              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-mono font-black tracking-wider">
                  {formatHbId(profile.hbId)}
                </span>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl backdrop-blur-sm transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-300" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-indigo-200 mt-3 font-medium">
                This ID represents your permanent HabitBloom identity across all spaces.
              </p>
            </div>

            {/* Joined Spaces & Organization Identifiers */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Organization Identifiers & Spaces
              </h4>

              {userSpaces.length === 0 ? (
                <div className="p-4 text-center bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-400">You have not joined any organization spaces yet.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userSpaces.map(sp => (
                    <div key={sp.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-indigo-500" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{sp.name}</p>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase">{sp.type}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {sp.identityConfig?.primaryIdLabel || 'Org ID'}
                        </span>
                        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {userOrgIds[sp.id] || 'Verified'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity"
              >
                Close Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-200">
            {userSpaces.length > 1 && (
              <div className="mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Select Space for Digital Pass:
                </label>
                <select
                  value={activeSpace?.id}
                  onChange={(e) => {
                    const found = userSpaces.find(s => s.id === e.target.value);
                    if (found) setSelectedSpaceForCard(found);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  {userSpaces.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                  ))}
                </select>
              </div>
            )}

            <DigitalIDCard
              cardData={{
                hbId: profile.hbId || '1000000000',
                spaceId: activeSpace?.id || 'space-general',
                spaceName: activeSpace?.name || 'HabitBloom Community',
                userName: profile.displayName || 'Habit Bloom User',
                userPhotoUrl: profile.photoURL || undefined,
                orgIdLabel: activeSpace?.identityConfig?.primaryIdLabel || 'Member ID',
                orgIdValue: (activeSpace && userOrgIds[activeSpace.id]) || profile.uid.substring(0, 8).toUpperCase(),
                roleName: 'Verified Member',
                verificationStatus: 'verified',
                joinedAt: profile.createdAt,
              }}
              onClose={onClose}
            />
          </div>
        )}
      </div>
    </div>
  );
}
