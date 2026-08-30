# Financial Persona Clustering

This directory contains FinSync's first optional ML component. The authoritative deterministic engine still calculates every financial ratio, score, constraint, and strategy. The KMeans pipeline classifies comparative patterns only.

The prototype dataset is entirely synthetic and unsuitable for real-world accuracy, fairness, or financial-advice claims. Diagnostic archetype labels help evaluate generation quality but are never supplied to KMeans.

## Reproduce

From the repository root after installing `backend/requirements.txt`:

```bash
python3 -m ml.training.generate_data --rows 5000
python3 -m ml.training.train_model
python3 -m ml.evaluation.evaluate_model
```

Generated CSV files are ignored. The small joblib pipeline and JSON metadata in `ml/artifacts/` are the deployable prototype artifacts.

Cluster selection ranks candidates from 3 through 7 on silhouette (higher is better), Davies–Bouldin (lower), and Calinski–Harabasz (higher). The lowest summed rank wins; ties use silhouette and then the smaller cluster count.
