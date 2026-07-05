import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { fetchCandles } from "@/lib/market-data";
import { calculateConfluence } from "@/lib/confluence";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const timeframe = searchParams.get("tf") || "15M";

  // Auth check
  const supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch real candlestick data
    const candles = await fetchCandles(timeframe);

    if (candles.length < 20) {
      return NextResponse.json(
        { error: "Insufficient candle data" },
        { status: 502 }
      );
    }

    // Calculate real confluence levels
    const levels = calculateConfluence(candles, timeframe);

    // Find swing high/low from recent data
    const recent = candles.slice(-100);
    let swingHigh = -Infinity, swingLow = Infinity;
    for (const c of recent) {
      if (c.high > swingHigh) swingHigh = c.high;
      if (c.low < swingLow) swingLow = c.low;
    }

    // Determine trend
    const last20 = candles.slice(-20);
    const bullish = last20.filter((c) => c.close > c.open).length;
    const trend = bullish > 12 ? "Bullish" : bullish < 8 ? "Bearish" : "Ranging";

    // Save scan to database
    await supabase.from("scans").insert({
      user_id: user.id,
      swing_high: swingHigh,
      swing_low: swingLow,
      timeframe,
      levels: levels,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          swing_high: +swingHigh.toFixed(2),
          swing_low: +swingLow.toFixed(2),
          timeframe,
          trend,
          candle_count: candles.length,
          last_price: candles[candles.length - 1].close,
          levels,
          timestamp: new Date().toISOString(),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err: any) {
    console.error("Confluence API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
