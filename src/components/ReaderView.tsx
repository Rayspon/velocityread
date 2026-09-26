import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Settings, 
  ArrowLeft, 
  Bookmark, 
  Sun, 
  Moon, 
  Type, 
  Palette, 
  Sliders, 
  RotateCcw as ResetIcon, 
  X,
  Check
} from 'lucide-react';
import { TextItem, ViewState, ReaderCustomization } from '../types';
import { 
  getReaderPreferences, 
  saveReaderPreferences, 
  DEFAULT_READER_CONFIG, 
  AVAILABLE_FONTS, 
  PRESET_THEMES 
} from '../lib/readerPreferences';

interface ReaderViewProps {
  textItem: TextItem;
  setView: (view: ViewState) => void;
  onUpdateProgress: (id: string, progress: number) => void;
  onUpdateStats: (timeMs: number, wpm: number) => void;
  theme?: 'parchment' | 'dark-leather';
  onToggleTheme?: () => void;
}

export function ReaderView({ 
  textItem, 
  setView, 
  onUpdateProgress, 
  onUpdateStats,
  theme = 'dark-leather',
  onToggleTheme
}: ReaderViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(450);
  const [words, setWords] = useState<string[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [isExtremeFocus, setIsExtremeFocus] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'font' | 'size' | 'colors' | 'presets'>('font');

  // Reader Customization State (Default: Dark theme with Helvetica Neue)
  const [customization, setCustomization] = useState<ReaderCustomization>(() => {
    const prefs = getReaderPreferences();
    // If theme is dark-leather, ensure dark colors are active if user hasn't heavily modified
    if (theme === 'dark-leather' && (!prefs.bgColor || prefs.bgColor === '#f4eee1')) {
      return {
        ...prefs,
        bgColor: '#17120e',
        textColor: '#ede2d2',
        focalColor: '#d4af37'
      };
    }
    return prefs;
  });

  const intervalRef = useRef<number | null>(null);
  const sessionStartTime = useRef<number | null>(null);

  // Save customization changes
  const updateCustomization = (partial: Partial<ReaderCustomization>) => {
    setCustomization(prev => {
      const next = { ...prev, ...partial };
      saveReaderPreferences(next);
      return next;
    });
  };

  // Synchronize when the user toggles theme (Sun/Moon button or Theme mode selector)
  const handleToggleThemeMode = () => {
    if (onToggleTheme) {
      onToggleTheme();
    }
    // Toggle reader colors to match
    const isCurrentlyDark = theme === 'dark-leather' || customization.bgColor === '#17120e' || customization.bgColor === '#09090b';
    if (isCurrentlyDark) {
      // Switch to Light Parchment
      updateCustomization({
        bgColor: '#f4eee1',
        textColor: '#241c17',
        focalColor: '#882b20'
      });
    } else {
      // Switch to Dark Leather
      updateCustomization({
        bgColor: '#17120e',
        textColor: '#ede2d2',
        focalColor: '#d4af37'
      });
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_THEMES[0]) => {
    updateCustomization({
      bgColor: preset.bg,
      textColor: preset.text,
      focalColor: preset.focal
    });
    // Sync app document theme if needed
    if (preset.isDark && theme !== 'dark-leather' && onToggleTheme) {
      onToggleTheme();
    } else if (!preset.isDark && theme === 'dark-leather' && onToggleTheme) {
      onToggleTheme();
    }
  };

  const handleResetDefaults = () => {
    setCustomization(DEFAULT_READER_CONFIG);
    saveReaderPreferences(DEFAULT_READER_CONFIG);
    if (theme !== 'dark-leather' && onToggleTheme) {
      onToggleTheme();
    }
  };

  useEffect(() => {
    const parsedWords = textItem.content.split(/\s+/).filter(w => w.length > 0);
    setWords(parsedWords);
    
    const savedIndex = Math.floor((textItem.progress / 100) * parsedWords.length);
    setWordIndex(Math.min(savedIndex, Math.max(0, parsedWords.length - 1)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textItem.id, textItem.content]);

  const onUpdateStatsRef = useRef(onUpdateStats);
  useEffect(() => {
    onUpdateStatsRef.current = onUpdateStats;
  }, [onUpdateStats]);

  useEffect(() => {
    if (isPlaying && words.length > 0) {
      if (!sessionStartTime.current) {
        sessionStartTime.current = Date.now();
      }
      
      const msPerWord = 60000 / wpm;
      intervalRef.current = window.setInterval(() => {
        setWordIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, msPerWord);
    } else {
      if (sessionStartTime.current) {
        const timeSpent = Date.now() - sessionStartTime.current;
        onUpdateStatsRef.current(timeSpent, wpm);
        sessionStartTime.current = null;
      }
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
      if (sessionStartTime.current) {
        const timeSpent = Date.now() - sessionStartTime.current;
        onUpdateStatsRef.current(timeSpent, wpm);
        sessionStartTime.current = null;
      }
    };
  }, [isPlaying, wpm, words.length]);

  // Update progress periodically - rounded up integer
  const lastSavedProgress = useRef(-1);
  useEffect(() => {
    if (words.length > 0) {
      const isComplete = wordIndex >= words.length - 1;
      const rawProgress = (wordIndex / words.length) * 100;
      const rounded = isComplete ? 100 : Math.min(99, Math.ceil(rawProgress));

      if (lastSavedProgress.current !== rounded && (wordIndex % 5 === 0 || isComplete)) {
        onUpdateProgress(textItem.id, rounded);
        lastSavedProgress.current = rounded;
      }
    }
  }, [wordIndex, words.length, textItem.id, onUpdateProgress]);

  // Ensure progress is recorded when leaving
  useEffect(() => {
    return () => {
      if (words.length > 0) {
        const isComplete = wordIndex >= words.length - 1;
        const rawProgress = (wordIndex / words.length) * 100;
        const rounded = isComplete ? 100 : Math.min(99, Math.ceil(rawProgress));
        onUpdateProgress(textItem.id, rounded);
      }
    };
  }, [wordIndex, words.length, textItem.id, onUpdateProgress]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const rewind = () => {
    const wordsToRewind = Math.max(10, Math.floor(wpm / 6));
    setWordIndex(prev => Math.max(0, prev - wordsToRewind));
  };

  const forward = () => {
    const wordsToForward = Math.max(10, Math.floor(wpm / 6));
    setWordIndex(prev => Math.min(words.length - 1, prev + wordsToForward));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'ArrowLeft') {
        rewind();
      } else if (e.code === 'ArrowRight') {
        forward();
      } else if (e.code === 'Escape') {
        if (showSettings) {
          setShowSettings(false);
        } else {
          setIsPlaying(false);
          setView('library');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wpm, words.length, showSettings]);

  const rawProgress = words.length > 0 ? (wordIndex / words.length) * 100 : 0;
  const isComplete = words.length > 0 && wordIndex >= words.length - 1;
  const displayProgress = isComplete ? 100 : Math.min(99, Math.ceil(rawProgress));

  // Determine current word and Optimal Recognition Point (ORP)
  const currentWord = words.length > 0 && wordIndex < words.length ? words[wordIndex] : 'Ready';
  let orpIndex = 0;
  const len = currentWord.length;
  if (len > 1 && len <= 5) orpIndex = 1;
  else if (len >= 6 && len <= 9) orpIndex = 2;
  else if (len >= 10 && len <= 13) orpIndex = 3;
  else if (len >= 14) orpIndex = 4;

  const currentFontObj = AVAILABLE_FONTS.find(f => f.id === customization.fontFamily) || AVAILABLE_FONTS[0];

  const isCurrentThemeDark = 
    theme === 'dark-leather' || 
    customization.bgColor === '#17120e' || 
    customization.bgColor === '#09090b' || 
    customization.bgColor === '#0f172a' ||
    customization.bgColor === '#101d14' ||
    customization.bgColor === '#1c1917';

  return (
    <div 
      className="flex flex-col w-full h-[100dvh] relative overflow-hidden select-none transition-colors duration-300"
      style={{ backgroundColor: customization.bgColor }}
    >
      {/* Top Bar */}
      <div 
        className={`absolute top-0 left-0 right-0 px-4 md:px-8 py-3 md:py-4 z-20 flex items-center justify-between transition-opacity duration-300 ${
          isExtremeFocus ? 'opacity-0 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <button 
          onClick={() => {
            setIsPlaying(false);
            setView('library');
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-black/10 dark:border-white/15 bg-white/70 dark:bg-black/40 backdrop-blur-md hover:bg-white/90 dark:hover:bg-black/60 transition-all text-xs font-['Cinzel'] font-bold uppercase tracking-wider shadow-xs"
          style={{ color: customization.textColor }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Library</span>
        </button>

        {/* Center Title & Word Counter */}
        <div className="text-center px-3 max-w-[50%] md:max-w-[450px] truncate">
          <p 
            className="font-['Cinzel'] text-xs md:text-sm font-bold tracking-wider uppercase truncate"
            style={{ color: customization.textColor }}
          >
            {textItem.title}
          </p>
          <p 
            className="text-[11px] md:text-xs opacity-70 truncate font-sans"
            style={{ color: customization.textColor }}
          >
            Word {wordIndex + 1} of {words.length} ({displayProgress}%)
          </p>
        </div>

        {/* Right Actions: Theme Toggle & Reader Settings */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Button - Now fully works in reader */}
          <button
            onClick={handleToggleThemeMode}
            className="p-2 md:p-2.5 rounded-lg border border-black/10 dark:border-white/15 bg-white/70 dark:bg-black/40 backdrop-blur-md hover:opacity-90 transition-all shadow-xs"
            style={{ color: customization.textColor }}
            title={isCurrentThemeDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            aria-label="Toggle light or dark theme"
          >
            {isCurrentThemeDark ? <Sun className="w-4 h-4 text-secondary" /> : <Moon className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-black/10 dark:border-white/15 bg-white/70 dark:bg-black/40 backdrop-blur-md hover:opacity-90 transition-all shadow-xs font-['Cinzel'] text-xs font-bold uppercase tracking-wider"
            style={{ color: customization.textColor }}
            title="Reader Settings & Customization"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>
      </div>

      {/* Main RSVP Reading Zone */}
      <div 
        onClick={togglePlay}
        className="flex-1 flex flex-col items-center justify-center relative w-full max-w-[1000px] mx-auto px-4 sm:px-6 cursor-pointer"
      >
        {/* Soft Vignette Glow if enabled */}
        {customization.showVignette && (
          <div 
            className={`absolute w-[360px] md:w-[500px] h-[260px] md:h-[350px] rounded-full blur-[100px] pointer-events-none transition-opacity duration-500 ${
              isPlaying ? 'opacity-30 scale-105' : 'opacity-15'
            }`}
            style={{ backgroundColor: customization.focalColor }}
          ></div>
        )}

        {/* Central RSVP Presentation Card */}
        <div 
          className="relative w-full max-w-[760px] py-14 sm:py-20 md:py-28 px-4 sm:px-8 rounded-2xl border border-black/8 dark:border-white/10 shadow-sm flex flex-col items-center justify-center transition-all duration-300"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        >
          {/* Subtle Corner Accents */}
          <div className="absolute top-3 left-4 text-xs opacity-35 font-serif select-none pointer-events-none" style={{ color: customization.textColor }}>
            ⌜❦
          </div>
          <div className="absolute top-3 right-4 text-xs opacity-35 font-serif select-none pointer-events-none" style={{ color: customization.textColor }}>
            ❦⌝
          </div>
          <div className="absolute bottom-3 left-4 text-xs opacity-35 font-serif select-none pointer-events-none" style={{ color: customization.textColor }}>
            ⌞❦
          </div>
          <div className="absolute bottom-3 right-4 text-xs opacity-35 font-serif select-none pointer-events-none" style={{ color: customization.textColor }}>
            ❦⌟
          </div>

          {/* The RSVP Word Display (Default: Helvetica Neue) */}
          <div 
            className="relative w-full flex items-center justify-center text-center select-none font-normal tracking-normal transition-transform duration-75 min-h-[90px] sm:min-h-[120px]"
            style={{ 
              fontFamily: currentFontObj.family,
              fontSize: `clamp(38px, 12vw, ${customization.fontSize}px)`
            }}
          >
            <div className="relative flex justify-center items-center w-full">
              {/* Left Segment */}
              <div 
                className="w-[50%] text-right font-normal" 
                style={{ color: customization.textColor }}
              >
                {currentWord.substring(0, orpIndex)}
              </div>
              
              {/* Optimal Recognition Point (Illuminated Focal Marker) */}
              <div 
                className="font-bold mx-[1px] relative inline-block transition-colors"
                style={{ color: customization.focalColor }}
              >
                {currentWord.substring(orpIndex, orpIndex + 1)}
                {/* Visual optical guide pip */}
                <span 
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] opacity-70 leading-none"
                  style={{ color: customization.focalColor }}
                >
                  ▾
                </span>
              </div>
              
              {/* Right Segment */}
              <div 
                className="w-[50%] text-left font-normal" 
                style={{ color: customization.textColor }}
              >
                {currentWord.substring(orpIndex + 1)}
              </div>
            </div>
          </div>

          {/* Vertical Focal Guideline */}
          {!isExtremeFocus && (
            <div className="absolute inset-y-10 left-1/2 w-px bg-current opacity-10 -translate-x-1/2 pointer-events-none"></div>
          )}

          {/* Progress Bar inside reading card */}
          <div className="absolute bottom-3 inset-x-6 sm:inset-x-10 flex items-center justify-between gap-3 opacity-60">
            <span 
              className="text-[10px] md:text-xs font-['Cinzel'] uppercase tracking-wider font-semibold"
              style={{ color: customization.textColor }}
            >
              {displayProgress}%
            </span>
            <div className="h-1 flex-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-150 rounded-full" 
                style={{ 
                  width: `${displayProgress}%`,
                  backgroundColor: customization.focalColor 
                }}
              ></div>
            </div>
            <span 
              className="text-[10px] md:text-xs font-['Cinzel'] uppercase tracking-wider font-semibold"
              style={{ color: customization.textColor }}
            >
              {Math.max(0, words.length - wordIndex)} left
            </span>
          </div>
        </div>

        {/* Tap/Keyboard Hint */}
        <p 
          className="mt-3 text-center text-xs opacity-60 font-sans"
          style={{ color: customization.textColor }}
        >
          <span className="sm:hidden">Tap anywhere to {isPlaying ? 'pause' : 'play'}</span>
          <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px] border border-black/10">Space</kbd> to {isPlaying ? 'pause' : 'play'} · <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px] border border-black/10">←</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px] border border-black/10">→</kbd> to rewind/skip</span>
        </p>
      </div>

      {/* Control Bar */}
      <div 
        className={`fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t border-black/10 dark:border-white/10 pb-5 pt-4 px-4 sm:px-8 z-30 transition-transform duration-300 ${
          isExtremeFocus ? 'translate-y-full hover:translate-y-0' : 'translate-y-0'
        }`}
        style={{ 
          backgroundColor: isCurrentThemeDark
            ? 'rgba(15, 15, 15, 0.90)'
            : 'rgba(255, 255, 255, 0.90)' 
        }}
      >
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Title & Progress */}
          <div className="hidden md:flex items-center gap-3 w-1/3 min-w-0">
            <div 
              className="w-9 h-9 rounded-md border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0"
              style={{ color: customization.focalColor }}
            >
              <Bookmark className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p 
                className="font-['Cinzel'] text-xs font-bold truncate"
                style={{ color: customization.textColor }}
              >
                {textItem.title}
              </p>
              <p 
                className="text-[11px] opacity-70 font-sans"
                style={{ color: customization.textColor }}
              >
                Progress: <strong style={{ color: customization.focalColor }}>{displayProgress}%</strong>
              </p>
            </div>
          </div>
          
          {/* Center: Play/Pause, Rewind, Forward */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 w-full md:w-1/3">
            <button 
              onClick={rewind} 
              className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
              style={{ color: customization.textColor }}
              title="Rewind 10 seconds"
              aria-label="Rewind 10 seconds"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Play/Pause Button */}
            <button 
              onClick={togglePlay}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
              style={{ 
                backgroundColor: customization.focalColor,
                color: '#ffffff'
              }}
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              aria-label={isPlaying ? "Pause reading" : "Start reading"}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 md:w-7 md:h-7" />
              ) : (
                <Play className="w-6 h-6 md:w-7 md:h-7 ml-1" />
              )}
            </button>

            <button 
              onClick={forward} 
              className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
              style={{ color: customization.textColor }}
              title="Forward 10 seconds"
              aria-label="Forward 10 seconds"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>
          
          {/* Right: WPM Speed Slider */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-1/3">
            <div className="flex items-center gap-1.5 shrink-0">
              <span 
                className="font-['Cinzel'] text-xs font-bold uppercase tracking-wider"
                style={{ color: customization.textColor }}
              >
                {wpm}
              </span>
              <span 
                className="text-[10px] uppercase opacity-70 font-sans"
                style={{ color: customization.textColor }}
              >
                WPM
              </span>
            </div>

            <input 
              type="range" 
              min="150" 
              max="950" 
              step="10"
              value={wpm}
              onChange={(e) => setWpm(parseInt(e.target.value))}
              className="flex-1 md:w-36 h-2 rounded-full appearance-none cursor-pointer bg-black/10 dark:bg-white/20"
              style={{ accentColor: customization.focalColor }}
              aria-label="Reading speed in words per minute"
            />
          </div>
        </div>
      </div>

      {/* READER SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface text-on-surface rounded-t-2xl sm:rounded-xl max-w-[560px] w-full max-h-[85vh] overflow-y-auto p-5 sm:p-7 shadow-2xl border border-outline-variant/60 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant/50 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center text-primary">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-['Cinzel'] font-bold text-base md:text-lg uppercase tracking-wider text-on-surface">
                    Reader Settings
                  </h3>
                  <p className="text-[11px] text-on-surface-variant font-sans">
                    Default font: Helvetica Neue · Fully customizable
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowSettings(false)} 
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Theme Switcher Bar inside settings */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container mb-4 border border-outline-variant/40">
              <div className="flex items-center gap-2">
                {isCurrentThemeDark ? <Moon className="w-4 h-4 text-secondary" /> : <Sun className="w-4 h-4 text-secondary" />}
                <span className="font-['Cinzel'] text-xs font-bold uppercase tracking-wider text-on-surface">
                  Theme: {isCurrentThemeDark ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleThemeMode}
                className="px-3 py-1.5 rounded-md bg-surface text-on-surface border border-outline-variant/60 font-['Cinzel'] text-xs font-bold uppercase tracking-wider hover:border-secondary transition-colors"
              >
                Switch to {isCurrentThemeDark ? 'Light' : 'Dark'}
              </button>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-surface-container rounded-lg mb-5 text-xs font-['Cinzel'] font-bold tracking-wider uppercase">
              <button
                onClick={() => setActiveSettingsTab('font')}
                className={`py-2 rounded-md transition-all text-center flex flex-col items-center gap-1 ${
                  activeSettingsTab === 'font'
                    ? 'bg-surface text-primary shadow-xs border border-outline-variant/50'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Font</span>
              </button>

              <button
                onClick={() => setActiveSettingsTab('size')}
                className={`py-2 rounded-md transition-all text-center flex flex-col items-center gap-1 ${
                  activeSettingsTab === 'size'
                    ? 'bg-surface text-primary shadow-xs border border-outline-variant/50'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Size</span>
              </button>

              <button
                onClick={() => setActiveSettingsTab('colors')}
                className={`py-2 rounded-md transition-all text-center flex flex-col items-center gap-1 ${
                  activeSettingsTab === 'colors'
                    ? 'bg-surface text-primary shadow-xs border border-outline-variant/50'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Colors</span>
              </button>

              <button
                onClick={() => setActiveSettingsTab('presets')}
                className={`py-2 rounded-md transition-all text-center flex flex-col items-center gap-1 ${
                  activeSettingsTab === 'presets'
                    ? 'bg-surface text-primary shadow-xs border border-outline-variant/50'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Themes</span>
              </button>
            </div>

            {/* TAB 1: FONT SELECTION */}
            {activeSettingsTab === 'font' && (
              <div className="flex flex-col gap-3">
                <label className="font-['Cinzel'] text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                  Reading Font (Default: Helvetica Neue)
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AVAILABLE_FONTS.map((f) => {
                    const isSelected = customization.fontFamily === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => updateCustomization({ fontFamily: f.id })}
                        className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary'
                            : 'bg-surface-container border-outline-variant/60 hover:bg-surface-container-high'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span 
                            className="text-lg leading-tight text-on-surface font-medium"
                            style={{ fontFamily: f.family }}
                          >
                            {f.name}
                          </span>
                          {f.id === 'helvetica' && (
                            <span className="text-[9px] font-['Cinzel'] font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-on-surface-variant font-sans">
                          {f.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: SIZE SETTING */}
            {activeSettingsTab === 'size' && (
              <div className="flex flex-col gap-5 py-2">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-['Cinzel'] text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                      Text Size
                    </label>
                    <span className="font-mono text-sm font-bold text-primary">
                      {customization.fontSize}px
                    </span>
                  </div>

                  <input 
                    type="range"
                    min="36"
                    max="112"
                    step="2"
                    value={customization.fontSize}
                    onChange={(e) => updateCustomization({ fontSize: parseInt(e.target.value) })}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-surface-container-highest accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-on-surface-variant font-sans mt-1">
                    <span>Small (36px)</span>
                    <span>Standard (72px)</span>
                    <span>Large (112px)</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="font-['Cinzel'] text-xs uppercase tracking-wider text-on-surface-variant font-bold block mb-2">
                    Preset Sizes
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Small', size: 48 },
                      { label: 'Medium', size: 64 },
                      { label: 'Large', size: 76 },
                      { label: 'Huge', size: 96 }
                    ].map(p => (
                      <button
                        key={p.size}
                        onClick={() => updateCustomization({ fontSize: p.size })}
                        className={`py-2 rounded border text-xs font-['Cinzel'] font-bold uppercase transition-all ${
                          customization.fontSize === p.size
                            ? 'bg-primary text-on-primary border-primary'
                            : 'bg-surface-container border-outline-variant/60 text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview Box */}
                <div 
                  className="p-5 rounded-lg border border-outline-variant/60 text-center select-none overflow-hidden"
                  style={{ backgroundColor: customization.bgColor }}
                >
                  <span className="text-[10px] uppercase font-['Cinzel'] tracking-wider opacity-60 block mb-1" style={{ color: customization.textColor }}>
                    Live Preview
                  </span>
                  <div 
                    className="font-medium truncate"
                    style={{ 
                      fontFamily: currentFontObj.family,
                      fontSize: `${Math.min(customization.fontSize, 56)}px`,
                      color: customization.textColor
                    }}
                  >
                    Velo<span style={{ color: customization.focalColor }} className="font-bold">c</span>ity
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: COLORS */}
            {activeSettingsTab === 'colors' && (
              <div className="flex flex-col gap-5 py-1">
                {/* 1. Background Color */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-['Cinzel'] text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                      Background Color
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-on-surface-variant uppercase">{customization.bgColor}</span>
                      <input 
                        type="color" 
                        value={customization.bgColor}
                        onChange={(e) => updateCustomization({ bgColor: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer border border-outline-variant bg-transparent p-0"
                        title="Pick custom background color"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Dark Leather (Default)', hex: '#17120e' },
                      { name: 'Pitch Dark', hex: '#09090b' },
                      { name: 'Deep Navy', hex: '#0f172a' },
                      { name: 'Parchment', hex: '#f4eee1' },
                      { name: 'Cream', hex: '#faf7f0' },
                      { name: 'White', hex: '#ffffff' },
                      { name: 'Sepia', hex: '#ede3d2' }
                    ].map(c => (
                      <button
                        key={c.hex}
                        onClick={() => updateCustomization({ bgColor: c.hex })}
                        className={`px-3 py-1.5 rounded border text-xs font-sans flex items-center gap-1.5 transition-transform active:scale-95 ${
                          customization.bgColor.toLowerCase() === c.hex.toLowerCase()
                            ? 'ring-2 ring-primary border-primary font-bold'
                            : 'border-outline-variant/60'
                        }`}
                        style={{ backgroundColor: c.hex, color: c.hex.includes('#0') || c.hex.includes('#1') ? '#ffffff' : '#000000' }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: c.hex }}></span>
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Text Color */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-['Cinzel'] text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                      Text Color
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-on-surface-variant uppercase">{customization.textColor}</span>
                      <input 
                        type="color" 
                        value={customization.textColor}
                        onChange={(e) => updateCustomization({ textColor: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer border border-outline-variant bg-transparent p-0"
                        title="Pick custom text color"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Warm Cream (Default)', hex: '#ede2d2' },
                      { name: 'Pure White', hex: '#ffffff' },
                      { name: 'Soft Gray', hex: '#d4d4d8' },
                      { name: 'Dark Ink', hex: '#241c17' },
                      { name: 'Deep Black', hex: '#0a0a0a' },
                      { name: 'Sepia', hex: '#453227' }
                    ].map(c => (
                      <button
                        key={c.hex}
                        onClick={() => updateCustomization({ textColor: c.hex })}
                        className={`px-3 py-1.5 rounded border text-xs font-sans flex items-center gap-1.5 transition-transform active:scale-95 ${
                          customization.textColor.toLowerCase() === c.hex.toLowerCase()
                            ? 'ring-2 ring-primary border-primary font-bold'
                            : 'border-outline-variant/60 bg-surface-container'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: c.hex }}></span>
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Focal Point Color */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-['Cinzel'] text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                      Focus Letter Color
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-on-surface-variant uppercase">{customization.focalColor}</span>
                      <input 
                        type="color" 
                        value={customization.focalColor}
                        onChange={(e) => updateCustomization({ focalColor: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer border border-outline-variant bg-transparent p-0"
                        title="Pick custom focus letter color"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Gold (Default)', hex: '#d4af37' },
                      { name: 'Crimson Red', hex: '#dc2626' },
                      { name: 'Wax Red', hex: '#882b20' },
                      { name: 'Amber', hex: '#f59e0b' },
                      { name: 'Emerald', hex: '#10b981' },
                      { name: 'Sky Blue', hex: '#38bdf8' }
                    ].map(c => (
                      <button
                        key={c.hex}
                        onClick={() => updateCustomization({ focalColor: c.hex })}
                        className={`px-3 py-1.5 rounded border text-xs font-sans flex items-center gap-1.5 transition-transform active:scale-95 ${
                          customization.focalColor.toLowerCase() === c.hex.toLowerCase()
                            ? 'ring-2 ring-primary border-primary font-bold'
                            : 'border-outline-variant/60 bg-surface-container'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: c.hex }}></span>
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: THEMES / PRESETS */}
            {activeSettingsTab === 'presets' && (
              <div className="flex flex-col gap-3">
                <label className="font-['Cinzel'] text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                  Preset Color Themes
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESET_THEMES.map((themePreset) => {
                    const isSelected = 
                      customization.bgColor.toLowerCase() === themePreset.bg.toLowerCase() &&
                      customization.textColor.toLowerCase() === themePreset.text.toLowerCase();
                    return (
                      <button
                        key={themePreset.name}
                        onClick={() => handleApplyPreset(themePreset)}
                        className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'ring-2 ring-primary border-primary'
                            : 'border-outline-variant/60 hover:opacity-90'
                        }`}
                        style={{ backgroundColor: themePreset.bg }}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span 
                              className="font-medium text-sm block"
                              style={{ color: themePreset.text }}
                            >
                              {themePreset.name}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                          </div>
                          <span 
                            className="text-xs font-bold"
                            style={{ color: themePreset.focal }}
                          >
                            Focus Letter ▾
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: themePreset.bg }}></span>
                          <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: themePreset.text }}></span>
                          <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: themePreset.focal }}></span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-outline-variant/50 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex items-center gap-1.5 text-xs font-['Cinzel'] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors"
                title="Restore Helvetica Neue and Dark Theme Defaults"
              >
                <ResetIcon className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>

              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-['Cinzel'] text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-xs"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
