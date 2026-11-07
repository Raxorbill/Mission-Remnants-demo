import React from 'react';
import { ArrowLeft, Rocket, CheckCircle2, ShieldCheck, BookOpen, Globe2, Moon, Compass } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { MissionData } from '../types/game';
import { ROVER_CHOICES } from '../data/missionsData';

interface MissionBriefingProps {
  mission: MissionData;
  roverChoice?: 'spirit' | 'opportunity';
  onRoverChoiceChange?: (rover: 'spirit' | 'opportunity') => void;
  onStartMission: () => void;
  onBack: () => void;
  onReturnToChapter?: () => void;
}

export const MissionBriefing: React.FC<MissionBriefingProps> = ({
  mission,
  roverChoice = 'spirit',
  onRoverChoiceChange,
  onStartMission,
  onBack,
  onReturnToChapter,
}) => {
  const isSpiritOpportunity = mission.id === 'spirit-opportunity';
  const roverInfo = isSpiritOpportunity
    ? ROVER_CHOICES.find((r) => r.roverId === roverChoice)
    : null;

  const isMars = mission.destination === 'Mars';
  const isVoid = mission.destination === 'Deep space';

  const bgGradient = isMars
    ? 'bg-[#0E0704] bg-[radial-gradient(ellipse_75%_55%_at_50%_15%,rgba(234,88,12,0.16),transparent_70%)]'
    : isVoid
    ? 'bg-[#02040A] bg-[radial-gradient(ellipse_75%_55%_at_50%_15%,rgba(56,189,248,0.12),transparent_70%)]'
    : 'bg-[#050914] bg-[radial-gradient(ellipse_75%_55%_at_50%_15%,rgba(0,217,245,0.12),transparent_70%)]';

  const cardSurface = isMars
    ? 'bg-[#170C08]/95 border-[#3E1F13]'
    : isVoid
    ? 'bg-[#060A17]/95 border-[#17233D]'
    : 'bg-[#0B1020]/95 border-white/10';

  const accentText = isMars
    ? 'text-[#F97316]'
    : isVoid
    ? 'text-[#38BDF8]'
    : 'text-cyan-400';

  const ctaButtonClass = isMars
    ? 'bg-gradient-to-r from-[#EA580C] to-[#F59E0B] hover:from-[#F97316] hover:to-[#FBBF24] text-white shadow-orange-500/30'
    : isVoid
    ? 'bg-gradient-to-r from-[#0284C7] via-[#00E5FF] to-[#EAB308] hover:brightness-110 text-slate-950 shadow-cyan-500/30'
    : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/30';

  const getDestIcon = () => {
    if (isMars) return <Globe2 className="w-3.5 h-3.5 text-[#F97316]" />;
    if (isVoid) return <Compass className="w-3.5 h-3.5 text-[#EAB308]" />;
    return <Moon className="w-3.5 h-3.5 text-cyan-300" />;
  };

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto ${bgGradient} select-none text-white`}>
      <div className={`relative z-10 w-full max-w-4xl ${cardSurface} border rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col my-auto backdrop-blur-md`}>
        {/* Top Navigation & Mission Identity */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-4">
            {onReturnToChapter && (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onReturnToChapter();
                }}
                className="flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>BACK TO CHAPTER {mission.number} STORY</span>
              </button>
            )}

            <button
              onClick={() => {
                soundEngine.playClick();
                onBack();
              }}
              className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>MISSION ARCHIVE</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/15 text-slate-200 text-xs font-mono">
              {getDestIcon()}
              <span>MISSION {mission.number} · {mission.destination.toUpperCase()}</span>
            </span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="mb-5">
          <div className={`text-xs font-mono tracking-widest ${accentText} uppercase font-semibold mb-1`}>
            {mission.spacecraftType} · {mission.dateOrEra}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5 tracking-wide">
            {mission.name}
            {roverInfo && <span className="text-amber-400 ml-2">({roverInfo.name})</span>}
          </h1>
          <p className="text-sm font-mono text-slate-400 uppercase tracking-wider">
            {mission.subtitle}
          </p>
        </div>

        {/* Optional Spirit vs Opportunity Twin Rover Switcher for Mission 04 */}
        {isSpiritOpportunity && onRoverChoiceChange && (
          <div className="mb-5 p-3.5 rounded-xl bg-black/40 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-mono text-amber-200">
              <span className="font-bold uppercase block">Select Mars Exploration Rover:</span>
              <span className="text-slate-400 text-[11px]">
                Both twin rovers used identical 6-wheel Rocker-Bogie hardware and the Rock Abrasion Tool (RAT).
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {ROVER_CHOICES.map((r) => (
                <button
                  key={r.roverId}
                  onClick={() => {
                    soundEngine.playClick();
                    onRoverChoiceChange(r.roverId);
                  }}
                  className={`px-3.5 py-2 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                    roverChoice === r.roverId
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {r.roverId.toUpperCase()} ({r.location.split(',')[0]})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Historical Context & Story */}
        <div className="mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm leading-relaxed text-slate-300 font-light">
          <div className={`flex items-center gap-2 text-xs font-mono ${accentText} font-semibold mb-2`}>
            <BookOpen className="w-4 h-4" />
            <span>HISTORICAL MISSION CONTEXT · {mission.dateOrEra}</span>
          </div>
          <p>{mission.historicalContext}</p>
          {roverInfo && (
            <p className="mt-2 text-amber-200/90 font-mono text-xs">
              Landing Site: {roverInfo.location} — {roverInfo.objectiveHint}
            </p>
          )}
        </div>

        {/* Two-Column: Key Components & Required Objectives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Scientific Equipment */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Compass className={`w-3.5 h-3.5 ${accentText}`} />
              <span>Key Mission Equipment</span>
            </div>
            <div className="space-y-3">
              {mission.keyComponents.map((comp) => (
                <div key={comp.name} className="border-l-2 border-white/25 pl-3">
                  <div className="text-xs font-semibold text-slate-200">{comp.name}</div>
                  <div className="text-[11px] text-slate-400 leading-snug">{comp.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mission Objectives */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle2 className={`w-3.5 h-3.5 ${accentText}`} />
              <span>Required Simulation Objectives</span>
            </div>
            <div className="space-y-2.5">
              {mission.objectives.map((obj, idx) => (
                <div key={obj.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-black/30 border border-white/5">
                  <span className={`text-xs font-mono font-bold ${accentText} mt-0.5`}>
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{obj.title}</div>
                    <div className="text-[11px] text-slate-400">{obj.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Truth Labels */}
        <div className="mb-6 flex flex-wrap gap-2">
          {mission.truthLabels.map((lbl, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 p-2.5 rounded-lg text-xs leading-tight flex-1 min-w-[240px] ${
                lbl.type === 'MISSION FACT'
                  ? 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-200'
                  : 'bg-amber-950/35 border border-amber-500/30 text-amber-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-mono font-bold block text-[10px] tracking-wider mb-0.5">
                  {lbl.type}
                </span>
                <span className="text-[11px] opacity-90">{lbl.text}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Start Mission Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
          <div className="text-xs font-mono text-slate-400">
            Location: <span className="text-slate-200">{mission.locationDetails}</span>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onStartMission();
            }}
            className={`px-8 py-3.5 rounded-xl font-mono font-bold tracking-wider text-xs flex items-center gap-2.5 transition-all shadow-lg ${ctaButtonClass} cursor-pointer active:scale-95`}
          >
            <Rocket className="w-4 h-4" />
            <span>LAUNCH 3D MISSION {mission.number}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
