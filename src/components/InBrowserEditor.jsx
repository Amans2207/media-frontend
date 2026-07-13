import React, { useState, useEffect, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import toast from 'react-hot-toast';

export default function InBrowserEditor({ fileUrl, filename, onClose }) {
  const [loaded, setLoaded] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Initializing Editor Engine...');
  const [progress, setProgress] = useState(0);
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef(null);

  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [duration, setDuration] = useState(0);
  const [crop, setCrop] = useState('none'); // none, 1:1, 9:16, 16:9
  const [mute, setMute] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('log', ({ message }) => {
      console.log(message);
    });
    ffmpeg.on('progress', ({ progress, time }) => {
      setProgress(Math.round(progress * 100));
    });

    try {
      const baseURL = '/ffmpeg';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setLoaded(true);
      setLoadingMsg('');
    } catch (e) {
      console.error(e);
      setLoadingMsg('Failed to load Editor Engine. Check internet connection.');
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setTrimEnd(dur);
    }
  };

  const handleExport = async () => {
    try {
      setIsProcessing(true);
      setProgress(0);
      const ffmpeg = ffmpegRef.current;
      
      const inputName = 'input.mp4';
      const outputName = 'output.mp4';
      
      // Write file to FFmpeg Virtual File System
      await ffmpeg.writeFile(inputName, await fetchFile(fileUrl));

      let ffmpegArgs = ['-i', inputName];

      // Video filters (Crop + Watermark)
      let vfFilters = [];
      if (crop !== 'none') {
        if (crop === '1:1') vfFilters.push("crop=ih:ih"); // Square
        else if (crop === '9:16') vfFilters.push("crop=ih*9/16:ih"); // Vertical
        else if (crop === '16:9') vfFilters.push("crop=iw:iw*9/16"); // Horizontal
      }

      if (vfFilters.length > 0) {
        ffmpegArgs.push('-vf', vfFilters.join(','));
      }

      // Trimming
      if (trimStart > 0 || trimEnd < duration) {
        ffmpegArgs.push('-ss', trimStart.toString());
        ffmpegArgs.push('-to', trimEnd.toString());
      }

      // Audio
      if (mute) {
        ffmpegArgs.push('-an');
      }

      // Output Settings
      ffmpegArgs.push('-c:v', 'libx264', '-preset', 'ultrafast', outputName);

      // Run FFmpeg
      await ffmpeg.exec(ffmpegArgs);

      // Read output
      const data = await ffmpeg.readFile(outputName);
      
      // Create download link
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `edited_${filename}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Video exported successfully!");
      onClose();
      
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during editing.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-sans">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl relative">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white hover:text-red-400 rounded-full transition-colors border border-white/10">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Video Preview Side */}
        <div className="md:w-1/2 p-6 bg-black flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-white/10 relative">
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-300 animate-pulse">{loadingMsg}</p>
            </div>
          )}
          
          <video 
            ref={videoRef}
            src={fileUrl} 
            controls 
            className="max-w-full max-h-[400px] rounded-lg shadow-lg"
            onLoadedMetadata={handleLoadedMetadata}
            crossOrigin="anonymous"
          />
          
          {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-white mt-4 font-bold text-xl">{progress}% Exporting...</p>
              <p className="text-xs text-gray-400 mt-2">Processing on your device...</p>
            </div>
          )}
        </div>

        {/* Controls Side */}
        <div className="md:w-1/2 p-6 flex flex-col gap-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 mb-2">
            Pro Editor
          </h2>

          {/* Trimming */}
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              Trim Video (Seconds)
            </h3>
            
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Start: {trimStart.toFixed(1)}s</span>
              <span>End: {trimEnd.toFixed(1)}s</span>
            </div>
            
            <input 
              type="range" 
              min="0" max={duration} step="0.1" 
              value={trimStart} 
              onChange={(e) => setTrimStart(Math.min(parseFloat(e.target.value), trimEnd - 1))}
              className="w-full accent-purple-500 mb-3"
            />
            <input 
              type="range" 
              min="0" max={duration} step="0.1" 
              value={trimEnd} 
              onChange={(e) => setTrimEnd(Math.max(parseFloat(e.target.value), trimStart + 1))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Cropping */}
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Crop Ratio</h3>
            <div className="flex gap-2">
              {['none', '1:1', '9:16', '16:9'].map((ratio) => (
                <button 
                  key={ratio}
                  onClick={() => setCrop(ratio)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${crop === ratio ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5'}`}
                >
                  {ratio.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-3 rounded-xl border border-white/5 flex-1">
              <input type="checkbox" checked={mute} onChange={(e) => setMute(e.target.checked)} className="rounded bg-black/50 border-white/20 text-purple-500 focus:ring-0" />
              <span className="text-sm text-gray-300">Mute Audio</span>
            </label>
            <label className="flex items-center justify-center gap-2 bg-white/5 p-3 rounded-xl border border-white/5 flex-1 opacity-50 cursor-not-allowed">
              <span className="text-sm text-gray-400 line-through">Watermark (PRO)</span>
            </label>
          </div>

          {/* Export Button */}
          <button 
            onClick={handleExport}
            disabled={!loaded || isProcessing}
            className={`mt-auto w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all ${(!loaded || isProcessing) ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white transform hover:scale-[1.02]'}`}
          >
            {isProcessing ? 'Processing...' : 'Export Final Video'}
          </button>
          
        </div>
      </div>
    </div>
  );
}
