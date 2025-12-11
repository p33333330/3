import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StarBackground from './components/StarBackground';
import Astrolabe from './components/Astrolabe';
import GestureController from './components/GestureController';
import MysticBook from './components/MysticBook';
import MysticArtifact from './components/MysticArtifact';
import MysticZodiacWhite from './components/MysticZodiacWhite';
import MysticZodiacGold from './components/MysticZodiacGold';
import GameController from './components/GameController';
import { getCosmicReading } from './services/geminiService';
import { AppState, AppMode, Reading, RevealType } from './types';
import { Sparkles, Gamepad2, Eye, Volume2, VolumeX } from 'lucide-react';
import CosmicExplosion from './components/CosmicExplosion';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.ORACLE);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [reading, setReading] = useState<Reading | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [revealType, setRevealType] = useState<RevealType>(RevealType.BOOK);
  const [isExploding, setIsExploding] = useState(false);

  // --- AUDIO ENGINE ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientNodesRef = useRef<{ osc1: OscillatorNode, osc2: OscillatorNode, gain: GainNode } | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playModeChime = useCallback(() => {
    if (!soundEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Bell-like envelope
    const now = ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.1); // Slide up slightly (C6)
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
    
    osc.start(now);
    osc.stop(now + 2);
  }, [soundEnabled]);

  const playLockSound = useCallback(() => {
    if (!soundEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Sharp magical "click"
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc.start(now);
    osc.stop(now + 0.2);
  }, [soundEnabled]);

  const playCatchSound = useCallback(() => {
    if (!soundEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Magical high-pitched "sparkle" ping
    // Randomize pitch slightly to avoid fatigue
    const baseFreq = 880 + Math.random() * 200; 

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2, now + 0.1);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
  }, [soundEnabled]);

  const playMissSound = useCallback(() => {
    if (!soundEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Dissonant low tone for miss
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.start(now);
    osc.stop(now + 0.4);
  }, [soundEnabled]);

  const playRevealSound = useCallback(() => {
    if (!soundEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    // 1. Low thrum/swell
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(50, now);
    osc.frequency.linearRampToValueAtTime(100, now + 1);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.5);
    gain.gain.linearRampToValueAtTime(0, now + 1.2);
    
    osc.start(now);
    osc.stop(now + 1.2);

    // 2. High sparkle/noise sweep
    const bufferSize = ctx.sampleRate * 1.5; // 1.5 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    const noiseGain = ctx.createGain();

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseFilter.frequency.setValueAtTime(200, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(5000, now + 1); // Sweep up

    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.05, now + 0.5);
    noiseGain.gain.linearRampToValueAtTime(0, now + 1.5);

    noise.start(now);
  }, [soundEnabled]);

  const playExplosionSound = useCallback(() => {
    if (!soundEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    // SHATTER Sound
    
    // 1. White Noise Crack (Highpass)
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    // 2. Metal/Glass Debris (Random high frequency pings)
    for (let i = 0; i < 5; i++) {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        
        const freq = 1200 + Math.random() * 2000;
        const startTime = now + Math.random() * 0.2;
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        oscGain.gain.setValueAtTime(0, startTime);
        oscGain.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
        oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
        
        osc.start(startTime);
        osc.stop(startTime + 0.2);
    }
  }, [soundEnabled]);

  const toggleAmbient = useCallback((play: boolean) => {
    if (!soundEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    if (play) {
        if (ambientNodesRef.current) return; // Already playing

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const mainGain = ctx.createGain();

        // Binaural beat drone
        osc1.type = 'sine';
        osc1.frequency.value = 110; // A2
        osc2.type = 'sine';
        osc2.frequency.value = 112; // Slight detune

        osc1.connect(mainGain);
        osc2.connect(mainGain);
        mainGain.connect(ctx.destination);

        const now = ctx.currentTime;
        mainGain.gain.setValueAtTime(0, now);
        mainGain.gain.linearRampToValueAtTime(0.03, now + 3); // Slow fade in

        osc1.start(now);
        osc2.start(now);

        ambientNodesRef.current = { osc1, osc2, gain: mainGain };
    } else {
        if (!ambientNodesRef.current) return;
        const { osc1, osc2, gain } = ambientNodesRef.current;
        const now = ctx.currentTime;
        
        // Fade out
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + 1.5);

        setTimeout(() => {
            osc1.stop();
            osc2.stop();
        }, 1600);
        
        ambientNodesRef.current = null;
    }
  }, [soundEnabled]);

  // Handle ambient sound based on AppState
  useEffect(() => {
    if (appMode === AppMode.ORACLE && !isExploding && (appState === AppState.SCANNING || appState === AppState.OPENING)) {
        toggleAmbient(true);
    } else {
        toggleAmbient(false);
    }
  }, [appMode, appState, toggleAmbient, isExploding]);

  // Handle sound toggle
  useEffect(() => {
     if (!soundEnabled) {
         toggleAmbient(false);
         if (audioCtxRef.current) {
             audioCtxRef.current.suspend();
         }
     } else {
         if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
             audioCtxRef.current.resume();
         }
         if (appMode === AppMode.ORACLE && appState === AppState.SCANNING && !isExploding) {
             toggleAmbient(true);
         }
     }
  }, [soundEnabled, appMode, appState, toggleAmbient, isExploding]);


  // Auto-start scanning on mount
  useEffect(() => {
    if (appMode === AppMode.ORACLE) {
      setAppState(AppState.SCANNING);
    }
  }, [appMode]);

  const handleGestureDetected = useCallback(async (gesture: string) => {
    // 1. OPEN PALM - Reset / Shatter (Available in REVEALED state)
    if (appMode === AppMode.ORACLE && appState === AppState.REVEALED && gesture === "OPEN_PALM") {
        playExplosionSound(); // Plays Shatter sound
        setIsExploding(true);
        return;
    }

    // 2. CLOSED FIST - Reveal Prophecy (Available in SCANNING state)
    if (appMode === AppMode.ORACLE && appState === AppState.SCANNING && gesture === "CLOSED_FIST") {
      playLockSound(); // Immediate feedback
      setTimeout(playRevealSound, 150); // Delayed swoosh
      
      setAppState(AppState.OPENING);
      
      // Randomly decide which visual to show (Book, Artifact, Zodiac White, Zodiac Gold)
      const rand = Math.random();
      let nextRevealType;
      if (rand < 0.25) nextRevealType = RevealType.BOOK;
      else if (rand < 0.5) nextRevealType = RevealType.ARTIFACT;
      else if (rand < 0.75) nextRevealType = RevealType.ZODIAC_WHITE;
      else nextRevealType = RevealType.ZODIAC_GOLD;
      
      setRevealType(nextRevealType);

      // Fetch reading from Gemini
      const cosmicResult = await getCosmicReading();
      setReading(cosmicResult);
      
      // Delay slightly for dramatic effect before showing book fully
      setTimeout(() => {
        setAppState(AppState.REVEALED);
      }, 500);
    }
  }, [appState, appMode, playRevealSound, playLockSound, playExplosionSound]);

  const handleExplosionComplete = () => {
    setIsExploding(false);
    handleReset();
  };

  const handleReset = () => {
    initAudio(); // Ensure audio is ready if user hasn't interacted yet
    setAppState(AppState.SCANNING);
    setReading(null);
  };

  const renderRevealedContent = () => {
      switch (revealType) {
          case RevealType.BOOK:
              return <MysticBook reading={reading} onReset={handleReset} />;
          case RevealType.ARTIFACT:
              return <MysticArtifact reading={reading} onReset={handleReset} />;
          case RevealType.ZODIAC_WHITE:
              return <MysticZodiacWhite reading={reading} onReset={handleReset} />;
          case RevealType.ZODIAC_GOLD:
              return <MysticZodiacGold reading={reading} onReset={handleReset} />;
          default:
              return <MysticBook reading={reading} onReset={handleReset} />;
      }
  };

  return (
    <div className="relative w-full h-screen text-[#F0E6D2] overflow-hidden" onClick={initAudio}>
      <StarBackground />
      
      {isExploding && <CosmicExplosion onComplete={handleExplosionComplete} />}

      {/* Mode Switcher UI */}
      {!isExploding && (
        <div className="absolute top-0 left-0 w-full z-50 p-4 flex justify-between items-start pointer-events-none">
            <div className="pointer-events-auto">
                <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-2 rounded-full bg-[#050a14]/60 text-[#C5B358] border border-[#C5B358]/30 hover:bg-[#C5B358]/10 transition-colors"
                    title={soundEnabled ? "Mute" : "Unmute"}
                >
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
            </div>
            <div className="flex gap-2 bg-[#050a14]/60 backdrop-blur-md border border-[#C5B358]/30 rounded-full p-1 pointer-events-auto">
                <button 
                onClick={() => {
                    initAudio();
                    playModeChime();
                    setAppMode(AppMode.ORACLE);
                    setAppState(AppState.SCANNING);
                    setReading(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${appMode === AppMode.ORACLE ? 'bg-[#C5B358] text-[#050a14]' : 'text-[#C5B358] hover:bg-[#C5B358]/10'}`}
                >
                <Eye size={16} /> <span className="font-serif text-sm tracking-wide">ORACLE</span>
                </button>
                <button 
                onClick={() => {
                    initAudio();
                    setAppMode(AppMode.GAME);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${appMode === AppMode.GAME ? 'bg-[#C5B358] text-[#050a14]' : 'text-[#C5B358] hover:bg-[#C5B358]/10'}`}
                >
                <Gamepad2 size={16} /> <span className="font-serif text-sm tracking-wide">TRIALS</span>
                </button>
            </div>
        </div>
      )}
      
      {/* --- MODE: ORACLE --- */}
      {appMode === AppMode.ORACLE && !isExploding && (
        <>
          {/* Gesture Controller (Webcam) */}
          <GestureController 
            onGestureDetected={handleGestureDetected} 
            isActive={true}
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
                  className="absolute top-8 text-center z-30 pointer-events-none"
                >
                  <h1 className="text-4xl md:text-6xl font-serif text-[#C5B358] tracking-[0.2em] mb-4 drop-shadow-[0_0_10px_rgba(197,179,88,0.5)]">ASTROLABE</h1>
                  <div className="flex items-center justify-center gap-2 text-sm md:text-lg text-[#F0E6D2] opacity-80 font-serif">
                     <Sparkles size={16} className="text-[#C5B358]" />
                     <span className="tracking-wider">FIST: SUMMON</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Astrolabe */}
            <AnimatePresence>
              {(appState === AppState.SCANNING || appState === AppState.OPENING) && (
                  <motion.div
                    exit={{ opacity: 0, scale: 2, filter: "blur(20px)" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
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
                  transition={{ duration: 0.6, times: [0, 0.4, 1] }} 
                  className="fixed inset-0 bg-[#F0E6D2] z-50 pointer-events-none mix-blend-overlay"
                />
              )}
            </AnimatePresence>

            {/* The Result: Book, Artifact, or Zodiacs */}
            <AnimatePresence>
              {appState === AppState.REVEALED && renderRevealedContent()}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* --- MODE: GAME --- */}
      {appMode === AppMode.GAME && !isExploding && (
        <GameController onCatch={playCatchSound} onMiss={playMissSound} />
      )}
      
    </div>
  );
};

export default App;