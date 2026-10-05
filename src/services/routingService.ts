import { DYPCOE_COORDINATES } from '../data/puneSeedData';

export interface RouteGeometryResult {
  coordinates: [number, number][]; // [lat, lng][]
  distanceKm: number;
  durationMin: number;
}

// Curated local Pune corridor coordinates for instant zero-latency lookup
const KNOWN_PUNE_CORRIDORS: Record<string, [number, number][]> = {
  wakad: [
    [18.5987, 73.7634],
    [18.6045, 73.7621],
    [18.6132, 73.7615],
    [18.6250, 73.7601],
    [18.6360, 73.7592],
    [18.6448, 73.7580],
  ],
  hinjawadi: [
    [18.5913, 73.7389],
    [18.6050, 73.7490],
    [18.6220, 73.7550],
    [18.6370, 73.7570],
    [18.6448, 73.7580],
  ],
  ravet: [
    [18.6521, 73.7389],
    [18.6510, 73.7440],
    [18.6490, 73.7505],
    [18.6465, 73.7550],
    [18.6448, 73.7580],
  ],
  'pimple saudagar': [
    [18.5985, 73.7915],
    [18.6105, 73.7850],
    [18.6250, 73.7780],
    [18.6380, 73.7690],
    [18.6448, 73.7580],
  ],
  chinchwad: [
    [18.6298, 73.7997],
    [18.6350, 73.7880],
    [18.6410, 73.7720],
    [18.6448, 73.7580],
  ],
  nigdi: [
    [18.6580, 73.7710],
    [18.6520, 73.7650],
    [18.6448, 73.7580],
  ],
  thergaon: [
    [18.6120, 73.7740],
    [18.6240, 73.7680],
    [18.6350, 73.7620],
    [18.6448, 73.7580],
  ],
};

/**
 * Fetches route geometry between two coordinates using OSRM, with fallback to curated corridor interpolation.
 */
export async function fetchRouteGeometry(
  originLat: number,
  originLng: number,
  destLat: number = DYPCOE_COORDINATES.latitude,
  destLng: number = DYPCOE_COORDINATES.longitude
): Promise<RouteGeometryResult> {
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

    const res = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // OSRM returns coordinates as [lng, lat] GeoJSON format -> invert to [lat, lng]
        const coords: [number, number][] = route.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );
        return {
          coordinates: coords,
          distanceKm: +(route.distance / 1000).toFixed(1),
          durationMin: Math.max(1, Math.round(route.duration / 60)),
        };
      }
    }
  } catch (err) {
    // Network offline or API timeout; fall back to local interpolation
  }

  // Fallback: Generate 6 interpolated points along the line + calculate straight line * 1.3 transit factor
  const sampleSteps = 6;
  const interpolated: [number, number][] = [];
  for (let i = 0; i <= sampleSteps; i++) {
    const factor = i / sampleSteps;
    const lat = originLat + (destLat - originLat) * factor;
    const lng = originLng + (destLng - originLng) * factor;
    interpolated.push([lat, lng]);
  }

  // Approx distance: 111 km per degree lat
  const dLat = (destLat - originLat) * 111;
  const dLng = (destLng - originLng) * 105;
  const approxDistance = +(Math.sqrt(dLat * dLat + dLng * dLng) * 1.3).toFixed(1);
  const approxDuration = Math.max(5, Math.round(approxDistance * 2.2));

  return {
    coordinates: interpolated,
    distanceKm: approxDistance,
    durationMin: approxDuration,
  };
}

/**
 * Searches Pune locations via Nominatim with debounce.
 */
export async function searchLocation(query: string): Promise<{ name: string; lat: number; lng: number }[]> {
  const lower = query.toLowerCase();

  // Instant matching for popular student hubs around PCMC / Akurdi
  const predefined = [
    { name: 'Datta Mandir Road, Wakad', lat: 18.5987, lng: 73.7634 },
    { name: 'Hinjawadi Phase 1, Shivaji Chowk', lat: 18.5913, lng: 73.7389 },
    { name: 'Ravet Basket Bridge', lat: 18.6534, lng: 73.7370 },
    { name: 'Pimple Saudagar Linear Garden', lat: 18.6010, lng: 73.7930 },
    { name: 'Chinchwad Railway Station', lat: 18.6298, lng: 73.7997 },
    { name: 'Dange Chowk, Thergaon', lat: 18.6120, lng: 73.7740 },
    { name: 'Nigdi Bhakti Shakti Chowk', lat: 18.6550, lng: 73.7750 },
    { name: 'Baner Balewadi High Street', lat: 18.5720, lng: 73.7790 },
  ];

  const matchedLocal = predefined.filter((p) => p.name.toLowerCase().includes(lower));
  if (matchedLocal.length > 0) {
    return matchedLocal;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query + ', Pimpri-Chinchwad, Pune'
    )}&limit=4&countrycodes=in`;
    const res = await fetch(url, { headers: { 'User-Agent': 'CampusRide-DYPCOE' } });
    if (res.ok) {
      const data = await res.json();
      return data.map((item: any) => ({
        name: item.display_name.split(',')[0] + ', ' + (item.display_name.split(',')[1] || '').trim(),
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));
    }
  } catch (err) {}

  return matchedLocal;
}
