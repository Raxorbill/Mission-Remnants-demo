import React, { useEffect, useRef, useState } from 'react';
import { Activity, ShieldCheck, Check } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface WaveformViewProps {
  data: {
    title: string;
    event: string;
    isIllustrative?: boolean;
    onSignalDetected: () => void;
  };
}

export const WaveformView: React.FC<WaveformViewProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [analyzed, setAnalyzed] = useState(false);

  useEffect(() => {
    let animId: number;
    let offset = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      offset += 2;

      ctx.fillStyle = '#050a14';
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(0, 217, 245, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Center baseline
      ctx.strokeStyle = 'rgba(0, 217, 245, 0.3)';
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Oscilloscope trace
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < w; x++) {
        const t = (x + offset) * 0.04;
        let amp = 0;

        // Peak shock event in the middle
        const midDist = Math.abs(x - w / 2);
        if (midDist < 90) {
          amp = (1 - midDist / 90) * 38;
        }

        const y = h / 2 + Math.sin(t * 3) * (amp + 3) + Math.sin(t * 7) * (amp * 0.4) + (Math.random() - 0.5) * 4;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md select-none text-white font-sans">
      <div className="relative w-full max-w-2xl bg-[#0b1020] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#07111f]/90 text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-400">
            <Activity className="w-4 h-4" />
            <span className="font-bold tracking-wider uppercase">SCIENTIFIC WAVEFORM TELEMETRY</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
            CHANNEL 01 ACTIVE
          </span>
        </div>

        {/* Oscilloscope Screen */}
        <div className="relative p-6 bg-black flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="w-full h-48 rounded-xl border border-cyan-500/30"
          />

          <div className="mt-3 flex items-center justify-between w-full text-xs font-mono text-cyan-300">
            <span>EVENT: {data.event}</span>
            <span className="text-emerald-400 font-bold">SIGNAL STRENGTH: 98.4%</span>
          </div>
        </div>

        {/* Interpretation & Action */}
        <div className="p-6 bg-[#07111f] border-t border-white/10 flex flex-col">
          <div className="flex items-start gap-2.5 mb-4">
            <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
                {data.isIllustrative ? 'ILLUSTRATIVE WAVEFORM — NOT A LIVE APOLLO RECORDING' : 'MISSION FACT'}
              </div>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-light">
                Ground vibration wave patterns reveal deep planetary interior structure. Seismometers recorded how seismic waves travel through the crust, mantle, and core.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              data.onSignalDetected();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/25 cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>CONFIRM SIGNAL DETECTION & PROCEED</span>
          </button>
        </div>
      </div>
    </div>
  );
};
