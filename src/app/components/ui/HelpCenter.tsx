import React, { useState } from 'react';
import { Search, Book, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    q: 'What is a Space?',
    a: 'A Space is a private or public community where you can track habits together, share templates, and participate in challenges.'
  },
  {
    q: 'Who can see my personal habits?',
    a: 'Your personal habits are completely private. Only habits you explicitly choose to share or track within a Space Challenge are visible to others.'
  },
  {
    q: 'How do I invite members to my Space?',
    a: 'If you are an Admin, you can click the "Invite" button on the Space Dashboard to generate a unique invite link.'
  }
];

export default function HelpCenter() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filteredFaqs = FAQS.filter(faq => 
    faq.q.toLowerCase().includes(search.toLowerCase()) || 
    faq.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden max-w-2xl mx-auto">
      <div className="bg-indigo-600 p-8 text-center text-white">
        <Book size={32} className="mx-auto mb-4 opacity-80" />
        <h2 className="text-2xl font-black mb-2">How can we help?</h2>
        <div className="relative max-w-md mx-auto mt-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search the knowledge base..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <MessageCircle size={18} className="text-indigo-600" />
          Frequently Asked Questions
        </h3>
        
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? filteredFaqs.map((faq, idx) => (
            <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden">
              <button 
                onClick={() => setExpanded(expanded === idx ? null : idx)}
                className="w-full text-left px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors flex justify-between items-center"
              >
                <span className="font-bold text-slate-700">{faq.q}</span>
                {expanded === idx ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              {expanded === idx && (
                <div className="px-5 py-4 bg-white text-sm text-slate-600 font-medium border-t border-slate-50">
                  {faq.a}
                </div>
              )}
            </div>
          )) : (
            <p className="text-center py-4 text-slate-500 font-medium">No results found for &quot;{search}&quot;</p>
          )}
        </div>
      </div>
    </div>
  );
}
