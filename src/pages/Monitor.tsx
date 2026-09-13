import React, { useRef } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { PersonOverlay } from '../components/CameraMonitor/PersonOverlay';
import { ActivityBadge } from '../components/ActivityBadge';
import {
  Camera,
  Eye,
  Sliders,
  Upload,
  User,
  Zap,
  Info,
  Layers,
  Tag,
  Crosshair,
} from 'lucide-react';

export const MonitorPage: React.FC = () => {
  const {
    people,
    stats,
    settings,
    isCameraActive,
    isPaused,
    videoSource,
    startCamera,
    stopCamera,
    togglePause,
    setVideoSource,
    handleFileUpload,
    updateSettings,
    selectedPerson,
    setSelectedPersonId,
  } = useMonitoring();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <span>LIVE COMPUTER VISION MONITOR</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  isPaused
                    ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                    : isCameraActive
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isPaused ? 'PAUSED' : isCameraActive ? 'PROCESSING LIVE' : 'DEMO STREAM'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              17 COCO Keypoints Pose Extraction • SORT-Style Centroid Tracking • Head-Anchored Overlay
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* File Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={onFileInputChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>UPLOAD VIDEO</span>
          </button>

          {/* Switch to Demo Simulation */}
          {videoSource !== 'demo' && (
            <button
              onClick={() => {
                stopCamera();
                setVideoSource('demo');
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              DEMO SCENARIO
            </button>
          )}

          {/* Camera On / Off */}
          {!isCameraActive ? (
            <button
              onClick={() => startCamera()}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-cyan-500/30"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>ACTIVATE WEBCAM</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="px-3.5 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900/60 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>DISCONNECT</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Live Feed (Center) + Live Inspector & Controls (Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Camera / Video Canvas (2 Cols on Large Screen) */}
        <div className="lg:col-span-2 space-y-4">
          <PersonOverlay />

          {/* Overlay Visualization Controls Bar */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400 font-mono">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>VISUALIZATION OVERLAYS:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Show Pose (Skeleton & 17 Keypoints) Toggle */}
              <button
                onClick={() => updateSettings({ showPose: !settings.showPose })}
                className={`px-2.5 py-1 rounded-md border font-mono transition-all flex items-center gap-1.5 ${
                  settings.showPose
                    ? 'bg-cyan-950/80 border-cyan-800 text-cyan-400 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>SHOW POSE [17 KPs]: {settings.showPose ? 'ON' : 'OFF'}</span>
              </button>

              {/* Show Bounding Boxes Toggle */}
              <button
                onClick={() =>
                  updateSettings({ showBoundingBoxes: !settings.showBoundingBoxes })
                }
                className={`px-2.5 py-1 rounded-md border font-mono transition-all flex items-center gap-1.5 ${
                  settings.showBoundingBoxes
                    ? 'bg-indigo-950/80 border-indigo-800 text-indigo-400 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <Crosshair className="w-3 h-3" />
                <span>BBOXES: {settings.showBoundingBoxes ? 'ON' : 'OFF'}</span>
              </button>

              {/* Show Activity Labels Toggle */}
              <button
                onClick={() =>
                  updateSettings({ showActivityLabels: !settings.showActivityLabels })
                }
                className={`px-2.5 py-1 rounded-md border font-mono transition-all flex items-center gap-1.5 ${
                  settings.showActivityLabels
                    ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <Tag className="w-3 h-3" />
                <span>HEAD LABELS: {settings.showActivityLabels ? 'ON' : 'OFF'}</span>
              </button>

              {/* Show Confidence */}
              <button
                onClick={() =>
                  updateSettings({ showConfidence: !settings.showConfidence })
                }
                className={`px-2.5 py-1 rounded-md border font-mono transition-all flex items-center gap-1.5 ${
                  settings.showConfidence
                    ? 'bg-purple-950/80 border-purple-800 text-purple-400'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <span>CONFIDENCE: {settings.showConfidence ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Column: Active Detected People Cards & Detailed Inspector */}
        <div className="space-y-4">
          {/* Active People Roster in Current View */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold uppercase text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                <span>ACTIVE DETECTIONS ({people.length})</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                CLICK TO INSPECT
              </span>
            </div>

            {people.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No people currently detected in frame.
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {people.map((person) => {
                  const isSelected = selectedPerson?.id === person.id;
                  const mins = Math.floor(person.activityDurationSeconds / 60);
                  const secs = person.activityDurationSeconds % 60;
                  const durationFormatted = `${String(mins).padStart(2, '0')}:${String(
                    secs
                  ).padStart(2, '0')}`;

                  return (
                    <div
                      key={person.id}
                      onClick={() =>
                        setSelectedPersonId(isSelected ? null : person.id)
                      }
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: person.color }}
                          />
                          <span className="font-mono font-bold text-sm text-slate-100">
                            {person.id}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-medium text-slate-300">
                          {durationFormatted}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <ActivityBadge
                          activity={person.activity}
                          movement={person.movement}
                          size="sm"
                        />
                        <span className="text-[11px] font-mono text-slate-400">
                          {Math.round(person.confidence * 100)}%
                        </span>
                      </div>

                      {person.detectedObjects && person.detectedObjects.length > 0 && (
                        <div className="mt-2 text-[10px] font-mono text-purple-400 flex items-center gap-1">
                          <span>OBJECT:</span>
                          <span className="px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/40">
                            {person.detectedObjects.map((o) => o.class).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Person Inspector Drawer (when clicked) */}
          {selectedPerson && (
            <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono font-bold text-cyan-400">
                  INSPECTING {selectedPerson.id}
                </span>
                <button
                  onClick={() => setSelectedPersonId(null)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">CURRENT ACTIVITY</span>
                  <span className="text-slate-200 font-bold">
                    {selectedPerson.activity}
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">MOVEMENT STATE</span>
                  <span
                    className={
                      selectedPerson.movement === 'MOVING'
                        ? 'text-emerald-400 font-bold'
                        : 'text-slate-400 font-bold'
                    }
                  >
                    {selectedPerson.movement}
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">CURRENT DURATION</span>
                  <span className="text-slate-200">
                    {selectedPerson.activityDurationSeconds}s
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">VELOCITY EST.</span>
                  <span className="text-slate-200">{selectedPerson.velocity} px/s</span>
                </div>
              </div>

              {/* Activity History for this person */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">
                  ACTIVITY HISTORY ({selectedPerson.activityHistory.length} logs)
                </span>
                <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                  {selectedPerson.activityHistory.length === 0 ? (
                    <span className="text-[11px] text-slate-600 italic">
                      No previous activity transitions yet
                    </span>
                  ) : (
                    selectedPerson.activityHistory.map((hist, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] font-mono flex items-center justify-between bg-slate-950/60 p-1.5 rounded border border-slate-850"
                      >
                        <span className="text-slate-300">{hist.activity}</span>
                        <span className="text-slate-500">{hist.durationSeconds}s</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
