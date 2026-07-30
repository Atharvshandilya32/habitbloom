import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy – HabitBloom',
  description:
    'Learn how HabitBloom collects, uses, and protects your personal data including account details, habit logs, and analytics.',
  alternates: {
    canonical: 'https://habitbloom.in/privacy',
  },
};

export default function PrivacyPage() {
  const lastUpdated = 'July 24, 2026';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-base leading-none">🌱</span>
            </div>
            <span className="text-base font-extrabold text-slate-900 tracking-tight">
              Habit<span className="text-emerald-600">Bloom</span>
            </span>
          </Link>
          <span className="text-slate-400 text-sm">/</span>
          <span className="text-sm font-medium text-slate-600">Privacy Policy</span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 mb-10">
            Last updated: <time dateTime="2026-07-24">{lastUpdated}</time>
          </p>

          <div className="prose prose-slate max-w-none space-y-10">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h2>
              <p className="text-slate-600 leading-relaxed">
                Welcome to <strong>HabitBloom</strong> (&quot;we&quot;, &quot;our&quot;, or
                &quot;us&quot;). We are committed to protecting your personal information and your
                right to privacy. This Privacy Policy explains what information we collect, how we
                use it, and what rights you have in relation to it.
              </p>
              <p className="text-slate-600 leading-relaxed mt-3">
                By using HabitBloom at{' '}
                <a
                  href="https://habitbloom.in"
                  className="text-emerald-600 hover:underline font-medium"
                >
                  habitbloom.in
                </a>
                , you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We collect only the minimum information needed to provide our service:
              </p>
              <h3 className="text-base font-semibold text-slate-800 mb-2">
                2a. Account Information
              </h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-1 leading-relaxed">
                <li>
                  <strong>Email address</strong> – used to create and identify your account,
                  authenticate you, and send important service communications.
                </li>
                <li>
                  <strong>Display name &amp; profile photo</strong> – if you sign in with Google,
                  we store the display name and avatar provided by Google.
                </li>
                <li>
                  <strong>Password</strong> – if you register with email/password, your password is
                  hashed and managed securely by Firebase Authentication. We never see or store
                  plain-text passwords.
                </li>
              </ul>

              <h3 className="text-base font-semibold text-slate-800 mb-2 mt-5">2b. Habit Data</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-1 leading-relaxed">
                <li>
                  <strong>Habits</strong> – the names, emojis, and goals you configure.
                </li>
                <li>
                  <strong>Habit logs</strong> – daily check-in records that track which habits you
                  completed on each date.
                </li>
                <li>
                  <strong>Custom goals</strong> – weekly and monthly goals you write for yourself.
                </li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-3">
                This data is stored in your personal Firebase Realtime Database node and is only
                accessible to your account.
              </p>

              <h3 className="text-base font-semibold text-slate-800 mb-2 mt-5">
                2c. Usage &amp; Analytics Data
              </h3>
              <p className="text-slate-600 leading-relaxed">
                We use standard, privacy-respecting analytics to understand how the app is used in
                aggregate. This may include page views, session duration, and general feature
                interactions. Analytics data is anonymised and does not personally identify you.
              </p>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 leading-relaxed">
                <li>To create and manage your account.</li>
                <li>To sync your habit data across devices in real-time.</li>
                <li>To provide the core functionality of the app (habit tracking, streaks, analytics).</li>
                <li>To send you account-related emails (e.g. password reset).</li>
                <li>To improve and develop new features based on aggregate usage patterns.</li>
                <li>To respond to your support requests.</li>
              </ul>
            </section>

            {/* Data Storage & Security */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                4. Data Storage &amp; Security
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Your data is stored on <strong>Google Firebase</strong> (Realtime Database and
                Authentication), which is hosted on Google Cloud infrastructure. Firebase applies
                industry-standard security measures including encryption in transit (TLS) and at
                rest.
              </p>
              <p className="text-slate-600 leading-relaxed mt-3">
                Access to your database node is protected by Firebase security rules and requires
                authenticated access using your account credentials only. No other user can read or
                write your data.
              </p>
              <p className="text-slate-600 leading-relaxed mt-3">
                We do not sell, rent, or share your personal data with third parties for marketing
                purposes.
              </p>
            </section>

            {/* Cookies & Local Storage */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                5. Cookies &amp; Local Storage
              </h2>
              <p className="text-slate-600 leading-relaxed">
                HabitBloom uses <strong>browser localStorage</strong> to cache your habit data
                locally for offline access and faster loading. Firebase Authentication may set
                session cookies to maintain your login state. No third-party advertising cookies
                are used.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">6. Data Retention</h2>
              <p className="text-slate-600 leading-relaxed">
                Your account and all associated data is retained as long as your account is active.
                If you wish to delete your account and all associated data, please contact us at the
                email address below and we will process your request within 30 days.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">7. Your Rights</h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                Depending on your location, you may have the following rights regarding your
                personal data:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 leading-relaxed">
                <li>
                  <strong>Access</strong> – request a copy of the personal data we hold about you.
                </li>
                <li>
                  <strong>Correction</strong> – request that we correct inaccurate data.
                </li>
                <li>
                  <strong>Deletion</strong> – request that we delete your account and all personal
                  data.
                </li>
                <li>
                  <strong>Portability</strong> – request your data in a portable format.
                </li>
                <li>
                  <strong>Objection</strong> – object to certain types of data processing.
                </li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-3">
                To exercise any of these rights, please contact us using the details below.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">8. Children&apos;s Privacy</h2>
              <p className="text-slate-600 leading-relaxed">
                HabitBloom is not directed at children under the age of 13. We do not knowingly
                collect personal information from children under 13. If you believe a child has
                provided us with personal information, please contact us and we will take steps to
                delete such information.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                9. Changes to This Policy
              </h2>
              <p className="text-slate-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any
                significant changes by updating the &quot;Last updated&quot; date at the top of this
                page. We encourage you to review this policy periodically.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">10. Contact Us</h2>
              <p className="text-slate-600 leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or
                your personal data, please contact us at:
              </p>
              <div className="mt-4 inline-block bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
                <p className="font-bold text-slate-900">HabitBloom</p>
                <p className="text-sm text-slate-600">
                  Website:{' '}
                  <a
                    href="https://habitbloom.in"
                    className="text-emerald-600 hover:underline"
                  >
                    https://habitbloom.in
                  </a>
                </p>
              </div>
            </section>
          </div>
        </article>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
          >
            ← Back to HabitBloom
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} HabitBloom. All rights reserved.</p>
          <nav className="flex items-center gap-4">
            <Link href="/" className="hover:text-emerald-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/privacy" className="hover:text-emerald-600 transition-colors font-semibold text-emerald-600">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
