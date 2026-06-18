// ponytail: Gann SQ9 — single swing point + type
// Formula: matches quantum-astro (tested version)

export interface SQ9Levels {
  base: number;
  type: "high" | "low";
  levels: number[];
  label: string;
}

/**
 * Gann Square of 9 — projection levels
 * type='high' → BUY levels BELOW swing (support zones)
 * type='low'  → SELL levels ABOVE swing (resistance zones)
 */
export function calculateSQ9(price: number, type: "high" | "low"): SQ9Levels {
  const sqrt = Math.sqrt(price);
  // Standard SQ9 increments: 0.125 (45°), 0.175 (mid), 0.250 (90°)
  const increments = [0.125, 0.175, 0.250];

  let levels: number[];
  let label: string;

  if (type === "high") {
    // Buy = support below high
    levels = increments.map((inc) =>
      Math.round(Math.pow(sqrt - inc, 2) * 100) / 100
    );
    label = "BUY (support below high)";
  } else {
    // Sell = resistance above low
    levels = increments.map((inc) =>
      Math.round(Math.pow(sqrt + inc, 2) * 100) / 100
    );
    label = "SELL (resistance above low)";
  }

  return { base: price, type, levels, label };
}

/** Validate single price input */
export function isValidPrice(value: number): boolean {
  return !isNaN(value) && value > 0;
}