import React from 'react';

export default function TitleBanner() {
  return (
    <header className="banner-gradient w-full py-6 px-4 text-center card-shadow">
      <div className="max-w-screen-2xl mx-auto flex flex-col items-center gap-1">
        <div className="flex items-center gap-3 justify-center">
          <span className="text-3xl">📋</span>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-wide text-foreground uppercase">
            Habit Tracker
          </h1>
          <span className="text-3xl">✅</span>
        </div>
        <p className="text-sm text-muted-foreground font-medium mt-1">
          Build consistency. Track daily. Achieve your goals.
        </p>
      </div>
    </header>
  );
}
