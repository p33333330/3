import React, { useEffect, useRef } from 'react';

interface CosmicExplosionProps {
  onComplete: () => void;
}

const CosmicExplosion: React.FC<CosmicExplosionProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const shards: Shard[] = [];
    const shockwaves: Shockwave[] = [];
    const shardCount = 300; // Fragments of the astrolabe
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Colors: Gold, Dark Metal, White Spark
    const colors = ['#dec888', '#e5d5a3', '#b8a060', '#050a14', '#ffffff'];

    class Shockwave {
      radius: number;
      opacity: number;
      width: number;
      speed: number;

      constructor() {
        this.radius = 10;
        this.opacity = 1.0;
        this.width = 15;
        this.speed = 25; // Fast expansion
      }

      update() {
        this.radius += this.speed;
        this.opacity -= 0.02;
        this.width *= 0.95;
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (this.opacity <= 0) return;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(222, 200, 136, ${this.opacity})`; // Gold shockwave
        ctx.lineWidth = this.width;
        ctx.stroke();
      }
    }

    class Shard {
      x: number;
      y: number;
      vx: number;
      vy: number;
      angle: number;
      rotationSpeed: number;
      size: number;
      color: string;
      vertices: {x: number, y: number}[];
      life: number;
      decay: number;

      constructor() {
        this.x = centerX;
        this.y = centerY;
        
        // Explosive burst
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 20 + 5; 
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.4; // Spin
        
        this.size = Math.random() * 15 + 5; // Variable shard sizes
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Generate random polygon shape (shard)
        this.vertices = [];
        const numPoints = Math.floor(Math.random() * 3) + 3; // 3 to 5 vertices (Triangles/Quads)
        for (let i = 0; i < numPoints; i++) {
            const r = this.size * (0.5 + Math.random() * 0.8);
            const a = (i / numPoints) * Math.PI * 2 + Math.random() * 0.5;
            this.vertices.push({
                x: Math.cos(a) * r,
                y: Math.sin(a) * r
            });
        }
        
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.005;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.rotationSpeed;
        
        // Slight Gravity for heavy metal feel
        this.vy += 0.3;
        // Drag
        this.vx *= 0.96;
        this.vy *= 0.96;
        
        this.life -= this.decay;
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        
        ctx.beginPath();
        if (this.vertices.length > 0) {
            ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
            for(let i=1; i<this.vertices.length; i++) {
                ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        // Add a slight shine edge
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
      }
    }

    // Initialize Shards
    for (let i = 0; i < shardCount; i++) {
      shards.push(new Shard());
    }
    // Add initial shockwaves
    shockwaves.push(new Shockwave());
    setTimeout(() => shockwaves.push(new Shockwave()), 50);

    let animationId: number;

    const animate = () => {
      // Clear canvas clearly (no trail) for crisp shards
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Shockwaves
      shockwaves.forEach(sw => {
        sw.update();
        sw.draw(ctx);
      });

      let activeParticles = 0;

      // Draw Shards
      shards.forEach(p => {
        if (p.life > 0) {
          p.update();
          p.draw(ctx);
          activeParticles++;
        }
      });

      if (activeParticles > 0 || shockwaves.some(sw => sw.opacity > 0)) {
        animationId = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [onComplete]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[60] pointer-events-none"
    />
  );
};

export default CosmicExplosion;