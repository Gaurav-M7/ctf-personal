import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { demoStore } from '../services/demoStore';
import { MatchResult } from '../types';
import { MobileShell } from '../components/layout/MobileShell';
import { LeafletMapView } from '../components/map/LeafletMapView';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { PrivacyExplainer } from '../components/safety/PrivacyExplainer';

export const MatchDetail: React.FC = () => {
  const { matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const state = location.state || {};
  const match: MatchResult | undefined = state.match;

  const [requested, setRequested] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If page was loaded directly without navigation state, grab first match from demoStore
  const driver = match?.offer_student || demoStore.getStudents()[0];
  const driverRoute = match?.offer_route || demoStore.getRoutes()[0];
  const vehicle = driver?.vehicle;

  const handleSendRequest = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    demoStore.createRideRequest({
      match_id: matchId,
      rider_id: currentUser.id,
      driver_id: driver.id,
      rider: currentUser,
      driver: driver,
      route: driverRoute,
      scheduled_date: 'Tomorrow',
      scheduled_time: driverRoute.arrival_time,
      approx_pickup_area: driverRoute.origin_name.split(',')[0],
      status: 'contacted',
    });

    setRequested(true);
    setSuccessMessage(`Ride request sent to ${driver.full_name}! Check the Requests tab.`);
  };

  return (
    <MobileShell currentUser={currentUser} headerTitle="Ride Details" showBack={true}>
      <div className="p-margin flex flex-col gap-4">
        {/* Interactive Map with Route Overlap & Approximate Pickup Zone */}
        <div className="relative rounded-2xl overflow-hidden shadow-sm border border-surface-container">
          <LeafletMapView
            origin={[driverRoute.origin_lat, driverRoute.origin_lng]}
            routeCoordinates={driverRoute.polyline_coords}
            secondaryRouteCoordinates={[
              [driverRoute.origin_lat + 0.002, driverRoute.origin_lng - 0.001],
              ...driverRoute.polyline_coords.slice(1),
            ]}
            approximatePickupAreaName={driverRoute.origin_name.split(',')[0]}
            height="260px"
          />

          {/* Floater Overlap Pill */}
          <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
            <Badge variant="match" icon="route">
              {match ? Math.round(match.route_match_pct) : 88}% Route Overlap
            </Badge>
            <span className="bg-primary/90 backdrop-blur-md text-on-primary text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              {driverRoute.distance_km} km • ~{driverRoute.duration_min} min
            </span>
          </div>
        </div>

        {/* Approximate Pickup Landmark Privacy Notice */}
        <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex items-center gap-2.5 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-primary text-[18px] shrink-0">visibility_off</span>
          <div>
            <strong className="text-on-surface block">Approximate Pickup Area Only</strong>
            <span>Exact landmark coordinates are shared after both parties accept.</span>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 text-xs text-primary font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Driver Profile & College Verification Credentials */}
        <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                {driver.avatar_url ? (
                  <img
                    src={driver.avatar_url}
                    alt={driver.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {driver.full_name.charAt(0)}
                  </div>
                )}
                {driver.is_verified && (
                  <span
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0047bf] text-white flex items-center justify-center ring-2 ring-white"
                    title="DYPCOE Verified Student"
                  >
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-title-md text-sm font-bold text-on-surface">
                    {driver.full_name}
                  </h3>
                  {driver.rating && (
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-secondary">
                      <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      {driver.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-on-surface-variant block">
                  {driver.department} • {driver.year}
                </span>
                <span className="text-[11px] font-mono text-outline block">
                  PRN: {driver.enrollment_no}
                </span>
              </div>
            </div>

            <Badge variant="verified" icon="verified_user" size="sm">
              Verified
            </Badge>
          </div>

          {/* Driver Stats */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-container/60 text-xs text-center">
            <div className="p-2 bg-surface-container-low rounded-xl">
              <span className="text-outline block text-[10px]">Shared Trips</span>
              <span className="font-bold text-primary">{driver.total_rides || 24} Rides</span>
            </div>
            <div className="p-2 bg-surface-container-low rounded-xl">
              <span className="text-outline block text-[10px]">Eco Savings</span>
              <span className="font-bold text-secondary">{driver.co2_saved_kg || 32.4} kg CO2</span>
            </div>
          </div>
        </div>

        {/* Schedule & Timing Card */}
        <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-4 shadow-sm flex flex-col gap-2.5">
          <h4 className="font-label-lg text-xs font-bold text-on-surface uppercase tracking-wider text-outline">
            Schedule & Campus Arrival
          </h4>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
              <div>
                <span className="font-bold text-on-surface block">
                  Arrival at DYPCOE: {driverRoute.arrival_time} AM
                </span>
                <span className="text-outline text-[11px]">Lectures start at 09:15 AM</span>
              </div>
            </div>
            <span className="font-semibold text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded-full text-[11px]">
              On Schedule
            </span>
          </div>

          <div className="flex items-center gap-1.5 pt-1 text-xs">
            <span className="text-outline">Active Days:</span>
            <span className="font-bold text-primary">{driverRoute.days_of_week.join(' • ')}</span>
          </div>
        </div>

        {/* Vehicle Information */}
        {vehicle && (
          <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-4 shadow-sm flex flex-col gap-2.5">
            <h4 className="font-label-lg text-xs font-bold text-on-surface uppercase tracking-wider text-outline">
              Vehicle Information
            </h4>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">
                    {vehicle.vehicle_type === 'two_wheeler' ? 'two_wheeler' : 'directions_car'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-on-surface block">{vehicle.model_name}</span>
                  <span className="font-mono text-outline text-[11px]">{vehicle.plate_number}</span>
                </div>
              </div>
              <Badge variant="seats" icon="event_seat">
                {vehicle.available_seats} Seats Left
              </Badge>
            </div>
          </div>
        )}

        {/* Privacy & Safety Explainer Component */}
        <PrivacyExplainer />

        {/* Sticky-like Bottom Actions */}
        <div className="pt-2 flex flex-col gap-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={requested}
            onClick={handleSendRequest}
            icon={requested ? 'done' : 'hail'}
          >
            {requested ? 'Ride Requested' : 'Request Ride with ' + driver.full_name}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => navigate(-1)}
          >
            Back to Results
          </Button>
        </div>
      </div>
    </MobileShell>
  );
};
