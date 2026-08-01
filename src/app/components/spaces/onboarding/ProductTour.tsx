'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-spaces-home',
    title: 'Welcome to Spaces!',
    content: 'This is the main dashboard for your organization. Catch up on announcements here.',
    position: 'bottom'
  },
  {
    targetId: 'tour-spaces-challenges',
    title: 'Community Challenges',
    content: 'Compete in time-bound challenges with your community to build consistency.',
    position: 'bottom'
  },
  {
    targetId: 'tour-spaces-templates',
    title: 'Shared Habit Packs',
    content: '1-click install habits curated by your admins directly into your personal tracker.',
    position: 'bottom'
  }
];

interface ProductTourProps {
  onComplete: () => void;
}

export default function ProductTour({ onComplete }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  
  useEffect(() => {
    const step = TOUR_STEPS[currentStep];
    const el = document.getElementById(step.targetId);
    
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a small delay to allow smooth scroll to finish before calculating position
      const timeout = setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      // If target element isn't found on the current screen, just center the modal
      setTargetRect(null);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = TOUR_STEPS[currentStep];

  // Calculate popover styles based on target element
  let popoverStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999
  };

  if (targetRect) {
    // Simple bottom positioning logic for now
    popoverStyle = {
      position: 'fixed',
      top: targetRect.bottom + 16,
      left: Math.max(16, targetRect.left + (targetRect.width / 2) - 160), // Center but prevent off-screen left
      zIndex: 9999
    };
  }

  return (
    <>
      {/* Highlighting Overlay (if target found) */}
      {targetRect && (
        <div 
          className="fixed inset-0 z-[9998] pointer-events-none bg-slate-900/20 transition-all duration-300"
          style={{
            clipPath: `polygon(
              0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, 
              ${targetRect.left - 8}px ${targetRect.top - 8}px,
              ${targetRect.right + 8}px ${targetRect.top - 8}px,
              ${targetRect.right + 8}px ${targetRect.bottom + 8}px,
              ${targetRect.left - 8}px ${targetRect.bottom + 8}px,
              ${targetRect.left - 8}px ${targetRect.top - 8}px
            )`
          }}
        />
      )}

      {/* Tour Modal */}
      <div 
        className="w-[320px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 animate-in fade-in zoom-in-95 duration-200"
        style={popoverStyle}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-slate-800">{step.title}</h4>
          <button 
            onClick={onComplete}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Skip Tour"
          >
            <X size={16} />
          </button>
        </div>
        
        <p className="text-sm text-slate-600 mb-5 leading-relaxed">
          {step.content}
        </p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2 h-2 rounded-full ${idx === currentStep ? 'bg-indigo-600' : 'bg-slate-200'}`}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={handleNext}
              className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              {currentStep === TOUR_STEPS.length - 1 ? (
                <>Finish <Check size={14} /></>
              ) : (
                <>Next <ChevronRight size={14} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
