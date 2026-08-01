import React, { useState } from 'react';
import { X, Settings, Image as ImageIcon, Palette, Save, QrCode } from 'lucide-react';
import { Space, SpaceBranding } from '../../../../lib/spaceTypes';

interface SpaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: Space;
  onSave: (updates: Partial<Space>) => void;
}

const THEME_COLORS = [
  'indigo-600', 'blue-600', 'emerald-600', 'rose-600', 'amber-500', 'slate-900'
];

export default function SpaceSettingsModal({ isOpen, onClose, space, onSave }: SpaceSettingsModalProps) {
  const [name, setName] = useState(space.name);
  const [description, setDescription] = useState(space.description);
  
  const initialBranding = space.branding || {};
  const [themeColor, setThemeColor] = useState(initialBranding.themeColor || 'indigo-600');
  const [welcomeMessage, setWelcomeMessage] = useState(initialBranding.welcomeMessage || '');
  const [coverUrl, setCoverUrl] = useState(initialBranding.coverUrl || '');

  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'invites'>('general');

  if (!isOpen) return null;

  const handleSave = () => {
    const branding: SpaceBranding = {
      ...space.branding,
      themeColor,
      welcomeMessage,
      coverUrl
    };
    onSave({ name, description, branding });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings size={20} className="text-slate-500" />
            Space Settings
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 bg-slate-50 border-r border-slate-100 p-4 space-y-2">
            <button 
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'general' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              General
            </button>
            <button 
              onClick={() => setActiveTab('branding')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'branding' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Branding
            </button>
            <button 
              onClick={() => setActiveTab('invites')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'invites' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Invites & QR
            </button>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">General Info</h3>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Space Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Palette size={18} className="text-indigo-500" />
                  Custom Branding
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Theme Color</label>
                  <div className="flex flex-wrap gap-3">
                    {THEME_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setThemeColor(color)}
                        className={`w-10 h-10 rounded-full border-4 transition-all ${
                          themeColor === color ? 'border-white ring-2 ring-indigo-500 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: `var(--color-${color.replace('-600', '')})` }} // Simplified for tailwind classes trick, assuming custom classes or pure tailwind
                      >
                         <div className={`w-full h-full rounded-full bg-${color}`}></div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Cover Image URL</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <ImageIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={coverUrl}
                        onChange={(e) => setCoverUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Welcome Message</label>
                  <p className="text-xs text-slate-500 mb-2">Displayed to new members when they join.</p>
                  <textarea
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    rows={3}
                    placeholder="Welcome to our community!"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'invites' && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <QrCode size={18} className="text-indigo-500" />
                  QR & Invites
                </h3>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
                  <div className="w-32 h-32 bg-white rounded-xl mx-auto border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                    <QrCode size={64} className="text-slate-300" />
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1">QR Code generator</h4>
                  <p className="text-sm text-slate-500 mb-4">Print this code for your physical location (gym, studio, office).</p>
                  <button className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg text-sm">Download QR Code</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-colors"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
