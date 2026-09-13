/**
 * Global Monitoring State Context
 * Coordinates Video Feed, Tracker, Activity Events, Stats & Settings
 */

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MultiPersonTracker, RawDetection } from '../services/tracker';
import {
  generateKinematicCOCOPose,
  initVisionModels,
  runInferenceOnElement,
  VisionModelStatus,
} from '../services/visionModel';
import {
  ActivityType,
  DetectedObject,
  MonitorEvent,
  MonitoringStats,
  SystemSettings,
  TrackedPerson,
} from '../types';

interface MonitoringContextType {
  people: TrackedPerson[];
  stats: MonitoringStats;
  events: MonitorEvent[];
  settings: SystemSettings;
  isCameraActive: boolean;
  isPaused: boolean;
  videoSource: 'webcam' | 'demo' | 'upload';
  cameraStatus: 'idle' | 'requesting' | 'active' | 'denied' | 'error';
  cameraError: string | null;
  visionStatus: VisionModelStatus;
  selectedPerson: TrackedPerson | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasOverlayRef: React.RefObject<HTMLCanvasElement | null>;
  startCamera: () => Promise<boolean>;
  stopCamera: () => void;
  togglePause: () => void;
  setVideoSource: (src: 'webcam' | 'demo' | 'upload') => void;
  handleFileUpload: (file: File) => void;
  updateSettings: (partial: Partial<SystemSettings>) => void;
  setSelectedPersonId: (id: string | null) => void;
  clearEvents: () => void;
  resetTracker: () => void;
}

const DEFAULT_SETTINGS: SystemSettings = {
  detectionConfidence: 0.35,
  activityConfidence: 0.5,
  movementThreshold: 0.04,
  temporalWindowSize: 25,
  targetFps: 30,
  showPose: true,
  showBoundingBoxes: true,
  showActivityLabels: true,
  showConfidence: true,
  useBackendVision: false,
  demoMode: false,
  enableFacialExpression: true,
  showFaceBox: true,
  showExpressionLabel: true,
  minFaceWidth: 60,
  minFaceHeight: 60,
  minFaceConfidence: 0.70,
  expressionConfidenceThreshold: 0.60,
  temporalSmoothingWindow: 10,
  faceQualityThreshold: 0.70,
  facialDataset: 'FER-2013',
  localDatasetPath: '/data/fer2013',
};

const MonitoringContext = createContext<MonitoringContextType | null>(null);

export const MonitoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [people, setPeople] = useState<TrackedPerson[]>([]);
  const [events, setEvents] = useState<MonitorEvent[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'error'>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [videoSource, setVideoSource] = useState<'webcam' | 'demo' | 'upload'>('webcam');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [visionStatus, setVisionStatus] = useState<VisionModelStatus>({
    isInitialized: false,
    isLoading: true,
    modelName: 'MoveNet COCO-17 + COCO-SSD',
    backend: 'Initializing...',
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasOverlayRef = useRef<HTMLCanvasElement | null>(null);
  const trackerRef = useRef<MultiPersonTracker>(new MultiPersonTracker());
  const animFrameIdRef = useRef<number | null>(null);
  const fpsCountRef = useRef<number>(0);
  const lastFpsTimeRef = useRef<number>(performance.now());
  const previousActivitiesRef = useRef<Map<string, ActivityType>>(new Map());
  const previousExpressionsRef = useRef<Map<string, string>>(new Map());
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const demoTimeRef = useRef<number>(0);
  const peopleRef = useRef<TrackedPerson[]>([]);
  const settingsRef = useRef<SystemSettings>(settings);

  // Keep settingsRef synchronized so the processing loop doesn't re-create unnecessarily
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Keep peopleRef synchronized
  useEffect(() => {
    peopleRef.current = people;
  }, [people]);

  // Derived statistics computed synchronously via useMemo - avoids setState in useEffect cascade
  const stats: MonitoringStats = useMemo(() => {
    let moving = 0;
    let notMoving = 0;
    let standing = 0;
    let sitting = 0;
    let walking = 0;
    let running = 0;
    let usingPhone = 0;
    let holdingObject = 0;
    let interacting = 0;
    let unknown = 0;
    let confSum = 0;

    // Facial expression aggregates
    let happyLike = 0;
    let neutralLike = 0;
    let sadLike = 0;
    let surpriseLike = 0;
    let angerLike = 0;
    let fearLike = 0;
    let disgustLike = 0;
    let notAnalyzed = 0;
    let uncertain = 0;
    let analyzedFacesCount = 0;
    let qualitySum = 0;

    for (const p of people) {
      if (p.movement === 'MOVING') moving++;
      else notMoving++;

      switch (p.activity) {
        case 'Standing':
          standing++;
          break;
        case 'Sitting':
          sitting++;
          break;
        case 'Walking':
          walking++;
          break;
        case 'Running':
          running++;
          break;
        case 'Using Phone':
          usingPhone++;
          break;
        case 'Holding Object':
          holdingObject++;
          break;
        case 'Interacting With Person':
          interacting++;
          break;
        default:
          unknown++;
          break;
      }
      confSum += p.confidence;

      if (p.face) {
        qualitySum += p.face.quality;
        if (p.face.detected && p.face.expression.label !== 'Not Analyzed') {
          analyzedFacesCount++;
          switch (p.face.expression.label) {
            case 'Happy-like':
              happyLike++;
              break;
            case 'Neutral-like':
              neutralLike++;
              break;
            case 'Sad-like':
              sadLike++;
              break;
            case 'Surprise-like':
              surpriseLike++;
              break;
            case 'Anger-like':
              angerLike++;
              break;
            case 'Fear-like':
              fearLike++;
              break;
            case 'Disgust-like':
              disgustLike++;
              break;
          }
          if (p.face.expression.status === 'EXPRESSION UNCERTAIN') {
            uncertain++;
          }
        } else {
          notAnalyzed++;
        }
      } else {
        notAnalyzed++;
      }
    }

    const avgConfidence = people.length > 0 ? Math.round((confSum / people.length) * 100) : 0;
    const avgFaceQuality = people.length > 0 ? parseFloat((qualitySum / people.length).toFixed(2)) : 0;
    const coveragePercent = people.length > 0 ? Math.round((analyzedFacesCount / people.length) * 100) : 0;

    return {
      totalPeople: people.length,
      moving,
      notMoving,
      standing,
      sitting,
      walking,
      running,
      usingPhone,
      holdingObject,
      interacting,
      unknown,
      avgConfidence,
      fps,
      facialStats: {
        happyLike,
        neutralLike,
        sadLike,
        surpriseLike,
        angerLike,
        fearLike,
        disgustLike,
        notAnalyzed,
        uncertain,
        analyzedFacesCount,
        avgFaceQuality,
        coveragePercent,
      },
    };
  }, [people, fps]);

  // Initialize Vision Models on mount
  useEffect(() => {
    initVisionModels((status) => {
      setVisionStatus(status);
    });
  }, []);

  const startCamera = async (): Promise<boolean> => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraStatus('error');
      setCameraError('Camera API not available in this browser environment.');
      setVideoSource('demo');
      return false;
    }

    setCameraStatus('requesting');
    setCameraError(null);
    try {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
      setCameraStatus('active');
      setVideoSource('webcam');
      return true;
    } catch (err: any) {
      console.warn('Camera access denied or failed:', err);
      const isDenied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      const isNotFound = err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError';
      const msg = isDenied
        ? 'Camera permission denied. Please allow camera access in your browser.'
        : isNotFound
        ? 'No camera hardware found on this device.'
        : 'Could not connect to camera stream.';
      setCameraError(msg);
      setCameraStatus(isDenied ? 'denied' : 'error');
      setIsCameraActive(false);
      // Fallback to demo simulation so user immediately sees activity detection
      setVideoSource('demo');
      return false;
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraStatus('idle');
    setVideoSource('demo');
  };

  // Automatically attempt camera initialization once on initial mount
  useEffect(() => {
    let isMounted = true;
    const autoInitCamera = async () => {
      try {
        const started = await startCamera();
        if (!started && isMounted) {
          console.log('Camera awaiting user interaction or permissions.');
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Auto-start camera notice:', err);
        }
      }
    };
    autoInitCamera();
    return () => {
      isMounted = false;
    };
  }, []);

  // Main monitoring processing loop
  useEffect(() => {
    let active = true;

    const processFrame = async () => {
      if (!active) return;

      const now = performance.now();
      fpsCountRef.current++;
      if (now - lastFpsTimeRef.current >= 1000) {
        setFps(fpsCountRef.current);
        fpsCountRef.current = 0;
        lastFpsTimeRef.current = now;
      }

      if (!isPaused) {
        let rawDetections: RawDetection[] = [];
        let detectedObjects: DetectedObject[] = [];
        const currentSettings = settingsRef.current;

        if (videoSource === 'webcam' || videoSource === 'upload') {
          // Real inference on video element
          if (
            videoRef.current &&
            videoRef.current.readyState >= 2 &&
            !videoRef.current.paused
          ) {
            const res = await runInferenceOnElement(
              videoRef.current,
              currentSettings.detectionConfidence
            );
            rawDetections = res.detections;
            detectedObjects = res.objects;
          }
        } else {
          // Dynamic Demo Kinematic COCO Simulation
          demoTimeRef.current += 16.6;
          const t = demoTimeRef.current;
          const canvasW = canvasOverlayRef.current?.width || 960;
          const canvasH = canvasOverlayRef.current?.height || 540;

          // Person 1: Walking across the scene
          const p1X = (canvasW * 0.15 + (t * 0.08) % (canvasW * 0.7));
          const p1 = generateKinematicCOCOPose(p1X, canvasH * 0.85, 230, 'Walking', t);

          // Person 2: Sitting on a chair
          const p2X = canvasW * 0.72;
          const p2 = generateKinematicCOCOPose(p2X, canvasH * 0.85, 210, 'Sitting', t);

          // Person 3: Standing and Using Phone
          const p3X = canvasW * 0.42;
          const p3 = generateKinematicCOCOPose(p3X, canvasH * 0.85, 240, 'Using Phone', t);

          rawDetections = [
            { bbox: p1.bbox, keypoints: p1.keypoints, score: 0.95 },
            { bbox: p2.bbox, keypoints: p2.keypoints, score: 0.97 },
            { bbox: p3.bbox, keypoints: p3.keypoints, score: 0.94 },
          ];

          detectedObjects = [
            {
              class: 'cell phone',
              score: 0.92,
              bbox: [p3X + 20, canvasH * 0.85 - 200, 30, 50],
            },
          ];
        }

        // Run multi-person tracker with COCO keypoints
        const updatedPeople = trackerRef.current.update(
          rawDetections,
          detectedObjects,
          currentSettings,
          Date.now()
        );

        // Guard against updating state with identical empty arrays to avoid render thrashing
        if (updatedPeople.length === 0 && peopleRef.current.length === 0) {
          // Both empty, skip state update
        } else {
          setPeople(updatedPeople);
        }

        // Detect transitions and emit events
        for (const p of updatedPeople) {
          const prevActivity = previousActivitiesRef.current.get(p.id);
          if (prevActivity && prevActivity !== p.activity) {
            const newEvent: MonitorEvent = {
              id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              timestamp: Date.now(),
              personId: p.id,
              type: 'ACTIVITY_CHANGE',
              details: `${p.id} transitioned from ${prevActivity} to ${p.activity}`,
              activity: p.activity,
              movement: p.movement,
              confidence: p.confidence,
            };
            setEvents((prev) => [newEvent, ...prev.slice(0, 49)]);

            // Push to backend asynchronously
            fetch('/api/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newEvent),
            }).catch(() => {});
          }
          previousActivitiesRef.current.set(p.id, p.activity);

          // Track facial expression transitions
          if (p.face && p.face.expression) {
            const prevExpr = previousExpressionsRef.current.get(p.id);
            const currentExpr = p.face.expression.label;
            if (
              prevExpr &&
              prevExpr !== currentExpr &&
              currentExpr !== 'Not Analyzed'
            ) {
              const exprEvent: MonitorEvent = {
                id: `face-evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                timestamp: Date.now(),
                personId: p.id,
                type: 'FACIAL_EXPRESSION_CHANGE',
                details: `${p.id} facial expression classified as ${currentExpr} (${Math.round(
                  p.face.expression.confidence * 100
                )}% confidence)`,
                activity: p.activity,
                movement: p.movement,
                confidence: p.face.expression.confidence,
                expression: currentExpr,
                faceQuality: p.face.quality,
              };
              setEvents((prev) => [exprEvent, ...prev.slice(0, 49)]);

              fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(exprEvent),
              }).catch(() => {});
            }
            previousExpressionsRef.current.set(p.id, currentExpr);
          }
        }
      }

      if (active) {
        animFrameIdRef.current = requestAnimationFrame(processFrame);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(processFrame);

    return () => {
      active = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPaused, videoSource]);

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleFileUpload = (file: File) => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    const url = URL.createObjectURL(file);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = url;
      videoRef.current.loop = true;
      videoRef.current.play();
    }
    setVideoSource('upload');
    setIsCameraActive(true);
  };

  const updateSettings = (partial: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const resetTracker = () => {
    trackerRef.current.reset();
    setPeople([]);
    previousActivitiesRef.current.clear();
  };

  const selectedPerson = useMemo(() => {
    if (!selectedPersonId) return null;
    return people.find((p) => p.id === selectedPersonId) || null;
  }, [people, selectedPersonId]);

  return (
    <MonitoringContext.Provider
      value={{
        people,
        stats,
        events,
        settings,
        isCameraActive,
        cameraStatus,
        cameraError,
        isPaused,
        videoSource,
        visionStatus,
        selectedPerson,
        videoRef,
        canvasOverlayRef,
        startCamera,
        stopCamera,
        togglePause,
        setVideoSource,
        handleFileUpload,
        updateSettings,
        setSelectedPersonId,
        clearEvents,
        resetTracker,
      }}
    >
      {children}
    </MonitoringContext.Provider>
  );
};

export function useMonitoring() {
  const ctx = useContext(MonitoringContext);
  if (!ctx) {
    throw new Error('useMonitoring must be used within MonitoringProvider');
  }
  return ctx;
}
