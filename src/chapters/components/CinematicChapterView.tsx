import React, { useState, useEffect, useRef } from 'react';
import { ChapterData, Hotspot } from '../data/types';
import { JourneyStageSpec } from '../../shared/journeyConfig';
import { ModelViewer } from './ModelViewer';
import { VoyagerLivePanel } from './VoyagerLivePanel';
import { MiraChapterSection } from './AskEngineerModal';
import { ROVER_CHOICES } from '../../missionLab/data/missionsData';
import { audioService } from '../utils/audio';
import {
  ArrowRight,
  ArrowDown,
  ArrowUpRight,
  Volume2,
  Square,
  X,
} from 'lucide-react';

interface CinematicChapterViewProps {
  chapter: ChapterData;
  stageSpec: JourneyStageSpec;
  isMissionCompleted: boolean;
  onLaunchMission: () => void;
  onTriggerLaserDemo?: () => void;
  activeHotspot: Hotspot | null;
  onSelectHotspot: (hotspot: Hotspot | null) => void;
  onOpenSources: () => void;
  onOpenMira?: () => void;
  onNextChapter: () => void;
  onPrevChapter?: () => void;
  isLastChapter: boolean;
  reducedMotion: boolean;
  roverSelection: 'opportunity' | 'spirit';
  onRoverChange: (rover: 'opportunity' | 'spirit') => void;
  laserTrigger: number;
}

const SLIDE_META = [
  { id: 'slide-1', num: '01', label: 'Question' },
  { id: 'slide-2', num: '02', label: '3D Model' },
  { id: 'slide-3', num: '03', label: 'Discovery' },
  { id: 'slide-4', num: '04', label: 'MIRA & Lab' },
];

export const CinematicChapterView: React.FC<CinematicChapterViewProps> = ({
  chapter,
  stageSpec,
  isMissionCompleted,
  onLaunchMission,
  activeHotspot,
  onSelectHotspot,
  onOpenSources,
  onOpenMira,
  onNextChapter,
  isLastChapter,
  reducedMotion,
  roverSelection,
  onRoverChange,
  laserTrigger,
}) => {
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<{
    src: string;
    alt: string;
    caption: string;
    credit: string;
    sourceUrl: string;
  } | null>(null);

  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const stageNumber = stageSpec.index + 1;

  useEffect(() => {
    setActiveSlide(0);
    return () => {
      audioService.stopNarration();
    };
  }, [stageNumber]);

  // Track which vertical scroll slide is currently active
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-slide-idx') || 0);
            setActiveSlide(idx);
          }
        });
      },
      { threshold: 0.42 }
    );

    slideRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [chapter.id]);

  const scrollToSlide = (idx: number) => {
    const el = slideRefs.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleToggleNarration = () => {
    if (isNarrating) {
      audioService.stopNarration();
      setIsNarrating(false);
    } else {
      const script = `${chapter.bannerIn}. ${chapter.steps[0]?.text || ''} ${chapter.discovery.finding}`;
      audioService.narrateText(script, (speaking) => {
        setIsNarrating(speaking);
      });
    }
  };

  const hardwarePhotos = chapter.hardwarePhotos || [chapter.photo];

  const isMars = stageSpec.envTheme === 'mars';
  const isVoid = stageSpec.envTheme === 'void';

  const accentText = isMars
    ? 'text-[#FB923C]'
    : isVoid
    ? 'text-[#7DD3FC]'
    : 'text-[#67E8F9]';

  const primaryBtnClass = isMars
    ? 'bg-[#EA580C] hover:bg-[#F97316] text-white'
    : 'bg-white hover:bg-slate-200 text-[#030712]';

  const handleImageError = (src: string) => {
    setFailedImages((prev) => ({ ...prev, [src]: true }));
  };

  return (
    <article className="relative w-full max-w-6xl mx-auto text-[#F8FAFC]">
      {/* Subtle Right-Edge Vertical Slide Rail (Desktop) */}
      <nav
        aria-label="Chapter slides"
        className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col gap-3 bg-[#050811]/80 backdrop-blur-md border border-white/10 rounded-xl p-2.5"
      >
        {SLIDE_META.map((s, idx) => {
          const isCurrent = activeSlide === idx;
          return (
            <button
              key={s.id}
              onClick={() => scrollToSlide(idx)}
              className={`px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer flex items-center gap-2 ${
                isCurrent
                  ? 'bg-white text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={`Scroll to Slide ${s.num}: ${s.label}`}
            >
              <span className="font-mono text-[10px]">{s.num}</span>
              <span className="text-[11px]">{s.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════
          SLIDE 01 — THE QUESTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={(el) => {
          slideRefs.current[0] = el;
        }}
        data-slide-idx={0}
        className="min-h-[calc(100vh-56px)] flex flex-col justify-center py-14 border-b border-white/10"
        aria-label="Slide 1: The Question"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left 7 Columns: The Question & Concise Lead */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-slate-400">
              <span className={accentText}>Slide 01 / 04</span>
              <span aria-hidden="true">·</span>
              <span>Chapter {stageSpec.stageNumber}</span>
              <span aria-hidden="true">·</span>
              <span>{stageSpec.envLocation}</span>
            </div>

            <h1
              className="text-3xl sm:text-5xl lg:text-[3.5rem] font-bold font-head text-white tracking-tight leading-[1.08]"
              style={{ textWrap: 'balance' }}
            >
              “{chapter.bannerIn}”
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-[58ch] font-light">
              {chapter.steps[0]?.text}
            </p>

            {/* Clean Action Row */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => scrollToSlide(1)}
                className={`px-5 py-2.5 rounded-lg font-medium text-xs sm:text-sm ${primaryBtnClass} transition-all inline-flex items-center gap-2 cursor-pointer`}
              >
                <span>Inspect 3D Spacecraft</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={handleToggleNarration}
                className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-mono border transition-colors inline-flex items-center gap-2 cursor-pointer ${
                  isNarrating
                    ? 'bg-white/15 border-white/40 text-white'
                    : 'bg-transparent hover:bg-white/5 border-white/15 text-slate-300 hover:text-white'
                }`}
              >
                {isNarrating ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current text-amber-300" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-slate-300" />
                    <span>Narrate Story</span>
                  </>
                )}
              </button>

              <button
                onClick={onLaunchMission}
                className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-mono text-slate-300 hover:text-white border border-white/10 hover:border-white/30 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Enter 3D Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right 5 Columns: Simple 3-Line Artifact Summary */}
          <div className="lg:col-span-5 bg-[#060A14] border border-white/10 rounded-xl p-6 space-y-4 text-xs">
            <div className="flex items-baseline justify-between py-2 border-b border-white/10">
              <span className="font-mono text-slate-500">Spacecraft</span>
              <span className="text-white font-medium text-right">{chapter.machine}</span>
            </div>

            <div className="flex items-baseline justify-between py-2 border-b border-white/10">
              <span className="font-mono text-slate-500">Resting Place</span>
              <span className="text-slate-200 text-right max-w-[240px]">{chapter.whereItIs}</span>
            </div>

            <div className="flex items-baseline justify-between py-2 border-b border-white/10">
              <span className="font-mono text-slate-500">Status</span>
              <span className={`${accentText} font-mono text-right`}>{chapter.status.chip}</span>
            </div>

            <div className="pt-1 space-y-1">
              <span className="font-mono text-slate-500 block">In One Sentence</span>
              <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                {chapter.shortAnswer}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SLIDE 02 — INTERACTIVE 3D SPACECRAFT
          ═══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={(el) => {
          slideRefs.current[1] = el;
        }}
        data-slide-idx={1}
        className="min-h-[calc(100vh-56px)] flex flex-col justify-center py-14 border-b border-white/10 space-y-5"
        aria-label="Slide 2: 3D Spacecraft Anatomy"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="space-y-1">
            <span className={`text-xs font-mono ${accentText} block`}>
              Slide 02 / 04 · Interactive 3D Hardware
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-head text-white">
              {chapter.machine}
            </h2>
          </div>

          <button
            onClick={() => scrollToSlide(2)}
            className="text-xs font-mono text-slate-400 hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Next Slide: The Discovery</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Single Unified Architectural 3D Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-white/15 rounded-xl overflow-hidden bg-[#040710]">
          {/* 3D Interactive Stage (8 cols) */}
          <div className="lg:col-span-8 h-[440px] sm:h-[520px] border-b lg:border-b-0 lg:border-r border-white/10">
            <ModelViewer
              chapter={chapter}
              activeHotspot={activeHotspot}
              onSelectHotspot={onSelectHotspot}
              reducedMotion={reducedMotion}
              roverSelection={roverSelection}
              onRoverChange={onRoverChange}
              laserTrigger={laserTrigger}
            />
          </div>

          {/* Flush Subsystem Inspector (4 cols) */}
          <div className="lg:col-span-4 p-6 flex flex-col justify-between bg-[#060A16]">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-3 border-b border-white/10">
                <span>Subsystems</span>
                <span>{chapter.hotspots.length} Parts</span>
              </div>

              {activeHotspot ? (
                <div className="space-y-3">
                  <h3 className="font-head font-bold text-lg text-white">
                    {activeHotspot.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {activeHotspot.job}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-white/10">
                    {activeHotspot.learned}
                  </p>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {chapter.steps[1]?.text}
                </p>
              )}
            </div>

            {/* Subsystem Selector List */}
            <div className="pt-4 border-t border-white/10 space-y-1">
              {chapter.hotspots.map((hs, idx) => {
                const isSelected = activeHotspot?.id === hs.id;
                return (
                  <button
                    key={hs.id}
                    onClick={() => onSelectHotspot(isSelected ? null : hs)}
                    className={`w-full py-2 px-2.5 rounded text-xs text-left transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate">
                      <span className="font-mono text-slate-500 mr-2.5">0{idx + 1}</span>
                      {hs.label}
                    </span>
                    {isSelected && <span className="text-[10px] font-mono text-slate-300">Active</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SLIDE 03 — THE DISCOVERY
          ═══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={(el) => {
          slideRefs.current[2] = el;
        }}
        data-slide-idx={2}
        className="min-h-[calc(100vh-56px)] flex flex-col justify-center py-14 border-b border-white/10 space-y-8"
        aria-label="Slide 3: Scientific Discovery"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <span className={`text-xs font-mono ${accentText}`}>
            Slide 03 / 04 · Scientific Discovery
          </span>
          <button
            onClick={() => scrollToSlide(3)}
            className="text-xs font-mono text-slate-400 hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Next Slide: Ask MIRA & Mission Lab</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left 5 Cols: Key Metric & Discovery */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold font-head text-white leading-snug">
              {chapter.discovery.title}
            </h2>

            <div className="py-4 border-y border-white/10">
              <div className="text-xs font-mono text-slate-400 mb-1">
                {chapter.discovery.numberLabel}
              </div>
              <div className={`text-4xl sm:text-5xl font-mono font-bold ${accentText} tracking-tight tabular-nums`}>
                {chapter.discovery.keyNumber}
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              {chapter.discovery.finding}
            </p>

            <button
              onClick={onOpenSources}
              className="text-xs font-mono text-slate-400 hover:text-white underline underline-offset-4 cursor-pointer"
            >
              View Official NASA Sources & 3D References
            </button>
          </div>

          {/* Right 7 Cols: 2 Clean Archival Plates or Voyager Live Panel */}
          <div className="lg:col-span-7">
            {chapter.modelType === 'voyager' ? (
              <VoyagerLivePanel />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[chapter.discoveryPhoto, hardwarePhotos[0]].filter(Boolean).map((photo, index) => {
                  const hasFailed = failedImages[photo.src];
                  return (
                    <figure key={index} className="space-y-2.5 group">
                      <div
                        onClick={() => setSelectedPhoto(photo)}
                        className="relative rounded-xl overflow-hidden border border-white/10 cursor-pointer h-60 bg-[#030712] flex items-center justify-center"
                      >
                        {!hasFailed ? (
                          <img
                            src={photo.src}
                            alt={photo.alt}
                            referrerPolicy="no-referrer"
                            onError={() => handleImageError(photo.src)}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                          />
                        ) : (
                          <div className="p-6 text-center">
                            <p className="text-xs text-slate-500">{photo.alt}</p>
                          </div>
                        )}
                      </div>
                      <figcaption className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {photo.caption}
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SLIDE 04 — ASK MIRA & ENTER 3D MISSION LAB
          ═══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={(el) => {
          slideRefs.current[3] = el;
        }}
        data-slide-idx={3}
        className="min-h-[calc(100vh-56px)] flex flex-col justify-center py-14 space-y-12"
        aria-label="Slide 4: Ask MIRA and Launch Simulation"
      >
        {/* Top Part of Slide 04: Chapter-Wise MIRA Q&A (Ch 01 – Ch 06 Tabs) */}
        <MiraChapterSection chapter={chapter} onOpenModal={onOpenMira} />

        {/* Bottom Part of Slide 04: Clean Launch Card for 3D Mission Lab */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#060A14] border border-white/15 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400">
              <span className={accentText}>Interactive 3D Mission Lab</span>
              <span aria-hidden="true">·</span>
              <span>Mission {stageSpec.stageNumber}: {stageSpec.missionName}</span>
              {isMissionCompleted && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400">Completed</span>
                </>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-head text-white">
              {stageSpec.chapterToMissionHeadline}
            </h3>

            {chapter.modelType === 'rover' && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-slate-400 mr-1">Choose Rover:</span>
                {ROVER_CHOICES.map((r) => (
                  <button
                    key={r.roverId}
                    onClick={() => onRoverChange(r.roverId)}
                    className={`px-3 py-1 rounded border text-xs font-mono transition-colors cursor-pointer ${
                      roverSelection === r.roverId
                        ? 'bg-white text-black border-white font-semibold'
                        : 'bg-transparent border-white/15 text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onLaunchMission}
              className={`px-6 py-3.5 rounded-xl font-medium text-sm ${primaryBtnClass} transition-all inline-flex items-center gap-2 cursor-pointer`}
            >
              <span>
                {isMissionCompleted
                  ? `Replay Mission ${stageSpec.stageNumber}`
                  : `Launch Mission ${stageSpec.stageNumber}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNextChapter}
              className="px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isLastChapter ? 'Finale' : `Chapter 0${stageNumber + 1}`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* High-Resolution Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-[#070B14] border border-white/15 rounded-xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-mono text-slate-400">
                NASA Archival Plate · {selectedPhoto.credit}
              </span>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                aria-label="Close photo view"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden rounded-lg bg-black flex items-center justify-center min-h-[300px]">
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                referrerPolicy="no-referrer"
                className="max-h-[62vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <p className="text-slate-200 leading-relaxed">{selectedPhoto.caption}</p>
              <a
                href={selectedPhoto.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-slate-400 hover:text-white inline-flex items-center gap-1 shrink-0"
              >
                <span>Official Record</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
