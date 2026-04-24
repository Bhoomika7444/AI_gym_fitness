"""
AI Gym Trainer — Render Ready Version
"""

import cv2
import mediapipe as mp
import numpy as np
import time
import os
from flask import Flask, Response, jsonify
from flask_cors import CORS
import threading

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# ── Angle utility ─────────────────────────────────

def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(np.degrees(radians))
    return angle if angle <= 180 else 360 - angle

def get_landmark(landmarks, lm):
    p = landmarks[lm.value]
    return [p.x, p.y]

# ── Counters ─────────────────────────────────────

class ExerciseCounter:
    def __init__(self):
        self.count = 0
        self.stage = None
        self.feedback = "Get ready!"

    def reset(self):
        self.count = 0
        self.stage = None
        self.feedback = "Get ready!"

class SquatCounter(ExerciseCounter):
    def process(self, landmarks):
        try:
            hip = get_landmark(landmarks, mp_pose.PoseLandmark.LEFT_HIP)
            knee = get_landmark(landmarks, mp_pose.PoseLandmark.LEFT_KNEE)
            ankle = get_landmark(landmarks, mp_pose.PoseLandmark.LEFT_ANKLE)

            angle = calculate_angle(hip, knee, ankle)

            if angle > 160:
                self.stage = "up"
                self.feedback = "Go down"
            elif angle < 90 and self.stage == "up":
                self.stage = "down"
                self.count += 1
                self.feedback = f"Rep {self.count}"
        except:
            self.feedback = "Stay in frame"

# ── Analyzer ─────────────────────────────────────

class PoseAnalyzer:
    def __init__(self):
        self.pose = mp_pose.Pose()
        self.counter = SquatCounter()
        self.frame_data = {}

    def process_frame(self, frame):
        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(img_rgb)

        if results.pose_landmarks:
            mp_drawing.draw_landmarks(
                frame,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style(),
            )

            self.counter.process(results.pose_landmarks.landmark)

        self.frame_data = {
            "count": self.counter.count,
            "stage": self.counter.stage,
            "feedback": self.counter.feedback,
        }

        return frame

# ── Flask App ────────────────────────────────────

app = Flask(__name__)
CORS(app)

analyzer = PoseAnalyzer()

cap = None
lock = threading.Lock()

def get_camera():
    global cap
    with lock:
        if cap is None:
            cap = cv2.VideoCapture(0)
    return cap

def generate_frames():
    camera = get_camera()

    while True:
        success, frame = camera.read()

        if not success:
            # IMPORTANT: prevent crash on Render
            blank = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(blank, "No Camera Available",
                        (100, 240),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1, (0, 0, 255), 2)
            frame = blank

        frame = analyzer.process_frame(frame)

        _, buffer = cv2.imencode(".jpg", frame)
        frame_bytes = buffer.tobytes()

        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n")

# ── Routes ───────────────────────────────────────

@app.route("/")
def home():
    return "AI Gym Backend Running 🚀"

@app.route("/video_feed")
def video_feed():
    return Response(generate_frames(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/stats")
def stats():
    return jsonify(analyzer.frame_data)

@app.route("/reset")
def reset():
    analyzer.counter.reset()
    return jsonify({"message": "reset done"})

# ── MAIN FIX HERE ────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    print(f"Running on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)