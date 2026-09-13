# AI Activity Monitoring Agent

A professional real-time human activity monitoring system powered by **17 COCO pose keypoints**, multi-person SORT-style tracking, deterministic kinematic action classification, and Google Gemini AI analytics.

---

## 1. Core Architecture

The system accepts live webcam streams, video uploads, or simulated kinematic scenario feeds to continuously estimate:

* **Anonymous Person Tracking**: Stable ephemeral IDs (`P01`, `P02`, `P03`...) with zero facial recognition.
* **COCO-17 Pose Estimation**: Standard 17 human joints (nose, eyes, ears, shoulders, elbows, wrists, hips, knees, ankles) with confidence scoring.
* **Multi-Frame Movement Engine**: Euclidean displacement normalized to body height over temporal windows (15–60 frames) to eliminate keypoint jitter.
* **Kinematic Activity Recognition**:
  * `Standing`: Upright torso (<30°), knees extended (>140°), stationary displacement.
  * `Sitting`: Knee angle flexion (~90°), vertical compression, hips aligned near knee plane.
  * `Walking`: Moderate displacement, alternating gait patterns across frames.
  * `Running`: High velocity displacement exceeding speed thresholds.
  * `Using Phone`: Wrist keypoint elevation near ear/head plane (<0.45 torso height) or detected phone object.
  * `Holding Object`: Wrist proximity to detected items (bottle, cup, bag, book, laptop).
  * `Interacting With Person`: Inter-person spatial proximity (<1.15 body height) and facing orientation.
  * `Unknown`: Low confidence or occluded joint keypoints.
* **Head-Anchored Dynamic Label**: Activity badges (`[ P01 • WALKING • MOVING ]`) follow the person's head coordinates in real time.
* **Real Activity Timers**: Continuous duration recording calculated from actual timestamps.
* **Dual Gemini AI Modules**:
  * `/brainstorm`: Creative system improvements, new CV metrics, zone alert policies.
  * `/analyst`: Strictly evidence-grounded audit of measured data (no hallucinations or fabricated stats).

---

## 2. COCO 17 Keypoint Topology

The system uses standard COCO keypoint ordering:
1. `nose` (0)
2. `left_eye` (1), `right_eye` (2)
3. `left_ear` (3), `right_ear` (4)
4. `left_shoulder` (5), `right_shoulder` (6)
5. `left_elbow` (7), `right_elbow` (8)
6. `left_wrist` (9), `right_wrist` (10)
7. `left_hip` (11), `right_hip` (12)
8. `left_knee` (13), `right_knee` (14)
9. `left_ankle` (15), `right_ankle` (16)

---

## 3. Technology Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Recharts, Lucide Icons.
* **Computer Vision**: MoveNet COCO-17 Pose Detector, COCO-SSD Object Detector, Kinematic Fallback Generator.
* **Backend**: Node.js, Express, WebSocket (`ws`), Vite Middleware.
* **AI Engine**: Google Gemini API (`gemini-3.8-flash`) via `@google/genai`.

---

## 4. Environment Variables

Create or configure `.env`:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

---

## 5. Development & Execution

Install dependencies:
```bash
npm install
```

Start the application (Full-stack Express + Vite):
```bash
npm run dev
```

The application runs on `http://0.0.0.0:3000`.

---

## 6. Privacy & Ethical Standards

* **Zero Facial Recognition**: No biometric scanning, facial verification, or facial geometry cataloging.
* **Anonymous IDs**: Every detected subject receives a transient identifier (`P01`, `P02`).
* **No Demographic Profiling**: No emotion, gender, or race inference.
* **Local Processing**: Video frames are processed in-memory.
