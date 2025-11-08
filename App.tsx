import React, { useState } from 'react';
import { LanguageStyle, Hook, VideoScript, TargetAudience, VoiceName, SpeechStyle } from './types';
import Navbar from './components/Navbar';
import HookGeneratorPage from './pages/HookGeneratorPage';
import ScriptGeneratorPage from './pages/ScriptGeneratorPage';
import SpeechGeneratorPage from './pages/SpeechGeneratorPage';
import AboutModal from './components/AboutModal';


type ProductDescription = { type: 'image'; file: File | null } | { type: 'text'; text: string };

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState('hook'); // 'hook', 'script', or 'speech'
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    
    // State for Hook & Script pages
    const [productName, setProductName] = useState<string>('');
    const [languageStyle, setLanguageStyle] = useState<LanguageStyle>(LanguageStyle.SANTAI);
    const [targetAudience, setTargetAudience] = useState<TargetAudience>(TargetAudience.UMUM);
    const [generatedHooks, setGeneratedHooks] = useState<Hook[] | null>(null);
    const [productImage, setProductImage] = useState<File | null>(null);
    const [description, setDescription] = useState<ProductDescription>({ type: 'text', text: '' });
    const [generatedScript, setGeneratedScript] = useState<VideoScript | null>(null);

    // State for Speech page
    const [speechText, setSpeechText] = useState<string>('');
    const [speechVoice, setSpeechVoice] = useState<VoiceName>('Kore');
    const [speechStyle, setSpeechStyle] = useState<SpeechStyle>('semangat');
    const [speechAudioResult, setSpeechAudioResult] = useState<{ audioUrl: string; downloadUrl: string } | null>(null);


    return (
        <div className="min-h-screen bg-slate-900">
            <Navbar 
                currentPage={currentPage} 
                onNavigate={setCurrentPage}
                onAboutClick={() => setIsAboutModalOpen(true)}
            />
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {currentPage === 'hook' && (
                    <HookGeneratorPage 
                        productName={productName}
                        setProductName={setProductName}
                        languageStyle={languageStyle}
                        setLanguageStyle={setLanguageStyle}
                        targetAudience={targetAudience}
                        setTargetAudience={setTargetAudience}
                        setGeneratedHooks={setGeneratedHooks}
                        generatedHooks={generatedHooks}
                        productImage={productImage}
                        setProductImage={setProductImage}
                    />
                )}
                {currentPage === 'script' && (
                    <ScriptGeneratorPage 
                        generatedHooks={generatedHooks}
                        productName={productName}
                        languageStyle={languageStyle}
                        targetAudience={targetAudience}
                        productImage={productImage}
                        description={description}
                        setDescription={setDescription}
                        generatedScript={generatedScript}
                        setGeneratedScript={setGeneratedScript}
                    />
                )}
                {currentPage === 'speech' && (
                    <SpeechGeneratorPage 
                        text={speechText}
                        setText={setSpeechText}
                        voice={speechVoice}
                        setVoice={setSpeechVoice}
                        style={speechStyle}
                        setStyle={setSpeechStyle}
                        audioResult={speechAudioResult}
                        setAudioResult={setSpeechAudioResult}
                    />
                )}
            </main>
            <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
        </div>
    );
};

export default App;