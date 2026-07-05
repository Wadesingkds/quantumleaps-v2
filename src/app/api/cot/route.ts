import { NextResponse } from "next/server";

const CFTC_BASE =
  "https://publicreporting.cftc.gov/resource/6dca-aqww.json";

const CONTRACTS: Record<string, { name: string; display: string; category: string }> = {
  GC: { name: "GOLD - COMMODITY EXCHANGE INC.", display: "Gold", category: "metals" },
  SI: { name: "1000 TROY OUNCE SILVER - CHICAGO BOARD OF TRADE", display: "Silver", category: "metals" },
  HG: { name: "COPPER- #1 - COMMODITY EXCHANGE INC.", display: "Copper", category: "metals" },
  CL: { name: "CRUDE OIL, LIGHT SWEET - NEW YORK MERCANTILE EXCHANGE", display: "Crude Oil", category: "energy" },
  NG: { name: "NATURAL GAS - NEW YORK MERCANTILE EXCHANGE", display: "Natural Gas", category: "energy" },
  ES: { name: "E-MINI S&P 500 - CHICAGO MERCANTILE EXCHANGE", display: "S&P 500", category: "index" },
  NQ: { name: "NASDAQ-100 Consolidated - CHICAGO MERCANTILE EXCHANGE", display: "Nasdaq 100", category: "index" },
};

// 6h cache (COT is weekly data)
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 6 * 60 * 60 * 1000;

function cacheGet<T>(key: string): T | null {
  const e = cache.get(key);
  if (!e || Date.now() - e.ts > CACHE_TTL) { cache.delete(key); return null; }
  return e.data as T;
}
function cacheSet(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
}

type CotRow = {
  market_and_exchange_names: string;
  report_date_as_yyyy_mm_dd: string;
  noncomm_positions_long_all: string;
  noncomm_positions_short_all: string;
  noncomm_positions_spread_all: string;
  comm_positions_long_all: string;
  comm_positions_short_all: string;
  open_interest_all: string;
};

async function fetchContract(marketName: string, weeks = 52): Promise<CotRow[]> {
  const key = `contract::${marketName}::${weeks}`;
  const cached = cacheGet<CotRow[]>(key);
  if (cached) return cached;

  const where = `market_and_exchange_names='${marketName.replace(/'/g, "''")}'`;
  const url = `${CFTC_BASE}?$where=${encodeURIComponent(where)}&$order=report_date_as_yyyy_mm_dd DESC&$limit=${weeks}`;
  const r = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) throw new Error(`CFTC API ${r.status}`);
  const data: CotRow[] = await r.json();
  cacheSet(key, data);
  return data;
}

function netSpec(d: CotRow) {
  return (
    Number(d.noncomm_positions_long_all) -
    Number(d.noncomm_positions_short_all)
  );
}
function mean(a: number[]) { return a.reduce((s, v) => s + v, 0) / a.length; }
function stdev(a: number[]) {
  const m = mean(a);
  return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weeks = Math.min(Math.max(Number(searchParams.get("weeks")) || 12, 4), 52);
    const lookback = Math.min(Math.max(Number(searchParams.get("lookback")) || 52, 12), 520);

    const symbols = Object.keys(CONTRACTS);

    // Fetch all contracts in parallel
    const allData = await Promise.all(
      symbols.map((sym) => fetchContract(CONTRACTS[sym].name, Math.max(weeks, lookback)))
    );

    const results = symbols.map((sym, i) => {
      const meta = CONTRACTS[sym];
      const data = allData[i];
      if (!data.length) return null;

      const nets = data.map(netSpec);
      const latest = nets[0];
      const mu = mean(nets);
      const sd = stdev(nets);
      const z = sd !== 0 ? (latest - mu) / sd : 0;

      // z-score classification
      let level: string, signal: string, color: string;
      if (z >= 1.5) { level = "EXTREME LONG"; signal = "extreme_long"; color = "#22c55e"; }
      else if (z >= 0.5) { level = "LONG"; signal = "long"; color = "#4ade80"; }
      else if (z <= -1.5) { level = "EXTREME SHORT"; signal = "extreme_short"; color = "#dc2626"; }
      else if (z <= -0.5) { level = "SHORT"; signal = "short"; color = "#f87171"; }
      else { level = "NEUTRAL"; signal = "neutral"; color = "#a3a3a3"; }

      // 1w change
      const prev = nets.length >= 2 ? nets[1] : latest;
      const weekChange = latest - prev;

      // 4w change
      const w4 = nets.length >= 5 ? nets[4] : nets[nets.length - 1];
      const monthChange = latest - w4;

      // weekly series for sparkline
      const series = data.slice(0, weeks).map((d) => ({
        date: d.report_date_as_yyyy_mm_dd,
        net: netSpec(d),
        long: Number(d.noncomm_positions_long_all),
        short: Number(d.noncomm_positions_short_all),
        oi: Number(d.open_interest_all),
      }));

      return {
        symbol: sym,
        display: meta.display,
        category: meta.category,
        asOf: data[0].report_date_as_yyyy_mm_dd,
        net: Math.round(latest),
        zScore: +z.toFixed(2),
        level,
        signal,
        color,
        weekChange: Math.round(weekChange),
        monthChange: Math.round(monthChange),
        mean: Math.round(mu),
        stdev: Math.round(sd),
        series: series.reverse(),
      };
    });

    // Group by category
    const categories: Record<string, NonNullable<(typeof results)[number]>[]> = {};
    results.filter(Boolean).forEach((r) => {
      if (!r) return;
      if (!categories[r.category]) categories[r.category] = [];
      categories[r.category].push(r);
    });

    return NextResponse.json({
      ok: true,
      weeks,
      lookback,
      asOf: results.find((r) => r)?.asOf,
      categories,
      contractCount: results.filter(Boolean).length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
