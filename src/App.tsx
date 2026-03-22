import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Copy, Check, RefreshCw, Type, Hash, Globe, Zap, ShieldCheck, ArrowLeft, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import imageCompression from 'browser-image-compression';
import { generateCaptions, CaptionOptions, Caption, CaptionResponse } from './services/geminiService';

const TONES = ['Witty', 'Professional', 'Inspirational', 'Minimalist', 'Funny', 'Sarcastic', 'Heartfelt'];
const PLATFORMS = ['Instagram', 'LinkedIn', 'Twitter/X', 'Facebook', 'TikTok'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Hebrew', 'Arabic', 'Japanese'];

function CaptionCard({ caption, index }: { caption: Caption; index: number }) {
  const [copied, setCopied] = useState(false);

  const hashtagsStr = Array.isArray(caption.hashtags) ? caption.hashtags.join(' ') : '';
  const fullText = `${caption.hook || ''}\n\n${caption.body || ''}\n\n${caption.cta || ''}\n\n${hashtagsStr}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative"
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={copyToClipboard}
          className="p-2 bg-neutral-50 hover:bg-emerald-50 text-neutral-400 hover:text-emerald-600 rounded-lg border border-neutral-100 transition-colors"
          title="Copy Caption"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Option {index + 1}</span>
        </div>
        
        <div className="space-y-3">
          <p className="font-bold text-neutral-900 leading-tight">{caption.hook || 'Untitled Caption'}</p>
          <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">{caption.body || ''}</p>
          <p className="text-emerald-600 font-medium text-sm italic">{caption.cta || ''}</p>
        </div>

        {Array.isArray(caption.hashtags) && caption.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-50">
            {caption.hashtags.map((tag, i) => (
              <span key={i} className="text-[11px] text-neutral-400 font-medium">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CaptionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<CaptionOptions>({
    tone: 'Witty',
    platform: 'Instagram',
    language: 'English',
    additionalContext: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      
      // Compress image to ensure it's under the 50MB limit and faster to process
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setLoading(false);
      };
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error('Image processing error:', err);
      setError('Failed to process image. Please try another one.');
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await generateCaptions(image, options);
      if (response.error) {
        setError(response.error);
      } else {
        setResults(response);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-neutral-900 font-sans selection:bg-emerald-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Zap size={22} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-neutral-900 leading-none">CaptionCrafter AI</h1>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Algorithm Optimized Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-neutral-50 rounded-full border border-neutral-100">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Instagram • TikTok • Facebook</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Generate Captions</h2>
              <p className="text-neutral-500">Upload an image and let AI craft the perfect social media post.</p>
            </div>

            <div className="space-y-6">
              {/* Image Upload Area */}
              <div 
                onClick={() => !image && fileInputRef.current?.click()}
                className={`relative aspect-square rounded-3xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer group
                  ${image ? 'border-emerald-600/20 bg-emerald-50/10' : 'border-neutral-200 hover:border-emerald-400 bg-white hover:bg-neutral-50'}`}
              >
                {image ? (
                  <>
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="p-3 bg-white rounded-full text-neutral-900 hover:scale-110 transition-transform"
                      >
                        <RefreshCw size={20} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); reset(); }}
                        className="p-3 bg-red-500 rounded-full text-white hover:scale-110 transition-transform"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4 p-8">
                    <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto text-neutral-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                      <ImageIcon size={32} />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">Click to upload image</p>
                      <p className="text-sm text-neutral-400">PNG, JPG or WEBP (max. 10MB)</p>
                    </div>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                    <Zap size={12} className="text-emerald-600" /> Tone
                  </label>
                  <select 
                    value={options.tone}
                    onChange={(e) => setOptions({ ...options, tone: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                    <Globe size={12} className="text-emerald-600" /> Platform
                  </label>
                  <select 
                    value={options.platform}
                    onChange={(e) => setOptions({ ...options, platform: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                    <Type size={12} className="text-emerald-600" /> Language
                  </label>
                  <select 
                    value={options.language}
                    onChange={(e) => setOptions({ ...options, language: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                    <Hash size={12} className="text-emerald-600" /> Additional Context
                  </label>
                  <textarea 
                    value={options.additionalContext}
                    onChange={(e) => setOptions({ ...options, additionalContext: e.target.value })}
                    placeholder="e.g. Summer sale, hiking trip, product launch..."
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={!image || loading}
                className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-3
                  ${!image || loading 
                    ? 'bg-neutral-200 cursor-not-allowed shadow-none' 
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 active:scale-[0.98]'}`}
              >
                {loading ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    <span>Crafting Captions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Generate Captions</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <div className="bg-neutral-100/50 rounded-[32px] p-8 min-h-full border border-neutral-200/50">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-[600px] space-y-6 text-center"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-emerald-100 rounded-full animate-pulse" />
                      <div className="absolute inset-0 w-20 h-20 border-t-4 border-emerald-600 rounded-full animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">Analyzing your image</h3>
                      <p className="text-neutral-500 max-w-xs mx-auto">Our AI is scanning the details to create algorithm-optimized captions.</p>
                    </div>
                  </motion.div>
                ) : results ? (
                  <motion.div 
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Sparkles size={20} className="text-emerald-600" /> Generated Options
                      </h3>
                      <button 
                        onClick={reset}
                        className="text-sm font-bold text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-2"
                      >
                        <ArrowLeft size={16} /> Start Over
                      </button>
                    </div>

                    {results.isRaw ? (
                      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                        <div className="markdown-body">
                          <Markdown>{results.text}</Markdown>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-6">
                        {results.captions?.map((cap, i) => (
                          <CaptionCard key={i} caption={cap} index={i} />
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : error ? (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-[600px] space-y-6 text-center"
                  >
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                      <Zap size={32} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-red-600">Generation Failed</h3>
                      <p className="text-neutral-500 max-w-xs mx-auto">{error}</p>
                    </div>
                    <button 
                      onClick={handleGenerate}
                      className="px-6 py-2 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors"
                    >
                      Try Again
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-[600px] space-y-6 text-center"
                  >
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-neutral-200">
                      <Sparkles size={40} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-neutral-400">Your captions will appear here</h3>
                      <p className="text-neutral-400 max-w-xs mx-auto">Upload an image and click generate to see the magic happen.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-neutral-200 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-400">© 2026 CaptionCrafter AI. Powered by OpenRouter.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm font-bold text-neutral-400 hover:text-neutral-900 transition-colors">Privacy</a>
            <a href="#" className="text-sm font-bold text-neutral-400 hover:text-neutral-900 transition-colors">Terms</a>
            <a href="#" className="text-sm font-bold text-neutral-400 hover:text-neutral-900 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
