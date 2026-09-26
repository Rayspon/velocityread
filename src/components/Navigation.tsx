import { BookMarked, Feather, Moon, Sun, User, Settings, LogIn, Library as LibraryIcon, Compass } from 'lucide-react';
import { ViewState, UserAccount } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  currentAccount?: UserAccount | null;
  theme?: 'parchment' | 'dark-leather';
  onToggleTheme?: () => void;
}

export function Navigation({ 
  currentView, 
  setView, 
  currentAccount, 
  theme = 'dark-leather', 
  onToggleTheme 
}: NavigationProps) {
  return (
    <>
      {/* Top Header Navigation */}
      <header className="fixed top-0 w-full z-40 bg-surface/92 backdrop-blur-md border-b border-outline-variant/40 shadow-xs transition-colors duration-300">
        <div className="h-[2px] w-full bg-gradient-to-r from-secondary/10 via-secondary/60 to-secondary/10"></div>

        <div className="h-16 md:h-20 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('library')} 
              className="group text-left flex items-center gap-3 transition-transform active:scale-98"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-md border border-secondary/40 bg-surface-container flex items-center justify-center text-primary shadow-xs group-hover:border-secondary transition-colors">
                <BookMarked className="w-5 h-5 text-primary group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <span className="font-['Cinzel_Decorative'] font-bold text-lg md:text-2xl tracking-wide text-on-surface group-hover:text-primary transition-colors block leading-none">
                  VELOCITY
                </span>
                <span className="font-['Cinzel'] text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-on-surface-variant block mt-1">
                  Speed Reader
                </span>
              </div>
            </button>
          </div>
          
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-12">
            <button 
              onClick={() => setView('library')} 
              className={`font-['Cinzel'] text-xs lg:text-sm tracking-[0.18em] uppercase transition-all py-2 border-b-2 ${
                currentView === 'library' 
                  ? 'text-primary font-bold border-primary' 
                  : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant/40'
              }`}
            >
              Library
            </button>
            
            <button 
              onClick={() => setView('discover')} 
              className={`font-['Cinzel'] text-xs lg:text-sm tracking-[0.18em] uppercase transition-all py-2 border-b-2 ${
                currentView === 'discover' 
                  ? 'text-primary font-bold border-primary' 
                  : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant/40'
              }`}
            >
              How It Works
            </button>

            <button 
              onClick={() => setView('input')} 
              className={`font-['Cinzel'] text-xs lg:text-sm tracking-[0.18em] uppercase transition-all py-2 border-b-2 flex items-center gap-2 ${
                currentView === 'input' 
                  ? 'text-primary font-bold border-primary' 
                  : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant/40'
              }`}
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Add Text</span>
            </button>
          </nav>
          
          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="w-10 h-10 rounded-md border border-outline-variant/50 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-secondary flex items-center justify-center transition-all shadow-xs"
                title={theme === 'dark-leather' ? "Switch to Light Theme" : "Switch to Dark Theme"}
                aria-label="Toggle dark/light theme"
              >
                {theme === 'dark-leather' ? (
                  <Sun className="w-4 h-4 text-secondary" />
                ) : (
                  <Moon className="w-4 h-4 text-on-surface-variant" />
                )}
              </button>
            )}

            {/* Account Profile button */}
            {currentAccount ? (
              <button 
                onClick={() => setView('account')} 
                className="flex items-center gap-2.5 px-3 py-1.5 md:py-2 rounded-md border border-outline-variant/60 bg-surface-container hover:bg-surface-container-high transition-colors shadow-xs"
                title={`Account: ${currentAccount.name}`}
              >
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-['Cinzel'] font-bold border border-secondary/40 shadow-inner">
                  {currentAccount.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-['Cinzel'] text-xs font-semibold text-on-surface max-w-[110px] truncate hidden sm:inline">
                  {currentAccount.name}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setView('account')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-md border border-primary/40 bg-primary text-on-primary text-xs font-['Cinzel'] font-bold tracking-wider uppercase hover:opacity-90 active:scale-95 transition-all shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            <button 
              onClick={() => setView('account')}
              className="w-10 h-10 rounded-md border border-outline-variant/40 hidden sm:flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation" 
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-surface/96 backdrop-blur-lg border-t border-outline-variant/50 shadow-lg px-3 py-2 flex items-center justify-around"
      >
        <button
          onClick={() => setView('library')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg min-w-[60px] min-h-[48px] transition-colors ${
            currentView === 'library' ? 'text-primary font-bold bg-surface-container' : 'text-on-surface-variant'
          }`}
        >
          <LibraryIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-['Cinzel'] tracking-wider uppercase">Library</span>
        </button>

        <button
          onClick={() => setView('discover')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg min-w-[60px] min-h-[48px] transition-colors ${
            currentView === 'discover' ? 'text-primary font-bold bg-surface-container' : 'text-on-surface-variant'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-['Cinzel'] tracking-wider uppercase">Guide</span>
        </button>

        <button
          onClick={() => setView('input')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg min-w-[60px] min-h-[48px] transition-colors ${
            currentView === 'input' ? 'text-primary font-bold bg-surface-container' : 'text-on-surface-variant'
          }`}
        >
          <Feather className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-['Cinzel'] tracking-wider uppercase">Add Text</span>
        </button>

        <button
          onClick={() => setView('account')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg min-w-[60px] min-h-[48px] transition-colors ${
            currentView === 'account' ? 'text-primary font-bold bg-surface-container' : 'text-on-surface-variant'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-['Cinzel'] tracking-wider uppercase">Account</span>
        </button>
      </nav>
    </>
  );
}
