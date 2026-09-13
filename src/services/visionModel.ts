/**
 * Vision Model Service
 * Integrates TensorFlow.js Pose Detection (MoveNet with 17 COCO keypoints)
 * and COCO-SSD object detection for cell phone and held items.
 * Includes graceful fallback and realistic dynamic simulation for demo & testing.
 */

import { DetectedObject, Keypoint } from '../types';
import { RawDetection } from './tracker';

export interface VisionModelStatus {
  isInitialized: boolean;
  isLoading: boolean;
  modelName: string;
  error?: string;
  backend: string;
}

let poseDetector: any = null;
let objectDetector: any = null;
let isInitializing = false;
let initError: string | null = null;

export async function initVisionModels(
  onStatusUpdate?: (status: VisionModelStatus) => void
): Promise<boolean> {
  if (poseDetector) return true;
  if (isInitializing) return false;

  isInitializing = true;
  onStatusUpdate?.({
    isInitialized: false,
    isLoading: true,
    modelName: 'MoveNet (COCO 17) + COCO-SSD',
    backend: 'WebGL',
  });

  try {
    // Dynamic import to keep bundle agile
    const tf = await import('@tensorflow/tfjs');
    await tf.ready();

    // Check backend
    const backend = tf.getBackend();

    // Import pose detection
    const poseDetection = await import('@tensorflow-models/pose-detection');
    const cocoSsd = await import('@tensorflow-models/coco-ssd');

    // Create MoveNet detector (SinglePose or MultiPose Lightning)
    const model = poseDetection.SupportedModels.MoveNet;
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      enableSmoothing: true,
    };

    poseDetector = await poseDetection.createDetector(model, detectorConfig);

    // Create COCO-SSD detector for phones/objects
    objectDetector = await cocoSsd.load({ base: 'lite_mobilenet_v2' });

    isInitializing = false;
    onStatusUpdate?.({
      isInitialized: true,
      isLoading: false,
      modelName: 'MoveNet COCO-17 + COCO-SSD',
      backend: backend || 'webgl',
    });
    return true;
  } catch (err: any) {
    console.warn('TensorFlow vision models could not be loaded directly:', err);
    initError = err?.message || 'Failed to initialize vision models';
    isInitializing = false;
    onStatusUpdate?.({
      isInitialized: false,
      isLoading: false,
      modelName: 'Kinematic COCO Vision Engine',
      error: initError,
      backend: 'Kinematic Pipeline',
    });
    return false;
  }
}

/**
 * Runs real inference on an HTML video or image element
 */
export async function runInferenceOnElement(
  source: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement,
  confidenceThreshold: number = 0.25
): Promise<{
  detections: RawDetection[];
  objects: DetectedObject[];
}> {
  if (!poseDetector) {
    return { detections: [], objects: [] };
  }

  try {
    const [poses, detectedObjects] = await Promise.all([
      poseDetector.estimatePoses(source, { maxPoses: 5 }),
      objectDetector ? objectDetector.detect(source) : Promise.resolve([]),
    ]);

    const detections: RawDetection[] = [];

    for (const pose of poses) {
      if (!pose.keypoints || pose.keypoints.length === 0) continue;

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      let validCount = 0;
      let scoreSum = 0;

      const formattedKeypoints: Keypoint[] = pose.keypoints.map((kp: any) => {
        const x = kp.x || 0;
        const y = kp.y || 0;
        const score = kp.score || 0;

        if (score >= confidenceThreshold) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          validCount++;
          scoreSum += score;
        }

        return {
          x,
          y,
          score,
          name: kp.name,
        };
      });

      if (validCount < 4) continue;

      const avgScore = validCount > 0 ? scoreSum / validCount : 0;
      const width = Math.max(maxX - minX + 20, 40);
      const height = Math.max(maxY - minY + 30, 80);
      const bbox = {
        x: Math.max(0, minX - 10),
        y: Math.max(0, minY - 15),
        width,
        height,
      };

      detections.push({
        bbox,
        keypoints: formattedKeypoints,
        score: avgScore,
      });
    }

    const objects: DetectedObject[] = detectedObjects.map((obj: any) => ({
      class: obj.class,
      score: obj.score,
      bbox: obj.bbox,
    }));

    return { detections, objects };
  } catch (error) {
    console.error('Inference error:', error);
    return { detections: [], objects: [] };
  }
}

/**
 * High-fidelity Kinematic COCO Pose Simulation Generator
 * Generates mathematically accurate 17-keypoint human poses for demonstration,
 * video replay, and headless preview testing.
 */
export function generateKinematicCOCOPose(
  xCenter: number,
  yFloor: number,
  height: number,
  activity: 'Standing' | 'Walking' | 'Running' | 'Sitting' | 'Using Phone',
  time: number
): { bbox: { x: number; y: number; width: number; height: number }; keypoints: Keypoint[] } {
  const headRadius = height * 0.08;
  const torsoHeight = height * 0.32;
  const legLength = height * 0.42;
  const armLength = height * 0.32;

  let headY = yFloor - height + headRadius * 1.5;
  let shoulderY = headY + headRadius * 1.6;
  let hipY = shoulderY + torsoHeight;
  let shoulderSpan = height * 0.18;
  let hipSpan = height * 0.14;

  let leftKneeY = hipY + legLength * 0.5;
  let rightKneeY = hipY + legLength * 0.5;
  let leftAnkleY = yFloor;
  let rightAnkleY = yFloor;

  let leftKneeX = xCenter - hipSpan * 0.5;
  let rightKneeX = xCenter + hipSpan * 0.5;
  let leftAnkleX = leftKneeX;
  let rightAnkleX = rightKneeX;

  let leftElbowX = xCenter - shoulderSpan * 0.75;
  let leftElbowY = shoulderY + armLength * 0.5;
  let leftWristX = leftElbowX - 10;
  let leftWristY = leftElbowY + armLength * 0.5;

  let rightElbowX = xCenter + shoulderSpan * 0.75;
  let rightElbowY = shoulderY + armLength * 0.5;
  let rightWristX = rightElbowX + 10;
  let rightWristY = rightElbowY + armLength * 0.5;

  // Modulate according to activity kinematics
  if (activity === 'Walking') {
    const cycle = Math.sin(time * 0.005);
    const armCycle = Math.cos(time * 0.005);
    leftAnkleX += cycle * (height * 0.18);
    rightAnkleX -= cycle * (height * 0.18);
    leftKneeX += cycle * (height * 0.08);
    rightKneeX -= cycle * (height * 0.08);
    leftWristY += armCycle * 25;
    rightWristY -= armCycle * 25;
    headY += Math.abs(Math.sin(time * 0.01)) * 4;
  } else if (activity === 'Running') {
    const cycle = Math.sin(time * 0.01);
    const armCycle = Math.cos(time * 0.01);
    leftAnkleX += cycle * (height * 0.3);
    rightAnkleX -= cycle * (height * 0.3);
    leftKneeY -= Math.max(0, cycle) * 35;
    rightKneeY -= Math.max(0, -cycle) * 35;
    leftWristY -= armCycle * 50;
    rightWristY += armCycle * 50;
    leftWristX += armCycle * 25;
    rightWristX -= armCycle * 25;
    headY += Math.abs(Math.sin(time * 0.02)) * 10;
  } else if (activity === 'Sitting') {
    // Knees bent forward at 90 deg
    hipY = yFloor - height * 0.45;
    headY = hipY - torsoHeight - headRadius * 1.5;
    shoulderY = headY + headRadius * 1.6;
    leftKneeY = hipY + 10;
    rightKneeY = hipY + 10;
    leftKneeX = xCenter + height * 0.25;
    rightKneeX = xCenter + height * 0.22;
    leftAnkleX = leftKneeX;
    rightAnkleX = rightKneeX;
    leftAnkleY = yFloor;
    rightAnkleY = yFloor;
    leftWristY = leftKneeY - 10;
    leftWristX = leftKneeX - 15;
    rightWristY = rightKneeY - 10;
    rightWristX = rightKneeX - 15;
  } else if (activity === 'Using Phone') {
    // Right wrist elevated right next to ear/head
    rightElbowX = xCenter + shoulderSpan * 0.7;
    rightElbowY = shoulderY + armLength * 0.35;
    rightWristX = xCenter + shoulderSpan * 0.45;
    rightWristY = headY + headRadius * 0.2; // right next to ear!
    // Left arm relaxed
    leftElbowY = shoulderY + armLength * 0.5;
    leftWristY = leftElbowY + armLength * 0.5;
  }

  const keypoints: Keypoint[] = [
    { x: xCenter, y: headY, score: 0.98, name: 'nose' },
    { x: xCenter - 7, y: headY - 4, score: 0.96, name: 'left_eye' },
    { x: xCenter + 7, y: headY - 4, score: 0.96, name: 'right_eye' },
    { x: xCenter - 14, y: headY - 2, score: 0.94, name: 'left_ear' },
    { x: xCenter + 14, y: headY - 2, score: 0.94, name: 'right_ear' },
    { x: xCenter - shoulderSpan * 0.5, y: shoulderY, score: 0.97, name: 'left_shoulder' },
    { x: xCenter + shoulderSpan * 0.5, y: shoulderY, score: 0.97, name: 'right_shoulder' },
    { x: leftElbowX, y: leftElbowY, score: 0.93, name: 'left_elbow' },
    { x: rightElbowX, y: rightElbowY, score: 0.93, name: 'right_elbow' },
    { x: leftWristX, y: leftWristY, score: 0.92, name: 'left_wrist' },
    { x: rightWristX, y: rightWristY, score: 0.92, name: 'right_wrist' },
    { x: xCenter - hipSpan * 0.5, y: hipY, score: 0.95, name: 'left_hip' },
    { x: xCenter + hipSpan * 0.5, y: hipY, score: 0.95, name: 'right_hip' },
    { x: leftKneeX, y: leftKneeY, score: 0.94, name: 'left_knee' },
    { x: rightKneeX, y: rightKneeY, score: 0.94, name: 'right_knee' },
    { x: leftAnkleX, y: leftAnkleY, score: 0.92, name: 'left_ankle' },
    { x: rightAnkleX, y: rightAnkleY, score: 0.92, name: 'right_ankle' },
  ];

  const minX = Math.min(...keypoints.map((k) => k.x)) - 15;
  const maxX = Math.max(...keypoints.map((k) => k.x)) + 15;
  const minY = Math.min(...keypoints.map((k) => k.y)) - 15;
  const maxY = Math.max(...keypoints.map((k) => k.y)) + 10;

  return {
    bbox: {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    },
    keypoints,
  };
}
