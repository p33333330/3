import React from 'react';
import { motion } from 'framer-motion';
import { Reading } from '../types';
import { RefreshCw } from 'lucide-react';

interface MysticArtifactProps {
  reading: Reading | null;
  onReset: () => void;
}

const GOLD = "#dec888";
const DARK_BG = "#050a14";

const MysticArtifact: React.FC<MysticArtifactProps> = ({ reading, onReset }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.5 }} // Reduced from 0.8
      className="fixed inset-0 flex flex-col items-center justify-center z-40 bg-[#050a14] overflow-hidden"
    >
        {/* --- MAIN ARTIFACT SVG --- */}
        <div className="relative flex items-center justify-center w-full h-full pb-32 md:pb-0">
             <motion.svg
                width="800"
                height="800"
                viewBox="-450 -450 900 900"
                className="w-[90vmin] h-[90vmin] max-w-[800px] max-h-[800px] drop-shadow-[0_0_20px_rgba(222,200,136,0.2)]"
             >
                {/* --- 1. STATIC FRAME --- */}
                {/* Outer Double Border */}
                <rect x="-420" y="-420" width="840" height="840" fill="none" stroke={GOLD} strokeWidth="2" />
                <rect x="-405" y="-405" width="810" height="810" fill="none" stroke={GOLD} strokeWidth="1" />
                
                {/* Decorative Corners */}
                {[0, 90, 180, 270].map((r, i) => (
                    <g key={i} transform={`rotate(${r})`}>
                        {/* Corner Circle */}
                        <circle cx="-420" cy="-420" r="5" fill={DARK_BG} stroke={GOLD} strokeWidth="2" />
                        {/* Inner Arc decorations */}
                        <path d="M -390 -420 L -390 -390 L -420 -390" fill="none" stroke={GOLD} strokeWidth="1" />
                        <line x1="-390" y1="-390" x2="-370" y2="-370" stroke={GOLD} strokeWidth="1" opacity="0.5" />
                    </g>
                ))}

                {/* --- 2. ROTATING BACKGROUND LAYER --- */}
                <motion.g 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                >
                    {/* A. Rays Burst */}
                    {/* 12 Main Long Rays */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <line 
                            key={`ray-l-${i}`}
                            x1="0" y1="-120" x2="0" y2="-360" 
                            stroke={GOLD} strokeWidth="1"
                            transform={`rotate(${i * 30})`}
                        />
                    ))}
                    {/* 12 Secondary Short Rays */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <line 
                            key={`ray-s-${i}`}
                            x1="0" y1="-120" x2="0" y2="-280" 
                            stroke={GOLD} strokeWidth="0.5"
                            transform={`rotate(${i * 30 + 15})`}
                        />
                    ))}

                    {/* B. Hexagram / Star Structure */}
                    <g opacity="0.4">
                         {/* Triangle Up */}
                         <polygon points="0,-300 260,150 -260,150" fill="none" stroke={GOLD} strokeWidth="1.5" />
                         {/* Triangle Down */}
                         <polygon points="0,300 260,-150 -260,-150" fill="none" stroke={GOLD} strokeWidth="1.5" />
                         
                         {/* Inner Hexagon connections */}
                         <circle cx="0" cy="0" r="160" fill="none" stroke={GOLD} strokeWidth="0.5" strokeDasharray="4 4" />
                    </g>
                    
                    {/* C. Planetary Glyphs / Runes on the star tips */}
                    {Array.from({ length: 6 }).map((_, i) => (
                        <g key={`rune-${i}`} transform={`rotate(${i * 60}) translate(0, -300)`}>
                            <circle r="4" fill={DARK_BG} stroke={GOLD} strokeWidth="1" />
                            <line x1="0" y1="-10" x2="0" y2="-20" stroke={GOLD} strokeWidth="1" />
                        </g>
                    ))}
                </motion.g>

                {/* --- 3. STATIC CENTRAL AXIS ELEMENTS --- */}
                
                {/* Vertical Axis Line (Faint) */}
                <line x1="0" y1="-380" x2="0" y2="-150" stroke={GOLD} strokeWidth="0.5" opacity="0.5" />
                <line x1="0" y1="150" x2="0" y2="380" stroke={GOLD} strokeWidth="0.5" opacity="0.5" />

                {/* Top: The Sun */}
                <g transform="translate(0, -360)">
                    {/* Sun Core */}
                    <circle cx="0" cy="0" r="14" fill={DARK_BG} stroke={GOLD} strokeWidth="2" />
                    <circle cx="0" cy="0" r="4" fill={GOLD} />
                    {/* Sun Rays (Static) */}
                    {Array.from({length: 12}).map((_, i) => (
                        <line 
                            key={`sunray-${i}`} 
                            x1="0" y1="-20" x2="0" y2="-30" 
                            stroke={GOLD} strokeWidth="1.5" 
                            transform={`rotate(${i * 30})`} 
                        />
                    ))}
                </g>

                {/* Bottom: The Crescent Moon */}
                <g transform="translate(0, 360)">
                    {/* Crescent Shape created by masking/path */}
                    <path 
                        d="M 0 -20 A 20 20 0 1 1 0 20 A 14 14 0 1 0 0 -20 Z" 
                        fill={DARK_BG} 
                        stroke={GOLD} 
                        strokeWidth="2" 
                        transform="rotate(-90)"
                    />
                </g>

                {/* Center: The Golden Book */}
                <g transform="scale(1.3)">
                    {/* 1. Book Cover/Outline */}
                    {/* Left Page Outline */}
                    <path 
                        d="M 0 -80 L -100 -80 Q -110 -60 -110 80 Q -60 100 -5 80 L -5 -80 Z" 
                        fill={DARK_BG} stroke={GOLD} strokeWidth="2" 
                    />
                    {/* Right Page Outline */}
                    <path 
                        d="M 0 -80 L 100 -80 Q 110 -60 110 80 Q 60 100 5 80 L 5 -80 Z" 
                        fill={DARK_BG} stroke={GOLD} strokeWidth="2" 
                    />
                    
                    {/* 2. Spine */}
                    <path d="M -5 -80 Q 0 -85 5 -80 L 5 80 Q 0 85 -5 80 Z" fill={DARK_BG} stroke={GOLD} strokeWidth="2" />
                    <line x1="0" y1="-80" x2="0" y2="80" stroke={GOLD} strokeWidth="1" />

                    {/* 3. Page Details (Inner Lines) */}
                    <path d="M -95 -70 Q -100 -55 -100 70 Q -50 90 -10 70 L -10 -70 Z" fill="none" stroke={GOLD} strokeWidth="1" />
                    <path d="M 95 -70 Q 100 -55 100 70 Q 50 90 10 70 L 10 -70 Z" fill="none" stroke={GOLD} strokeWidth="1" />

                    {/* 4. Left Page Diagram: Triangle in Circle */}
                    <g transform="translate(-55, 0)">
                        {/* Outer Circle */}
                        <circle cx="0" cy="0" r="35" fill="none" stroke={GOLD} strokeWidth="1.5" />
                        {/* Triangle */}
                        <polygon points="0,-25 22,15 -22,15" fill="none" stroke={GOLD} strokeWidth="1.5" />
                        {/* Center Dot */}
                        <circle cx="0" cy="0" r="3" fill="none" stroke={GOLD} strokeWidth="1" />
                        <circle cx="0" cy="0" r="1" fill={GOLD} />
                        {/* Connecting lines to corners */}
                        <line x1="0" y1="-35" x2="0" y2="-25" stroke={GOLD} strokeWidth="1" />
                    </g>

                    {/* 5. Right Page Diagram: Diamond in Circle */}
                    <g transform="translate(55, 0)">
                        {/* Outer Circle */}
                        <circle cx="0" cy="0" r="35" fill="none" stroke={GOLD} strokeWidth="1.5" />
                        {/* Diamond (Square rotated) */}
                        <rect x="-18" y="-18" width="36" height="36" fill="none" stroke={GOLD} strokeWidth="1.5" transform="rotate(45)" />
                        {/* Center Dot */}
                        <circle cx="0" cy="0" r="3" fill="none" stroke={GOLD} strokeWidth="1" />
                        <circle cx="0" cy="0" r="1" fill={GOLD} />
                        {/* Cross lines */}
                        <line x1="-35" y1="0" x2="-25" y2="0" stroke={GOLD} strokeWidth="1" />
                        <line x1="35" y1="0" x2="25" y2="0" stroke={GOLD} strokeWidth="1" />
                    </g>
                    
                    {/* 6. Decorative Stars flanking book */}
                    <g transform="translate(-130, 0)">
                        <path d="M 0 -10 Q 0 0 10 0 Q 0 0 0 10 Q 0 0 -10 0 Q 0 0 0 -10" fill={GOLD} />
                    </g>
                    <g transform="translate(130, 0)">
                        <path d="M 0 -10 Q 0 0 10 0 Q 0 0 0 10 Q 0 0 -10 0 Q 0 0 0 -10" fill={GOLD} />
                    </g>
                </g>

             </motion.svg>
        </div>

        {/* --- BOTTOM READING PANEL --- */}
        <div className="absolute bottom-0 w-full p-6 md:p-8 bg-gradient-to-t from-[#050a14] via-[#050a14]/95 to-transparent flex flex-col items-center z-50">
           {reading ? (
             <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }} // Reduced delay and duration
                className="max-w-2xl text-center"
             >
                <h2 className="text-xl md:text-2xl font-serif text-[#F0E6D2] mb-3 tracking-[0.2em] uppercase border-b border-[#C5B358]/40 pb-2 inline-block">
                  {reading.title}
                </h2>
                
                <p className="text-lg md:text-xl leading-relaxed font-serif text-[#C5B358] italic opacity-90 drop-shadow-md">
                  "{reading.prophecy}"
                </p>
                
                <div className="mt-6 flex flex-col items-center gap-2">
                    <button 
                    onClick={onReset}
                    className="group flex items-center justify-center gap-2 mx-auto px-6 py-2 border border-[#C5B358]/30 hover:border-[#C5B358] hover:bg-[#C5B358]/10 rounded-full transition-all duration-300"
                    >
                        <RefreshCw size={14} className="text-[#C5B358] group-hover:rotate-180 transition-transform duration-500" /> 
                        <span className="text-xs md:text-sm text-[#C5B358] uppercase tracking-[0.2em]">Close Artifact</span>
                    </button>
                    <span className="text-[#C5B358]/50 text-[10px] tracking-widest uppercase">OPEN HAND TO RELEASE</span>
                </div>
             </motion.div>
           ) : (
             <div className="text-[#C5B358]/60 font-serif text-sm tracking-[0.3em] animate-pulse pb-8">
                TRANSLATING RUNES...
             </div>
           )}
        </div>
    </motion.div>
  );
};

export default MysticArtifact;