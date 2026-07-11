import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const formatTime = (time) => {
  if (isNaN(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const GlobalAudioPlayer = ({ track, playlist, onTrackChange, onClose, themeColor }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current && track) {
      audioRef.current.src = track.url;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Auto-play failed", e));
    }
  }, [track]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    setVolume(Number(e.target.value));
    setIsMuted(false);
  };

  const playNext = () => {
    if (!playlist || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === track.id);
    const nextTrack = playlist[(currentIndex + 1) % playlist.length];
    onTrackChange(nextTrack);
  };

  const playPrev = () => {
    if (!playlist || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === track.id);
    const prevTrack = playlist[(currentIndex - 1 + playlist.length) % playlist.length];
    onTrackChange(prevTrack);
  };

  const handleEnded = () => {
    playNext();
  };

  if (!track) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[100] p-2 md:p-4 pointer-events-none"
      >
        <div className="max-w-6xl mx-auto pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl md:rounded-full p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
            
            {/* Animated Background Glow */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)`, backgroundSize: '200% 100%', animation: 'gradient-slide 3s linear infinite' }}
            />
            <style>{`@keyframes gradient-slide { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }`}</style>

            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleTimeUpdate}
              onEnded={handleEnded}
            />

            {/* Left: Track Info */}
            <div className="flex items-center gap-4 w-full md:w-1/3 relative z-10">
              <div className="relative w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
                <img 
                  src={track.thumbnail || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150"} 
                  alt="cover" 
                  className={`w-full h-full object-cover transition-transform duration-1000 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`} 
                />
                <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" />
              </div>
              <div className="flex flex-col overflow-hidden w-full pr-6">
                <h4 className="text-white font-bold text-sm md:text-base truncate">{track.title || "Unknown Track"}</h4>
                <p className="text-gray-400 text-xs truncate">Audio Player</p>
              </div>
            </div>

            {/* Center: Controls & Scrubber */}
            <div className="flex flex-col items-center justify-center w-full md:w-1/3 relative z-10">
              <div className="flex items-center gap-6 mb-2">
                <button onClick={playPrev} className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5 md:w-6 md:h-6 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                </button>
                <button 
                  onClick={togglePlay} 
                  className="w-10 h-10 md:w-12 md:h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5 md:w-6 md:h-6 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  ) : (
                    <svg className="w-5 h-5 md:w-6 md:h-6 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>
                <button onClick={playNext} className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5 md:w-6 md:h-6 fill-current" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                </button>
              </div>
              <div className="flex items-center w-full gap-3 text-xs text-gray-400 font-mono">
                <span>{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${themeColor} ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) 0%)`
                  }}
                />
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right: Volume & Close */}
            <div className="hidden md:flex items-center justify-end gap-4 w-1/3 relative z-10 pr-2">
              <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-white transition-colors">
                {isMuted || volume === 0 ? (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-24 h-1 bg-white/20 rounded-full appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                style={{
                  background: `linear-gradient(to right, white ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 0%)`
                }}
              />
              <button onClick={onClose} className="ml-4 text-gray-400 hover:text-red-400 transition-colors p-2 bg-white/5 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* Mobile Close Button (Absolute Top Right for small screens) */}
            <button onClick={onClose} className="md:hidden absolute top-2 right-2 text-gray-400 hover:text-red-400 transition-colors z-20">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalAudioPlayer;
