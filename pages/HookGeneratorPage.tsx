import React, { useState, useCallback } from 'react';
import { LanguageStyle, Hook, HookType, GeminiResponse, TargetAudience } from '../types';
import { generateHooks } from '../services/geminiService';
import ImageInput from '../components/ImageInput';
import HookCard from '../components/HookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { SparklesIcon } from '../components/icons';

interface HookGeneratorPageProps {
    productName: string;
    setProductName: (name: string) => void;
    languageStyle: LanguageStyle;
    setLanguageStyle: (style: LanguageStyle) => void;
    targetAudience: TargetAudience;
    setTargetAudience: (audience: TargetAudience) => void;
    setGeneratedHooks: (hooks: Hook[] | null) => void;
    generatedHooks: Hook[] | null;
    productImage: File | null;
    setProductImage: (file: File | null) => void;
}

const HookGeneratorPage: React.FC<HookGeneratorPageProps> = ({
    productName,
    setProductName,
    languageStyle,
    setLanguageStyle,
    targetAudience,
    setTargetAudience,
    setGeneratedHooks,
    generatedHooks,
    productImage,
    setProductImage,
}) => {
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleProductImageChange = (file: File | null) => {
    setProductImage(file);
    if (file) {
      setProductImageUrl(URL.createObjectURL(file));
    } else {
      setProductImageUrl(null);
    }
  };

  const mapResponseToHooks = (response: GeminiResponse): Hook[] => {
    return [
      { type: HookType.QUESTION, content: response.questionHook },
      { type: HookType.DESIRE, content: response.desireHook },
      { type: HookType.HOPE, content: response.hopeHook },
      { type: HookType.PROBLEM, content: response.problemHook },
      { type: HookType.BENEFIT, content: response.benefitHook },
      { type: HookType.CONTROVERSIAL, content: response.controversialHook },
      { type: HookType.FOMO, content: response.fomoHook },
      { type: HookType.NEGATIVE, content: response.negativeHook },
      { type: HookType.CURIOSITY, content: response.curiosityHook },
      { type: HookType.FEAR, content: response.fearHook },
    ];
  };

  const handleGenerate = useCallback(async () => {
    if (!productName || !productImage) {
      setError('Harap isi semua kolom: Nama Produk dan Gambar Produk.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedHooks(null);

    try {
      const response = await generateHooks(productName, productImage, languageStyle, targetAudience);
      const hooks = mapResponseToHooks(response);
      setGeneratedHooks(hooks);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Terjadi kesalahan tidak diketahui.';
      setError(`Gagal menghasilkan hook: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [productName, productImage, languageStyle, targetAudience, setGeneratedHooks]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
      {/* Input Section */}
      <div className="lg:col-span-2 bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700">
        <div className="space-y-6">
          <div>
            <label htmlFor="product-name" className="block text-sm font-medium text-slate-300 mb-2">Nama Produk</label>
            <input
              type="text"
              id="product-name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Contoh: Mic Wireless"
              className="block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
            />
          </div>
          
          <ImageInput id="product-image" label="Gambar Produk" onFileChange={handleProductImageChange} previewUrl={productImageUrl} />
          
          <div>
            <label htmlFor="target-audience" className="block text-sm font-medium text-slate-300 mb-2">Target Audiens</label>
            <select
              id="target-audience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
              className="block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
            >
              {Object.values(TargetAudience).map(audience => (
                <option key={audience} value={audience}>{audience}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="language-style" className="block text-sm font-medium text-slate-300 mb-2">Gaya Bahasa</label>
            <select
              id="language-style"
              value={languageStyle}
              onChange={(e) => setLanguageStyle(e.target.value as LanguageStyle)}
              className="block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
            >
              {Object.values(LanguageStyle).map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:bg-indigo-500/50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Membuat...' : 'Generate Hooks'}
            {!isLoading && <SparklesIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="lg:col-span-3 bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700 min-h-[400px] flex flex-col justify-center">
         {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-md">{error}</div>}
         {isLoading && <LoadingSpinner />}
         {!isLoading && !error && !generatedHooks && (
            <div className="text-center text-slate-500">
                <SparklesIcon className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium text-slate-300">Hasil hook akan muncul di sini...</h3>
                <p>Isi form di samping untuk memulai.</p>
            </div>
         )}
         {generatedHooks && (
            <div className="space-y-4">
              {generatedHooks.map(hook => (
                <HookCard key={hook.type} hook={hook} />
              ))}
            </div>
         )}
      </div>
    </div>
  );
};

export default HookGeneratorPage;