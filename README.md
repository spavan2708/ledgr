# Ledgr

**Ledgr** is an educational, adaptive wealth-planning platform that combines deterministic financial calculations, machine learning, simulation, market intelligence, and AI-powered education in a single personal-finance experience.

> **Important:** Ledgr is an educational financial simulation platform. It does not provide financial, investment, tax, or legal advice.

### Links

- **Live Deployment:** https://ledgr-finance.vercel.app
- **Demo Video:** https://www.youtube.com/watch?v=0s59OQgdSnQ

---

# 1. How Ledgr Works

Ledgr follows a **Math-First, AI-Assisted** architecture.

The central design principle is simple:

> **Financial mathematics decides the numbers. AI explains, adapts, and teaches.**

The system does not allow an LLM to independently decide a user's financial health, target allocation, goal probability, or portfolio value.

Instead, deterministic financial engines calculate the results first. Machine Learning and AI operate as contextual and educational layers around those results.

## End-to-End Workflow

```text
                    ┌──────────────────────┐
                    │       USER           │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Financial Onboarding │
                    │ & Digital Profile    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Financial Engine    │
                    │ Ratios / Capacity /  │
                    │ Financial Resilience │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │ ML Risk/Persona │         │ Financial Goals │
        │     Context     │         │ & Goal Engine   │
        └────────┬────────┘         └────────┬────────┘
                 │                           │
                 └─────────────┬─────────────┘
                               ▼
                 ┌──────────────────────────┐
                 │ Personalized Target      │
                 │ Allocation Engine        │
                 │                          │
                 │ Cash / FD / Bonds /      │
                 │ Mutual Funds / Stocks /  │
                 │ Other Assets             │
                 └────────────┬─────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │ Adaptive Portfolio       │
                 │ Tracker                  │
                 │ Current vs Target        │
                 └────────────┬─────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │ Future & Goal Simulator  │
                 │ Compounding / Inflation │
                 │ Monte Carlo / P10-P90   │
                 └────────────┬─────────────┘
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │ AI Explain & │ │   Market     │ │ Finance      │
     │ Adapt        │ │ Intelligence │ │ Tutor AI     │
     └──────────────┘ └──────────────┘ └──────────────┘
```

## The Decision Flow

A user's financial inputs are first converted into a structured **Financial Digital Profile**.

The deterministic financial layer evaluates factors such as:

- Income
- Essential and discretionary expenses
- Monthly surplus
- Debt obligations
- Emergency-fund adequacy
- Existing assets
- Investment horizon
- Liquidity requirements
- Financial goals
- Risk capacity
- Risk tolerance
- Income stability

These values are then used by Ledgr's financial engines to calculate financial health, goal feasibility, personalized asset allocation, portfolio positioning, and future simulations.

AI operates **after or around these calculations**, not instead of them.

---

# 2. Core Philosophy

Ledgr is built around four principles.

## 2.1 Math First

Deterministic formulas and rule-based financial engines are the source of truth.

Important financial outputs are not generated directly by an LLM.

This includes:

- Financial ratios
- Investable capacity
- Portfolio valuation
- Target asset allocation
- Goal projections
- Inflation-adjusted targets
- Future-value calculations
- Monte Carlo simulations

## 2.2 AI as Context

Machine Learning and LLM components are used for:

- Explanation
- Education
- Follow-up questions
- Behavioral context
- Market interpretation
- Adaptive interaction

They do **not** silently override deterministic calculations.

## 2.3 Human in the Loop

When AI identifies a possible financial-profile change, it does not directly modify user state.

The user is shown the proposed change and retains control over whether it should be applied.

## 2.4 Privacy-First Guest Mode

Ledgr currently operates without authentication.

There is:

- No login
- No signup
- No user-account database
- No mandatory cloud financial-profile storage

The financial session is maintained locally for the guest experience.

---

# 3. Features

## 3.1 Financial Digital Profile

The Financial Digital Profile is the foundation of Ledgr.

Users provide information such as:

- Age
- Monthly income
- Essential expenses
- Discretionary expenses
- Debt payments
- Emergency savings
- Income stability
- Investment experience
- Loss reaction
- Investment horizon
- Liquidity requirements
- Financial goals
- Existing assets

The Financial Engine converts this information into structured financial metrics.

### Key Outputs

**Investable Capacity**

Determines how much monthly cash flow is realistically available after expenses and obligations.

**Financial Health**

Evaluates financial resilience using explainable metrics such as savings capacity, emergency reserves, and debt burden.

**Risk Capacity**

Estimates the user's financial ability to tolerate investment risk independently from their psychological willingness to take risk.

**Resilience**

Measures how prepared the user's finances are for unexpected changes or income disruptions.

---

## 3.2 Personalized Deterministic Asset Allocation

Ledgr does not give every Conservative, Balanced, or Aggressive user the same portfolio.

Instead, the target allocation is personalized using multiple financial factors.

These include:

- Risk capacity
- Risk tolerance
- Age
- Investment horizon
- Emergency-fund adequacy
- Existing portfolio
- Financial goals
- Liquidity requirements
- Income stability
- Debt burden
- Monthly surplus

The engine allocates across:

- **Cash / Bank**
- **Fixed Deposits**
- **Bonds / Debt**
- **Mutual Funds**
- **Stocks / Equity**
- **Other Assets**

The five major financial categories remain the primary focus, while Other Assets remains a secondary allocation category.

### Capacity vs Tolerance

Ledgr deliberately separates:

**Risk Tolerance**

> How much risk the user is psychologically comfortable taking.

from:

**Risk Capacity**

> How much risk the user's actual financial situation allows them to take.

For example, a young user may be comfortable with large investment losses, but inadequate emergency savings, high debt, or a near-term goal can still reduce the appropriate growth allocation.

This prevents risk preference from overriding financial reality.

---

## 3.3 Adaptive Portfolio Tracker

Users can manually record and manage their investments across supported asset classes.

Current portfolio categories include:

- Cash
- Fixed Deposits
- Bonds
- Mutual Funds
- Stocks
- Other Assets

The portfolio engine calculates current holdings and compares them against the user's personalized target allocation.

### Current vs Target

Ledgr highlights whether each asset category is:

- Underweight
- Near target
- Overweight

This makes portfolio concentration visible without automatically initiating trades.

### Asset-Specific Valuation

Different assets are treated according to their financial characteristics.

For example:

- Cash uses current balance.
- Fixed Deposits use deposit-specific information.
- Bonds distinguish purchase value, face value, quantity, coupon characteristics, and maturity.
- Stocks and Mutual Funds maintain investment/holding information.
- Other Assets can be tracked as manually valued assets.

---

## 3.4 Financial Goals

Users can create goals such as:

- Buying a vehicle
- Education
- Home purchase
- Travel
- Emergency reserves
- Retirement
- Other long-term objectives

Each goal can contain information such as:

- Target amount
- Current savings
- Target date
- Priority
- Planned monthly contribution
- Expected return
- Inflation assumptions

### Inflation-Adjusted Targets

A goal's future cost can be estimated using compound inflation rather than treating today's target amount as permanently fixed.

### Priority-Based Capacity Allocation

Monthly investable capacity can be distributed between goals according to their priorities.

This prevents the simulator from assuming that every goal can receive unlimited planned contributions simultaneously.

---

## 3.5 Goal Simulator & Monte Carlo Analysis

Ledgr includes deterministic and probabilistic goal simulation.

The deterministic engine models:

- Existing savings
- Monthly contributions
- Expected returns
- Contribution capacity
- Inflation
- Goal horizon
- Contribution step-ups

### Monte Carlo Simulation

Where enabled, Monte Carlo simulation models uncertainty in future returns.

Instead of displaying only one future value, Ledgr can present probability ranges such as:

- **P10 — Pessimistic**
- **P50 — Median / Expected**
- **P90 — Optimistic**

This helps users understand that long-term investment outcomes are distributions rather than guaranteed numbers.

Monte Carlo output remains a simulation — not a prediction or guarantee.

---

## 3.6 Future Simulator

The Future Simulator allows users to explore how their portfolio could evolve under different assumptions.

Users can experiment with:

- Simulation period
- Expected return
- Monthly contribution
- Annual contribution step-up

The simulator provides:

- Final projected portfolio value
- Total contributions
- Estimated investment growth
- Future wealth trajectory
- Goal outlook
- Projected allocation
- Return sensitivity
- What-if comparisons
- Monte Carlo probability ranges

### What-If Analysis

Users can change assumptions and immediately observe how different decisions affect long-term outcomes.

For example:

> What happens if I increase my monthly investment?

or:

> What happens if my expected return is lower?

This makes the simulator an educational planning environment rather than a single-number forecasting tool.

---

## 3.7 Financial Persona ML

Ledgr incorporates Machine Learning to provide additional behavioral context.

The ML layer can classify financial characteristics into understandable risk/persona categories.

The purpose of this model is contextualization — not autonomous portfolio construction.

### Important Separation

```text
Machine Learning
      ↓
Risk / Persona Context
      ↓
Deterministic Financial Engine
      ↓
Actual Financial Calculations
```

The ML layer does not replace deterministic financial safeguards.

---

## 3.8 Market Intelligence

Ledgr's Market Intelligence layer is designed to explain current market conditions without pretending to predict the future.

It can provide context around:

- Equity-market conditions
- Market regimes
- Major movements
- Volatility
- Relevant market events
- Asset-class conditions

Historical and current market information can be classified into understandable market regimes such as:

- Bull
- Bear
- Volatile

### Context, Not Trading Signals

Market Intelligence does not automatically alter:

- Target allocation
- Risk score
- Goal contribution
- Portfolio holdings
- Simulator assumptions

It exists to help users understand the environment around their financial plan.

---

## 3.9 AI Explain

AI Explain translates deterministic financial outputs into understandable language.

For example, instead of only displaying:

```text
Cash             10%
Fixed Deposits    8%
Bonds             12%
Mutual Funds      30%
Stocks            38%
Other Assets       2%
```

the AI layer can explain why the user's financial circumstances resulted in that allocation.

Possible explanations include:

- Why equity exposure is high or low
- How age influenced the recommendation
- Why emergency savings matter
- How liquidity needs affected Cash/FD
- Why a short goal horizon reduced growth exposure
- How debt affected risk capacity

The AI explains the calculation.

**It does not perform or replace the calculation.**

---

## 3.10 AI Adapt — Conversational Financial Assistant

AI Adapt allows users to communicate financial changes conversationally.

Example:

> "My salary increased to ₹1,50,000."

Rather than immediately changing the user's investment allocation, Ledgr can ask relevant follow-up questions:

> Have your monthly expenses changed?

> Has your debt payment changed?

> Would you like to increase your monthly investment contribution?

The resulting workflow is:

```text
User describes change
        ↓
AI identifies affected financial fields
        ↓
AI asks missing follow-up questions
        ↓
Structured changes are generated
        ↓
User reviews the proposed changes
        ↓
User Approves / Rejects
        ↓
Financial profile updates
        ↓
Deterministic engines recalculate
        ↓
AI explains the new result
```

This keeps the AI conversational while preserving deterministic financial control.

---

## 3.11 Agentic Approval Safety Layer

Ledgr follows a **Human-in-the-Loop** model for AI-generated profile changes.

The AI cannot silently modify financial information.

When AI Adapt identifies a change, the interface can present an **Agentic Approval Card** showing exactly what would change.

Example:

```text
Proposed Changes

Monthly Income
₹1,00,000 → ₹1,50,000

Monthly Investment
₹15,000 → ₹25,000

[ Reject ]        [ Approve ]
```

Only after explicit approval should the application's financial state be updated.

This provides:

- Transparency
- User control
- Explainability
- Protection against unintended AI state changes

---

## 3.12 Finance Tutor AI

Ledgr includes an educational Tutor Mode designed to progressively teach personal finance.

The curriculum moves from financial foundations toward more advanced concepts.

### Beginner — Foundations

Topics can include:

- Income and expenses
- Savings
- Assets and liabilities
- Net worth
- Emergency funds
- Debt
- Inflation
- Compound interest

### Intermediate — Investing & Planning

Topics can include:

- Stocks
- Bonds
- Fixed Deposits
- Mutual Funds
- Risk vs return
- Diversification
- Asset allocation
- Financial goals
- SIPs
- CAGR and XIRR

### Advanced — Risk & Simulation

Topics can include:

- Volatility
- Correlation
- Portfolio risk
- Real vs nominal returns
- Monte Carlo simulation
- Risk-adjusted concepts
- Portfolio construction

### Interactive Learning

The learning flow follows:

```text
Lesson
   ↓
Concept Explanation
   ↓
Real-World Example
   ↓
Interactive Question
   ↓
Quiz
   ↓
Feedback
   ↓
Progress
   ↓
Next Lesson / Phase
```

The structured curriculum determines progression, while AI can provide additional explanations, hints, examples, and feedback.

---

# 4. System Architecture

## Frontend

Ledgr uses the Next.js App Router.

### Technologies

- Next.js
- React
- TypeScript
- Tailwind CSS

### Responsibilities

The frontend handles:

- User onboarding
- Financial-profile interaction
- Portfolio management
- Goal management
- Simulation controls
- Data visualization
- AI interfaces
- Tutor experience
- Market Intelligence UI

### Session State

The application currently operates in Guest Mode.

Financial session information is maintained in browser session storage rather than requiring authentication.

---

## Financial & ML Layer

Ledgr contains dedicated financial logic for:

- Financial calculations
- Risk factors
- Personalized allocation
- Portfolio valuation
- Goal calculations
- ML feature extraction
- Simulation

The financial engine remains separate from the generative AI layer.

---

## AI Layer

Generative AI is used for interaction rather than authoritative financial calculation.

Typical AI responsibilities include:

- Explaining financial results
- Asking contextual follow-up questions
- Teaching concepts
- Giving quiz feedback
- Summarizing relevant context

The AI should consume structured financial outputs instead of independently recreating financial calculations.

---

# 5. Safety Architecture

Financial applications require clear boundaries between calculations, simulations, AI output, and user actions.

Ledgr uses several design rules to maintain those boundaries.

### Rule 1 — Deterministic calculations remain authoritative

LLMs do not replace the Financial Engine.

### Rule 2 — Simulations are not guarantees

Future-value and Monte Carlo outputs represent modeled scenarios.

### Rule 3 — AI changes require approval

AI-generated profile changes are shown to the user before being applied.

### Rule 4 — Market information is contextual

Market movements do not automatically trigger portfolio changes.

### Rule 5 — Educational positioning

Ledgr is designed to improve financial understanding and planning literacy rather than provide individualized regulated financial advice.

---

# 6. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| UI | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| ML | Python / scikit-learn |
| Generative AI | Gemini |
| Financial Engine | Deterministic TypeScript/Python logic |
| Simulation | Deterministic + Monte Carlo |
| Client Persistence | Browser Session Storage |
| Deployment | Vercel |

---

# 7. Local Development

## Clone the Repository

```bash
git clone https://github.com/spavan2708/ledgr.git
cd ledgr
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The development application is typically available at:

```text
http://localhost:3000
```

---

## Python ML Environment

From the repository root:

### Windows

```powershell
cd ml_pipeline

python -m venv venv

.\venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

### macOS / Linux

```bash
cd ml_pipeline

python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt
```

The Python virtual environment is intentionally excluded from Git and should be recreated locally.

---

# 8. Environment Variables

Create the required local environment files based on the services being used.

Example:

```env
GEMINI_API_KEY=your_key_here
```

Never commit real API keys to the repository.

Do not expose private server-side API credentials through public frontend environment variables.

---

# 9. Repository Structure

A simplified representation of the project:

```text
ledgr/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── portfolio/
│   │   │   ├── simulator/
│   │   │   └── api/
│   │   │
│   │   ├── components/
│   │   │
│   │   ├── lib/
│   │   │   ├── financial/
│   │   │   └── marketData.ts
│   │   │
│   │   └── types/
│   │
│   └── package.json
│
├── ml_pipeline/
│   ├── src/
│   ├── models/
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

The exact structure may evolve as the AI, Tutor, and Market Intelligence modules are integrated.

---

# 10. Development Philosophy

When extending Ledgr, contributors should follow one important rule:

> **Do not replace deterministic financial logic with generative AI.**

New features should consume the existing financial engines whenever possible.

Avoid:

- Recalculating financial values inside prompts
- Allowing AI to directly assign portfolio percentages
- Allowing market news to automatically rebalance portfolios
- Allowing AI to silently change financial-profile data
- Duplicating financial formulas across multiple modules

Prefer:

```text
Financial Inputs
       ↓
Deterministic Engine
       ↓
Structured Financial Result
       ↓
AI / UI / Visualization
```

This architecture keeps Ledgr explainable, testable, and predictable.

---

# 11. Educational Disclaimer

Ledgr is intended for **educational and demonstration purposes**.

Financial calculations, simulations, machine-learning classifications, market context, and AI-generated explanations should not be interpreted as personalized investment, tax, legal, or financial advice.

Future returns are uncertain, and simulated outcomes are not guarantees of actual financial performance.

---

# 12. Demo

### Live Application

https://ledgr-finance.vercel.app

### Video Walkthrough

https://www.youtube.com/watch?v=0s59OQgdSnQ

---

# Ledgr

**Math decides. AI explains. Users stay in control.**
