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
import { getCurrentAccount, syncAccountData, getAllAccounts } from './lib/accountStore';

const defaultStats: UserStats = {
  totalReadTimeMs: 0,
  averageWpm: 450,
  totalWordsRead: 0,
  sessions: 0
};

export default function App() {
  const [view, setView] = useState<ViewState>('discover');
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(null);
  const [library, setLibrary] = useState<TextItem[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>(defaultStats);

  // Load active account and data on mount
  useEffect(() => {
    const acc = getCurrentAccount();
    if (acc) {
      setCurrentAccount(acc);
      setLibrary(acc.library || []);
      setStats(acc.stats || defaultStats);
    } else {
      // Check legacy standalone storage
      const savedLib = localStorage.getItem('velocity_library');
      const savedStats = localStorage.getItem('velocity_stats');
      
      if (savedLib) {
        try {
          const parsed = JSON.parse(savedLib);
          setLibrary(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error('Failed to parse library', e);
        }
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
      setLibrary(account.library || []);
      setStats(account.stats || defaultStats);
    }
  }, []);

  const handleAddText = useCallback((newText: Omit<TextItem, 'id' | 'progress' | 'lastRead'>) => {
    const text: TextItem = {
      ...newText,
      id: Math.random().toString(36).substring(2, 15),
      progress: 0,
      lastRead: Date.now(),
    };
    setLibrary(prev => [text, ...prev]);
    setActiveTextId(text.id);
    setView('reader');
  }, []);

  const handleUpdateProgress = useCallback((id: string, progress: number) => {
    setLibrary(prev => {
      const item = prev.find(t => t.id === id);
      if (item && item.progress === progress) return prev;
      return prev.map(t => 
        t.id === id ? { ...t, progress, lastRead: Date.now() } : t
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
    <div className="min-h-screen bg-surface text-on-surface font-['Geist'] antialiased">
      {view !== 'reader' && (
        <Navigation 
          currentView={view} 
          setView={setView} 
          currentAccount={currentAccount} 
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
          />
        )}
        
        {view === 'reader' && activeText && (
          <ReaderView 
            textItem={activeText}
            setView={setView}
            onUpdateProgress={handleUpdateProgress}
            onUpdateStats={handleUpdateStats}
          />
        )}
      </main>
    </div>
  );
}
