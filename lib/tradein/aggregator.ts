import type { Listing } from "@/lib/scrapers/jiji";

export interface AggregationResult {
  median: number | null;
  mean: number | null;
  trimmedMean: number | null;
  sampleCount: number;
  sourceCounts: Record<string, number>;
  finalTradeInPrice: number | null;
  explanation: string;
}

export function aggregateListings(listingsBySource: Record<string, Listing[]>): AggregationResult {
  const all: number[] = [];
  const sourceCounts: Record<string, number> = {};
  for (const key of Object.keys(listingsBySource)) {
    const arr = listingsBySource[key] || [];
    sourceCounts[key] = arr.length;
    for (const l of arr) all.push(l.price);
  }

  const sampleCount = all.length;
  if (sampleCount === 0) {
    return {
      median: null,
      mean: null,
      trimmedMean: null,
      sampleCount: 0,
      sourceCounts,
      finalTradeInPrice: null,
      explanation: 'No prices found from sources. Unable to estimate.',
    };
  }

  all.sort((a, b) => a - b);
  const median = computeMedian(all);
  const mean = Math.round(all.reduce((s, v) => s + v, 0) / all.length);
  const trimmedMean = computeTrimmedMean(all, 0.1);

  // Apply the 45% reduction to produce trade-in credit
  const final = Math.round((trimmedMean || mean) * 0.55);

  const explanation = `Aggregated ${sampleCount} listings from ${Object.keys(listingsBySource).length} sources. Used trimmed mean to reduce outliers, then reduced by 45% to produce a conservative trade-in credit. Median: ₦${median.toLocaleString()}, Final trade-in: ₦${final.toLocaleString()}.`;

  return {
    median,
    mean,
    trimmedMean,
    sampleCount,
    sourceCounts,
    finalTradeInPrice: final,
    explanation,
  };
}

function computeMedian(arr: number[]) {
  const mid = Math.floor(arr.length / 2);
  if (arr.length % 2 === 0) {
    return Math.round((arr[mid - 1] + arr[mid]) / 2);
  }
  return arr[mid];
}

function computeTrimmedMean(arr: number[], trimFraction = 0.1) {
  if (arr.length < 3) return Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
  const trim = Math.floor(arr.length * trimFraction);
  const sliced = arr.slice(trim, arr.length - trim);
  const sum = sliced.reduce((s, v) => s + v, 0);
  return Math.round(sum / sliced.length);
}
