# ledgr
YT VIDEO LINK - https://www.youtube.com/watch?v=0s59OQgdSnQ
DEPLOYMENT LINK - https://ledgr-finance.vercel.app

---

## 1. Project Scope & Philosophy
ledgr is an educational adaptive wealth planning platform. It calculates a deterministic Financial Digital Profile, simulates future goal attainment, and provides contextual market insights. 

**Core Principles:**
1. **Math First:** Deterministic formulas (the "Financial Engine") are the absolute source of truth.
2. **AI as Context:** Machine Learning (Personas) and LLMs (Gemini Chatbots) exist ONLY to provide educational context. They never override deterministic calculations, invent math, or silently modify state.
3. **No Financial Advice:** This is an educational simulation. Outputs remain educational.
4. **Privacy First (No Authentication):** The application runs entirely in a disconnected "Guest Mode." There is no login, no signup, and no user database.

---

## 2. Architecture & Workflow

### Frontend (Next.js App Router)
- **Tech Stack:** React, TypeScript, Tailwind CSS, Next.js.
- **State Management:** Global state is managed via `ledgrSessionProvider.tsx`.
- **Data Persistence:** Financial state is saved **exclusively** to the browser's local `sessionStorage` under a `ledgr.session.guest` key. 
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



## 5. Features Guide

Ledgr (FinSync) comprises several interconnected modules designed to provide a comprehensive, transparent, and educational wealth planning experience. 

### 1. The Financial Digital Profile
At the core of the platform is the deterministic Digital Profile. Users input their income, fixed expenses, discretionary spending, assets, and liabilities. The Financial Engine calculates:
- **Investable Capacity:** Exactly how much surplus cash flow is available each month.
- **Financial Health Score:** An explainable 0-100 score based on emergency savings, debt utilization, and savings rate.
- **Resilience Metrics:** Calculations of liquidity runway in case of sudden income loss.

### 2. Goal Simulator & Monte Carlo Engine
A strictly stateless simulation engine where users define financial goals (e.g., "Buy a Vehicle", "Retirement").
- **Priority-Based Allocation:** The engine routes the monthly investable capacity to goals sequentially based on user-defined priority levels (High, Medium, Low).
- **Monte Carlo Mode:** Projects market volatility to generate probability bands. It calculates P10 (Pessimistic), P50 (Expected), and P90 (Optimistic) attainment scenarios over the goal's timeline.

### 3. Market Intelligence (Regimes)
Rather than predicting the future, Ledgr categorizes the past and present. 
- Using historical NIFTY 50 data, the ML regime model classifies the current market as Bull, Bear, or Volatile. 
- This data is displayed strictly as *context* to help users understand why their portfolio might be behaving a certain way. It does not initiate trades or alter baseline profile calculations.

### 4. Adaptive Portfolio Tracker
Users can manually log their holdings across various asset classes (Cash, Fixed Deposits, Bonds, Mutual Funds, Stocks). 
- The system evaluates the user's current Asset Allocation against their calculated Risk Capacity and Time Horizon.
- It highlights concentration risks (e.g., being heavily over-indexed in equities for a short-term goal).

### 5. Conversational Investment Assistant
Powered by the Gemini API (proxied via the FastAPI backend), this chatbot acts as an educational companion.
- **Educational Mode:** Explains complex financial concepts (e.g., SIPs, diversification, inflation).
- **Situation Adaptation:** If a user states "I got a salary increase," the Assistant does not blindly recommend stocks. Instead, it asks critical follow-up questions (e.g., "Have your expenses also increased?", "Is your emergency fund fully funded?").

### 6. Finance Tutor AI
A structured, interactive curriculum designed to take users from zero knowledge to advanced understanding.
- **Curriculum Tiers:** Beginner (Foundations), Moderate (Investing & Planning), and Advanced (Metrics & Risk).
- **AI-Evaluated Assessments:** At the end of each module, the user takes a quiz. The Gemini API evaluates free-text or multiple-choice answers, providing personalized feedback and grading to unlock the next level.

### 7. Financial Persona ML
A clustering model (K-Means/GMM based) trained on synthetic financial data.
- It categorizes the user's profile into archetypes (e.g., "Conservative Saver", "Aggressive Builder").
- It provides generalized behavioral insights without overriding the deterministic mathematical boundaries set by the Financial Engine.

### 8. Agentic Approvals (Safety Layer)
Ledgr strictly enforces a "Human in the Loop" pattern.
- If the AI Chatbot suggests updating a user's profile (e.g., increasing monthly income after a raise), the AI cannot silently modify the state.
- The system generates an *Agentic Approval Card* in the UI, showing the exact proposed data changes. The user must explicitly click **Approve** or **Reject** before any state is mutated.
