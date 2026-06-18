// ponytail: pure math, no deps needed

export interface SQ9Levels {
  buy: number[];
  sell: number[];
}

/**
 * Gann Square of 9 calculator
 * Input: swing high and low prices
 * Output: buy and sell projection levels
 */
export function calculateSQ9(high: number, low: number): SQ9Levels {
  const range = high - low;
  const sqrtHigh = Math.sqrt(high);
  const sqrtLow = Math.sqrt(low);

  // Buy levels: square root of high + N increments, squared
  const buy = [1, 2, 3, 4, 5].map((n) => {
    const val = (sqrtHigh + n * 0.125) ** 2;
    return Math.round(val * 100) / 100;
  });

  // Sell levels: square root of low - N increments, squared
  const sell = [1, 2, 3, 4, 5].map((n) => {
    const val = (sqrtLow - n * 0.125) ** 2;
    return Math.round(val * 100) / 100;
  });

  return { buy, sell };
}

/**
 * Validate swing inputs
 */
export function isValidSwing(high: number, low: number): boolean {
  return (
    !isNaN(high) &&
    !isNaN(low) &&
    high > 0 &&
    low > 0 &&
    high > low
  );
}
