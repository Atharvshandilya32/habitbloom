'use client';

import React, { useState } from 'react';
import { SpaceType } from '../../../../../lib/spaceTypes';
import { Building2, GraduationCap, Dumbbell, Users, Heart, Star, Upload, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

interface CreateSpaceWizardProps {
  onClose: () => void;
  onComplete: (name: string, type: SpaceType, description: string) => void;
}

export default function CreateSpaceWizard({ onClose, onComplete }: CreateSpaceWizardProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [type, setType] = useState<SpaceType>('company');
  const [description, setDescription] = useState('');

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = () => {
    onComplete(name, type, description);
  };

  const spaceTypes = [
    { id: 'company', label: 'Company', icon: Building2, desc: 'For teams and workplaces' },
    { id: 'school', label: 'School', icon: GraduationCap, desc: 'For classes and student groups' },
    { id: 'gym', label: 'Gym', icon: Dumbbell, desc: 'For fitness communities' },
    { id: 'family', label: 'Family', icon: Heart, desc: 'For households' },
    { id: 'community', label: 'Community', icon: Users, desc: 'For shared interests' },
    { id: 'other', label: 'Other', icon: Star, desc: 'Custom organization' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-8 duration-500 flex flex-col h-[600px]">
        
        {/* Header Progress */}
        <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">Create New Space</h2>
            <p className="text-xs text-slate-500 font-medium">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="text-sm font-bold text-slate-400 hover:text-slate-600">Cancel</button>
        </div>

        {/* Wizard Content Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          
          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-black text-slate-800 mb-6">What kind of Space are you building?</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Space Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme Corp, Tech High School"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-lg font-bold"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Organization Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {spaceTypes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setType(t.id as SpaceType)}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${type === t.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                      >
                        <div className={`p-2 rounded-lg ${type === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <t.icon size={18} />
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${type === t.id ? 'text-indigo-900' : 'text-slate-700'}`}>{t.label}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details & Branding */}
          {step === 2 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-black text-slate-800 mb-6">Make it yours</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description / Mission Statement</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is the goal of this community?"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload Logo (Optional)</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload size={20} />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Click to upload logo</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Success / Review */}
          {step === 3 && (
            <div className="animate-in zoom-in-95 duration-300 text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Ready to Launch!</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
                Your Space <strong>{name}</strong> is all set up. Once created, you can generate invite links and start adding members.
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 inline-block text-left w-full max-w-md">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-black text-xl">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{name}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{type}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center">
          <div>
            {step > 1 && (
              <button 
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
          </div>
          <div>
            {step < 3 ? (
              <button 
                onClick={handleNext}
                disabled={step === 1 && !name.trim()}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                onClick={handleFinish}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors"
              >
                Launch Space 🚀
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
