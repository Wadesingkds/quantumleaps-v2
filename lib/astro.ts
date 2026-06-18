// ponytail: pure math, Gann 144-bar astro cycle

export interface AstroResult {
  cycleBars: number;
  duration: string;
  nextTurnDate: string;
  direction: "bullish" | "bearish";
  confidence: "high" | "medium" | "low";
}

const TIMEFRAME_MINUTES: Record<string, number> = {
  M1: 1,
  M5: 5,
  M15: 15,
  M30: 30,
  H1: 60,
  H4: 240,
  D1: 1440,
};

const GANN_CYCLE = 144;

/**
 * Calculate astro cycle projection
 * Uses Gann 144-bar cycle to predict next swing turn
 */
export function calculateAstroCycle(
  timeframe: string,
  swingTime: Date,
  direction: "high" | "low"
): AstroResult {
  const minutes = TIMEFRAME_MINUTES[timeframe] ?? 60;
  const cycleMinutes = GANN_CYCLE * minutes;

  // ponytail: Date math is native, no library needed
  const nextTurn = new Date(swingTime.getTime() + cycleMinutes * 60 * 1000);

  // Direction flips at turn: high → bearish, low → bullish
  const nextDirection = direction === "high" ? "bearish" : "bullish";

  // Duration formatting
  const hours = Math.floor(cycleMinutes / 60);
  const days = Math.floor(hours / 24);
  const duration =
    days > 0
      ? `${days} hari ${hours % 24} jam`
      : `${hours} jam ${cycleMinutes % 60} menit`;

  return {
    cycleBars: GANN_CYCLE,
    duration,
    nextTurnDate: nextTurn.toISOString(),
    direction: nextDirection,
    confidence: timeframe === "H1" || timeframe === "H4" ? "high" : "medium",
  };
}

/**
 * Format date for display (Indonesian locale)
 */
export function fmtSwingTime(date: Date): string {
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
