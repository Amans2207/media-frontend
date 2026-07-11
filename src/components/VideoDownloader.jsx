import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import SnippetCutter from './SnippetCutter';
import MediaLibrary from './MediaLibrary';
import GlobalAudioPlayer from './GlobalAudioPlayer';
import { QRCodeSVG } from 'qrcode.react';
import Confetti from 'react-confetti';
import Tilt from 'react-parallax-tilt';

// Base64 short sounds (Minimal sizes)
const popSound = new Audio("data:audio/wav;base64,UklGRmYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUMAAAB/f39/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA");
const dingSound = new Audio("data:audio/wav;base64,UklGRmYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUMAAAB/f39/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA");

const AESTHETICS = {
  starboy: { name: 'Starboy', color: 'rgb(147, 51, 234)' },
  vampire: { name: 'Vampire', color: 'rgb(220, 38, 38)' },
  matrix: { name: 'Matrix', color: 'rgb(34, 197, 94)' },
  oceanic: { name: 'Oceanic', color: 'rgb(6, 182, 212)' },
};

const PLATFORM_THEMES = {
  youtube: { color: '#ff0000' },
  instagram: { color: '#e1306c' },
  tiktok: { color: '#00f2fe' },
  twitter: { color: '#1da1f2' },
  reddit: { color: '#ff4500' },
  batch: { color: '#22c55e' }
};

const BackgroundElements = ({ themeColor }) => {
  // Generate random particles once
  const [particles] = useState(() => Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    duration: Math.random() * 30 + 20,
    delay: Math.random() * -30,
  })));

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 40, stiffness: 100 });
  const springY = useSpring(mouseY, { damping: 40, stiffness: 100 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set((e.clientX - window.innerWidth / 2) / 20);
      mouseY.set((e.clientY - window.innerHeight / 2) / 20);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Deep Space Abstract Base */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#08080c]" />

      {/* Dynamic Animated Aurora Mesh Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
        {/* Top Left Orb */}
        <motion.div
          animate={{ x: [0, '10vw', '-5vw', 0], y: [0, '-5vh', '10vh', 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[120px] mix-blend-screen transition-colors duration-1000"
          style={{ backgroundColor: themeColor }}
        />
        {/* Bottom Right Orb */}
        <motion.div
          animate={{ x: [0, '-10vw', '5vw', 0], y: [0, '10vh', '-5vh', 0], scale: [1, 0.8, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full blur-[150px] mix-blend-screen transition-colors duration-1000"
          style={{ backgroundColor: themeColor, opacity: 0.5 }}
        />
        {/* Center Accent Orb */}
        <motion.div
          animate={{ x: [0, '5vw', '-10vw', 0], y: [0, '5vh', '-5vh', 0], scale: [1, 1.5, 0.9, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 5 }}
          className="absolute top-[30%] right-[20%] w-[40vw] h-[40vw] rounded-full blur-[120px] mix-blend-screen transition-colors duration-1000"
          style={{ backgroundColor: '#be185d', opacity: 0.3 }} 
        />
      </div>

      {/* Grain/Noise Overlay for ultra-premium Frosted Glass texture */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.05]" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      {/* Subtle Dot Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.15] mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />

      {/* Floating Particles (Stardust) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{ width: p.size, height: p.size, left: `${p.left}%`, boxShadow: '0 0 10px rgba(255,255,255,0.8)' }}
            initial={{ y: '110vh', opacity: 0 }}
            animate={{ y: '-10vh', opacity: [0, Math.random() * 0.5 + 0.3, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Mouse Parallax Follower (Interactive Glow) */}
      <motion.div
        style={{ x: springX, y: springY, backgroundColor: themeColor }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none opacity-40 mix-blend-screen transition-colors duration-1000 z-0"
      />
    </>
  );
};

const VideoDownloader = () => {
  const [activeTab, setActiveTab] = useState('youtube'); // youtube, instagram, playlist, batch
  const [url, setUrl] = useState('');
  const [batchUrls, setBatchUrls] = useState('');
  const [quality, setQuality] = useState('best');
  const [step, setStep] = useState(1);
  const [videoInfo, setVideoInfo] = useState(null);
  
  // Security State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [currentPin, setCurrentPin] = useState('2026');
  const [pinProgress, setPinProgress] = useState(100);
  const [unlockSuccess, setUnlockSuccess] = useState(false);
  
  const [selectedEntries, setSelectedEntries] = useState(new Set());
  const [enableTrim, setEnableTrim] = useState(false);
  const [trimRange, setTrimRange] = useState([0, 15]);
  
  const [tasks, setTasks] = useState({}); 
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  const [networkIp, setNetworkIp] = useState('localhost');
  const [showQR, setShowQR] = useState(null);
  const [converting, setConverting] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // UI/UX state
  const [themeKey, setThemeKey] = useState('starboy');
  const [themeColor, setThemeColor] = useState(AESTHETICS.starboy.color);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [transcriptText, setTranscriptText] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  
  const imgRef = useRef(null);

  useEffect(() => {
    axios.get('https://media-backend-production-b846.up.railway.app/api/network')
      .then(res => setNetworkIp(res.data.ip))
      .catch(e => console.log(e));
    const saved = localStorage.getItem('vd_history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) {}
    }

    // Mouse logic moved to BackgroundElements for performance

    // Global Drag & Drop for URLs
    const handleDrop = (e) => {
      e.preventDefault();
      const text = e.dataTransfer.getData('text');
      if (text && text.includes('http')) {
        setUrl(text);
        toast.success("Link detected via Drag & Drop!");
      }
    };
    const handleDragOver = (e) => e.preventDefault();
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', handleDragOver);

    // PWA Install Prompt Listener
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Global Keyboard Shortcuts
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      if (e.code === 'Space') {
        const audioEl = document.querySelector('audio');
        if (audioEl) {
          e.preventDefault();
          if (audioEl.paused) audioEl.play(); else audioEl.pause();
        }
      }
      if (e.code === 'Escape') {
        setShowQR(null);
        setShowTranscript(false);
      }
    };

    const handlePaste = (e) => {
      const activeTag = document.activeElement.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
      const text = e.clipboardData.getData('text');
      if (text && text.includes('http')) {
        setUrl(text);
        toast.success("Pasted from clipboard! Click Analyze to start.");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);

    // Extension & PWA Share Target Integration (Read ?url= or ?text= params)
    const params = new URLSearchParams(window.location.search);
    const extUrl = params.get('url');
    const extText = params.get('text');
    const extTitle = params.get('title');
    
    // Find first http/https link in any of the parameters
    const findUrl = (str) => {
      if (!str) return null;
      const match = str.match(/(https?:\/\/[^\s]+)/);
      return match ? match[1] : null;
    };
    
    const sharedUrl = findUrl(extUrl) || findUrl(extText) || findUrl(extTitle);

    if (sharedUrl) {
      setUrl(sharedUrl);
      window.history.replaceState({}, document.title, "/");
      toast.success("Link received! Click Analyze to start.");
    }

    return () => {
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) return;
    const interval = setInterval(() => {
      setPinProgress(prev => {
        if (prev <= 0) {
          setCurrentPin(Math.floor(1000 + Math.random() * 9000).toString());
          return 100;
        }
        return prev - 1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isAuthenticated]);
  
  const handlePodcastAction = async (filename, thumbnail) => {
    setConverting(filename);
    try {
      const res = await axios.post('https://media-backend-production-b846.up.railway.app/api/visualizer', { filename, thumbnail });
      const newFilename = res.data.filename;
      const link = document.createElement('a');
      link.href = `https://media-backend-production-b846.up.railway.app/api/serve/${newFilename}`;
      link.download = newFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Podcast video generated successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to generate podcast`);
    } finally {
      setConverting(null);
    }
  };

  const handleSubtitleAction = async (url) => {
    try {
      toast.loading('Extracting subtitles...', { id: 'subs' });
      const res = await axios.post('https://media-backend-production-b846.up.railway.app/api/subtitles', { url });
      const newFilename = res.data.filename;
      const link = document.createElement('a');
      link.href = `https://media-backend-production-b846.up.railway.app/api/serve/${newFilename}`;
      link.download = newFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Subtitles extracted!`, { id: 'subs' });
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to extract subtitles`, { id: 'subs' });
    }
  };
  
  const handleConvertAction = async (filename, format) => {
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

  const handleReadTranscript = async (url) => {
    try {
      toast.loading('AI is reading the video...', { id: 'read' });
      const res = await axios.post('https://media-backend-production-b846.up.railway.app/api/transcript', { url });
      setTranscriptText(res.data.transcript);
      setShowTranscript(true);
      toast.success('Transcript loaded!', { id: 'read' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'No transcript available', { id: 'read' });
    }
  };

  const handleNativeShare = async (filename, title) => {
    const shareUrl = `https://media-backend-production-b846.up.railway.app/api/serve/${filename}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this file from Media Downloader Pro: ${title}`,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        if (err.name !== 'AbortError') toast.error("Sharing failed.");
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard! Paste in any app.");
    }
  };

  const playPop = () => { popSound.currentTime = 0; popSound.play().catch(()=>{}); };
  const playDing = () => { dingSound.currentTime = 0; dingSound.play().catch(()=>{}); };

  const extractColors = () => {
    try {
      const imgEl = imgRef.current;
      if (!imgEl) return;
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = imgEl.naturalWidth;
      canvas.height = imgEl.naturalHeight;
      ctx.drawImage(imgEl, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let r = 0, g = 0, b = 0, count = 0;
      
      // Sample every 40th pixel to be fast
      for (let i = 0; i < imageData.length; i += 40) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count++;
      }
      
      if (count > 0) {
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        setThemeColor(`rgb(${r}, ${g}, ${b})`);
      }
    } catch (e) {
      console.log('CORS blocked color extraction. Using default.');
    }
  };

  const handleThemeChange = (key) => {
    setThemeKey(key);
    setThemeColor(AESTHETICS[key].color);
  };

  const saveToHistory = (title, thumbnail, link, platform) => {
    const newEntry = { title, thumbnail, link, platform, date: new Date().toISOString() };
    const newHistory = [newEntry, ...history.filter(h => h.link !== link)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('vd_history', JSON.stringify(newHistory));
  };

  const handleDeleteHistory = async (link) => {
    try {
      // Extract filename from the link (e.g., https://media-backend-production-b846.up.railway.app/api/serve/filename.mp4)
      const filename = link.split('/').pop();
      await axios.delete(`https://media-backend-production-b846.up.railway.app/api/delete/${filename}`);
      toast.success('File deleted from server!');
    } catch (e) {
      console.log('Delete error:', e);
      toast.error('Could not delete file');
    }
    // Remove from local history
    const newHistory = history.filter(h => h.link !== link);
    setHistory(newHistory);
    localStorage.setItem('vd_history', JSON.stringify(newHistory));
  };

  const handleFetchInfo = async (e) => {
    e?.preventDefault();
    if (!url) return;
    
    if (url.includes('instagram.com/stories/')) {
      toast.error('Instagram Stories require login cookies which are blocked for privacy. Please use Reels or Posts.', { duration: 6000 });
      return;
    }

    setIsLoading(true);
    setStep(1.5); // Show Skeleton
    try {
      const res = await axios.post('https://media-backend-production-b846.up.railway.app/api/info', { url });
      setVideoInfo(res.data);
      if (res.data.is_playlist) {
        if (activeTab !== 'playlist') setActiveTab('playlist');
        setSelectedEntries(new Set(res.data.entries.map(en => en.id)));
      }
      setStep(2);
      toast.success("Details fetched!");
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to fetch video details.');
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const startBatchDownload = async (e) => {
    e?.preventDefault();
    const urls = batchUrls.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    if (urls.length === 0) return;
    
    setIsLoading(true);
    try {
      const res = await axios.post('https://media-backend-production-b846.up.railway.app/api/download', {
        urls, quality
      });
      
      const initialTasks = {};
      res.data.tasks.forEach((tid, i) => {
        initialTasks[tid] = { progress: 0, status: 'downloading', url: urls[i] };
      });
      setTasks(initialTasks);
      
      // Create a dummy videoInfo so Step 3 doesn't crash
      setVideoInfo({ is_playlist: true, title: 'Batch Download', entries: urls.map(u => ({ url: u, title: u })) });
      
      setStep(3);
      setShowConfetti(false);
      toast.success("Batch Download started!");
      pollAllTasks(res.data.tasks);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start batch download.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEntry = (id) => {
    const newSet = new Set(selectedEntries);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedEntries(newSet);
  };

  const startDownload = async () => {
    setIsLoading(true);
    try {
      let payload = { quality };
      
      if (videoInfo.is_playlist) {
        const urlsToDownload = videoInfo.entries.filter(en => selectedEntries.has(en.id)).map(en => en.url);
        if (urlsToDownload.length === 0) {
           toast.error('Select at least one video');
           setIsLoading(false);
           return;
        }
        payload.urls = urlsToDownload;
      } else {
        payload.url = url;
      }
      
      if (enableTrim) {
        payload.trim_start = trimRange[0].toString();
        payload.trim_end = trimRange[1].toString();
      }

      const res = await axios.post('https://media-backend-production-b846.up.railway.app/api/download', payload);
      
      const initialTasks = {};
      res.data.tasks.forEach(tid => {
        initialTasks[tid] = { status: 'downloading', progress: 0 };
      });
      setTasks(initialTasks);
      setStep(3);
      setShowConfetti(false);
      toast.success("Download started!");
      pollAllTasks(res.data.tasks);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start download.');
      setIsLoading(false);
    }
  };

  const pollAllTasks = async (taskIds) => {
    let active = [...taskIds];
    while (active.length > 0) {
      for (let tid of active) {
        try {
          const res = await axios.get(`https://media-backend-production-b846.up.railway.app/api/progress/${tid}`);
          const data = res.data;
          
          setTasks(prev => {
            const next = {...prev};
            next[tid] = data;
            return next;
          });
          
          if (data.status === 'completed') {
            active = active.filter(t => t !== tid);
            
            // Dispatch event for Media Library History
            const customEvent = new CustomEvent('new_download_completed', {
               detail: {
                 taskId: tid,
                 filename: data.filename,
                 title: videoInfo ? videoInfo.title : 'Downloaded Media',
                 thumbnail: videoInfo ? videoInfo.thumbnail : '',
                 timestamp: new Date().toISOString()
               }
            });
            window.dispatchEvent(customEvent);
            
            const link = `https://media-backend-production-b846.up.railway.app/api/serve/${data.filename}`;
            let title = videoInfo.title;
            let thumb = videoInfo.thumbnail;
            if (videoInfo.is_playlist) {
              const entry = videoInfo.entries.find(en => en.url === data.url);
              if (entry) { title = entry.title; thumb = entry.thumbnail; }
            }
            saveToHistory(title, thumb, link, activeTab);
            playDing();
            toast.success(`${title} finished!`);
            
            // Check if all are completed
            if (active.length === 0) {
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 8000);
            }
          } else if (data.status === 'error') {
            active = active.filter(id => id !== tid);
            toast.error(data.error || 'A task failed.');
          }
        } catch (err) {}
      }
      
      if (active.length === 0) {
         setIsLoading(false);
         setStep(4);
      } else {
         await new Promise(r => setTimeout(r, 1000));
      }
    }
  };

  const reset = () => {
    setStep(1);
    setUrl('');
    setVideoInfo(null);
    setTasks({});
    setEnableTrim(false);
    // Theme will be derived from active tab instead of AESTHETICS directly here
  };

  const handleTabChange = (tab) => {
    if (step > 1) {
       if (!window.confirm("Changing tabs will reset your current progress. Continue?")) return;
    }
    playPop();
    setActiveTab(tab);
    setThemeColor(PLATFORM_THEMES[tab]?.color || AESTHETICS[themeKey].color);
    setStep(1);
    setUrl('');
    setVideoInfo(null);
    setTasks({});
    setEnableTrim(false);
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinCode === currentPin) {
      setUnlockSuccess(true);
      playDing();
      toast.success('Access Granted!');
      setTimeout(() => {
        setIsAuthenticated(true);
      }, 1000);
    } else {
      toast.error('Invalid PIN');
      setPinCode('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030014] text-white relative flex items-center justify-center p-4 overflow-hidden">
        <BackgroundElements themeColor={themeColor} />
        <div className="relative z-10 w-full max-w-sm p-8 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl text-center">
          <div className="w-20 h-20 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Restricted Access</h1>
          <p className="text-gray-400 text-sm mb-6">Enter the active security PIN to access the Media Downloader Pro.</p>
          
          <div className="mb-6 p-4 bg-black/50 border border-white/10 rounded-xl relative overflow-hidden flex flex-col items-center">
            <div className="text-xs text-purple-400 uppercase tracking-[0.2em] mb-2 font-bold">Active Auth Code</div>
            <div className="text-4xl font-mono tracking-[0.3em] font-bold text-white mb-2" style={{ textShadow: `0 0 20px ${themeColor}` }}>
              {currentPin}
            </div>
            <div className="absolute bottom-0 left-0 h-1 transition-all duration-100" style={{ width: `${pinProgress}%`, backgroundColor: themeColor }} />
          </div>

          <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
            <input 
              type="text" 
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="Enter PIN..."
              className="w-full text-center tracking-[1em] font-mono text-xl px-6 py-4 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-purple-500/50 shadow-inner"
              maxLength={4}
              required
            />
            <button disabled={unlockSuccess} type="submit" className={`w-full py-4 rounded-2xl font-bold text-lg transition-colors shadow-lg ${unlockSuccess ? 'bg-green-500 text-white' : 'bg-purple-600 hover:bg-purple-500'}`}>
              {unlockSuccess ? 'Unlocking...' : 'Unlock'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white relative font-sans overflow-x-hidden selection:bg-purple-500/30 selection:text-white flex flex-col items-center pt-12 md:pt-20 px-4 pb-20">
      <BackgroundElements themeColor={themeColor} />
      {showConfetti && <Confetti recycle={false} numberOfPieces={800} gravity={0.15} colors={['#9333ea', '#ec4899', '#3b82f6', '#22c55e']} style={{ zIndex: 100 }} />}
      
      <Toaster position="bottom-center" toastOptions={{ 
        style: { background: '#18181b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(10px)' } 
      }} />

      {/* Global Audio Player */}
      <GlobalAudioPlayer 
        track={currentTrack} 
        playlist={history.filter(h => h.filename && (h.filename.endsWith('.mp3') || h.filename.endsWith('.m4a')))}
        onTrackChange={(track) => setCurrentTrack(track)}
        onClose={() => setCurrentTrack(null)}
        themeColor={themeColor}
      />

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setShowQR(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-white/10 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl relative flex flex-col items-center text-center"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowQR(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/30">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="font-bold text-xl mb-2 text-white">Send to Mobile</h3>
              <p className="text-sm text-gray-400 mb-6">Scan this QR Code with your phone's camera to download the file directly. Ensure you are on the same Wi-Fi network.</p>
              
              <div className="p-4 bg-white rounded-2xl shadow-inner">
                <QRCodeSVG value={`https://media-backend-production-b846.up.railway.app/api/serve/${showQR}`} size={200} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative z-10 w-full max-w-2xl p-6 md:p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.4)] mb-8"
      >
        <div className="text-center mb-8 relative">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 pb-2">
            Media Downloader Pro
          </h1>
          <p className="mt-2 text-gray-400 text-sm tracking-wide">Premium URL extraction & converting engine.</p>
          
          {installPrompt && (
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={async () => {
                if (!installPrompt) return;
                installPrompt.prompt();
                const { outcome } = await installPrompt.userChoice;
                if (outcome === 'accepted') setInstallPrompt(null);
              }}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-full font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 mx-auto text-sm border border-white/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Install App to Home Screen
            </motion.button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/5 relative z-20 overflow-x-auto custom-scrollbar">
          {Object.keys(PLATFORM_THEMES).map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 min-w-[80px] py-3 text-sm font-bold tracking-wide rounded-xl capitalize transition-all duration-300 relative ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {activeTab === tab && (
                <motion.div layoutId="active-tab" className="absolute inset-0 bg-white/10 rounded-xl border border-white/10 shadow-lg" style={{ backgroundColor: themeColor, opacity: 0.2 }} />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleFetchInfo} className="flex flex-col gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              placeholder="Paste URL or Drag & Drop anywhere..."
              className="w-full px-6 py-4 bg-black/30 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] disabled:opacity-50"
              required
            />
            <motion.button
              type="submit"
              disabled={isLoading || !url}
              whileHover={!isLoading && url ? { scale: 1.02 } : {}}
              whileTap={!isLoading && url ? { scale: 0.98 } : {}}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 relative overflow-hidden ${isLoading ? 'bg-white/10 cursor-not-allowed' : 'shadow-lg hover:shadow-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'}`}
              style={{ backgroundColor: isLoading ? undefined : themeColor }}
            >
              {isLoading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-pulse" />}
              <span className="relative z-10 text-white">Analyze URL</span>
            </motion.button>
          </form>
        )}

        {step === 1 && activeTab === 'batch' && (
          <form onSubmit={startBatchDownload} className="relative z-10 w-full max-w-xl group">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all duration-300">
              <label className="text-sm text-gray-400 mb-2 block px-2">Paste URLs (One per line)</label>
              <textarea 
                rows="6"
                placeholder="https://youtube.com/watch?v=...\nhttps://instagram.com/reel/..."
                value={batchUrls}
                onChange={(e) => setBatchUrls(e.target.value)}
                className="w-full bg-black/50 text-white px-4 py-3 rounded-2xl focus:outline-none border border-transparent transition-all custom-scrollbar resize-none font-mono text-sm"
              />
              <div className="mt-4">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 block px-2">Quality</label>
                <select value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full px-4 py-3 bg-black/50 text-white rounded-xl focus:outline-none cursor-pointer">
                  <option value="4k" className="bg-gray-900">4K Max (Merged Video+Audio)</option>
                  <option value="best" className="bg-gray-900">Highest Quality</option>
                  <option value="720p" className="bg-gray-900">720p</option>
                  <option value="audio" className="bg-gray-900">Audio Only (MP3/M4A)</option>
                  <option value="8d_audio" className="bg-gray-900">8D & Bass Boost (MP3)</option>
                </select>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              disabled={isLoading || !batchUrls}
              type="submit"
              className="mt-6 w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 border border-white/20 transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: isLoading ? undefined : themeColor }}
            >
              Start Batch Download
            </motion.button>
          </form>
        )}

        {step === 1.5 && (
          // Skeleton Loader UI
          <div className="flex flex-col gap-6 animate-pulse">
            <div className="flex items-start gap-4 p-5 bg-black/30 rounded-2xl border border-white/5">
              <div className="w-28 h-20 bg-white/10 rounded-xl" />
              <div className="flex-1 space-y-3 mt-1">
                 <div className="h-4 bg-white/10 rounded w-3/4" />
                 <div className="h-3 bg-white/10 rounded w-1/3" />
              </div>
            </div>
          </div>
        )}

        {step >= 2 && videoInfo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            
            {!videoInfo.is_playlist ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  {videoInfo.thumbnail && (
                    <div className="md:w-1/3 flex flex-col gap-3">
                      <img 
                        ref={imgRef}
                        crossOrigin="anonymous"
                        onLoad={extractColors}
                        src={videoInfo.thumbnail} 
                        alt="Thumbnail" 
                        className="w-full rounded-xl shadow-lg border border-white/10" 
                      />
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = videoInfo.thumbnail;
                          link.download = 'thumbnail.jpg';
                          link.target = '_blank';
                          link.click();
                        }}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/10"
                      >
                        Download 4K Thumbnail
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2 text-white">{videoInfo.title}</h3>
                    {videoInfo.duration && <p className="text-gray-400 font-medium mb-4">{videoInfo.duration}</p>}
                    
                    {videoInfo.has_subtitles && (
                       <button 
                         onClick={async () => {
                           try {
                             toast.loading('Extracting Subtitles...', { id: 'subs' });
                             const res = await axios.post('https://media-backend-production-b846.up.railway.app/api/subtitles', { url: videoInfo.url || url });
                             const link = document.createElement('a');
                             link.href = `https://media-backend-production-b846.up.railway.app/api/serve/${res.data.filename}`;
                             link.download = res.data.filename;
                             link.click();
                             toast.success('Subtitles Downloaded!', { id: 'subs' });
                           } catch (err) {
                             toast.error('Failed to extract subtitles', { id: 'subs' });
                           }
                         }}
                         className="px-4 py-2 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors rounded-xl text-sm font-bold flex items-center gap-2 mb-4"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                         Extract Subtitles (.vtt)
                       </button>
                    )}
                    
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-white/5 text-gray-300 text-xs rounded-md border border-white/10 capitalize">{activeTab}</span>
                      <span className="px-2 py-1 bg-white/5 text-gray-300 text-xs rounded-md border border-white/10">{videoInfo.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-black/30 rounded-2xl border border-white/5 p-5 shadow-inner">
                <h3 className="font-bold text-lg mb-1 truncate text-gray-100">Playlist: {videoInfo.title}</h3>
                <p className="text-gray-400 text-sm mb-4">Select videos to download ({selectedEntries.size} / {videoInfo.entries.length})</p>
                <div className="max-h-64 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {videoInfo.entries.map(entry => (
                    <div key={entry.id} className="flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/5 cursor-pointer hover:bg-black/40 transition-colors" onClick={() => toggleEntry(entry.id)}>
                      <div className="flex items-center justify-center w-6 h-6 rounded-md border border-white/20 bg-black/50">
                        {selectedEntries.has(entry.id) && <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: themeColor }} />}
                      </div>
                      <img src={entry.thumbnail} className="w-16 h-12 object-cover rounded-lg shadow-sm" />
                      <div className="flex-1 truncate">
                         <p className="text-sm font-medium truncate text-gray-200">{entry.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 block">Media Quality</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 text-white rounded-xl border border-white/10 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="4k" className="bg-gray-900 font-bold text-yellow-400">🔥 4K Max Quality (Merged)</option>
                    <option value="best" className="bg-gray-900">Highest Quality (Video + Audio)</option>
                    <option value="720p" className="bg-gray-900">720p (Good Quality)</option>
                    <option value="audio" className="bg-gray-900">Audio Only (MP3/M4A)</option>
                  <option value="8d_audio" className="bg-gray-900">8D & Bass Boost (MP3)</option>
                  </select>
                </div>

                {!videoInfo.is_playlist && (activeTab === 'youtube' || activeTab === 'instagram') && (
                  <div className="bg-black/20 p-5 rounded-2xl border border-white/5 mt-4">
                    <div className="flex items-center justify-between">
                       <label className="flex items-center gap-3 cursor-pointer">
                         <div className="relative">
                           <input type="checkbox" checked={enableTrim} onChange={e => setEnableTrim(e.target.checked)} className="sr-only" />
                           <div className={`block w-10 h-6 rounded-full transition-colors ${enableTrim ? 'bg-white' : 'bg-gray-600'}`} style={enableTrim ? { backgroundColor: themeColor } : {}}></div>
                           <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${enableTrim ? 'transform translate-x-4 shadow-md' : ''}`}></div>
                         </div>
                         <span className="font-medium text-sm">Enable Snippet Cutter (Ringtone Maker)</span>
                       </label>
                    </div>
                  </div>
                )}
                
                <AnimatePresence>
                  {enableTrim && !videoInfo.is_playlist && (activeTab === 'youtube' || activeTab === 'instagram') && (
                    <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-gray-400 text-sm">Advanced Options</span>
                        <div className="flex-1 h-px bg-white/10" />
                        <button onClick={() => setEnableTrim(!enableTrim)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${enableTrim ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'bg-white/10 text-gray-400'}`}>
                          {enableTrim ? 'Trimmer Enabled' : 'Enable Trimmer'}
                        </button>
                      </div>
                      <SnippetCutter url={videoInfo.url || url} themeColor={themeColor} durationStr={videoInfo.duration} range={trimRange} setRange={setTrimRange} />
                    </div>
                  )}
                </AnimatePresence>

                {!enableTrim && (
                  <div className="flex gap-3 mt-4">
                    <button onClick={reset} className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-medium">Back</button>
                    <motion.button
                      onClick={startDownload}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                      style={{ backgroundColor: themeColor }}
                    >
                      Start {activeTab === 'playlist' ? 'Batch ' : ''}Download
                    </motion.button>
                  </div>
                )}
                
                {enableTrim && (
                  <div className="flex gap-3 mt-4">
                    <button onClick={reset} className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-medium">Back</button>
                    <motion.button
                      onClick={startDownload}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                      style={{ backgroundColor: themeColor }}
                    >
                      Download Snippet
                    </motion.button>
                  </div>
                )}
              </div>
            )}

            {(step === 3 || step === 4) && (
              <div className="flex flex-col gap-4">
                {Object.entries(tasks).map(([tid, data]) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={tid} 
                    className={`bg-black/30 border p-4 rounded-xl shadow-inner transition-colors duration-500 ${data.status === 'completed' ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'border-white/10'}`}
                  >
                    <div className="flex justify-between text-sm mb-2 font-medium">
                      <span className="text-gray-200 line-clamp-1 mr-4">
                        {videoInfo.is_playlist ? videoInfo.entries.find(e => e.url === data.url)?.title || 'Video' : videoInfo.title}
                      </span>
                      <span className={data.status === 'completed' ? 'text-green-400' : 'text-purple-400'}>
                        {data.status === 'completed' ? '100%' : data.status === 'error' ? 'Error' : `${Math.round(data.progress)}%`}
                      </span>
                    </div>
                    
                    <div className="w-full bg-black/50 rounded-full h-2.5 overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: data.status === 'completed' ? '100%' : `${data.progress}%` }}
                        transition={{ ease: "easeOut", duration: 0.5 }}
                        className={`h-2.5 rounded-full ${data.status === 'completed' ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                      ></motion.div>
                    </div>

                    {data.status === 'error' && (
                      <p className="text-red-400 text-xs mt-2">{data.error}</p>
                    )}

                    {data.status === 'completed' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 flex flex-col gap-4">
                        
                        {/* Mini Video Player Preview */}
                        <div className="w-full bg-black/60 rounded-xl overflow-hidden border border-white/10 mb-2 shadow-inner">
                          <video 
                            src={`https://media-backend-production-b846.up.railway.app/api/serve/${data.filename}`} 
                            autoPlay 
                            muted 
                            loop 
                            className="w-full max-h-48 object-contain"
                          />
                        </div>

                        <div className="flex gap-2 flex-wrap justify-end">
                          <button 
                            onClick={() => setShowQR(data.filename)}
                            className="px-4 py-2 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors border border-indigo-500/30 rounded-lg text-sm flex items-center gap-2 font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            Send to Mobile
                          </button>

                          <button 
                            onClick={() => handleNativeShare(data.filename, videoInfo.title)}
                            className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors border border-blue-500/30 rounded-lg text-sm flex items-center gap-2 font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            Native Cloud / Share
                          </button>

                          <button onClick={() => handleConvertAction(data.filename, 'mp3')} disabled={converting === data.filename} className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-sm border border-blue-500/30 disabled:opacity-50 font-medium">Extract MP3</button>
                          
                          {/* Podcast Visualizer Button */}
                          <button onClick={() => handlePodcastAction(data.filename, videoInfo.thumbnail)} disabled={converting === data.filename || !videoInfo.thumbnail} className="px-4 py-2 bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 rounded-lg text-sm border border-pink-500/30 disabled:opacity-50 font-medium flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                            Podcast Video
                          </button>
                          
                          <button onClick={() => handleSubtitleAction(data.url)} className="px-4 py-2 bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 rounded-lg text-sm border border-yellow-500/30 font-medium flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
                            Get Subtitles
                          </button>

                          <button onClick={() => handleReadTranscript(data.url)} className="px-4 py-2 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded-lg text-sm border border-orange-500/30 font-medium flex items-center gap-1 shadow-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Read Video (AI)
                          </button>
                          
                          <button onClick={() => handleConvertAction(data.filename, 'gif')} disabled={converting === data.filename} className="px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg text-sm border border-purple-500/30 disabled:opacity-50 font-medium">Make 15s GIF</button>
                          
                          <a href={`https://media-backend-production-b846.up.railway.app/api/serve/${data.filename}`} target="_blank" rel="noopener noreferrer" download className="px-6 py-2 bg-green-500 hover:bg-green-600 transition-colors rounded-lg text-sm font-bold text-white shadow-lg flex items-center gap-2 ml-auto">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Save to Disk
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}

                {step === 4 && (
                  <button onClick={reset} className="mt-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-medium">Start New Task</button>
                )}
              </div>
            )}
          </motion.div>
        )}
        
        <div className="w-full">
          <MediaLibrary 
             themeColor={themeColor} 
             setCurrentTrack={setCurrentTrack} 
             playlist={history.filter(h => h.filename && (h.filename.endsWith('.mp3') || h.filename.endsWith('.m4a')))}
          />
        </div>
      </div>

      {/* Floating Theme Switcher */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl">
        {Object.entries(AESTHETICS).map(([key, val]) => (
          <button
            key={key}
            onClick={() => handleThemeChange(key)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${themeKey === key ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'}`}
            style={{ backgroundColor: val.color }}
            title={val.name}
          />
        ))}
      </div>

      {/* Transcript Modal */}
      <AnimatePresence>
        {showTranscript && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-gray-900 border border-white/10 p-8 rounded-[2rem] max-w-2xl w-full h-[80vh] flex flex-col shadow-2xl relative">
              <button onClick={() => setShowTranscript(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                AI Video Transcript
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 text-gray-300 leading-relaxed space-y-4">
                {transcriptText ? (
                  transcriptText.split('. ').map((sentence, i) => (
                    <p key={i}>{sentence}.</p>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No transcript text found.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Audio Player */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div initial={{ y: 150 }} animate={{ y: 0 }} exit={{ y: 150 }} transition={{ type: 'spring', damping: 20 }} className="fixed bottom-0 left-0 w-full p-4 md:p-6 z-[90] flex justify-center pointer-events-none">
             <div className="w-full max-w-2xl bg-black/90 backdrop-blur-3xl border border-white/20 p-4 rounded-3xl shadow-[0_0_50px_rgba(147,51,234,0.3)] flex items-center gap-4 pointer-events-auto">
                 <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-blue-500 animate-[spin_4s_linear_infinite]" />
                    <div className="absolute inset-[3px] bg-black rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                    </div>
                 </div>
                 <div className="flex-1 min-w-0">
                     <div className="font-bold text-sm text-white truncate mb-1">Now Playing</div>
                     <div className="h-4 w-full flex items-end gap-1">
                         {[...Array(20)].map((_, i) => (
                           <motion.div key={i} animate={{ height: ['20%', '100%', '20%'] }} transition={{ repeat: Infinity, duration: Math.random() * 0.5 + 0.3 }} className="flex-1 bg-purple-500 rounded-t-full opacity-70" />
                         ))}
                     </div>
                 </div>
                 <audio src={currentTrack} autoPlay controls className="h-10 opacity-70 hover:opacity-100 transition-opacity w-32 md:w-64 invert" />
                 <button onClick={() => setCurrentTrack(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-gray-300 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoDownloader;
