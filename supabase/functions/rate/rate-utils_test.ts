import {
  buildUpstreamUrl,
  parseCurrencyCode,
  readPairRate,
  readRateDate,
} from "./rate-utils.ts";

Deno.test("USD to PKR uses the same direct daily-file URL as the converter", () => {
  const from = parseCurrencyCode("USD");
  if (from !== "usd") throw new Error("USD should normalize to usd");
  const url = buildUpstreamUrl(from);
  if (
    url !==
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json"
  ) {
    throw new Error(`Unexpected upstream URL: ${url}`);
  }
});

Deno.test("USD to PKR is read directly from the USD file without cross-rate arithmetic", () => {
  const sample = { date: "2026-11-23", usd: { pkr: 276.38228878 } };
  const rate = readPairRate(sample, "usd", "pkr");
  if (rate !== 276.38228878) {
    throw new Error(`Expected direct USD/PKR rate, received ${rate}`);
  }
  if (readRateDate(sample) !== "2026-11-23") {
    throw new Error("Expected to preserve the upstream data date");
  }
});

Deno.test("currency query values reject URL-injection characters", () => {
  if (parseCurrencyCode("USD") !== "usd") {
    throw new Error("A valid currency code should be accepted");
  }
  if (parseCurrencyCode("usd/../../secret") !== null) {
    throw new Error("Path characters must be rejected");
  }
});