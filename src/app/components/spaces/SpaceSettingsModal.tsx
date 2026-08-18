import React, { useState, useEffect } from 'react';
import { X, Settings, Image as ImageIcon, Palette, Save, QrCode, Download, Copy, Shield, Plus, FileSpreadsheet, History } from 'lucide-react';
import RosterUploadModal from './admin/RosterUploadModal';
import AuditLogViewer from './admin/AuditLogViewer';
import { QRCodeSVG } from 'qrcode.react';
import { Space, SpaceBranding, SpaceInvite, CustomRole, SpacePermissions } from '../../../../lib/spaceTypes';
import { createPermissions } from '../../../../lib/spaceTemplates';
import { database } from '../../../../lib/firebase';
import { ref, set, get, onValue, off, query, orderByChild, equalTo } from 'firebase/database';
import { generateSpaceInvite } from '../../../../lib/spaceUtils';
import { toast } from 'sonner';

interface SpaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: Space;
  initialTab?: 'general' | 'branding' | 'invites' | 'roles' | 'roster' | 'audit';
  onSave: (updates: Partial<Space>) => void;
  currentUserId?: string;
  currentUserName?: string;
}

const THEME_COLORS = [
  'indigo-600', 'blue-600', 'emerald-600', 'rose-600', 'amber-500', 'slate-900'
];

const THEME_COLOR_MAP: Record<string, string> = {
  'indigo-600': 'bg-indigo-600',
  'blue-600': 'bg-blue-600',
  'emerald-600': 'bg-emerald-600',
  'rose-600': 'bg-rose-600',
  'amber-500': 'bg-amber-500',
  'slate-900': 'bg-slate-900',
};

export default function SpaceSettingsModal({ isOpen, onClose, space, initialTab = 'general', onSave, currentUserId = 'admin', currentUserName = 'Admin' }: SpaceSettingsModalProps) {
  const [name, setName] = useState(space.name);
  const [description, setDescription] = useState(space.description);
  
  const initialBranding = space.branding || {};
  const [themeColor, setThemeColor] = useState(initialBranding.themeColor || 'indigo-600');
  const [welcomeMessage, setWelcomeMessage] = useState(initialBranding.welcomeMessage || '');
  const [coverUrl, setCoverUrl] = useState(initialBranding.coverUrl || '');

  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'invites' | 'roles' | 'roster' | 'audit'>(initialTab);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [primaryIdLabel, setPrimaryIdLabel] = useState(space.identityConfig?.primaryIdLabel || 'Admission Number');

  // Custom Roles State
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  
  // New/Edit Role Form Fields
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [roleColor, setRoleColor] = useState('indigo-600');
  const [rolePermissions, setRolePermissions] = useState<SpacePermissions>(createPermissions());

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'invites' && database && !inviteCode) {
      const invitesQuery = query(ref(database, 'spaceInvites'), orderByChild('spaceId'), equalTo(space.id));
      get(invitesQuery).then(snap => {
        if (snap.exists()) {
          const invites = snap.val();
          const existing = Object.values(invites)[0] as SpaceInvite;
          if (existing) setInviteCode(existing.code);
        }
      });
    }

    if ((activeTab === 'roles' || isOpen) && database) {
      const rolesRef = ref(database, `spaceRoles/${space.id}`);
      const unsubscribe = onValue(rolesRef, (snapshot) => {
        if (snapshot.exists()) {
          const rolesObj = snapshot.val();
          const list = Object.values(rolesObj) as CustomRole[];
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          setCustomRoles(list);
        }
      });
      return () => off(rolesRef, 'value', unsubscribe);
    }
  }, [activeTab, space.id, inviteCode, isOpen]);

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

  const handleGenerateInvite = () => {
    const invite = generateSpaceInvite(space.id, space.createdBy);
    if (database) {
      set(ref(database, `spaceInvites/${invite.code}`), invite);
      setInviteCode(invite.code);
    }
  };

  const handleOpenRoleForm = (roleToEdit?: CustomRole) => {
    if (roleToEdit) {
      setEditingRole(roleToEdit);
      setRoleName(roleToEdit.name);
      setRoleDesc(roleToEdit.description || '');
      setRoleColor(roleToEdit.color || 'indigo-600');
      setRolePermissions(roleToEdit.permissions || createPermissions());
    } else {
      setEditingRole(null);
      setRoleName('');
      setRoleDesc('');
      setRoleColor('indigo-600');
      setRolePermissions(createPermissions());
    }
    setShowRoleForm(true);
  };

  const handleSaveRole = () => {
    if (!roleName.trim() || !database) return;
    
    const roleId = editingRole ? editingRole.id : `role-custom-${Date.now()}`;
    const newRole: CustomRole = {
      id: roleId,
      spaceId: space.id,
      name: roleName.trim(),
      description: roleDesc.trim(),
      color: roleColor,
      icon: editingRole?.icon || 'shield',
      permissions: rolePermissions,
      order: editingRole ? editingRole.order : customRoles.length + 1
    };

    set(ref(database, `spaceRoles/${space.id}/${roleId}`), newRole);
    setShowRoleForm(false);
  };

  const inviteUrl = inviteCode 
    ? (typeof window !== 'undefined' ? `${window.location.origin}/invite/${inviteCode}` : `https://habitbloom.in/invite/${inviteCode}`)
    : '';

  const handleDownloadQR = () => {
    const svg = document.getElementById('space-qr-code');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        const a = document.createElement('a');
        a.download = `${space.name.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      }
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
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

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-48 md:shrink-0 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-4 flex md:flex-col gap-2 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('general')}
              className={`w-auto md:w-full whitespace-nowrap text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'general' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              General
            </button>
            <button 
              onClick={() => setActiveTab('branding')}
              className={`w-auto md:w-full whitespace-nowrap text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'branding' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Branding
            </button>
            <button 
              onClick={() => setActiveTab('invites')}
              className={`w-auto md:w-full whitespace-nowrap text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'invites' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Invites & QR
            </button>
            <button 
              onClick={() => setActiveTab('roles')}
              className={`w-auto md:w-full whitespace-nowrap text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 justify-between ${activeTab === 'roles' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <span>Community Roles</span>
              <Shield size={14} className="text-slate-400 hidden md:block" />
            </button>
            <button 
              onClick={() => setActiveTab('roster')}
              className={`w-auto md:w-full whitespace-nowrap text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 justify-between ${activeTab === 'roster' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <span>Roster & Verification</span>
              <FileSpreadsheet size={14} className="text-slate-400 hidden md:block" />
            </button>
            <button 
              onClick={() => setActiveTab('audit')}
              className={`w-auto md:w-full whitespace-nowrap text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 justify-between ${activeTab === 'audit' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <span>Audit Logs</span>
              <History size={14} className="text-slate-400 hidden md:block" />
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
                        type="button"
                        onClick={() => setThemeColor(color)}
                        className={`w-10 h-10 rounded-full border-4 transition-all ${
                          themeColor === color ? 'border-white ring-2 ring-indigo-500 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                        }`}
                        title={color}
                      >
                         <div className={`w-full h-full rounded-full ${THEME_COLOR_MAP[color] || 'bg-indigo-600'}`}></div>
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
                
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center">
                  {!inviteCode ? (
                    <div className="py-8">
                      <p className="text-slate-500 mb-4 font-medium">No active invite link for this space.</p>
                      <button 
                        onClick={handleGenerateInvite}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors"
                      >
                        Generate Invite Link
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-32 h-32 bg-white rounded-2xl mx-auto border border-slate-200 flex items-center justify-center mb-5 shadow-sm overflow-hidden p-2">
                        <QRCodeSVG 
                          id="space-qr-code"
                          value={inviteUrl} 
                          size={110} 
                          level="H"
                          includeMargin={false}
                          fgColor="#0f172a"
                        />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mb-2">Space Invite & QR Code</h4>
                      <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                        Members can scan this code to instantly join your space. Perfect for printing at physical locations like gyms, offices, or studios.
                      </p>
                      
                      <div className="flex items-center gap-2 max-w-sm mx-auto mb-6 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                        <input id="invite-url-input" type="text" readOnly value={inviteUrl} className="flex-1 text-xs text-slate-500 bg-transparent outline-none px-2 font-medium" />
                        <button onClick={() => {
                          if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(inviteUrl);
                            toast.success('Space link copied.');
                          } else {
                            const input = document.getElementById('invite-url-input') as HTMLInputElement;
                            if (input) {
                              input.select();
                              input.setSelectionRange(0, 99999); // For mobile devices
                              try {
                                document.execCommand('copy');
                                toast.success('Space link copied.');
                              } catch {
                                toast.error("Couldn't copy the link. Please try again.");
                              }
                            }
                          }
                        }} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors" title="Copy Link">
                          <Copy size={16} />
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button 
                          onClick={handleDownloadQR}
                          className="w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 font-bold rounded-xl transition-colors"
                        >
                          <Download size={16} />
                          Download QR
                        </button>
                        <button 
                          onClick={handleGenerateInvite}
                          className="w-full sm:w-auto px-5 py-2.5 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 font-bold rounded-xl transition-colors"
                        >
                          Regenerate Link
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'roles' && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Shield size={18} className="text-indigo-500" />
                      Community Roles & Permissions
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure custom roles tailored to your organization.
                    </p>
                  </div>
                  {!showRoleForm && (
                    <button
                      onClick={() => handleOpenRoleForm()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      <Plus size={14} />
                      <span>New Role</span>
                    </button>
                  )}
                </div>

                {showRoleForm ? (
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in duration-200">
                    <h4 className="font-bold text-slate-800 text-sm">
                      {editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Community Role'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Role Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Senior Trainer, Vice Principal"
                          value={roleName}
                          onChange={(e) => setRoleName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Badge Color</label>
                        <select
                          value={roleColor}
                          onChange={(e) => setRoleColor(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                          <option value="indigo-600">Indigo</option>
                          <option value="emerald-600">Emerald</option>
                          <option value="purple-600">Purple</option>
                          <option value="amber-500">Amber</option>
                          <option value="rose-600">Rose</option>
                          <option value="slate-900">Dark Slate</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Description</label>
                      <input
                        type="text"
                        placeholder="Briefly describe what members with this role do..."
                        value={roleDesc}
                        onChange={(e) => setRoleDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Permissions Checklist</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                        {[
                          { key: 'manageMembers', label: 'Manage Members & Roles' },
                          { key: 'inviteMembers', label: 'Generate Invites' },
                          { key: 'createChallenges', label: 'Create & Edit Challenges' },
                          { key: 'sendAnnouncements', label: 'Post Announcements' },
                          { key: 'manageTemplates', label: 'Create Habit Templates' },
                          { key: 'viewAnalytics', label: 'View Organization Analytics' },
                          { key: 'manageBranding', label: 'Edit Space Settings' },
                          { key: 'manageRoles', label: 'Create & Edit Custom Roles' },
                        ].map(perm => (
                          <label key={perm.key} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-slate-50 rounded">
                            <input
                              type="checkbox"
                              checked={!!rolePermissions[perm.key as keyof SpacePermissions]}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setRolePermissions(prev => ({ ...prev, [perm.key]: checked }));
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="font-semibold text-slate-700">{perm.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setShowRoleForm(false)}
                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveRole}
                        disabled={!roleName.trim()}
                        className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                      >
                        Save Role
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customRoles.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                        <p className="text-sm font-medium text-slate-500">No custom roles defined yet.</p>
                      </div>
                    ) : (
                      customRoles.map(role => (
                        <div key={role.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{role.name}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                                {Object.values(role.permissions || {}).filter(Boolean).length} permissions
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              {role.description || 'Community role'}
                            </p>
                          </div>

                          <button
                            onClick={() => handleOpenRoleForm(role)}
                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl transition-colors shrink-0"
                          >
                            Edit Permissions
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'roster' && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <FileSpreadsheet size={18} className="text-indigo-500" />
                      Organization Roster & Verification
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Set organization identifier label and upload CSV roster for auto-verification.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRosterModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <Plus size={14} />
                    <span>Upload CSV Roster</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Primary Organization Identifier Label
                    </label>
                    <select
                      value={primaryIdLabel}
                      onChange={(e) => {
                        setPrimaryIdLabel(e.target.value);
                        if (database) {
                          set(ref(database, `spaces/${space.id}/identityConfig`), {
                            ...space.identityConfig,
                            primaryIdLabel: e.target.value,
                            requireVerification: true,
                          });
                        }
                      }}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="Admission Number">Admission Number (School / College)</option>
                      <option value="Member ID">Member ID (Gym / Studio)</option>
                      <option value="Employee ID">Employee ID (Company)</option>
                      <option value="Athlete Number">Athlete Number (Sports Academy)</option>
                      <option value="Student ID">Student ID (Coaching Institute)</option>
                      <option value="Volunteer ID">Volunteer ID (Community / NGO)</option>
                    </select>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
                    <h4 className="font-bold text-indigo-900 text-xs">How Verification Works</h4>
                    <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                      When users join <strong>{space.name}</strong>, they enter their {primaryIdLabel}. If a match exists in your uploaded roster CSV, they automatically receive official verification and their assigned role instantly.
                    </p>
                  </div>
                </div>

                <RosterUploadModal
                  isOpen={showRosterModal}
                  onClose={() => setShowRosterModal(false)}
                  spaceId={space.id}
                  spaceName={space.name}
                  actor={{ id: currentUserId, name: currentUserName }}
                />
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-4 animate-in slide-in-from-right-4">
                <AuditLogViewer spaceId={space.id} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
