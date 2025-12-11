import React, { useEffect, useRef } from 'react';

const StarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    // Updated interface to support smooth twinkling
    let stars: { x: number; y: number; radius: number; baseAlpha: number; phase: number; speed: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const numStars = Math.floor((canvas.width * canvas.height) / 3000);
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          baseAlpha: Math.random() * 0.5 + 0.3, // Base brightness between 0.3 and 0.8
          phase: Math.random() * Math.PI * 2, // Random starting phase for the sine wave
          speed: Math.random() * 0.002 + 0.0005, // Very slow, subtle speed
        });
      }
    };

    const draw = () => {
      ctx.fillStyle = '#050a14'; // Dark indigo/black
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now();

      stars.forEach((star) => {
        // Calculate smooth twinkle using sine wave
        // Vary alpha by +/- 0.2 around the base alpha
        const twinkle = Math.sin(time * star.speed + star.phase) * 0.2;
        let alpha = star.baseAlpha + twinkle;

        // Clamp alpha to valid range [0, 1]
        if (alpha < 0) alpha = 0;
        if (alpha > 1) alpha = 1;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
};

export default StarBackground;