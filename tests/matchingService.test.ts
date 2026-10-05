import { describe, it, expect } from 'vitest';
import {
  haversineDistanceMeters,
  pointToSegmentDistanceMeters,
  computeRouteOverlapPercentage,
  calculateTimeDifferenceMinutes,
  hasSharedDays,
  isRoleCompatible,
  findRouteMatches,
} from '../src/services/matchingService';
import { Route, Student } from '../src/types';
import { DYPCOE_COORDINATES } from '../src/data/puneSeedData';

describe('Matching Service Mathematical Engine', () => {
  it('calculates accurate Haversine distance between known Pune coordinates', () => {
    // Wakad (18.5987, 73.7634) to DYPCOE Akurdi (18.6448, 73.7580)
    const dist = haversineDistanceMeters(18.5987, 73.7634, 18.6448, 73.7580);
    // Straight line distance is roughly 5.1 km (~5100m to 5200m)
    expect(dist).toBeGreaterThan(5000);
    expect(dist).toBeLessThan(5500);
  });

  it('calculates point-to-segment distance correctly', () => {
    // Segment from (0, 0) to (0, 10)
    // Point at (0, 5) is on segment -> distance should be ~0
    const distOn = pointToSegmentDistanceMeters(0, 5, 0, 0, 0, 10);
    expect(distOn).toBeLessThan(5);
  });

  it('computes 100% overlap when polylines are identical', () => {
    const poly: [number, number][] = [
      [18.5987, 73.7634],
      [18.6132, 73.7615],
      [18.6448, 73.7580],
    ];
    const overlap = computeRouteOverlapPercentage(poly, poly, 350);
    expect(overlap).toBe(100);
  });

  it('computes 0% overlap for disjoint routes', () => {
    const wakadRoute: [number, number][] = [
      [18.5987, 73.7634],
      [18.6448, 73.7580],
    ];
    // Route in Mumbai or east Pune (Hadapsar)
    const distantRoute: [number, number][] = [
      [18.5080, 73.9250],
      [18.5150, 73.9350],
    ];
    const overlap = computeRouteOverlapPercentage(distantRoute, wakadRoute, 400);
    expect(overlap).toBe(0);
  });

  it('computes time differences in minutes correctly', () => {
    expect(calculateTimeDifferenceMinutes('08:45', '09:00')).toBe(15);
    expect(calculateTimeDifferenceMinutes('08:50', '08:50')).toBe(0);
    expect(calculateTimeDifferenceMinutes('08:30', '09:15')).toBe(45);
  });

  it('verifies day intersections', () => {
    expect(hasSharedDays(['M', 'T', 'W'], ['W', 'T', 'F'])).toEqual(['T', 'W']);
    expect(hasSharedDays(['M'], ['T'])).toEqual([]);
  });

  it('enforces role compatibility', () => {
    expect(isRoleCompatible('offer', 'need')).toBe(true);
    expect(isRoleCompatible('both', 'need')).toBe(true);
    expect(isRoleCompatible('offer', 'both')).toBe(true);
    expect(isRoleCompatible('need', 'need')).toBe(false);
  });
});
