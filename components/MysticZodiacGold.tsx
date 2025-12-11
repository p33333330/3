import React from 'react';
import { motion } from 'framer-motion';
import { Reading } from '../types';
import { RefreshCw } from 'lucide-react';

interface MysticZodiacGoldProps {
  reading: Reading | null;
  onReset: () => void;
}

const GOLD = "#d4af37"; // Metallic Gold
const TEAL_BG = "#0d3b4c"; // Deep Teal

const MysticZodiacGold: React.FC<MysticZodiacGoldProps> = ({ reading, onReset }) => {
  const zodiacGlyphs = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 flex flex-col items-center justify-center z-40 bg-[#0d3b4c] overflow-hidden"
    >
        {/* --- MAIN CHART SVG --- */}
        <div className="relative flex items-center justify-center w-full h-full pb-32 md:pb-0">
             <motion.svg
                width="800"
                height="800"
                viewBox="-450 -450 900 900"
                className="w-[90vmin] h-[90vmin] max-w-[800px] max-h-[800px]"
                style={{ filter: "drop-shadow(0 0 20px rgba(212,175,55,0.3))" }}
             >
                {/* --- 1. OUTER STATIC RINGS --- */}
                <circle cx="0" cy="0" r="420" fill="none" stroke={GOLD} strokeWidth="4" opacity="0.8" />
                <circle cx="0" cy="0" r="400" fill="none" stroke={GOLD} strokeWidth="1" />
                
                {/* Decorative ticks */}
                {Array.from({ length: 72 }).map((_, i) => (
                    <line 
                        key={i} 
                        x1="0" y1="-400" x2="0" y2="-420" 
                        stroke={GOLD} strokeWidth="1"
                        transform={`rotate(${i * 5})`}
                    />
                ))}

                {/* --- 2. ROTATING GLYPH RING --- */}
                <motion.g 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                >
                    {/* Sectors lines */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <line 
                            key={`line-${i}`}
                            x1="0" y1="-250" x2="0" y2="-400" 
                            stroke={GOLD} strokeWidth="1"
                            transform={`rotate(${i * 30})`}
                        />
                    ))}

                    {/* Glyphs */}
                    {zodiacGlyphs.map((glyph, i) => (
                         <g key={`glyph-${i}`} transform={`rotate(${i * 30 + 15}) translate(0, -320)`}>
                            {/* Rotate text back so it's upright relative to the center, or keep radial? Radial looks better on charts */}
                            <text 
                                x="0" y="0" 
                                fill={GOLD} 
                                textAnchor="middle" 
                                dominantBaseline="middle"
                                fontSize="40"
                                fontWeight="bold"
                                transform={`rotate(${- (i * 30 + 15)})`} // Keep upright
                            >
                                {glyph}
                            </text>
                         </g>
                    ))}
                    
                    <circle cx="0" cy="0" r="250" fill="none" stroke={GOLD} strokeWidth="2" />
                </motion.g>

                {/* --- 3. INNER GEOMETRY (Counter Rotate) --- */}
                <motion.g 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                >
                    {/* Star Polygon */}
                    <polygon 
                        points="0,-250 150,0 0,250 -150,0" 
                        fill="none" stroke={GOLD} strokeWidth="1" opacity="0.5"
                    />
                    <polygon 
                        points="0,-250 150,0 0,250 -150,0" 
                        fill="none" stroke={GOLD} strokeWidth="1" opacity="0.5"
                        transform="rotate(45)"
                    />
                    
                    <circle cx="0" cy="0" r="180" fill="none" stroke={GOLD} strokeWidth="0.5" strokeDasharray="10 5" />
                </motion.g>

                {/* --- 4. CENTRAL STARBURST (Reference Image 2) --- */}
                <g>
                    {/* Multilayered Star */}
                    {Array.from({ length: 8 }).map((_, i) => (
                         <polygon 
                            key={`star-${i}`}
                            points="0,-120 20,-40 0,0 -20,-40"
                            fill={GOLD}
                            opacity={i % 2 === 0 ? 1 : 0.6}
                            transform={`rotate(${i * 45})`}
                         />
                    ))}
                    <circle cx="0" cy="0" r="30" fill={TEAL_BG} stroke={GOLD} strokeWidth="3" />
                    <circle cx="0" cy="0" r="10" fill={GOLD} />
                </g>

             </motion.svg>
        </div>

        {/* --- BOTTOM READING PANEL --- */}
        <div className="absolute bottom-0 w-full p-6 md:p-8 bg-gradient-to-t from-[#0d3b4c] via-[#0d3b4c]/95 to-transparent flex flex-col items-center z-50">
           {reading ? (
             <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="max-w-2xl text-center"
             >
                <h2 className="text-xl md:text-2xl font-serif text-[#f0e6d2] mb-3 tracking-[0.2em] uppercase border-b border-[#d4af37]/40 pb-2 inline-block">
                  {reading.title}
                </h2>
                <p className="text-lg md:text-xl leading-relaxed font-serif text-[#d4af37] italic opacity-90 drop-shadow-md">
                  "{reading.prophecy}"
                </p>
                <div className="mt-6 flex flex-col items-center gap-2">
                    <button 
                        onClick={onReset}
                        className="group flex items-center justify-center gap-2 mx-auto px-6 py-2 border border-[#d4af37]/30 hover:border-[#d4af37] hover:bg-[#d4af37]/10 rounded-full transition-all duration-300"
                    >
                        <RefreshCw size={14} className="text-[#d4af37] group-hover:rotate-180 transition-transform duration-500" /> 
                        <span className="text-xs md:text-sm text-[#d4af37] uppercase tracking-[0.2em]">Close Chart</span>
                    </button>
                    <span className="text-[#d4af37]/50 text-[10px] tracking-widest uppercase">OPEN HAND TO RELEASE</span>
                </div>
             </motion.div>
           ) : (
             <div className="text-[#d4af37]/60 font-serif text-sm tracking-[0.3em] animate-pulse pb-8">
                ALIGNING CELESTIAL SPHERES...
             </div>
           )}
        </div>
    </motion.div>
  );
};

export default MysticZodiacGold;