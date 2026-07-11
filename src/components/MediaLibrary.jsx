import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import localforage from 'localforage';

const MediaLibrary = ({ themeColor }) => {
  const [history, setHistory] = useState([]);
  const [playingFile, setPlayingFile] = useState(null);
  const [playingBlobUrl, setPlayingBlobUrl] = useState(null);
  const [converting, setConverting] = useState(null);
  
  // Vault state
  const [activeTab, setActiveTab] = useState('history'); // history | vault
  const [vaultItems, setVaultItems] = useState([]);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isMovingToVault, setIsMovingToVault] = useState(null);

  useEffect(() => {
    // Load history from localStorage
    const saved = localStorage.getItem('media_history');
    if (saved) {
      try { setHistory(JSON.parse(saved).reverse()); } 
      catch (e) { console.error('Failed to parse history'); }
    }
    
    // Listen for new completed tasks
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

  useEffect(() => {
    if (isVaultUnlocked) {
      loadVaultItems();
    }
  }, [isVaultUnlocked]);

  const loadVaultItems = async () => {
    const items = await localforage.getItem('secret_vault') || [];
    setVaultItems(items);
  };

  const handleVaultUnlock = (e) => {
    e.preventDefault();
    if (pinInput === '2026') {
      setIsVaultUnlocked(true);
      toast.success('Vault Unlocked 🔓');
    } else {
      toast.error('Incorrect PIN');
      setPinInput('');
    }
  };

  const moveToVault = async (item) => {
    setIsMovingToVault(item.filename);
    try {
      const url = `https://media-backend-production-b846.up.railway.app/api/serve/${item.filename}`;
      const response = await axios.get(url, { responseType: 'blob' });
      const blob = response.data;
      
      const currentVault = await localforage.getItem('secret_vault') || [];
      const vaultItem = {
        ...item,
        blob: blob,
        vaultedAt: Date.now()
      };
      
      await localforage.setItem('secret_vault', [...currentVault, vaultItem]);
      
      // Attempt to delete from backend to save space
      try {
        await axios.delete(`https://media-backend-production-b846.up.railway.app/api/delete/${item.filename}`);
      } catch (err) {
        console.warn('Could not delete from backend immediately', err);
      }
      
      // Remove from normal history
      const currentHistory = JSON.parse(localStorage.getItem('media_history') || '[]');
      const newHistory = currentHistory.filter(h => h.filename !== item.filename);
      localStorage.setItem('media_history', JSON.stringify(newHistory));
      setHistory(newHistory.reverse());
      
      if (isVaultUnlocked) loadVaultItems();
      
      toast.success('Secured in Vault 🔒');
    } catch (err) {
      toast.error('Failed to move to vault');
      console.error(err);
    } finally {
      setIsMovingToVault(null);
    }
  };

  const deleteFromVault = async (filename) => {
    if (!window.confirm("Delete this from vault permanently?")) return;
    const items = vaultItems.filter(i => i.filename !== filename);
    await localforage.setItem('secret_vault', items);
    setVaultItems(items);
    toast.success('Deleted from vault');
  };

  const playVaultItem = (item) => {
    const blobUrl = URL.createObjectURL(item.blob);
    setPlayingBlobUrl(blobUrl);
    setPlayingFile(item.filename); // Just for UI state
  };

  const closePlayer = () => {
    if (playingBlobUrl) {
      URL.revokeObjectURL(playingBlobUrl);
      setPlayingBlobUrl(null);
    }
    setPlayingFile(null);
  };

  const handleConvert = async (filename, format) => {
    setConverting(filename);
    try {
      const res = await axios.post('https://media-backend-production-b846.up.railway.app/api/convert', { filename, format });
      const newFilename = res.data.filename;
      
      const link = document.createElement('a');
      link.href = `https://media-backend-production-b846.up.railway.app/api/serve/${newFilename}`;
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

  const handleShare = async (filename) => {
    const url = `https://media-backend-production-b846.up.railway.app/api/serve/${filename}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this video!',
          text: 'Downloaded via Antigravity Media Downloader',
          url: url
        });
      } catch (err) {
        console.warn('Share cancelled or failed', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your local history?")) {
      localStorage.removeItem('media_history');
      setHistory([]);
    }
  };

  // if (history.length === 0 && activeTab === 'history') return null;

  return (
    <div className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 border-b border-white/10 pb-4">
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 relative z-20 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all z-10 relative ${activeTab === 'history' ? 'text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            {activeTab === 'history' && <motion.div layoutId="libTab" className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl -z-10" />}
            History
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all z-10 relative flex items-center justify-center gap-2 ${activeTab === 'vault' ? 'text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            {activeTab === 'vault' && <motion.div layoutId="libTab" className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl -z-10" />}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Secret Vault
          </button>
        </div>
        {activeTab === 'history' && (
          <button onClick={clearHistory} className="text-sm text-gray-400 hover:text-red-400 transition-colors bg-white/5 px-4 py-2 rounded-lg">Clear History</button>
        )}
        {activeTab === 'vault' && isVaultUnlocked && (
          <button onClick={() => { setIsVaultUnlocked(false); setPinInput(''); }} className="text-sm text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg">Lock Vault 🔒</button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        
        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <AnimatePresence>
            <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-xs p-3 rounded-xl mb-2 flex items-start gap-2">
              <svg className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span><strong>Auto-Delete Notice:</strong> Videos stored on the server will be automatically deleted after 30 minutes to free up space. Please use the <strong>Move to Vault</strong> button to permanently secure them in your browser's local memory.</span>
            </motion.div>
            {history.length === 0 ? (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex-1 flex flex-col items-center justify-center py-10 opacity-50 text-center">
                <svg className="w-16 h-16 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                <p>No recent downloads.</p>
              </motion.div>
            ) : (
              history.map((item, idx) => (
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
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-100 line-clamp-1" title={item.title}>{item.title || 'Downloaded Media'}</h4>
                      <p className="text-xs text-gray-500 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => moveToVault(item)}
                      disabled={isMovingToVault === item.filename}
                      className="text-xs px-3 py-1.5 bg-pink-500/20 text-pink-400 rounded-lg hover:bg-pink-500/30 transition-colors flex items-center gap-1 border border-pink-500/30 disabled:opacity-50 animate-pulse hover:animate-none shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                    >
                      {isMovingToVault === item.filename ? 'Securing...' : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          Move to Vault
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <a href={`https://media-backend-production-b846.up.railway.app/api/serve/${item.filename}`} download className="px-4 py-2 bg-white/10 hover:bg-white/20 text-sm rounded-lg transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Save File
                    </a>

                    <button onClick={() => handleShare(item.filename)} className="px-3 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm rounded-lg transition-colors border border-green-500/30 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      Share
                    </button>
                    
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
            ))
            )}
          </AnimatePresence>
        )}

        {/* VAULT TAB */}
        {activeTab === 'vault' && (
          <AnimatePresence mode="wait">
            {!isVaultUnlocked ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="py-12 flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Secret Vault</h3>
                <p className="text-gray-400 text-sm mb-8 max-w-sm">
                  Media in the vault is encrypted and stored locally in your browser, completely hidden from your phone's gallery and our servers.
                </p>
                <form onSubmit={handleVaultUnlock} className="flex flex-col gap-4 items-center">
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="Enter PIN (2026)"
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-center text-2xl tracking-[0.5em] text-white focus:outline-none focus:border-pink-500 transition-colors w-64"
                  />
                  <button type="submit" className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-lg transition-all">
                    Unlock Vault
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              >
                {vaultItems.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-gray-500">
                    Vault is empty. Move items here from your history.
                  </div>
                ) : (
                  vaultItems.map((item, idx) => (
                    <motion.div 
                      key={`${item.filename}-${idx}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-black/40 border border-pink-500/20 rounded-2xl overflow-hidden group relative"
                    >
                      <img src={item.thumbnail || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500"} className="w-full aspect-square object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                        <p className="text-white text-sm font-bold line-clamp-1 mb-2">{item.title}</p>
                        <div className="flex gap-2">
                          <button onClick={() => playVaultItem(item)} className="flex-1 py-2 bg-pink-500 text-white rounded-lg text-xs font-bold hover:bg-pink-600 transition-colors flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                            Play
                          </button>
                          <button onClick={() => deleteFromVault(item.filename)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* In-App Media Player Modal */}
      <AnimatePresence>
        {playingFile && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={closePlayer}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-white/10 p-2 rounded-3xl max-w-4xl w-full shadow-2xl relative flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={closePlayer} className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-red-600 z-10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              {playingFile.endsWith('.mp3') ? (
                  <audio 
                    src={playingBlobUrl || `https://media-backend-production-b846.up.railway.app/api/serve/${playingFile}`} 
                    controls 
                    autoPlay 
                    className="w-full rounded-xl bg-black"
                  />
              ) : (
                <video 
                  src={playingBlobUrl || `https://media-backend-production-b846.up.railway.app/api/serve/${playingFile}`} 
                  controls 
                  autoPlay 
                  className="w-full rounded-2xl bg-black"
                  style={{ maxHeight: '80vh' }}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaLibrary;
