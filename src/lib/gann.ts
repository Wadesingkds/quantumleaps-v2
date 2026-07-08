// QuantumLeaps — Gann Square of 9 (Fixed-Increment)
// Level = (√price ± increment)²
// Source: quantumleaps-api LuxAlgo Engine

export type GannLevel = {
  label: string;       // BUY1–3, SELL1–3
  price: number;
  type: "BUY" | "SELL";
};

const INCREMENTS = [0.125, 0.175, 0.250];

export function calculateGannLevels(high: number, low: number): GannLevel[] {
  const levels: GannLevel[] = [];

  if (high) {
    for (let i = 0; i < INCREMENTS.length; i++) {
      levels.push({
        label: `BUY${i + 1}`,
        price: +Math.pow(Math.sqrt(high) - INCREMENTS[i], 2).toFixed(2),
        type: "BUY",
      });
    }
  }
  if (low) {
    for (let i = 0; i < INCREMENTS.length; i++) {
      levels.push({
        label: `SELL${i + 1}`,
        price: +Math.pow(Math.sqrt(low) + INCREMENTS[i], 2).toFixed(2),
        type: "SELL",
      });
    }
  }

  return levels;
}
