// Gann Square of 9 Confluence Calculator
// Calculates key price levels based on Gann's Square of 9 methodology

export type GannLevel = {
  price: number;
  angle: number;      // degrees (0, 90, 180, 270, 360...)
  direction: "buy" | "sell";
  label: string;      // e.g., "Cardinal Cross", "Ordinal Cross", "0°", "45°"
};

// Square root of price → rotate by degrees → square back
function gannLevel(price: number, degrees: number): number {
  const sqrt = Math.sqrt(price);
  const rotated = sqrt + degrees / 360;
  return +(rotated * rotated).toFixed(2);
}

export function calculateGannLevels(high: number, low: number): GannLevel[] {
  const levels: GannLevel[] = [];
  const mid = (high + low) / 2;

  // Key Gann angles from swing high → resistance (sell)
  const sellAngles = [90, 180, 270, 360];
  // Key Gann angles from swing low → support (buy)
  const buyAngles = [90, 180, 270, 360];

  for (const angle of sellAngles) {
    const price = gannLevel(high, angle);
    if (price > high && price < high * 1.05) { // within 5% of range
      levels.push({
        price,
        angle,
        direction: "sell",
        label: angle <= 180 ? "Cardinal Cross" : "Ordinal Cross",
      });
    }
  }

  for (const angle of buyAngles) {
    const price = gannLevel(low, -angle);
    if (price < low && price > low * 0.95) {
      levels.push({
        price,
        angle,
        direction: "buy",
        label: angle <= 180 ? "Cardinal Cross" : "Ordinal Cross",
      });
    }
  }

  // Also calculate from mid price for additional levels
  for (const angle of [45, 135, 225, 315]) {
    const above = gannLevel(mid, angle);
    const below = gannLevel(mid, -angle);
    if (above > low && above < high * 1.03) {
      levels.push({ price: above, angle, direction: "sell", label: `${angle}°` });
    }
    if (below > low * 0.97 && below < high) {
      levels.push({ price: below, angle, direction: "buy", label: `-${angle}°` });
    }
  }

  return levels;
}
