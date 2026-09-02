import { Settings, User, LogIn } from 'lucide-react';
import { ViewState, UserAccount } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  currentAccount?: UserAccount | null;
}

export function Navigation({ currentView, setView, currentAccount }: NavigationProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
      <div className="h-16 max-w-[1200px] mx-auto px-4 lg:px-6 flex items-center justify-between">
        <div className="flex-1 flex items-center">
          <button onClick={() => setView('library')} className="font-['Geist'] text-2xl font-semibold tracking-tight text-primary hover:opacity-90 transition-opacity">
            VELOCITY
          </button>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          <button 
            onClick={() => setView('library')} 
            className={`text-base transition-colors ${currentView === 'library' ? 'text-on-surface font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Library
          </button>
          <button 
            onClick={() => setView('discover')}
            className={`text-base transition-colors ${currentView === 'discover' ? 'text-on-surface font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Discover
          </button>
        </nav>
        
        <div className="flex-1 flex items-center justify-end gap-3">
          {currentAccount ? (
            <button 
              onClick={() => setView('account')} 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/30"
              title={`Logged in as @${currentAccount.username}`}
            >
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold">
                {currentAccount.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-on-surface max-w-[100px] truncate hidden sm:inline">
                {currentAccount.name}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setView('account')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          <button 
            onClick={() => setView('account')}
            className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
            title="Account Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
