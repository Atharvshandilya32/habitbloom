'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon } from 'lucide-react';
import { ref, onValue, push, set } from 'firebase/database';
import { database } from '../../../../lib/firebase';
import { UserSocialProfile, DirectMessage } from '../../../../lib/socialTypes';

interface DirectMessagesViewProps {
  currentUserProfile: UserSocialProfile | null;
  friends: UserSocialProfile[];
}

export default function DirectMessagesView({ currentUserProfile, friends }: DirectMessagesViewProps) {
  const [selectedFriend, setSelectedFriend] = useState<UserSocialProfile | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatId = currentUserProfile && selectedFriend 
    ? [currentUserProfile.uid, selectedFriend.uid].sort().join('_') 
    : null;

  useEffect(() => {
    if (!database || !chatId) return;

    const messagesRef = ref(database, `directMessages/${chatId}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as Record<string, DirectMessage>;
        const messageList = Object.values(data).sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(messageList);
        // Mark as read if not sent by me
        messageList.forEach(msg => {
          if (msg.receiverUid === currentUserProfile?.uid && !msg.read) {
            set(ref(database, `directMessages/${chatId}/${msg.id}/read`), true);
          }
        });
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [chatId, currentUserProfile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!database || !chatId || !currentUserProfile || !selectedFriend || !newMessage.trim()) return;

    const messagesRef = ref(database, `directMessages/${chatId}`);
    const newMessageRef = push(messagesRef);
    
    const message: DirectMessage = {
      id: newMessageRef.key as string,
      chatId,
      senderUid: currentUserProfile.uid,
      senderName: currentUserProfile.displayName,
      receiverUid: selectedFriend.uid,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    await set(newMessageRef, message);
    setNewMessage('');
  };

  if (!currentUserProfile) return null;

  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-[600px]">
      {/* Friends List Sidebar */}
      <div className="w-full md:w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-extrabold text-slate-900 dark:text-white">Direct Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {friends.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">
              No friends yet. Add some from the Friends tab!
            </div>
          ) : (
            friends.map(friend => (
              <button
                key={friend.uid}
                onClick={() => setSelectedFriend(friend)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                  selectedFriend?.uid === friend.uid 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {friend.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={friend.photoURL} alt={friend.displayName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <UserIcon size={20} className="text-slate-500" />
                  </div>
                )}
                <div className="text-left flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{friend.displayName}</div>
                  <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${friend.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {friend.status}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/50">
        {selectedFriend ? (
          <>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
              {selectedFriend.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedFriend.photoURL} alt={selectedFriend.displayName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <UserIcon size={16} className="text-slate-500" />
                </div>
              )}
              <h4 className="font-bold text-slate-900 dark:text-white">{selectedFriend.displayName}</h4>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  Say hi to {selectedFriend.displayName}!
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.senderUid === currentUserProfile.uid;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl p-3 ${
                        isMine 
                          ? 'bg-emerald-600 text-white rounded-br-sm' 
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-sm'
                      }`}>
                        <div className="text-sm break-words">{msg.content}</div>
                        <div className={`text-[10px] mt-1 text-right ${isMine ? 'text-emerald-200' : 'text-slate-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-emerald-500 focus:border-emerald-500 dark:text-white"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm flex-col gap-2">
            <UserIcon size={32} className="text-slate-300 dark:text-slate-700" />
            <p>Select a friend to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
