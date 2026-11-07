import React from 'react';
import {
  X,
  Moon,
  Globe2,
  Compass,
  BookOpen,
  Rocket,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Play,
  Radio
} from 'lucide-react';
import { JOURNEY_STAGES, JourneyStageSpec } from '../shared/journeyConfig';
import { chaptersData } from '../chapters/data/chapters';
import { MISSIONS_DATA } from '../missionLab/data/missionsData';
import { MissionId } from '../missionLab/types/game';

interface JourneyMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStageIndex: number;
  currentMode: 'prologue' | 'chapter' | 'mission' | 'finale';
  visitedChapters: Set<number>;
  completedMissions: Set<MissionId>;
  skippedMissions: Set<MissionId>;
  onSelectChapter: (stageIndex: number) => void;
  onSelectMission: (stageIndex: number) => void;
  onReplayPrologue: () => void;
  onOpenFinale: () => void;
  onResetProgress: () => void;
}

export const JourneyMapModal: React.FC<JourneyMapModalProps> = ({
  isOpen,
  onClose,
  currentStageIndex,
  currentMode,
  visitedChapters,
  completedMissions,
  skippedMissions,
  onSelectChapter,
  onSelectMission,
  onReplayPrologue,
  onOpenFinale,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  const totalCompleted = visitedChapters.size + completedMissions.size;

  const themeGroups: Array<{
    theme: 'moon' | 'mars' | 'void';
    title: string;
    subtitle: string;
    distance: string;
    stages: JourneyStageSpec[];
  }> = [
    {
      theme: 'moon',
      title: 'THEME I · THE MOON',
      subtitle: 'Airless Regolith, Sharp Solar Shadows & Laser/Seismic Precision',
      distance: '384,400 KM FROM EARTH',
      stages: JOURNEY_STAGES.filter((s) => s.envTheme === 'moon'),
    },
    {
      theme: 'mars',
      title: 'THEME II · MARS',
      subtitle: 'Iron-Oxide Plains, Butterscotch Dust Sky & Ancient Water Trails',
      distance: '225,000,000 KM FROM EARTH',
      stages: JOURNEY_STAGES.filter((s) => s.envTheme === 'mars'),
    },
    {
      theme: 'void',
      title: 'THEME III · THE INTERSTELLAR VOID',
      subtitle: 'Deep Space Darkness, Heliopause Boundary & The Pale Blue Dot',
      distance: '24,900,000,000+ KM FROM EARTH',
      stages: JOURNEY_STAGES.filter((s) => s.envTheme === 'void'),
    },
  ];

  const getThemeIcon = (theme: 'moon' | 'mars' | 'void') => {
    if (theme === 'mars') return <Globe2 className="w-4 h-4 text-[#F97316]" />;
    if (theme === 'void') return <Compass className="w-4 h-4 text-[#EAB308]" />;
    return <Moon className="w-4 h-4 text-[#00E5FF]" />;
  };

  const getThemeAccentBorder = (theme: 'moon' | 'mars' | 'void') => {
    if (theme === 'mars') return 'border-[#F97316]/35 bg-[#1A0D08]/90';
    if (theme === 'void') return 'border-[#38BDF8]/35 bg-[#060B18]/90';
    return 'border-[#00E5FF]/35 bg-[#0A1224]/90';
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none text-white"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#070C18] border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 border-b border-white/10 bg-[#050811]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>NASA SPACE APPS CHALLENGE · ABANDONED, BUT NOT FORGOTTEN · TEAM NOVOSRITI ({totalCompleted}/12)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-head text-white tracking-tight">
              Mission Remnants · Prologue → 6 Chapters → 6 Interactive 3D Missions
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                onReplayPrologue();
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              <span>Scroll Prologue</span>
            </button>

            <button
              onClick={() => {
                onOpenFinale();
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Finale Constellation</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              aria-label="Close Journey Map"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Journey Timeline */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {themeGroups.map((group) => (
            <div
              key={group.theme}
              className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${getThemeAccentBorder(group.theme)}`}
            >
              {/* Environmental Theme Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  {getThemeIcon(group.theme)}
                  <div>
                    <h3 className="text-sm font-mono font-bold tracking-wider uppercase text-white">
                      {group.title}
                    </h3>
                    <p className="text-xs text-slate-400">{group.subtitle}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-black/40 border border-white/10 text-[11px] font-mono text-slate-300">
                  {group.distance}
                </span>
              </div>

              {/* Stages within this Environmental Theme */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {group.stages.map((stage) => {
                  const ch = chaptersData[stage.index];
                  const mission = MISSIONS_DATA[stage.missionId];
                  const isChVisited = visitedChapters.has(stage.index);
                  const isMissionDone = completedMissions.has(stage.missionId);
                  const isMissionSkipped = !isMissionDone && skippedMissions.has(stage.missionId);
                  const isActiveChapter =
                    currentMode === 'chapter' && currentStageIndex === stage.index;
                  const isActiveMission =
                    currentMode === 'mission' && currentStageIndex === stage.index;

                  return (
                    <div
                      key={stage.chapterId}
                      className="rounded-xl bg-black/45 border border-white/10 p-4 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>STAGE {stage.stageNumber} · {mission.dateOrEra}</span>
                          <span>{ch.distanceLabel}</span>
                        </div>
                        <div className="text-base font-bold font-head text-white">
                          "{ch.bannerIn}"
                        </div>
                        <p className="text-xs text-slate-400">
                          Hardware: <span className="text-slate-200 font-medium">{ch.machine}</span>
                        </p>
                      </div>

                      {/* Connected Two-Step Flow: Chapter -> Mission */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {/* Step A: Story Chapter */}
                        <button
                          onClick={() => {
                            onSelectChapter(stage.index);
                            onClose();
                          }}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                            isActiveChapter
                              ? 'bg-cyan-500/20 border-cyan-400 text-white'
                              : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase mb-1">
                            <span className="flex items-center gap-1 text-cyan-300">
                              <BookOpen className="w-3 h-3" />
                              <span>CHAPTER {stage.stageNumber}</span>
                            </span>
                            {isChVisited && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </div>
                          <div className="text-xs font-bold truncate">{ch.title}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-1 flex items-center justify-between">
                            <span>{isActiveChapter ? 'CURRENTLY READING' : 'Story & 3D Anatomy'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </button>

                        {/* Step B: Mission Lab Simulation */}
                        <button
                          onClick={() => {
                            onSelectMission(stage.index);
                            onClose();
                          }}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                            isActiveMission
                              ? 'bg-amber-500/20 border-amber-400 text-white'
                              : isMissionDone
                              ? 'bg-emerald-950/25 hover:bg-emerald-950/40 border-emerald-500/35 text-slate-100'
                              : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase mb-1">
                            <span className="flex items-center gap-1 text-amber-300">
                              <Rocket className="w-3 h-3" />
                              <span>MISSION {stage.stageNumber}</span>
                            </span>
                            {isMissionDone ? (
                              <span className="text-[9px] text-emerald-300 font-bold">DONE</span>
                            ) : isMissionSkipped ? (
                              <span className="text-[9px] text-amber-300">SKIPPED</span>
                            ) : null}
                          </div>
                          <div className="text-xs font-bold truncate">{mission.name}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-1 flex items-center justify-between">
                            <span>{isMissionDone ? 'Replay 3D Sim' : 'Launch 3D Sim'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-[#050811] text-xs font-mono text-slate-400">
          <div>
            Progress is automatically saved in your browser so you can resume any chapter or simulation anytime.
          </div>
          <button
            onClick={onResetProgress}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-slate-300 hover:text-red-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Journey Progress</span>
          </button>
        </div>
      </div>
    </div>
  );
};
