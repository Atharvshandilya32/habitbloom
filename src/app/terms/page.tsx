import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200">
        <h1 className="text-4xl font-black text-slate-900 mb-6">Terms of Service</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-8">Last Updated: August 2026</p>
        
        <div className="prose prose-slate max-w-none text-slate-600 font-medium">
          <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using HabitBloom and HabitBloom Spaces, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">2. Community Guidelines</h2>
          <p>
            HabitBloom Spaces are designed to foster positive growth. You agree not to:
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li>Harass, abuse, or harm other members of your Space.</li>
            <li>Post inappropriate, offensive, or illegal content in Announcements or Challenges.</li>
            <li>Spam communities with unsolicited promotions.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">3. Organization Administration</h2>
          <p>
            If you create a Space, you are responsible for managing its members and content. HabitBloom reserves the right to suspend any Space that violates our community guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
