import React from 'react';
import { RideRequest } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { CallButton } from '../safety/CallButton';

interface RequestCardProps {
  request: RideRequest;
  currentUserId: string;
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  onViewRideStatus?: (request: RideRequest) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  currentUserId,
  onAccept,
  onDecline,
  onViewRideStatus,
}) => {
  const isDriver = request.driver_id === currentUserId;
  const peer = isDriver ? request.rider : request.driver;
  const isIncoming = isDriver && request.status === 'contacted';

  const getStatusBadge = () => {
    switch (request.status) {
      case 'accepted':
        return <Badge variant="seats" icon="check_circle">Accepted</Badge>;
      case 'declined':
        return <Badge variant="rejected" icon="cancel">Declined</Badge>;
      case 'completed':
        return <Badge variant="eco" icon="task_alt">Completed</Badge>;
      case 'contacted':
        return <Badge variant="pending" icon="pending">Pending Approval</Badge>;
      default:
        return <Badge variant="neutral">{request.status}</Badge>;
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-4 shadow-sm flex flex-col gap-3">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            {peer.avatar_url ? (
              <img
                src={peer.avatar_url}
                alt={peer.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {peer.full_name.charAt(0)}
              </div>
            )}
            {peer.is_verified && (
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0047bf] text-white flex items-center justify-center ring-2 ring-white"
                title="DYPCOE Verified Student"
              >
                <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-label-lg text-sm font-bold text-on-surface truncate">
              {peer.full_name}
            </h4>
            <p className="text-xs text-on-surface-variant truncate">
              {isDriver ? 'Passenger' : 'Driver'} • {peer.department}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Corridor Summary */}
      <div className="bg-surface-container-low p-2.5 rounded-xl text-xs flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-on-surface font-semibold truncate">
          <span className="material-symbols-outlined text-[16px] text-primary">trip_origin</span>
          <span>{request.approx_pickup_area}</span>
          <span className="text-outline">→</span>
          <span className="truncate">DYPCOE Akurdi</span>
        </div>
        <div className="flex items-center gap-3 text-on-surface-variant text-[11px] mt-0.5">
          <span>Date: {request.scheduled_date}</span>
          <span>•</span>
          <span>Arrival: {request.scheduled_time}</span>
        </div>
      </div>

      {/* Contact Model (Replaces Chat) */}
      <CallButton
        phoneNumber={peer.phone_number}
        studentName={peer.full_name}
        status={request.status}
      />

      {/* Action Controls */}
      {isIncoming && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDecline?.(request.id)}
            icon="close"
          >
            Decline
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onAccept?.(request.id)}
            icon="check"
          >
            Accept Request
          </Button>
        </div>
      )}

      {request.status === 'accepted' && onViewRideStatus && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewRideStatus(request)}
          icon="route"
          fullWidth
        >
          View Active Ride Status
        </Button>
      )}
    </div>
  );
};
