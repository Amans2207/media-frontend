// Utility to decode audio and run Whisper locally in browser

export async function extractAndResampleAudio(fileOrUrl) {
    let arrayBuffer;
    if (typeof fileOrUrl === 'string') {
        const response = await fetch(fileOrUrl);
        arrayBuffer = await response.arrayBuffer();
    } else {
        arrayBuffer = await fileOrUrl.arrayBuffer();
    }
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // We only need the first channel (mono)
    const float32Array = audioBuffer.getChannelData(0);
    return float32Array;
}

export function formatToSRT(chunks) {
    // Transformers.js returns chunks as { text: string, timestamp: [start, end] }
    if (!chunks || chunks.length === 0) return "";
    
    let srtContent = "";
    let subIndex = 1;
    let currentPhrase = [];
    
    const formatTime = (seconds) => {
        const date = new Date(0);
        date.setMilliseconds(seconds * 1000);
        return date.toISOString().substr(11, 12).replace('.', ',');
    };
    
    const addSub = (phraseChunks) => {
        const text = phraseChunks.map(c => c.text.toUpperCase().trim()).join(' ');
        const start = formatTime(phraseChunks[0].timestamp[0]);
        const end = formatTime(phraseChunks[phraseChunks.length - 1].timestamp[1] || phraseChunks[phraseChunks.length - 1].timestamp[0] + 0.5);
        
        srtContent += `${subIndex}\n${start} --> ${end}\n${text}\n\n`;
        subIndex++;
    };
    
    // Group words into phrases (max 4 words per phrase for TikTok style)
    for (let i = 0; i < chunks.length; i++) {
        currentPhrase.push(chunks[i]);
        if (currentPhrase.length >= 3 || i === chunks.length - 1) {
            addSub(currentPhrase);
            currentPhrase = [];
        }
    }
    
    return srtContent;
}
