import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl mb-6 shadow-lg">
        🌱
      </div>
      <h1 className="text-4xl font-black tracking-tight text-white mb-2">404 — Page Not Found</h1>
      <p className="text-slate-400 max-w-md mb-8 font-medium">
        The page or habit space you are looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl transition-all shadow-md"
      >
        Return to HabitBloom
      </Link>
    </div>
  );
}
