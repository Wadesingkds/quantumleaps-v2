// ponytail: pure math — input satu harga cukup, tentukan type (high/low)

export interface SQ9Levels {
  base: number;
  type: "high" | "low";
  buy: number[];
  sell: number[];
}

/**
 * Gann Square of 9 — single swing point
 * type='high' → buy levels projected above
 * type='low'  → sell levels projected below
 */
export function calculateSQ9(price: number, type: "high" | "low"): SQ9Levels {
  const sqrt = Math.sqrt(price);
  const buy = [1, 2, 3, 4, 5].map((n) => {
    const val = (sqrt + n * 0.125) ** 2;
    return Math.round(val * 100) / 100;
  });
  const sell = [1, 2, 3, 4, 5].map((n) => {
    const val = (sqrt - n * 0.125) ** 2;
    return Math.round(val * 100) / 100;
  });
  return { base: price, type, buy, sell };
}

/** Validate single price input */
export function isValidPrice(value: number): boolean {
  return !isNaN(value) && value > 0;
}