import React, { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { Play, RotateCcw, Skull } from 'lucide-react';

const EMOJIS = ['🌟', '🌙', '☀️', '🪐', '☄️', '🔮', '✨', '🧿'];
const SPAWN_RATE = 60; // Frames between spawns
const GRAVITY_SPEED = 3; // Base falling speed

interface GameItem {
  id: number;
  x: number;
  y: number;
  emoji: string;
  speed: number;
}

const GameController: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'GAMEOVER'>('READY');
  const [score, setScore] = useState(0);
  
  // Refs for game loop to avoid re-renders
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  const itemsRef = useRef<GameItem[]>([]);
  const headPosRef = useRef<{x: number, y: number} | null>(null);
  const frameCountRef = useRef(0);
  const scoreRef = useRef(0);
  const gameStateRef = useRef<'READY' | 'PLAYING' | 'GAMEOVER'>('READY');

  useEffect(() => {
    const initFaceLandmarker = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        
        landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: false,
          runningMode: "VIDEO",
          numFaces: 1
        });
        
        setLoading(false);
        startCamera();
      } catch (error) {
        console.error("Failed to load FaceLandmarker:", error);
      }
    };

    initFaceLandmarker();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: "user" } 
      });
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener('loadeddata', startGameLoop);
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    cancelAnimationFrame(requestRef.current);
  };

  const startGame = () => {
    setScore(0);
    scoreRef.current = 0;
    itemsRef.current = [];
    setGameState('PLAYING');
    gameStateRef.current = 'PLAYING';
  };

  const startGameLoop = () => {
    const loop = () => {
      update();
      draw();
      requestRef.current = requestAnimationFrame(loop);
    };
    loop();
  };

  const update = () => {
    if (!landmarkerRef.current || !videoRef.current || !canvasRef.current) return;
    
    // 1. Detect Face
    if (videoRef.current.currentTime > 0 && !videoRef.current.paused && !videoRef.current.ended) {
      const startTimeMs = performance.now();
      const result = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

      if (result.faceLandmarks.length > 0) {
        // Landmark 1 is usually the nose tip
        const nose = result.faceLandmarks[0][1];
        // Mirror the x coordinate because webcam is usually mirrored
        headPosRef.current = {
            x: (1 - nose.x) * canvasRef.current.width, 
            y: nose.y * canvasRef.current.height
        };
      } else {
        headPosRef.current = null;
      }
    }

    if (gameStateRef.current !== 'PLAYING') return;

    // 2. Spawn Items
    frameCountRef.current++;
    if (frameCountRef.current % Math.max(20, SPAWN_RATE - Math.floor(scoreRef.current / 5)) === 0) {
      const canvas = canvasRef.current;
      itemsRef.current.push({
        id: Date.now(),
        x: Math.random() * (canvas.width - 50) + 25,
        y: -50,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        speed: GRAVITY_SPEED + (scoreRef.current * 0.1)
      });
    }

    // 3. Update Items & Check Collisions
    const head = headPosRef.current;
    const itemsToRemove: number[] = [];

    itemsRef.current.forEach(item => {
      item.y += item.speed;

      // Check Collision with Head (simple circle collision)
      if (head) {
        const dx = head.x - item.x;
        const dy = head.y - item.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Catch threshold (radius sum approx)
        if (distance < 60) {
          scoreRef.current += 1;
          setScore(scoreRef.current);
          itemsToRemove.push(item.id);
        }
      }

      // Check Floor (Game Over condition)
      if (item.y > canvasRef.current.height) {
        setGameState('GAMEOVER');
        gameStateRef.current = 'GAMEOVER';
      }
    });

    itemsRef.current = itemsRef.current.filter(i => !itemsToRemove.includes(i.id));
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ensure canvas matches window size
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Head Cursor (The "Basket")
    if (headPosRef.current) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#C5B358';
        ctx.strokeStyle = '#C5B358';
        ctx.lineWidth = 3;
        
        // Draw a mystical circle/rune at nose position
        ctx.beginPath();
        ctx.arc(headPosRef.current.x, headPosRef.current.y, 40, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner detail
        ctx.beginPath();
        ctx.arc(headPosRef.current.x, headPosRef.current.y, 30, 0, Math.PI * 2);
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.shadowBlur = 0;
    }

    // Draw Items
    ctx.font = "40px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    itemsRef.current.forEach(item => {
      ctx.fillText(item.emoji, item.x, item.y);
    });

    // Draw Game Over Overlay in Canvas? No, handle in React UI for better buttons.
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center">
        {/* Hidden Video Source */}
        <video 
            ref={videoRef} 
            className="hidden" 
            autoPlay 
            playsInline 
            muted 
        />
        
        {/* Game Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* UI Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center">
            
            {/* HUD */}
            <div className="mt-20 flex gap-8">
                 <div className="bg-black/40 border border-[#C5B358] px-6 py-2 rounded-full backdrop-blur-sm text-[#F0E6D2] font-serif text-2xl">
                    SCORE: <span className="text-[#C5B358] font-bold">{score}</span>
                 </div>
            </div>

            {/* Screens */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md">
                    <p className="text-[#C5B358] animate-pulse font-serif text-xl">Attuning Cosmic Vision...</p>
                </div>
            )}

            {!loading && gameState === 'READY' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
                    <div className="text-center p-8 border-2 border-[#C5B358] bg-[#050a14]/90 rounded-lg max-w-md shadow-[0_0_50px_rgba(197,179,88,0.3)]">
                        <h2 className="text-3xl font-serif text-[#F0E6D2] mb-4">Cosmic Catch</h2>
                        <p className="text-[#F0E6D2]/80 mb-8 font-serif">
                            Move your head to catch the falling celestial fragments.
                            <br/><br/>
                            <span className="text-red-400">WARNING:</span> If a single star falls to the abyss, the connection breaks.
                        </p>
                        <button 
                            onClick={startGame}
                            className="group relative px-8 py-3 bg-[#C5B358]/10 border border-[#C5B358] hover:bg-[#C5B358] transition-all duration-300"
                        >
                            <span className="flex items-center gap-2 text-[#C5B358] group-hover:text-[#050a14] font-serif tracking-widest uppercase">
                                <Play size={20} fill="currentColor" /> Begin
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {!loading && gameState === 'GAMEOVER' && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-950/40 backdrop-blur-sm pointer-events-auto">
                    <div className="text-center p-8 border-2 border-red-500/50 bg-[#050a14]/90 rounded-lg max-w-md shadow-[0_0_50px_rgba(255,0,0,0.2)]">
                        <Skull className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-4xl font-serif text-red-500 mb-2">Connection Lost</h2>
                        <p className="text-[#F0E6D2] font-serif text-xl mb-6">Final Score: {score}</p>
                        <button 
                            onClick={startGame}
                            className="group px-8 py-3 bg-red-500/10 border border-red-500 hover:bg-red-500 transition-all duration-300"
                        >
                            <span className="flex items-center gap-2 text-red-500 group-hover:text-white font-serif tracking-widest uppercase">
                                <RotateCcw size={20} /> Realign
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default GameController;