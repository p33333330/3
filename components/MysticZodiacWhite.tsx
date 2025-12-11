import React from 'react';
import { motion } from 'framer-motion';
import { Reading } from '../types';
import { RefreshCw } from 'lucide-react';

interface MysticZodiacWhiteProps {
  reading: Reading | null;
  onReset: () => void;
}

const WHITE = "#e2e8f0";
const NAVY_BG = "#0f172a"; // Deep Navy

const MysticZodiacWhite: React.FC<MysticZodiacWhiteProps> = ({ reading, onReset }) => {
  // Constellation approximations (stick figures)
  const renderConstellation = (index: number) => {
    // Simple paths representing star connections for 12 sectors
    const paths = [
      "M -10 10 L 0 0 L 10 5", // Aries-ish
      "M -10 -5 L -5 5 L 5 5 L 10 -10", // Taurus-ish
      "M -5 -10 L -5 10 M 5 -10 L 5 10", // Gemini
      "M -10 -5 L 0 5 L 10 -5 M 0 5 L 0 15", // Cancer-ish
      "M -5 10 L 0 0 L 5 0 L 10 5 L 8 12", // Leo-ish
      "M -10 -5 L -5 5 L 0 -5 L 5 5 L 10 10", // Virgo
      "M -10 10 L 0 0 L 10 10 M -5 5 L 5 5", // Libra
      "M -10 -10 L -5 0 L 0 -10 L 5 0 L 5 10", // Scorpio
      "M -10 10 L 10 -10 M 5 -10 L 10 -10 L 10 -5", // Sagittarius
      "M -5 -10 L 0 10 L 10 -5", // Capricorn
      "M -10 0 L -5 5 L 0 0 L 5 5 L 10 0", // Aquarius
      "M -5 -10 Q 5 0 -5 10 M 5 -10 Q -5 0 5 10" // Pisces
    ];
    
    return (
       <g transform={`rotate(${index * 30}) translate(0, -280) rotate(${-index * 30})`}>
          <path d={paths[index % 12]} stroke={WHITE} strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Stars at vertices (simplified) */}
          <circle cx="0" cy="0" r="1.5" fill={WHITE} />
       </g>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 flex flex-col items-center justify-center z-40 bg-[#0f172a] overflow-hidden"
    >
        {/* --- MAIN CHART SVG --- */}
        <div className="relative flex items-center justify-center w-full h-full pb-32 md:pb-0">
             <motion.svg
                width="800"
                height="800"
                viewBox="-450 -450 900 900"
                className="w-[90vmin] h-[90vmin] max-w-[800px] max-h-[800px]"
                style={{ filter: "drop-shadow(0 0 15px rgba(255,255,255,0.1))" }}
             >
                {/* --- 1. STATIC BORDERS (Chalky style) --- */}
                <circle cx="0" cy="0" r="420" fill="none" stroke={WHITE} strokeWidth="1.5" opacity="0.8" />
                <circle cx="0" cy="0" r="410" fill="none" stroke={WHITE} strokeWidth="0.5" strokeDasharray="4 4" opacity="0.5" />

                {/* --- 2. ROTATING ZODIAC RING --- */}
                <motion.g 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                >
                    {/* Sectors */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <g key={i} transform={`rotate(${i * 30})`}>
                             <line x1="0" y1="-150" x2="0" y2="-420" stroke={WHITE} strokeWidth="0.5" opacity="0.3" />
                        </g>
                    ))}

                    {/* Constellations */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <g key={`const-${i}`}>
                            {renderConstellation(i)}
                        </g>
                    ))}

                    {/* Inner Decorative Ring */}
                    <circle cx="0" cy="0" r="220" fill="none" stroke={WHITE} strokeWidth="1" />
                    <circle cx="0" cy="0" r="210" fill="none" stroke={WHITE} strokeWidth="0.5" strokeDasharray="2 6" />
                </motion.g>

                {/* --- 3. COUNTER ROTATING ELEMENTS --- */}
                <motion.g 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
                >
                     <circle cx="0" cy="0" r="340" fill="none" stroke={WHITE} strokeWidth="0.5" opacity="0.3" />
                     {/* Small dots on ring */}
                     {Array.from({ length: 24 }).map((_, i) => (
                         <circle 
                            key={`dot-${i}`}
                            cx="0" cy="-340" r="2" fill={WHITE}
                            transform={`rotate(${i * 15})`}
                         />
                     ))}
                </motion.g>

                {/* --- 4. CENTRAL SUN FACE (Reference Image 1) --- */}
                <g transform="scale(0.8)">
                    {/* Sun Rays */}
                    {Array.from({ length: 16 }).map((_, i) => (
                         <path 
                            key={`sunray-${i}`}
                            d="M 0 -130 L 10 -180 L 0 -170 L -10 -180 Z"
                            fill={WHITE}
                            transform={`rotate(${i * 22.5})`}
                         />
                    ))}
                    
                    {/* Face Circle */}
                    <circle cx="0" cy="0" r="130" fill={NAVY_BG} stroke={WHITE} strokeWidth="2" />
                    
                    {/* Face Features (Stylized) */}
                    <g stroke={WHITE} strokeWidth="2" fill="none" strokeLinecap="round">
                        {/* Eyes */}
                        <path d="M -50 -40 Q -30 -60 -10 -40" />
                        <circle cx="-30" cy="-30" r="5" fill={WHITE} stroke="none" />
                        <path d="M 50 -40 Q 30 -60 10 -40" />
                        <circle cx="30" cy="-30" r="5" fill={WHITE} stroke="none" />
                        
                        {/* Nose */}
                        <path d="M 0 -20 L -10 20 L 5 20" />
                        
                        {/* Mouth */}
                        <path d="M -40 50 Q 0 80 40 50" />
                        <path d="M -50 45 L -40 50 M 50 45 L 40 50" opacity="0.5" />
                        
                        {/* Cheeks */}
                        <circle cx="-60" cy="10" r="10" opacity="0.2" fill={WHITE} stroke="none" />
                        <circle cx="60" cy="10" r="10" opacity="0.2" fill={WHITE} stroke="none" />
                    </g>
                </g>

             </motion.svg>
        </div>

        {/* --- BOTTOM READING PANEL (Reused Style) --- */}
        <div className="absolute bottom-0 w-full p-6 md:p-8 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/95 to-transparent flex flex-col items-center z-50">
           {reading ? (
             <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="max-w-2xl text-center"
             >
                <h2 className="text-xl md:text-2xl font-serif text-white mb-3 tracking-[0.2em] uppercase border-b border-white/40 pb-2 inline-block">
                  {reading.title}
                </h2>
                <p className="text-lg md:text-xl leading-relaxed font-serif text-[#e2e8f0] italic opacity-90 drop-shadow-md">
                  "{reading.prophecy}"
                </p>
                <div className="mt-6 flex flex-col items-center gap-2">
                    <button 
                        onClick={onReset}
                        className="group flex items-center justify-center gap-2 mx-auto px-6 py-2 border border-white/30 hover:border-white hover:bg-white/10 rounded-full transition-all duration-300"
                    >
                        <RefreshCw size={14} className="text-white group-hover:rotate-180 transition-transform duration-500" /> 
                        <span className="text-xs md:text-sm text-white uppercase tracking-[0.2em]">Close Chart</span>
                    </button>
                    <span className="text-white/50 text-[10px] tracking-widest uppercase">OPEN HAND TO RELEASE</span>
                </div>
             </motion.div>
           ) : (
             <div className="text-white/60 font-serif text-sm tracking-[0.3em] animate-pulse pb-8">
                MAPPING THE STARS...
             </div>
           )}
        </div>
    </motion.div>
  );
};

export default MysticZodiacWhite;