import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200">
        <h1 className="text-4xl font-black text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-8">Last Updated: August 2026</p>
        
        <div className="prose prose-slate max-w-none text-slate-600 font-medium">
          <p>
            At HabitBloom, we believe your habits are deeply personal. We are fundamentally committed to protecting your privacy and ensuring you have complete control over your data.
          </p>
          
          <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">1. Your Personal Habits are Private</h2>
          <p>
            By default, everything you track in your Personal Dashboard is completely private to you. Neither your organization admins, your coaches, nor your fellow community members can see your personal habits unless you explicitly choose to share them.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">2. HabitBloom Spaces</h2>
          <p>
            When you join a HabitBloom Space (e.g., your company or gym), you are participating in a shared environment. 
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li><strong>Challenges:</strong> If you join a community challenge, your progress for that specific challenge will be visible to other participants.</li>
            <li><strong>Analytics:</strong> Space Admins can view aggregated, anonymized analytics (e.g., &quot;75% of members completed the daily walk&quot;). They cannot see individual user data without explicit consent.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">3. Data Security</h2>
          <p>
            We use enterprise-grade encryption to secure your data both in transit and at rest. We do not sell your data to third parties. Ever.
          </p>
        </div>
      </div>
    </div>
  );
}
