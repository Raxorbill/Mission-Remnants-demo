import React from 'react';
import { Disc, Volume2, ShieldCheck, Check } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface GoldenRecordModalProps {
  onClose: () => void;
}

export const GoldenRecordModal: React.FC<GoldenRecordModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md select-none text-white font-sans">
      <div className="relative w-full max-w-2xl bg-[#0b1020] border border-amber-500/40 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] p-6 md:p-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Disc className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                HUMANITY'S TIME CAPSULE
              </div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                THE GOLDEN RECORD
              </h2>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-mono">
            VOYAGER 1 & 2
          </span>
        </div>

        {/* Golden Record Center Visual */}
        <div className="mb-6 flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 border-4 border-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.4)] flex items-center justify-center flex-shrink-0">
            {/* Concentric Phonograph Grooves */}
            <div className="w-28 h-28 rounded-full border border-amber-900/40 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border border-amber-900/50 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-amber-900/60 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white shadow" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 text-xs text-slate-300 font-light leading-relaxed">
            <h3 className="text-sm font-semibold text-amber-200 mb-1">
              Sounds, Music & Greetings of Earth
            </h3>
            <p className="mb-2">
              Affixed to the exterior of Voyager 1 is a 12-inch gold-plated copper phonograph record containing 115 analog images, sounds of nature (thunder, birds, whales), diverse musical selections, and spoken greetings in 55 ancient and modern human languages.
            </p>
            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-100 font-mono text-[11px]">
              <div className="font-bold text-amber-300 mb-0.5">BENGALI GREETING ON THE RECORD:</div>
              "Shobai kalyan hok / Hello! Let there be peace everywhere."
            </div>
          </div>
        </div>

        {/* Audio Sample Button */}
        <div className="mb-6 flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
          <div className="text-xs font-mono text-slate-300">
            PLAY GREETING AUDIO SYNTHESIS:
          </div>
          <button
            onClick={() => soundEngine.playMissionVictory()}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-mono flex items-center gap-2 cursor-pointer transition-all"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>PLAY GREETING TONE</span>
          </button>
        </div>

        {/* Truth Label */}
        <div className="mb-6 p-3 rounded-lg bg-black/50 border border-white/10 text-[11px] font-mono text-slate-400 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 block mb-0.5">MISSION FACT:</strong>
            The Golden Record is a symbolic cultural message and time capsule, not an active electronic communication instrument or scientific sensor.
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25 cursor-pointer active:scale-95"
        >
          <Check className="w-4 h-4" />
          <span>RETURN TO MISSION</span>
        </button>
      </div>
    </div>
  );
};
