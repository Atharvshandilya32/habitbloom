'use client';

import React, { useEffect, useRef, useState } from 'react';

interface CinematicCanvasProps {
  onProgress?: (progress: number) => void;
  onReady?: () => void;
  onFrame?: (frameIndex: number, totalFrames: number) => void;
}

const TOTAL_FRAMES = 220;
const FRAME_DIRECTORY = '/assets/frames';

export default function CinematicCanvas({ onProgress, onReady, onFrame }: CinematicCanvasProps) {
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
        count++;
        const pct = (count / TOTAL_FRAMES) * 100;
        if (onProgress) onProgress(pct);
        if (count === TOTAL_FRAMES) {
          imagesRef.current = loadedImages;
          setIsLoaded(true);
          if (onReady) onReady();
        }
      };

      loadedImages[i - 1] = img;
    }
  }, [onProgress, onReady]);

  // Helper to draw image onto canvas with cover scaling
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

  // Animation Loop (targeting smooth 30 FPS playback across ~10 seconds)
  useEffect(() => {
    if (!isLoaded || !isPlaying) return;

    let lastTime = performance.now();
    const fpsInterval = 1000 / 30; // 33.3ms per frame

    const renderLoop = (now: number) => {
      const delta = now - lastTime;

      if (delta >= fpsInterval) {
        lastTime = now - (delta % fpsInterval);

        setCurrentFrameIndex((prevIdx) => {
          if (prevIdx >= TOTAL_FRAMES - 1) {
            setIsPlaying(false);
            return TOTAL_FRAMES - 1;
          }
          return prevIdx + 1;
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

  // Redraw canvas and notify parent on frame change
  useEffect(() => {
    if (isLoaded) {
      drawFrame(currentFrameIndex);
      if (onFrame) {
        onFrame(currentFrameIndex, TOTAL_FRAMES);
      }
    }
  }, [currentFrameIndex, isLoaded, onFrame]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      {/* HTML5 Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
      />

      {/* Soft gradient overlay to ensure contrast and depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-slate-950/40 pointer-events-none" />
    </div>
  );
}

