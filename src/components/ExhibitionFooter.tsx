import React from 'react';
import { JOURNEY_STAGES } from '../shared/journeyConfig';
import { MissionId } from '../missionLab/types/game';
import { ArrowUpRight } from 'lucide-react';

interface ExhibitionFooterProps {
  currentStageIndex: number;
  completedMissions: Set<MissionId>;
  onSelectChapter: (idx: number) => void;
  onSelectMission: (idx: number) => void;
  onReplayPrologue: () => void;
  onOpenFinale: () => void;
  onOpenSources: () => void;
  onOpenMira: () => void;
  onOpenJourneyMap: () => void;
}

export const ExhibitionFooter: React.FC<ExhibitionFooterProps> = ({
  currentStageIndex,
  completedMissions,
  onSelectChapter,
  onSelectMission,
  onReplayPrologue,
  onOpenFinale,
  onOpenSources,
  onOpenMira,
  onOpenJourneyMap,
}) => {
  const moonStages = JOURNEY_STAGES.filter((s) => s.envTheme === 'moon');
  const marsStages = JOURNEY_STAGES.filter((s) => s.envTheme === 'mars');
  const voidStages = JOURNEY_STAGES.filter((s) => s.envTheme === 'void');

  const renderStageLinks = (stages: typeof JOURNEY_STAGES) => (
    <ul className="space-y-3">
      {stages.map((stg) => {
        const isCurrent = currentStageIndex === stg.index;
        const isDone = completedMissions.has(stg.missionId);
        return (
          <li key={stg.chapterId} className="group flex flex-col gap-0.5">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => onSelectChapter(stg.index)}
                className={`text-left text-xs transition-colors cursor-pointer ${
                  isCurrent
                    ? 'text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span className="font-mono text-slate-500 mr-2">{stg.stageNumber}</span>
                <span>{stg.chapterTitle}</span>
              </button>
              <button
                onClick={() => onSelectMission(stg.index)}
                className="text-[11px] font-mono text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                title={`Launch ${stg.missionName} 3D Simulation`}
              >
                {isDone ? '3D Lab ✓' : '3D Lab →'}
              </button>
            </div>
            <span className="text-[11px] text-slate-500 pl-6 truncate">
              {stg.envLocation}
            </span>
          </li>
        );
      })}
    </ul>
  );

  return (
    <footer className="w-full border-t border-white/10 bg-[#03060E]/95 text-slate-400 mt-20 relative z-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 sm:py-16 space-y-12">
        {/* Official NASA Space Apps Challenge Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-10 border-b border-white/10 text-xs">
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-slate-500 mb-1">
              Event
            </div>
            <div className="font-head font-bold text-white tracking-wide">
              NASA SPACE APPS CHALLENGE
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-slate-500 mb-1">
              Challenge
            </div>
            <div className="font-medium text-slate-200">
              Abandoned, But Not Forgotten
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-slate-500 mb-1">
              Team
            </div>
            <div className="font-medium text-amber-400">
              NovoSriti
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-slate-500 mb-1">
              Project
            </div>
            <div className="font-medium text-white">
              Mission Remnants
            </div>
          </div>
        </div>

        {/* Top Exhibition Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand & Exhibition Statement (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="space-y-1">
              <div className="font-head font-bold text-sm tracking-[0.18em] uppercase text-white">
                Mission Remnants
              </div>
              <div className="text-xs font-mono text-slate-500">
                Team NovoSriti · Built for a Question
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Every spacecraft humanity launched was built to answer a single question.
              Long after their transmitters fell silent, these artifacts remain on distant
              worlds as permanent monuments to human curiosity.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono">
              <button
                onClick={onReplayPrologue}
                className="text-slate-300 hover:text-white underline underline-offset-4 cursor-pointer"
              >
                Scroll Prologue
              </button>
              <button
                onClick={onOpenJourneyMap}
                className="text-slate-300 hover:text-white underline underline-offset-4 cursor-pointer"
              >
                Journey Index
              </button>
              <button
                onClick={onOpenMira}
                className="text-slate-300 hover:text-white underline underline-offset-4 cursor-pointer"
              >
                MIRA Archive
              </button>
              <button
                onClick={onOpenSources}
                className="text-slate-300 hover:text-white underline underline-offset-4 cursor-pointer"
              >
                NASA Sources & 3D CAD
              </button>
            </div>
          </div>

          {/* Realm I: The Moon (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-[11px] font-mono text-slate-400 border-b border-white/10 pb-2 flex items-center justify-between">
              <span>I. The Moon</span>
              <span className="text-slate-500">384,400 km</span>
            </div>
            {renderStageLinks(moonStages)}
          </div>

          {/* Realm II: Mars (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-[11px] font-mono text-slate-400 border-b border-white/10 pb-2 flex items-center justify-between">
              <span>II. Mars</span>
              <span className="text-slate-500">225M km</span>
            </div>
            {renderStageLinks(marsStages)}
          </div>

          {/* Realm III: Deep Space (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <div className="text-[11px] font-mono text-slate-400 border-b border-white/10 pb-2 flex items-center justify-between">
              <span>III. Deep Space</span>
              <span className="text-slate-500">24.5B km</span>
            </div>
            {renderStageLinks(voidStages)}
            <div className="pt-2 border-t border-white/5">
              <button
                onClick={onOpenFinale}
                className="text-left text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <span className="font-mono text-slate-500 mr-2">07</span>
                <span>Your Question</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Colophon */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
          <div>
            NASA Space Apps Challenge · Challenge: Abandoned, But Not Forgotten · Team: NovoSriti · Project: Mission Remnants
          </div>
          <div className="flex items-center gap-5">
            <a
              href="https://science.nasa.gov/3d-resources/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 inline-flex items-center gap-1 transition-colors"
            >
              <span>NASA 3D Resources</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href="https://api.nasa.gov/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 inline-flex items-center gap-1 transition-colors"
            >
              <span>api.nasa.gov</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
