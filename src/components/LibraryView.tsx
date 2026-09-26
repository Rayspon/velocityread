import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Clock, 
  Zap, 
  BookOpen, 
  Bookmark, 
  Feather, 
  CheckCircle2, 
  Library as LibraryIcon,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { TextItem, ViewState, UserStats } from '../types';

interface LibraryViewProps {
  library: TextItem[];
  setView: (view: ViewState) => void;
  onSelectText: (id: string) => void;
  stats: UserStats;
}

export function LibraryView({ library, setView, onSelectText, stats }: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'books' | 'articles'>('all');

  const safeLibrary = Array.isArray(library) ? library : [];
  const activeTexts = safeLibrary.filter(t => t.progress < 100).length;

  const formatTime = (ms: number) => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const filteredLibrary = useMemo(() => {
    return safeLibrary.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchesSearch) return false;
      if (filterType === 'books') return item.type === 'Book';
      if (filterType === 'articles') return item.type === 'Article';
      return true;
    });
  }, [safeLibrary, searchQuery, filterType]);

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-10 mx-auto max-w-[1280px] pb-32 pt-20 md:pt-28 font-serif">
      {/* Header Section */}
      <div className="text-center pt-2 pb-8 md:pb-12 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center gap-2.5 text-secondary text-xs uppercase tracking-[0.25em] font-['Cinzel'] mb-3">
          <span>❦</span>
          <span>Your Reading Collection</span>
          <span>❧</span>
        </div>
        <h1 className="font-['Cinzel_Decorative'] font-bold text-3xl sm:text-4xl md:text-5xl text-on-surface tracking-wide mb-3 leading-tight">
          Library
        </h1>
        <p className="font-['EB_Garamond'] italic text-base sm:text-lg text-on-surface-variant leading-relaxed">
          Read books, articles, and long documents faster with Rapid Serial Visual Presentation.
        </p>
      </div>

      {/* Stats Grid - Modern English */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10 md:mb-14">
        <div className="bg-surface-container/60 rounded-xl p-5 md:p-6 border border-outline-variant/50 relative overflow-hidden antique-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-['Cinzel'] text-[11px] text-on-surface-variant uppercase tracking-widest mb-1.5 font-bold">
                Total Read Time
              </p>
              <p className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-on-surface">
                {formatTime(stats.totalReadTimeMs)}
              </p>
              <p className="text-xs text-on-surface-variant/80 italic mt-1 font-['EB_Garamond']">
                Total time spent reading
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-surface border border-secondary/40 flex items-center justify-center text-secondary shadow-xs shrink-0">
              <Clock className="w-5 h-5 text-secondary" />
            </div>
          </div>
        </div>
        
        <div className="bg-surface-container/60 rounded-xl p-5 md:p-6 border border-outline-variant/50 relative overflow-hidden antique-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-['Cinzel'] text-[11px] text-on-surface-variant uppercase tracking-widest mb-1.5 font-bold">
                Average Speed
              </p>
              <p className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-on-surface">
                {Math.round(stats.averageWpm)}{' '}
                <span className="text-sm font-normal text-on-surface-variant">WPM</span>
              </p>
              <p className="text-xs text-on-surface-variant/80 italic mt-1 font-['EB_Garamond']">
                Words read per minute
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-surface border border-secondary/40 flex items-center justify-center text-secondary shadow-xs shrink-0">
              <Zap className="w-5 h-5 text-secondary" />
            </div>
          </div>
        </div>
        
        <div className="bg-surface-container/60 rounded-xl p-5 md:p-6 border border-outline-variant/50 relative overflow-hidden antique-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-['Cinzel'] text-[11px] text-on-surface-variant uppercase tracking-widest mb-1.5 font-bold">
                In Progress
              </p>
              <p className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-on-surface">
                {activeTexts}{' '}
                <span className="text-sm font-normal text-on-surface-variant font-['EB_Garamond'] italic">
                  of {safeLibrary.length} items
                </span>
              </p>
              <p className="text-xs text-on-surface-variant/80 italic mt-1 font-['EB_Garamond']">
                Books currently reading
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-surface border border-secondary/40 flex items-center justify-center text-secondary shadow-xs shrink-0">
              <BookOpen className="w-5 h-5 text-secondary" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Actions: Add Text, Filter, Search */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center pb-6 gap-4 border-b border-outline-variant/50 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setView('input')}
            className="w-full sm:w-auto bg-primary text-on-primary px-6 py-3 rounded-lg border border-primary/50 flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all shadow-sm group min-h-[44px]"
          >
            <Plus className="w-4 h-4 text-on-primary group-hover:rotate-90 transition-transform" />
            <span className="font-['Cinzel'] font-bold text-xs uppercase tracking-wider">Add New Text</span>
          </button>
          
          <div className="h-6 w-px bg-outline-variant/60 hidden sm:block"></div>
          
          {/* Category filters */}
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/40 w-full sm:w-auto justify-between sm:justify-start">
            <button 
              onClick={() => setFilterType('all')}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-md text-xs font-['Cinzel'] tracking-wider uppercase transition-colors min-h-[40px] flex items-center justify-center ${
                filterType === 'all' 
                  ? 'bg-surface text-primary font-bold shadow-xs border border-outline-variant/50' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All ({safeLibrary.length})
            </button>
            <button 
              onClick={() => setFilterType('books')}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-md text-xs font-['Cinzel'] tracking-wider uppercase transition-colors min-h-[40px] flex items-center justify-center ${
                filterType === 'books' 
                  ? 'bg-surface text-primary font-bold shadow-xs border border-outline-variant/50' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Books
            </button>
            <button 
              onClick={() => setFilterType('articles')}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-md text-xs font-['Cinzel'] tracking-wider uppercase transition-colors min-h-[40px] flex items-center justify-center ${
                filterType === 'articles' 
                  ? 'bg-surface text-primary font-bold shadow-xs border border-outline-variant/50' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Articles
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or author..." 
            className="w-full bg-surface-container text-on-surface text-sm pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant/60 focus:border-secondary focus:outline-none transition-colors placeholder:text-on-surface-variant/60 placeholder:italic font-['EB_Garamond'] text-base min-h-[44px]"
          />
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
        {filteredLibrary.map((item, idx) => {
          const rawProgress = typeof item.progress === 'number' ? item.progress : 0;
          const isDone = rawProgress >= 100;
          const displayProgress = isDone ? 100 : Math.min(99, Math.ceil(rawProgress));

          return (
            <button 
              key={item.id}
              onClick={() => onSelectText(item.id)}
              className="group text-left relative bg-surface-container rounded-xl p-6 flex flex-col h-[320px] sm:h-[330px] border border-outline-variant/70 book-card-emboss hover:border-secondary transition-all cursor-pointer overflow-hidden shadow-xs"
            >
              {/* Left Spine Accent */}
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent border-r border-outline-variant/40 flex flex-col justify-between py-5">
                <div className="w-full h-1 bg-secondary/50"></div>
                <div className="w-full h-1 bg-secondary/50"></div>
                <div className="w-full h-1 bg-secondary/50"></div>
              </div>

              {/* Silk Ribbon Bookmark */}
              {!isDone && (
                <div 
                  className="absolute top-0 right-5 w-6 bg-primary shadow-md flex items-center justify-center text-on-primary text-[10px] font-['Cinzel'] font-bold pb-1.5 pt-1 rounded-b z-10 transition-transform group-hover:translate-y-1"
                  title={`Bookmark: ${displayProgress}% completed`}
                >
                  <span>{displayProgress}%</span>
                </div>
              )}

              {/* Header: Book Type & Index */}
              <div className="flex justify-between items-center mb-3 pl-2 pr-6">
                <span className="font-['Cinzel'] text-[11px] tracking-widest text-on-surface-variant uppercase font-semibold">
                  {item.type} {idx + 1}
                </span>

                {isDone && (
                  <span className="flex items-center gap-1 text-[10px] font-['Cinzel'] font-bold text-tertiary uppercase tracking-wider bg-tertiary-container/50 px-2 py-0.5 rounded border border-tertiary/30">
                    <CheckCircle2 className="w-3 h-3" />
                    Completed
                  </span>
                )}
              </div>
              
              {/* Title & Author */}
              <div className="flex-1 min-w-0 pl-2 pr-1 flex flex-col">
                <h3 className="font-['Cinzel'] font-bold text-lg leading-snug text-on-surface mb-2 line-clamp-3 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                
                {item.author && (
                  <p className="font-['IM_Fell_English'] italic text-sm text-on-surface-variant line-clamp-1 mb-2">
                    by {item.author}
                  </p>
                )}

                <p className="font-['EB_Garamond'] text-xs text-on-surface-variant/80 line-clamp-3 leading-relaxed mt-auto pt-2 border-t border-outline-variant/30">
                  {item.content.substring(0, 150)}...
                </p>
              </div>
              
              {/* Footer: Progress Indicator */}
              <div className="mt-3 pt-3 pl-2 border-t border-outline-variant/40 w-full">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-['Cinzel'] text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                    {isDone ? 'Completed' : 'Reading Progress'}
                  </span>
                  <span className="font-['Cinzel'] font-bold text-xs text-on-surface">
                    {displayProgress}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-surface-dim rounded-full border border-outline-variant/40 overflow-hidden p-[1px]">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isDone 
                        ? 'bg-gradient-to-r from-secondary to-tertiary' 
                        : 'bg-gradient-to-r from-secondary via-primary to-primary'
                    }`} 
                    style={{ width: `${displayProgress}%` }}
                  ></div>
                </div>
              </div>
            </button>
          );
        })}

        {/* Add New Card Slot */}
        <button 
          onClick={() => setView('input')}
          className="group bg-surface-container-low hover:bg-surface-container border border-dashed border-outline-variant/80 hover:border-secondary transition-all rounded-xl p-6 flex flex-col items-center justify-center h-[320px] sm:h-[330px] text-center cursor-pointer shadow-xs min-h-[44px]"
        >
          <div className="w-14 h-14 rounded-full bg-surface border border-outline-variant group-hover:border-secondary flex items-center justify-center mb-4 transition-colors shadow-xs">
            <Plus className="w-6 h-6 text-on-surface-variant group-hover:text-primary transition-colors" />
          </div>
          <span className="font-['Cinzel'] text-base font-bold text-on-surface group-hover:text-primary transition-colors uppercase tracking-wider">
            Add New Text
          </span>
          <span className="font-['EB_Garamond'] italic text-sm text-on-surface-variant/80 mt-2 max-w-[200px]">
            Paste text or scan a physical book page with your camera
          </span>
          <span className="font-['Cinzel'] text-xs text-secondary tracking-widest uppercase mt-4 flex items-center gap-1.5 font-bold group-hover:underline">
            <span>+ Add to Library</span>
          </span>
        </button>
      </div>

      {filteredLibrary.length === 0 && (
        <div className="text-center py-16 bg-surface-container rounded-xl border border-outline-variant/50 my-6">
          <p className="font-['Cinzel'] text-base text-on-surface-variant">No items found matching your search.</p>
          <button 
            onClick={() => { setSearchQuery(''); setFilterType('all'); }}
            className="mt-3 font-['Cinzel'] text-xs text-primary underline uppercase tracking-wider font-bold"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
}
