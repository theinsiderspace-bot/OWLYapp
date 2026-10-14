import React, { useState, useRef, useEffect } from 'react';
import { 
  OwlySatLaunchIcon, 
  OwlyIeltsLaunchIcon 
} from './EcosystemLaunchers';
import { 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  ArrowLeft, 
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface EmbeddedEcosystemViewerProps {
  initialPlatform?: 'sat' | 'ielts';
  onClose: () => void;
}

export const EmbeddedEcosystemViewer: React.FC<EmbeddedEcosystemViewerProps> = ({
  initialPlatform = 'sat',
  onClose,
}) => {
  const [platform, setPlatform] = useState<'sat' | 'ielts'>(initialPlatform);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync if initialPlatform changes
  useEffect(() => {
    if (initialPlatform) {
      setPlatform(initialPlatform);
      setIsLoading(true);
    }
  }, [initialPlatform]);

  // When platform switches or reload is requested, show loading state
  const handleSwitchPlatform = (nextPlatform: 'sat' | 'ielts') => {
    if (nextPlatform !== platform) {
      setIsLoading(true);
      setPlatform(nextPlatform);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setReloadKey(prev => prev + 1);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const currentUrl = platform === 'sat' 
    ? 'https://owlysat.ai.studio/' 
    : 'https://owlyielts.ai.studio/';

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col bg-slate-950 text-white w-full ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen' : 'min-h-[calc(100vh-64px)] flex-1'
      }`}
    >
      {/* Top Workspace Header Bar (No Links, only in-frame controls) */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Left: Active Ecosystem Badge & In-Frame Switcher */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all cursor-pointer"
            title="Return to Course Hub"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Return to Hub</span>
          </button>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          {/* Unified Ecosystem Switcher running in the SAME IFRAME */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleSwitchPlatform('sat')}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                platform === 'sat'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <OwlySatLaunchIcon size={20} />
              <span>OWLY SAT</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchPlatform('ielts')}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                platform === 'ielts'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <OwlyIeltsLaunchIcon size={20} />
              <span>OWLY IELTS</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 pl-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Sandbox</span>
          </div>
        </div>

        {/* Right: Frame Controls */}
        <div className="flex items-center gap-2">
          {/* Reload Frame */}
          <button
            type="button"
            onClick={handleReload}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Reload Workspace"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Sandbox Frame Container */}
      <div className="relative flex-1 w-full h-full min-h-[500px] bg-slate-950 flex flex-col">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xs">
            <div className="relative mb-4">
              {platform === 'sat' ? (
                <OwlySatLaunchIcon size={56} className="animate-pulse" />
              ) : (
                <OwlyIeltsLaunchIcon size={56} className="animate-pulse" />
              )}
              <div className="absolute -inset-1 rounded-full bg-indigo-500/20 blur-md animate-pulse pointer-events-none" />
            </div>
            <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Loading OWLY {platform.toUpperCase()} in Workspace...</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
              Opening official testing suite in current application frame
            </p>
          </div>
        )}

        {/* Single Shared Iframe for SAT and IELTS (no link) */}
        <iframe
          key={`${platform}-${reloadKey}`}
          ref={iframeRef}
          src={currentUrl}
          title={`OWLY ${platform.toUpperCase()} Interactive Suite`}
          className="w-full flex-1 border-0 h-full min-h-[calc(100vh-120px)] bg-slate-900"
          onLoad={() => setIsLoading(false)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; camera; microphone; fullscreen"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-modals allow-downloads"
        />
      </div>
    </div>
  );
};
