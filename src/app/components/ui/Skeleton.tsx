import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-slate-200/60 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm w-full">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-5" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-5 rounded-3xl mb-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32 rounded-xl" />
    </div>
  );
}
