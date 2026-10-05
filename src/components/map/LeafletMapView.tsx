import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { DYPCOE_COORDINATES } from '../../data/puneSeedData';

interface LeafletMapViewProps {
  origin?: [number, number];
  destination?: [number, number];
  routeCoordinates?: [number, number][];
  secondaryRouteCoordinates?: [number, number][];
  approximatePickupAreaName?: string;
  showPickupBuffer?: boolean;
  height?: string;
}

export const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  origin,
  destination = [DYPCOE_COORDINATES.latitude, DYPCOE_COORDINATES.longitude],
  routeCoordinates,
  secondaryRouteCoordinates,
  approximatePickupAreaName,
  showPickupBuffer = true,
  height = '240px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already created
    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = origin || destination || [18.6448, 73.7580];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous layers except tile layer
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    const bounds = L.latLngBounds([]);

    // 1. Destination Marker (DYPCOE Campus)
    if (destination) {
      const campusIcon = L.divIcon({
        className: 'custom-campus-pin',
        html: `
          <div style="background-color: #fea619; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.25); border: 2px solid #ffffff;">
            <span class="material-symbols-outlined" style="color: #ffffff; font-size: 20px;">school</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      L.marker(destination, { icon: campusIcon })
        .addTo(map)
        .bindPopup('<b>DYPCOE Campus</b><br>Sector 29, Akurdi');
      bounds.extend(destination);
    }

    // 2. Origin Marker / Approximate Pickup Zone
    if (origin) {
      const originIcon = L.divIcon({
        className: 'custom-origin-pin',
        html: `
          <div style="background-color: #005c55; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.25); border: 2px solid #ffffff;">
            <span class="material-symbols-outlined" style="color: #ffffff; font-size: 18px;">trip_origin</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker(origin, { icon: originIcon })
        .addTo(map)
        .bindPopup(
          `<b>${approximatePickupAreaName || 'Approximate Pickup Spot'}</b><br><small style="color: #6e7977;">Exact address hidden for privacy</small>`
        );
      bounds.extend(origin);

      // Privacy Buffer Circle (approx 350m radius)
      if (showPickupBuffer) {
        L.circle(origin, {
          radius: 350,
          color: '#005c55',
          fillColor: '#005c55',
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '4, 4',
        }).addTo(map);
      }
    }

    // 3. Primary Route Polyline (Teal)
    if (routeCoordinates && routeCoordinates.length > 0) {
      const primaryPolyline = L.polyline(routeCoordinates, {
        color: '#005c55',
        weight: 5,
        opacity: 0.9,
      }).addTo(map);

      routeCoordinates.forEach((c) => bounds.extend(c));
    }

    // 4. Secondary Route Polyline (Overlap / Passenger corridor)
    if (secondaryRouteCoordinates && secondaryRouteCoordinates.length > 0) {
      L.polyline(secondaryRouteCoordinates, {
        color: '#fea619',
        weight: 4,
        dashArray: '6, 6',
        opacity: 0.85,
      }).addTo(map);

      secondaryRouteCoordinates.forEach((c) => bounds.extend(c));
    }

    // Adjust viewport to fit bounds if valid
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [25, 25], maxZoom: 15 });
    }

    // Leaflet container resize hook
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

  }, [origin, destination, routeCoordinates, secondaryRouteCoordinates, approximatePickupAreaName, showPickupBuffer]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height }}
      className="w-full rounded-2xl overflow-hidden shadow-inner relative border border-surface-container"
    />
  );
};
