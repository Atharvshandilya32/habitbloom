'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface FeatureFlags {
  isPremium: boolean;
  enableTeamChallenges: boolean;
  enableAdvancedAnalytics: boolean;
}

const defaultFlags: FeatureFlags = {
  isPremium: false,
  enableTeamChallenges: false,
  enableAdvancedAnalytics: true,
};

interface FeatureFlagContextValue {
  flags: FeatureFlags;
  togglePremium: () => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue>({
  flags: defaultFlags,
  togglePremium: () => {},
});

export const useFeatureFlags = () => useContext(FeatureFlagContext);

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);

  useEffect(() => {
    const saved = localStorage.getItem('habitbloom_premium_override');
    if (saved === 'true') {
      setFlags(prev => ({ ...prev, isPremium: true, enableTeamChallenges: true }));
    }
  }, []);

  const togglePremium = () => {
    setFlags(prev => {
      const newPremium = !prev.isPremium;
      localStorage.setItem('habitbloom_premium_override', String(newPremium));
      return { ...prev, isPremium: newPremium, enableTeamChallenges: newPremium };
    });
  };

  return (
    <FeatureFlagContext.Provider value={{ flags, togglePremium }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};
