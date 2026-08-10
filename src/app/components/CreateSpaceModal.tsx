import React, { useState } from 'react';
import { X, Users, Building2, GraduationCap, Heart, Activity, CheckCircle2 } from 'lucide-react';
import { SpaceType } from '../../../lib/spaceTypes';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, type: SpaceType) => void;
}

const SPACE_TYPES: { id: SpaceType; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'company', label: 'Company', icon: <Building2 />, desc: 'For teams and organizations' },
  { id: 'gym', label: 'Gym/Fitness', icon: <Activity />, desc: 'For fitness centers and studios' },
  { id: 'school', label: 'Education', icon: <GraduationCap />, desc: 'For schools and classes' },
  { id: 'community', label: 'Community', icon: <Users />, desc: 'For public groups and clubs' },
  { id: 'family', label: 'Family/Friends', icon: <Heart />, desc: 'For private personal groups' },
];

export default function CreateSpaceModal({ isOpen, onClose, onCreate }: CreateSpaceModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<SpaceType>('company');

  if (!isOpen) return null;

  const handleNext = () => setStep(2);
  
  const handleCreate = () => {
    onCreate(name, description, type);
    // Reset state for next time
    setTimeout(() => {
      setStep(1);
      setName('');
      setDescription('');
      setType('company');
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            Create a New Space
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {step === 1 ? (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">What kind of Space are you building?</h3>
                <p className="text-sm text-slate-500 mt-1">This helps us tailor the templates and experience.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SPACE_TYPES.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col gap-2 ${
                      type === t.id 
                        ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                        : 'border-slate-100 bg-white hover:border-emerald-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      type === t.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {t.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{t.label}</h4>
                      <p className="text-xs text-slate-500">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Space Details</h3>
                <p className="text-sm text-slate-500 mt-1">Give your community an identity.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Space Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Titan Fitness Elite"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this space about?"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium resize-none"
                  />
                </div>
              </div>
              
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm font-medium">
                  After creating this Space, you&apos;ll be assigned as the Administrator and can generate invite links for your members.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
          {step === 2 ? (
            <button 
              onClick={() => setStep(1)}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Back
            </button>
          ) : (
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
          )}

          {step === 1 ? (
            <button 
              onClick={handleNext}
              className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              Next Step
            </button>
          ) : (
            <button 
              onClick={handleCreate}
              disabled={!name.trim()}
              className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              Create Space
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
