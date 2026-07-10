import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const MediaLibrary = ({ themeColor }) => {
  const [history, setHistory] = useState([]);
  const [playingFile, setPlayingFile] = useState(null);
  const [converting, setConverting] = useState(null);

  useEffect(() => {
    // Load history from localStorage
    const saved = localStorage.getItem('media_history');
    if (saved) {
      try { setHistory(JSON.parse(saved).reverse()); } 
      catch (e) { console.error('Failed to parse history'); }
    }
    
    // Listen for new completed tasks from VideoDownloader
    const handleNewTask = (e) => {
      const task = e.detail;
      const current = JSON.parse(localStorage.getItem('media_history') || '[]');
      const updated = [...current, task];
      localStorage.setItem('media_history', JSON.stringify(updated));
      setHistory(updated.reverse());
    };
    
    window.addEventListener('new_download_completed', handleNewTask);
    return () => window.removeEventListener('new_download_completed', handleNewTask);
  }, []);

  const handleConvert = async (filename, format) => {
    setConverting(filename);
    try {
      const res = await axios.post('https://media-backend-zyw5.onrender.com/api/convert', { filename, format });
      const newFilename = res.data.filename;
      
      // Auto download
      const link = document.createElement('a');
      link.href = `https://media-backend-zyw5.onrender.com/api/serve/${newFilename}`;
      link.download = newFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Converted to ${format.toUpperCase()} successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to convert to ${format}`);
    } finally {
      setConverting(null);
    }
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your local history?")) {
      localStorage.removeItem('media_history');
      setHistory([]);
    }
  };

  if (history.length === 0) return null;

  return (
    <div className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-xl text-gray-100 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          Media Library
        </h3>
        <button onClick={clearHistory} className="text-sm text-gray-400 hover:text-red-400 transition-colors">Clear</button>
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence>
          {history.map((item, idx) => (
            <motion.div 
              key={`${item.filename}-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black/30 border border-white/5 rounded-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <div className="md:w-1/3 relative group cursor-pointer" onClick={() => setPlayingFile(playingFile === item.filename ? null : item.filename)}>
                <img src={item.thumbnail || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500"} alt="Thumb" className="w-full h-full object-cover min-h-[120px]" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <svg className="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-gray-100 line-clamp-1" title={item.title}>{item.title || 'Downloaded Media'}</h4>
                  <p className="text-xs text-gray-500 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                </div>
                
                <div className="flex gap-2 mt-4 flex-wrap">
                  <a href={`https://media-backend-zyw5.onrender.com/api/serve/${item.filename}`} download className="px-4 py-2 bg-white/10 hover:bg-white/20 text-sm rounded-lg transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Save File
                  </a>
                  
                  <button onClick={() => handleConvert(item.filename, 'mp3')} disabled={converting === item.filename} className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm rounded-lg transition-colors border border-blue-500/30 disabled:opacity-50">
                    Extract MP3
                  </button>
                  
                  <button onClick={() => handleConvert(item.filename, 'gif')} disabled={converting === item.filename} className="px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 text-sm rounded-lg transition-colors border border-purple-500/30 disabled:opacity-50">
                    Make 15s GIF
                  </button>
                  
                  {converting === item.filename && (
                    <span className="text-xs text-gray-400 self-center flex items-center gap-2 animate-pulse">
                      Processing...
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* In-App Media Player Modal */}
      <AnimatePresence>
        {playingFile && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setPlayingFile(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-white/10 p-2 rounded-3xl max-w-4xl w-full shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setPlayingFile(null)} className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-red-600 z-10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <video 
                src={`https://media-backend-zyw5.onrender.com/api/serve/${playingFile}`} 
                controls 
                autoPlay 
                className="w-full rounded-2xl bg-black"
                style={{ maxHeight: '80vh' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaLibrary;
