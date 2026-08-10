import { useState, useEffect } from 'react';
import { LeaderboardEntry, UserSocialProfile } from '../../../../../lib/socialTypes';
import { fetchLeaderboardEntries } from '../../../../../lib/socialUtils';

export function useLeaderboard(
  currentUserProfile: UserSocialProfile | null,
  friendUids: string[]
) {
  const [metric, setMetric] = useState<'streak' | 'xp' | 'habits'>('streak');
  const [scope, setScope] = useState<'friends' | 'global'>('friends');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      const data = await fetchLeaderboardEntries(
        metric,
        scope,
        currentUserProfile?.uid || '',
        friendUids
      );
      if (isMounted) {
        setEntries(data);
        setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [metric, scope, currentUserProfile, friendUids]);

  return {
    metric,
    setMetric,
    scope,
    setScope,
    entries,
    isLoading,
  };
}
