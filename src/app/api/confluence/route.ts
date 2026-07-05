import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

type Level = {
  type: "buy" | "sell";
  price: string;
  score: number;
  signals: string[];
};

// Mock confluence calculation
// TODO: Replace with actual Gann Square of 9 + SMC logic
function calculateConfluence(
  swingHigh: number,
  swingLow: number,
  timeframe: string
): Level[] {
  const range = swingHigh - swingLow;
  const levels: Level[] = [];

  // Mock levels based on swing range
  const points = [
    { offset: 0.618, type: "sell" as const, signals: ["FVG", "OB", "BOS"], score: 8 },
    { offset: 0.382, type: "buy" as const, signals: ["FVG", "CHoCH"], score: 7 },
    { offset: 0.786, type: "sell" as const, signals: ["OB", "BOS"], score: 6 },
    { offset: 0.236, type: "buy" as const, signals: ["FVG"], score: 5 },
  ];

  points.forEach((point) => {
    const price = swingLow + range * point.offset;
    levels.push({
      type: point.type,
      price: price.toFixed(2),
      score: point.score,
      signals: point.signals,
    });
  });

  // Sort by score descending
  return levels.sort((a, b) => b.score - a.score);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const swingHigh = searchParams.get("high");
  const swingLow = searchParams.get("low");
  const timeframe = searchParams.get("tf") || "15M";

  // Validate required params
  if (!swingHigh || !swingLow) {
    return NextResponse.json(
      { error: "Missing required parameters: high, low" },
      { status: 400 }
    );
  }

  const high = parseFloat(swingHigh);
  const low = parseFloat(swingLow);

  if (isNaN(high) || isNaN(low) || high <= low) {
    return NextResponse.json(
      { error: "Invalid swing high/low values" },
      { status: 400 }
    );
  }

  // Auth check (optional — remove if you want public API)
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

  // Calculate confluence levels
  const levels = calculateConfluence(high, low, timeframe);

  // Optional: Save scan to database
  if (user) {
    await supabase.from("scans").insert({
      user_id: user.id,
      swing_high: high,
      swing_low: low,
      timeframe,
      levels: levels,
      created_at: new Date().toISOString(),
    });
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        swing_high: high,
        swing_low: low,
        timeframe,
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
}
