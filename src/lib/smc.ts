// Smart Money Concepts (SMC) Signal Detection
// Detects: FVG, OB, BOS, CHoCH from candlestick data

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type SMCSignal = {
  type: "FVG" | "OB" | "BOS" | "CHoCH";
  direction: "buy" | "sell";
  price: number;       // signal price level
  candleIndex: number; // which candle triggered it
  time: number;
};

// Fair Value Gap: 3-candle imbalance
// Bullish FVG: candle1.high < candle3.low (gap up)
// Bearish FVG: candle1.low > candle3.high (gap down)
function detectFVG(candles: Candle[]): SMCSignal[] {
  const signals: SMCSignal[] = [];
  for (let i = 2; i < candles.length; i++) {
    const c1 = candles[i - 2], c3 = candles[i];
    if (c1.high < c3.low) {
      signals.push({
        type: "FVG",
        direction: "buy",
        price: (c1.high + c3.low) / 2,
        candleIndex: i,
        time: c3.time,
      });
    }
    if (c1.low > c3.high) {
      signals.push({
        type: "FVG",
        direction: "sell",
        price: (c3.high + c1.low) / 2,
        candleIndex: i,
        time: c3.time,
      });
    }
  }
  return signals;
}

// Order Block: last opposing candle before impulsive move
// Bullish OB: last bearish candle before 2+ bullish candles that break structure
// Bearish OB: last bullish candle before 2+ bearish candles that break structure
function detectOB(candles: Candle[]): SMCSignal[] {
  const signals: SMCSignal[] = [];
  for (let i = 2; i < candles.length - 2; i++) {
    const prev = candles[i - 1], curr = candles[i], next1 = candles[i + 1], next2 = candles[i + 2];
    // Bullish OB: bearish candle followed by strong bullish move
    if (prev.close < prev.open && curr.close > curr.open && next1.close > next1.open && next2.close > next2.open) {
      const moveSize = next2.close - prev.open;
      if (moveSize > (prev.high - prev.low) * 1.5) {
        signals.push({
          type: "OB",
          direction: "buy",
          price: prev.low,
          candleIndex: i - 1,
          time: prev.time,
        });
      }
    }
    // Bearish OB: bullish candle followed by strong bearish move
    if (prev.close > prev.open && curr.close < curr.open && next1.close < next1.open && next2.close < next2.open) {
      const moveSize = prev.open - next2.close;
      if (moveSize > (prev.high - prev.low) * 1.5) {
        signals.push({
          type: "OB",
          direction: "sell",
          price: prev.high,
          candleIndex: i - 1,
          time: prev.time,
        });
      }
    }
  }
  return signals;
}

// Break of Structure (BOS): price breaks previous swing high/low
// Bullish BOS: close > previous swing high
// Bearish BOS: close < previous swing low
function detectBOS(candles: Candle[]): SMCSignal[] {
  const signals: SMCSignal[] = [];
  const lookback = 5;

  for (let i = lookback; i < candles.length; i++) {
    // Find swing high and swing low in lookback window
    let swingHigh = -Infinity, swingLow = Infinity;
    for (let j = i - lookback; j < i; j++) {
      if (candles[j].high > swingHigh) swingHigh = candles[j].high;
      if (candles[j].low < swingLow) swingLow = candles[j].low;
    }

    const curr = candles[i];
    if (curr.close > swingHigh) {
      signals.push({
        type: "BOS",
        direction: "buy",
        price: swingHigh,
        candleIndex: i,
        time: curr.time,
      });
    }
    if (curr.close < swingLow) {
      signals.push({
        type: "BOS",
        direction: "sell",
        price: swingLow,
        candleIndex: i,
        time: curr.time,
      });
    }
  }
  return signals;
}

// Change of Character (CHoCH): first break against the trend
// Requires trend detection first
function detectCHoCH(candles: Candle[]): SMCSignal[] {
  const signals: SMCSignal[] = [];
  const lookback = 10;

  for (let i = lookback; i < candles.length; i++) {
    // Determine trend from lookback: count bullish vs bearish candles
    let bullishCount = 0;
    for (let j = i - lookback; j < i; j++) {
      if (candles[j].close > candles[j].open) bullishCount++;
    }
    const isUptrend = bullishCount > lookback * 0.6;

    // Find swing high/low in window
    let swingHigh = -Infinity, swingLow = Infinity;
    for (let j = i - lookback; j < i; j++) {
      if (candles[j].high > swingHigh) swingHigh = candles[j].high;
      if (candles[j].low < swingLow) swingLow = candles[j].low;
    }

    const curr = candles[i];
    // In uptrend, CHoCH = close < swing low (bearish reversal)
    if (isUptrend && curr.close < swingLow) {
      signals.push({
        type: "CHoCH",
        direction: "sell",
        price: swingLow,
        candleIndex: i,
        time: curr.time,
      });
    }
    // In downtrend, CHoCH = close > swing high (bullish reversal)
    if (!isUptrend && curr.close > swingHigh) {
      signals.push({
        type: "CHoCH",
        direction: "buy",
        price: swingHigh,
        candleIndex: i,
        time: curr.time,
      });
    }
  }
  return signals;
}

export function detectAllSignals(candles: Candle[]): SMCSignal[] {
  return [
    ...detectFVG(candles),
    ...detectOB(candles),
    ...detectBOS(candles),
    ...detectCHoCH(candles),
  ];
}

export type { Candle };
