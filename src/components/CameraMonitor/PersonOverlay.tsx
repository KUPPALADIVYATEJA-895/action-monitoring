/**
 * Live Camera & Person Overlay Canvas
 * Renders 17 COCO keypoints, skeleton connections, bounding boxes,
 * and the HEAD-ATTACHED dynamic floating label that moves with the person.
 */

import React, { useEffect, useRef } from 'react';
import { useMonitoring } from '../../context/MonitoringContext';
import { SKELETON_PAIRS, TrackedPerson } from '../../types';
import { EXPRESSION_COLORS } from '../../services/facialExpression';
import { Camera, AlertCircle, Loader2, Play, Sparkles, Video, Smile, ScanFace, Eye, Square } from 'lucide-react';

export const PersonOverlay: React.FC = () => {
  const {
    people,
    settings,
    videoRef,
    canvasOverlayRef,
    videoSource,
    isCameraActive,
    cameraStatus,
    cameraError,
    startCamera,
    setVideoSource,
    selectedPerson,
    setSelectedPersonId,
    updateSettings,
  } = useMonitoring();

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync canvas dimensions with video stream native resolution
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncDimensions = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0 && canvasOverlayRef.current) {
        canvasOverlayRef.current.width = video.videoWidth;
        canvasOverlayRef.current.height = video.videoHeight;
      }
    };

    video.addEventListener('loadedmetadata', syncDimensions);
    video.addEventListener('resize', syncDimensions);
    return () => {
      video.removeEventListener('loadedmetadata', syncDimensions);
      video.removeEventListener('resize', syncDimensions);
    };
  }, [videoRef, canvasOverlayRef]);

  useEffect(() => {
    const canvas = canvasOverlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dynamically match canvas resolution to video feed if playing
    if ((videoSource === 'webcam' || videoSource === 'upload') && videoRef.current && videoRef.current.videoWidth > 0) {
      if (canvas.width !== videoRef.current.videoWidth || canvas.height !== videoRef.current.videoHeight) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
      }
    } else if (videoSource === 'demo') {
      if (canvas.width !== 960 || canvas.height !== 540) {
        canvas.width = 960;
        canvas.height = 540;
      }
    }

    // Clear frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If in demo mode and no video, draw a sleek cyber-grid dark surveillance background
    if (videoSource === 'demo' && (!videoRef.current || !videoRef.current.srcObject)) {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Perspective grid floor
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const floorY = canvas.height * 0.85;

      // Horizon line
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(canvas.width, floorY);
      ctx.stroke();

      // Floor grid perspective lines
      for (let x = -canvas.width; x <= canvas.width * 2; x += 60) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, floorY - 80);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal floor rungs
      for (let y = floorY; y <= canvas.height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Digital room ambient graphics
      ctx.fillStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText('CAMERA FEED 01 // COCO-17 POSE ESTIMATION ACTIVE', 20, 30);
      ctx.fillText(`ANALYTICS ENGINE: MOVING WINDOW N=25 // REAL-TIME SORT TRACKER`, 20, 46);
    }

    // Draw each tracked person
    for (const person of people) {
      const isSelected = selectedPerson?.id === person.id;
      const baseColor = person.color || '#06b6d4';

      // 1. Draw Bounding Box (if enabled)
      if (settings.showBoundingBoxes) {
        ctx.save();
        const { x, y, width, height } = person.bbox;

        // Subtle box fill
        ctx.fillStyle = isSelected
          ? 'rgba(6, 182, 212, 0.08)'
          : 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(x, y, width, height);

        // Corner brackets style
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        const cornerLen = Math.min(18, width * 0.25, height * 0.25);

        // Top Left
        ctx.beginPath();
        ctx.moveTo(x, y + cornerLen);
        ctx.lineTo(x, y);
        ctx.lineTo(x + cornerLen, y);
        ctx.stroke();

        // Top Right
        ctx.beginPath();
        ctx.moveTo(x + width - cornerLen, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + cornerLen);
        ctx.stroke();

        // Bottom Left
        ctx.beginPath();
        ctx.moveTo(x, y + height - cornerLen);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x + cornerLen, y + height);
        ctx.stroke();

        // Bottom Right
        ctx.beginPath();
        ctx.moveTo(x + width - cornerLen, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x + width, y + height - cornerLen);
        ctx.stroke();

        ctx.restore();
      }

      // 2. Draw 17 COCO Keypoints & Skeleton Bones (if enabled)
      if (settings.showPose && person.keypoints && person.keypoints.length >= 17) {
        ctx.save();

        // Draw Skeleton Lines
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';

        for (const [idxA, idxB] of SKELETON_PAIRS) {
          const kpA = person.keypoints[idxA];
          const kpB = person.keypoints[idxB];

          if (
            kpA &&
            kpB &&
            kpA.score >= settings.detectionConfidence * 0.7 &&
            kpB.score >= settings.detectionConfidence * 0.7
          ) {
            // Gradient or neon line
            ctx.strokeStyle = baseColor;
            ctx.shadowColor = baseColor;
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.moveTo(kpA.x, kpA.y);
            ctx.lineTo(kpB.x, kpB.y);
            ctx.stroke();
          }
        }

        // Draw 17 Keypoints Circles
        for (let i = 0; i < person.keypoints.length; i++) {
          const kp = person.keypoints[i];
          if (!kp || kp.score < settings.detectionConfidence * 0.6) continue;

          ctx.beginPath();
          ctx.arc(kp.x, kp.y, i === 0 ? 5 : 3.5, 0, Math.PI * 2);
          ctx.fillStyle = i === 0 ? '#ffffff' : baseColor;
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 3;
          ctx.fill();

          ctx.lineWidth = 1;
          ctx.strokeStyle = '#0f172a';
          ctx.stroke();
        }

        ctx.restore();
      }

      // 2.5 Draw Face Bounding Box (Requirement #16 & #41)
      if (settings.showFaceBox && person.face && person.face.bbox.width > 0) {
        const fb = person.face.bbox;
        ctx.save();
        const faceDetected = person.face.detected;
        ctx.strokeStyle = faceDetected ? '#c084fc' : 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(fb.x, fb.y, fb.width, fb.height);
        ctx.setLineDash([]);

        // High-tech corner indicators
        const cornerLen = Math.min(10, fb.width * 0.22);
        ctx.strokeStyle = faceDetected ? '#a855f7' : '#94a3b8';
        ctx.lineWidth = 2.5;

        // Top-Left corner
        ctx.beginPath();
        ctx.moveTo(fb.x, fb.y + cornerLen);
        ctx.lineTo(fb.x, fb.y);
        ctx.lineTo(fb.x + cornerLen, fb.y);
        ctx.stroke();

        // Top-Right corner
        ctx.beginPath();
        ctx.moveTo(fb.x + fb.width - cornerLen, fb.y);
        ctx.lineTo(fb.x + fb.width, fb.y);
        ctx.lineTo(fb.x + fb.width, fb.y + cornerLen);
        ctx.stroke();

        // Bottom-Left corner
        ctx.beginPath();
        ctx.moveTo(fb.x, fb.y + fb.height - cornerLen);
        ctx.lineTo(fb.x, fb.y + fb.height);
        ctx.lineTo(fb.x + cornerLen, fb.y + fb.height);
        ctx.stroke();

        // Bottom-Right corner
        ctx.beginPath();
        ctx.moveTo(fb.x + fb.width - cornerLen, fb.y + fb.height);
        ctx.lineTo(fb.x + fb.width, fb.y + fb.height);
        ctx.lineTo(fb.x + fb.width, fb.y + fb.height - cornerLen);
        ctx.stroke();

        // Mini status label above face box
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(fb.x, Math.max(0, fb.y - 15), 65, 14);
        ctx.fillStyle = faceDetected ? '#e9d5ff' : '#cbd5e1';
        ctx.font = 'bold 9px system-ui, sans-serif';
        const qualityText = faceDetected
          ? `FACE ${Math.round(person.face.quality * 100)}%`
          : person.face.expression.status === 'FACE TOO SMALL'
          ? 'TOO SMALL'
          : 'FACE N/A';
        ctx.fillText(qualityText, fb.x + 4, Math.max(10, fb.y - 4));

        ctx.restore();
      }

      // 3. Draw HEAD-ATTACHED Dynamic Label (Requirement #3, #15 & #41)
      // Must be rendered at head position and follow the person in real time:
      // Row 1: [ P01 • WALKING • MOVING ]
      // Row 2: [ Happy-like expression • 86% ] or [ Face too small • Not analyzed ]
      if (settings.showActivityLabels) {
        drawHeadAttachedLabel(ctx, person, isSelected);
      }
    }
  }, [people, settings, videoSource, selectedPerson?.id]);

  /**
   * Helper to render the head-attached label badge above the person's head
   */
  const drawHeadAttachedLabel = (
    ctx: CanvasRenderingContext2D,
    person: TrackedPerson,
    isSelected: boolean
  ) => {
    ctx.save();

    const headX = person.head?.x ?? person.center.x;
    const headY = person.head?.y ?? person.bbox.y;

    const isMoving = person.movement === 'MOVING';
    const movementBadgeColor = isMoving ? '#10b981' : '#64748b'; // Emerald if moving, Slate if still
    const activityText = person.activity.toUpperCase();
    const idText = person.id;
    const movementText = person.movement;
    const confidenceText = settings.showConfidence
      ? `${Math.round(person.confidence * 100)}%`
      : '';

    // Duration formatted mm:ss
    const mins = Math.floor(person.activityDurationSeconds / 60);
    const secs = person.activityDurationSeconds % 60;
    const durationText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Line 1 Content
    const line1ToMeasure = `${idText}  •  ${activityText}  •  ${movementText}  ${confidenceText ? `(${confidenceText})` : ''}  ${durationText}`;
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    const line1Width = ctx.measureText(line1ToMeasure).width;

    // Line 2 (Facial Expression) Content
    const showExpression = settings.showExpressionLabel && settings.enableFacialExpression;
    let exprText = '';
    let exprColor = '#94a3b8';

    if (showExpression) {
      if (person.face && person.face.detected && person.face.expression.label !== 'Not Analyzed') {
        const conf = Math.round(person.face.expression.confidence * 100);
        exprText = `${person.face.expression.label} expression • ${conf}%`;
        exprColor = EXPRESSION_COLORS[person.face.expression.label] || '#10b981';
      } else if (person.face?.expression.status === 'FACE TOO SMALL') {
        exprText = 'Face too small • Not analyzed';
        exprColor = '#94a3b8';
      } else if (person.face?.expression.status === 'EXPRESSION UNCERTAIN') {
        exprText = 'Expression uncertain';
        exprColor = '#eab308';
      } else if (person.face?.expression.status === 'FACE UNCLEAR') {
        exprText = 'Face unclear • Not analyzed';
        exprColor = '#f97316';
      } else if (person.face?.expression.status === 'FACE OCCLUDED') {
        exprText = 'Face occluded • Not analyzed';
        exprColor = '#f97316';
      } else if (person.face?.expression.status === 'FACIAL MODEL OFFLINE') {
        exprText = 'Facial model offline';
        exprColor = '#ef4444';
      } else {
        exprText = 'Face analyzing...';
        exprColor = '#06b6d4';
      }
    }

    ctx.font = '500 10px system-ui, sans-serif';
    const line2Width = showExpression ? ctx.measureText(exprText).width + 16 : 0;
    const maxContentWidth = Math.max(line1Width, line2Width);

    const badgeWidth = maxContentWidth + 24;
    const badgeHeight = showExpression ? 42 : 24;

    // Anchor position: above head point
    const labelY = Math.max(badgeHeight + 6, headY - 14);
    const labelX = headX;
    const badgeX = labelX - badgeWidth / 2;
    const badgeY = labelY - badgeHeight;

    // Badge Background
    ctx.fillStyle = isSelected
      ? 'rgba(15, 23, 42, 0.96)'
      : 'rgba(11, 15, 25, 0.90)';
    ctx.strokeStyle = isSelected ? '#06b6d4' : 'rgba(255, 255, 255, 0.20)';
    ctx.lineWidth = isSelected ? 2 : 1;

    // Rounded rectangle pill
    const radius = 6;
    ctx.beginPath();
    ctx.moveTo(badgeX + radius, badgeY);
    ctx.lineTo(badgeX + badgeWidth - radius, badgeY);
    ctx.arcTo(badgeX + badgeWidth, badgeY, badgeX + badgeWidth, badgeY + radius, radius);
    ctx.lineTo(badgeX + badgeWidth, badgeY + badgeHeight - radius);
    ctx.arcTo(
      badgeX + badgeWidth,
      badgeY + badgeHeight,
      badgeX + badgeWidth - radius,
      badgeY + badgeHeight,
      radius
    );
    ctx.lineTo(badgeX + radius, badgeY + badgeHeight);
    ctx.arcTo(badgeX, badgeY + badgeHeight, badgeX, badgeY + badgeHeight - radius, radius);
    ctx.lineTo(badgeX, badgeY + radius);
    ctx.arcTo(badgeX, badgeY, badgeX + radius, badgeY, radius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Connecting pointer arrow down towards head
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(labelX - 4, badgeY + badgeHeight);
    ctx.lineTo(labelX + 4, badgeY + badgeHeight);
    ctx.lineTo(labelX, badgeY + badgeHeight + 5);
    ctx.closePath();
    ctx.fill();

    // Render Row 1: Activity
    let cursorX = badgeX + 10;
    const line1BaseY = badgeY + 16;

    // Person ID
    ctx.fillStyle = person.color || '#06b6d4';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText(idText, cursorX, line1BaseY);
    cursorX += ctx.measureText(idText).width + 6;

    // Dot
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('•', cursorX, line1BaseY);
    cursorX += 10;

    // Activity Name
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText(activityText, cursorX, line1BaseY);
    cursorX += ctx.measureText(activityText).width + 6;

    // Dot
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('•', cursorX, line1BaseY);
    cursorX += 10;

    // Movement Status
    ctx.fillStyle = movementBadgeColor;
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillText(movementText, cursorX, line1BaseY);
    cursorX += ctx.measureText(movementText).width + 6;

    // Timer Duration
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText(durationText, cursorX, line1BaseY);

    // Render Row 2: Facial Expression (if enabled)
    if (showExpression) {
      const line2BaseY = badgeY + 33;
      let line2Cursor = badgeX + 10;

      // Color indicator dot
      ctx.fillStyle = exprColor;
      ctx.beginPath();
      ctx.arc(line2Cursor + 3, line2BaseY - 3.5, 3.5, 0, Math.PI * 2);
      ctx.fill();
      line2Cursor += 12;

      // Expression Text
      ctx.fillStyle = exprColor;
      ctx.font = '600 10px system-ui, sans-serif';
      ctx.fillText(exprText, line2Cursor, line2BaseY);
    }

    ctx.restore();
  };

  // Handle clicking on canvas to select a person
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasOverlayRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    let clickedPersonId: string | null = null;
    for (const p of people) {
      if (
        clickX >= p.bbox.x &&
        clickX <= p.bbox.x + p.bbox.width &&
        clickY >= p.bbox.y - 40 &&
        clickY <= p.bbox.y + p.bbox.height
      ) {
        clickedPersonId = p.id;
        break;
      }
    }
    setSelectedPersonId(clickedPersonId);
  };

  const activePerson = selectedPerson || people[0] || null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center select-none"
    >
      {/* Underlying Video Element for Webcam or Upload */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`absolute inset-0 w-full h-full object-contain ${
          videoSource === 'demo' ? 'hidden' : 'block'
        }`}
      />

      {/* Main Overlay & Pose Rendering Canvas */}
      <canvas
        ref={canvasOverlayRef}
        width={960}
        height={540}
        onClick={handleCanvasClick}
        className="w-full h-full object-contain cursor-crosshair relative z-10"
      />

      {/* Top Left: Live Status Indicator Watermark */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-900/40">
          {videoSource === 'webcam' && isCameraActive
            ? 'LIVE CAMERA'
            : videoSource === 'upload'
            ? 'VIDEO FILE'
            : 'DEMO SIMULATION'}
        </span>
        <span className="text-xs font-mono text-slate-300 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800">
          PERSONS: <strong className="text-cyan-400">{people.length}</strong>
        </span>
      </div>

      {/* Top Right: Futuristic Floating AI HUD Overlays */}
      <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-1.5 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800/90 shadow-xl">
        {/* Toggle Body Box */}
        <button
          onClick={() => updateSettings({ showBoundingBoxes: !settings.showBoundingBoxes })}
          title="Toggle Body Bounding Box"
          className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            settings.showBoundingBoxes
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Square className="w-3.5 h-3.5" />
          <span>BOX {settings.showBoundingBoxes ? 'ON' : 'OFF'}</span>
        </button>

        {/* Toggle Face Box */}
        <button
          onClick={() => updateSettings({ showFaceBox: !settings.showFaceBox })}
          title="Toggle Face Bounding Box"
          className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            settings.showFaceBox
              ? 'bg-purple-950/80 text-purple-300 border border-purple-800/80 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <ScanFace className="w-3.5 h-3.5" />
          <span>FACE {settings.showFaceBox ? 'ON' : 'OFF'}</span>
        </button>

        {/* Toggle Expression */}
        <button
          onClick={() => updateSettings({ showExpressionLabel: !settings.showExpressionLabel })}
          title="Toggle Live Expression Overlay"
          className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            settings.showExpressionLabel
              ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Smile className="w-3.5 h-3.5" />
          <span>EXPRESSION {settings.showExpressionLabel ? 'ON' : 'OFF'}</span>
        </button>

        {/* Toggle Pose Skeleton */}
        <button
          onClick={() => updateSettings({ showPose: !settings.showPose })}
          title="Toggle Skeleton Connections"
          className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            settings.showPose
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>SKELETON {settings.showPose ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Bottom Left: Sleek Floating AI Active Subject HUD Card */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-auto max-w-sm sm:max-w-md w-auto">
        {activePerson ? (
          <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-2xl p-3 sm:p-3.5 shadow-2xl flex flex-col gap-2 transition-all">
            {/* Subject Identity & Movement */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: activePerson.color || '#06b6d4' }}
                />
                <span className="font-mono font-bold text-sm text-slate-100">
                  {activePerson.id}
                </span>
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                    activePerson.movement === 'MOVING'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                      : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                  }`}
                >
                  {activePerson.movement}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {String(Math.floor(activePerson.activityDurationSeconds / 60)).padStart(2, '0')}:
                {String(activePerson.activityDurationSeconds % 60).padStart(2, '0')}
              </span>
            </div>

            {/* Action & Facial Expression Badges */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/70">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold font-mono tracking-wide text-cyan-300">
                  {activePerson.activity.toUpperCase()}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ({Math.round(activePerson.confidence * 100)}%)
                </span>
              </div>

              {activePerson.face?.detected && activePerson.face.expression.label !== 'Not Analyzed' ? (
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        EXPRESSION_COLORS[activePerson.face.expression.label] || '#a855f7',
                    }}
                  />
                  <span className="text-purple-300 font-semibold">
                    {activePerson.face.expression.label}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {Math.round(activePerson.face.expression.confidence * 100)}%
                  </span>
                </div>
              ) : (
                <span className="text-[10px] font-mono text-slate-500">
                  {activePerson.face?.expression.status || 'FACE SCANNING'}
                </span>
              )}
            </div>

            {/* Multi-Person Focus Switcher */}
            {people.length > 1 && (
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/70">
                <span className="text-[10px] font-mono text-slate-500">TRACKS:</span>
                <div className="flex items-center gap-1 overflow-x-auto">
                  {people.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPersonId(p.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                        p.id === activePerson.id
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                          : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {p.id}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-400 flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>AI SCANNING FIELD OF VIEW (COCO-17 + FACE)</span>
          </div>
        )}
      </div>

      {/* Direct One-Click Camera Prompt when camera not streaming in webcam mode */}
      {videoSource === 'webcam' && !isCameraActive && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-500/20">
            {cameraStatus === 'requesting' ? (
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            ) : (
              <Camera className="w-8 h-8 text-cyan-400" />
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-1">
            {cameraStatus === 'requesting' ? 'Requesting Camera...' : 'Camera Ready To Start'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
            {cameraError ||
              'Click below to activate your webcam. Once enabled, the system will automatically track your COCO pose and classify your actions in real time.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => startCamera()}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide uppercase flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Turn On Camera</span>
            </button>
            <button
              onClick={() => setVideoSource('demo')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Try Live Simulation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
