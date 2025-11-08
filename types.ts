export enum LanguageStyle {
  FORMAL = 'Formal',
  SANTAI = 'Santai',
  PERSUASIF = 'Persuasif',
  INFORMATIF = 'Informatif',
  EMOSIONAL = 'Emosional',
  GAUL = 'Gaul',
}

export enum TargetAudience {
  UMUM = 'Umum',
  PELAJAR = 'Pelajar & Mahasiswa',
  KANTORAN = 'Pekerja Kantoran',
  IRT = 'Ibu Rumah Tangga',
  GAMERS = 'Gamers',
  TEKNOLOGI = 'Pecinta Teknologi',
  FASHION = 'Fashionista',
}

export enum HookType {
  QUESTION = 'Question Hook',
  DESIRE = 'Desire Hook',
  HOPE = 'Hope Hook',
  PROBLEM = 'Problem Hook',
  BENEFIT = 'Benefit Hook',
  CONTROVERSIAL = 'Controversial Hook',
  FOMO = 'FOMO Hook',
  NEGATIVE = 'Negative Hook',
  CURIOSITY = 'Curiosity Hook',
  FEAR = 'Fear Hook',
}

export interface Hook {
  type: HookType;
  content: string;
}

export interface GeminiResponse {
    questionHook: string;
    desireHook: string;
    hopeHook: string;
    problemHook: string;
    benefitHook: string;
    controversialHook: string;
    fomoHook: string;
    negativeHook: string;
    curiosityHook: string;
    fearHook: string;
}

export interface ScriptGeminiResponse {
    body: string;
    cta: string;
}

export interface VideoScript {
    hook: string;
    body: string;
    cta: string;
}


// Types for Speech Generation
export const VoiceOptions = {
    'Zephyr': 'Zephyr (Female, Calm)',
    'Puck': 'Puck (Male, Energetic)',
    'Charon': 'Charon (Male, Deep)',
    'Kore': 'Kore (Female, Warm)',
    'Fenrir': 'Fenrir (Male, Crisp)',
    'Leda': 'Leda (Female, Child-like)',
};
export type VoiceName = keyof typeof VoiceOptions;


export const StyleOptions = {
    'normal': 'Normal',
    'bahagia': 'Bahagia',
    'semangat': 'Semangat',
    'marah': 'Marah',
    'sedih': 'Sedih',
    'berbisik': 'Berbisik (ASMR)',
    'teriak': 'Teriak',
    'santai': 'Santai',
};
export type SpeechStyle = keyof typeof StyleOptions;