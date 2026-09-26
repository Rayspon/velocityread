import { ReaderCustomization } from '../types';

const READER_PREFS_KEY = 'velocity_reader_customization';

// Default theme is DARK as requested
export const DEFAULT_READER_CONFIG: ReaderCustomization = {
  fontFamily: 'helvetica', // Default reading font is Helvetica Neue
  fontSize: 72,
  textColor: '#ede2d2',
  focalColor: '#d4af37',
  bgColor: '#17120e',
  showVignette: true,
};

export const AVAILABLE_FONTS = [
  { id: 'helvetica', name: 'Helvetica Neue', fontClass: 'font-reading-helvetica', family: '"Helvetica Neue", Helvetica, -apple-system, BlinkMacSystemFont, Arial, sans-serif', description: 'Default · Clean & High Legibility' },
  { id: 'inter', name: 'Inter', fontClass: 'font-reading-inter', family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", description: 'Modern UI Sans' },
  { id: 'garamond', name: 'EB Garamond', fontClass: 'font-reading-garamond', family: "'EB Garamond', Georgia, serif", description: 'Classic Book Serif' },
  { id: 'fell', name: 'IM Fell English', fontClass: 'font-reading-fell', family: "'IM Fell English', Georgia, serif", description: 'Vintage Printed Press' },
  { id: 'merriweather', name: 'Merriweather', fontClass: 'font-reading-merriweather', family: "'Merriweather', Georgia, serif", description: 'Warm Editorial Serif' },
  { id: 'cinzel', name: 'Cinzel', fontClass: 'font-reading-cinzel', family: "'Cinzel', Georgia, serif", description: 'Classical Inscribed Serif' },
  { id: 'georgia', name: 'Georgia', fontClass: 'font-reading-georgia', family: "Georgia, 'Times New Roman', serif", description: 'Standard Book Serif' },
  { id: 'mono', name: 'Monospace', fontClass: 'font-reading-mono', family: "'Special Elite', 'Courier Prime', Courier, monospace", description: 'Fixed-width Typewriter' },
];

export const PRESET_THEMES = [
  { name: 'Dark Leather (Default)', bg: '#17120e', text: '#ede2d2', focal: '#d4af37', isDark: true },
  { name: 'Midnight Pitch', bg: '#09090b', text: '#f4f4f5', focal: '#f59e0b', isDark: true },
  { name: 'Deep Navy', bg: '#0f172a', text: '#f1f5f9', focal: '#38bdf8', isDark: true },
  { name: 'Forest Grove', bg: '#101d14', text: '#e2ece4', focal: '#4ade80', isDark: true },
  { name: 'Aged Parchment', bg: '#f4eee1', text: '#241c17', focal: '#882b20', isDark: false },
  { name: 'Clean Cream', bg: '#faf7f0', text: '#18181b', focal: '#dc2626', isDark: false },
  { name: 'Minimal White', bg: '#ffffff', text: '#09090b', focal: '#e11d48', isDark: false },
  { name: 'Warm Sepia', bg: '#ece1cf', text: '#3c2e22', focal: '#993a2c', isDark: false },
];

export function getReaderPreferences(): ReaderCustomization {
  try {
    const saved = localStorage.getItem(READER_PREFS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_READER_CONFIG,
        ...parsed,
        fontFamily: parsed.fontFamily || 'helvetica',
        fontSize: typeof parsed.fontSize === 'number' ? parsed.fontSize : 72,
      };
    }
  } catch (e) {
    console.error('Failed to load reader preferences', e);
  }
  return DEFAULT_READER_CONFIG;
}

export function saveReaderPreferences(prefs: ReaderCustomization): void {
  try {
    localStorage.setItem(READER_PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save reader preferences', e);
  }
}
