import React, { useState } from 'react';
import { SpaceHabitTemplate, SpaceRole } from '../../../../lib/spaceTypes';
import { Habit } from '../../../../lib/habitTypes';
import { Target, Plus, CheckCircle2, BrainCircuit, Loader2 } from 'lucide-react';
import { generateSpaceHabitTemplates } from '../../../../lib/spaceAiUtils';

interface SpaceHabitTemplatesProps {
  templates: SpaceHabitTemplate[];
  role: SpaceRole;
  personalHabits: Habit[];
  spaceType: import('../../../../lib/spaceTypes').SpaceType;
  onCreateTemplate: (name: string, emoji: string, category: string, description: string) => void;
  onInstallTemplate: (template: SpaceHabitTemplate) => void;
}

export default function SpaceHabitTemplates({
  templates,
  role,
  personalHabits,
  spaceType,
  onCreateTemplate,
  onInstallTemplate
}: SpaceHabitTemplatesProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🌟');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{name: string, emoji: string, category: string, description: string}[]>([]);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const templates = await generateSpaceHabitTemplates(spaceType);
      setAiSuggestions(templates);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreateTemplate(name, emoji, category || 'Community', description);
    setName('');
    setEmoji('🌟');
    setCategory('');
    setDescription('');
    setShowForm(false);
  };

  const isTemplateInstalled = (template: SpaceHabitTemplate) => {
    return personalHabits.some(h => h.name.toLowerCase() === template.name.toLowerCase());
  };

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 p-5 rounded-3xl">
        <div>
          <h3 className="font-bold text-indigo-900 flex items-center gap-2">
            <Target size={18} className="text-indigo-600" />
            Shared Habit Templates
          </h3>
          <p className="text-sm text-indigo-700/80 mt-1 max-w-md">
            1-Click install these habits into your Personal Workspace. Your progress remains private to you.
          </p>
        </div>
        {role === 'admin' && !showForm && (
          <div className="flex gap-2">
            <button 
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-70"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
              AI Builder
            </button>
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={16} />
              New Template
            </button>
          </div>
        )}
      </div>

      {aiSuggestions.length > 0 && !showForm && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-6 shadow-sm animate-in slide-in-from-top-2">
          <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <BrainCircuit size={18} className="text-indigo-600" />
            AI Recommended Habit Pack
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiSuggestions.map((tpl, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-indigo-100/50 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl border border-slate-100">
                    {tpl.emoji}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">{tpl.name}</h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tpl.category}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    onCreateTemplate(tpl.name, tpl.emoji, tpl.category, tpl.description);
                    setAiSuggestions(prev => prev.filter((_, i) => i !== idx));
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {role === 'admin' && showForm && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-in slide-in-from-top-2">
          <h4 className="font-bold text-slate-800 mb-4">Create Organization Template</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Emoji</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-16 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xl"
              />
            </div>
            <div className="sm:-ml-24">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Habit Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Daily Check-in"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Health, Team"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why should members do this?"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
              />
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
              disabled={!name.trim()}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              Save Template
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.length === 0 ? (
          <div className="col-span-1 md:col-span-2 text-center px-6 py-16 bg-white rounded-3xl border border-slate-200 border-dashed animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-sm border border-indigo-100">
              <Target size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-3">Habits that scale.</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto mb-8 leading-relaxed">
              Shared templates allow members to 1-click install habits curated by your organization directly into their personal trackers.
            </p>
            {role === 'admin' ? (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
                  Auto-Generate
                </button>
                <button 
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Create Custom
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold border border-slate-200">
                Waiting for admins to add templates...
              </div>
            )}
          </div>
        ) : (
          templates.map(template => {
            const installed = isTemplateInstalled(template);
            return (
              <div key={template.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl border border-slate-100 shadow-sm group-hover:scale-105 transition-transform">
                    {template.emoji}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{template.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {template.category} {template.description && `• ${template.description}`}
                    </p>
                  </div>
                </div>
                
                {installed ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                    <CheckCircle2 size={16} />
                    Installed
                  </div>
                ) : (
                  <button 
                    onClick={() => onInstallTemplate(template)}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm"
                  >
                    <Plus size={16} />
                    Install
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
