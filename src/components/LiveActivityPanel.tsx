import React, { useRef } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import {
  Activity,
  Camera,
  CheckCircle2,
  Clock,
  Database,
  Eye,
  Info,
  Layers,
  Pause,
  Play,
  RefreshCw,
  ScanFace,
  Smartphone,
  Smile,
  Sparkles,
  Tag,
  Upload,
  User,
  Zap,
} from 'lucide-react';
import { ActivityType, FacialDatasetType } from '../types';
import {
  DATASET_METADATA,
  EXPRESSION_COLORS,
  FACIAL_EXPRESSION_NOTE,
} from '../services/facialExpression';

export const LiveActivityPanel: React.FC = () => {
  const {
    people,
    stats,
    events,
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
    resetTracker,
    selectedPerson,
    setSelectedPersonId,
  } = useMonitoring();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active person to display in the hero section (selected or first detected)
  const activePerson = selectedPerson || people[0] || null;

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Helper formatting for duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Dynamic color for activity
  const getActivityColor = (act?: ActivityType) => {
    switch (act) {
      case 'Walking':
      case 'Running':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Sitting':
        return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'Using Phone':
        return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 'Holding Object':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Standing':
      default:
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    }
  };

  // Dataset descriptions
  const currentDatasetMeta = DATASET_METADATA[settings.facialDataset || 'FER-2013'];

  return (
    <div className="space-y-4">
      {/* 1. Primary Live Action Hero Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-slate-300">
                {activePerson ? activePerson.id : 'SEARCHING FOR PERSON'}
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">
                {activePerson ? 'TRACKING LOCKED' : 'STAND IN FRONT OF CAMERA'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activePerson && (
              <span
                className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 border ${
                  activePerson.movement === 'MOVING'
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                    : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    activePerson.movement === 'MOVING' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                  }`}
                />
                {activePerson.movement}
              </span>
            )}
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/60">
              {stats.fps} FPS
            </span>
          </div>
        </div>

        {activePerson ? (
          <div>
            <div className="mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                CURRENT RECOGNIZED ACTION
              </span>
            </div>

            {/* Huge Action Title */}
            <div className="flex flex-wrap items-baseline gap-3 mb-4">
              <div
                className={`text-3xl sm:text-4xl font-black tracking-tight uppercase px-4 py-1.5 rounded-xl border ${getActivityColor(
                  activePerson.activity
                )}`}
              >
                {activePerson.activity}
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-sm bg-slate-950/60 px-3 py-1 rounded-lg border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-200 font-bold">
                  {formatDuration(activePerson.activityDurationSeconds)}
                </span>
                <span className="text-[10px] text-slate-500">ACTIVE</span>
              </div>
            </div>

            {/* Facial Expression Analysis Section */}
            {settings.enableFacialExpression && (
              <div className="mb-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Smile className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-mono font-semibold uppercase text-slate-300">
                      FACIAL EXPRESSION
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60">
                      {settings.facialDataset}
                    </span>
                  </div>
                  {activePerson.face && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        activePerson.face.detected
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                          : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                      }`}
                    >
                      {activePerson.face.expression.status}
                    </span>
                  )}
                </div>

                {activePerson.face?.detected && activePerson.face.expression.label !== 'Not Analyzed' ? (
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              EXPRESSION_COLORS[activePerson.face.expression.label] || '#10b981',
                          }}
                        />
                        <span className="text-lg font-bold text-slate-100 font-mono">
                          {activePerson.face.expression.label} expression
                        </span>
                      </div>
                      <span className="text-sm font-mono font-bold text-purple-300">
                        {Math.round(activePerson.face.expression.confidence * 100)}% conf
                      </span>
                    </div>

                    {/* Quality Metric & Distribution breakdown */}
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/60 text-xs font-mono">
                      <div className="flex items-center justify-between text-slate-400 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800/50">
                        <span>Face Quality</span>
                        <span className="font-bold text-slate-200">
                          {Math.round(activePerson.face.quality * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800/50">
                        <span>Bounding Size</span>
                        <span className="font-bold text-slate-200">
                          {Math.round(activePerson.face.bbox.width)}x
                          {Math.round(activePerson.face.bbox.height)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 font-mono py-1">
                    {activePerson.face?.expression.status === 'FACE TOO SMALL'
                      ? 'Face too small (< 60px) for reliable inference • Expression not analyzed'
                      : activePerson.face?.expression.status === 'EXPRESSION UNCERTAIN'
                      ? 'Low confidence margin between top classes • Expression uncertain'
                      : 'Face not detected or occluded • Move closer to camera'}
                  </div>
                )}
              </div>
            )}

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/70 text-center">
              <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                <span className="text-[10px] text-slate-500 font-mono block">CONFIDENCE</span>
                <span className="text-sm font-mono font-bold text-cyan-300">
                  {Math.round(activePerson.confidence * 100)}%
                </span>
              </div>
              <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                <span className="text-[10px] text-slate-500 font-mono block">VELOCITY</span>
                <span className="text-sm font-mono font-bold text-slate-200">
                  {(activePerson.velocity * 10).toFixed(1)}{' '}
                  <span className="text-[9px] text-slate-500 font-normal">px/f</span>
                </span>
              </div>
              <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                <span className="text-[10px] text-slate-500 font-mono block">KEYPOINTS</span>
                <span className="text-sm font-mono font-bold text-emerald-400">17 COCO</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="inline-flex p-3 rounded-full bg-slate-800/50 text-slate-500 mb-2">
              <Activity className="w-6 h-6 animate-pulse text-cyan-400" />
            </div>
            <p className="text-sm font-medium text-slate-300">Awaiting Person in View</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              Position yourself in front of the camera. The COCO-17 pose estimator will instantly lock on and classify your activity.
            </p>
          </div>
        )}
      </div>

      {/* 2. Facial Dataset Provenance Card (FER-2013, AffectNet, CK+) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
          <span className="text-xs font-mono font-semibold uppercase text-slate-300 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            FACIAL TRAINING DATASET
          </span>
          <span className="text-[10px] font-mono text-slate-500">GROUNDED VISION</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {(['FER-2013', 'AffectNet', 'CK+'] as FacialDatasetType[]).map((dataset) => (
            <button
              key={dataset}
              onClick={() => updateSettings({ facialDataset: dataset })}
              className={`p-2 rounded-xl text-left border transition-all ${
                settings.facialDataset === dataset
                  ? 'bg-purple-950/70 border-purple-700 text-purple-200 shadow-sm'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              <div className="text-xs font-bold font-mono truncate">{dataset}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {dataset === 'FER-2013'
                  ? '35.8k Kaggle'
                  : dataset === 'AffectNet'
                  ? '400k Wild'
                  : '593 Lab'}
              </div>
            </button>
          ))}
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs font-mono space-y-1 text-slate-400">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Name:</span>
            <span className="text-slate-200 font-semibold">{currentDatasetMeta.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Input Resolution:</span>
            <span className="text-slate-300">{currentDatasetMeta.resolution}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Source:</span>
            <span className="text-slate-300 truncate max-w-[200px]" title={currentDatasetMeta.source}>
              {currentDatasetMeta.source}
            </span>
          </div>
        </div>

        {/* Ethical / Scientific Disclaimer (Requirement #40) */}
        <div className="mt-3 p-2 rounded-lg bg-amber-950/30 border border-amber-800/40 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-300/90 leading-tight">
            {FACIAL_EXPRESSION_NOTE}
          </p>
        </div>
      </div>

      {/* 3. Visual Layer Toggles & Source Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
          <span className="text-xs font-mono font-semibold uppercase text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            VIEWPORT OVERLAYS
          </span>
          <span className="text-[10px] font-mono text-slate-500">REAL-TIME ANNOTATIONS</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Toggle Skeleton */}
          <button
            onClick={() => updateSettings({ showPose: !settings.showPose })}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-medium flex items-center justify-between border transition-colors ${
              settings.showPose
                ? 'bg-cyan-950/60 border-cyan-800 text-cyan-300'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            <span>COCO Skeleton</span>
            <span className={`w-2 h-2 rounded-full ${settings.showPose ? 'bg-cyan-400' : 'bg-slate-700'}`} />
          </button>

          {/* Toggle Bounding Box */}
          <button
            onClick={() => updateSettings({ showBoundingBoxes: !settings.showBoundingBoxes })}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-medium flex items-center justify-between border transition-colors ${
              settings.showBoundingBoxes
                ? 'bg-cyan-950/60 border-cyan-800 text-cyan-300'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            <span>Body Box</span>
            <span
              className={`w-2 h-2 rounded-full ${
                settings.showBoundingBoxes ? 'bg-cyan-400' : 'bg-slate-700'
              }`}
            />
          </button>

          {/* Toggle Head Badges */}
          <button
            onClick={() => updateSettings({ showActivityLabels: !settings.showActivityLabels })}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-medium flex items-center justify-between border transition-colors ${
              settings.showActivityLabels
                ? 'bg-cyan-950/60 border-cyan-800 text-cyan-300'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            <span>Action Badges</span>
            <span
              className={`w-2 h-2 rounded-full ${
                settings.showActivityLabels ? 'bg-cyan-400' : 'bg-slate-700'
              }`}
            />
          </button>

          {/* Toggle Face Box */}
          <button
            onClick={() => updateSettings({ showFaceBox: !settings.showFaceBox })}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-medium flex items-center justify-between border transition-colors ${
              settings.showFaceBox
                ? 'bg-purple-950/60 border-purple-800 text-purple-300'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            <span>Face Box</span>
            <span
              className={`w-2 h-2 rounded-full ${
                settings.showFaceBox ? 'bg-purple-400' : 'bg-slate-700'
              }`}
            />
          </button>

          {/* Toggle Expression */}
          <button
            onClick={() => updateSettings({ showExpressionLabel: !settings.showExpressionLabel })}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-medium flex items-center justify-between border transition-colors ${
              settings.showExpressionLabel
                ? 'bg-cyan-950/60 border-cyan-800 text-cyan-300'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            <span>Expression Label</span>
            <span
              className={`w-2 h-2 rounded-full ${
                settings.showExpressionLabel ? 'bg-cyan-400' : 'bg-slate-700'
              }`}
            />
          </button>

          {/* Toggle Facial AI Module */}
          <button
            onClick={() => updateSettings({ enableFacialExpression: !settings.enableFacialExpression })}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-medium flex items-center justify-between border transition-colors ${
              settings.enableFacialExpression
                ? 'bg-purple-950/60 border-purple-800 text-purple-300'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            <span>Facial AI Engine</span>
            <span
              className={`w-2 h-2 rounded-full ${
                settings.enableFacialExpression ? 'bg-purple-400' : 'bg-slate-700'
              }`}
            />
          </button>
        </div>

        {/* Source Switchers & Reset */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/60">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={onFileInputChange}
          />

          <button
            onClick={() => {
              if (videoSource === 'webcam' && isCameraActive) {
                stopCamera();
              } else {
                startCamera();
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              isCameraActive
                ? 'bg-rose-950/50 border-rose-800 text-rose-300 hover:bg-rose-900/50'
                : 'bg-cyan-600 hover:bg-cyan-500 border-cyan-500 text-slate-950 font-bold'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isCameraActive ? 'Turn Off Camera' : 'Turn On Camera'}</span>
          </button>

          <button
            onClick={() => {
              stopCamera();
              setVideoSource('demo');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              videoSource === 'demo'
                ? 'bg-slate-800 border-slate-600 text-slate-100'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            Demo Simulation
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-slate-950/50 hover:bg-slate-800/60 text-slate-300 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Video</span>
          </button>

          <button
            onClick={resetTracker}
            className="p-1.5 rounded-lg bg-slate-950/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors ml-auto"
            title="Reset Person IDs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Live Action & Facial Transitions Timeline */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
          <span className="text-xs font-mono font-semibold uppercase text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            LIVE TRANSITION FEED
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {events.length} LOGGED
          </span>
        </div>

        {events.length > 0 ? (
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {events.slice(0, 8).map((evt) => {
              const timeStr = new Date(evt.timestamp).toLocaleTimeString();
              const isFaceEvent = evt.type === 'FACIAL_EXPRESSION_CHANGE';
              return (
                <div
                  key={evt.id}
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
                    isFaceEvent
                      ? 'bg-purple-950/30 border-purple-900/40 text-purple-200'
                      : 'bg-slate-950/60 border-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold ${
                        isFaceEvent ? 'text-purple-400' : 'text-cyan-400'
                      }`}
                    >
                      {evt.personId}
                    </span>
                    <span className="font-medium">{evt.details}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{timeStr}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-slate-500 font-mono">
            Waiting for activity and facial expression transitions...
          </div>
        )}
      </div>
    </div>
  );
};
