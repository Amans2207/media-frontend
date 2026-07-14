import { pipeline, env } from '@xenova/transformers';

// Skip local model check, we want to download from HuggingFace
env.allowLocalModels = false;

class PipelineSingleton {
    static task = 'automatic-speech-recognition';
    static model = 'Xenova/whisper-tiny.en';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    // We expect the message to contain the audio data (Float32Array)
    const { audio, id } = event.data;
    
    // Retrieve the ASR pipeline
    const transcriber = await PipelineSingleton.getInstance(x => {
        // We also send progress back to the UI
        self.postMessage({ status: 'progress', data: x, id });
    });

    try {
        self.postMessage({ status: 'processing', id });
        
        // Transcribe the audio
        // For TikTok style, we return word timestamps
        const output = await transcriber(audio, {
            chunk_length_s: 30,
            stride_length_s: 5,
            return_timestamps: 'word' // This is key for TikTok style!
        });

        // Send the final result back to the main thread
        self.postMessage({ status: 'complete', output, id });
    } catch (e) {
        self.postMessage({ status: 'error', error: e.message, id });
    }
});
