import React from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import {
  Activity,
  Camera,
  Cpu,
  Eye,
  Lock,
  Pause,
  Play,
  RefreshCw,
  Video,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    stats,
    isCameraActive,
    isPaused,
    videoSource,
    setVideoSource,
    startCamera,
    stopCamera,
    togglePause,
    resetTracker,
  } = useMonitoring();

  return (
    <header className="h-14 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand & AI Indicator */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
          <Activity className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-sm font-semibold tracking-wider text-slate-100 uppercase">
            AI Vision Monitor
          </h1>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>
      </div>

      {/* Primary Actions & Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Video Mode Switcher */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => {
              if (videoSource !== 'webcam') {
                setVideoSource('webcam');
                startCamera();
              }
            }}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
              videoSource === 'webcam'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Webcam</span>
          </button>
          <button
            onClick={() => {
              if (isCameraActive) stopCamera();
              setVideoSource('demo');
            }}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
              videoSource === 'demo'
                ? 'bg-purple-500/20 text-purple-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Demo</span>
          </button>
        </div>

        {/* Camera Start / Stop */}
        {videoSource === 'webcam' && (
          isCameraActive ? (
            <button
              onClick={stopCamera}
              className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900/60 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stop Camera</span>
            </button>
          ) : (
            <button
              onClick={() => startCamera()}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-cyan-500/25 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Start Camera</span>
            </button>
          )
        )}

        {/* Pause / Resume */}
        <button
          onClick={togglePause}
          className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
            isPaused
              ? 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/40'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
          title={isPaused ? 'Resume monitoring' : 'Pause monitoring'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        {/* Reset Tracker */}
        <button
          onClick={resetTracker}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Reset Person IDs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Telemetry FPS */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800 text-xs font-mono">
          <span className="text-slate-400 font-bold">{stats.fps} FPS</span>
          <span className="text-emerald-400">{stats.avgConfidence}% CONF</span>
        </div>
      </div>
    </header>
  );
};
