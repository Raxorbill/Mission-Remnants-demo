import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface ControlsOverlayProps {
  onDirectionInput: (dir: { x: number; y: number }) => void;
  onAltitudeInput?: (delta: number) => void;
  onActionButton: () => void;
  isFlightMission?: boolean;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  onDirectionInput,
  onAltitudeInput,
  onActionButton,
  isFlightMission,
}) => {
  const [activeDir, setActiveDir] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleTouchStart = (dir: { x: number; y: number }) => {
    setActiveDir(dir);
    onDirectionInput(dir);
  };

  const handleTouchEnd = () => {
    setActiveDir({ x: 0, y: 0 });
    onDirectionInput({ x: 0, y: 0 });
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex items-end justify-between p-4 md:hidden select-none">
      {/* Mobile D-Pad on Bottom-Left */}
      <div className="pointer-events-auto flex flex-col items-center gap-1 bg-black/40 p-2 rounded-2xl border border-white/10 backdrop-blur-sm">
        <button
          onTouchStart={() => handleTouchStart({ x: 0, y: 1 })}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => handleTouchStart({ x: 0, y: 1 })}
          onMouseUp={handleTouchEnd}
          className="w-12 h-12 rounded-xl bg-white/10 active:bg-cyan-500/40 border border-white/15 flex items-center justify-center text-white text-xs font-mono active:scale-95 transition-all"
        >
          <ArrowUp className="w-5 h-5 text-cyan-300" />
        </button>

        <div className="flex gap-2">
          <button
            onTouchStart={() => handleTouchStart({ x: -1, y: 0 })}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => handleTouchStart({ x: -1, y: 0 })}
            onMouseUp={handleTouchEnd}
            className="w-12 h-12 rounded-xl bg-white/10 active:bg-cyan-500/40 border border-white/15 flex items-center justify-center text-white text-xs font-mono active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-cyan-300" />
          </button>

          <button
            onTouchStart={() => handleTouchStart({ x: 0, y: -1 })}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => handleTouchStart({ x: 0, y: -1 })}
            onMouseUp={handleTouchEnd}
            className="w-12 h-12 rounded-xl bg-white/10 active:bg-cyan-500/40 border border-white/15 flex items-center justify-center text-white text-xs font-mono active:scale-95 transition-all"
          >
            <ArrowDown className="w-5 h-5 text-cyan-300" />
          </button>

          <button
            onTouchStart={() => handleTouchStart({ x: 1, y: 0 })}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => handleTouchStart({ x: 1, y: 0 })}
            onMouseUp={handleTouchEnd}
            className="w-12 h-12 rounded-xl bg-white/10 active:bg-cyan-500/40 border border-white/15 flex items-center justify-center text-white text-xs font-mono active:scale-95 transition-all"
          >
            <ArrowRight className="w-5 h-5 text-cyan-300" />
          </button>
        </div>
      </div>

      {/* Flight Altitude controls (if Ingenuity) */}
      {isFlightMission && onAltitudeInput && (
        <div className="pointer-events-auto flex flex-col gap-2 bg-black/40 p-2 rounded-2xl border border-white/10 mb-2">
          <button
            onTouchStart={() => onAltitudeInput(1)}
            onTouchEnd={() => onAltitudeInput(0)}
            className="p-3 rounded-xl bg-cyan-500/20 active:bg-cyan-500/50 text-cyan-300 border border-cyan-400/30 flex items-center justify-center"
          >
            <ArrowUpCircle className="w-6 h-6" />
          </button>
          <button
            onTouchStart={() => onAltitudeInput(-1)}
            onTouchEnd={() => onAltitudeInput(0)}
            className="p-3 rounded-xl bg-cyan-500/20 active:bg-cyan-500/50 text-cyan-300 border border-cyan-400/30 flex items-center justify-center"
          >
            <ArrowDownCircle className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
