// Calculates price based on selected plan and billing period
export function calculatePrice(
  basePrice: number,
  plan: string,
  quantity: number,
  cycle: "month" | "year",
): number {
  let n = 0;
  const baseQuantity = 10000;

  if (plan === "plus") {
    n = 0.41;
  } else if (plan === "pro") {
    n = 0.378;
  }

  const k = basePrice / Math.pow(baseQuantity, n);

  let price = k * Math.pow(quantity, n);

  if (cycle === "year") {
    price *= 0.8;
  }

  return Math.round(price * 100) / 100;
}

// Maps slider values to event amounts for display
export function getEventAmount(value: number): string {
  const valueMap: Record<number, string> = {
    0: "10K",
    10: "50K",
    20: "100K",
    30: "250K",
    40: "500K",
    50: "1M",
    60: "2M",
    70: "4M",
    80: "6M",
    90: "8M",
    100: "10M",
  };
  return valueMap[value] || "N/A";
}

export function getEventCount(value: number): number {
  const valueMap: Record<number, number> = {
    0: 10000,
    10: 50000,
    20: 100000,
    30: 250000,
    40: 500000,
    50: 1000000,
    60: 2000000,
    70: 4000000,
    80: 6000000,
    90: 8000000,
    100: 10000000,
  };
  return valueMap[value] || 0;
}
