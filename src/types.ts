/**
 * Core type definitions for AI Activity Monitoring Agent
 * Based on COCO 17 Keypoints and Multi-Person Tracking
 */

export interface Keypoint {
  x: number;
  y: number;
  score: number;
  name?: string;
}

export type COCOKeypointIndex =
  | 0 // nose
  | 1 // left_eye
  | 2 // right_eye
  | 3 // left_ear
  | 4 // right_ear
  | 5 // left_shoulder
  | 6 // right_shoulder
  | 7 // left_elbow
  | 8 // right_elbow
  | 9 // left_wrist
  | 10 // right_wrist
  | 11 // left_hip
  | 12 // right_hip
  | 13 // left_knee
  | 14 // right_knee
  | 15 // left_ankle
  | 16; // right_ankle

export const COCO_KEYPOINT_NAMES = [
  'nose',
  'left_eye',
  'right_eye',
  'left_ear',
  'right_ear',
  'left_shoulder',
  'right_shoulder',
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist',
  'left_hip',
  'right_hip',
  'left_knee',
  'right_knee',
  'left_ankle',
  'right_ankle',
] as const;

export const SKELETON_PAIRS: [number, number][] = [
  [0, 1], // nose -> left eye
  [0, 2], // nose -> right eye
  [1, 3], // left eye -> left ear
  [2, 4], // right eye -> right ear
  [5, 6], // left shoulder -> right shoulder
  [5, 7], // left shoulder -> left elbow
  [7, 9], // left elbow -> left wrist
  [6, 8], // right shoulder -> right elbow
  [8, 10], // right elbow -> right wrist
  [5, 11], // left shoulder -> left hip
  [6, 12], // right shoulder -> right hip
  [11, 12], // left hip -> right hip
  [11, 13], // left hip -> left knee
  [13, 15], // left knee -> left ankle
  [12, 14], // right hip -> right knee
  [14, 16], // right knee -> right ankle
];

export type ActivityType =
  | 'Standing'
  | 'Sitting'
  | 'Walking'
  | 'Running'
  | 'Using Phone'
  | 'Holding Object'
  | 'Interacting With Person'
  | 'Unknown';

export type MovementState = 'MOVING' | 'NOT MOVING';

export type FacialExpressionType =
  | 'Anger-like'
  | 'Disgust-like'
  | 'Fear-like'
  | 'Happy-like'
  | 'Sad-like'
  | 'Surprise-like'
  | 'Neutral-like'
  | 'Unknown'
  | 'Not Analyzed';

export type FaceStatusType =
  | 'FACE ANALYZING'
  | 'FACE TOO SMALL'
  | 'FACE UNCLEAR'
  | 'FACE OCCLUDED'
  | 'FACE NOT DETECTED'
  | 'EXPRESSION UNCERTAIN'
  | 'FACIAL MODEL OFFLINE';

export interface FaceBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExpressionProbability {
  expression: FacialExpressionType;
  probability: number;
}

export interface FacialExpressionData {
  label: FacialExpressionType;
  confidence: number;
  durationSeconds: number;
  startTime: number;
  status: FaceStatusType;
  reason?: string;
  probabilities?: ExpressionProbability[];
}

export interface FaceQualityResult {
  usable: boolean;
  qualityScore: number;
  reason: string;
  faceWidth: number;
  faceHeight: number;
  blurScore?: number;
  confidence: number;
}

export interface FaceData {
  detected: boolean;
  quality: number; // 0.0 - 1.0
  bbox: FaceBoundingBox;
  center: { x: number; y: number };
  expression: FacialExpressionData;
  history: {
    label: FacialExpressionType;
    confidence: number;
    durationSeconds: number;
    timestamp: number;
  }[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedObject {
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, w, h]
}

export interface ActivityHistoryItem {
  activity: ActivityType;
  movement: MovementState;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  confidence: number;
}

export interface TrackedPerson {
  id: string; // e.g. "P01"
  bbox: BoundingBox;
  center: { x: number; y: number };
  head: { x: number; y: number };
  keypoints: Keypoint[];
  activity: ActivityType;
  movement: MovementState;
  confidence: number;
  velocity: number;
  activityStartTime: number;
  activityDurationSeconds: number;
  movementDurationSeconds: number;
  activityHistory: ActivityHistoryItem[];
  detectedObjects: DetectedObject[];
  interactingWithId?: string;
  firstSeen: number;
  lastSeen: number;
  color: string;
  face?: FaceData;
}

export interface FacialDistributionStats {
  happyLike: number;
  neutralLike: number;
  sadLike: number;
  surpriseLike: number;
  angerLike: number;
  fearLike: number;
  disgustLike: number;
  notAnalyzed: number;
  uncertain: number;
  analyzedFacesCount: number;
  avgFaceQuality: number;
  coveragePercent: number;
}

export interface MonitoringStats {
  totalPeople: number;
  moving: number;
  notMoving: number;
  standing: number;
  sitting: number;
  walking: number;
  running: number;
  usingPhone: number;
  holdingObject: number;
  interacting: number;
  unknown: number;
  avgConfidence: number;
  fps: number;
  facialStats?: FacialDistributionStats;
}

export interface MonitorEvent {
  id: string;
  timestamp: number;
  personId: string;
  type:
    | 'ACTIVITY_CHANGE'
    | 'MOVEMENT_CHANGE'
    | 'INTERACTION'
    | 'OBJECT_DETECTED'
    | 'FACIAL_EXPRESSION_CHANGE'
    | 'FACE_QUALITY_REJECTION';
  details: string;
  activity: ActivityType;
  movement: MovementState;
  confidence: number;
  expression?: FacialExpressionType;
  faceQuality?: number;
  faceReason?: string;
}

export type FacialDatasetType = 'FER-2013' | 'AffectNet' | 'CK+';

export interface SystemSettings {
  detectionConfidence: number; // 0.1 - 1.0
  activityConfidence: number; // 0.1 - 1.0
  movementThreshold: number; // relative movement threshold
  temporalWindowSize: number; // frame count e.g. 15-45
  targetFps: number; // 15, 30
  showPose: boolean;
  showBoundingBoxes: boolean;
  showActivityLabels: boolean;
  showConfidence: boolean;
  useBackendVision: boolean;
  demoMode: boolean;
  // Facial Expression Analysis Settings
  enableFacialExpression: boolean;
  showFaceBox: boolean;
  showExpressionLabel: boolean;
  minFaceWidth: number; // default 60
  minFaceHeight: number; // default 60
  minFaceConfidence: number; // default 0.70
  expressionConfidenceThreshold: number; // default 0.60
  temporalSmoothingWindow: number; // default 10 frames
  faceQualityThreshold: number; // default 0.70
  facialDataset: FacialDatasetType;
  localDatasetPath: string;
}
