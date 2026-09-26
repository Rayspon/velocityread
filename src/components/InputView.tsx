import { useState, useRef, ChangeEvent } from 'react';
import { Camera, Plus, Loader2, ArrowLeft, BookOpen, FileText } from 'lucide-react';
import { TextItem, ViewState } from '../types';

interface InputViewProps {
  setView: (view: ViewState) => void;
  onAddText: (text: Omit<TextItem, 'id' | 'progress' | 'lastRead'>) => void;
}

export function InputView({ setView, onAddText }: InputViewProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [itemType, setItemType] = useState<'Book' | 'Article'>('Book');
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setError(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<{ base64Data: string; mimeType: string }>((resolve, reject) => {
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            const base64Data = result.split(',')[1];
            resolve({ base64Data, mimeType: file.type });
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
      });
      reader.readAsDataURL(file);

      const { base64Data, mimeType } = await base64Promise;

      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Data, mimeType }),
      });

      if (!response.ok) {
        let errorMsg = `Server error: ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch {
          const errText = await response.text();
          errorMsg = errText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setContent(prev => prev + (prev ? '\n\n' : '') + data.text);
      if (!title) {
        setTitle('Scanned Book Page');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong while scanning the page.');
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleStartReading = () => {
    if (!content.trim()) return;
    onAddText({
      title: title.trim() || 'Untitled Text',
      author: author.trim() || undefined,
      content: content.trim(),
      type: itemType
    });
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-[900px] pb-32 pt-20 md:pt-28 min-h-screen font-serif">
      {/* Return button */}
      <button 
        onClick={() => setView('library')}
        className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-6 w-fit font-['Cinzel'] text-xs font-bold uppercase tracking-wider py-1.5 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Library</span>
      </button>

      {/* Header */}
      <div className="mb-8 md:mb-10">
        <div className="inline-flex items-center gap-2 text-secondary text-xs uppercase tracking-[0.25em] font-['Cinzel'] mb-2">
          <span>❦</span>
          <span>Add New Content</span>
          <span>❧</span>
        </div>
        <h1 className="font-['Cinzel_Decorative'] text-3xl sm:text-4xl font-bold text-on-surface tracking-tight mb-2">
          Add Text to Library
        </h1>
        <p className="font-['EB_Garamond'] italic text-base sm:text-lg text-on-surface-variant leading-relaxed">
          Paste an article, excerpt, or book, or scan a physical book page with your camera.
        </p>
      </div>

      <div className="bg-surface-container/60 rounded-xl p-6 sm:p-8 border border-outline-variant/60 shadow-xs flex flex-col gap-6">
        {/* Title & Author Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-['Cinzel'] text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Title
            </label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Great Gatsby" 
              className="w-full bg-surface text-on-surface text-base px-4 py-3 rounded-lg border border-outline-variant/70 focus:border-secondary focus:outline-none transition-colors font-['EB_Garamond'] min-h-[44px]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-['Cinzel'] text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Author (Optional)
            </label>
            <input 
              type="text" 
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. F. Scott Fitzgerald" 
              className="w-full bg-surface text-on-surface text-base px-4 py-3 rounded-lg border border-outline-variant/70 focus:border-secondary focus:outline-none transition-colors font-['EB_Garamond'] min-h-[44px]"
            />
          </div>
        </div>

        {/* Content Type Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="font-['Cinzel'] text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Format:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setItemType('Book')}
              className={`px-4 py-2 rounded-md text-xs font-['Cinzel'] tracking-wider uppercase transition-colors border min-h-[40px] ${
                itemType === 'Book'
                  ? 'bg-primary text-on-primary border-primary font-bold shadow-xs'
                  : 'bg-surface border-outline-variant/60 text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Book
            </button>
            <button
              type="button"
              onClick={() => setItemType('Article')}
              className={`px-4 py-2 rounded-md text-xs font-['Cinzel'] tracking-wider uppercase transition-colors border min-h-[40px] ${
                itemType === 'Article'
                  ? 'bg-primary text-on-primary border-primary font-bold shadow-xs'
                  : 'bg-surface border-outline-variant/60 text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Article / Document
            </button>
          </div>
        </div>

        {/* Text Content Area */}
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <label className="font-['Cinzel'] text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Text Content
            </label>
            
            {/* Scan Physical Book Button */}
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isExtracting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-secondary/70 bg-surface text-secondary hover:bg-surface-container-high transition-colors font-['Cinzel'] text-xs font-bold uppercase tracking-wider min-h-[40px] shadow-xs active:scale-98"
              title="Upload photo of printed book page to extract text"
            >
              {isExtracting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              <span>{isExtracting ? 'Scanning Page...' : 'Scan Book Page'}</span>
            </button>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </div>
          
          <div className="relative">
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or write your text here. The words will be presented sequentially at your desired speed..."
              className="w-full h-[320px] sm:h-[380px] bg-surface text-on-surface text-base p-4 sm:p-5 rounded-lg border border-outline-variant/70 focus:border-secondary focus:outline-none transition-colors resize-none leading-relaxed font-['EB_Garamond'] shadow-inner"
            ></textarea>

            {/* Word count stamp */}
            <div className="absolute bottom-3 right-4 font-['Cinzel'] text-[11px] text-on-surface-variant/70 select-none bg-surface/80 px-2.5 py-1 rounded backdrop-blur-xs border border-outline-variant/30">
              {wordCount} words
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-primary-container text-on-primary-container rounded-lg border border-primary/30 text-sm font-['EB_Garamond']">
            {error}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button 
            onClick={handleStartReading}
            disabled={!content.trim() || isExtracting}
            className="w-full sm:w-auto bg-primary text-on-primary px-8 py-3.5 rounded-lg border border-secondary/50 flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Cinzel'] text-xs font-bold uppercase tracking-widest shadow-md min-h-[48px]"
          >
            <BookOpen className="w-4 h-4" />
            <span>Start Reading</span>
          </button>
        </div>
      </div>
    </div>
  );
}
