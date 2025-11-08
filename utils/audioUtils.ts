import { SpeechStyle, VoiceName } from "../types";

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

export const pcmToWav = (pcmData: ArrayBuffer, sampleRate: number): Blob => {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    
    const buffer = new ArrayBuffer(44 + pcmData.byteLength);
    const view = new DataView(buffer);

    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcmData.byteLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, pcmData.byteLength, true);

    new Uint8Array(buffer, 44).set(new Uint8Array(pcmData));

    return new Blob([view], { type: 'audio/wav' });
};

export const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const
    len = buffer.length * numOfChan * 2 + 44;
    const bufferOut = new ArrayBuffer(len);
    const view = new DataView(bufferOut);
    const channels = [];
    let i, sample;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    const setUint16 = (data: number) => {
        view.setUint16(pos, data, true);
        pos += 2;
    };

    const setUint32 = (data: number) => {
        view.setUint32(pos, data, true);
        pos += 4;
    };
    
    setUint32(0x46464952); // "RIFF"
    setUint32(len - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" - chunk
    setUint32(len - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < numOfChan; i++)
      channels.push(buffer.getChannelData(i));

    while (pos < len) {
      for (i = 0; i < numOfChan; i++) {
        // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // write 16-bit sample
        pos += 2;
      }
      offset++; // next source sample
    }

    return new Blob([bufferOut], { type: "audio/wav" });
};

export const applyAudioEffects = async (audioBuffer: AudioBuffer, style: SpeechStyle, voiceName: VoiceName, audioCtx: AudioContext): Promise<AudioBuffer> => {
    const offlineCtx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    let currentNode: AudioNode = source;

    if (voiceName === 'Leda') {
        source.playbackRate.value = 1.3;
    }
    
    if (style === 'berbisik') {
        const compressor = offlineCtx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-40, 0); 
        compressor.knee.setValueAtTime(30, 0); 
        compressor.ratio.setValueAtTime(12, 0); 
        compressor.attack.setValueAtTime(0.003, 0); 
        compressor.release.setValueAtTime(0.25, 0);
        currentNode.connect(compressor);
        currentNode = compressor;
    }

    const gainNode = offlineCtx.createGain();
    if (style === 'teriak') {
        gainNode.gain.value = 1.5;
    } else if (style === 'berbisik') {
        gainNode.gain.value = 2.5;
    } else {
        gainNode.gain.value = 1.0;
    }
    
    currentNode.connect(gainNode);
    gainNode.connect(offlineCtx.destination);
    
    source.start();
    return await offlineCtx.startRendering();
};
