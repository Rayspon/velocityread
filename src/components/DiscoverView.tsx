import { useState, useEffect } from 'react';
import { 
  EyeOff, 
  SlidersHorizontal, 
  TrendingUp, 
  Play, 
  Pause, 
  ArrowRight,
  BookOpen,
  Plus,
  Clock,
  Sparkles
} from 'lucide-react';
import { ViewState } from '../types';

export function DiscoverView({ setView }: { setView: (view: ViewState) => void }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [demoWordIndex, setDemoWordIndex] = useState(0);

  const demoWords = [
    { text: "Velocity", focus: 3 },
    { text: "eliminates", focus: 3 },
    { text: "all", focus: 1 },
    { text: "friction", focus: 3 },
    { text: "between", focus: 3 },
    { text: "the", focus: 1 },
    { text: "written", focus: 2 },
    { text: "word", focus: 1 },
    { text: "and", focus: 1 },
    { text: "your", focus: 1 },
    { text: "mind.", focus: 2 }
  ];

  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      const intervalMs = Math.round(60000 / 450);
      interval = window.setInterval(() => {
        setDemoWordIndex(prev => (prev + 1) % demoWords.length);
      }, intervalMs);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentWord = demoWords[demoWordIndex];

  return (
    <div className="flex flex-col w-full pb-32 font-serif">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center pt-32 sm:pt-40 md:pt-48 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-12 text-center overflow-hidden">
        {/* Soft Glow */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
          <div className="w-[85vw] h-[85vw] max-w-[700px] max-h-[700px] bg-secondary/15 rounded-full blur-[140px]"></div>
          <div className="absolute w-[55vw] h-[55vw] max-w-[500px] max-h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-x-1/4 -translate-y-1/4"></div>
        </div>
        
        <div className="relative z-10 max-w-[1000px] mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2.5 text-secondary text-xs uppercase tracking-[0.25em] font-['Cinzel'] mb-4 font-bold">
            <span>❧</span>
            <span>Speed Reading With RSVP</span>
            <span>☙</span>
          </div>

          <h1 className="font-['Cinzel_Decorative'] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-on-surface tracking-tight max-w-4xl mt-2 sm:mt-3 mb-6 leading-[1.18]">
            Read Faster & Understand More
          </h1>
          
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent mb-6"></div>

          <p className="font-['EB_Garamond'] text-lg sm:text-xl md:text-2xl text-on-surface-variant max-w-2xl mb-10 leading-relaxed italic">
            "Eliminate eye movement and inner vocalization. Rapid Serial Visual Presentation delivers words sequentially directly to your focal point."
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
            <button 
              onClick={() => setView('library')} 
              className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary font-['Cinzel'] font-bold text-xs uppercase tracking-wider rounded-lg border border-secondary/50 shadow-md hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group min-h-[48px]"
            >
              <span>Go to Library</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => setView('input')} 
              className="w-full sm:w-auto px-7 py-4 bg-surface-container text-on-surface font-['Cinzel'] font-bold text-xs uppercase tracking-wider rounded-lg border border-outline-variant/70 hover:bg-surface-container-high transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Plus className="w-4 h-4 text-primary" />
              <span>Add Your Own Text</span>
            </button>
          </div>
        </div>
      </section>

      {/* Interactive RSVP Demo */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-surface-container-low border-y border-outline-variant/60 relative">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <div className="text-secondary text-xs uppercase tracking-[0.25em] font-['Cinzel'] mb-1 font-bold">
              Interactive Demonstration
            </div>
            <h2 className="font-['Cinzel'] text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface uppercase tracking-wider mb-3">
              How RSVP Speed Reading Works
            </h2>
            <p className="font-['EB_Garamond'] italic text-base sm:text-lg text-on-surface-variant max-w-xl mx-auto">
              By presenting words sequentially in the exact same spot, your eyes do not need to move across lines—allowing you to read effortlessly at 450+ WPM.
            </p>
          </div>
          
          {/* Framed Display Reader */}
          <div className="relative w-full max-w-3xl mx-auto h-[340px] sm:h-[380px] parchment-sheet rounded-2xl shadow-lg flex flex-col overflow-hidden antique-border">
            {/* Bar */}
            <div className="h-12 border-b border-outline-variant/50 flex items-center justify-between px-4 sm:px-6 bg-surface-container/50">
              <div className="flex items-center gap-2 text-secondary font-['Cinzel'] text-xs font-bold">
                <span>✦</span>
                <span className="uppercase tracking-widest text-[10px] sm:text-[11px] text-on-surface">Live Speed Demo</span>
              </div>
              <span className="font-['Cinzel'] text-xs font-bold text-primary tracking-widest">
                450 Words Per Minute
              </span>
              <div className="text-secondary text-xs">✦</div>
            </div>
            
            {/* Display Center */}
            <div className="flex-1 flex items-center justify-center relative px-4">
              <div className="absolute top-2 left-3 text-secondary/60 font-['Cinzel'] text-sm">⌜❦</div>
              <div className="absolute top-2 right-3 text-secondary/60 font-['Cinzel'] text-sm">❦⌝</div>
              <div className="absolute bottom-2 left-3 text-secondary/60 font-['Cinzel'] text-sm">⌞❦</div>
              <div className="absolute bottom-2 right-3 text-secondary/60 font-['Cinzel'] text-sm">❦⌟</div>

              <div className="absolute inset-y-8 left-1/2 w-px bg-outline-variant/20 -translate-x-1/2 pointer-events-none"></div>
              
              <div 
                className="relative z-10 text-center select-none font-normal"
                style={{ 
                  fontFamily: '"Helvetica Neue", Helvetica, -apple-system, BlinkMacSystemFont, Arial, sans-serif',
                  fontSize: 'clamp(36px, 10vw, 72px)'
                }}
              >
                <span className="opacity-70">{currentWord.text.substring(0, currentWord.focus)}</span>
                <span className="text-primary font-bold">{currentWord.text.substring(currentWord.focus, currentWord.focus + 1)}</span>
                <span className="opacity-70">{currentWord.text.substring(currentWord.focus + 1)}</span>
              </div>
            </div>
            
            {/* Demo Controls */}
            <div className="h-16 border-t border-outline-variant/50 bg-surface-container/50 flex items-center justify-between px-4 sm:px-6">
              <span className="font-['Cinzel'] text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                Word {demoWordIndex + 1} of {demoWords.length}
              </span>

              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className="w-11 h-11 rounded-full bg-primary text-on-primary border border-secondary/60 flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-transform"
                title={isPlaying ? "Pause Demo" : "Play Demo"}
                aria-label="Toggle demonstration play"
              >
                {isPlaying ? <Pause className="w-5 h-5 text-on-primary" /> : <Play className="w-5 h-5 text-on-primary ml-0.5" />}
              </button>

              <button
                onClick={() => setView('library')}
                className="font-['Cinzel'] text-xs font-bold text-primary uppercase tracking-wider hover:underline"
              >
                Open Library →
              </button>
            </div>
            
            {/* Progress rule */}
            <div className="h-1 bg-outline-variant/30 w-full">
              <div 
                className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-150" 
                style={{ width: `${((demoWordIndex + 1) / demoWords.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-12 bg-surface">
        <div className="max-w-[1140px] mx-auto">
          <div className="text-center mb-14 md:mb-18 ornament-line">
            <h3 className="font-['Cinzel'] text-xl sm:text-2xl font-bold uppercase tracking-wider text-on-surface">
              Core Reading Features
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-surface-container/60 rounded-xl p-7 border border-outline-variant/60 flex flex-col h-full book-card-emboss relative">
              <div className="w-11 h-11 rounded-lg border border-secondary/40 bg-surface flex items-center justify-center mb-5 text-primary shadow-xs">
                <EyeOff className="w-5 h-5 text-primary" />
              </div>
              <span className="font-['Cinzel'] text-[10px] text-secondary tracking-widest uppercase font-bold mb-1">
                Feature 1
              </span>
              <h4 className="font-['Cinzel'] text-xl font-bold text-on-surface mb-2">
                Distraction-Free Focus
              </h4>
              <p className="font-['EB_Garamond'] text-base text-on-surface-variant leading-relaxed mt-2">
                Unnecessary toolbars and clutter disappear during reading. Only the highlighted word remains, keeping your concentration locked.
              </p>
            </div>
            
            <div className="bg-surface-container/60 rounded-xl p-7 border border-outline-variant/60 flex flex-col h-full book-card-emboss relative">
              <div className="w-11 h-11 rounded-lg border border-secondary/40 bg-surface flex items-center justify-center mb-5 text-secondary shadow-xs">
                <SlidersHorizontal className="w-5 h-5 text-secondary" />
              </div>
              <span className="font-['Cinzel'] text-[10px] text-secondary tracking-widest uppercase font-bold mb-1">
                Feature 2
              </span>
              <h4 className="font-['Cinzel'] text-xl font-bold text-on-surface mb-2">
                Customizable Speed
              </h4>
              <p className="font-['EB_Garamond'] text-base text-on-surface-variant leading-relaxed mt-2">
                Dial in your reading speed from a comfortable 150 WPM up to 950 WPM with instant slider adjustments and keyboard controls.
              </p>
            </div>
            
            <div className="bg-surface-container/60 rounded-xl p-7 border border-outline-variant/60 flex flex-col h-full book-card-emboss relative">
              <div className="w-11 h-11 rounded-lg border border-secondary/40 bg-surface flex items-center justify-center mb-5 text-primary shadow-xs">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="font-['Cinzel'] text-[10px] text-secondary tracking-widest uppercase font-bold mb-1">
                Feature 3
              </span>
              <h4 className="font-['Cinzel'] text-xl font-bold text-on-surface mb-2">
                Progress Tracking
              </h4>
              <p className="font-['EB_Garamond'] text-base text-on-surface-variant leading-relaxed mt-2">
                Every reading session automatically tracks your total reading time, average speed, and clean rounded completion percentages.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Final Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-12 bg-surface-container text-center border-t border-outline-variant/60">
        <div className="max-w-2xl mx-auto">
          <div className="text-secondary text-base mb-3">❦ ❖ ❧</div>
          <h2 className="font-['Cinzel_Decorative'] text-3xl sm:text-4xl font-bold text-on-surface mb-4">
            Start Reading Now
          </h2>
          <p className="font-['EB_Garamond'] italic text-lg text-on-surface-variant mb-8 leading-relaxed">
            Select a classic book from your library or paste any article or document to begin.
          </p>
          <button 
            onClick={() => setView('library')} 
            className="px-8 py-3.5 bg-primary text-on-primary font-['Cinzel'] font-bold text-xs uppercase tracking-widest rounded-lg border border-secondary/50 shadow-md hover:opacity-90 active:scale-95 transition-all min-h-[48px]"
          >
            Open Your Library
          </button>
        </div>
      </section>
    </div>
  );
}
