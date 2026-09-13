/**
 * Real-time Multi-Person Tracker
 * Centroid & IoU association (SORT-inspired) with anonymous IDs (P01, P02...)
 * Temporal smoothing for activity recognition and movement state debouncing
 */

import {
  ActivityHistoryItem,
  ActivityType,
  BoundingBox,
  DetectedObject,
  Keypoint,
  MovementState,
  SystemSettings,
  TrackedPerson,
} from '../types';
import { classifyActivity } from './activityEngine';
import { FacialExpressionAnalyzer } from './facialExpression';

const PERSON_COLORS = [
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#f97316', // Orange
];

export interface RawDetection {
  bbox: BoundingBox;
  keypoints: Keypoint[];
  score: number;
}

interface InternalTrack {
  id: string;
  color: string;
  bbox: BoundingBox;
  keypoints: Keypoint[];
  center: { x: number; y: number };
  positions: { x: number; y: number; time: number }[];
  velocity: number;
  framesLost: number;
  hits: number;
  activity: ActivityType;
  activityStartTime: number;
  activityHistory: ActivityHistoryItem[];
  movement: MovementState;
  movementCandidate: MovementState;
  movementCandidateCount: number;
  movementStartTime: number;
  confidence: number;
  firstSeen: number;
  lastSeen: number;
  detectedObjects: DetectedObject[];
}

export class MultiPersonTracker {
  private tracks: Map<string, InternalTrack> = new Map();
  private nextIdNumber: number = 1;
  private maxFramesLost: number = 25; // Retain track for ~1 second of occlusion
  public facialAnalyzer = new FacialExpressionAnalyzer();

  /**
   * Assigns clean anonymous ID string: P01, P02, P03...
   */
  private generatePersonId(): string {
    const padded = String(this.nextIdNumber).padStart(2, '0');
    this.nextIdNumber++;
    return `P${padded}`;
  }

  /**
   * Computes Intersection-over-Union between two boxes
   */
  private computeIoU(b1: BoundingBox, b2: BoundingBox): number {
    const xLeft = Math.max(b1.x, b2.x);
    const yTop = Math.max(b1.y, b2.y);
    const xRight = Math.min(b1.x + b1.width, b2.x + b2.width);
    const yBottom = Math.min(b1.y + b1.height, b2.y + b2.height);

    if (xRight <= xLeft || yBottom <= yTop) return 0;

    const intersectionArea = (xRight - xLeft) * (yBottom - yTop);
    const b1Area = b1.width * b1.height;
    const b2Area = b2.width * b2.height;
    const unionArea = b1Area + b2Area - intersectionArea;

    return unionArea > 0 ? intersectionArea / unionArea : 0;
  }

  /**
   * Computes centroid distance
   */
  private computeCentroidDistance(
    c1: { x: number; y: number },
    c2: { x: number; y: number }
  ): number {
    return Math.hypot(c1.x - c2.x, c1.y - c2.y);
  }

  /**
   * Main tracking update step with new raw detections and detected objects
   */
  public update(
    rawDetections: RawDetection[],
    detectedObjects: DetectedObject[] = [],
    settings: SystemSettings,
    currentTime: number = Date.now()
  ): TrackedPerson[] {
    const matchedTrackIds = new Set<string>();
    const matchedDetectionIndices = new Set<number>();

    // 1. Match existing tracks to detections using IoU + Centroid proximity
    const existingTracks = Array.from(this.tracks.values());

    for (let d = 0; d < rawDetections.length; d++) {
      const det = rawDetections[d];
      const detCenter = {
        x: det.bbox.x + det.bbox.width / 2,
        y: det.bbox.y + det.bbox.height / 2,
      };

      let bestTrack: InternalTrack | null = null;
      let bestScore = -1;

      for (const track of existingTracks) {
        if (matchedTrackIds.has(track.id)) continue;

        const iou = this.computeIoU(track.bbox, det.bbox);
        const dist = this.computeCentroidDistance(track.center, detCenter);
        const normDist = 1 / (1 + dist / (track.bbox.height || 100));

        // Combined association score
        const matchScore = iou * 0.6 + normDist * 0.4;

        if (matchScore > bestScore && (iou > 0.15 || dist < track.bbox.height * 0.8)) {
          bestScore = matchScore;
          bestTrack = track;
        }
      }

      if (bestTrack) {
        matchedTrackIds.add(bestTrack.id);
        matchedDetectionIndices.add(d);

        // Update track
        this.updateTrackWithDetection(
          bestTrack,
          det,
          detectedObjects,
          settings,
          currentTime
        );
      }
    }

    // 2. Initialize new tracks for unmatched detections
    for (let d = 0; d < rawDetections.length; d++) {
      if (matchedDetectionIndices.has(d)) continue;
      const det = rawDetections[d];

      const newId = this.generatePersonId();
      const color =
        PERSON_COLORS[(this.nextIdNumber - 2) % PERSON_COLORS.length];
      const center = {
        x: det.bbox.x + det.bbox.width / 2,
        y: det.bbox.y + det.bbox.height / 2,
      };

      const newTrack: InternalTrack = {
        id: newId,
        color,
        bbox: det.bbox,
        keypoints: det.keypoints,
        center,
        positions: [{ x: center.x, y: center.y, time: currentTime }],
        velocity: 0,
        framesLost: 0,
        hits: 1,
        activity: 'Standing',
        activityStartTime: currentTime,
        activityHistory: [],
        movement: 'NOT MOVING',
        movementCandidate: 'NOT MOVING',
        movementCandidateCount: 0,
        movementStartTime: currentTime,
        confidence: det.score,
        firstSeen: currentTime,
        lastSeen: currentTime,
        detectedObjects: [],
      };

      this.tracks.set(newId, newTrack);
      this.updateTrackWithDetection(
        newTrack,
        det,
        detectedObjects,
        settings,
        currentTime
      );
    }

    // 3. Increment framesLost for unmatched tracks & cleanup dead tracks
    const allTrackIds = Array.from(this.tracks.keys());
    for (const trackId of allTrackIds) {
      const track = this.tracks.get(trackId)!;
      if (!matchedTrackIds.has(trackId)) {
        track.framesLost++;
        if (track.framesLost > this.maxFramesLost) {
          // Finalize last activity history item
          if (track.activity) {
            const duration = Math.max(
              0,
              Math.round((currentTime - track.activityStartTime) / 1000)
            );
            track.activityHistory.push({
              activity: track.activity,
              movement: track.movement,
              startTime: track.activityStartTime,
              endTime: currentTime,
              durationSeconds: duration,
              confidence: track.confidence,
            });
          }
          this.tracks.delete(trackId);
        }
      }
    }

    // 4. Output active TrackedPerson records
    return this.getActivePeople(currentTime, settings);
  }

  private updateTrackWithDetection(
    track: InternalTrack,
    det: RawDetection,
    allDetectedObjects: DetectedObject[],
    settings: SystemSettings,
    currentTime: number
  ): void {
    const prevCenter = track.center;
    const newCenter = {
      x: det.bbox.x + det.bbox.width / 2,
      y: det.bbox.y + det.bbox.height / 2,
    };

    // Calculate instantaneous step
    const stepDist = this.computeCentroidDistance(prevCenter, newCenter);
    const dt = Math.max((currentTime - track.lastSeen) / 1000, 0.016);
    const currentSpeed = stepDist / dt;

    // Exponential smoothing for velocity
    track.velocity = track.velocity * 0.7 + currentSpeed * 0.3;

    // Temporal positions buffer (window size e.g. 15-30 frames)
    track.positions.push({ x: newCenter.x, y: newCenter.y, time: currentTime });
    const maxPositions = settings.temporalWindowSize || 25;
    if (track.positions.length > maxPositions) {
      track.positions.shift();
    }

    track.bbox = det.bbox;
    track.keypoints = det.keypoints;
    track.center = newCenter;
    track.framesLost = 0;
    track.hits++;
    track.lastSeen = currentTime;
    track.confidence = det.score;

    // Filter objects close to this person
    track.detectedObjects = allDetectedObjects.filter((obj) => {
      const objCenterX = obj.bbox[0] + obj.bbox[2] / 2;
      const objCenterY = obj.bbox[1] + obj.bbox[3] / 2;
      return (
        objCenterX >= det.bbox.x - 30 &&
        objCenterX <= det.bbox.x + det.bbox.width + 30 &&
        objCenterY >= det.bbox.y - 30 &&
        objCenterY <= det.bbox.y + det.bbox.height + 30
      );
    });

    // Check distance to other people for interaction
    let minNearbyDistance = Infinity;
    for (const [otherId, otherTrack] of this.tracks.entries()) {
      if (otherId === track.id || otherTrack.framesLost > 5) continue;
      const d = this.computeCentroidDistance(track.center, otherTrack.center);
      if (d < minNearbyDistance) {
        minNearbyDistance = d;
      }
    }

    // Run Activity Engine
    const inference = classifyActivity({
      personId: track.id,
      keypoints: track.keypoints,
      bbox: track.bbox,
      velocity: track.velocity,
      recentPositions: track.positions,
      detectedObjects: track.detectedObjects,
      nearbyPersonDistance:
        minNearbyDistance !== Infinity ? minNearbyDistance : undefined,
      thresholds: {
        detectionConfidence: settings.detectionConfidence,
        activityConfidence: settings.activityConfidence,
        movementThreshold: settings.movementThreshold,
      },
    });

    // Movement state debouncing to prevent rapid switching
    if (inference.movement === track.movementCandidate) {
      track.movementCandidateCount++;
      // Require 4 frames of consistency before switching
      if (track.movementCandidateCount >= 4 && track.movement !== inference.movement) {
        track.movement = inference.movement;
        track.movementStartTime = currentTime;
      }
    } else {
      track.movementCandidate = inference.movement;
      track.movementCandidateCount = 1;
    }

    // Activity transition check
    if (inference.activity !== track.activity) {
      // Record previous activity history item
      const durationSec = Math.max(
        0,
        Math.round((currentTime - track.activityStartTime) / 1000)
      );

      // Only archive if lasted at least 1 second
      if (durationSec >= 1) {
        track.activityHistory.push({
          activity: track.activity,
          movement: track.movement,
          startTime: track.activityStartTime,
          endTime: currentTime,
          durationSeconds: durationSec,
          confidence: track.confidence,
        });
      }

      track.activity = inference.activity;
      track.activityStartTime = currentTime;
      track.confidence = inference.confidence;
    }
  }

  public getActivePeople(
    currentTime: number = Date.now(),
    settings?: SystemSettings
  ): TrackedPerson[] {
    const result: TrackedPerson[] = [];

    for (const track of this.tracks.values()) {
      // Only include active tracks
      if (track.framesLost > 4) continue;

      // Extract head position (nose keypoint or top center of bounding box)
      const nose = track.keypoints[0];
      const head =
        nose && nose.score > 0.25
          ? { x: nose.x, y: nose.y }
          : { x: track.center.x, y: track.bbox.y + 15 };

      const activityDurationSeconds = Math.max(
        0,
        Math.round((currentTime - track.activityStartTime) / 1000)
      );

      const movementDurationSeconds = Math.max(
        0,
        Math.round((currentTime - track.movementStartTime) / 1000)
      );

      const person: TrackedPerson = {
        id: track.id,
        bbox: track.bbox,
        center: track.center,
        head,
        keypoints: track.keypoints,
        activity: track.activity,
        movement: track.movement,
        confidence: track.confidence,
        velocity: Math.round(track.velocity * 10) / 10,
        activityStartTime: track.activityStartTime,
        activityDurationSeconds,
        movementDurationSeconds,
        activityHistory: [...track.activityHistory],
        detectedObjects: track.detectedObjects,
        firstSeen: track.firstSeen,
        lastSeen: track.lastSeen,
        color: track.color,
      };

      // Real-time Facial Expression Analysis Pipeline
      if (settings && settings.enableFacialExpression !== false) {
        person.face = this.facialAnalyzer.analyzePersonFace(person, settings, currentTime);
      }

      result.push(person);
    }

    // Sort by ID (P01, P02...)
    return result.sort((a, b) => a.id.localeCompare(b.id));
  }

  public reset(): void {
    this.tracks.clear();
    this.nextIdNumber = 1;
    this.facialAnalyzer.resetAll();
  }
}
