import React, { useEffect, useState } from 'react';
import { sourcesList } from '../data/sources';
import { chaptersData } from '../data/chapters';
import {
  SPACECRAFT_3D_REFERENCES,
  fetchNasaApod,
  NasaApodItem,
} from '../../shared/nasaApiService';
import { X, ExternalLink, CheckCircle2, Box, Radio } from 'lucide-react';

interface SourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeChapterId: string;
}

export const SourcesDrawer: React.FC<SourcesDrawerProps> = ({
  isOpen,
  onClose,
  activeChapterId,
}) => {
  const [apod, setApod] = useState<NasaApodItem | null>(null);

  useEffect(() => {
    if (isOpen && !apod) {
      fetchNasaApod().then(setApod);
    }
  }, [isOpen, apod]);

  if (!isOpen) return null;

  const currentChapter = chaptersData.find((c) => c.id === activeChapterId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sources-drawer-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#090E1D] border-l border-white/15 w-full max-w-xl h-full overflow-y-auto p-6 lg:p-8 flex flex-col justify-between shadow-2xl text-white"
      >
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest">
                NASA OPEN DATA · 3D REFERENCES · ARCHIVES
              </span>
              <h3 id="sources-drawer-title" className="font-head font-bold text-xl text-white">
                Scientific Sources, 3D Models & NASA APIs
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 cursor-pointer"
              aria-label="Close sources drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. Live NASA Open API (api.nasa.gov) Telemetry & Dispatch */}
          {apod && (
            <div className="bg-[#050814] border border-cyan-500/30 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>LIVE NASA API DISPATCH (api.nasa.gov)</span>
                </span>
                <span>{apod.date}</span>
              </div>
              <div className="text-sm font-bold text-white">{apod.title}</div>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {apod.explanation}
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                <span className="text-slate-400">Endpoint: api.nasa.gov/planetary/apod</span>
                <a
                  href="https://api.nasa.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>NASA API Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* 2. Active Chapter Verified Claims */}
          {currentChapter && (
            <div>
              <h4 className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00E5FF]" />
                <span>Verified Claims: {currentChapter.machine}</span>
              </h4>
              <div className="space-y-2.5">
                {currentChapter.facts.map((fact, i) => (
                  <div
                    key={i}
                    className="bg-[#050814] border border-white/10 rounded-xl p-3.5 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#00E5FF] tracking-wider uppercase">
                        [{fact.tag}] Fact Card
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Verified {fact.checkedOn}
                      </span>
                    </div>
                    <p className="text-slate-100 leading-relaxed">{fact.claim}</p>
                    <p className="text-[11px] font-mono text-slate-400">
                      Source: {fact.source}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Official NASA Science 3D & Sketchfab Model References */}
          <div>
            <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-400" />
              <span>3D Spacecraft Reference Models (NASA Science & Sketchfab)</span>
            </h4>
            <div className="space-y-2.5">
              {SPACECRAFT_3D_REFERENCES.map((ref, idx) => (
                <div
                  key={idx}
                  className="bg-[#050814] border border-white/10 hover:border-amber-400/40 rounded-xl p-3.5 text-xs transition-colors flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-400/30 text-[10px] font-mono text-amber-300">
                        {ref.sourceType}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {ref.missionGroup}
                      </span>
                    </div>
                    <div className="font-semibold text-white">{ref.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Credit: {ref.author}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {ref.notes}
                    </div>
                  </div>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-cyan-300 hover:text-white inline-flex items-center gap-1"
                  >
                    <span>3D Model</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Official NASA Datasets & Archives */}
          <div>
            <h4 className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider mb-3">
              Official NASA Datasets & Ephemeris Archives
            </h4>
            <div className="space-y-2.5">
              {sourcesList.map((src, idx) => (
                <div
                  key={idx}
                  className="bg-[#050814]/80 border border-white/10 rounded-xl p-4 text-xs hover:border-[#00E5FF]/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">{src.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400">{src.category}</span>
                  </div>
                  <p className="text-slate-400 mb-2 leading-relaxed">{src.description}</p>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#00E5FF] hover:underline"
                  >
                    <span>Visit Official Archive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 mt-8 text-center text-xs text-slate-400 font-mono leading-relaxed">
          <p className="mb-1">
            Dramatized voice, facts from NASA. Built for the NASA Space Apps Challenge. Not an official NASA website.
          </p>
          <p className="text-[11px] text-slate-500">
            Real-time procedural 3D hardware modeled after NASA 3D Resources & cited Sketchfab engineering references.
          </p>
        </div>
      </div>
    </div>
  );
};
