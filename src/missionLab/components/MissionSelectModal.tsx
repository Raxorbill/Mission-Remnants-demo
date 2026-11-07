import React, { useState } from 'react';
import { X, Globe2, Moon, Compass, ChevronRight, CheckCircle2, BookOpen } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { MissionId } from '../types/game';
import { MISSIONS_DATA, ROVER_CHOICES } from '../data/missionsData';

interface MissionSelectModalProps {
  onClose: () => void;
  onSelectMission: (missionId: MissionId, roverChoice?: 'spirit' | 'opportunity') => void;
  onSelectChapter?: (chapterIndex: number) => void;
  completedMissions?: Set<MissionId>;
  skippedMissions?: Set<MissionId>;
}

export const MissionSelectModal: React.FC<MissionSelectModalProps> = ({
  onClose,
  onSelectMission,
  onSelectChapter,
  completedMissions,
  skippedMissions,
}) => {
  const [selectedRover, setSelectedRover] = useState<'spirit' | 'opportunity'>('spirit');
  const [activeTab, setActiveTab] = useState<'ALL' | 'Moon' | 'Mars' | 'Deep space'>('ALL');

  const missionsList = Object.values(MISSIONS_DATA);
  const filteredMissions = activeTab === 'ALL'
    ? missionsList
    : missionsList.filter((m) => m.destination === activeTab);

  const getDestinationIcon = (dest: string) => {
    switch (dest) {
      case 'Moon':
        return <Moon className="w-3.5 h-3.5 text-slate-300" />;
      case 'Mars':
        return <Globe2 className="w-3.5 h-3.5 text-amber-400" />;
      case 'Deep space':
      default:
        return <Compass className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#0b1020] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#07111f]/80">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-1">
              Mission Lab & Story Archive
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
              HISTORICAL MISSION CATALOGUE
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Tabs */}
            <div className="hidden sm:flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10 text-xs font-mono">
              {(['ALL', 'Moon', 'Mars', 'Deep space'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveTab(tab);
                  }}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Missions Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMissions.map((m, idx) => {
            const isSpiritOpportunity = m.id === 'spirit-opportunity';
            const isCompleted = completedMissions?.has(m.id);
            const isSkipped = !isCompleted && skippedMissions?.has(m.id);
            const chapterIndex = parseInt(m.number, 10) - 1;

            return (
              <div
                key={m.id}
                className="group relative flex flex-col justify-between p-5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-cyan-500/50 transition-all shadow-lg hover:shadow-cyan-500/10"
              >
                <div>
                  {/* Top Tags */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        MISSION {m.number}
                      </span>
                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-mono text-emerald-300">
                          COMPLETED
                        </span>
                      )}
                      {isSkipped && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-400/30 text-[10px] font-mono text-amber-300">
                          SKIPPED
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">
                      {getDestinationIcon(m.destination)}
                      <span>{m.destination}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                    {m.name}
                  </h3>
                  <div className="text-[11px] font-mono text-cyan-400/80 mb-2 uppercase">
                    {m.subtitle}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-3 mb-4 font-light leading-relaxed">
                    {m.summary}
                  </p>

                  {/* Special Spirit vs Opportunity selector */}
                  {isSpiritOpportunity && (
                    <div className="mb-4 p-3 rounded-lg bg-black/40 border border-white/10">
                      <div className="text-[10px] font-mono text-slate-400 uppercase mb-2">
                        Choose Twin MER Rover:
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {ROVER_CHOICES.map((r) => (
                          <button
                            key={r.roverId}
                            onClick={() => {
                              soundEngine.playClick();
                              setSelectedRover(r.roverId);
                            }}
                            className={`p-2 rounded border text-left transition-all cursor-pointer ${
                              selectedRover === r.roverId
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            <div className="font-semibold">{r.roverId.toUpperCase()}</div>
                            <div className="text-[9px] text-slate-400 truncate">{r.location.split(',')[0]}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Objective bullets preview */}
                  <div className="space-y-1 mb-4">
                    {m.objectives.map((obj) => (
                      <div key={obj.id} className="flex items-center gap-2 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                        <span className="truncate">{obj.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons: Launch Simulation or Read Chapter */}
                <div className="flex items-center gap-2 mt-2">
                  {onSelectChapter && (
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        onSelectChapter(chapterIndex);
                        onClose();
                      }}
                      className="py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      title={`Read Chapter ${m.number}`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>CH {m.number}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onSelectMission(m.id, isSpiritOpportunity ? selectedRover : undefined);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 hover:border-cyan-400 text-cyan-200 hover:text-white text-xs font-mono font-semibold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                  >
                    <span>{isCompleted ? `REPLAY MISSION ${m.number}` : `START MISSION ${m.number}`}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
