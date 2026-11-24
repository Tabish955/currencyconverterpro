import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  buildUpstreamUrl,
  parseCurrencyCode,
  readPairRate,
  readRateDate,
} from "./rate-utils.ts";

const allowedHeaders = {
  ...corsHeaders,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: allowedHeaders });
}

const handler = async (request: Request): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: allowedHeaders });
  }
  if (request.method !== "GET") {
    return jsonResponse({ error: "Only GET requests are supported." }, 405);
  }

  const params = new URL(request.url).searchParams;
  const from = parseCurrencyCode(params.get("from"));
  const to = parseCurrencyCode(params.get("to"));
  if (!from || !to) {
    return jsonResponse({ error: "Provide valid from and to currency codes." }, 400);
  }

  const upstreamUrl = buildUpstreamUrl(from);
  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
    });
    if (!upstreamResponse.ok) {
      return jsonResponse({
        error: `Upstream request failed with status ${upstreamResponse.status}.`,
        source: new URL(upstreamUrl).host,
        upstreamUrl,
      }, 502);
    }

    const payload: unknown = await upstreamResponse.json();
    const rate = readPairRate(payload, from, to);
    const date = readRateDate(payload);
    if (rate === null || date === null) {
      return jsonResponse({
        error: "The upstream response did not contain a valid date and currency pair.",
        source: new URL(upstreamUrl).host,
        upstreamUrl,
      }, 502);
    }

    const headerNames = [
      "date",
      "age",
      "cache-control",
      "etag",
      "cf-cache-status",
      "x-jsd-version",
      "x-jsd-version-type",
      "x-cache",
      "x-served-by",
    ];
    const upstreamCacheHeaders = Object.fromEntries(
      headerNames.flatMap((name) => {
        const value = upstreamResponse.headers.get(name);
        return value === null ? [] : [[name, value]];
      }),
    );

    return jsonResponse({
      date,
      rate,
      source: new URL(upstreamUrl).host,
      fetchedAt: new Date().toISOString(),
      upstreamUrl,
      upstreamRequestHeaders: { Accept: "application/json" },
      upstreamCacheHeaders,
    });
  } catch (error) {
    console.error("Rate diagnostic request failed:", error);
    return jsonResponse({
      error: "Unable to fetch the upstream currency rate.",
      source: new URL(upstreamUrl).host,
      upstreamUrl,
    }, 502);
  }
};

Deno.serve(handler);