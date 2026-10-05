import { Route, Student, MatchResult } from '../types';

/**
 * Calculates geodesic distance between two points in meters using Haversine formula.
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates distance from a point to a line segment in meters.
 */
export function pointToSegmentDistanceMeters(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): number {
  const l2 = (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
  if (l2 === 0) return haversineDistanceMeters(px, py, ax, ay);

  // Consider the line extending the segment, parameterized as A + t (B - A).
  // Projection factor t
  let t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2;
  t = Math.max(0, Math.min(1, t));

  const projX = ax + t * (bx - ax);
  const projY = ay + t * (by - ay);

  return haversineDistanceMeters(px, py, projX, projY);
}

/**
 * Computes min distance from a point to an entire polyline in meters.
 */
export function minDistanceToPolyline(
  point: [number, number],
  polyline: [number, number][]
): number {
  if (polyline.length === 0) return Infinity;
  if (polyline.length === 1) {
    return haversineDistanceMeters(point[0], point[1], polyline[0][0], polyline[0][1]);
  }

  let minDistance = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const d = pointToSegmentDistanceMeters(
      point[0],
      point[1],
      polyline[i][0],
      polyline[i][1],
      polyline[i + 1][0],
      polyline[i + 1][1]
    );
    if (d < minDistance) {
      minDistance = d;
    }
  }
  return minDistance;
}

/**
 * Computes the route similarity percentage (0 - 100%) between passenger route and driver route.
 * Buffers the driver route by bufferMeters (default 400m) and measures the fraction of
 * passenger sampled coordinates that fall within this buffer.
 */
export function computeRouteOverlapPercentage(
  passengerPolyline: [number, number][],
  driverPolyline: [number, number][],
  bufferMeters: number = 400
): number {
  if (!passengerPolyline.length || !driverPolyline.length) return 0;

  let pointsInsideBuffer = 0;
  for (const pt of passengerPolyline) {
    const dist = minDistanceToPolyline(pt, driverPolyline);
    if (dist <= bufferMeters) {
      pointsInsideBuffer++;
    }
  }

  return (pointsInsideBuffer / passengerPolyline.length) * 100;
}

/**
 * Parse time string "HH:mm" into total minutes from midnight.
 */
export function timeStringToMinutes(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return 0;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

/**
 * Calculates absolute time difference in minutes between two arrival times.
 */
export function calculateTimeDifferenceMinutes(timeA: string, timeB: string): number {
  const minA = timeStringToMinutes(timeA);
  const minB = timeStringToMinutes(timeB);
  return Math.abs(minA - minB);
}

/**
 * Checks if two sets of active commute days have at least one overlapping day.
 */
export function hasSharedDays(daysA: string[], daysB: string[]): string[] {
  return daysA.filter((day) => daysB.includes(day));
}

/**
 * Role compatibility:
 * Driver must be 'offer' or 'both'
 * Passenger must be 'need' or 'both'
 */
export function isRoleCompatible(driverRole: string, passengerRole: string): boolean {
  const canOffer = driverRole === 'offer' || driverRole === 'both';
  const canNeed = passengerRole === 'need' || passengerRole === 'both';
  return canOffer && canNeed;
}

export interface MatchingOptions {
  minRouteOverlapPct?: number; // default: 60%
  maxTimeDiffMinutes?: number; // default: 15 min
  maxPickupWalkBufferMeters?: number; // default: 600m
}

/**
 * Core Matching Algorithm:
 * Evaluates a query route against all candidate driver routes in the system.
 * Returns only qualified matches passing both route overlap and time window thresholds.
 * NEVER creates a false match.
 */
export function findRouteMatches(
  searchRoute: Route,
  searchStudent: Student,
  candidateRoutes: Route[],
  allStudents: Student[],
  options: MatchingOptions = {}
): MatchResult[] {
  const minOverlap = options.minRouteOverlapPct ?? 60.0;
  const maxTimeDiff = options.maxTimeDiffMinutes ?? 15;
  const maxPickupWalk = options.maxPickupWalkBufferMeters ?? 600;

  const matches: MatchResult[] = [];

  for (const candidateRoute of candidateRoutes) {
    // 1. Skip own routes
    if (candidateRoute.student_id === searchStudent.id) continue;
    if (!candidateRoute.is_active) continue;

    // 2. Determine driver vs passenger roles
    let driverRoute: Route;
    let passengerRoute: Route;
    let driverStudent: Student | undefined;
    let passengerStudent: Student | undefined;

    if (searchRoute.role === 'need') {
      if (candidateRoute.role !== 'offer' && candidateRoute.role !== 'both') continue;
      driverRoute = candidateRoute;
      passengerRoute = searchRoute;
      driverStudent = allStudents.find((s) => s.id === candidateRoute.student_id);
      passengerStudent = searchStudent;
    } else if (searchRoute.role === 'offer') {
      if (candidateRoute.role !== 'need' && candidateRoute.role !== 'both') continue;
      driverRoute = searchRoute;
      passengerRoute = candidateRoute;
      driverStudent = searchStudent;
      passengerStudent = allStudents.find((s) => s.id === candidateRoute.student_id);
    } else {
      // 'both' role searching: look for active offers by default
      if (candidateRoute.role === 'offer' || candidateRoute.role === 'both') {
        driverRoute = candidateRoute;
        passengerRoute = searchRoute;
        driverStudent = allStudents.find((s) => s.id === candidateRoute.student_id);
        passengerStudent = searchStudent;
      } else {
        driverRoute = searchRoute;
        passengerRoute = candidateRoute;
        driverStudent = searchStudent;
        passengerStudent = allStudents.find((s) => s.id === candidateRoute.student_id);
      }
    }

    if (!driverStudent || !passengerStudent) continue;

    // 3. Time Compatibility Check
    const timeDiff = calculateTimeDifferenceMinutes(
      driverRoute.arrival_time,
      passengerRoute.arrival_time
    );
    if (timeDiff > maxTimeDiff) continue;

    // 4. Shared Days Check
    const commonDays = hasSharedDays(driverRoute.days_of_week, passengerRoute.days_of_week);
    if (commonDays.length === 0) continue;

    // 5. Pickup Proximity Check (passenger origin must be reasonably close to driver path)
    const pickupDist = minDistanceToPolyline(
      [passengerRoute.origin_lat, passengerRoute.origin_lng],
      driverRoute.polyline_coords
    );
    if (pickupDist > maxPickupWalk) continue;

    // 6. Route Overlap Percentage Check
    const overlapPct = computeRouteOverlapPercentage(
      passengerRoute.polyline_coords,
      driverRoute.polyline_coords
    );

    if (overlapPct < minOverlap) continue;

    // Both thresholds passed! Valid match.
    matches.push({
      id: `match-${driverRoute.id}-${passengerRoute.id}`,
      offer_route_id: driverRoute.id,
      need_route_id: passengerRoute.id,
      offer_student: driverStudent,
      need_student: passengerStudent,
      offer_route: driverRoute,
      need_route: passengerRoute,
      route_match_pct: Math.min(100, Math.round(overlapPct * 10) / 10),
      time_diff_min: timeDiff,
      shared_days: commonDays,
    });
  }

  // Sort by highest route match percentage, then smallest time difference
  return matches.sort((a, b) => {
    if (b.route_match_pct !== a.route_match_pct) {
      return b.route_match_pct - a.route_match_pct;
    }
    return a.time_diff_min - b.time_diff_min;
  });
}
