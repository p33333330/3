import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Reading } from '../types';
import { RefreshCw } from 'lucide-react';

interface MysticBookProps {
  reading: Reading | null;
  onReset: () => void;
}

const MysticBook: React.FC<MysticBookProps> = ({ reading, onReset }) => {
  const [scrollPos, setScrollPos] = useState(0);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, ease: "easeOut" }} // Reduced from 0.8 to 0.5
      className="fixed inset-0 flex items-center justify-center z-40 p-4"
    >
      <div className="relative w-full max-w-3xl aspect-[4/3] bg-[#090e1a] border-2 border-[#C5B358] shadow-[0_0_50px_rgba(197,179,88,0.2)] rounded-lg flex overflow-hidden">
        
        {/* Decorative Corners - Parallax Expansion Effect */}
        <div 
          className="absolute top-2 left-2 w-16 h-16 border-t-2 border-l-2 border-[#C5B358] transition-transform duration-75 ease-out"
          style={{ transform: `translate(${-scrollPos * 0.05}px, ${-scrollPos * 0.05}px)` }}
        />
        <div 
          className="absolute top-2 right-2 w-16 h-16 border-t-2 border-r-2 border-[#C5B358] transition-transform duration-75 ease-out"
          style={{ transform: `translate(${scrollPos * 0.05}px, ${-scrollPos * 0.05}px)` }} 
        />
        <div 
          className="absolute bottom-2 left-2 w-16 h-16 border-b-2 border-l-2 border-[#C5B358] transition-transform duration-75 ease-out"
          style={{ transform: `translate(${-scrollPos * 0.05}px, ${scrollPos * 0.05}px)` }}
        />
        <div 
          className="absolute bottom-2 right-2 w-16 h-16 border-b-2 border-r-2 border-[#C5B358] transition-transform duration-75 ease-out"
          style={{ transform: `translate(${scrollPos * 0.05}px, ${scrollPos * 0.05}px)` }}
        />

        {/* Central Vertical Spine Line - Subtle Parallax */}
        <div 
          className="absolute inset-y-4 left-1/2 w-px bg-[#C5B358] opacity-30 transition-transform duration-75 ease-out" 
          style={{ transform: `translateY(${scrollPos * 0.02}px)` }}
        />

        {/* Left Page (Graphics) - Vertical Parallax */}
        <div className="w-1/2 p-12 flex flex-col items-center justify-center border-r border-[#C5B358]/20 bg-[#0B101D] overflow-hidden">
             <motion.div 
               initial={{ rotate: 0 }}
               animate={{ rotate: 360 }}
               transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
               className="w-48 h-48 rounded-full border border-[#C5B358] opacity-50 flex items-center justify-center"
               style={{ y: -scrollPos * 0.2 }} // Moves up slowly as user reads down
             >
                <div className="w-32 h-32 border border-[#C5B358] rotate-45" />
             </motion.div>
             <motion.div 
               className="mt-8 text-[#C5B358] font-serif text-center opacity-70"
               style={{ y: -scrollPos * 0.1 }}
             >
                <p>Vol. VII</p>
                <p className="text-sm mt-2">Liber Astrum</p>
             </motion.div>
        </div>

        {/* Right Page (Content) */}
        <div className="w-1/2 p-12 flex flex-col justify-center bg-[#0B101D]">
           {reading ? (
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }} // Reduced delay and duration
             >
                <h2 className="text-3xl font-serif text-[#F0E6D2] mb-6 border-b border-[#C5B358] pb-4">
                  {reading.title}
                </h2>
                <p 
                  className="text-xl leading-relaxed font-serif text-[#C5B358] italic custom-scroll max-h-60 overflow-y-auto pr-2 scroll-smooth"
                  onScroll={(e) => setScrollPos(e.currentTarget.scrollTop)}
                >
                  "{reading.prophecy}"
                </p>
                
                <div className="mt-12 flex justify-center">
                  <div className="flex flex-col items-center gap-2">
                      <button 
                        onClick={onReset}
                        className="flex items-center gap-2 px-6 py-2 border border-[#C5B358] text-[#C5B358] hover:bg-[#C5B358] hover:text-[#050a14] transition-colors duration-300 font-serif uppercase tracking-widest text-sm"
                      >
                        <RefreshCw size={16} /> Close Tome
                      </button>
                      <span className="text-[#C5B358]/50 text-[10px] tracking-widest uppercase mt-2">OPEN HAND TO RELEASE</span>
                  </div>
                </div>
             </motion.div>
           ) : (
             <div className="flex items-center justify-center h-full">
                <span className="text-[#C5B358] animate-pulse font-serif text-lg">Deciphering the constellations...</span>
             </div>
           )}
        </div>

      </div>
    </motion.div>
  );
};

export default MysticBook;