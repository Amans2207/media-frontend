// Utility to decode audio and run Whisper locally in browser

export async function extractAndResampleAudio(file) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // We only need the first channel (mono)
    const float32Array = audioBuffer.getChannelData(0);
    return float32Array;
}

export function formatToSRT(words) {
    // Whisper returns { word: string, start: number, end: number }
    if (!words || words.length === 0) return "";
    
    let srtContent = "";
    let subIndex = 1;
    let currentPhrase = [];
    
    const formatTime = (seconds) => {
        const date = new Date(0);
        date.setMilliseconds(seconds * 1000);
        return date.toISOString().substr(11, 12).replace('.', ',');
    };
    
    const addSub = (phraseWords) => {
        const text = phraseWords.map(w => w.word.toUpperCase().trim()).join(' ');
        const start = formatTime(phraseWords[0].start);
        const end = formatTime(phraseWords[phraseWords.length - 1].end + 0.1);
        
        srtContent += `${subIndex}\n${start} --> ${end}\n${text}\n\n`;
        subIndex++;
    };
    
    for (let word of words) {
        if (currentPhrase.length === 0) {
            currentPhrase.push(word);
        } else {
            if (currentPhrase.length >= 4 || (word.start - currentPhrase[currentPhrase.length - 1].end > 0.4)) {
                addSub(currentPhrase);
                currentPhrase = [word];
            } else {
                currentPhrase.push(word);
            }
        }
    }
    
    if (currentPhrase.length > 0) {
        addSub(currentPhrase);
    }
    
    return srtContent;
}
