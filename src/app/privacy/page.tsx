import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200">
        <h1 className="text-4xl font-black text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-8">Last Updated: August 2026</p>
        
        <div className="prose prose-slate max-w-none text-slate-600 font-medium">
          <p>
            At HabitBloom, we believe your habits are deeply personal. We are fundamentally committed to protecting your privacy, ensuring you have complete control over your data, and maintaining strict compliance with global privacy regulations, including the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> (India).
          </p>
          
          <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">1. Your Personal Data Rights (Data Principals)</h2>
          <p>
            Under the DPDP Act, you have the right to access, correct, erase, and nominate representatives for your personal data. You may withdraw your consent at any time. By <strong>November 2026</strong>, our platform will be fully integrated with government-registered <strong>Consent Managers</strong>, allowing you to seamlessly manage your consent across the HabitBloom platform from a unified dashboard.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">2. Our Role as Fiduciary vs. Processor</h2>
          <p>
            HabitBloom operates in dual roles depending on the context:
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li><strong>As a Data Fiduciary:</strong> We act as a fiduciary for your account creation data (e.g., email, name) and our direct interactions with you. We determine the purpose and means of this processing.</li>
            <li><strong>As a Data Processor:</strong> When you use HabitBloom "Spaces" via your organization or employer, we act as a Data Processor on their behalf. The organization remains the Data Fiduciary and holds the primary responsibility for securing your consent.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">3. AI & Machine Learning Restrictions</h2>
          <p>
            HabitBloom uses advanced heuristics and AI to provide personalized insights. However, we adhere to strict "Privacy by Design" principles. <strong>We absolutely do not use your personal habit data to train, fine-tune, or develop our AI models by default.</strong> If we introduce features requiring data for model training, we will request explicit, itemized consent ("Opt-In") prior to any data usage.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">4. Sub-processors and Data Security</h2>
          <p>
            We utilize secure third-party infrastructure (e.g., Firebase) to host your data. All sub-processors we use are contractually bound to uphold the same strict DPDP compliance standards. We employ enterprise-grade encryption for data in transit and at rest. In the unlikely event of a data breach, we will notify you and the Data Protection Board of India (DPBI) promptly as legally required.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">5. HabitBloom Spaces</h2>
          <p>
            When you join a HabitBloom Space (e.g., a corporate team or fitness group), your progress for specific shared challenges becomes visible to that group. Space Admins may view aggregated, anonymized analytics (e.g., "75% of members completed the daily walk"), but they cannot access individual identifiable data without your explicit consent.
          </p>
        </div>
      </div>
    </div>
  );
}
