# FinSync

Phase 1 provides a deterministic Financial Digital Profile with a Next.js frontend and FastAPI backend. It does not use a database, authentication, AI, or ML.

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
