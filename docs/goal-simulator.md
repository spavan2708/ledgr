# Goal Feasibility Engine

The goal simulator is a stateless deterministic/statistical educational tool. It does not persist goals, use ML predictions, recommend products, or guarantee outcomes. A caller can retain a previous response and submit edited inputs for before-versus-after what-if comparison.

## Formulas

For `today_value`, the future target is `target × (1 + annual inflation)^(months/12)`. A `future_value` target is not inflated again.

Current savings compound as `current savings × (1 + annual return/12)^months`. End-of-month level contributions use the ordinary-annuity formula `payment × ((1 + monthly return)^months - 1) / monthly return`; when return is zero, this becomes `payment × months`.

Step-up contributions increase after each completed twelve-month period and are projected month by month. Required contribution uses the rearranged annuity formula when step-up is zero. With step-up, an 80-iteration bounded binary search finds the initial monthly contribution whose month-by-month terminal value reaches the target.

Funding gap or surplus is `projected value - adjusted target`. Projected attainment is `projected value / adjusted target × 100`.

## Illustrative scenarios

- Conservative: 4% nominal return, 8% annual volatility, 6% inflation.
- Base: 8% nominal return, 15% annual volatility, 5% inflation.
- Optimistic: 12% nominal return, 22% annual volatility, 4% inflation.

These defaults are configurable hypothetical inputs—not forecasts, promised returns, market-regime outputs, or recommendations.

## Monte Carlo

When enabled, a seeded NumPy generator draws independent monthly arithmetic returns from a normal distribution with mean `annual return / 12` and volatility `annual volatility / sqrt(12)`. Returns are floored at -99%, then current balance and the applicable stepped-up month-end contribution are applied. The API returns P10, P50, P90 and the share of generated terminal values reaching the target.

“Percentage of generated scenarios reaching the target under these assumptions” is not a real-world probability. Normal, independent returns omit fat tails, serial dependence, taxes, fees, cash-flow interruptions and changing behavior.

## Capacity allocation

Required contributions are allocated without modifying planned contributions. Order is: `essential`, `high`, `medium`, `low`; then earlier horizon; then stable request order. The response reports assigned capacity, each monthly gap, remaining capacity and conflicts.

## Privacy and prohibited uses

The prototype frontend stores goal edits only in current component memory. Route navigation passes estimated capacity in the URL; no goals are written to a database, `localStorage`, training data, or silent analytics. State clears when the page/session ends.

Do not use results as regulated advice, a guarantee, a product recommendation, an eligibility decision, or evidence that a goal will be attained.
