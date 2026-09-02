import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Settings, BarChart2, ArrowLeft } from 'lucide-react';
import { TextItem, ViewState } from '../types';

interface ReaderViewProps {
  textItem: TextItem;
  setView: (view: ViewState) => void;
  onUpdateProgress: (id: string, progress: number) => void;
  onUpdateStats: (timeMs: number, wpm: number) => void;
}

export function ReaderView({ textItem, setView, onUpdateProgress, onUpdateStats }: ReaderViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(450);
  const [words, setWords] = useState<string[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [isExtremeFocus, setIsExtremeFocus] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const sessionStartTime = useRef<number | null>(null);

  useEffect(() => {
    // Basic word splitting - can be improved for punctuation delays
    const parsedWords = textItem.content.split(/\s+/).filter(w => w.length > 0);
    setWords(parsedWords);
    
    // Resume from progress
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

  // Update progress periodically
  const lastSavedProgress = useRef(-1);
  useEffect(() => {
    if (words.length > 0 && wordIndex % 10 === 0) {
      const progress = (wordIndex / words.length) * 100;
      if (lastSavedProgress.current !== progress) {
        onUpdateProgress(textItem.id, progress);
        lastSavedProgress.current = progress;
      }
    }
  }, [wordIndex, words.length, textItem.id, onUpdateProgress]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const rewind = () => {
    const wordsToRewind = Math.floor(wpm / 6); // roughly 10 seconds worth
    setWordIndex(prev => Math.max(0, prev - wordsToRewind));
  };

  const forward = () => {
    const wordsToForward = Math.floor(wpm / 6);
    setWordIndex(prev => Math.min(words.length - 1, prev + wordsToForward));
  };

  const renderWord = () => {
    if (!words.length || wordIndex >= words.length) return 'Ready';
    
    const word = words[wordIndex];
    
    // Basic ORP calculation
    let orpIndex = 0;
    const len = word.length;
    if (len > 1 && len <= 5) orpIndex = 1;
    else if (len >= 6 && len <= 9) orpIndex = 2;
    else if (len >= 10 && len <= 13) orpIndex = 3;
    else if (len >= 14) orpIndex = 4;

    return (
      <>
        <span className="opacity-50">{word.substring(0, orpIndex)}</span>
        <span className="text-on-tertiary-container font-bold">{word.substring(orpIndex, orpIndex + 1)}</span>
        <span className="opacity-50">{word.substring(orpIndex + 1)}</span>
      </>
    );
  };

  const progress = words.length > 0 ? (wordIndex / words.length) * 100 : 0;

  return (
    <div className="flex flex-col w-full h-screen relative bg-surface overflow-hidden">
      {/* Top Actions */}
      <div className={`absolute top-0 left-0 p-4 z-10 flex items-center gap-4 transition-opacity duration-300 ${isExtremeFocus ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
        <button 
          onClick={() => {
            setIsPlaying(false);
            setView('library');
          }}
          className="flex items-center justify-center p-2 rounded-full hover:bg-surface-variant transition-colors text-on-surface"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>
      
      <div className={`absolute top-0 right-0 p-4 z-10 flex items-center gap-4 transition-opacity duration-300 ${isExtremeFocus ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
        <button className="flex items-center justify-center p-2 rounded-full hover:bg-surface-variant transition-colors text-on-surface">
          <BarChart2 className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-center p-2 rounded-full hover:bg-surface-variant transition-colors text-on-surface"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* Reader Zone */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-[800px] mx-auto px-4 md:px-0">
        <div className={`absolute w-[300px] h-[300px] rounded-full bg-tertiary-fixed blur-[80px] pointer-events-none transition-opacity duration-300 ${isPlaying ? 'opacity-10' : 'opacity-[0.02]'}`}></div>
        
        <div className="relative w-full flex items-center justify-center py-20 rounded-xl transition-all duration-300">
          {!isExtremeFocus && (
            <div className="absolute inset-0 rounded-xl border border-outline-variant/10 pointer-events-none transition-opacity duration-300"></div>
          )}
          
          <div className="font-[Be\ Vietnam\ Pro] text-[48px] md:text-[80px] text-on-surface text-center tracking-tight transition-transform duration-75 select-none font-medium h-[120px] flex items-center justify-center w-full">
            <div className="relative flex justify-center items-center w-full min-w-[300px]">
              <div className="w-[50%] text-right">{words.length > 0 && wordIndex < words.length && <span className="opacity-50">{words[wordIndex].substring(0, (words[wordIndex].length > 1 && words[wordIndex].length <= 5) ? 1 : (words[wordIndex].length >= 6 && words[wordIndex].length <= 9) ? 2 : (words[wordIndex].length >= 10 && words[wordIndex].length <= 13) ? 3 : (words[wordIndex].length >= 14) ? 4 : 0)}</span>}</div>
              
              <div className="text-on-tertiary-container font-bold mx-[1px]">{words.length > 0 && wordIndex < words.length && <span>{words[wordIndex].substring((words[wordIndex].length > 1 && words[wordIndex].length <= 5) ? 1 : (words[wordIndex].length >= 6 && words[wordIndex].length <= 9) ? 2 : (words[wordIndex].length >= 10 && words[wordIndex].length <= 13) ? 3 : (words[wordIndex].length >= 14) ? 4 : 0, ((words[wordIndex].length > 1 && words[wordIndex].length <= 5) ? 1 : (words[wordIndex].length >= 6 && words[wordIndex].length <= 9) ? 2 : (words[wordIndex].length >= 10 && words[wordIndex].length <= 13) ? 3 : (words[wordIndex].length >= 14) ? 4 : 0) + 1)}</span>}</div>
              
              <div className="w-[50%] text-left">{words.length > 0 && wordIndex < words.length && <span className="opacity-50">{words[wordIndex].substring(((words[wordIndex].length > 1 && words[wordIndex].length <= 5) ? 1 : (words[wordIndex].length >= 6 && words[wordIndex].length <= 9) ? 2 : (words[wordIndex].length >= 10 && words[wordIndex].length <= 13) ? 3 : (words[wordIndex].length >= 14) ? 4 : 0) + 1)}</span>}</div>
            </div>
          </div>

          {!isExtremeFocus && (
            <div className="absolute inset-y-0 left-1/2 w-[2px] bg-outline-variant/10 -translate-x-1/2 opacity-100 pointer-events-none"></div>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className={`fixed bottom-0 left-0 w-full bg-surface/95 backdrop-blur-md pb-8 pt-8 transition-transform duration-300 ${isExtremeFocus ? 'translate-y-full hover:translate-y-0' : 'translate-y-0'}`}>
        <div className="absolute top-0 left-0 w-full h-[2px] bg-surface-variant">
          <div className="h-full bg-on-tertiary-container transition-all duration-200" style={{ width: `${progress}%` }}></div>
        </div>
        
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 w-full md:w-1/3">
            <span className="text-xs uppercase tracking-wider text-outline-variant font-medium">Reading</span>
            <span className="text-base text-on-surface-variant truncate">{textItem.title}</span>
          </div>
          
          <div className="flex items-center justify-center gap-8 w-full md:w-1/3">
            <button onClick={rewind} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <RotateCcw className="w-8 h-8" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-on-surface text-surface flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
            <button onClick={forward} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <RotateCw className="w-8 h-8" />
            </button>
          </div>
          
          <div className="flex items-center justify-end gap-4 w-full md:w-1/3 min-w-[200px]">
            <span className="text-xs text-outline-variant font-medium uppercase">WPM</span>
            <input 
              type="range" 
              min="200" 
              max="1000" 
              step="10"
              value={wpm}
              onChange={(e) => setWpm(parseInt(e.target.value))}
              className="w-32 h-1 bg-surface-variant rounded-full appearance-none cursor-pointer focus:outline-none"
            />
            <span className="text-base text-on-surface w-12 text-right font-medium">{wpm}</span>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-surface-container rounded-2xl max-w-[400px] w-full p-8 m-4 shadow-xl border border-outline-variant/10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-semibold text-on-surface">Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-on-surface-variant hover:text-on-surface">
                ✕
              </button>
            </div>
            
            <div className="flex flex-col gap-6">
              <div>
                <label className="text-xs uppercase tracking-wider text-outline-variant font-medium mb-3 block">Focus Mode</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsExtremeFocus(false)}
                    className={`flex-1 py-2 px-4 rounded-lg border border-outline-variant transition-colors text-sm font-medium ${!isExtremeFocus ? 'bg-on-surface text-surface' : 'text-on-surface-variant hover:bg-surface-variant'}`}
                  >
                    Standard
                  </button>
                  <button 
                    onClick={() => setIsExtremeFocus(true)}
                    className={`flex-1 py-2 px-4 rounded-lg border border-outline-variant transition-colors text-sm font-medium ${isExtremeFocus ? 'bg-on-surface text-surface' : 'text-on-surface-variant hover:bg-surface-variant'}`}
                  >
                    Extreme
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
