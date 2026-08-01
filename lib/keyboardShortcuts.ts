import { useEffect } from 'react';

type Handler = () => void;

interface ShortcutOptions {
  onNewHabit: Handler;
  onSearch: Handler;
  onGoals: Handler;
  onJournal: Handler;
  onAnalytics: Handler;
  onHelp: Handler;
}

export function useKeyboardShortcuts(options: ShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Modifier checks (don't trigger if ctrl/cmd is held, unless it's a specific shortcut)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toUpperCase();
      
      switch (key) {
        case 'N':
          e.preventDefault();
          options.onNewHabit();
          break;
        case '/':
          e.preventDefault();
          options.onSearch();
          break;
        case 'G':
          e.preventDefault();
          options.onGoals();
          break;
        case 'J':
          e.preventDefault();
          options.onJournal();
          break;
        case 'A':
          e.preventDefault();
          options.onAnalytics();
          break;
        case '?':
          e.preventDefault();
          options.onHelp();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options]);
}
