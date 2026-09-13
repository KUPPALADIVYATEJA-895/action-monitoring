import React from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import {
  Settings,
  Shield,
  Sliders,
  Eye,
  Download,
  Trash2,
  Lock,
  Cpu,
  Database,
  CheckCircle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, people, events, clearEvents, resetTracker } =
    useMonitoring();

  const handleExportData = () => {
    const data = {
      exportTimestamp: new Date().toISOString(),
      activePeople: people,
      eventsHistory: events,
      systemSettings: settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-monitoring-log-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>SYSTEM & VISION CONFIGURATION</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Adjust kinematic thresholds, temporal windows, visual overlay preferences, and privacy parameters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Computer Vision & Tracking Thresholds */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-slate-200 font-mono text-xs font-bold uppercase border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>AI INFERENCE & KINEMATIC THRESHOLDS</span>
          </div>

          {/* Detection Confidence */}
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <label className="text-slate-300">KEYPOINT CONFIDENCE CUTOFF</label>
              <span className="text-cyan-400 font-bold">
                {Math.round(settings.detectionConfidence * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={settings.detectionConfidence}
              onChange={(e) =>
                updateSettings({ detectionConfidence: parseFloat(e.target.value) })
              }
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Minimum score required for a COCO keypoint to be rendered or used in angle equations.
            </p>
          </div>

          {/* Movement Threshold */}
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <label className="text-slate-300">MOVEMENT DISPLACEMENT SENSITIVITY</label>
              <span className="text-emerald-400 font-bold">
                {Math.round(settings.movementThreshold * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.15"
              step="0.01"
              value={settings.movementThreshold}
              onChange={(e) =>
                updateSettings({ movementThreshold: parseFloat(e.target.value) })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Normalized displacement threshold required to transition from NOT MOVING to MOVING.
            </p>
          </div>

          {/* Temporal Window Size */}
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <label className="text-slate-300">TEMPORAL BUFFER (FRAMES)</label>
              <span className="text-purple-400 font-bold">
                {settings.temporalWindowSize} frames
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={settings.temporalWindowSize}
              onChange={(e) =>
                updateSettings({ temporalWindowSize: parseInt(e.target.value) })
              }
              className="w-full accent-purple-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Number of historical frame centroids preserved for velocity smoothing and debouncing.
            </p>
          </div>
        </div>

        {/* Display Overlays & Visual Settings */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-slate-200 font-mono text-xs font-bold uppercase border-b border-slate-800 pb-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>DISPLAY & HUD OVERLAY TOGGLES</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Show Pose */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-850 cursor-pointer hover:border-slate-700">
              <div>
                <div className="text-slate-200 font-semibold">SHOW SKELETON WIREFRAME</div>
                <div className="text-[10px] text-slate-500">Draw 17 COCO keypoints and connecting bones</div>
              </div>
              <input
                type="checkbox"
                checked={settings.showPose}
                onChange={(e) => updateSettings({ showPose: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </label>

            {/* Show Bounding Boxes */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-850 cursor-pointer hover:border-slate-700">
              <div>
                <div className="text-slate-200 font-semibold">SHOW BOUNDING BOXES</div>
                <div className="text-[10px] text-slate-500">Corner brackets delineating detected subject spatial extents</div>
              </div>
              <input
                type="checkbox"
                checked={settings.showBoundingBoxes}
                onChange={(e) => updateSettings({ showBoundingBoxes: e.target.checked })}
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
            </label>

            {/* Show Activity Labels */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-850 cursor-pointer hover:border-slate-700">
              <div>
                <div className="text-slate-200 font-semibold">SHOW HEAD-ATTACHED LABELS</div>
                <div className="text-[10px] text-slate-500">Dynamic floating pill attached above subject head</div>
              </div>
              <input
                type="checkbox"
                checked={settings.showActivityLabels}
                onChange={(e) => updateSettings({ showActivityLabels: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </label>

            {/* Show Confidence */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-850 cursor-pointer hover:border-slate-700">
              <div>
                <div className="text-slate-200 font-semibold">SHOW CONFIDENCE PERCENTAGES</div>
                <div className="text-[10px] text-slate-500">Display probabilistic confidence score on HUD</div>
              </div>
              <input
                type="checkbox"
                checked={settings.showConfidence}
                onChange={(e) => updateSettings({ showConfidence: e.target.checked })}
                className="w-4 h-4 accent-purple-500 cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Privacy & Safety Statement (Requirement #37) */}
      <div className="bg-slate-900/80 border border-emerald-900/40 rounded-xl p-5 space-y-3 font-mono">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
          <Shield className="w-4 h-4" />
          <span>PRIVACY PROTECTION & ETHICAL MONITORING COMPLIANCE</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          This system is strictly designed for authorized, privacy-conscious monitoring:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Zero Facial Recognition:</strong> Faces are not identified, cataloged, or scanned.
            </span>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Anonymous Ephemeral IDs:</strong> Subjects receive transient IDs (P01, P02...) devoid of personal data.
            </span>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>No Emotion or Demographic Inference:</strong> The pipeline strictly evaluates physical keypoint kinematics.
            </span>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Probabilistic Output:</strong> Classifications represent optical posture approximations, not biometric profiling.
            </span>
          </div>
        </div>
      </div>

      {/* Data Management & Export (Requirement #38) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
        <div>
          <span className="text-slate-200 font-bold uppercase block">
            TELEMETRY DATA RETENTION & EXPORT
          </span>
          <span className="text-slate-500 text-[11px]">
            {people.length} active subject track(s) • {events.length} recorded transition event(s)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearEvents}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>CLEAR EVENTS</span>
          </button>
          <button
            onClick={resetTracker}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <span>RESET TRACKER</span>
          </button>
          <button
            onClick={handleExportData}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-cyan-600/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT JSON LOG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
