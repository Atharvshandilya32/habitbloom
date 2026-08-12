import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface ShareMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  consistency: number;
  bestStreak: number;
  bloomScore: number;
  milestoneTitle: string;
}

export default function ShareMilestoneModal({
  isOpen,
  onClose,
  consistency,
  bestStreak,
  bloomScore,
  milestoneTitle
}: ShareMilestoneModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgData, setImgData] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1080x1080 for Instagram/social square
      canvas.width = 1080;
      canvas.height = 1080;

      // Background Gradient
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
      gradient.addColorStop(0, '#047857'); // emerald-700
      gradient.addColorStop(1, '#0f766e'); // teal-700
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1080);

      // Glass Card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.roundRect(100, 100, 880, 880, 60);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 4;
      ctx.roundRect(100, 100, 880, 880, 60);
      ctx.stroke();

      // Text setup
      ctx.textAlign = 'center';
      
      // App Name
      ctx.font = 'bold 50px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('HabitBloom', 540, 220);

      // Milestone Title
      ctx.font = 'bold 90px sans-serif';
      ctx.fillStyle = '#ffffff';
      // Wrap text if needed, but assuming simple short titles like "30 Day Streak!"
      ctx.fillText(milestoneTitle, 540, 360);

      // Metrics
      const drawMetric = (label: string, value: string, x: number, y: number) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.roundRect(x - 160, y - 100, 320, 200, 30);
        ctx.fill();
        ctx.stroke();
        
        ctx.font = 'bold 30px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(label, x, y - 20);
        
        ctx.font = 'bold 60px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(value, x, y + 50);
      };

      drawMetric('Best Streak', `${bestStreak}d`, 340, 600);
      drawMetric('Consistency', `${consistency}%`, 740, 600);

      // Bloom Score
      ctx.font = 'bold 40px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(`Bloom Score: ${bloomScore}`, 540, 860);

      setImgData(canvas.toDataURL('image/png'));
    }
  }, [isOpen, bestStreak, consistency, bloomScore, milestoneTitle]);

  const handleDownload = () => {
    if (!imgData) return;
    const a = document.createElement('a');
    a.href = imgData;
    a.download = 'habitbloom-milestone.png';
    a.click();
    toast.success('Milestone saved!');
    onClose();
  };

  const handleShare = async () => {
    if (!imgData || !navigator.share) {
      handleDownload();
      return;
    }
    try {
      const blob = await (await fetch(imgData)).blob();
      const file = new File([blob], 'milestone.png', { type: 'image/png' });
      await navigator.share({
        title: 'HabitBloom Milestone',
        text: 'Check out my progress on HabitBloom!',
        files: [file]
      });
      onClose();
    } catch (e) {
      console.error(e);
      handleDownload();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 z-10 flex flex-col"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-black text-slate-900 text-lg">Share Milestone</h3>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full shadow-sm hover:shadow-md transition-all">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center bg-slate-50/50">
              <p className="text-sm font-bold text-slate-600 mb-4 text-center">
                You hit a new milestone! Share it to inspire others.
              </p>
              
              <div className="w-full aspect-square bg-slate-200 rounded-2xl overflow-hidden shadow-md relative">
                {/* Hidden canvas to render the image */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                {imgData ? (
                  <Image src={imgData} alt="Milestone Preview" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">Generating...</div>
                )}
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <button 
                onClick={handleShare}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Share2 size={18} />
                Share
              </button>
              <button 
                onClick={handleDownload}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200"
              >
                <Download size={18} />
                Save Image
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
