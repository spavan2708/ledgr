# Model card: Financial Persona KMeans

## Purpose and intended use

Version 1.0.0 provides a comparative financial-pattern persona alongside FinSync's deterministic analysis. It may support educational explanations and product research. It does not calculate ratios or change deterministic safeguards or strategies.

## Dataset origin and features

Training uses 5,000 reproducibly generated synthetic profiles spanning limited liquidity, debt burden, balanced finances, long-horizon capacity, and stable income with weak savings. The 12 ordered features are savings, expenses, debt service, debt-to-assets, solvency, liquidity, emergency reserves, income stability, dependents, horizon, volatility comfort, and investment experience, each represented on the existing normalized 0–1 API scale. Synthetic archetype labels are diagnostic only and excluded from training.

## Training method and evaluation

The scikit-learn Pipeline applies median `SimpleImputer`, `StandardScaler`, and seeded KMeans. Candidate counts 3–7 are compared using silhouette, Davies–Bouldin, and Calinski–Harabasz metrics using the deterministic rank-aggregation rule documented in `ml/README.md`. Exact selected count and metrics are stored in `artifacts/financial_persona_metadata.json`.

The version 1.0.0 artifact selected **4 clusters**. Its selected-model metrics are silhouette `0.409950`, Davies–Bouldin `0.920739`, and Calinski–Harabasz `5001.299773`. The diagnostic adjusted Rand score against generator archetypes is `0.773632`; archetype labels were not training inputs and this diagnostic does not establish real-world validity.

## Interpretation

Persona names are assigned after fitting from centroid characteristics. A deterministic exhaustive match maximizes total centroid-to-name fit and gives every cluster one non-duplicated descriptive name. Similarity is a bounded transformation of distance to the assigned centroid relative to that cluster's training-distance radius; it is not probability or statistical confidence.

## Prohibited use

Do not use this model to select securities, guarantee outcomes, calculate financial ratios, determine eligibility, make regulated recommendations, override safeguards, or claim real-world accuracy.

## Limitations

Synthetic data cannot represent real populations, changing economies, cultural differences, measurement error, or historical outcomes. KMeans assumes distance-based group structure. Personas simplify continuous financial circumstances and may be unstable outside the prototype feature range.

## Ethical and privacy considerations

No submitted profiles are stored or used for training. No protected traits are model features. Absence of protected traits does not establish fairness. Future use requires consent, minimization, deletion controls, subgroup evaluation, and human review.

## Retraining strategy

There is no automatic retraining. A future version requires approved, consented data; generator or dataset versioning; quality, privacy, stability and bias evaluation; documented comparison against the deployed version; and explicit release approval.
