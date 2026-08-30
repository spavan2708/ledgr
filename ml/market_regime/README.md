# NIFTY 50 Market Regime Clustering

This optional prototype answers: “What broad market environment do recent trailing indicators most closely resemble?” It does not forecast prices, produce signals, recommend securities, or alter FinSync's deterministic financial strategy.

Historical `^NSEI` data is retrieved through the isolated yfinance adapter and cached under `data/`, which is ignored by Git. The committed 520-row fixture is deterministic, NIFTY-like demo data—not historical NIFTY observations—and is always labeled `demo`.

## Commands

```bash
cd backend
.venv/bin/python -m app.market.download
cd ..
backend/.venv/bin/python -m ml.market_regime.training.train_model
backend/.venv/bin/python -m ml.market_regime.evaluation.evaluate_model
cd backend
.venv/bin/python -m app.ml.market_regime.demo
```

Candidate counts 3–6 are ranked on silhouette, Davies–Bouldin, Calinski–Harabasz, and average adjusted Rand stability across seeds 20260830–20260832. Lowest aggregate rank wins; ties use silhouette, stability, then smaller k.
