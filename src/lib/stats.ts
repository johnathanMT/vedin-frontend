// ============================================================================
//  stats.ts — a small, honest statistics toolkit for the Vedin research page.
//  Pure functions, no side effects → property-testable. Used to MEASURE whether
//  the astrological findings do better than chance, not to prove that they do.
// ============================================================================

/** Wilson score confidence interval for a binomial proportion (k of n).
 *  Far better than the naive p ± z·√(p(1-p)/n) for small n or extreme p. */
export function wilsonInterval(k: number, n: number, z = 1.96): { p: number; low: number; high: number } {
  if (n <= 0) return { p: 0, low: 0, high: 0 }
  const p = k / n
  const z2 = z * z
  const denom = 1 + z2 / n
  const centre = (p + z2 / (2 * n)) / denom
  const margin = (z / denom) * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n)
  return { p, low: Math.max(0, centre - margin), high: Math.min(1, centre + margin) }
}

/** One-sided p-value from a Monte-Carlo / permutation null distribution:
 *  the fraction of null samples at least as extreme as the observed statistic.
 *  (+1 smoothing so a p-value is never exactly 0.) */
export function permutationPValue(observed: number, nullSamples: number[]): number {
  if (nullSamples.length === 0) return 1
  let atLeast = 0
  for (const s of nullSamples) if (s >= observed) atLeast++
  return (atLeast + 1) / (nullSamples.length + 1)
}

/** Null model for hit counts: under H₀ each prediction "hits" purely at its own
 *  base rate. Returns `iterations` simulated total-hit counts to compare against
 *  the observed hits. If observed ≫ this distribution, the signal beats chance. */
export function binomialNullSamples(baseRates: number[], iterations = 10000): number[] {
  const out = new Array<number>(iterations)
  for (let it = 0; it < iterations; it++) {
    let hits = 0
    for (const r of baseRates) if (Math.random() < r) hits++
    out[it] = hits
  }
  return out
}

/** Benjamini–Hochberg false-discovery-rate control. Given raw p-values, returns
 *  which hypotheses are significant at FDR level q (order preserved). Essential
 *  when testing many rules — otherwise ~q·m "significant" results are pure noise. */
export function benjaminiHochberg(pvalues: number[], q = 0.05): boolean[] {
  const m = pvalues.length
  if (m === 0) return []
  const idx = pvalues.map((p, i) => ({ p, i })).sort((a, b) => a.p - b.p)
  let kMax = -1
  for (let rank = 0; rank < m; rank++) {
    if (idx[rank].p <= ((rank + 1) / m) * q) kMax = rank
  }
  const sig = new Array<boolean>(m).fill(false)
  for (let rank = 0; rank <= kMax; rank++) sig[idx[rank].i] = true
  return sig
}

/** Mean of an array (0 for empty). */
export const mean = (xs: number[]): number => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
