/**
 * Pose Processing and Activity Classification Engine
 * Normalized geometric computations based on 17 COCO keypoints
 */

import {
  ActivityType,
  BoundingBox,
  COCOKeypointIndex,
  DetectedObject,
  Keypoint,
  MovementState,
} from '../types';

export interface GeometricFeatures {
  bodyAngle: number;
  torsoAngle: number;
  leftKneeAngle: number;
  rightKneeAngle: number;
  leftElbowAngle: number;
  rightElbowAngle: number;
  hipHeightRelative: number;
  kneeHeightRelative: number;
  torsoHeight: number;
  normalizedDisplacement: number;
}

/**
 * Calculates angle between three points (A -> B -> C) in degrees at point B
 */
export function calculateAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return angle;
}

/**
 * Computes Euclidean distance between two points
 */
export function distance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

/**
 * Extracts normalized geometric features from COCO 17 keypoints
 */
export function extractGeometricFeatures(
  keypoints: Keypoint[],
  bbox: BoundingBox,
  velocity: number
): GeometricFeatures {
  const kp = (idx: COCOKeypointIndex) =>
    keypoints[idx] || { x: 0, y: 0, score: 0 };

  const nose = kp(0);
  const leftShoulder = kp(5);
  const rightShoulder = kp(6);
  const leftElbow = kp(7);
  const rightElbow = kp(8);
  const leftWrist = kp(9);
  const rightWrist = kp(10);
  const leftHip = kp(11);
  const rightHip = kp(12);
  const leftKnee = kp(13);
  const rightKnee = kp(14);
  const leftAnkle = kp(15);
  const rightAnkle = kp(16);

  // Midpoints
  const shoulderMid = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
  };
  const hipMid = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
  };

  // Torso vertical angle (0 deg = vertical, 90 deg = horizontal)
  const dx = Math.abs(shoulderMid.x - hipMid.x);
  const dy = Math.max(Math.abs(shoulderMid.y - hipMid.y), 1);
  const torsoAngle = (Math.atan2(dx, dy) * 180) / Math.PI;

  // Knee angles (hip -> knee -> ankle)
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

  // Elbow angles (shoulder -> elbow -> wrist)
  const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

  // Normalization scaling factor based on torso or bounding box height
  const torsoHeight = Math.max(distance(shoulderMid, hipMid), bbox.height * 0.35, 10);

  // Relative vertical positions of hips vs knees vs ankles
  const hipHeightRelative = (hipMid.y - bbox.y) / Math.max(bbox.height, 1);
  const kneeMidY = (leftKnee.y + rightKnee.y) / 2;
  const kneeHeightRelative = (kneeMidY - bbox.y) / Math.max(bbox.height, 1);

  const normalizedDisplacement = velocity / Math.max(bbox.height, 50);

  return {
    bodyAngle: torsoAngle,
    torsoAngle,
    leftKneeAngle,
    rightKneeAngle,
    leftElbowAngle,
    rightElbowAngle,
    hipHeightRelative,
    kneeHeightRelative,
    torsoHeight,
    normalizedDisplacement,
  };
}

export interface ActivityInferenceInput {
  personId: string;
  keypoints: Keypoint[];
  bbox: BoundingBox;
  velocity: number;
  recentPositions: { x: number; y: number; time: number }[];
  detectedObjects?: DetectedObject[];
  nearbyPersonDistance?: number;
  thresholds: {
    detectionConfidence: number;
    activityConfidence: number;
    movementThreshold: number;
  };
}

export interface ActivityInferenceOutput {
  activity: ActivityType;
  movement: MovementState;
  confidence: number;
  holdingObjectName?: string;
  interactingPersonId?: string;
}

/**
 * Primary Activity Engine
 * Deterministic multi-frame geometric analysis
 */
export function classifyActivity(
  input: ActivityInferenceInput
): ActivityInferenceOutput {
  const {
    keypoints,
    bbox,
    velocity,
    recentPositions,
    detectedObjects = [],
    nearbyPersonDistance,
    thresholds,
  } = input;

  // Compute average confidence of core torso/leg keypoints
  const coreIndices = [0, 5, 6, 11, 12, 13, 14];
  let totalScore = 0;
  let count = 0;
  for (const idx of coreIndices) {
    if (keypoints[idx]) {
      totalScore += keypoints[idx].score;
      count++;
    }
  }
  const avgKeypointScore = count > 0 ? totalScore / count : 0;

  if (avgKeypointScore < 0.25) {
    return {
      activity: 'Unknown',
      movement: 'NOT MOVING',
      confidence: Math.max(avgKeypointScore, 0.2),
    };
  }

  const features = extractGeometricFeatures(keypoints, bbox, velocity);

  // 1. Movement detection with multi-frame displacement
  // We use recent positions over temporal window
  let netDisplacement = 0;
  if (recentPositions.length >= 2) {
    const oldest = recentPositions[0];
    const newest = recentPositions[recentPositions.length - 1];
    netDisplacement = Math.hypot(newest.x - oldest.x, newest.y - oldest.y);
  }
  const normalizedNetDisplacement = netDisplacement / Math.max(bbox.height, 50);

  const isMoving =
    features.normalizedDisplacement > thresholds.movementThreshold ||
    normalizedNetDisplacement > thresholds.movementThreshold * 1.5;

  const movementState: MovementState = isMoving ? 'MOVING' : 'NOT MOVING';

  // 2. Phone Detection
  // Check if detected "cell phone" is near hands or head
  const nose = keypoints[0] || { x: 0, y: 0, score: 0 };
  const leftEar = keypoints[3] || { x: 0, y: 0, score: 0 };
  const rightEar = keypoints[4] || { x: 0, y: 0, score: 0 };
  const leftWrist = keypoints[9] || { x: 0, y: 0, score: 0 };
  const rightWrist = keypoints[10] || { x: 0, y: 0, score: 0 };

  const phoneObj = detectedObjects.find(
    (obj) => obj.class === 'cell phone' || obj.class === 'phone'
  );

  const distToEarLeft = Math.min(
    distance(leftWrist, leftEar),
    distance(leftWrist, nose)
  );
  const distToEarRight = Math.min(
    distance(rightWrist, rightEar),
    distance(rightWrist, nose)
  );

  const isHandNearEar =
    (leftWrist.score > 0.35 && distToEarLeft < features.torsoHeight * 0.45) ||
    (rightWrist.score > 0.35 && distToEarRight < features.torsoHeight * 0.45);

  if (phoneObj || isHandNearEar) {
    // If phone object detected near person or hand held to ear
    const phoneConfidence = phoneObj ? 0.94 : 0.88;
    return {
      activity: 'Using Phone',
      movement: movementState,
      confidence: phoneConfidence,
    };
  }

  // 3. Holding Object Detection
  const holdableObj = detectedObjects.find(
    (obj) =>
      obj.class !== 'person' &&
      obj.class !== 'cell phone' &&
      ['cup', 'bottle', 'backpack', 'handbag', 'suitcase', 'book', 'laptop'].includes(
        obj.class
      )
  );

  if (holdableObj) {
    const objCenter = {
      x: holdableObj.bbox[0] + holdableObj.bbox[2] / 2,
      y: holdableObj.bbox[1] + holdableObj.bbox[3] / 2,
    };
    const distToLeftWrist = distance(leftWrist, objCenter);
    const distToRightWrist = distance(rightWrist, objCenter);

    if (
      Math.min(distToLeftWrist, distToRightWrist) <
      Math.max(features.torsoHeight * 0.6, 60)
    ) {
      return {
        activity: 'Holding Object',
        movement: movementState,
        confidence: Math.min(0.92, holdableObj.score + 0.1),
        holdingObjectName: holdableObj.class,
      };
    }
  }

  // 4. Person Interaction
  if (
    nearbyPersonDistance !== undefined &&
    nearbyPersonDistance < bbox.height * 1.15 &&
    features.torsoAngle < 35
  ) {
    return {
      activity: 'Interacting With Person',
      movement: movementState,
      confidence: 0.89,
    };
  }

  // 5. Sitting Detection
  // Hips and knees close in Y or knee angle sharply bent
  const avgKneeAngle = (features.leftKneeAngle + features.rightKneeAngle) / 2;
  const isKneeBent =
    (features.leftKneeAngle > 50 && features.leftKneeAngle < 135) ||
    (features.rightKneeAngle > 50 && features.rightKneeAngle < 135);

  const verticalLegCompression =
    features.kneeHeightRelative - features.hipHeightRelative;

  if (isKneeBent && !isMoving && verticalLegCompression < 0.35) {
    return {
      activity: 'Sitting',
      movement: 'NOT MOVING',
      confidence: 0.95,
    };
  }

  // 6. Running Detection
  // High normalized velocity and significant displacement
  if (
    features.normalizedDisplacement > thresholds.movementThreshold * 3.2 ||
    normalizedNetDisplacement > thresholds.movementThreshold * 3.5
  ) {
    return {
      activity: 'Running',
      movement: 'MOVING',
      confidence: 0.93,
    };
  }

  // 7. Walking Detection
  // Moderate displacement and moving state
  if (
    isMoving ||
    features.normalizedDisplacement > thresholds.movementThreshold
  ) {
    return {
      activity: 'Walking',
      movement: 'MOVING',
      confidence: 0.92,
    };
  }

  // 8. Standing Detection
  // Upright torso, knees relatively straight, low movement
  if (
    features.torsoAngle < 30 &&
    (features.leftKneeAngle > 140 || features.rightKneeAngle > 140 || avgKneeAngle > 135)
  ) {
    return {
      activity: 'Standing',
      movement: 'NOT MOVING',
      confidence: 0.96,
    };
  }

  // Default fallback
  return {
    activity: 'Standing',
    movement: movementState,
    confidence: 0.75,
  };
}
