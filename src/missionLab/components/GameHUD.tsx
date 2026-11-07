import React from 'react';
import {
  Volume2,
  VolumeX,
  Pause,
  CheckCircle2,
  Circle,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Focus,
  ArrowLeft,
  Info
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { MissionData, MissionTelemetry } from '../types/game';

interface GameHUDProps {
  mission: MissionData;
  completedObjectives: Set<string>;
  lastCompletedTitle?: string | null;
  contextActionLabel: string | null;
  onContextAction: () => void;
  telemetry: MissionTelemetry;
  onPause: () => void;
  onOpenBriefing?: () => void;
  onBackToChapter?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onRotateCamera?: (deltaAzimuth: number) => void;
  onZoomCamera?: (delta: number) => void;
  onResetCamera?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  mission,
  completedObjectives,
  lastCompletedTitle,
  contextActionLabel,
  onContextAction,
  telemetry,
  onPause,
  onOpenBriefing,
  onBackToChapter,
  isMuted,
  onToggleMute,
  onRotateCamera,
  onZoomCamera,
  onResetCamera,
}) => {
  const activeObjective =
    mission.objectives.find((o) => !completedObjectives.has(o.id)) ||
    mission.objectives[mission.objectives.length - 1];

  const isRoamingMission =
    mission.id === 'apollo-reflector' ||
    mission.id === 'apollo-seismometer' ||
    mission.id === 'spirit-opportunity';
  const isFlightMission = mission.id === 'ingenuity';

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6 select-none font-sans">
      {/* ── TOP BAR: MISSION IDENTITY, ACTIVE STEP & CAMERA CONTROLS ── */}
      <div className="flex flex-wrap items-start justify-between gap-3 w-full">
        {/* Top-Left: Back to Story + Mission Identity */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-[#050914]/90 border border-white/15 rounded-xl px-3.5 py-2 shadow-xl backdrop-blur-md">
          {onBackToChapter && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onBackToChapter();
              }}
              className="pr-2.5 border-r border-white/15 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Return to Chapter Story"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Story</span>
            </button>
          )}

          <div>
            <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
              MISSION {mission.number} · {mission.destination.toUpperCase()}
            </div>
            <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
              {mission.name}
            </div>
          </div>

          {onOpenBriefing && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenBriefing();
              }}
              className="ml-1 p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="View Mission Briefing & Historical Facts"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Top-Center: Active Objective Step & Checklist */}
        <div className="pointer-events-auto flex flex-col items-center max-w-xl mx-auto space-y-1.5">
          {lastCompletedTitle && (
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-md bg-emerald-950/90 border border-emerald-400/60 text-emerald-200 font-mono text-xs font-bold shadow-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>COMPLETED: {lastCompletedTitle}</span>
            </div>
          )}

          <div className="bg-[#050914]/90 border border-white/15 rounded-xl px-4 py-2.5 shadow-xl backdrop-blur-md space-y-1.5">
            <div className="flex items-center justify-center gap-4 text-[11px] font-mono">
              {mission.objectives.map((obj, idx) => {
                const isDone = completedObjectives.has(obj.id);
                const isCurrent = activeObjective.id === obj.id && !isDone;
                return (
                  <div
                    key={obj.id}
                    className={`flex items-center gap-1.5 ${
                      isDone
                        ? 'text-emerald-400'
                        : isCurrent
                        ? 'text-white font-bold'
                        : 'text-slate-500'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isCurrent ? 'text-cyan-400' : 'text-slate-600'
                        }`}
                      />
                    )}
                    <span className="hidden md:inline">{obj.title}</span>
                    <span className="md:hidden">0{idx + 1}</span>
                  </div>
                );
              })}
            </div>

            <div className="text-center text-xs text-slate-300 border-t border-white/10 pt-1">
              <span className="font-mono text-cyan-400 font-semibold mr-1.5">GOAL:</span>
              <span>{activeObjective.description}</span>
            </div>
          </div>
        </div>

        {/* Top-Right: Camera Controls, Audio & Pause */}
        <div className="pointer-events-auto flex items-center gap-1 bg-[#050914]/90 border border-white/15 rounded-xl p-1.5 shadow-xl backdrop-blur-md">
          <button
            onClick={() => {
              soundEngine.playClick();
              onRotateCamera?.(Math.PI / 8);
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Orbit Left (Q)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onRotateCamera?.(-Math.PI / 8);
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Orbit Right (R)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onZoomCamera?.(-1.5);
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onZoomCamera?.(1.5);
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onResetCamera?.();
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-cyan-400 hover:text-white transition-colors cursor-pointer border-r border-white/10 pr-2"
            title="Reset Camera"
          >
            <Focus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleMute();
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-amber-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-300" />
            )}
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onPause();
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Pause Menu (Esc)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── BOTTOM ROW: TELEMETRY & CONTEXTUAL ACTION BUTTON ── */}
      <div className="flex flex-wrap items-end justify-between gap-4 w-full">
        {/* Bottom-Left: Compact Telemetry & Controls Guide */}
        <div className="pointer-events-auto bg-[#050914]/90 border border-white/15 rounded-xl px-4 py-3 shadow-xl text-xs font-mono text-slate-300 space-y-1.5 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-4">
            {telemetry.distanceToTarget !== undefined && (
              <div>
                <span className="text-slate-500 mr-1.5">TARGET BEACON:</span>
                <span className="font-bold text-amber-300 tabular-nums">
                  {telemetry.distanceToTarget} m
                </span>
              </div>
            )}
            {telemetry.speed !== undefined && (
              <div>
                <span className="text-slate-500 mr-1.5">SPEED:</span>
                <span className="font-bold text-white tabular-nums">{telemetry.speed} m/s</span>
              </div>
            )}
            {telemetry.altitude !== undefined && (
              <div>
                <span className="text-slate-500 mr-1.5">ALTITUDE:</span>
                <span className="font-bold text-cyan-300 tabular-nums">{telemetry.altitude} m</span>
              </div>
            )}
            {telemetry.rotorRPM !== undefined && (
              <div>
                <span className="text-slate-500 mr-1.5">ROTORS:</span>
                <span className="font-bold text-amber-300 tabular-nums">{telemetry.rotorRPM} RPM</span>
              </div>
            )}
            {telemetry.lightTravelTime !== undefined && (
              <div>
                <span className="text-slate-500 mr-1.5">LASER ECHO:</span>
                <span className="font-bold text-emerald-400 tabular-nums">
                  {telemetry.lightTravelTime} s
                </span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 border-t border-white/10 pt-1">
            {isFlightMission
              ? 'WASD / Arrows: Fly horizontally · Space / Shift: Altitude · Drag: Orbit 360°'
              : isRoamingMission
              ? 'WASD / Arrow Keys: Move toward glowing beacon · Drag: Orbit 360° · Scroll: Zoom'
              : 'Click the action button on the right (or press E) · Drag anywhere to orbit 360°'}
          </div>
        </div>

        {/* Bottom-Right: Primary Interactive Action Button */}
        <div className="pointer-events-auto">
          {contextActionLabel ? (
            <button
              onClick={() => {
                soundEngine.playClick();
                onContextAction();
              }}
              className="px-6 py-4 rounded-xl bg-[#00E5FF] hover:bg-[#67E8F9] text-[#030712] font-mono font-bold tracking-wider text-xs sm:text-sm flex items-center gap-3 shadow-[0_0_30px_rgba(0,229,255,0.45)] cursor-pointer transition-all active:scale-95"
            >
              <span className="px-2 py-0.5 rounded bg-black/20 text-[11px] font-bold">
                KEY E
              </span>
              <span>{contextActionLabel}</span>
            </button>
          ) : (
            <div className="text-xs font-mono text-amber-200 bg-[#050914]/90 px-4 py-2.5 rounded-xl border border-amber-400/30 backdrop-blur-md">
              Move toward the glowing beacon using WASD or Arrow keys
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
