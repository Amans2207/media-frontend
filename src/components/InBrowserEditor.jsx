import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function InBrowserEditor({ fileUrl, filename, onClose }) {
  const [loaded, setLoaded] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Editor Ready');
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);

  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [duration, setDuration] = useState(0);
  const [crop, setCrop] = useState('none');
  const [fitMode, setFitMode] = useState('blur'); // none, 1:1, 9:16, 16:9
  const [mute, setMute] = useState(false);
  
  // Advanced Features
  const [speed, setSpeed] = useState(1.0);
  const [videoFilter, setVideoFilter] = useState('none');
  const [reverse, setReverse] = useState(false);
  const [customAudio, setCustomAudio] = useState(null);
  
  // Custom Audio Advanced Controls
  const [customAudioStart, setCustomAudioStart] = useState(0);
  const [customAudioOffset, setCustomAudioOffset] = useState(0);
  const [customAudioEnhance, setCustomAudioEnhance] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // No loading required for backend processing
    setLoaded(true);
  }, []);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setTrimEnd(dur);
    }
  };

  const handleSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `snapshot_${Math.floor(videoRef.current.currentTime)}s.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Snapshot saved!");
  };

  const handleExport = async () => {
    try {
      setIsProcessing(true);
      setProgress(50); // Show fake progress while server processes
      
      const formData = new FormData();
      formData.append('fileUrl', fileUrl);
      
      if (customAudio) {
        formData.append('audioFile', customAudio);
      }
      
      const options = {
        crop,
        reverse,
        speed,
        videoFilter,
        mute,
        trimStart,
        trimEnd,
        duration,
        customAudioStart,
        customAudioOffset,
        customAudioEnhance
      };
      
      formData.append('options', JSON.stringify(options));
      
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://media-backend-production-b846.up.railway.app';
      const response = await axios.post(`${backendUrl}/api/editor/process`, formData);
      const data = response.data;
      
      setProgress(100);
      
      if (data.success && data.fileUrl) {
        const fullUrl = `${backendUrl}${data.fileUrl}`;
        // Create download link
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = `edited_${filename}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Video exported successfully!");
        onClose();
      } else {
        throw new Error("Invalid response from server");
      }
      
    } catch (error) {
      console.error(error);
      toast.error(error.message || "An error occurred during editing.");
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
          <button 
            onClick={handleSnapshot}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-sm font-medium rounded-lg text-white flex items-center gap-2 transition-colors border border-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Capture Frame
          </button>
          
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
            <div className="flex gap-2 mb-3">
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

          {/* Advanced Filters */}
          <div className="bg-white/5 p-4 rounded-xl border border-white/5 grid grid-cols-2 gap-4">
            
            {/* Speed */}
            <div>
              <h3 className="text-xs font-semibold text-gray-300 mb-2">Video Speed</h3>
              <select 
                value={speed} 
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full bg-black/50 border border-white/10 rounded-lg text-xs text-white p-2 focus:outline-none"
              >
                <option value={0.5}>0.5x (Slow Mo)</option>
                <option value={1.0}>1.0x (Normal)</option>
                <option value={1.5}>1.5x (Fast)</option>
                <option value={2.0}>2.0x (Very Fast)</option>
              </select>
            </div>

            {/* Video Filters */}
            <div>
              <h3 className="text-xs font-semibold text-gray-300 mb-2">Color Filter</h3>
              <select 
                value={videoFilter} 
                onChange={(e) => setVideoFilter(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg text-xs text-white p-2 focus:outline-none"
              >
                <option value="none">None</option>
                <option value="bw">Black & White</option>
                <option value="vibrant">Vibrant Pop</option>
                <option value="cinematic">Cinematic (Moody)</option>
                <option value="sepia">Retro Sepia</option>
                <option value="sharpen">Ultra Sharpen</option>
                <option value="blur">Motion Blur</option>
                <option value="invert">Invert Colors</option>
              </select>
            </div>
            
            {/* Custom Music */}
            <div className="col-span-2">
              <h3 className="text-xs font-semibold text-gray-300 mb-2">Custom Background Music</h3>
              <input 
                type="file" 
                accept="audio/*"
                onChange={(e) => setCustomAudio(e.target.files[0])}
                className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30"
              />
              
              {customAudio && (
                <div className="mt-4 p-3 bg-black/40 rounded-xl border border-white/5 flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-gray-400 flex justify-between mb-1">
                      <span>Audio Start Time (Skip Intro)</span>
                      <span className="text-purple-400 font-mono">{customAudioStart}s</span>
                    </label>
                    <input 
                      type="range" min="0" max="60" step="1" 
                      value={customAudioStart} 
                      onChange={(e) => setCustomAudioStart(parseFloat(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400 flex justify-between mb-1">
                      <span>Delay Audio (Start at Video Time)</span>
                      <span className="text-blue-400 font-mono">{customAudioOffset}s</span>
                    </label>
                    <input 
                      type="range" min="0" max="60" step="1" 
                      value={customAudioOffset} 
                      onChange={(e) => setCustomAudioOffset(parseFloat(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>
                  
                  <label className="flex items-center gap-2 mt-1 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={customAudioEnhance} 
                      onChange={(e) => setCustomAudioEnhance(e.target.checked)} 
                      className="rounded bg-black/50 border-white/20 text-purple-500 focus:ring-0" 
                    />
                    <span className="text-xs text-gray-300 font-medium">✨ Pro Audio Polish (Bass, 3D Stereo, Crispness)</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="flex gap-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-2 rounded-xl border border-white/5 flex-1">
              <input type="checkbox" checked={mute} onChange={(e) => setMute(e.target.checked)} className="rounded bg-black/50 border-white/20 text-purple-500 focus:ring-0" />
              <span className="text-gray-300">Mute Audio</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-2 rounded-xl border border-white/5 flex-1">
              <input type="checkbox" checked={reverse} onChange={(e) => setReverse(e.target.checked)} className="rounded bg-black/50 border-white/20 text-blue-500 focus:ring-0" />
              <span className="text-gray-300">Reverse Video</span>
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
