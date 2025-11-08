import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LanguageStyle, GeminiResponse, ScriptGeminiResponse, VoiceName, SpeechStyle, TargetAudience } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // remove data:mime/type;base64, part
        };
        reader.onerror = (error) => reject(error);
    });
};

export const generateHooks = async (
    productName: string,
    productImageFile: File,
    style: LanguageStyle,
    targetAudience: TargetAudience
): Promise<GeminiResponse> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const productImageBase64 = await fileToBase64(productImageFile);
    
    const parts: any[] = [
        {
            text: `
                Anda adalah seorang ahli strategi konten TikTok yang sangat kreatif dan ahli dalam membuat video afiliasi yang viral. Tugas Anda adalah menghasilkan ide-ide hook yang menarik untuk sebuah produk.
                Gunakan informasi yang diberikan untuk membuat hook yang menarik dan relevan.

                Informasi Produk:
                - Nama Produk: "${productName}"
                - Target Audiens: ${targetAudience}
                - Gaya Bahasa yang Diinginkan: ${style}

                Gambar produk terlampir. Analisis gambar tersebut untuk memahami produk secara visual.
                PENTING: Sesuaikan gaya bahasa dan referensi agar relevan dengan Target Audiens yang ditentukan.

                Buatlah 10 jenis hook berikut, maksimal 15 kata, masing-masing dengan gaya bahasa yang diminta:
                1.  Question Hook: Hook yang dimulai dengan pertanyaan untuk memancing rasa ingin tahu.
                2.  Desire Hook: Hook yang menyentuh keinginan atau impian audiens.
                3.  Hope Hook: Hook yang memberikan harapan atau solusi atas masalah audiens.
                4.  Problem Hook: Hook yang menyoroti masalah yang dihadapi audiens yang bisa diselesaikan produk ini.
                5.  Benefit Hook: Hook yang langsung menonjolkan manfaat utama produk.
                6.  Controversial Hook: Hook yang sedikit provokatif atau menantang keyakinan umum untuk menarik perhatian.
                7.  FOMO (Fear Of Missing Out) Hook: Hook yang menciptakan urgensi atau rasa takut ketinggalan.
                8.  Negative Hook: Hook yang menggunakan kata-kata negatif untuk mengejutkan dan menarik perhatian.
                9.  Curiosity Hook: Hook yang membuat audiens sangat penasaran untuk tahu lebih lanjut.
                10. Fear Hook: Hook yang menyentuh ketakutan audiens terkait suatu masalah.

                Pastikan output Anda HANYA berupa JSON yang valid sesuai skema yang diberikan. Jangan tambahkan teks atau format lain.
            `
        },
        {
            inlineData: {
                mimeType: productImageFile.type,
                data: productImageBase64,
            },
        },
    ];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    questionHook: { type: Type.STRING, description: 'Hook tipe pertanyaan' },
                    desireHook: { type: Type.STRING, description: 'Hook tipe keinginan' },
                    hopeHook: { type: Type.STRING, description: 'Hook tipe harapan' },
                    problemHook: { type: Type.STRING, description: 'Hook tipe masalah' },
                    benefitHook: { type: Type.STRING, description: 'Hook tipe manfaat' },
                    controversialHook: { type: Type.STRING, description: 'Hook tipe kontroversial' },
                    fomoHook: { type: Type.STRING, description: 'Hook tipe FOMO' },
                    negativeHook: { type: Type.STRING, description: 'Hook tipe negatif' },
                    curiosityHook: { type: Type.STRING, description: 'Hook tipe rasa ingin tahu' },
                    fearHook: { type: Type.STRING, description: 'Hook tipe ketakutan' },
                },
                 required: [
                    'questionHook', 'desireHook', 'hopeHook', 'problemHook', 
                    'benefitHook', 'controversialHook', 'fomoHook', 'negativeHook', 
                    'curiosityHook', 'fearHook'
                ]
            },
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as GeminiResponse;
    } catch (e) {
        console.error("Failed to parse Gemini response:", response.text);
        throw new Error("Gagal memproses respons dari AI. Coba lagi.");
    }
};


export const generateScript = async (
    productName: string,
    selectedHook: string,
    style: LanguageStyle,
    productImage: File | null,
    description: { type: 'image'; file: File | null } | { type: 'text'; text: string },
    targetAudience: TargetAudience,
    maxChars: number
): Promise<ScriptGeminiResponse> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [];
    let promptContext = '';

    if (productImage) {
        const imageBase64 = await fileToBase64(productImage);
        parts.push({
            inlineData: { mimeType: productImage.type, data: imageBase64 }
        });
        promptContext += 'Gambar produk terlampir. ';
    }

    if (description.type === 'image' && description.file) {
        const descImageBase64 = await fileToBase64(description.file);
        parts.push({
            inlineData: { mimeType: description.file.type, data: descImageBase64 }
        });
        promptContext += 'Deskripsi produk dalam bentuk gambar juga terlampir. ';
    } else if (description.type === 'text' && description.text.trim()) {
        promptContext += `Berikut adalah deskripsi produknya: "${description.text}". `;
    }

    if (promptContext) {
        promptContext += 'Gunakan informasi tersebut untuk memahami produk, fitur, dan target pasarnya. ';
    }
    
    const prompt = `
      Anda adalah seorang penulis skrip ahli untuk video afiliasi TikTok.
      Tugas Anda adalah membuat kelanjutan dari hook yang diberikan untuk produk bernama "${productName}" dengan deskripsi ${promptContext}.
      Gaya bahasa yang harus digunakan adalah "${style}".
      Target audiens untuk skrip ini adalah: "${targetAudience}". Pastikan masalah yang diangkat, solusi yang ditawarkan, dan contoh yang digunakan sangat relevan dengan kehidupan dan minat audiens ini.

      Buatlah skrip dengan maksimal ${maxChars} karakter.
      PENTING: Hindari penggunaan kata-kata yang berlebihan atau 'overclaim' seperti 'pasti', 'dijamin', 'terbaik', 'nomor satu', 'terlaris', 'super', 'best seller'. Fokus pada manfaat nyata dan deskripsi yang jujur.

      Hook yang diberikan: "${selectedHook}"

      Buatlah dua bagian berikut:
      1.  **Isi (Body):** Buat bagian ini menjadi TEPAT TIGA PARAGRAF, dipisahkan oleh satu baris kosong (enter). Paragraf pertama menyoroti masalah umum yang relevan DENGAN TARGET AUDIENS. Paragraf kedua memperkenalkan produk sebagai solusi dan menjelaskan fiturnya. Paragraf ketiga ajakan audiens harus memilikinya.
      2.  **CTA (Call to Action):** Ajak penonton untuk segera mengambil tindakan, seperti "klik keranjang di bawah" atau "klik keranjang kuning di kiri bawah".

      Pastikan output Anda HANYA berupa JSON yang valid dengan dua kunci: "body" dan "cta".
    `;

    parts.unshift({ text: prompt });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    body: { type: Type.STRING, description: 'Bagian isi skrip yang terdiri dari tiga paragraf, dipisahkan oleh baris baru.' },
                    cta: { type: Type.STRING, description: 'Bagian call to action skrip' },
                },
                required: ['body', 'cta'],
            },
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ScriptGeminiResponse;
    } catch (e) {
        console.error("Failed to parse Gemini script response:", response.text);
        throw new Error("Gagal memproses respons dari AI untuk skrip. Coba lagi.");
    }
};

const stylePrompts: Record<SpeechStyle, (text: string, langName: string) => string> = {
    normal: (text, langName) => `Generate clear speech in ${langName} language: "${text}"`,
    bahagia: (text, langName) => `Speak this in ${langName} with a joyful, uplifting tone that evokes happiness and warmth: "${text}"`,
    semangat: (text, langName) => `Deliver this in ${langName} with energetic enthusiasm, motivating and inspiring the listener: "${text}"`,
    marah: (text, langName) => `Express this in ${langName} with an angry, firm tone that conveys frustration without overwhelming hostility: "${text}"`,
    sedih: (text, langName) => `Convey this in ${langName} with a sad, disappointed tone that builds empathy and emotional connection: "${text}"`,
    berbisik: (text, langName) => `Perform the following in an intimate ASMR style in ${langName}. The voice should be a very close, breathy whisper, with clear but soft articulation. Emphasize the airy, unvoiced quality: "${text}"`,
    teriak: (text, langName) => `Shout this loudly in ${langName} with strong, projecting volume to emphasize urgency and intensity: "${text}"`,
    santai: (text, langName) => `Say this casually in ${langName} with a relaxed, easygoing vibe that feels conversational and approachable: "${text}"`,
};

export const generateSpeech = async (
    text: string,
    voiceName: VoiceName,
    style: SpeechStyle
): Promise<{ audioBase64: string; sampleRate: number }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const langName = "Indonesia";

    let finalPrompt = stylePrompts[style](text, langName);
    if (voiceName === 'Leda') {
        finalPrompt = `Use a high-pitched, child-like voice for this: ${finalPrompt}`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro-preview-tts',
        contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName }
                }
            }
        }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const audioData = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType;

    if (!audioData || !mimeType?.startsWith("audio/")) {
        console.error("Invalid API response:", response);
        throw new Error("Data audio tidak valid dari API.");
    }
    
    const sampleRateMatch = mimeType.match(/rate=(\d+)/);
    if (!sampleRateMatch) {
        throw new Error("Sample rate tidak ditemukan di mimeType.");
    }
    
    const sampleRate = parseInt(sampleRateMatch[1], 10);

    return { audioBase64: audioData, sampleRate };
};