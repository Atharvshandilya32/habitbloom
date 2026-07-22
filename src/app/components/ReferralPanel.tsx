'use client';

import React, { useState } from 'react';
import { Copy, Share2, Check, Gift } from 'lucide-react';

interface ReferralPanelProps {
  userId: string;
}

function makeShortCode(uid: string): string {
  // Take first 8 chars of uid and make it look friendly
  return uid.slice(0, 8).toUpperCase();
}

export default function ReferralPanel({ userId }: ReferralPanelProps) {
  const code = makeShortCode(userId);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://habitbloom.in';
  const referralLink = `${baseUrl}/?ref=${code}`;
  const shareText = `I'm building better habits with HabitBloom! Join me and start your own habit tracker 🌱`;

  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('input');
      el.value = referralLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'HabitBloom',
          text: shareText,
          url: referralLink,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback — copy to clipboard
      handleCopy();
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${referralLink}`)}`;

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-emerald-100 bg-white/60">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
          <Gift size={18} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Refer a Friend 🌱</h3>
          <p className="text-xs text-muted-foreground">Share HabitBloom and grow together</p>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Tagline */}
        <p className="text-sm text-slate-600 leading-relaxed">
          Know someone who wants to build better habits? Share your unique link and invite them to start their journey!
        </p>

        {/* Referral link box */}
        <div className="flex items-center gap-2 rounded-xl bg-white border border-emerald-200 px-3 py-2.5 shadow-sm">
          <span className="text-xs text-emerald-600 font-mono flex-1 truncate select-all">
            {referralLink}
          </span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 shadow-sm ${
              shared
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90'
            }`}
          >
            <Share2 size={14} />
            {shared ? 'Shared!' : 'Share'}
          </button>

          {/* Social icons */}
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold bg-[#1DA1F2] text-white hover:opacity-90 transition-opacity shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Twitter
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold bg-[#25D366] text-white hover:opacity-90 transition-opacity shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
        </div>

        {/* Your code badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Your referral code:</span>
          <span className="font-mono font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">
            {code}
          </span>
        </div>
      </div>
    </div>
  );
}
