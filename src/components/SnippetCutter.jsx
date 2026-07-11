import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  if (typeof timeStr === 'number') return timeStr;
  const parts = timeStr.toString().split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const SnippetCutter = ({ url, themeColor, durationStr, range, setRange }) => {
  const [maxDuration, setMaxDuration] = useState(60);

  useEffect(() => {
    const dur = parseTime(durationStr);
    setMaxDuration(dur > 0 ? dur : 300);
    setRange([0, Math.min(15, dur || 300)]);
  }, [durationStr]);



  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h3 className="font-bold text-lg text-gray-100 tracking-wide">Snippet Cutter (Visual Trimmer)</h3>
        </div>
        <span className="bg-black/50 px-3 py-1 rounded-lg text-sm text-gray-300 border border-white/10 font-mono">
          Clip: {formatTime(range[1] - range[0])}
        </span>
      </div>
      
      <p className="text-gray-400 text-sm mb-8">
        Drag the sliders to select the exact portion of the video you want to extract.
      </p>
      
      <div className="mb-10 px-2 relative">
        <div className="flex justify-between text-xs text-gray-500 font-bold mb-4 font-mono">
           <span>{formatTime(range[0])}</span>
           <span>{formatTime(range[1])}</span>
        </div>
        
        <Slider 
          range 
          min={0} 
          max={maxDuration} 
          value={range} 
          onChange={setRange} 
          allowCross={false}
          pushable={1}
          trackStyle={[{ backgroundColor: themeColor, height: 8 }]}
          handleStyle={[
            { backgroundColor: '#fff', borderColor: themeColor, opacity: 1, width: 20, height: 20, marginTop: -6, boxShadow: '0 0 10px rgba(0,0,0,0.5)' },
            { backgroundColor: '#fff', borderColor: themeColor, opacity: 1, width: 20, height: 20, marginTop: -6, boxShadow: '0 0 10px rgba(0,0,0,0.5)' }
          ]}
          railStyle={{ backgroundColor: 'rgba(255,255,255,0.1)', height: 8 }}
        />
        
        <div className="flex justify-between text-xs text-gray-600 mt-3 font-mono">
           <span>00:00</span>
           <span>{formatTime(maxDuration)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SnippetCutter;
