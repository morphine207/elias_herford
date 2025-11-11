# Kreis Paderborn Learning App Prototype

A modernized digital learning platform built with **React (frontend)** and **FastAPI (backend)**.  
This app transforms traditional slide-based employee learning into an adaptive, interactive experience —  
tailored to each user’s learning style (visual, auditory, or textual).

---

## 🌟 Features Overview

- **Adaptive Learning Prompt:**  
  Collects user learning preferences and job details to personalize course content delivery.

- **Interactive Course Player:**  
  Displays slides with text, audio, or visuals depending on preference.  
  Includes quiz questions and a completion tracker.

- **AI Assistant:**  
  A lightweight **3D model** (via Three.js or Ready Player Me) integrated with the **OpenAI API**  
  for real-time guidance and contextual responses.

- **Technical News Feed:**  
  Displays relevant updates related to each slide's content (powered by backend or static data).

- **Feedback System:**  
  Quick per-slide feedback button and a detailed final feedback modal.

---

## 🧱 Architecture Overview

React (Vite) + Tailwind + Three.js
↓
FastAPI (Python)
↓
OpenAI API

yaml
Copy code

- **Frontend (React):** Handles UI/UX, course flow, AI assistant rendering, and API communication.
- **Backend (FastAPI):** Provides endpoints for course content, news updates, quiz evaluation, and OpenAI integration.
- **Data:** Stored as JSON files (no SQL/Redis for simplicity).

---

## 🗂️ Project Structure

learning-app/
├── backend/
│ ├── main.py
│ ├── course_data.json
│ ├── requirements.txt
│ ├── .env
│ └── README.md
│
└── frontend/
├── src/
│ ├── components/
│ │ ├── PreferencePrompt.jsx
│ │ ├── CoursePlayer.jsx
│ │ ├── AIAssistant.jsx
│ │ ├── FeedbackModal.jsx
│ │ └── NewsBox.jsx
│ ├── App.jsx
│ └── main.jsx
├── package.json
├── vite.config.js
└── README.md

yaml
Copy code

---

## ⚙️ Backend Setup (FastAPI)

### 1️⃣ Prerequisites
- Python 3.10+
- `pip` (Python package manager)

### 2️⃣ Installation Steps

```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
3️⃣ Create .env File
Inside the backend folder:

bash
Copy code
touch .env
Add your OpenAI key:

ini
Copy code
OPENAI_API_KEY=your_openai_api_key_here
4️⃣ Run the Server
bash
Copy code
uvicorn main:app --reload
The backend will run at:
👉 http://127.0.0.1:8000

5️⃣ Example requirements.txt
nginx
Copy code
fastapi
uvicorn
python-dotenv
openai
💡 Example Backend Code (main.py)
python
Copy code
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os, json, openai

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/course")
def get_course():
    with open("course_data.json", "r") as f:
        return json.load(f)

@app.post("/feedback")
async def receive_feedback(request: Request):
    data = await request.json()
    return {"status": "success", "data": data}

@app.post("/ai-assistant")
async def ai_assistant(request: Request):
    body = await request.json()
    prompt = body.get("prompt", "")
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": "You are a learning assistant."},
                  {"role": "user", "content": prompt}]
    )
    return {"response": response.choices[0].message.content}
🖥️ Frontend Setup (React + Vite)
1️⃣ Prerequisites
Node.js (v18 or newer)

npm or yarn

2️⃣ Installation Steps
bash
Copy code
cd frontend
npm install
3️⃣ Environment Variables
If needed, create a .env file:

ini
Copy code
VITE_API_URL=http://127.0.0.1:8000
4️⃣ Run the Frontend
bash
Copy code
npm run dev
Then open:
👉 http://localhost:5173

🧩 Frontend Components
1️⃣ PreferencePrompt.jsx
Collects user learning preferences:

Learning type (Visual / Audio / Text)

Job title

Topics of interest

2️⃣ CoursePlayer.jsx
Displays slides dynamically:

Renders content based on preference

Shows AI assistant on right panel

Includes feedback & quiz buttons

3️⃣ AIAssistant.jsx
3D model (Three.js or Ready Player Me)

Animated virtual avatar

Integrates OpenAI chat responses

4️⃣ FeedbackModal.jsx
Pop-up per-slide feedback or final detailed feedback submission.

5️⃣ NewsBox.jsx
Fetches or displays related technical updates under each slide.

🧠 Example Data File (course_data.json)
json
Copy code
{
  "course_title": "Data Security Awareness",
  "slides": [
    {
      "id": 1,
      "title": "Understanding Data Privacy",
      "content": "Data privacy refers to handling, processing, and storing of data...",
      "news": "Latest: EU introduces new GDPR compliance measures (2025)."
    },
    {
      "id": 2,
      "title": "Password Best Practices",
      "content": "Use unique, strong passwords with 12+ characters...",
      "news": "Cybersecurity experts warn about new phishing attacks."
    }
  ],
  "quiz": [
    {
      "question": "What does GDPR stand for?",
      "options": ["General Data Protection Regulation", "Global Data Privacy Rules"],
      "answer": "General Data Protection Regulation"
    }
  ]
}
🧠 Suggested Improvements (Future Versions)
Add user login & tracking

Integrate Azure OpenAI API for scalability

Add progress analytics dashboard

Allow PDF exports of completed courses

Store feedback in cloud database (e.g., Cosmos DB)

🚀 Run the Whole App
1️⃣ Start backend:

bash
Copy code
cd backend
uvicorn main:app --reload
2️⃣ Start frontend:

bash
Copy code
cd frontend
npm run dev
Then open:
👉 http://localhost:5173

🧑‍💻 Tech Stack
Layer	Technology	Purpose
Frontend	React + Vite	UI rendering
Styling	Tailwind CSS	Fast, modern styling
3D Model	Three.js / Ready Player Me	AI avatar
Backend	FastAPI	API endpoints
AI	OpenAI API	Chat-based assistant
Config	dotenv	Secure API key storage

## 🧱 Architecture Overview

