import React, { useState, useCallback } from 'react';
import { Hook, LanguageStyle, VideoScript, TargetAudience } from '../types';
import { generateScript } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageInput from '../components/ImageInput';
import { SparklesIcon } from '../components/icons';

type ProductDescription = { type: 'image'; file: File | null } | { type: 'text'; text: string };

interface ScriptGeneratorPageProps {
  generatedHooks: Hook[] | null;
  productName: string;
  languageStyle: LanguageStyle;
  targetAudience: TargetAudience;
  productImage: File | null;
  description: ProductDescription;
  setDescription: (desc: ProductDescription) => void;
  generatedScript: VideoScript | null;
  setGeneratedScript: (script: VideoScript | null) => void;
}

const ScriptCard: React.FC<{ title: string; content: string }> = ({ title, content }) => {
    const [copied, setCopied] = React.useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(content).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 relative group">
            <h3 className="font-semibold text-indigo-400 mb-2">{title}</h3>
            <p className="text-slate-300 whitespace-pre-line">{content}</p>
             <button 
                onClick={copyToClipboard}
                className="absolute top-3 right-3 p-1.5 bg-slate-700 text-slate-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Copy to clipboard"
            >
                {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                )}
            </button>
        </div>
    );
};


const ScriptGeneratorPage: React.FC<ScriptGeneratorPageProps> = ({ 
    generatedHooks, 
    productName, 
    languageStyle,
    targetAudience, 
    productImage, 
    description, 
    setDescription,
    generatedScript,
    setGeneratedScript
}) => {
  const [selectedHook, setSelectedHook] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [descriptionImageUrl, setDescriptionImageUrl] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState<boolean>(false);
  const [maxChars, setMaxChars] = useState<number>(500);


  React.useEffect(() => {
    if (generatedHooks && generatedHooks.length > 0 && !selectedHook) {
      setSelectedHook(generatedHooks[0].content);
    }
  }, [generatedHooks, selectedHook]);

  const handleDescriptionTypeChange = (type: 'image' | 'text') => {
    if (type === 'image') {
        setDescription({ type: 'image', file: null });
        setDescriptionImageUrl(null);
    } else {
        setDescription({ type: 'text', text: '' });
    }
  };

  const handleDescriptionImageChange = (file: File | null) => {
      if (description.type === 'image') {
        setDescription({ type: 'image', file });
        if (file) {
            setDescriptionImageUrl(URL.createObjectURL(file));
        } else {
            setDescriptionImageUrl(null);
        }
      }
  };
  
  const handleDescriptionTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (description.type === 'text') {
        setDescription({ type: 'text', text: e.target.value });
      }
  };

  const handleGenerate = useCallback(async () => {
    if (!selectedHook) {
      setError('Harap pilih hook terlebih dahulu.');
      return;
    }
    if (!productName) {
        setError('Nama produk tidak ditemukan. Harap isi nama produk di halaman Hook terlebih dahulu.');
        return;
    }
    const isDescriptionValid = description.type === 'image' ? !!description.file : !!description.text.trim();
    if (!isDescriptionValid) {
        setError('Harap isi Deskripsi Produk untuk melanjutkan.');
        return;
    }


    setIsLoading(true);
    setError(null);
    setGeneratedScript(null);

    try {
      const response = await generateScript(productName, selectedHook, languageStyle, productImage, description, targetAudience, maxChars);
      setGeneratedScript({
        hook: selectedHook,
        ...response,
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Terjadi kesalahan tidak diketahui.';
      setError(`Gagal menghasilkan skrip: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedHook, productName, languageStyle, productImage, description, setGeneratedScript, targetAudience, maxChars]);

  const handleCopyAll = () => {
    if (!generatedScript) return;

    const fullScript = `${generatedScript.hook}\n\n${generatedScript.body}\n\n${generatedScript.cta}`;
    
    navigator.clipboard.writeText(fullScript).then(() => {
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    });
  };

  if (!generatedHooks || generatedHooks.length === 0) {
    return (
      <div className="text-center text-slate-500 bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
        <SparklesIcon className="mx-auto h-12 w-12 mb-4" />
        <h3 className="text-lg font-medium text-slate-300">Belum ada hook yang dibuat</h3>
        <p>Silakan kembali ke halaman "Hook" untuk membuat beberapa hook terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
      {/* Input Section */}
      <div className="lg:col-span-2 bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700 self-start">
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Buat Skrip Video</h2>
                <p className="text-slate-400 mb-6">Pilih hook, lalu lengkapi deskripsi produk untuk membuat skrip video yang utuh.</p>
            </div>
            <div>
                <label htmlFor="hook-select" className="block text-sm font-medium text-slate-300 mb-2">Pilih Hook</label>
                <select
                id="hook-select"
                value={selectedHook}
                onChange={(e) => setSelectedHook(e.target.value)}
                className="block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                >
                {generatedHooks.map(hook => (
                    <option key={hook.type} value={hook.content}>{`[${hook.type}] ${hook.content}`}</option>
                ))}
                </select>
            </div>
            <div>
                <label htmlFor="max-chars-select" className="block text-sm font-medium text-slate-300 mb-2">Maksimal Karakter Skrip</label>
                <select
                    id="max-chars-select"
                    value={maxChars}
                    onChange={(e) => setMaxChars(Number(e.target.value))}
                    className="block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                >
                    <option value={200}>200 Karakter</option>
                    <option value={300}>300 Karakter</option>
                    <option value={400}>400 Karakter</option>
                    <option value={500}>500 Karakter</option>
                    <option value={600}>600 Karakter</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Deskripsi Produk</label>
                <div className="flex items-center space-x-4 mb-3">
                    <label className="flex items-center cursor-pointer">
                        <input type="radio" name="descriptionType" value="text" checked={description.type === 'text'} onChange={() => handleDescriptionTypeChange('text')} className="h-4 w-4 bg-slate-800 border-slate-600 text-indigo-600 focus:ring-indigo-500" />
                        <span className="ml-2 text-sm text-slate-300">Input Teks</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input type="radio" name="descriptionType" value="image" checked={description.type === 'image'} onChange={() => handleDescriptionTypeChange('image')} className="h-4 w-4 bg-slate-800 border-slate-600 text-indigo-600 focus:ring-indigo-500" />
                        <span className="ml-2 text-sm text-slate-300">Upload Gambar</span>
                    </label>
                </div>
                {description.type === 'text' ? (
                    <textarea
                        id="description-text"
                        rows={6}
                        value={description.text}
                        onChange={handleDescriptionTextChange}
                        placeholder="Masukkan deskripsi produk, fitur, keunggulan, dan target pasar di sini..."
                        className="block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                    />
                ) : (
                    <ImageInput id="description-image" label="" onFileChange={handleDescriptionImageChange} previewUrl={descriptionImageUrl} />
                )}
            </div>
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:bg-indigo-500/50 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'Membuat...' : 'Generate Script'}
                {!isLoading && <SparklesIcon className="w-5 h-5" />}
            </button>
        </div>
      </div>
      {/* Output Section */}
      <div className="lg:col-span-3 bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700 min-h-[400px] flex flex-col justify-center">
        {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-md">{error}</div>}
        {isLoading && <LoadingSpinner />}
        {!isLoading && !error && !generatedScript && (
            <div className="text-center text-slate-500">
                <SparklesIcon className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium text-slate-300">Skrip video akan muncul di sini...</h3>
                <p>Pilih hook, isi deskripsi, dan klik generate.</p>
            </div>
        )}
        {generatedScript && (
            <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-4 mb-2">
                    <h2 className="text-xl font-bold text-white">Skrip "{productName}"</h2>
                    <button
                        onClick={handleCopyAll}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-colors"
                    >
                        {allCopied ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Tersalin!
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Salin Semua Skrip
                            </>
                        )}
                    </button>
                </div>
                <ScriptCard title="1. Hook" content={generatedScript.hook} />
                <ScriptCard title="2. Isi" content={generatedScript.body} />
                <ScriptCard title="3. Call to Action" content={generatedScript.cta} />
            </div>
        )}
      </div>
    </div>
  );
};

export default ScriptGeneratorPage;