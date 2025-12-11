import React from 'react';
import { motion } from 'framer-motion';

interface GameBackgroundProps {
  score: number;
}

const GOLD = "#dec888";
const DARK_BG = "#050a14";

const GameBackground: React.FC<GameBackgroundProps> = ({ score }) => {
  // Speed up rotation as score increases
  const duration = Math.max(10, 80 - score * 2);
  
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-[#050a14]">
       <motion.div 
         className="w-[120vmin] h-[120vmin] opacity-40 blur-[1px]"
         animate={{ scale: [1, 1.02, 1] }}
         transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
       >
         <svg
            width="800"
            height="800"
            viewBox="-450 -450 900 900"
            className="w-full h-full"
         >
            {/* --- STATIC FRAME --- */}
            <rect x="-420" y="-420" width="840" height="840" fill="none" stroke={GOLD} strokeWidth="2" opacity="0.5" />
            
            {/* --- ROTATING LAYER (Speed depends on score) --- */}
            <motion.g 
                animate={{ rotate: 360 }}
                transition={{ duration: duration, repeat: Infinity, ease: "linear" }}
            >
                {/* Rays */}
                {Array.from({ length: 12 }).map((_, i) => (
                    <line 
                        key={`ray-${i}`}
                        x1="0" y1="-120" x2="0" y2="-360" 
                        stroke={GOLD} strokeWidth="1"
                        transform={`rotate(${i * 30})`}
                    />
                ))}

                {/* Hexagram */}
                <g opacity="0.4">
                     <polygon points="0,-300 260,150 -260,150" fill="none" stroke={GOLD} strokeWidth="2" />
                     <polygon points="0,300 260,-150 -260,-150" fill="none" stroke={GOLD} strokeWidth="2" />
                     <circle cx="0" cy="0" r="160" fill="none" stroke={GOLD} strokeWidth="1" strokeDasharray="4 4" />
                </g>

                {/* Runes */}
                {Array.from({ length: 6 }).map((_, i) => (
                    <g key={`rune-${i}`} transform={`rotate(${i * 60}) translate(0, -300)`}>
                        <circle r="6" fill="none" stroke={GOLD} strokeWidth="1" />
                    </g>
                ))}
            </motion.g>

            {/* --- COUNTER ROTATING LAYER --- */}
            <motion.g 
                animate={{ rotate: -360 }}
                transition={{ duration: duration * 1.5, repeat: Infinity, ease: "linear" }}
            >
               <circle cx="0" cy="0" r="220" fill="none" stroke={GOLD} strokeWidth="1" strokeDasharray="10 10" opacity="0.3" />
            </motion.g>

            {/* --- CENTRAL STATIC ELEMENTS (The Book) --- */}
            <g transform="scale(1.2)">
                 {/* Sun Top */}
                <g transform="translate(0, -360)">
                    <circle cx="0" cy="0" r="14" fill="none" stroke={GOLD} strokeWidth="2" />
                    <line x1="0" y1="-20" x2="0" y2="-30" stroke={GOLD} strokeWidth="2" />
                </g>
                {/* Moon Bottom */}
                <path d="M 0 340 A 20 20 0 1 1 0 380 A 14 14 0 1 0 0 340 Z" fill={GOLD} opacity="0.5" />

                {/* Book */}
                <path d="M 0 -80 L -100 -80 Q -110 -60 -110 80 Q -60 100 -5 80 L -5 -80 Z" fill="none" stroke={GOLD} strokeWidth="2" />
                <path d="M 0 -80 L 100 -80 Q 110 -60 110 80 Q 60 100 5 80 L 5 -80 Z" fill="none" stroke={GOLD} strokeWidth="2" />
                <line x1="0" y1="-80" x2="0" y2="80" stroke={GOLD} strokeWidth="1" />
                
                {/* Book Details */}
                <g transform="translate(-55, 0)">
                    <circle cx="0" cy="0" r="30" fill="none" stroke={GOLD} strokeWidth="1" />
                    <polygon points="0,-20 18,10 -18,10" fill="none" stroke={GOLD} strokeWidth="1" />
                </g>
                <g transform="translate(55, 0)">
                    <circle cx="0" cy="0" r="30" fill="none" stroke={GOLD} strokeWidth="1" />
                    <rect x="-15" y="-15" width="30" height="30" fill="none" stroke={GOLD} strokeWidth="1" transform="rotate(45)" />
                </g>
            </g>

         </svg>
       </motion.div>
    </div>
  );
};

export default GameBackground;