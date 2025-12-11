import React, { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { Play, RotateCcw, Skull, ScanFace } from 'lucide-react';
import GameBackground from './GameBackground';
import { motion } from 'framer-motion';

const EMOJIS = ['🌟', '🌙', '☀️', '🪐', '☄️', '🔮', '✨', '🧿'];
const SPAWN_RATE = 60; // Frames between spawns
const GRAVITY_SPEED = 4; // Base falling speed

interface GameItem {
  id: number;
  x: number;
  y: number;
  emoji: string;
  speed: number;
}

interface GameControllerProps {
  onCatch?: () => void;
  onMiss?: () => void;
}

const GameController: React.FC<GameControllerProps> = ({ onCatch, onMiss }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'GAMEOVER'>('READY');
  const [score, setScore] = useState(0);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isMilestone, setIsMilestone] = useState(false);
  
  // Refs for game loop to avoid re-renders
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  const itemsRef = useRef<GameItem[]>([]);
  const headPosRef = useRef<{x: number, y: number} | null>(null);
  const faceBoundsRef = useRef<{top: {x:number, y:number}, bottom: {x:number, y:number}, left: {x:number, y:number}, right: {x:number, y:number}} | null>(null);
  const frameCountRef = useRef(0);
  const scoreRef = useRef(0);
  const gameStateRef = useRef<'READY' | 'PLAYING' | 'GAMEOVER'>('READY');
  const isFaceDetectedRef = useRef(false);
  
  // Particles for catch effect
  const particlesRef = useRef<{x: number, y: number, vx: number, vy: number, life: number, color: string}[]>([]);

  useEffect(() => {
    let isMounted = true;
    let landmarkerInstance: FaceLandmarker | null = null;

    const initFaceLandmarker = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
        );
        
        if (!isMounted) return;

        landmarkerInstance = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: false,
          runningMode: "VIDEO",
          numFaces: 1
        });
        
        if (!isMounted) {
            landmarkerInstance.close();
            return;
        }

        landmarkerRef.current = landmarkerInstance;
        setLoading(false);
        startCamera();
      } catch (error) {
        console.error("Failed to load FaceLandmarker:", error);
      }
    };

    initFaceLandmarker();

    return () => {
      isMounted = false;
      stopCamera();
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, []);

  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      // Small delay to ensure previous camera session is fully released
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
    if (!isFaceDetectedRef.current) return;
    setScore(0);
    scoreRef.current = 0;
    itemsRef.current = [];
    particlesRef.current = [];
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

  const spawnParticles = (x: number, y: number, color: string = '#C5B358') => {
    for (let i = 0; i < 15; i++) {
        particlesRef.current.push({
            x, y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            life: 1.0,
            color: color
        });
    }
  };

  const update = () => {
    if (!landmarkerRef.current || !videoRef.current || !canvasRef.current) return;
    
    // 1. Detect Face
    // Check if video is actually ready
    if (videoRef.current.currentTime > 0 && !videoRef.current.paused && !videoRef.current.ended) {
      const startTimeMs = performance.now();
      const result = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

      if (result.faceLandmarks.length > 0) {
        const landmarks = result.faceLandmarks[0];
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;

        // Landmark 1 is the nose tip
        const nose = landmarks[1];
        
        // Mirror X for user-facing camera feel
        headPosRef.current = {
            x: (1 - nose.x) * width, 
            y: nose.y * height
        };

        // Capture Diamond Points for UI
        faceBoundsRef.current = {
            top: { x: (1 - landmarks[10].x) * width, y: landmarks[10].y * height },
            bottom: { x: (1 - landmarks[152].x) * width, y: landmarks[152].y * height },
            left: { x: (1 - landmarks[234].x) * width, y: landmarks[234].y * height },
            right: { x: (1 - landmarks[454].x) * width, y: landmarks[454].y * height }
        };

        if (!isFaceDetectedRef.current) {
            isFaceDetectedRef.current = true;
            setIsFaceDetected(true);
        }
      } else {
        headPosRef.current = null;
        faceBoundsRef.current = null;
        if (isFaceDetectedRef.current) {
            isFaceDetectedRef.current = false;
            setIsFaceDetected(false);
        }
      }
    }

    // 2. Update Particles (Always update particles for visual effects even in Game Over)
    particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    if (gameStateRef.current !== 'PLAYING') return;

    // 3. Spawn Items
    frameCountRef.current++;
    // Increase difficulty: spawn faster as score goes up
    const currentSpawnRate = Math.max(20, SPAWN_RATE - Math.floor(scoreRef.current * 0.8));
    
    if (frameCountRef.current % currentSpawnRate === 0) {
      const canvas = canvasRef.current;
      itemsRef.current.push({
        id: Date.now(),
        x: Math.random() * (canvas.width - 60) + 30,
        y: -50,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        speed: GRAVITY_SPEED + (scoreRef.current * 0.2)
      });
    }

    // 4. Update Items & Check Collisions
    const head = headPosRef.current;
    const itemsToRemove: number[] = [];
    const canvas = canvasRef.current;
    
    // Responsive Hit Radius: 8% of the smaller screen dimension
    const hitRadius = Math.min(canvas.width, canvas.height) * 0.08;

    itemsRef.current.forEach(item => {
      item.y += item.speed;

      // Check Collision with Head
      if (head) {
        const dx = head.x - item.x;
        const dy = head.y - item.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < hitRadius) {
          scoreRef.current += 1;
          setScore(scoreRef.current); // State update for UI
          
          // Milestone check
          if (scoreRef.current % 10 === 0 && scoreRef.current > 0) {
            setIsMilestone(true);
            setTimeout(() => setIsMilestone(false), 1000);
          }

          spawnParticles(item.x, item.y, '#C5B358');
          if (onCatch) onCatch(); // Play Sound
          itemsToRemove.push(item.id);
        }
      }

      // Check Floor (Game Over condition)
      if (item.y > canvasRef.current.height + 20) {
        // VISUAL FEEDBACK: Spawn Red Particles
        spawnParticles(item.x, canvasRef.current.height - 20, '#ef4444');
        // SOUND FEEDBACK
        if (onMiss) onMiss();

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

    // Responsive sizing
    const minDim = Math.min(canvas.width, canvas.height);
    const hitRadius = minDim * 0.08;

    // Draw Head Tracking Visuals
    if (headPosRef.current && faceBoundsRef.current) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#C5B358';
        ctx.strokeStyle = 'rgba(197, 179, 88, 0.4)';
        ctx.lineWidth = 1;
        
        // Draw Mystical Face Diamond (Subtle)
        const { top, bottom, left, right } = faceBoundsRef.current;
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(left.x, left.y);
        ctx.lineTo(bottom.x, bottom.y);
        ctx.lineTo(right.x, right.y);
        ctx.closePath();
        ctx.stroke();

        // Draw The "Basket" / Catcher
        const headX = headPosRef.current.x;
        const headY = headPosRef.current.y;

        ctx.beginPath();
        ctx.arc(headX, headY, hitRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#C5B358';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Inner Glow
        const gradient = ctx.createRadialGradient(headX, headY, 0, headX, headY, hitRadius);
        gradient.addColorStop(0, 'rgba(197, 179, 88, 0.3)');
        gradient.addColorStop(1, 'rgba(197, 179, 88, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }

    // Draw Items
    ctx.font = `${minDim * 0.08}px serif`; // Responsive font size
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    itemsRef.current.forEach(item => {
      ctx.fillText(item.emoji, item.x, item.y);
    });

    // Draw Particles
    particlesRef.current.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#050a14]">
        
        {/* --- DYNAMIC BACKGROUND --- */}
        <GameBackground score={score} />

        {/* 
           CRITICAL FIX: Use opacity-0 instead of hidden. 
           'display: none' (hidden) stops the video element from updating in some browsers, 
           killing the MediaPipe tracking loop. 
        */}
        <video 
            ref={videoRef} 
            className="absolute opacity-0 pointer-events-none" 
            autoPlay 
            playsInline 
            muted 
        />
        
        {/* Game Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />

        {/* UI Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center z-20">
            
            {/* HUD */}
            <div className="mt-20 flex gap-8">
                 <motion.div 
                   animate={isMilestone ? { scale: [1, 1.2, 1], borderColor: ['#C5B358', '#fff', '#C5B358'] } : {}}
                   transition={{ duration: 0.5 }}
                   className="bg-black/40 border border-[#C5B358] px-6 py-2 rounded-full backdrop-blur-sm text-[#F0E6D2] font-serif text-2xl animate-in fade-in slide-in-from-top-4 shadow-lg"
                 >
                    SCORE: <span className="text-[#C5B358] font-bold">{score}</span>
                 </motion.div>
            </div>

            {/* Screens */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md">
                    <p className="text-[#C5B358] animate-pulse font-serif text-xl">Attuning Cosmic Vision...</p>
                </div>
            )}

            {!loading && gameState === 'READY' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
                    <div className="text-center p-8 border-2 border-[#C5B358] bg-[#050a14]/90 rounded-lg max-w-md shadow-[0_0_50px_rgba(197,179,88,0.3)] mx-4">
                        <h2 className="text-3xl font-serif text-[#F0E6D2] mb-4">Cosmic Catch</h2>
                        <p className="text-[#F0E6D2]/80 mb-6 font-serif">
                            Align your face within the frame.
                            <br/>
                            Catch the falling stars with the golden circle.
                            <br/>
                            <span className="text-red-400 text-sm">Do not let them fall.</span>
                        </p>
                        
                        {/* Status Indicator */}
                        <div className={`mb-8 flex items-center justify-center gap-2 font-serif text-sm tracking-widest uppercase transition-colors duration-300 ${isFaceDetected ? 'text-green-400' : 'text-red-400'}`}>
                            {isFaceDetected ? (
                                <><ScanFace size={18} /> Signal Acquired</>
                            ) : (
                                <><Skull size={18} /> Searching for Pilot...</>
                            )}
                        </div>

                        <button 
                            onClick={startGame}
                            disabled={!isFaceDetected}
                            className={`group relative px-8 py-3 border transition-all duration-300 w-full
                            ${isFaceDetected 
                                ? 'bg-[#C5B358]/10 border-[#C5B358] hover:bg-[#C5B358] cursor-pointer' 
                                : 'bg-gray-900 border-gray-700 cursor-not-allowed opacity-50'}`}
                        >
                            <span className={`flex items-center justify-center gap-2 font-serif tracking-widest uppercase ${isFaceDetected ? 'text-[#C5B358] group-hover:text-[#050a14]' : 'text-gray-500'}`}>
                                <Play size={20} fill={isFaceDetected ? "currentColor" : "none"} /> Begin
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {!loading && gameState === 'GAMEOVER' && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-950/40 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-500">
                    <div className="text-center p-8 border-2 border-red-500/50 bg-[#050a14]/90 rounded-lg max-w-md shadow-[0_0_50px_rgba(255,0,0,0.2)] mx-4">
                        <Skull className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
                        <h2 className="text-4xl font-serif text-red-500 mb-2">Stars Fallen</h2>
                        <p className="text-[#F0E6D2] font-serif text-xl mb-6">Final Score: {score}</p>
                        <button 
                            onClick={startGame}
                            className="group px-8 py-3 bg-red-500/10 border border-red-500 hover:bg-red-500 transition-all duration-300 w-full"
                        >
                            <span className="flex items-center justify-center gap-2 text-red-500 group-hover:text-white font-serif tracking-widest uppercase">
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