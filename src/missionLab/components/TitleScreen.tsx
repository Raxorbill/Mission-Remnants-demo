import React from 'react';
import { Compass, Rocket, ShieldCheck, ChevronRight } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { MissionId } from '../types/game';
import { MISSIONS_DATA } from '../data/missionsData';

interface TitleScreenProps {
  onStart: () => void;
  onSelectMission: (id: MissionId) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, onSelectMission }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden bg-[#07111f] select-none text-white">
      {/* Background Deep Space Ambience & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,217,245,0.15),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.12),transparent_60%)]" />

      {/* Top Identity Bar */}
      <header className="relative z-10 w-full max-w-6xl flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono tracking-widest text-cyan-400 font-semibold uppercase">
              Team NovoSriti · Mission Remnants
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Interactive 3D Educational Space Architecture
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>NASA Science Grounded</span>
        </div>
      </header>

      {/* Hero Centerpiece Lockup */}
      <main className="relative z-10 flex flex-col items-center text-center my-auto max-w-4xl px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-wider mb-6">
          <Compass className="w-3 h-3 text-cyan-400" />
          <span>HISTORICAL MISSION SIMULATION LAB</span>
        </div>

        {/* Bespoke SVG Title Lockup */}
        <div className="w-full max-w-2xl mb-4">
          <svg viewBox="0 0 720 120" className="w-full h-auto drop-shadow-[0_10px_35px_rgba(0,217,245,0.25)]">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#00D9F5" />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="60%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="url(#titleGrad)"
              className="font-bold tracking-widest uppercase text-6xl"
              style={{ fontFamily: "'Space Grotesk', Outfit, sans-serif", letterSpacing: '0.22em' }}
            >
              NOVOSRITI
            </text>
            <text
              x="50%"
              y="94%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#6366F1"
              className="font-mono tracking-widest uppercase text-lg"
              style={{ letterSpacing: '0.55em' }}
            >
              MISSION LAB
            </text>
          </svg>
        </div>

        {/* Tagline */}
        <p className="text-lg md:text-2xl text-slate-300 font-light tracking-wide mb-3">
          The missions ended. <span className="text-cyan-400 font-normal">Their stories remain.</span>
        </p>
        <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto mb-8 font-light">
          Experience how real historical space missions operated by completing simplified, scientifically grounded versions of their original lunar, Martian, and deep-space objectives.
        </p>

        {/* Primary Start CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => {
              soundEngine.playClick();
              onStart();
            }}
            className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium tracking-wider text-sm transition-all shadow-[0_0_25px_rgba(0,217,245,0.4)] hover:shadow-[0_0_35px_rgba(0,217,245,0.6)] cursor-pointer flex items-center gap-3 active:scale-95"
          >
            <Rocket className="w-5 h-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            <span>ENTER MISSION LAB</span>
            <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Quick Select Carousel / Pills */}
        <div className="mt-10 w-full max-w-4xl">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3">
            Selectable Historical Missions
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-left">
            {Object.values(MISSIONS_DATA).map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  soundEngine.playClick();
                  onSelectMission(m.id);
                }}
                className="group p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/40 transition-all cursor-pointer text-left"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 mb-1">
                  <span>{m.number}</span>
                  <span className="text-slate-500">{m.destination}</span>
                </div>
                <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                  {m.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Flat Control-Hint Line */}
      <footer className="relative z-10 w-full max-w-6xl border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-4 text-slate-400">
          <span><strong className="text-slate-300">WASD / ↑←↓→</strong> Move</span>
          <span>·</span>
          <span><strong className="text-slate-300">Space</strong> Special Action</span>
          <span>·</span>
          <span><strong className="text-slate-300">E</strong> Interact</span>
          <span>·</span>
          <span><strong className="text-slate-300">Esc</strong> Pause</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Educational historical reconstruction · Not an official NASA product
        </div>
      </footer>
    </div>
  );
};
