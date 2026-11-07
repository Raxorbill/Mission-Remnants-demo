import React, { useState } from 'react';
import {
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { MissionData } from '../types/game';
import { JourneyStageSpec } from '../../shared/journeyConfig';

interface MissionCompleteModalProps {
  mission: MissionData;
  stageSpec?: JourneyStageSpec;
  onContinueToNextChapter?: () => void;
  onReturnToChapter?: () => void;
  onReplay: () => void;
  onReturnToSelection: () => void;
}

export const MissionCompleteModal: React.FC<MissionCompleteModalProps> = ({
  mission,
  stageSpec,
  onContinueToNextChapter,
  onReturnToChapter,
  onReplay,
  onReturnToSelection,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  const isMars = mission.destination === 'Mars';
  const primaryBtn = isMars
    ? 'bg-[#EA580C] hover:bg-[#F97316] text-white'
    : 'bg-white hover:bg-slate-200 text-slate-950';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md select-none text-white">
      <div className="relative w-full max-w-xl bg-[#080C16] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
        {/* Top 2-Step Indicator */}
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/10">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mission 0{mission.number} Complete</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundEngine.playClick();
                setStep(1);
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                step === 1
                  ? 'bg-white text-slate-950 font-semibold'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              1 · Discovery
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setStep(2);
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                step === 2
                  ? 'bg-white text-slate-950 font-semibold'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              2 · Next Question
            </button>
          </div>
        </div>

        {/* STEP 1: WHAT YOU ACCOMPLISHED & LEARNED */}
        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-head text-white tracking-tight">
                {mission.completionTitle}
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-1">
                {mission.name} · {mission.locationDetails}
              </p>
            </div>

            {/* Concise Accomplished List */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              {mission.objectives.map((obj) => (
                <div
                  key={obj.id}
                  className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{obj.title}</span>
                </div>
              ))}
            </div>

            {/* Single Clean Discovery Takeaway */}
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-slate-400">
                What Humanity Discovered
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-light">
                {mission.learningCard}
              </p>
            </div>

            {/* Step 1 Footer Button */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onReplay();
                }}
                className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setStep(2);
                }}
                className={`px-6 py-3 rounded-lg font-medium text-sm ${primaryBtn} inline-flex items-center gap-2 transition-all cursor-pointer`}
              >
                <span>Next: The Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: NEXT QUESTION & CONTINUE */
          <div className="space-y-6">
            {stageSpec && onContinueToNextChapter ? (
              <>
                <div className="space-y-2">
                  <div className="text-xs font-mono text-amber-400">
                    Next Stage · {stageSpec.nextChapterTitle}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-head text-white leading-snug">
                    “{stageSpec.missionToNextQuestion}”
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light pt-1">
                    {stageSpec.missionToNextHeadline}
                  </p>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onContinueToNextChapter();
                  }}
                  className={`w-full py-3.5 px-6 rounded-xl font-medium text-sm ${primaryBtn} flex items-center justify-center gap-2 transition-all cursor-pointer`}
                >
                  <span>Continue to {stageSpec.nextChapterTitle}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold font-head text-white">
                  Journey Stage Complete
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {mission.historicalFact}
                </p>
              </div>
            )}

            {/* Step 2 Secondary Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setStep(1);
                }}
                className="hover:text-white inline-flex items-center gap-1 cursor-pointer py-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Discovery</span>
              </button>

              <div className="flex items-center gap-4">
                {onReturnToChapter && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onReturnToChapter();
                    }}
                    className="hover:text-white cursor-pointer py-1"
                  >
                    Chapter 0{mission.number}
                  </button>
                )}
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onReturnToSelection();
                  }}
                  className="hover:text-white cursor-pointer py-1"
                >
                  All Missions
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
