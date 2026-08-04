'use client';

import React, { useEffect, useRef } from 'react';

export default function CinematicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    const particles: any[] = [];
    // Adjust density based on screen size
    const numParticles = Math.floor((width * height) / 15000); 

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 0.5,
        color: Math.random() > 0.5 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(45, 212, 191, 0.7)' // emerald and teal
      });
    }

    let animationId: number;
    let time = 0;

    const draw = () => {
      time += 0.005;
      ctx.clearRect(0, 0, width, height);

      // Dynamic ambient gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#020617'); // slate-950 base
      
      // Calculate a subtle pulsing offset for the gradient
      const pulse = Math.sin(time) * 0.5 + 0.5;
      const r = Math.floor(2 + pulse * 4); // 2 to 6
      const g = Math.floor(40 + pulse * 30); // 40 to 70
      const b = Math.floor(30 + pulse * 20); // 30 to 50
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.8)`); 

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // Draw mesh connections
        for (let j = index + 1; j < numParticles; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const opacity = 1 - dist / 150;
            // Draw connections in a faint emerald tint
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.4})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      {/* Heavy vignette overlay to keep text readable */}
      <div className="absolute inset-0 bg-slate-950/60 pointer-events-none" />
    </div>
  );
}
