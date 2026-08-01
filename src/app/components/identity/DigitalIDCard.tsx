import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Download, Printer, Sparkles, Building2, User } from 'lucide-react';
import { DigitalIDCardData } from '../../../../lib/identityTypes';
import { formatHbId } from '../../../../lib/identityUtils';

interface DigitalIDCardProps {
  cardData: DigitalIDCardData;
  onClose?: () => void;
}

export default function DigitalIDCard({ cardData, onClose }: DigitalIDCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const qrPayload = JSON.stringify({
    hbId: cardData.hbId,
    spaceId: cardData.spaceId,
    orgId: cardData.orgIdValue,
    status: cardData.verificationStatus,
  });

  const handleDownloadPNG = () => {
    setDownloading(true);
    const svgEl = document.getElementById(`qr-card-${cardData.hbId}`);
    if (!svgEl) {
      setDownloading(false);
      return;
    }

    try {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = 400;
        canvas.height = 400;
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 50, 50, 300, 300);

          const a = document.createElement('a');
          a.download = `HabitBloom-ID-${cardData.userName.replace(/\s+/g, '-')}.png`;
          a.href = canvas.toDataURL('image/png');
          a.click();
        }
        setDownloading(false);
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch {
      setDownloading(false);
      alert('Unable to export image directly. You can take a screenshot or print.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Digital ID Card Container */}
      <div 
        ref={cardRef}
        id="digital-id-card"
        className="w-full max-w-sm bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 shadow-2xl text-white border border-slate-700/80 relative overflow-hidden print:border-none print:shadow-none"
      >
        {/* Holographic background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
              <Building2 size={18} className="text-slate-950" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-wide text-white truncate max-w-[170px]">
                {cardData.spaceName}
              </h3>
              <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                Official Digital Pass
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <ShieldCheck size={12} />
            <span>VERIFIED</span>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg overflow-hidden flex items-center justify-center text-white text-2xl font-black">
              {cardData.userPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cardData.userPhotoUrl} alt={cardData.userName} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <User size={36} className="text-white/80" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <Sparkles size={11} className="text-slate-950" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-black text-white truncate">
              {cardData.userName}
            </h4>
            <div className="inline-block bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 px-2 py-0.5 rounded-md text-[11px] font-bold mt-0.5">
              {cardData.roleName}
            </div>

            <div className="mt-3 space-y-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {cardData.orgIdLabel || 'Organization ID'}
                </span>
                <span className="text-xs font-mono font-bold text-white tracking-wide">
                  {cardData.orgIdValue || 'NOT SET'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: HB-ID & QR Code */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Universal HabitBloom ID
            </span>
            <span className="text-sm font-mono font-black text-emerald-400 tracking-wider">
              {formatHbId(cardData.hbId)}
            </span>
            <p className="text-[9px] text-slate-400 font-medium mt-0.5">
              Permanent Identity Record
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-white p-1.5 rounded-xl shadow-md shrink-0">
            <QRCodeSVG
              id={`qr-card-${cardData.hbId}`}
              value={qrPayload}
              size={64}
              level="H"
              includeMargin={false}
              fgColor="#0f172a"
            />
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 print:hidden w-full max-w-sm">
        <button
          onClick={handleDownloadPNG}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50"
        >
          <Download size={15} />
          <span>{downloading ? 'Exporting...' : 'Save Image'}</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
        >
          <Printer size={15} />
          <span>Print / PDF</span>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-900 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
