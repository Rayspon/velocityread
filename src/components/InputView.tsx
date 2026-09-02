import { useState, useRef, ChangeEvent } from 'react';
import { Camera, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { TextItem, ViewState } from '../types';

interface InputViewProps {
  setView: (view: ViewState) => void;
  onAddText: (text: Omit<TextItem, 'id' | 'progress' | 'lastRead'>) => void;
}

export function InputView({ setView, onAddText }: InputViewProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract text. Make sure you set GEMINI_API_KEY.');
      }

      const data = await response.json();
      setContent(prev => prev + (prev ? '\n\n' : '') + data.text);
      if (!title) {
        setTitle('Extracted from Image');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
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
      title: title.trim() || 'Untitled Session',
      content: content.trim(),
      type: 'Article'
    });
  };

  return (
    <div className="flex flex-col w-full px-4 lg:px-6 mx-auto max-w-[800px] pb-32 pt-24 min-h-screen">
      <button 
        onClick={() => setView('library')}
        className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-8 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Library</span>
      </button>

      <h1 className="text-3xl font-semibold text-on-surface mb-8 tracking-tight">Add New Text</h1>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g., The Architecture of Focus" 
            className="w-full bg-surface-container-low text-on-surface text-base px-4 py-3 rounded-xl border border-outline-variant/30 focus:border-on-tertiary-container focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <div className="flex justify-between items-end">
            <label className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">Content</label>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isExtracting}
              className="flex items-center gap-2 text-on-tertiary-container hover:text-tertiary transition-colors text-sm font-medium"
            >
              {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              {isExtracting ? 'Extracting Text...' : 'Scan Physical Book'}
            </button>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </div>
          
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your text here, or use the camera button to extract text from a physical book..."
            className="w-full h-[400px] bg-surface-container-low text-on-surface text-base p-4 rounded-xl border border-outline-variant/30 focus:border-on-tertiary-container focus:outline-none transition-colors resize-none leading-relaxed"
          ></textarea>
        </div>

        {error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-lg text-sm">
            {error}
          </div>
        )}

        <button 
          onClick={handleStartReading}
          disabled={!content.trim() || isExtracting}
          className="mt-4 w-full sm:w-auto self-end bg-on-surface text-surface px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-surface-tint transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
        >
          <FileText className="w-5 h-5" />
          Start Reading
        </button>
      </div>
    </div>
  );
}
