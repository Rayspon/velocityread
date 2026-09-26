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
import { CLASSIC_LIBRARY_ITEMS } from './lib/classicBooks';

const defaultStats: UserStats = {
  totalReadTimeMs: 420000, // 7m of classic reading
  averageWpm: 480,
  totalWordsRead: 3360,
  sessions: 5
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
      const userLib = acc.library && acc.library.length > 0 ? acc.library : CLASSIC_LIBRARY_ITEMS;
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
          const libArray = Array.isArray(parsed) && parsed.length > 0 ? parsed : CLASSIC_LIBRARY_ITEMS;
          const sanitized = libArray.map(item => ({
            ...item,
            progress: roundProgress(item.progress)
          }));
          setLibrary(sanitized);
        } catch (e) {
          console.error('Failed to parse library', e);
          setLibrary(CLASSIC_LIBRARY_ITEMS);
        }
      } else {
        setLibrary(CLASSIC_LIBRARY_ITEMS);
      }
      
      if (savedStats) {
        try {
          const parsed = JSON.parse(savedStats);
          setStats(parsed && typeof parsed === 'object' ? { ...defaultStats, ...parsed } : defaultStats);
        } catch (e) {
          console.error('Failed to parse stats', e);
        }
      }
    }
  }, []);

  // Save changes locally and sync with active account
  useEffect(() => {
    if (library.length > 0) {
      localStorage.setItem('velocity_library', JSON.stringify(library));
    }
    localStorage.setItem('velocity_stats', JSON.stringify(stats));

    if (currentAccount) {
      syncAccountData(currentAccount.username, library, stats);
    }
  }, [library, stats, currentAccount]);

  // Handle switching or logging into an account
  const handleAccountChange = useCallback((account: UserAccount | null) => {
    setCurrentAccount(account);
    if (account) {
      const userLib = account.library && account.library.length > 0 ? account.library : CLASSIC_LIBRARY_ITEMS;
      const sanitized = userLib.map(item => ({
        ...item,
        progress: roundProgress(item.progress)
      }));
      setLibrary(sanitized);
      setStats(account.stats || defaultStats);
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
      const newAvgWpm = ((prev.averageWpm * prev.sessions) + wpm) / newTotalSessions;
      
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
