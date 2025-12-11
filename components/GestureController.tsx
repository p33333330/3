import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';

interface GestureControllerProps {
  onGestureDetected: (gesture: string) => void;
  isActive: boolean;
}

const GestureController: React.FC<GestureControllerProps> = ({ onGestureDetected, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const frameIdRef = useRef<number>(0);
  const [cameraError, setCameraError] = useState(false);
  
  // Visual feedback state
  const [isFistDetected, setIsFistDetected] = useState(false);

  // Keep refs to avoid stale closures in the requestAnimationFrame loop
  const isActiveRef = useRef(isActive);
  const onGestureDetectedRef = useRef(onGestureDetected);

  useEffect(() => {
    isActiveRef.current = isActive;
    // Reset detection state when becoming inactive
    if (!isActive) {
        setIsFistDetected(false);
    }
  }, [isActive]);

  // Update the callback ref whenever the prop changes
  useEffect(() => {
    onGestureDetectedRef.current = onGestureDetected;
  }, [onGestureDetected]);

  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        
        recognizerRef.current = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        setLoading(false);
        startCamera();
      } catch (error) {
        console.error("Failed to load MediaPipe:", error);
      }
    };

    initMediaPipe();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener('loadeddata', predictWebcam);
    } catch (err) {
      console.error("Camera access denied:", err);
      setCameraError(true);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    cancelAnimationFrame(frameIdRef.current);
  };

  const predictWebcam = () => {
    if (!recognizerRef.current || !videoRef.current) return;

    // Use ref to check current active state
    if (isActiveRef.current) {
       // Ensure video is playing
       if (videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
          const nowInMs = Date.now();
          const result = recognizerRef.current.recognizeForVideo(videoRef.current, nowInMs);

          let fistFound = false;

          if (result.gestures.length > 0) {
            const category = result.gestures[0][0];
            const gestureName = category.categoryName;
            const score = category.score;

            // Debug log to help verify gestures if needed
            // console.log(`Gesture: ${gestureName}, Score: ${score}`);

            if (score > 0.5 && gestureName === "Closed_Fist") {
                fistFound = true;
                // Call the latest version of the callback via ref
                onGestureDetectedRef.current("CLOSED_FIST");
            }
          }

          // Update local state for visual feedback
          setIsFistDetected(fistFound);
       }
    }

    frameIdRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-center">
      <div className="relative">
        {/* Pulsating Ring Overlay for Feedback - MOVED OUTSIDE overflow-hidden div */}
        {isFistDetected && (
            <div className="absolute inset-0 -m-1 rounded-full border-4 border-[#C5B358] animate-ping opacity-75 pointer-events-none z-0" />
        )}

        {/* Container with dynamic border and shadow */}
        <div 
            className={`relative overflow-hidden rounded-full border-2 transition-all duration-300 w-32 h-32 bg-black z-10
            ${isFistDetected ? 'border-[#C5B358] shadow-[0_0_30px_#C5B358] scale-110' : 
            isActive ? 'border-yellow-400 shadow-[0_0_15px_#C5B358]' : 
            'border-gray-700 opacity-50'}`}
        >
            {loading && <div className="absolute inset-0 flex items-center justify-center text-xs text-yellow-500">Loading Vision...</div>}
            {cameraError && <div className="absolute inset-0 flex items-center justify-center text-xs text-red-500 text-center p-1">Camera Denied</div>}
            
            <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
            />
        </div>
      </div>
      
      <div className="text-center mt-2 text-[#C5B358] text-xs font-serif tracking-widest uppercase">
        {isFistDetected ? "GESTURE LOCKED" : isActive ? "Detecting..." : "Standby"}
      </div>
    </div>
  );
};

export default GestureController;