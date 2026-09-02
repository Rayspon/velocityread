import { Plus, Search, Timer, Zap, BookOpen, MoreVertical, CheckCircle, FileText, Upload } from 'lucide-react';
import { TextItem, ViewState, UserStats } from '../types';

interface LibraryViewProps {
  library: TextItem[];
  setView: (view: ViewState) => void;
  onSelectText: (id: string) => void;
  stats: UserStats;
}

export function LibraryView({ library, setView, onSelectText, stats }: LibraryViewProps) {
  const activeTexts = Array.isArray(library) ? library.filter(t => t.progress < 100).length : 0;
  const safeLibrary = Array.isArray(library) ? library : [];

  const formatTime = (ms: number) => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="flex flex-col w-full px-4 lg:px-6 mx-auto max-w-[1200px] pb-32 pt-24">
      {/* Top Actions & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-12 gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('input')}
            className="bg-on-surface text-surface px-6 py-3 rounded-full flex items-center gap-2 hover:bg-surface-tint transition-colors shadow-lg shadow-on-surface/10 group"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            <span className="font-medium text-xs uppercase tracking-wider">New Text</span>
          </button>
          
          <div className="h-8 w-px bg-outline-variant/30 hidden md:block"></div>
          
          <div className="gap-2 hidden md:flex">
            <button className="px-4 py-2 rounded-full border border-outline-variant/30 text-xs text-on-surface bg-surface-variant transition-colors">All</button>
            <button className="px-4 py-2 rounded-full border border-outline-variant/30 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors">Articles</button>
            <button className="px-4 py-2 rounded-full border border-outline-variant/30 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors">Books</button>
          </div>
        </div>
        
        <div className="relative w-full md:w-auto min-w-[280px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search library..." 
            className="w-full bg-surface-container-low text-on-surface text-base pl-12 pr-4 py-3 rounded-full border border-outline-variant/30 focus:border-on-tertiary-container focus:outline-none transition-colors placeholder:text-on-surface-variant/50"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative">
        <div className="bg-surface-container rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Total Read Time</p>
            <p className="text-3xl font-semibold text-on-surface">{formatTime(stats.totalReadTimeMs)}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-tertiary-container/30 flex items-center justify-center">
            <Timer className="w-6 h-6 text-on-tertiary-container" />
          </div>
        </div>
        
        <div className="bg-surface-container rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Avg Speed</p>
            <p className="text-3xl font-semibold text-on-surface">{Math.round(stats.averageWpm)} <span className="text-base font-normal text-on-surface-variant">WPM</span></p>
          </div>
          <div className="w-12 h-12 rounded-full bg-tertiary-container/30 flex items-center justify-center">
            <Zap className="w-6 h-6 text-on-tertiary-container" />
          </div>
        </div>
        
        <div className="bg-surface-container rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Active Texts</p>
            <p className="text-3xl font-semibold text-on-surface">{activeTexts}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-tertiary-container/30 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-on-tertiary-container" />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end mb-8 border-b border-outline-variant/20 pb-4">
        <h2 className="text-2xl font-semibold text-on-surface">Recent Activity</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {safeLibrary.map((item) => (
          <button 
            key={item.id}
            onClick={() => onSelectText(item.id)}
            className="text-left group relative bg-surface-container hover:bg-surface-container-high transition-colors rounded-2xl p-6 flex flex-col h-[280px] shadow-sm hover:shadow-md border border-outline-variant/10"
          >
            <div className="flex justify-between items-start mb-4 w-full">
              <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-widest ${
                item.progress >= 100 
                  ? 'border border-outline-variant/50 text-on-surface-variant flex items-center gap-1' 
                  : item.type === 'Article' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-primary-fixed text-on-primary-fixed'
              }`}>
                {item.progress >= 100 && <CheckCircle className="w-3 h-3" />}
                {item.progress >= 100 ? 'Done' : item.type}
              </span>
              <div className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-on-surface">
                <MoreVertical className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0 opacity-100 transition-opacity w-full">
              <h3 className="text-xl font-semibold leading-tight text-on-surface mb-2 line-clamp-3 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              {item.author && <p className="text-sm text-on-surface-variant line-clamp-1">{item.author}</p>}
            </div>
            
            <div className="mt-auto pt-6 w-full">
              {item.progress < 100 ? (
                <>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-2xl text-on-surface leading-none">{item.progress}%</span>
                  </div>
                  <div className="h-[2px] w-full bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-on-tertiary-container" style={{ width: `${item.progress}%` }}></div>
                  </div>
                </>
              ) : (
                <div className="h-[2px] w-full bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-primary-fixed-dim w-full"></div>
                </div>
              )}
            </div>
          </button>
        ))}

        {/* Add New Card Slot */}
        <button 
          onClick={() => setView('input')}
          className="group bg-surface-container-low hover:bg-surface-container border border-dashed border-outline-variant/50 hover:border-on-tertiary-container/50 transition-all rounded-2xl p-6 flex flex-col items-center justify-center h-[280px]"
        >
          <div className="w-16 h-16 rounded-full bg-surface-variant group-hover:bg-tertiary-container/30 flex items-center justify-center mb-4 transition-colors">
            <FileText className="w-8 h-8 text-on-surface-variant group-hover:text-on-tertiary-container transition-colors" />
          </div>
          <span className="text-lg font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors">Add Text</span>
          <span className="text-sm text-on-surface-variant/60 mt-2">Paste or upload</span>
        </button>
      </div>
    </div>
  );
}
