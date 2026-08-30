# FinSync

FinSync provides a deterministic Financial Digital Profile with an optional synthetic-prototype Financial Persona clustering model. Deterministic formulas and safeguards remain authoritative. The application does not use a database, authentication, LLM, or agentic workflow.

## Backend

From the repository root:

```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
python3 -m pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API is available at `http://127.0.0.1:8000`. Existing routes remain at `GET /` and `GET /health`; profile analysis is at `POST /api/v1/profile/analyze`.

## ML prototype

From the repository root with the backend environment active:

```bash
python3 -m ml.training.generate_data --rows 5000
python3 -m ml.training.train_model
python3 -m ml.evaluation.evaluate_model
```

The generated dataset is synthetic, ignored by Git, and unsuitable for real-world accuracy claims. Training writes the reproducible pipeline and metadata to `ml/artifacts/`. If those artifacts are missing, financial analysis continues with `ml_persona.available` set to `false`.

## Market-regime prototype

Download and cache approximately ten years of NIFTY 50 history, train, and evaluate from the repository root:

```bash
cd backend
.venv/bin/python -m app.market.download
cd ..
backend/.venv/bin/python -m ml.market_regime.training.train_model
backend/.venv/bin/python -m ml.market_regime.evaluation.evaluate_model
```

Run deterministic demo inference:

```bash
cd backend
.venv/bin/python -m app.ml.market_regime.demo
```

With the backend running, call demo or live/cached inference:

```bash
curl 'http://127.0.0.1:8000/api/v1/market/regime?mode=demo'
curl 'http://127.0.0.1:8000/api/v1/market/regime?mode=live'
```

Live-provider failure falls back transparently to a labeled cache or bundled demo snapshot. Market context is historical pattern classification, not a forecast or trade signal, and never changes deterministic profile results.

## Frontend

In a second terminal:

```bash
cd frontend
npm ci
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`. Set `NEXT_PUBLIC_API_URL` to the public backend origin when it differs from the local default. This is a public URL, not a secret.

## Tests and production checks

```bash
cd backend
python3 -m pytest

cd ../frontend
npm run lint
npm run build
```
