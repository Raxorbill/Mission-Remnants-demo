import React from 'react';
import { Camera, Check, ShieldCheck, X } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface PhotoCaptureViewProps {
  data: {
    title: string;
    description: string;
    truthLabel?: string;
    onClose: () => void;
  };
}

export const PhotoCaptureView: React.FC<PhotoCaptureViewProps> = ({ data }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md select-none text-white font-sans">
      <div className="relative w-full max-w-2xl bg-[#0b1020] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Viewfinder Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#07111f]/90 text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-400">
            <Camera className="w-4 h-4" />
            <span className="font-bold tracking-wider uppercase">SURFACE IMAGING SUBSYSTEM</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
            RAW FRAME DECODED
          </span>
        </div>

        {/* Viewfinder Frame */}
        <div className="relative p-6 flex flex-col items-center justify-center bg-black/60 min-h-[220px]">
          {/* Camera Crosshairs */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-400/50" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-400/50" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-400/50" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-400/50" />

          {/* Simulated Scene Graphic */}
          <div className="w-full h-44 rounded-xl bg-gradient-to-b from-[#1a1c2e] via-[#4d2516] to-[#73351d] border border-white/10 flex flex-col items-center justify-center relative overflow-hidden p-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,217,245,0.2),transparent_70%)]" />
            <div className="text-center relative z-10">
              <Camera className="w-10 h-10 text-cyan-300 mx-auto mb-2 opacity-80" />
              <div className="text-sm font-bold tracking-wider uppercase text-white font-mono drop-shadow">
                {data.title}
              </div>
              <div className="text-[11px] font-mono text-cyan-200/80 mt-1">
                SPECTRAL CALIBRATION COMPLETE · 100% EXPOSURE
              </div>
            </div>
          </div>
        </div>

        {/* Educational Caption */}
        <div className="p-6 bg-[#07111f] border-t border-white/10 flex flex-col">
          <div className="flex items-start gap-2.5 mb-4">
            <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
                {data.truthLabel || 'MISSION FACT'}
              </div>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-light">
                {data.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              data.onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/25 cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>CONFIRM OBSERVATION & PROCEED</span>
          </button>
        </div>
      </div>
    </div>
  );
};
