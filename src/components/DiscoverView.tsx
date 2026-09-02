import { useState, useEffect } from 'react';
import { EyeOff, SlidersHorizontal, TrendingUp, Play, Pause, ArrowRight } from 'lucide-react';
import { ViewState } from '../types';

export function DiscoverView({ setView }: { setView: (view: ViewState) => void }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [demoWordIndex, setDemoWordIndex] = useState(0);

  const demoWords = [
    { text: "Velocity", focus: 3 },
    { text: "is", focus: 0 },
    { text: "designed", focus: 4 },
    { text: "to", focus: 1 },
    { text: "eliminate", focus: 4 },
    { text: "friction", focus: 3 },
    { text: "between", focus: 3 },
    { text: "you", focus: 1 },
    { text: "and", focus: 1 },
    { text: "the", focus: 1 },
    { text: "text.", focus: 2 }
  ];

  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      // 450 WPM = 60,000ms / 450 words = ~133ms per word
      const intervalMs = Math.round(60000 / 450);
      interval = window.setInterval(() => {
        setDemoWordIndex(prev => (prev + 1) % demoWords.length);
      }, intervalMs);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentWord = demoWords[demoWordIndex];

  return (
    <div className="flex flex-col w-full pb-32">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col justify-center items-center py-24 px-4 lg:px-6 text-center overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
          <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-tertiary-fixed-dim/20 rounded-full blur-[120px]"></div>
          <div className="absolute w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-primary/10 rounded-full blur-[80px] -translate-x-1/4 -translate-y-1/4"></div>
        </div>
        
        <div className="relative z-10 max-w-[1200px] mx-auto flex flex-col items-center">
          <h1 className="font-['Be_Vietnam_Pro'] text-5xl md:text-[80px] md:leading-[1.1] font-medium text-on-surface tracking-tight max-w-4xl mb-6">
            Read Faster.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-on-surface to-surface-tint">Know More.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mb-12 opacity-80">
            Harness the power of Rapid Serial Visual Presentation (RSVP). Eliminate eye movement. Devour books, articles, and documents at speeds you never thought possible.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
            <button onClick={() => setView('library')} className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary font-semibold text-lg rounded-xl shadow-md hover:bg-primary-fixed-dim hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group">
              Start Reading Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-24 px-4 lg:px-6 bg-surface-container-low relative">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-on-surface mb-4">The Velocity Method</h2>
            <p className="text-base text-on-surface-variant max-w-xl mx-auto">By flashing words exactly where your eyes are resting, we eliminate saccades (eye movements) and sub-vocalization, unlocking pure cognitive absorption.</p>
          </div>
          
          <div className="relative w-full max-w-4xl mx-auto h-[400px] bg-surface rounded-2xl shadow-xl flex flex-col overflow-hidden border border-outline-variant/10 group">
            <div className="h-12 border-b border-outline-variant/10 flex items-center justify-between px-6 bg-surface-container/50">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-error/50"></div>
                <div className="w-3 h-3 rounded-full bg-secondary/50"></div>
                <div className="w-3 h-3 rounded-full bg-primary/50"></div>
              </div>
              <span className="text-xs text-on-surface-variant font-mono">450 WPM</span>
              <div className="w-[48px]"></div>
            </div>
            
            <div className="flex-1 flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-full h-[1px] bg-outline-variant/20"></div>
                <div className="absolute h-full w-[1px] bg-outline-variant/20"></div>
              </div>
              
              <div className="relative z-10 text-center font-['Be_Vietnam_Pro'] text-5xl md:text-[72px] font-medium text-on-surface">
                <div className="absolute inset-0 bg-tertiary-fixed-dim/5 blur-[40px] rounded-full scale-150"></div>
                <span className="opacity-50">{currentWord.text.substring(0, currentWord.focus)}</span>
                <span className="text-primary font-bold">{currentWord.text.substring(currentWord.focus, currentWord.focus + 1)}</span>
                <span className="opacity-50">{currentWord.text.substring(currentWord.focus + 1)}</span>
              </div>
            </div>
            
            <div className="h-20 border-t border-outline-variant/10 bg-surface-container/50 flex items-center justify-center gap-8 px-6">
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 rounded-full bg-on-surface text-surface flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>
            </div>
            
            <div className="absolute bottom-0 left-0 h-1 bg-outline-variant/20 w-full">
              <div className="h-full bg-primary" style={{ width: `${(demoWordIndex / demoWords.length) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-4 lg:px-6 bg-surface">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-container rounded-2xl p-8 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors"></div>
              <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center mb-8 shadow-sm border border-outline-variant/10">
                <EyeOff className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-2xl font-semibold text-on-surface mb-3">Distraction-Free</h4>
              <p className="text-base text-on-surface-variant mt-auto">Invisible UI. Total focus. Everything strips away leaving only the current word, ensuring your cognitive load is dedicated entirely to comprehension.</p>
            </div>
            
            <div className="bg-surface-container rounded-2xl p-8 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-fixed-dim/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-tertiary-fixed-dim/10 transition-colors"></div>
              <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center mb-8 shadow-sm border border-outline-variant/10">
                <SlidersHorizontal className="w-6 h-6 text-tertiary-fixed-dim" />
              </div>
              <h4 className="text-2xl font-semibold text-on-surface mb-3">Customizable Speeds</h4>
              <p className="text-base text-on-surface-variant mt-auto">Start at a comfortable 250 WPM and smoothly scale up to 1000+ WPM. The intelligent engine automatically adjusts pacing for punctuation and long words.</p>
            </div>
            
            <div className="bg-surface-container rounded-2xl p-8 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-secondary/10 transition-colors"></div>
              <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center mb-8 shadow-sm border border-outline-variant/10">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <h4 className="text-2xl font-semibold text-on-surface mb-3">Progress Tracking</h4>
              <p className="text-base text-on-surface-variant mt-auto">Monitor your reading velocity, comprehension scores, and library completion rates with minimalist, high-contrast data visualizations.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-32 px-4 lg:px-6 bg-surface-container-lowest relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-on-surface mb-6">Ready to accelerate your mind?</h2>
          <p className="text-lg text-on-surface-variant mb-12">Join thousands of high-output professionals who have revolutionized how they consume information.</p>
          <button onClick={() => setView('library')} className="px-10 py-5 bg-on-surface text-surface font-semibold text-xl rounded-xl shadow-xl hover:bg-surface-tint hover:scale-105 transition-all duration-300">
            Create Free Account
          </button>
          <p className="text-xs font-medium text-on-surface-variant mt-6 opacity-60">No credit card required. 14-day premium trial included.</p>
        </div>
      </section>
    </div>
  );
}
