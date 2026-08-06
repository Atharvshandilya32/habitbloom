import React, { useState } from 'react';
import { SpaceAnnouncement, CustomRole } from '../../../../lib/spaceTypes';
import { hasPermission } from '../../../../lib/spacePermissions';
import { Megaphone, Pin, Send, Trash2 } from 'lucide-react';

interface AnnouncementsFeedProps {
  announcements: SpaceAnnouncement[];
  role: CustomRole | null | undefined;
  onPostAnnouncement: (title: string, content: string, isPinned: boolean) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export default function AnnouncementsFeed({ announcements, role, onPostAnnouncement, onDeleteAnnouncement }: AnnouncementsFeedProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);

  const handlePost = () => {
    if (!title.trim() || !content.trim()) return;
    onPostAnnouncement(title, content, isPinned);
    setTitle('');
    setContent('');
    setIsPinned(false);
    setShowPostForm(false);
  };

  const [visibleCount, setVisibleCount] = useState(5);

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const visibleAnnouncements = sortedAnnouncements.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      
      {/* Admin Post Actions */}
      {hasPermission(role, 'sendAnnouncements') && !showPostForm && (
        <button 
          onClick={() => setShowPostForm(true)}
          className="w-full bg-white border border-slate-200 border-dashed rounded-3xl p-4 flex items-center justify-center gap-2 text-slate-500 font-bold hover:bg-slate-50 hover:text-indigo-600 transition-colors"
        >
          <Megaphone size={18} />
          Post New Announcement
        </button>
      )}

      {hasPermission(role, 'sendAnnouncements') && showPostForm && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-in slide-in-from-top-2">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Megaphone size={18} className="text-indigo-500" />
            Create Announcement
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Announcement Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
            />
            <textarea
              placeholder="What do you want to share with the community?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium resize-none"
            />
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                <input 
                  type="checkbox" 
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <Pin size={16} className={isPinned ? 'text-indigo-600' : 'text-slate-400'} />
                Pin to top
              </label>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowPostForm(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePost}
                  disabled={!title.trim() || !content.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <Send size={16} />
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-4">
        {sortedAnnouncements.length === 0 ? (
          <div className="text-center px-6 py-16 bg-white rounded-3xl border border-slate-200 border-dashed animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full mx-auto flex items-center justify-center mb-6 shadow-sm border border-slate-100">
              <Megaphone size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-3">Keep everyone in the loop.</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto mb-8 leading-relaxed">
              Announcements are the central communication hub for your Space. Use them to share updates, celebrate wins, or kick off new challenges.
            </p>
            {hasPermission(role, 'sendAnnouncements') ? (
              <button 
                onClick={() => setShowPostForm(true)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors inline-flex items-center gap-2"
              >
                <Megaphone size={16} /> Write First Announcement
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold border border-slate-200">
                Waiting for admins to post...
              </div>
            )}
          </div>
        ) : (
          <>
            {visibleAnnouncements.map((announcement) => (
              <div key={announcement.id} className="bg-background rounded-3xl border border-border p-6 shadow-sm relative group hover:shadow-md transition-shadow">
                {announcement.isPinned && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shadow-sm border border-amber-200">
                    <Pin size={14} fill="currentColor" />
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-foreground">{announcement.title}</h4>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      {new Date(announcement.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  {hasPermission(role, 'sendAnnouncements') && (
                    <button 
                      onClick={() => onDeleteAnnouncement(announcement.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Announcement"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {announcement.content.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
            
            {visibleCount < sortedAnnouncements.length && (
              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 5)}
                  className="px-6 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition-colors shadow-sm"
                >
                  Load More Announcements
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
