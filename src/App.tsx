/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { LibraryView } from './components/LibraryView';
import { InputView } from './components/InputView';
import { ReaderView } from './components/ReaderView';
import { DiscoverView } from './components/DiscoverView';
import { AccountView } from './components/AccountView';
import { ViewState, TextItem, UserStats, UserAccount } from './types';
import { getCurrentAccount, syncAccountData } from './lib/accountStore';

const defaultStats: UserStats = {
  totalReadTimeMs: 0,
  averageWpm: 0,
  totalWordsRead: 0,
  sessions: 0
};

export default function App() {
  const [view, setView] = useState<ViewState>('library');
  const [theme, setTheme] = useState<'parchment' | 'dark-leather'>(() => {
    return (localStorage.getItem('velocity_theme') as 'parchment' | 'dark-leather') || 'dark-leather';
  });
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(null);
  const [library, setLibrary] = useState<TextItem[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>(defaultStats);

  // Helper to round up progress to clean integer
  const roundProgress = (p: number) => {
    if (typeof p !== 'number' || isNaN(p)) return 0;
    return p >= 100 ? 100 : Math.min(99, Math.ceil(p));
  };

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'parchment' ? 'dark-leather' : 'parchment';
      localStorage.setItem('velocity_theme', next);
      return next;
    });
  }, []);

  // Sync theme class to document body
  useEffect(() => {
    if (theme === 'dark-leather') {
      document.documentElement.classList.add('theme-dark-leather');
    } else {
      document.documentElement.classList.remove('theme-dark-leather');
    }
  }, [theme]);

  // Load active account and data on mount
  useEffect(() => {
    const acc = getCurrentAccount();
    if (acc) {
      setCurrentAccount(acc);
      const userLib = Array.isArray(acc.library) ? acc.library : [];
      const sanitized = userLib.map(item => ({
        ...item,
        progress: roundProgress(item.progress)
      }));
      setLibrary(sanitized);
      setStats(acc.stats || defaultStats);
    } else {
      // Check legacy standalone storage
      const savedLib = localStorage.getItem('velocity_library');
      const savedStats = localStorage.getItem('velocity_stats');
      
      if (savedLib) {
        try {
          const parsed = JSON.parse(savedLib);
          if (Array.isArray(parsed)) {
            // Remove any legacy pre-seeded classic books so unauthenticated users start with an empty library
            const realItems = parsed.filter(item => !item.id?.startsWith('classic-'));
            const sanitized = realItems.map(item => ({
              ...item,
              progress: roundProgress(item.progress)
            }));
            setLibrary(sanitized);
            localStorage.setItem('velocity_library', JSON.stringify(sanitized));
          } else {
            setLibrary([]);
            localStorage.setItem('velocity_library', JSON.stringify([]));
          }
        } catch (e) {
          console.error('Failed to parse library', e);
          setLibrary([]);
          localStorage.setItem('velocity_library', JSON.stringify([]));
        }
      } else {
        setLibrary([]);
      }
      
      if (savedStats) {
        try {
          const parsed = JSON.parse(savedStats);
          // If the stats match the previous hardcoded values (420000ms / 5 sessions / 480 wpm), reset to 0
          if (parsed && (parsed.totalReadTimeMs === 420000 || (parsed.sessions === 5 && parsed.averageWpm === 480))) {
            setStats(defaultStats);
            localStorage.setItem('velocity_stats', JSON.stringify(defaultStats));
          } else if (parsed && typeof parsed === 'object') {
            setStats({ ...defaultStats, ...parsed });
          } else {
            setStats(defaultStats);
            localStorage.setItem('velocity_stats', JSON.stringify(defaultStats));
          }
        } catch (e) {
          console.error('Failed to parse stats', e);
          setStats(defaultStats);
        }
      } else {
        setStats(defaultStats);
      }
    }
  }, []);

  // Save changes locally and sync with active account
  useEffect(() => {
    localStorage.setItem('velocity_library', JSON.stringify(library));
    localStorage.setItem('velocity_stats', JSON.stringify(stats));

    if (currentAccount) {
      syncAccountData(currentAccount.username, library, stats);
    }
  }, [library, stats, currentAccount]);

  // Handle switching or logging into an account
  const handleAccountChange = useCallback((account: UserAccount | null) => {
    setCurrentAccount(account);
    if (account) {
      const userLib = Array.isArray(account.library) ? account.library : [];
      const sanitized = userLib.map(item => ({
        ...item,
        progress: roundProgress(item.progress)
      }));
      setLibrary(sanitized);
      setStats(account.stats || defaultStats);
    } else {
      // Switched to guest / logged out
      setLibrary([]);
      setStats(defaultStats);
      localStorage.setItem('velocity_library', JSON.stringify([]));
      localStorage.setItem('velocity_stats', JSON.stringify(defaultStats));
    }
  }, []);

  const handleAddText = useCallback((newText: Omit<TextItem, 'id' | 'progress' | 'lastRead'>) => {
    const text: TextItem = {
      ...newText,
      id: 'folio-' + Math.random().toString(36).substring(2, 10),
      progress: 0,
      lastRead: Date.now(),
    };
    setLibrary(prev => [text, ...prev]);
    setActiveTextId(text.id);
    setView('reader');
  }, []);

  const handleDeleteText = useCallback((id: string) => {
    setLibrary(prev => prev.filter(item => item.id !== id));
    if (activeTextId === id) {
      setActiveTextId(null);
    }
  }, [activeTextId]);

  const handleUpdateProgress = useCallback((id: string, progress: number) => {
    const rounded = roundProgress(progress);
    setLibrary(prev => {
      const item = prev.find(t => t.id === id);
      if (item && item.progress === rounded) return prev;
      return prev.map(t => 
        t.id === id ? { ...t, progress: rounded, lastRead: Date.now() } : t
      );
    });
  }, []);

  const handleUpdateStats = useCallback((timeMs: number, wpm: number) => {
    if (timeMs < 1000) return; // Ignore sessions shorter than 1 second to avoid noise
    setStats(prev => {
      const newTotalSessions = prev.sessions + 1;
      const newAvgWpm = prev.sessions === 0 ? wpm : Math.round(((prev.averageWpm * prev.sessions) + wpm) / newTotalSessions);
      
      return {
        ...prev,
        totalReadTimeMs: prev.totalReadTimeMs + timeMs,
        averageWpm: newAvgWpm,
        sessions: newTotalSessions
      };
    });
  }, []);

  const activeText = library.find(t => t.id === activeTextId);

  return (
    <div className={`min-h-screen bg-surface text-on-surface font-serif antialiased transition-colors duration-300 ${theme === 'dark-leather' ? 'theme-dark-leather' : ''}`}>
      {view !== 'reader' && (
        <Navigation 
          currentView={view} 
          setView={setView} 
          currentAccount={currentAccount} 
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      
      <main className="w-full flex-1">
        {view === 'discover' && (
          <DiscoverView setView={setView} />
        )}

        {view === 'library' && (
          <LibraryView 
            library={library} 
            setView={setView} 
            stats={stats}
            onSelectText={(id) => {
              setActiveTextId(id);
              setView('reader');
            }} 
            onDeleteText={handleDeleteText}
          />
        )}
        
        {view === 'input' && (
          <InputView 
            setView={setView} 
            onAddText={handleAddText} 
          />
        )}
        
        {view === 'account' && (
          <AccountView 
            setView={setView} 
            currentAccount={currentAccount}
            onAccountChange={handleAccountChange}
            currentStats={stats}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}
        
        {view === 'reader' && activeText && (
          <ReaderView 
            textItem={activeText}
            setView={setView}
            onUpdateProgress={handleUpdateProgress}
            onUpdateStats={handleUpdateStats}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}
      </main>
    </div>
  );
}
