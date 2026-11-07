import React, { useState } from 'react';
import { Play, RotateCcw, ListFilter, Volume2, VolumeX, ShieldAlert, X } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onReturnToSelection: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onReturnToSelection,
  isMuted,
  onToggleMute,
}) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none text-white font-sans">
      <div className="relative w-full max-w-md bg-[#0b1020] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h2 className="text-base font-mono font-bold tracking-wider uppercase text-white">
              SIMULATION PAUSED
            </h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onResume();
            }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        {!showExitConfirm ? (
          <div className="space-y-3 mb-6">
            <button
              onClick={() => {
                soundEngine.playClick();
                onResume();
              }}
              className="w-full py-3 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 hover:text-white font-mono text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>RESUME MISSION</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onRestart();
              }}
              className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-mono text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>RESTART CURRENT MISSION</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                setShowExitConfirm(true);
              }}
              className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-mono text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ListFilter className="w-4 h-4 text-slate-400" />
              <span>RETURN TO MISSION ARCHIVE</span>
            </button>

            {/* Sound Toggle */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
              <span className="text-xs font-mono text-slate-400">AUDIO SYSTEM:</span>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onToggleMute();
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-200 cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation Dialog */
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 mb-6 text-center">
            <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-amber-200 mb-1">Return to Mission Archive?</h3>
            <p className="text-xs text-slate-300 font-light mb-4">
              Your current progress in this mission will be reset.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-mono text-slate-200"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onReturnToSelection();
                }}
                className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs"
              >
                CONFIRM EXIT
              </button>
            </div>
          </div>
        )}

        {/* Quick Controls Guide */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-slate-400 space-y-1">
          <div className="text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
            Desktop Controls Guide
          </div>
          <div className="flex justify-between">
            <span>WASD / Arrow Keys</span>
            <span className="text-slate-200">Move Astronaut / Rover / Craft</span>
          </div>
          <div className="flex justify-between">
            <span>E</span>
            <span className="text-slate-200">Contextual Interaction</span>
          </div>
          <div className="flex justify-between">
            <span>Space / Shift</span>
            <span className="text-slate-200">Helicopter Altitude Control</span>
          </div>
          <div className="flex justify-between">
            <span>Esc</span>
            <span className="text-slate-200">Pause / Resume</span>
          </div>
        </div>
      </div>
    </div>
  );
};
