'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

interface CinematicCanvasProps {
  onProgress?: (progress: number) => void;
  onReady?: () => void;
}

const TOTAL_FRAMES = 300;
const FRAME_DIRECTORY = '/assets/frames';

export default function CinematicCanvas({ onProgress, onReady }: CinematicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const animationFrameId = useRef<number | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Preload all 300 frames from local assets
  useEffect(() => {
    let count = 0;
    const loadedImages: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `${FRAME_DIRECTORY}/ezgif-frame-${frameNum}.jpg`;

      img.onload = () => {
        count++;
        const pct = (count / TOTAL_FRAMES) * 100;
        if (onProgress) onProgress(pct);

        if (count === TOTAL_FRAMES) {
          imagesRef.current = loadedImages;
          setIsLoaded(true);
          if (onReady) onReady();
        }
      };

      img.onerror = () => {
        // Fallback progress if an image fails
        count++;
      };

      loadedImages[i - 1] = img;
    }
  }, [onProgress, onReady]);

  // Helper to draw image onto canvas with aspect cover scaling
  const drawFrame = (frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[frameIdx];
    if (!img || !img.complete) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || 1920;
    const ih = img.naturalHeight || 1080;

    const canvasAspect = cw / ch;
    const imgAspect = iw / ih;

    let renderW: number, renderH: number, offsetX: number, offsetY: number;

    if (canvasAspect > imgAspect) {
      renderW = cw;
      renderH = cw / imgAspect;
      offsetX = 0;
      offsetY = (ch - renderH) / 2;
    } else {
      renderH = ch;
      renderW = ch * imgAspect;
      offsetX = (cw - renderW) / 2;
      offsetY = 0;
    }

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  };

  // Canvas size adjustment handler
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        drawFrame(currentFrameIndex);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [currentFrameIndex, isLoaded]);

  // Animation Loop (30 FPS targeting)
  useEffect(() => {
    if (!isLoaded || !isPlaying) return;

    let lastTime = performance.now();
    const fpsInterval = 1000 / 30; // ~33ms per frame

    const renderLoop = (now: number) => {
      const delta = now - lastTime;

      if (delta >= fpsInterval) {
        lastTime = now - (delta % fpsInterval);

        setCurrentFrameIndex((prevIdx) => {
          if (prevIdx >= TOTAL_FRAMES - 1) {
            // Reached final frame (Blooming tree + glass crystal card)
            // Pause on final frame to allow user interaction
            setIsPlaying(false);
            return TOTAL_FRAMES - 1;
          }
          const nextIdx = prevIdx + 1;
          drawFrame(nextIdx);
          return nextIdx;
        });
      }

      animationFrameId.current = requestAnimationFrame(renderLoop);
    };

    animationFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isLoaded, isPlaying]);

  // Redraw when currentFrameIndex changes manually
  useEffect(() => {
    if (isLoaded) {
      drawFrame(currentFrameIndex);
    }
  }, [currentFrameIndex, isLoaded]);

  const handleReplay = () => {
    setCurrentFrameIndex(0);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (currentFrameIndex >= TOTAL_FRAMES - 1) {
      handleReplay();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      {/* HTML5 Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
      />

      {/* Subtle overlay gradient to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-slate-950/50 pointer-events-none" />

      {/* Floating Canvas Controls (Discreet Bottom-Left) */}
      {isLoaded && (
        <div className="absolute bottom-6 left-6 z-30 flex items-center gap-2 bg-slate-900/60 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-2xl shadow-xl text-xs text-white">
          <button
            type="button"
            onClick={togglePlay}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-emerald-400"
            title={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          
          <button
            type="button"
            onClick={handleReplay}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            title="Replay Sprouting Animation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-3 w-px bg-white/15 mx-1" />

          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-mono">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Frame {currentFrameIndex + 1}/{TOTAL_FRAMES}</span>
          </div>
        </div>
      )}
    </div>
  );
}
