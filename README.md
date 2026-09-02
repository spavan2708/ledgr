# FinSync

**AI SYSTEM PROMPT & PROJECT SCOPE**  
*If you are an AI assistant reading this file, use this document to understand the architectural constraints, workflow, and scope of FinSync.*

---

## 1. Project Scope & Philosophy
FinSync is an educational adaptive wealth planning platform. It calculates a deterministic Financial Digital Profile, simulates future goal attainment, and provides contextual market insights. 

**Core Tenets (AI MUST OBEY):**
1. **Math First:** Deterministic formulas (the "Financial Engine") are the absolute source of truth.
2. **AI as Context:** Machine Learning (Personas) and LLMs (Gemini Chatbots) exist ONLY to provide educational context. They must **never** override deterministic calculations, invent math, or silently modify state.
3. **No Financial Advice:** This is an educational simulation. Outputs must remain educational.
4. **Privacy First (No Authentication):** The application runs entirely in a disconnected "Guest Mode." There is no login, no signup, and no user database.

---

## 2. Architecture & Workflow

### Frontend (Next.js App Router)
- **Tech Stack:** React, TypeScript, Tailwind CSS, Next.js.
- **State Management:** Global state is managed via `FinSyncSessionProvider.tsx`.
- **Data Persistence:** Financial state is saved **exclusively** to the browser's local `sessionStorage` under a `finsync.session.guest` key. 
- **NO AUTHENTICATION:** Do NOT attempt to implement Supabase Auth, login forms, middleware route protection, or user databases. The user navigates from the Landing Page directly to `/dashboard` in Guest Mode.

### Backend (Python FastAPI)
- **Tech Stack:** Python 3.10+, FastAPI, Uvicorn, Pytest.
- **Stateless APIs:** The backend performs heavy calculations (Goal Simulation, Monte Carlo), runs ML model inferences (Market Regime, Persona Clustering), and securely proxies external LLM calls (Gemini API).
- **LLM Proxy:** The Gemini API key (`GEMINI_API_KEY`) is stored securely on the backend. The frontend MUST NOT communicate with Gemini directly.

---

## 3. Core Modules

### A. Financial Engine
Calculates transparent ratios (Debt-to-Income, Savings Rate), resilience, and investable capacity.

### B. Goal Simulator
A stateless API (`/api/v1/goals/simulate`) that handles multiple goals, prioritized capacity allocation, and optional seeded Monte Carlo simulations (calculating P10/P50/P90 attainment frequencies).

### C. ML & Market Context
- **Persona ML:** A synthetic clustering model that categorizes user financial behavior.
- **Market Regime:** Classifies historical NIFTY 50 data into regimes (e.g., Bull, Bear, Volatile). Provides context, not forecasts.

### D. AI Companions (Gemini)
- **Investment Chatbot:** A conversational educator proxying requests through `/api/v1/investment-chat`.
- **Tutor AI:** A structured, curriculum-based learning mode with deterministic progression arrays and AI-graded quizzes.

---

## 4. Local Setup & Running the App

### Backend
From the repository root:
```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate  # or .\backend\.venv\Scripts\Activate on Windows
python3 -m pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend
In a second terminal:
```bash
cd frontend
npm ci
# Ensure NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 is in .env.local
npm run dev
```
Open `http://localhost:3000`.

---

## 5. Development Rules for AI Agents
1. **Do not add login:** Any request to modify user sessions should rely on local `sessionStorage`. Do not add Supabase Auth.
2. **Keep the frontend dumb to LLMs:** If you build a new AI feature, build the endpoint in FastAPI, and fetch it from Next.js.
3. **Respect boundaries:** Do not mix the Goal Simulator's math with the LLM's prompt. They operate independently; the frontend orchestrates them.
