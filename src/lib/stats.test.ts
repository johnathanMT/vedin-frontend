import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { wilsonInterval, permutationPValue, binomialNullSamples, benjaminiHochberg, mean } from './stats'

describe('wilsonInterval', () => {
  it('returns zeros for n = 0', () => {
    expect(wilsonInterval(0, 0)).toEqual({ p: 0, low: 0, high: 0 })
  })

  it('point estimate p = k / n', () => {
    expect(wilsonInterval(5, 10).p).toBeCloseTo(0.5, 10)
    expect(wilsonInterval(3, 4).p).toBeCloseTo(0.75, 10)
  })

  it('matches a known value (5/10, z=1.96)', () => {
    const w = wilsonInterval(5, 10)
    expect(w.low).toBeCloseTo(0.2366, 3)
    expect(w.high).toBeCloseTo(0.7634, 3)
  })

  it('collapses to the boundary at the extremes', () => {
    expect(wilsonInterval(0, 20).low).toBeCloseTo(0, 10)   // k=0 → low = 0
    expect(wilsonInterval(20, 20).high).toBeCloseTo(1, 10)  // k=n → high = 1
  })

  it('property: 0 ≤ low ≤ p ≤ high ≤ 1 for any valid (k, n)', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 10000 }),
      fc.double({ min: 0, max: 1, noNaN: true }),
      (n, frac) => {
        const k = Math.round(frac * n)
        const { p, low, high } = wilsonInterval(k, n)
        return low >= -1e-9 && low <= p + 1e-9 && p <= high + 1e-9 && high <= 1 + 1e-9
      },
    ))
  })
})

describe('permutationPValue', () => {
  it('is (atLeast + 1)/(N + 1) — smallest when observed beats every null', () => {
    const nulls = [1, 2, 3, 4]
    expect(permutationPValue(10, nulls)).toBeCloseTo(1 / 5, 10)      // none ≥ 10
    expect(permutationPValue(0, nulls)).toBeCloseTo(5 / 5, 10)       // all ≥ 0
  })

  it('empty null distribution → p = 1', () => {
    expect(permutationPValue(5, [])).toBe(1)
  })

  it('property: result is always in (0, 1]', () => {
    fc.assert(fc.property(
      fc.double({ min: -100, max: 100, noNaN: true }),
      fc.array(fc.double({ min: -100, max: 100, noNaN: true }), { minLength: 1, maxLength: 200 }),
      (obs, nulls) => {
        const p = permutationPValue(obs, nulls)
        return p > 0 && p <= 1
      },
    ))
  })
})

describe('binomialNullSamples', () => {
  it('produces exactly `iterations` samples', () => {
    expect(binomialNullSamples([0.2, 0.5], 500)).toHaveLength(500)
  })

  it('every sample is within [0, predictions]', () => {
    const rates = [0.1, 0.3, 0.6, 0.9]
    for (const s of binomialNullSamples(rates, 1000)) {
      expect(s).toBeGreaterThanOrEqual(0)
      expect(s).toBeLessThanOrEqual(rates.length)
    }
  })

  it('deterministic edges: all-1 → all hits, all-0 → no hits', () => {
    expect(binomialNullSamples([1, 1, 1], 50).every((s) => s === 3)).toBe(true)
    expect(binomialNullSamples([0, 0, 0], 50).every((s) => s === 0)).toBe(true)
  })
})

describe('benjaminiHochberg', () => {
  it('empty input → empty output', () => {
    expect(benjaminiHochberg([])).toEqual([])
  })

  it('classic example (q=0.05) flags the two smallest p-values', () => {
    const pvals = [0.001, 0.008, 0.039, 0.041, 0.042, 0.06, 0.074, 0.205]
    expect(benjaminiHochberg(pvals, 0.05)).toEqual([true, true, false, false, false, false, false, false])
  })

  it('all p tiny → all significant; all p = 1 → none significant', () => {
    expect(benjaminiHochberg([1e-6, 1e-6, 1e-6], 0.05)).toEqual([true, true, true])
    expect(benjaminiHochberg([1, 1, 1], 0.05)).toEqual([false, false, false])
  })

  it('preserves input order in the output mask', () => {
    const pvals = [0.5, 0.001, 0.9]      // significant one is at index 1
    expect(benjaminiHochberg(pvals, 0.05)).toEqual([false, true, false])
  })
})

describe('mean', () => {
  it('empty → 0', () => expect(mean([])).toBe(0))
  it('averages correctly', () => expect(mean([2, 4, 6])).toBeCloseTo(4, 10))
})
