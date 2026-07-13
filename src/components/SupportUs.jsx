import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

export default function SupportUs({ themeColor = '#9333ea' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-16 right-0 mb-4 w-72 bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl p-6 text-white"
          >
            <h3 className="font-bold text-lg mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Support Us ❤️</h3>
            <p className="text-sm text-gray-400 mb-4">
              If you enjoy our free premium downloads, please consider supporting the server costs!
            </p>
            <div className="space-y-4">
              {deferredPrompt && (
                <button 
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  Install Our App
                </button>
              )}
              <hr className="border-white/10" />
              <div className="bg-white p-2 rounded-xl w-32 h-32 mx-auto">
                <QRCodeSVG value="upi://pay?pa=8766083129@ptyes&pn=MediaDownloaderPro&cu=INR" size={100} className="w-full h-full" />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 font-mono">UPI: 8766083129@ptyes</p>
              </div>
              <a href="upi://pay?pa=8766083129@ptyes&pn=MediaDownloaderPro&cu=INR" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-all text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] md:hidden" style={{ backgroundColor: themeColor }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Pay via UPI App
              </a>
            </div>
            
            <button onClick={() => setIsOpen(false)} className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg border border-white/10 text-white transition-all"
        style={{ backgroundColor: themeColor, boxShadow: `0 4px 20px ${themeColor}60` }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
      </motion.button>
    </div>
  );
}
