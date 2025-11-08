import React, { useState, useMemo, useCallback } from 'react';
import { VoiceOptions, VoiceName, StyleOptions, SpeechStyle } from '../types';
import { generateSpeech } from '../services/geminiService';
import { applyAudioEffects, audioBufferToWav, base64ToArrayBuffer, pcmToWav } from '../utils/audioUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import { SparklesIcon } from '../components/icons';

interface SpeechGeneratorPageProps {
    text: string;
    setText: (text: string) => void;
    voice: VoiceName;
    setVoice: (voice: VoiceName) => void;
    style: SpeechStyle;
    setStyle: (style: SpeechStyle) => void;
    audioResult: { audioUrl: string; downloadUrl: string } | null;
    setAudioResult: (result: { audioUrl: string; downloadUrl: string } | null) => void;
}

const SpeechGeneratorPage: React.FC<SpeechGeneratorPageProps> = ({
    text,
    setText,
    voice,
    setVoice,
    style,
    setStyle,
    audioResult,
    setAudioResult,
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    
    const audioCtx = useMemo(() => new (window.AudioContext || (window as any).webkitAudioContext)(), []);

    const handleGenerate = useCallback(async () => {
        if (!text.trim()) {
            setError('Silakan masukkan teks terlebih dahulu.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAudioResult(null);

        try {
            setStatus("Memberikan arahan pada Aktor AI...");
            const { audioBase64, sampleRate } = await generateSpeech(text, voice, style);

            setStatus("Sesi rekaman sedang berlangsung...");
            const pcmData = base64ToArrayBuffer(audioBase64);
            
            setStatus("Mixing & mastering audio...");
            const wavBlob = pcmToWav(pcmData, sampleRate);

            setStatus("Menambahkan efek suara akhir...");
            const arrayBuffer = await wavBlob.arrayBuffer();
            let processedAudioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            processedAudioBuffer = await applyAudioEffects(processedAudioBuffer, style, voice, audioCtx);
            const finalWavBlob = audioBufferToWav(processedAudioBuffer);
            
            const url = URL.createObjectURL(finalWavBlob);
            setAudioResult({ audioUrl: url, downloadUrl: url });

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Terjadi kesalahan tidak diketahui.';
            setError(`Gagal menghasilkan audio: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsLoading(false);
            setStatus('');
        }
    }, [text, voice, style, audioCtx, setAudioResult]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Input Section */}
            <div className="lg:col-span-2 bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700 self-start">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Buat Audio dari Teks</h2>
                        <p className="text-slate-400">Masukkan teks, pilih suara dan gaya bicara, lalu biarkan AI membuat audionya untuk Anda.</p>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="text-input" className="block text-sm font-medium text-slate-300">Teks</label>
                            <span className="text-sm text-slate-400">{text.length} karakter</span>
                        </div>
                        <textarea
                            id="text-input"
                            rows={8}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Tuliskan apa saja yang ingin Anda ubah menjadi suara..."
                            className="block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="voice-select" className="block text-sm font-medium text-slate-300 mb-2">Aktor Suara</label>
                        <select
                            id="voice-select"
                            value={voice}
                            onChange={(e) => setVoice(e.target.value as VoiceName)}
                            className="block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                        >
                            {Object.entries(VoiceOptions).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="style-select" className="block text-sm font-medium text-slate-300 mb-2">Gaya Bicara</label>
                        <select
                            id="style-select"
                            value={style}
                            onChange={(e) => setStyle(e.target.value as SpeechStyle)}
                            className="block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                        >
                            {Object.entries(StyleOptions).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:bg-indigo-500/50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Membuat...' : 'Generate Audio'}
                        {!isLoading && <SparklesIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Output Section */}
            <div className="lg:col-span-3 bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700 min-h-[400px] flex flex-col justify-center">
                {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-md">{error}</div>}
                {isLoading && (
                    <div className="text-center">
                        <LoadingSpinner />
                        {status && <p className="text-slate-400 mt-4">{status}</p>}
                    </div>
                )}
                {!isLoading && !error && !audioResult && (
                    <div className="text-center text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 5.636a9 9 0 0112.728 0M18.364 18.364A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <h3 className="text-lg font-medium text-slate-300">Hasil audio akan muncul di sini...</h3>
                        <p>Isi form di samping untuk memulai.</p>
                    </div>
                )}
                {audioResult && (
                    <div className="space-y-6 text-center">
                        <h3 className="text-lg font-bold text-white">Audio Berhasil Dibuat!</h3>
                        <audio controls src={audioResult.audioUrl} className="w-full">
                            Your browser does not support the audio element.
                        </audio>
                        <a
                            href={audioResult.downloadUrl}
                            download={`ai-audio-${voice}-${style}.wav`}
                            className="inline-flex items-center gap-2 py-2 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download .wav
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpeechGeneratorPage;