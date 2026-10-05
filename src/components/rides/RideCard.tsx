import React from 'react';
import { RouteTimeline } from './RouteTimeline';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { MatchResult } from '../../types';

interface RideCardProps {
  match: MatchResult;
  onRequestRide: (match: MatchResult) => void;
  onViewDetails: (match: MatchResult) => void;
  isRequested?: boolean;
}

export const RideCard: React.FC<RideCardProps> = ({
  match,
  onRequestRide,
  onViewDetails,
  isRequested = false,
}) => {
  const driver = match.offer_student;
  const route = match.offer_route;
  const vehicle = driver.vehicle;

  const vehicleIcon = vehicle?.vehicle_type === 'two_wheeler' ? 'two_wheeler' : 'directions_car';
  const availableSeats = vehicle?.available_seats ?? 1;

  const timeDiffText = match.time_diff_min === 0 
    ? 'Exact match' 
    : match.time_diff_min > 0 
      ? `+${match.time_diff_min} min` 
      : `${match.time_diff_min} min`;

  return (
    <div className="bg-surface-container-lowest border border-surface-container-high/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {driver.avatar_url ? (
              <img
                src={driver.avatar_url}
                alt={driver.full_name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-surface-container"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {driver.full_name.charAt(0)}
              </div>
            )}
            {driver.is_verified && (
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0047bf] text-white flex items-center justify-center ring-2 ring-white"
                title="DYPCOE Verified Student"
              >
                <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-label-lg text-sm font-bold text-on-surface truncate">
                {driver.full_name}
              </span>
              {driver.rating && (
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-secondary">
                  <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  {driver.rating.toFixed(1)}
                </span>
              )}
            </div>
            <span className="text-xs text-on-surface-variant truncate block">
              {driver.department} • {driver.year}
            </span>
          </div>
        </div>

        {/* Vehicle Type Icon Pill */}
        <div className="flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-lg text-on-surface-variant text-xs shrink-0">
          <span className="material-symbols-outlined text-[16px] text-primary">
            {vehicleIcon}
          </span>
          <span className="capitalize font-medium text-[11px]">
            {vehicle?.vehicle_type === 'two_wheeler' ? 'Bike' : 'Car'}
          </span>
        </div>
      </div>

      {/* Stepped Route Timeline */}
      <RouteTimeline
        originName={route.origin_name}
        arrivalTime={route.arrival_time}
        timeDiff={timeDiffText}
      />

      {/* Corridor overlap & Seats Bar (NO PRICE, REPLACED BY SEATS + OVERLAP %) */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-surface-container/60">
        <div className="flex items-center gap-1.5">
          <Badge variant="match" icon="route" size="sm">
            {Math.round(match.route_match_pct)}% Route Match
          </Badge>
          <Badge variant="seats" icon="event_seat" size="sm">
            {availableSeats} {availableSeats === 1 ? 'seat' : 'seats'} left
          </Badge>
        </div>

        <span className="text-[11px] font-semibold text-on-surface-variant">
          {route.distance_km} km • ~{route.duration_min} min
        </span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(match)}
          icon="visibility"
        >
          Details
        </Button>

        <Button
          variant="primary"
          size="sm"
          disabled={isRequested}
          onClick={() => onRequestRide(match)}
          icon={isRequested ? 'done' : 'hail'}
        >
          {isRequested ? 'Requested' : 'Request Ride'}
        </Button>
      </div>
    </div>
  );
};
