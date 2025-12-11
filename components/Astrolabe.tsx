import React from 'react';
import { motion } from 'framer-motion';

interface AstrolabeProps {
  active: boolean;
}

// Colors extracted/matched from Image 2
const GOLD = "#dec888"; // The main line color
const DARK_BLUE = "#1a1f35"; // Inner fill for contrast
const THIN_GOLD = "rgba(222, 200, 136, 0.5)";

const Astrolabe: React.FC<AstrolabeProps> = ({ active }) => {
  
  // --- Geometry Generators ---

  // Generate the specific "text blocks" seen in the outer ring of Image 2
  const createTextRing = (radius: number, count: number) => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * 360;
      return (
        <g key={i} transform={`rotate(${angle}) translate(0, -${radius})`}>
          <rect x="-1" y="-6" width="2" height="12" fill={GOLD} opacity={Math.random() * 0.5 + 0.5} />
          {i % 3 === 0 && <circle cx="0" cy="-10" r="1" fill={GOLD} />}
        </g>
      );
    });
  };

  // The 4 Cardinal Circles (N, S, E, W) with Hexagrams inside
  const createCardinalCircles = (radius: number) => {
    return Array.from({ length: 4 }).map((_, i) => {
      const angle = i * 90;
      return (
        <g key={i} transform={`rotate(${angle}) translate(0, -${radius})`}>
          {/* The circle container */}
          <circle cx="0" cy="0" r="35" fill="none" stroke={GOLD} strokeWidth="2" />
          <circle cx="0" cy="0" r="28" fill="none" stroke={THIN_GOLD} strokeWidth="1" />
          
          {/* Hexagram inside (2 triangles) */}
          <polygon points="0,-25 22,12 -22,12" fill="none" stroke={GOLD} strokeWidth="1" />
          <polygon points="0,25 22,-12 -22,-12" fill="none" stroke={GOLD} strokeWidth="1" />
          
          {/* Center dot */}
          <circle cx="0" cy="0" r="3" fill={GOLD} />
        </g>
      );
    });
  };

  // The 4 Intercardinal decorations (NE, SE, SW, NW) - smaller loops/lines
  const createIntercardinalDetails = (radius: number) => {
    return Array.from({ length: 4 }).map((_, i) => {
      const angle = i * 90 + 45;
      return (
        <g key={i} transform={`rotate(${angle}) translate(0, -${radius})`}>
           <path d="M -10 0 L 0 -20 L 10 0 Z" fill="none" stroke={GOLD} strokeWidth="1" />
           <line x1="0" y1="-20" x2="0" y2="-40" stroke={THIN_GOLD} />
           <circle cx="0" cy="0" r="5" fill={GOLD} />
        </g>
      );
    });
  };

  // The dense central web (Connection of many points)
  const createCentralWeb = () => {
    const outerPoints = 12;
    const innerPoints = 6;
    const outerRadius = 160;
    const innerRadius = 80;
    const lines = [];

    // Outer vertices
    const outerVertices = [];
    for (let i = 0; i < outerPoints; i++) {
      const a = (i / outerPoints) * Math.PI * 2;
      outerVertices.push({ x: Math.cos(a) * outerRadius, y: Math.sin(a) * outerRadius });
    }

    // Inner vertices (rotated slightly)
    const innerVertices = [];
    for (let i = 0; i < innerPoints; i++) {
      const a = (i / innerPoints) * Math.PI * 2 + (Math.PI / 6); 
      innerVertices.push({ x: Math.cos(a) * innerRadius, y: Math.sin(a) * innerRadius });
    }

    // Connect outer to outer (skip connections for star patterns)
    for (let i = 0; i < outerPoints; i++) {
        // Star pattern 1 (Skip 3)
        const next = (i + 4) % outerPoints;
        lines.push(
            <line
                key={`outer-${i}`}
                x1={outerVertices[i].x}
                y1={outerVertices[i].y}
                x2={outerVertices[next].x}
                y2={outerVertices[next].y}
                stroke={THIN_GOLD}
                strokeWidth="0.5"
                opacity="0.5"
            />
        );
        // Star pattern 2 (Skip 4)
        const next2 = (i + 5) % outerPoints;
        lines.push(
            <line
                key={`outer2-${i}`}
                x1={outerVertices[i].x}
                y1={outerVertices[i].y}
                x2={outerVertices[next2].x}
                y2={outerVertices[next2].y}
                stroke={THIN_GOLD}
                strokeWidth="0.5"
                opacity="0.3"
            />
        );
    }

    // Connect outer to inner rings
    for (let i = 0; i < outerPoints; i++) {
        const innerIdx = Math.floor(i / 2);
        lines.push(
             <line
                key={`connect-${i}`}
                x1={outerVertices[i].x}
                y1={outerVertices[i].y}
                x2={innerVertices[innerIdx].x}
                y2={innerVertices[innerIdx].y}
                stroke={THIN_GOLD}
                strokeWidth="0.5"
                opacity="0.4"
             />
        );
    }

    // Inner hexagram geometry
    const innerHex = [];
    for(let i=0; i<innerPoints; i++) {
        const next = (i + 2) % innerPoints; // Connect to skip 1 -> two large triangles
         innerHex.push(
            <line
                key={`inner-${i}`}
                x1={innerVertices[i].x}
                y1={innerVertices[i].y}
                x2={innerVertices[next].x}
                y2={innerVertices[next].y}
                stroke={GOLD}
                strokeWidth="1"
            />
         );
    }

    return (
        <g>
            {lines}
            {innerHex}
            
            {/* Small nodes on outer vertices */}
            {outerVertices.map((v, i) => (
                <circle key={`ov-${i}`} cx={v.x} cy={v.y} r="2" fill={GOLD} />
            ))}
             {/* Small animated nodes on inner vertices */}
            {innerVertices.map((v, i) => (
                <motion.circle 
                    key={`iv-${i}`} 
                    cx={v.x} cy={v.y} r="3" 
                    fill={DARK_BLUE} stroke={GOLD} strokeWidth="1"
                    animate={{ r: [2, 4, 2], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />
            ))}
        </g>
    );
  };

  return (
    <motion.div
      className="relative w-full h-full flex items-center justify-center pointer-events-none select-none"
      animate={{ 
        scale: active ? 1.05 : 1, 
        filter: active ? "brightness(1.5) drop-shadow(0 0 10px rgba(222, 200, 136, 0.5))" : "brightness(1)" 
      }}
      transition={{ duration: 1.5 }}
    >
        {/* --- RECTANGULAR FRAME (HTML/CSS) --- */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-4 md:inset-8 border-2 border-[#dec888] z-0"
        >
             {/* Inner thin border */}
             <div className="absolute inset-2 border border-[rgba(222,200,136,0.5)]"></div>

             {/* Corner Decorations */}
             {[0, 90, 180, 270].map((rotation, i) => (
                 <div 
                    key={i} 
                    className="absolute w-12 h-12"
                    style={{ 
                        top: rotation === 180 || rotation === 270 ? 'auto' : '-6px',
                        bottom: rotation === 180 || rotation === 270 ? '-6px' : 'auto',
                        left: rotation === 90 || rotation === 180 ? 'auto' : '-6px',
                        right: rotation === 90 || rotation === 180 ? '-6px' : 'auto',
                        transform: `rotate(${rotation}deg)`
                    }}
                 >
                     <svg viewBox="0 0 48 48" className="w-full h-full text-[#dec888]">
                        <path d="M 2 12 L 2 2 L 12 2 M 6 18 L 18 6" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="2" cy="2" r="3" fill="#dec888"/>
                     </svg>
                 </div>
             ))}
        </motion.div>

      {/* --- CENTRAL CIRCULAR ASTROLABE (SVG) --- */}
      <svg
        width="800"
        height="800"
        viewBox="-420 -420 840 840"
        className="w-[92vmin] h-[92vmin] z-10"
        style={{ overflow: "visible" }}
      >
        {/* --- ROTATING GROUP START --- */}
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}>
            
            {/* Outer Static-ish Rings */}
            <circle cx="0" cy="0" r="380" fill="none" stroke={GOLD} strokeWidth="2" />
            <circle cx="0" cy="0" r="340" fill="none" stroke={GOLD} strokeWidth="2" />
            
            {/* The Text Ring Content */}
            {createTextRing(360, 180)}
            
            {/* Runes/Glyphs scattered inside the next ring */}
            <g transform="rotate(15)">
                {createTextRing(320, 90)}
            </g>

            {/* Cardinal Elements */}
            {createCardinalCircles(265)}
            {/* Square rotated 45 degrees */}
            <rect x="-187" y="-187" width="374" height="374" fill="none" stroke={THIN_GOLD} strokeWidth="1" transform="rotate(45)" />
            {/* Square rotated 0 degrees */}
            <rect x="-187" y="-187" width="374" height="374" fill="none" stroke={THIN_GOLD} strokeWidth="1" transform="rotate(0)" />

            {/* Intercardinal Details */}
            {createIntercardinalDetails(265)}

            {/* Inner Ring Boundary */}
            <circle cx="0" cy="0" r="190" fill="none" stroke={GOLD} strokeWidth="2" />
            
            {/* 12-pointed star shape base */}
            {Array.from({length: 12}).map((_, i) => (
                <path 
                    key={i}
                    d="M 0 -190 L 0 -100" 
                    stroke={GOLD} 
                    strokeWidth="1"
                    transform={`rotate(${i * 30})`} 
                />
            ))}

            {/* --- NEW: Orbiting Elements --- */}
            
            {/* Orbital Path 1 */}
            <circle cx="0" cy="0" r="140" fill="none" stroke={THIN_GOLD} strokeWidth="0.5" strokeDasharray="5 5" opacity="0.5" />
            {/* Fast Moon (Clockwise) */}
            <motion.g animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                 <circle cx="0" cy="-140" r="5" fill={DARK_BLUE} stroke={GOLD} strokeWidth="1" />
                 <circle cx="0" cy="-140" r="8" fill="none" stroke={THIN_GOLD} strokeWidth="0.5" />
            </motion.g>

            {/* Orbital Path 2 */}
            <circle cx="0" cy="0" r="110" fill="none" stroke={THIN_GOLD} strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />
            {/* Slower Planet (Counter-Clockwise) */}
            <motion.g animate={{ rotate: -360 }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }}>
                 <g transform="translate(0, 110)">
                    <rect x="-4" y="-4" width="8" height="8" fill={GOLD} transform="rotate(45)" />
                 </g>
            </motion.g>

            {/* --- END New Orbitals --- */}

            {/* Central Web (Enhanced) */}
            {createCentralWeb()}
            
            {/* Center Core */}
            <circle cx="0" cy="0" r="40" fill={DARK_BLUE} stroke={GOLD} strokeWidth="2" />
            {/* Hexagram in very center */}
            <polygon points="0,-30 26,15 -26,15" fill="none" stroke={GOLD} strokeWidth="1.5" />
            <polygon points="0,30 26,-15 -26,-15" fill="none" stroke={GOLD} strokeWidth="1.5" />
            
            {/* Central Point */}
            <circle cx="0" cy="0" r="5" fill={GOLD} />
            
            {/* Decorative small circles on the outer web vertices */}
            {Array.from({length: 12}).map((_, i) => (
                 <circle 
                    key={i} 
                    cx={Math.cos(i * Math.PI / 6) * 160} 
                    cy={Math.sin(i * Math.PI / 6) * 160} 
                    r="3" 
                    fill={GOLD} 
                 />
            ))}

        </motion.g>
        {/* --- ROTATING GROUP END --- */}

        {/* --- STATIC OVERLAYS --- */}
        <line x1="0" y1="-410" x2="0" y2="410" stroke={THIN_GOLD} strokeDasharray="10 10" />
        <line x1="-410" y1="0" x2="410" y2="0" stroke={THIN_GOLD} strokeDasharray="10 10" />

        {/* Active Effect: Energy flare */}
        {active && (
            <motion.circle 
                cx="0" cy="0" r="150" 
                fill="none" stroke={GOLD} strokeWidth="2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 0], scale: 1.5, strokeWidth: [2, 10, 2] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        )}

      </svg>
    </motion.div>
  );
};

export default Astrolabe;