# Model card: NIFTY 50 Market Regime KMeans

## Intended purpose

Version 1.0.0 classifies recent trailing NIFTY 50 indicators into the closest historical broad-market cluster. It supplies educational context alongside—but never inside—the deterministic Financial Profile analysis.

## Data source and freshness

Training used Yahoo Finance daily `^NSEI` adjusted close/close data via yfinance, retrieved with a timeout and cached locally. The trained feature history covers 2017-06-20 through 2026-08-27 with 2,266 usable observations after the 200-day warm-up. Provider availability, corrections, holidays, and delayed data can affect freshness. API output identifies live, cached, or demo mode and its latest market date.

The bundled fixture is deterministic synthetic NIFTY-like history for tests and offline demonstrations. It is explicitly labeled demo and is not presented as historical NIFTY data.

## Feature formulas

All features use values at or before observation date `t`:

- 5-, 21-, and 63-day return: `close[t] / close[t-n] - 1`.
- 21- and 63-day annualized volatility: population standard deviation of trailing daily returns multiplied by `sqrt(252)`.
- 50- and 200-day moving-average distance: `close[t] / trailing mean[t] - 1`.
- 63-day maximum drawdown: `close[t] / trailing 63-day maximum - 1`.
- 21-day momentum consistency: fraction of trailing daily returns greater than zero.

Rows are dropped only until all trailing windows exist. No future returns, negative shifts, centered windows, or future labels are used.

## Temporal split and training

The earliest 80%—1,812 observations through 2024-10-25—was used for selection and training. The 454 observations beginning 2024-10-28 were reserved for out-of-sample diagnostic inspection. The seeded scikit-learn Pipeline contains median `SimpleImputer`, `StandardScaler`, and KMeans.

The deterministic aggregate rule selected **3 regimes**:

| k | Silhouette | Davies–Bouldin | Calinski–Harabasz | Seed stability ARI |
|---:|---:|---:|---:|---:|
| 3 | 0.313761 | 1.078286 | 917.581154 | 1.000000 |
| 4 | 0.322152 | 1.041796 | 805.200251 | 0.978749 |
| 5 | 0.227962 | 1.218810 | 782.466530 | 0.998288 |
| 6 | 0.220050 | 1.307791 | 715.539267 | 0.962962 |

These are clustering diagnostics, not prediction accuracy. Out-of-sample silhouette was 0.224477; the holdout contained no observations assigned to one training cluster, illustrating regime and sample instability.

## Interpretation

Inverse-transformed centroids are matched exhaustively to unique descriptive names using medium-term return, volatility, drawdown, moving-average position, and positive-day consistency. Version 1.0.0 learned Stable Growth, Volatile Growth, and Defensive / High-Volatility Decline; it was not forced to produce four regimes.

Similarity is a bounded transform of standardized distance to the assigned centroid relative to its training radius. It is not probability or confidence.

## Prohibited use and limitations

Do not use this model for price predictions, return guarantees, security selection, buy/sell signals, eligibility, regulated advice, or automatic allocation changes. KMeans simplifies continuous and evolving markets; cluster identity depends on period, features, scaling, and provider data. Historical resemblance does not imply future behavior. A broad index does not describe every security or investor experience.

## Retraining approach

There is no automatic retraining. A future version should retrieve a reviewed data snapshot, preserve the temporal split, compare stability and holdout diagnostics, inspect centroid meaning and regime prevalence, version artifacts, and require explicit release approval.
