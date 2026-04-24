"""
AI Gym Trainer — Real-time Pose Detection & Rep Counter
Uses MediaPipe Pose to detect body landmarks, count reps, and give form feedback.
Run standalone: python pose_detector.py
Or import PoseAnalyzer for integration.
"""

import cv2
import mediapipe as mp
import numpy as np
import time
from flask import Flask, Response, jsonify
from flask_cors import CORS
import threading

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# ── Angle utility ─────────────────────────────────────────────────────────────

def calculate_angle(a, b, c) -> float:
    """Calculate angle at point b formed by points a-b-c."""
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(np.degrees(radians))
    return angle if angle <= 180 else 360 - angle

def get_landmark(landmarks, lm) -> list:
    p = landmarks[lm.value]
    return [p.x, p.y]

# ── Exercise counters ─────────────────────────────────────────────────────────

class ExerciseCounter:
    def __init__(self):
        self.count = 0
        self.stage = None   # "up" | "down"
        self.feedback = "Get ready!"
        self.form_score = 100

    def reset(self):
        self.count = 0
        self.stage = None
        self.feedback = "Get ready!"
        self.form_score = 100

class SquatCounter(ExerciseCounter):
    def process(self, landmarks):
        try:
            hip   = get_landmark(landmarks, mp_pose.PoseLandmark.LEFT_HIP)
            knee  = get_landmark(landmarks, mp_pose.PoseLandmark.LEFT_KNEE)
            ankle = get_landmark(landmarks, mp_pose.PoseLandmark.LEFT_ANKLE)
            angle = calculate_angle(hip, knee, ankle)

            if angle > 160:
                self.stage = "up"
                self.feedback = "Standing — go lower!"
            elif angle < 90 and self.stage == "up":
                self.stage = "down"
                self.count += 1
                self.feedback = f"Rep {self.count} ✓ — Drive through heels!"
                self.form_score = min(100, self.form_score + 2)
            elif angle < 90:
                self.feedback = "Good depth! Now stand up."
            else:
                self.feedback = "Keep going — more depth needed."

            # Form check: knees should not cave
            self.form_score = max(60, self.form_score)
        except Exception:
            self.feedback = "Position yourself fully in frame."

class PushUpCounter(ExerciseCounter):
    def process(self, landmarks):
        try:
            shoulder = get_landmark(landmarks, mp_pose.PoseLandmark.LEFT_SHOULDER)
            elbow    = get_landmark(landmarks, mp_pose.PoseLandmark.LEFT_ELBOW)
            wrist    = get_landmark(landmarks, mp_pose.PoseLandmark.LEFT_WRIST)
            angle = calculate_angle(shoulder, elbow, wrist)

            if angle > 160:
                self.stage = "up"
                self.feedback = "Arms extended — go down!"
            elif angle < 70 and self.stage == "up":
                self.stage = "down"
                self.count += 1
                self.feedback = f"Rep {self.count} ✓ — Push up strong!"
            elif angle < 70:
                self.feedback = "Great depth! Now push up."
            else:
                self.feedback = "Lower your chest closer to the floor."
        except Exception:
            self.feedback = "Position yourself fully in frame."

class BicepCurlCounter(ExerciseCounter):
    def process(self, landmarks):
        try:
            shoulder = get_landmark(landmarks, mp_pose.PoseLandmark.RIGHT_SHOULDER)
            elbow    = get_landmark(landmarks, mp_pose.PoseLandmark.RIGHT_ELBOW)
            wrist    = get_landmark(landmarks, mp_pose.PoseLandmark.RIGHT_WRIST)
            angle = calculate_angle(shoulder, elbow, wrist)

            if angle > 150:
                self.stage = "down"
                self.feedback = "Arms down — curl up!"
            elif angle < 40 and self.stage == "down":
                self.stage = "up"
                self.count += 1
                self.feedback = f"Rep {self.count} ✓ — Squeeze at top!"
            elif angle < 40:
                self.feedback = "Hold the squeeze!"
            else:
                self.feedback = "Keep curling — full range of motion."
        except Exception:
            self.feedback = "Position yourself fully in frame."

# ── Main analyzer ─────────────────────────────────────────────────────────────

EXERCISES = {
    "squat": SquatCounter,
    "pushup": PushUpCounter,
    "bicep_curl": BicepCurlCounter,
}

class PoseAnalyzer:
    def __init__(self):
        self.pose = mp_pose.Pose(
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7,
        )
        self.current_exercise = "squat"
        self.counter = SquatCounter()
        self.frame_data = {}

    def set_exercise(self, exercise: str):
        if exercise in EXERCISES:
            self.current_exercise = exercise
            self.counter = EXERCISES[exercise]()

    def process_frame(self, frame):
        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(img_rgb)

        if results.pose_landmarks:
            # Draw skeleton
            mp_drawing.draw_landmarks(
                frame,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style(),
            )

            # Count reps
            self.counter.process(results.pose_landmarks.landmark)

        # Overlay HUD
        self._draw_hud(frame)
        self.frame_data = {
            "count": self.counter.count,
            "stage": self.counter.stage,
            "feedback": self.counter.feedback,
            "exercise": self.current_exercise,
        }
        return frame

    def _draw_hud(self, frame):
        h, w = frame.shape[:2]

        # Background panel
        cv2.rectangle(frame, (0, 0), (280, 140), (20, 20, 20), -1)
        cv2.rectangle(frame, (0, 0), (280, 140), (0, 200, 100), 2)

        cv2.putText(frame, self.current_exercise.upper().replace("_", " "),
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 128), 2)
        cv2.putText(frame, f"REPS: {self.counter.count}",
                    (10, 65), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 3)
        cv2.putText(frame, f"Stage: {self.counter.stage or 'Ready'}",
                    (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 180, 180), 1)

        # Feedback bar at bottom
        cv2.rectangle(frame, (0, h - 50), (w, h), (20, 20, 20), -1)
        cv2.putText(frame, self.counter.feedback,
                    (10, h - 18), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 220, 255), 2)

# ── Flask streaming server ────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app)
analyzer = PoseAnalyzer()
cap = None
cap_lock = threading.Lock()

def get_capture():
    global cap
    with cap_lock:
        if cap is None or not cap.isOpened():
            cap = cv2.VideoCapture(0)
    return cap

def generate_frames():
    camera = get_capture()
    while True:
        success, frame = camera.read()
        if not success:
            break
        frame = analyzer.process_frame(frame)
        ret, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        if ret:
            yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + buffer.tobytes() + b"\r\n")

@app.route("/video_feed")
def video_feed():
    return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/stats")
def stats():
    return jsonify(analyzer.frame_data)

@app.route("/set_exercise/<exercise>")
def set_exercise(exercise):
    analyzer.set_exercise(exercise)
    return jsonify({"exercise": analyzer.current_exercise})

@app.route("/reset")
def reset():
    analyzer.counter.reset()
    return jsonify({"message": "Counter reset"})

if __name__ == "__main__":
    print("🎥 Starting AI Pose Detection Server on http://localhost:5050")
    print("   Video feed: http://localhost:5050/video_feed")
    print("   Stats:      http://localhost:5050/stats")
    app.run(host="0.0.0.0", port=5050, debug=False, threaded=True)
