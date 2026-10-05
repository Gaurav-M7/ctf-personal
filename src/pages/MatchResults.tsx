import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { demoStore } from '../services/demoStore';
import { findRouteMatches } from '../services/matchingService';
import { MatchResult, Route, StudentRole, VehicleType } from '../types';
import { DYPCOE_COORDINATES } from '../data/puneSeedData';
import { MobileShell } from '../components/layout/MobileShell';
import { RideCard } from '../components/rides/RideCard';
import { Button } from '../components/common/Button';

export const MatchResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { unreadCount, openNotifications } = useNotifications();

  // Search parameters from Home navigation
  const state = location.state || {};
  const searchRole: StudentRole = state.role || 'need';
  const originName: string = state.originName || 'Datta Mandir Road, Wakad';
  const originLat: number = state.originLat || 18.5987;
  const originLng: number = state.originLng || 73.7634;
  const arrivalTime: string = state.arrivalTime || '08:50';
  const selectedDays: string[] = state.selectedDays || ['M', 'T', 'W', 'T', 'F'];

  // Filters State
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<'any' | VehicleType>(
    state.vehicleFilter || 'any'
  );
  const [timeWindowMin, setTimeWindowMin] = useState(15);
  const [requestedMatchIds, setRequestedMatchIds] = useState<Set<string>>(new Set());
  const [requestSuccessMessage, setRequestSuccessMessage] = useState<string | null>(null);

  // Construct virtual search route
  const searchRoute: Route = useMemo(
    () => ({
      id: 'search-query-route',
      student_id: currentUser?.id || 'guest',
      role: searchRole,
      origin_name: originName,
      origin_lat: originLat,
      origin_lng: originLng,
      destination_name: DYPCOE_COORDINATES.name,
      destination_lat: DYPCOE_COORDINATES.latitude,
      destination_lng: DYPCOE_COORDINATES.longitude,
      polyline_coords: [
        [originLat, originLng],
        [18.6132, 73.7615],
        [18.6250, 73.7601],
        [18.6360, 73.7592],
        [DYPCOE_COORDINATES.latitude, DYPCOE_COORDINATES.longitude],
      ],
      distance_km: 7.8,
      duration_min: 18,
      arrival_time: arrivalTime,
      arrival_window_min: timeWindowMin,
      days_of_week: selectedDays,
      is_active: true,
    }),
    [currentUser?.id, searchRole, originName, originLat, originLng, arrivalTime, timeWindowMin, selectedDays]
  );

  // Run spatial matching engine
  const matches: MatchResult[] = useMemo(() => {
    if (!currentUser) return [];
    const allRoutes = demoStore.getRoutes();
    const allStudents = demoStore.getStudents();

    return findRouteMatches(searchRoute, currentUser, allRoutes, allStudents, {
      maxTimeDiffMinutes: timeWindowMin,
      minRouteOverlapPct: 60.0, // Strict 60% threshold
      maxPickupWalkBufferMeters: 600,
    });
  }, [searchRoute, currentUser, timeWindowMin]);

  // Apply UI Filters
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (verifiedOnly && !m.offer_student.is_verified) return false;
      if (vehicleTypeFilter !== 'any') {
        const vType = m.offer_student.vehicle?.vehicle_type;
        if (vType !== vehicleTypeFilter) return false;
      }
      return true;
    });
  }, [matches, verifiedOnly, vehicleTypeFilter]);

  const handleRequestRide = (match: MatchResult) => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    demoStore.createRideRequest({
      match_id: match.id,
      rider_id: currentUser.id,
      driver_id: match.offer_student.id,
      rider: currentUser,
      driver: match.offer_student,
      route: match.offer_route,
      scheduled_date: 'Tomorrow',
      scheduled_time: match.offer_route.arrival_time,
      approx_pickup_area: originName.split(',')[0],
      status: 'contacted',
    });

    setRequestedMatchIds((prev) => new Set(prev).add(match.id));
    setRequestSuccessMessage(
      `Request sent to ${match.offer_student.full_name}! Direct contact opens upon acceptance.`
    );

    setTimeout(() => {
      setRequestSuccessMessage(null);
    }, 4500);
  };

  const handleViewDetails = (match: MatchResult) => {
    navigate(`/matches/${match.id}`, {
      state: { match, searchRoute },
    });
  };

  return (
    <MobileShell
      currentUser={currentUser}
      unreadNotificationsCount={unreadCount}
      onOpenNotifications={openNotifications}
      headerTitle="Matching Peers"
      showBack={true}
    >
      <div className="p-margin flex flex-col gap-3.5">
        {/* Route Query Context Pill */}
        <div className="bg-surface-container-high/60 border border-surface-container-highest p-3 rounded-2xl flex items-center justify-between text-xs">
          <div className="min-w-0 flex-1">
            <span className="text-outline block text-[10px]">Your Requested Corridor</span>
            <span className="font-bold text-on-surface truncate block">
              {originName.split(',')[0]} → DYPCOE
            </span>
            <span className="text-on-surface-variant text-[11px] mt-0.5 block">
              Target Arrival: {arrivalTime} AM • {selectedDays.join(', ')}
            </span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-primary font-bold text-xs hover:underline shrink-0 pl-2"
          >
            Edit
          </button>
        </div>

        {/* Success Alert Toast */}
        {requestSuccessMessage && (
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-xs text-primary font-semibold flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span className="flex-1">{requestSuccessMessage}</span>
          </div>
        )}

        {/* Filters Segment */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Verified Only Filter Toggle */}
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`min-h-[38px] px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              verifiedOnly
                ? 'bg-[#eff6ff] text-[#0047bf] border-[#0047bf]'
                : 'bg-surface-container-lowest text-on-surface-variant border-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Verified Only</span>
          </button>

          {/* Vehicle Filter */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-full text-xs border border-surface-container">
            {(['any', 'two_wheeler', 'car'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVehicleTypeFilter(v)}
                className={`min-h-[30px] px-2.5 rounded-full font-semibold capitalize transition-all ${
                  vehicleTypeFilter === v
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {v === 'any' ? 'All Vehicles' : v === 'two_wheeler' ? 'Bike' : 'Car'}
              </button>
            ))}
          </div>

          {/* Time Window Window */}
          <button
            onClick={() => setTimeWindowMin(timeWindowMin === 15 ? 30 : 15)}
            className="min-h-[38px] px-3 rounded-full text-xs font-semibold bg-surface-container-lowest text-on-surface border border-surface-container flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">timer</span>
            <span>±{timeWindowMin} min window</span>
          </button>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between pt-1">
          <span className="font-label-md text-xs font-bold text-on-surface">
            {filteredMatches.length} Compatible {filteredMatches.length === 1 ? 'Peer' : 'Peers'} Found
          </span>
          <span className="text-[11px] text-outline">Sorted by Route Overlap</span>
        </div>

        {/* Matches List or Empty State */}
        {filteredMatches.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredMatches.map((match) => (
              <RideCard
                key={match.id}
                match={match}
                onRequestRide={handleRequestRide}
                onViewDetails={handleViewDetails}
                isRequested={requestedMatchIds.has(match.id)}
              />
            ))}
          </div>
        ) : (
          /* TC-10: Strict No Matches Empty State - Never creates false matches */
          <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-8 text-center flex flex-col items-center gap-3 my-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
              <span className="material-symbols-outlined text-[32px]">minor_crash</span>
            </div>
            <h3 className="font-title-md text-base font-bold text-on-surface">
              No Suitable Route Match Right Now
            </h3>
            <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
              We strictly enforce a minimum 60% route overlap and a ±{timeWindowMin} minute arrival window to guarantee reliable carpooling. We'll automatically notify you when someone on your route joins!
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTimeWindowMin(30)}
                icon="schedule"
              >
                Expand Time Window to ±30 min
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/')}
                icon="restart_alt"
              >
                Adjust Pickup Location
              </Button>
            </div>
          </div>
        )}
      </div>
    </MobileShell>
  );
};
