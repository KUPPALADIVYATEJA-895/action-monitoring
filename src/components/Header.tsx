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
    settings,
    isCameraActive,
    isPaused,
    videoSource,
    startCamera,
    stopCamera,
    togglePause,
    visionStatus,
    resetTracker,
  } = useMonitoring();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
              AI Activity Monitoring Agent
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
              COCO-17
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            ANONYMOUS COMPUTER VISION • ZERO BIOMETRIC LOGGING
          </p>
        </div>
      </div>

      {/* Model & System Status Indicators (Requirement #28) */}
      <div className="hidden xl:flex items-center gap-4 text-xs font-mono">
        {/* AI Engine Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">AI ENGINE</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <span className="text-emerald-400 font-medium">ONLINE</span>
        </div>

        {/* Pose Model */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800">
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">POSE MODEL</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-200">READY</span>
        </div>

        {/* Multi-Person Tracking */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400">TRACKING</span>
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-cyan-400 font-medium">ACTIVE</span>
        </div>

        {/* Facial Expression Model (FER-2013 / AffectNet / CK+) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400">FACE AI</span>
          <span className="inline-block w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]" />
          <span className="text-purple-300 font-medium">{settings.facialDataset}</span>
        </div>

        {/* Privacy Lock Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/30 border border-emerald-900/40 text-emerald-400">
          <Lock className="w-3 h-3" />
          <span className="text-[11px]">PRIVACY SHIELD</span>
        </div>
      </div>

      {/* Camera Controls & Performance Telemetry */}
      <div className="flex items-center gap-3">
        {/* FPS Indicator */}
        <div className="text-right hidden sm:block">
          <div className="text-xs font-mono font-bold text-slate-200">
            {stats.fps} <span className="text-[10px] text-slate-500 font-normal">FPS</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400">
            {stats.avgConfidence}% CONF
          </div>
        </div>

        {/* Pause / Resume Button */}
        <button
          onClick={togglePause}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
            isPaused
              ? 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/40'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
          title={isPaused ? 'Resume monitoring' : 'Pause monitoring'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
        </button>

        {/* Camera Toggle Button */}
        {isCameraActive ? (
          <button
            onClick={stopCamera}
            className="px-3.5 py-1.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 hover:bg-rose-900/50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>STOP CAMERA</span>
          </button>
        ) : (
          <button
            onClick={() => startCamera()}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>START CAMERA</span>
          </button>
        )}

        {/* Reset Tracker */}
        <button
          onClick={resetTracker}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Reset Person IDs and Tracker"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
