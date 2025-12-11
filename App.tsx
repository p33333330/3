import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StarBackground from './components/StarBackground';
import Astrolabe from './components/Astrolabe';
import GestureController from './components/GestureController';
import MysticBook from './components/MysticBook';
import GameController from './components/GameController';
import { getCosmicReading } from './services/geminiService';
import { AppState, AppMode, Reading } from './types';
import { Sparkles, Gamepad2, Eye } from 'lucide-react';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.ORACLE);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [reading, setReading] = useState<Reading | null>(null);

  // Auto-start scanning on mount
  useEffect(() => {
    if (appMode === AppMode.ORACLE) {
      setAppState(AppState.SCANNING);
    }
  }, [appMode]);

  const handleGestureDetected = useCallback(async (gesture: string) => {
    // Only react to gesture if in scanning mode
    if (appMode === AppMode.ORACLE && appState === AppState.SCANNING && gesture === "CLOSED_FIST") {
      setAppState(AppState.OPENING);
      
      // Fetch reading from Gemini
      const cosmicResult = await getCosmicReading();
      setReading(cosmicResult);
      
      // Delay slightly for dramatic effect before showing book fully
      setTimeout(() => {
        setAppState(AppState.REVEALED);
      }, 1200);
    }
  }, [appState, appMode]);

  const handleReset = () => {
    setAppState(AppState.SCANNING);
    setReading(null);
  };

  return (
    <div className="relative w-full h-screen text-[#F0E6D2] overflow-hidden">
      <StarBackground />

      {/* Mode Switcher UI */}
      <div className="absolute top-0 left-0 w-full z-50 p-4 flex justify-between items-start pointer-events-none">
         <div /> {/* Spacer */}
         <div className="flex gap-2 bg-[#050a14]/60 backdrop-blur-md border border-[#C5B358]/30 rounded-full p-1 pointer-events-auto">
            <button 
              onClick={() => {
                setAppMode(AppMode.ORACLE);
                setAppState(AppState.SCANNING);
                setReading(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${appMode === AppMode.ORACLE ? 'bg-[#C5B358] text-[#050a14]' : 'text-[#C5B358] hover:bg-[#C5B358]/10'}`}
            >
               <Eye size={16} /> <span className="font-serif text-sm tracking-wide">ORACLE</span>
            </button>
            <button 
              onClick={() => setAppMode(AppMode.GAME)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${appMode === AppMode.GAME ? 'bg-[#C5B358] text-[#050a14]' : 'text-[#C5B358] hover:bg-[#C5B358]/10'}`}
            >
               <Gamepad2 size={16} /> <span className="font-serif text-sm tracking-wide">TRIALS</span>
            </button>
         </div>
      </div>
      
      {/* --- MODE: ORACLE --- */}
      {appMode === AppMode.ORACLE && (
        <>
          {/* Gesture Controller (Webcam) - Only active in Oracle Mode */}
          <GestureController 
            onGestureDetected={handleGestureDetected} 
            isActive={appState === AppState.SCANNING}
          />

          {/* Main Content Layer */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            
            {/* Title / Instructions */}
            <AnimatePresence>
              {appState === AppState.SCANNING && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-20 text-center z-30 pointer-events-none"
                >
                  <h1 className="text-4xl md:text-6xl font-serif text-[#C5B358] tracking-[0.2em] mb-4 drop-shadow-[0_0_10px_rgba(197,179,88,0.5)]">ASTROLABE</h1>
                  <div className="flex items-center justify-center gap-2 text-sm md:text-lg text-[#F0E6D2] opacity-80 font-serif">
                    <Sparkles size={16} className="text-[#C5B358]" />
                    <span className="tracking-wider">HOLD "CLOSED FIST" TO SUMMON THE BOOK</span>
                    <Sparkles size={16} className="text-[#C5B358]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Astrolabe */}
            <AnimatePresence>
              {(appState === AppState.SCANNING || appState === AppState.OPENING) && (
                  <motion.div
                    exit={{ opacity: 0, scale: 2, filter: "blur(20px)" }}
                    transition={{ duration: 1.0, ease: "easeInOut" }}
                    className="absolute inset-0 z-20 flex items-center justify-center"
                  >
                    <Astrolabe active={appState === AppState.OPENING} />
                  </motion.div>
              )}
            </AnimatePresence>

            {/* Flash of Light Transition */}
            <AnimatePresence>
              {appState === AppState.OPENING && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, times: [0, 0.4, 1] }}
                  className="fixed inset-0 bg-[#F0E6D2] z-50 pointer-events-none mix-blend-overlay"
                />
              )}
            </AnimatePresence>

            {/* The Mystic Book */}
            <AnimatePresence>
              {appState === AppState.REVEALED && (
                <MysticBook reading={reading} onReset={handleReset} />
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* --- MODE: GAME --- */}
      {appMode === AppMode.GAME && (
        <GameController />
      )}
      
    </div>
  );
};

export default App;