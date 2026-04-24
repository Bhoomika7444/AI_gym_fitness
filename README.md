# 🏋️ AI Gym & Fitness Assistant

A full-stack AI-powered fitness management system with real-time pose detection, diet planning, and intelligent chatbot.

## 📁 Project Structure

```
ai-gym-fitness/
├── frontend/          # React.js dashboard
├── backend/           # Python FastAPI server
├── ai_modules/        # MediaPipe pose detection scripts
└── README.md
```

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Add your MongoDB URI and OpenAI key to .env
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 3. Pose Detection (run separately)
```bash
cd ai_modules
pip install -r requirements.txt
python pose_detector.py
```

## 🔑 Environment Variables

### Backend `.env`
```
MONGODB_URI=mongodb://localhost:27017/gymapp
JWT_SECRET=your_super_secret_key
OPENAI_API_KEY=your_openai_key   # optional
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:8000
```

## 🧠 Core Features
- **AI Gym Trainer** — MediaPipe pose detection, rep counting, form feedback
- **Diet Planner** — BMI-based personalized meal plans
- **Fitness Dashboard** — Charts, workout logs, progress tracking
- **AI Chatbot** — Fitness tips and guidance
- **Auth** — JWT-based register/login

## 🛠️ Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React.js, Recharts, Axios |
| Backend | Python FastAPI |
| AI/ML | MediaPipe, OpenCV |
| Database | MongoDB (Motor async) |
| Auth | JWT |
| Chatbot | OpenAI API / rule-based fallback |
