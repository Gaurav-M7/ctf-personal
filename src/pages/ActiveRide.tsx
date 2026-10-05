import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { demoStore } from '../services/demoStore';
import { RequestStatus, RideRequest } from '../types';
import { MobileShell } from '../components/layout/MobileShell';
import { LeafletMapView } from '../components/map/LeafletMapView';
import { CallButton } from '../components/safety/CallButton';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

const STEPPER_STAGES: { key: RequestStatus; label: string; icon: string }[] = [
  { key: 'created', label: 'Created', icon: 'create' },
  { key: 'searching', label: 'Searching', icon: 'search' },
  { key: 'match_found', label: 'Match Found', icon: 'check' },
  { key: 'contacted', label: 'Contacted', icon: 'send' },
  { key: 'accepted', label: 'Accepted', icon: 'handshake' },
  { key: 'completed', label: 'Completed', icon: 'task_alt' },
];

export const ActiveRide: React.FC = () => {
  const { requestId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Find request from state or store
  const stateRequest = location.state?.request as RideRequest | undefined;
  const currentRequest =
    stateRequest || demoStore.getRideRequests().find((r) => r.id === requestId) || demoStore.getRideRequests()[0];

  const [shareLiveGps, setShareLiveGps] = useState(true);

  if (!currentUser || !currentRequest) {
    return (
      <div className="p-6 text-center">
        <p>No active ride found.</p>
        <Button onClick={() => navigate('/requests')} className="mt-4">
          View Requests
        </Button>
      </div>
    );
  }

  const isDriver = currentRequest.driver_id === currentUser.id;
  const peer = isDriver ? currentRequest.rider : currentRequest.driver;
  const route = currentRequest.route;

  // Compute active step index
  const currentStepIndex = STEPPER_STAGES.findIndex((s) => s.key === currentRequest.status);

  const handleMarkCompleted = () => {
    demoStore.updateRideRequestStatus(currentRequest.id, 'completed');
    navigate('/post-ride-rating', {
      state: { request: currentRequest },
    });
  };

  return (
    <MobileShell currentUser={currentUser} headerTitle="Ride Status & Route" showBack={true}>
      <div className="p-margin flex flex-col gap-4">
        {/* Status Stepper */}
        <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-3">
            Ride Lifecycle Progress
          </span>

          <div className="flex items-center justify-between relative px-2">
            {/* Background connecting bar */}
            <div className="absolute left-6 right-6 top-3 h-0.5 bg-surface-container -z-0" />

            {STEPPER_STAGES.map((stage, idx) => {
              const isPast = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={stage.key} className="flex flex-col items-center gap-1 z-10">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold transition-all ${
                      isCurrent
                        ? 'bg-primary-container text-on-primary ring-4 ring-primary/15'
                        : isPast
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-outline'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isPast ? 'check' : stage.icon}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-semibold text-center whitespace-nowrap ${
                      isCurrent ? 'text-primary font-bold' : isPast ? 'text-on-surface' : 'text-outline'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Route Map */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-surface-container relative">
          <LeafletMapView
            origin={[route.origin_lat, route.origin_lng]}
            routeCoordinates={route.polyline_coords}
            approximatePickupAreaName={currentRequest.approx_pickup_area}
            height="220px"
          />

          <div className="absolute bottom-2 left-2 right-2 bg-surface-container-lowest/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm flex items-center justify-between text-xs z-20">
            <div className="flex items-center gap-1.5 font-bold text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Ride En Route to DYPCOE</span>
            </div>
            <span className="text-on-surface-variant font-mono">
              ETA: {currentRequest.scheduled_time}
            </span>
          </div>
        </div>

        {/* Peer Profile & Unmasked Phone (Accepted Ride Contact Model) */}
        <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={peer.avatar_url}
                alt={peer.full_name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/20"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-title-md text-sm font-bold text-on-surface">
                    {peer.full_name}
                  </h3>
                  {peer.is_verified && (
                    <span className="text-[#0047bf] flex items-center" title="Verified">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                    </span>
                  )}
                </div>
                <span className="text-xs text-on-surface-variant">
                  {isDriver ? 'Your Passenger' : 'Your Driver'} • {peer.department}
                </span>
              </div>
            </div>

            <Badge variant="seats" icon="check_circle" size="sm">
              Ride Confirmed
            </Badge>
          </div>

          {/* Reveal unmasked phone and active Call button */}
          <CallButton
            phoneNumber={peer.phone_number}
            studentName={peer.full_name}
            status={currentRequest.status}
          />
        </div>

        {/* Live Location Sharing Privacy Setting Toggle (TC-08) */}
        <div className="p-3 bg-surface-container-low rounded-2xl border border-surface-container flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">my_location</span>
            <div>
              <strong className="text-on-surface block">Share Live GPS with Peer</strong>
              <span className="text-[11px] text-on-surface-variant">
                Auto-terminates when ride completes
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShareLiveGps(!shareLiveGps)}
            className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
              shareLiveGps ? 'bg-primary' : 'bg-outline-variant'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                shareLiveGps ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Action: Mark Ride Completed */}
        <div className="pt-2 flex flex-col gap-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleMarkCompleted}
            icon="task_alt"
          >
            Mark Ride as Completed
          </Button>
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => navigate('/requests')}
          >
            Back to Requests
          </Button>
        </div>
      </div>
    </MobileShell>
  );
};
