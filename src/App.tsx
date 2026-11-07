import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  JOURNEY_STAGES,
  loadJourneyState,
  saveJourneyState,
} from './shared/journeyConfig';
import { chaptersData } from './chapters/data/chapters';
import { Hotspot, ChapterData } from './chapters/data/types';
import { SpaceAtmosphere } from './chapters/components/SpaceAtmosphere';
import { CinematicChapterView } from './chapters/components/CinematicChapterView';
import { CinematicTransition } from './chapters/components/CinematicTransition';
import { ConstellationFinale } from './chapters/components/ConstellationFinale';
import { AskEngineerModal } from './chapters/components/AskEngineerModal';
import { SourcesDrawer } from './chapters/components/SourcesDrawer';
import { SettingsDrawer } from './chapters/components/SettingsDrawer';
import { AudioCaptionBanner } from './chapters/components/AudioCaptionBanner';
import { audioService } from './chapters/utils/audio';

import { MissionId, GameScreen, MissionTelemetry } from './missionLab/types/game';
import { MISSIONS_DATA } from './missionLab/data/missionsData';
import { MissionGameEngine } from './missionLab/game/engine/MissionGameEngine';
import { soundEngine } from './missionLab/audio/soundEngine';
import { MissionSelectModal } from './missionLab/components/MissionSelectModal';
import { MissionBriefing } from './missionLab/components/MissionBriefing';
import { GameHUD } from './missionLab/components/GameHUD';
import { PauseMenu } from './missionLab/components/PauseMenu';
import { MissionCompleteModal } from './missionLab/components/MissionCompleteModal';
import { PhotoCaptureView } from './missionLab/components/PhotoCaptureView';
import { WaveformView } from './missionLab/components/WaveformView';
import { GoldenRecordModal } from './missionLab/components/GoldenRecordModal';
import { ControlsOverlay } from './missionLab/components/ControlsOverlay';
import { JourneyMapModal } from './components/JourneyMapModal';
import { ExhibitionFooter } from './components/ExhibitionFooter';

import {
  Map,
  Settings,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

type JourneyMode = 'prologue' | 'chapter' | 'mission' | 'finale';

declare global {
  interface Window {
    __prologueController?: {
      pause?: () => void;
      resume?: () => void;
    };
  }
}

export default function App() {
  const initialSaved = useRef(loadJourneyState());

  // Always land the visitor on the Prologue when entering the website
  const [mode, setMode] = useState<JourneyMode>('prologue');

  const [stageIndex, setStageIndex] = useState<number>(0);

  const [prologueCompleted, setPrologueCompleted] = useState<boolean>(false);
  const [visitedChapters, setVisitedChapters] = useState<Set<number>>(
    () => new Set(initialSaved.current.visitedChapters)
  );
  const [completedMissions, setCompletedMissions] = useState<Set<MissionId>>(
    () => new Set(initialSaved.current.completedMissions)
  );
  const [skippedMissions, setSkippedMissions] = useState<Set<MissionId>>(
    () => new Set(initialSaved.current.skippedMissions)
  );
  const [roverSelection, setRoverSelection] = useState<'opportunity' | 'spirit'>(
    initialSaved.current.roverChoice || 'opportunity'
  );

  // Chapter state
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [laserTrigger, setLaserTrigger] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [pendingStageIndex, setPendingStageIndex] = useState<number>(0);

  // Accessibility & Display Settings
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Modals & Drawers
  const [isJourneyMapOpen, setIsJourneyMapOpen] = useState<boolean>(false);
  const [isMissionCatalogueOpen, setIsMissionCatalogueOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Mission Lab 3D Engine & State
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MissionGameEngine | null>(null);
  const [missionScreen, setMissionScreen] = useState<GameScreen>('playing');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [completedObjectives, setCompletedObjectives] = useState<Set<string>>(new Set());
  const [lastCompletedTitle, setLastCompletedTitle] = useState<string | null>(null);
  const [contextActionLabel, setContextActionLabel] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<MissionTelemetry>({});
  const [specialView, setSpecialView] = useState<{
    type: 'photo' | 'waveform' | 'golden_record';
    data?: any;
  } | null>(null);

  const currentStage = JOURNEY_STAGES[Math.min(stageIndex, JOURNEY_STAGES.length - 1)];
  const currentChapter: ChapterData = chaptersData[currentStage.index];
  const activeMissionId: MissionId = currentStage.missionId;
  const activeMissionData = MISSIONS_DATA[activeMissionId];

  // Sync environmental theme attribute on document root & body
  useEffect(() => {
    const activeTheme = mode === 'finale' ? 'void' : currentStage.envTheme;
    document.documentElement.setAttribute('data-env-theme', activeTheme);
    document.body.setAttribute('data-env-theme', activeTheme);
  }, [mode, currentStage.envTheme]);

  // Show/hide the Scroll Prologue DOM container (#prologueContainer) based on mode
  useEffect(() => {
    const prologueEl = document.getElementById('prologueContainer');
    if (!prologueEl) return;

    if (mode === 'prologue') {
      prologueEl.style.display = 'block';
      requestAnimationFrame(() => {
        prologueEl.style.opacity = '1';
      });
      window.__prologueController?.resume?.();
    } else {
      prologueEl.style.opacity = '0';
      prologueEl.style.display = 'none';
      window.__prologueController?.pause?.();
    }
  }, [mode]);

  // Initialize Mission Lab 3D Engine on mount (canvasMountRef is ALWAYS rendered in the DOM)
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new MissionGameEngine(canvasMountRef.current, {
      onObjectiveUpdate: (objectiveId: string, completed: boolean, title?: string) => {
        setCompletedObjectives((prev) => {
          const next = new Set(prev);
          if (completed) next.add(objectiveId);
          else next.delete(objectiveId);
          return next;
        });
        if (completed && title) {
          setLastCompletedTitle(title);
          setTimeout(() => setLastCompletedTitle(null), 4000);
        }
      },
      onContextActionChange: (actionLabel: string | null) => {
        setContextActionLabel(actionLabel);
      },
      onTelemetryUpdate: (newTelemetry: MissionTelemetry) => {
        setTelemetry((prev) => ({ ...prev, ...newTelemetry }));
      },
      onMissionComplete: (missionId: MissionId) => {
        setCompletedMissions((prev) => {
          const next = new Set(prev);
          next.add(missionId);
          return next;
        });
        setMissionScreen('complete');
      },
      onSpecialView: (viewType, data) => {
        if (!viewType) {
          setSpecialView(null);
        } else {
          setSpecialView({ type: viewType, data });
        }
      },
    });

    engineRef.current = engine;

    // If initial mode is already 'mission', immediately load the active mission
    if (mode === 'mission') {
      const initStage = JOURNEY_STAGES[Math.min(stageIndex, JOURNEY_STAGES.length - 1)];
      engine.loadMission(initStage.missionId, roverSelection);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPaused((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      engine.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Launch a Mission into the 3D Engine
  const startPlayingMission = useCallback(
    (missionId: MissionId, rover: 'spirit' | 'opportunity' = roverSelection) => {
      setCompletedObjectives(new Set());
      setContextActionLabel(null);
      setTelemetry({});
      setSpecialView(null);
      setIsPaused(false);
      setMissionScreen('playing');

      if (engineRef.current) {
        engineRef.current.loadMission(missionId, rover);
        requestAnimationFrame(() => {
          engineRef.current?.resize();
        });
      }
    },
    [roverSelection]
  );

  // Navigate to a Chapter
  const navigateToChapter = useCallback(
    (targetIdx: number, withTransition = false) => {
      setActiveHotspot(null);
      setIsPaused(false);
      setSpecialView(null);
      soundEngine.stopRoverMotor();

      if (targetIdx >= JOURNEY_STAGES.length) {
        setMode('finale');
        window.location.hash = '#finale';
        return;
      }

      if (withTransition && mode === 'chapter') {
        setPendingStageIndex(targetIdx);
        setIsTransitioning(true);
      } else {
        setStageIndex(targetIdx);
        setMode('chapter');
        window.location.hash = `#ch${targetIdx + 1}`;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [mode]
  );

  // Navigate to a Mission Lab experience (launches directly into the 3D simulation by default)
  const navigateToMission = useCallback(
    (targetIdx: number, startImmediately = true) => {
      const targetStage = JOURNEY_STAGES[targetIdx];
      if (!targetStage) return;

      setStageIndex(targetIdx);
      setMode('mission');
      setIsPaused(false);
      setSpecialView(null);
      window.location.hash = `#mission${targetIdx + 1}`;

      if (startImmediately) {
        startPlayingMission(targetStage.missionId, roverSelection);
      } else {
        setMissionScreen('briefing');
      }
    },
    [roverSelection, startPlayingMission]
  );

  // Listen for custom event dispatched by ScrollPrologueController when the user finishes or skips the Prologue
  useEffect(() => {
    const handleEnterFromPrologue = (e: Event) => {
      const customEvt = e as CustomEvent<{ stageIndex?: number; mode?: JourneyMode }>;
      const targetStage = customEvt.detail?.stageIndex ?? 0;
      const targetMode = customEvt.detail?.mode ?? 'chapter';
      setPrologueCompleted(true);
      setStageIndex(targetStage);
      setMode(targetMode);
      setActiveHotspot(null);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      if (targetMode === 'mission') {
        navigateToMission(targetStage, true);
      } else {
        window.location.hash = `#ch${targetStage + 1}`;
      }
    };

    window.addEventListener('prologue:enter-journey', handleEnterFromPrologue);
    return () => window.removeEventListener('prologue:enter-journey', handleEnterFromPrologue);
  }, [navigateToMission]);

  // Persist Journey State to localStorage whenever progress changes
  useEffect(() => {
    saveJourneyState({
      prologueSeen: prologueCompleted,
      activeView: mode,
      currentStageIndex: stageIndex,
      visitedChapters: Array.from(visitedChapters),
      completedChapters: Array.from(visitedChapters),
      completedMissions: Array.from(completedMissions),
      skippedMissions: Array.from(skippedMissions),
      roverChoice: roverSelection,
      reducedMotion,
      highContrast,
      textSize,
      soundEnabled,
    });
  }, [
    prologueCompleted,
    mode,
    stageIndex,
    visitedChapters,
    completedMissions,
    skippedMissions,
    roverSelection,
    reducedMotion,
    highContrast,
    textSize,
    soundEnabled,
  ]);

  // Track visited chapters
  useEffect(() => {
    if (mode === 'chapter') {
      setVisitedChapters((prev) => {
        if (prev.has(stageIndex)) return prev;
        const next = new Set(prev);
        next.add(stageIndex);
        return next;
      });
    }
  }, [mode, stageIndex]);

  // Update HTML document title
  useEffect(() => {
    if (mode === 'prologue') {
      document.title = 'Mission Remnants — Built for a Question';
    } else if (mode === 'finale') {
      document.title = 'Your Question — Mission Remnants';
    } else if (mode === 'mission') {
      document.title = `Mission ${currentStage.stageNumber}: ${activeMissionData.name} — Mission Lab`;
    } else {
      document.title = `Ch 0${currentChapter.chapter}: ${currentChapter.machine} — Built for a Question`;
    }
  }, [mode, currentStage, activeMissionData, currentChapter]);

  // Handle URL Hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith('#ch')) {
        const n = parseInt(hash.replace('#ch', ''), 10);
        if (n >= 1 && n <= 6) {
          setStageIndex(n - 1);
          setMode('chapter');
          setActiveHotspot(null);
        }
      } else if (hash.startsWith('#mission')) {
        const n = parseInt(hash.replace('#mission', ''), 10);
        if (n >= 1 && n <= 6) {
          const idx = n - 1;
          setStageIndex(idx);
          setMode('mission');
          startPlayingMission(JOURNEY_STAGES[idx].missionId, roverSelection);
        }
      } else if (hash === '#finale') {
        setMode('finale');
      } else if (hash === '#prologue') {
        setMode('prologue');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [roverSelection, startPlayingMission]);

  // Skip current mission and proceed to the next chapter
  const handleSkipMissionToNextChapter = useCallback(() => {
    if (!completedMissions.has(currentStage.missionId)) {
      setSkippedMissions((prev) => {
        const next = new Set(prev);
        next.add(currentStage.missionId);
        return next;
      });
    }
    navigateToChapter(stageIndex + 1, true);
  }, [completedMissions, currentStage.missionId, navigateToChapter, stageIndex]);

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    if (pendingStageIndex >= JOURNEY_STAGES.length) {
      setMode('finale');
      window.location.hash = '#finale';
    } else {
      setStageIndex(pendingStageIndex);
      setMode('chapter');
      window.location.hash = `#ch${pendingStageIndex + 1}`;
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  };

  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  }, [isMuted]);

  const toggleChapterSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioService.setSoundEnabled(next);
    audioService.toggleAmbient(next);
  };

  const handleResetProgress = () => {
    setVisitedChapters(new Set([0]));
    setCompletedMissions(new Set());
    setSkippedMissions(new Set());
    setStageIndex(0);
    setMode('chapter');
    window.location.hash = '#ch1';
  };

  const textSizeClass =
    textSize === 'large'
      ? 'text-[1.08rem]'
      : textSize === 'xlarge'
      ? 'text-[1.18rem]'
      : 'text-base';

  const pendingChapter =
    pendingStageIndex < chaptersData.length ? chaptersData[pendingStageIndex] : null;

  const getEnvThemeBadge = () => {
    if (currentStage.envTheme === 'mars' && mode !== 'finale') {
      return (
        <span className="hidden lg:inline text-xs font-mono text-slate-400">
          Mars · 225M km
        </span>
      );
    }
    if (currentStage.envTheme === 'void' || mode === 'finale') {
      return (
        <span className="hidden lg:inline text-xs font-mono text-slate-400">
          Deep Space · 24.5B km
        </span>
      );
    }
    return (
      <span className="hidden lg:inline text-xs font-mono text-slate-400">
        The Moon · 384,400 km
      </span>
    );
  };

  return (
    <div
      className={`min-h-screen text-[#F8FAFC] flex flex-col font-body relative overflow-x-hidden ${
        reducedMotion ? 'reduced-motion' : ''
      } ${highContrast ? 'high-contrast' : ''} ${textSizeClass}`}
      style={{ backgroundColor: 'var(--env-bg-primary)' }}
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          ALWAYS-MOUNTED 3D MISSION LAB VIEWPORT
          (Kept in DOM even during Prologue/Chapter so WebGL context & sizing are rock-solid)
          ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className={`fixed inset-x-0 top-[56px] bottom-0 z-30 transition-opacity duration-300 ${
          mode === 'mission'
            ? 'opacity-100 pointer-events-auto visible'
            : 'opacity-0 pointer-events-none invisible'
        }`}
      >
        {/* 3D WebGL Canvas Mount */}
        <div
          ref={canvasMountRef}
          className={`absolute inset-0 w-full h-full ${
            missionScreen === 'playing' ? 'opacity-100' : 'opacity-20 pointer-events-none'
          }`}
        />

        {/* Optional Mission Briefing Overlay (opened via Info button in HUD) */}
        {mode === 'mission' && missionScreen === 'briefing' && (
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <MissionBriefing
              mission={activeMissionData}
              roverChoice={roverSelection}
              onRoverChoiceChange={(r) => setRoverSelection(r)}
              onBack={() => setIsMissionCatalogueOpen(true)}
              onReturnToChapter={() => navigateToChapter(stageIndex, false)}
              onStartMission={() => startPlayingMission(activeMissionId, roverSelection)}
            />
          </div>
        )}

        {/* Active 3D Mission Playing HUD & Overlays */}
        {mode === 'mission' && missionScreen === 'playing' && (
          <>
            <GameHUD
              mission={activeMissionData}
              completedObjectives={completedObjectives}
              lastCompletedTitle={lastCompletedTitle}
              contextActionLabel={contextActionLabel}
              onContextAction={() => engineRef.current?.triggerCurrentContextAction()}
              telemetry={telemetry}
              onPause={() => setIsPaused(true)}
              onOpenBriefing={() => setMissionScreen('briefing')}
              onBackToChapter={() => navigateToChapter(stageIndex, false)}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onRotateCamera={(azimuth) => engineRef.current?.rotateCameraOrbit(azimuth, 0)}
              onZoomCamera={(delta) => engineRef.current?.zoomCamera(delta)}
              onResetCamera={() => engineRef.current?.resetCameraOrbit()}
            />

            <ControlsOverlay
              onDirectionInput={(dir) => {
                if (engineRef.current) {
                  engineRef.current.touchJoystick = dir;
                }
              }}
              onAltitudeInput={(delta) => {
                if (engineRef.current) {
                  engineRef.current.touchAltitude = delta;
                }
              }}
              onActionButton={() => engineRef.current?.triggerCurrentContextAction()}
              isFlightMission={activeMissionId === 'ingenuity'}
            />

            {isPaused && (
              <PauseMenu
                onResume={() => setIsPaused(false)}
                onRestart={() => startPlayingMission(activeMissionId, roverSelection)}
                onReturnToSelection={() => {
                  setIsPaused(false);
                  setIsMissionCatalogueOpen(true);
                }}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
              />
            )}

            {specialView?.type === 'photo' && <PhotoCaptureView data={specialView.data} />}
            {specialView?.type === 'waveform' && <WaveformView data={specialView.data} />}
            {specialView?.type === 'golden_record' && (
              <GoldenRecordModal
                onClose={() => {
                  if (specialView.data?.onClose) {
                    specialView.data.onClose();
                  } else {
                    setSpecialView(null);
                  }
                }}
              />
            )}
          </>
        )}

        {/* Mission Completion Screen with Direct Handoff to Next Chapter */}
        {mode === 'mission' && missionScreen === 'complete' && (
          <MissionCompleteModal
            mission={activeMissionData}
            stageSpec={currentStage}
            onContinueToNextChapter={() => {
              if (stageIndex + 1 < JOURNEY_STAGES.length) {
                navigateToChapter(stageIndex + 1, true);
              } else {
                setMode('finale');
                window.location.hash = '#finale';
              }
            }}
            onReturnToChapter={() => navigateToChapter(stageIndex, false)}
            onReplay={() => startPlayingMission(activeMissionId, roverSelection)}
            onReturnToSelection={() => setIsMissionCatalogueOpen(true)}
          />
        )}
      </div>

      {/* Prologue remains completely clean without floating buttons */}

      {/* ═══════════════════════════════════════════════════════════════════════
          SINGLE ARCHITECTURAL TOP NAVIGATION BAR
          ═══════════════════════════════════════════════════════════════════════ */}
      {mode !== 'prologue' && (
        <>
          <SpaceAtmosphere
            envTheme={mode === 'finale' ? 'void' : currentStage.envTheme}
            envSubTheme={mode === 'finale' ? 'void-interstellar' : currentStage.envSubTheme}
            reducedMotion={reducedMotion}
          />

          <header className="sticky top-0 z-40 h-[56px] w-full bg-[#03060E]/90 backdrop-blur-md border-b border-white/10 px-4 md:px-8 flex items-center">
            <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4">
              {/* Left: Brand Identity + Unboxed Destination Context */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsJourneyMapOpen(true)}
                  className="text-left font-head font-bold text-xs sm:text-sm tracking-[0.16em] uppercase text-white hover:text-slate-300 transition-colors cursor-pointer"
                  title="Open Connected Journey Index"
                >
                  Mission Remnants
                </button>
                <span className="hidden lg:inline text-white/15" aria-hidden="true">·</span>
                {getEnvThemeBadge()}
              </div>

              {/* Center: Clean Typographic 6-Stage Switcher */}
              <nav
                aria-label="Mission stages"
                className="hidden md:flex items-center gap-4 text-xs font-mono"
              >
                <button
                  onClick={() => setMode('prologue')}
                  className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                  title="Replay Scroll Prologue"
                >
                  Prologue
                </button>

                <span className="text-white/15" aria-hidden="true">/</span>

                <div className="flex items-center gap-3">
                  {JOURNEY_STAGES.map((stg, idx) => {
                    const isActive = mode !== 'finale' && stageIndex === idx;
                    const isDone = completedMissions.has(stg.missionId);
                    return (
                      <button
                        key={stg.chapterId}
                        onClick={() => navigateToChapter(idx, false)}
                        className={`py-1 transition-colors cursor-pointer relative ${
                          isActive
                            ? 'text-white font-bold underline underline-offset-8 decoration-white'
                            : isDone
                            ? 'text-slate-300 hover:text-white'
                            : 'text-slate-500 hover:text-slate-200'
                        }`}
                        title={`Stage ${stg.stageNumber}: ${stg.chapterTitle}`}
                      >
                        {stg.stageNumber}
                      </button>
                    );
                  })}
                </div>

                <span className="text-white/15" aria-hidden="true">/</span>

                <button
                  onClick={() => {
                    setMode('finale');
                    window.location.hash = '#finale';
                  }}
                  className={`transition-colors cursor-pointer ${
                    mode === 'finale'
                      ? 'text-white font-bold underline underline-offset-8'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  Finale
                </button>
              </nav>

              {/* Right: Clean Actions */}
              <div className="flex items-center gap-2.5">
                {mode === 'chapter' ? (
                  <button
                    onClick={() => navigateToMission(stageIndex, true)}
                    className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-slate-200 text-[#030712] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>3D Lab {currentStage.stageNumber}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : mode === 'mission' ? (
                  <button
                    onClick={() => navigateToChapter(stageIndex, false)}
                    className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-white/10 hover:bg-white/15 border border-white/15 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Chapter {currentStage.stageNumber}</span>
                  </button>
                ) : null}

                {mode !== 'mission' && (
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="px-3 py-1.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/45 text-amber-300 hover:text-white text-xs font-mono font-medium transition-colors cursor-pointer"
                    title="Ask MIRA — Chapter-Wise Mission & Remnant Archive (Ch 01 – Ch 06)"
                  >
                    Ask MIRA
                  </button>
                )}

                <button
                  onClick={() => setIsJourneyMapOpen(true)}
                  className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Journey Overview & All Missions"
                  aria-label="Journey Overview"
                >
                  <Map className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Settings & Accessibility"
                  aria-label="Settings and Accessibility"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          CHAPTER STORY, FINALE STAGE & EXHIBITION FOOTER
          ═══════════════════════════════════════════════════════════════════════ */}
      {(mode === 'chapter' || mode === 'finale') && (
        <>
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 relative z-10">
            {mode === 'finale' ? (
              <div className="py-8">
                <ConstellationFinale
                  onRestart={() => navigateToChapter(0, false)}
                  reducedMotion={reducedMotion}
                />
              </div>
            ) : (
              <CinematicChapterView
                key={currentChapter.id}
                chapter={currentChapter}
                stageSpec={currentStage}
                isMissionCompleted={completedMissions.has(currentStage.missionId)}
                onLaunchMission={() => navigateToMission(stageIndex, true)}
                onTriggerLaserDemo={() => setLaserTrigger((prev) => prev + 1)}
                activeHotspot={activeHotspot}
                onSelectHotspot={setActiveHotspot}
                onOpenSources={() => setIsSourcesOpen(true)}
                onOpenMira={() => setIsChatOpen(true)}
                onNextChapter={handleSkipMissionToNextChapter}
                isLastChapter={stageIndex === JOURNEY_STAGES.length - 1}
                reducedMotion={reducedMotion}
                roverSelection={roverSelection}
                onRoverChange={setRoverSelection}
                laserTrigger={laserTrigger}
              />
            )}
          </main>

          <ExhibitionFooter
            currentStageIndex={stageIndex}
            completedMissions={completedMissions}
            onSelectChapter={(idx) => navigateToChapter(idx, false)}
            onSelectMission={(idx) => navigateToMission(idx, true)}
            onReplayPrologue={() => setMode('prologue')}
            onOpenFinale={() => {
              setMode('finale');
              window.location.hash = '#finale';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenSources={() => setIsSourcesOpen(true)}
            onOpenMira={() => setIsChatOpen(true)}
            onOpenJourneyMap={() => setIsJourneyMapOpen(true)}
          />

          <CinematicTransition
            isActive={isTransitioning}
            handOffLine={currentChapter.handOffLine}
            nextQuestion={
              pendingChapter ? pendingChapter.bannerIn : 'What question should humanity ask next?'
            }
            nextMachine={pendingChapter ? pendingChapter.machine : 'Your Question'}
            onComplete={handleTransitionComplete}
            reducedMotion={reducedMotion}
          />
        </>
      )}

      {/* Global Modals & Drawers */}
      <JourneyMapModal
        isOpen={isJourneyMapOpen}
        onClose={() => setIsJourneyMapOpen(false)}
        currentStageIndex={stageIndex}
        currentMode={mode}
        visitedChapters={visitedChapters}
        completedMissions={completedMissions}
        skippedMissions={skippedMissions}
        onSelectChapter={(idx) => {
          setPrologueCompleted(true);
          navigateToChapter(idx, false);
        }}
        onSelectMission={(idx) => {
          setPrologueCompleted(true);
          navigateToMission(idx, true);
        }}
        onReplayPrologue={() => setMode('prologue')}
        onOpenFinale={() => {
          setPrologueCompleted(true);
          setMode('finale');
          window.location.hash = '#finale';
        }}
        onResetProgress={handleResetProgress}
      />

      {isMissionCatalogueOpen && (
        <MissionSelectModal
          onClose={() => setIsMissionCatalogueOpen(false)}
          completedMissions={completedMissions}
          skippedMissions={skippedMissions}
          onSelectChapter={(idx) => navigateToChapter(idx, false)}
          onSelectMission={(missionId, chosenRover) => {
            if (chosenRover) setRoverSelection(chosenRover);
            const targetIdx = JOURNEY_STAGES.findIndex((s) => s.missionId === missionId);
            setIsMissionCatalogueOpen(false);
            if (targetIdx !== -1) {
              navigateToMission(targetIdx, true);
            }
          }}
        />
      )}

      <AskEngineerModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        activeChapterId={currentChapter.id}
      />

      <SourcesDrawer
        isOpen={isSourcesOpen}
        onClose={() => setIsSourcesOpen(false)}
        activeChapterId={currentChapter.id}
      />

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        textSize={textSize}
        onTextSizeChange={setTextSize}
        soundEnabled={soundEnabled}
        onToggleSound={toggleChapterSound}
        onSelectChapter={(idx) => navigateToChapter(idx, false)}
        currentChapterIndex={mode === 'finale' ? 6 : stageIndex}
      />

      <AudioCaptionBanner />
    </div>
  );
}
