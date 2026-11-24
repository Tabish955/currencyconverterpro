const UPSTREAM_CURRENCIES_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

export function parseCurrencyCode(value: string | null): string | null {
  if (!value || !/^[a-z0-9]{2,10}$/i.test(value)) return null;
  return value.toLowerCase();
}

export function buildUpstreamUrl(from: string): string {
  return `${UPSTREAM_CURRENCIES_URL}/${encodeURIComponent(from)}.json`;
}

export function readPairRate(
  payload: unknown,
  from: string,
  to: string,
): number | null {
  if (typeof payload !== "object" || payload === null) return null;
  const rates = (payload as Record<string, unknown>)[from];
  if (typeof rates !== "object" || rates === null) return null;
  const rate = (rates as Record<string, unknown>)[to];
  return typeof rate === "number" && Number.isFinite(rate) && rate > 0
    ? rate
    : null;
}

export function readRateDate(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const date = (payload as Record<string, unknown>).date;
  return typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? date
    : null;
}