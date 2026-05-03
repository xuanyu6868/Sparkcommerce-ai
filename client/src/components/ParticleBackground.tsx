import React, { useEffect, useRef } from 'react';

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gatheringPosRef = useRef<{x: number, y: number} | null>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) { // Middle click
        e.preventDefault();
        gatheringPosRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1) {
        gatheringPosRef.current = null;
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    let animationFrameId: number;

    const TEXT = "Spark";
    let textTargetPositions: {x: number, y: number}[] = [];
    const particlesCount = 300; // Reduced particles

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      targetOffsetX: number | null = null;
      targetOffsetY: number | null = null;
      color: string;
      wanderAngle: number;
      speed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.size = Math.random() * 2 + 1;
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.4 + 0.1; // Reduced speed
        const colors = ['#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update(gatheringPos: {x: number, y: number} | null) {
        if (gatheringPos && this.targetOffsetX !== null && this.targetOffsetY !== null) {
          // Move towards target centered at mouse position
          const targetX = gatheringPos.x + this.targetOffsetX;
          const targetY = gatheringPos.y + this.targetOffsetY;
          
          const dx = targetX - this.x;
          const dy = targetY - this.y;
          this.vx = dx * 0.08;
          this.vy = dy * 0.08;
        } else {
          // Wander slowly
          this.wanderAngle += (Math.random() - 0.5) * 0.1;
          this.vx = Math.cos(this.wanderAngle) * this.speed;
          this.vy = Math.sin(this.wanderAngle) * this.speed;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen if not gathering
        if (!gatheringPos) {
          if (this.x < -10) this.x = width + 10;
          if (this.x > width + 10) this.x = -10;
          if (this.y < -10) this.y = height + 10;
          if (this.y > height + 10) this.y = -10;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    let particles: Particle[] = [];

    const getTextPositions = () => {
      const offCanvas = document.createElement('canvas');
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
      if (!offCtx) return [];

      offCanvas.width = width;
      offCanvas.height = height;

      // Draw text
      const fontSize = Math.min(width, height) * 0.18;
      offCtx.font = `900 ${fontSize}px sans-serif`;
      offCtx.fillStyle = "white";
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.fillText(TEXT, width / 2, height / 2);

      const imageData = offCtx.getImageData(0, 0, width, height);
      const data = imageData.data;

      const positions = [];
      const density = 6;

      for (let y = 0; y < height; y += density) {
        for (let x = 0; x < width; x += density) {
          const index = (y * width + x) * 4;
          const alpha = data[index + 3];
          if (alpha > 128) {
            // Store position relative to center
            positions.push({ x: x - width / 2, y: y - height / 2 });
          }
        }
      }
      return positions;
    };

    const initParticles = () => {
      textTargetPositions = getTextPositions();
      // Shuffle target positions to uniformly cover the text
      for (let i = textTargetPositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [textTargetPositions[i], textTargetPositions[j]] = [textTargetPositions[j], textTargetPositions[i]];
      }
      
      const newParticles = [];
      for (let i = 0; i < particlesCount; i++) {
        const p = new Particle();
        if (textTargetPositions.length > 0) {
          const target = textTargetPositions[i % textTargetPositions.length];
          // Remove random offset to make the text shape much sharper and clearer
          p.targetOffsetX = target.x;
          p.targetOffsetY = target.y;
        }
        newParticles.push(p);
      }
      particles = newParticles;
    };

    window.addEventListener('resize', resize);
    resize();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Assist text drawing if gathering
      const gatheringPos = gatheringPosRef.current;
      if (gatheringPos) {
        const fontSize = Math.min(width, height) * 0.18;
        ctx.font = `900 ${fontSize}px sans-serif`;
        ctx.fillStyle = "rgba(163, 163, 163, 0.08)"; // Very subtle gray text
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(TEXT, gatheringPos.x, gatheringPos.y);
      }
      
      particles.forEach(p => {
        p.update(gatheringPos);
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
};
