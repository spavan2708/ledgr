export const formatRupees = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatPercent = (value: number | null): string =>
  value === null ? "Not available" : `${(value * 100).toFixed(1)}%`;
