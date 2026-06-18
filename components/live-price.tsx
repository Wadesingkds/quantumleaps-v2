"use client";

import { useState } from "react";

// ponytail: native fetch, no library. Free API fallback chain.
const API_SOURCES = [
  {
    name: "Metal Price API",
    url: "https://api.metals.dev/v1/latest?api_key=demo&currency=USD&unit=toz",
    parse: (d: Record<string, unknown>) => {
      const metals = d.metals as Record<string, number>;
      return metals?.gold;
    },
  },
  {
    name: "Exchange Rate",
    url: "https://open.er-api.com/v6/latest/USD",
    parse: (d: Record<string, unknown>) => {
      const rates = d.rates as Record<string, number>;
      // XAU is ~1/31.1035 of gold price per oz, but this API doesn't have XAU
      // Return null to skip
      return null;
    },
  },
];

interface PriceData {
  price: number;
  source: string;
  time: string;
}

export function LivePrice() {
  const [data, setData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchPrice() {
    setLoading(true);
    setError("");

    for (const api of API_SOURCES) {
      try {
        const res = await fetch(api.url);
        if (!res.ok) continue;
        const json = await res.json();
        const price = api.parse(json);
        if (price && price > 0) {
          setData({
            price: Math.round(price * 100) / 100,
            source: api.name,
            time: new Date().toLocaleTimeString("id-ID"),
          });
          setLoading(false);
          return;
        }
      } catch {
        continue;
      }
    }

    setError("Gagal fetch harga. Coba lagi.");
    setLoading(false);
  }

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-xs text-muted-foreground">
          XAUUSD LIVE
        </p>
        <button
          onClick={fetchPrice}
          disabled={loading}
          className="font-mono text-xs text-gold hover:text-gold-light disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <p className="text-sm text-sell">{error}</p>}

      {data && (
        <div>
          <p className="text-3xl font-bold font-mono">
            ${data.price.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.source} · {data.time}
          </p>
        </div>
      )}

      {!data && !error && !loading && (
        <p className="text-sm text-muted-foreground">
          Tekan Refresh untuk harga terkini
        </p>
      )}
    </div>
  );
}
