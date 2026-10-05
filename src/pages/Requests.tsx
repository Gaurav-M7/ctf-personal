import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { demoStore } from '../services/demoStore';
import { RideRequest } from '../types';
import { MobileShell } from '../components/layout/MobileShell';
import { RequestCard } from '../components/rides/RequestCard';
import { Button } from '../components/common/Button';

export const Requests: React.FC = () => {
  const { currentUser } = useAuth();
  const { unreadCount, openNotifications } = useNotifications();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'past'>('incoming');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const allRequests = useMemo(() => {
    return demoStore.getRideRequests();
  }, [refreshTrigger]);

  if (!currentUser) {
    return (
      <div className="p-6 text-center">
        <p>Please log in.</p>
        <Button onClick={() => navigate('/auth')} className="mt-4">
          Go to Login
        </Button>
      </div>
    );
  }

  // Incoming: Current user is the driver, status is contacted or accepted
  const incomingRequests = allRequests.filter(
    (r) => r.driver_id === currentUser.id && (r.status === 'contacted' || r.status === 'accepted')
  );

  // Outgoing: Current user is the rider, status is contacted or accepted
  const outgoingRequests = allRequests.filter(
    (r) => r.rider_id === currentUser.id && (r.status === 'contacted' || r.status === 'accepted')
  );

  // Past: Declined or completed
  const pastRequests = allRequests.filter(
    (r) =>
      (r.driver_id === currentUser.id || r.rider_id === currentUser.id) &&
      (r.status === 'declined' || r.status === 'completed')
  );

  const handleAccept = (requestId: string) => {
    demoStore.updateRideRequestStatus(requestId, 'accepted');
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDecline = (requestId: string) => {
    demoStore.updateRideRequestStatus(requestId, 'declined');
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleViewRideStatus = (request: RideRequest) => {
    navigate(`/active-ride/${request.id}`, { state: { request } });
  };

  const displayedList =
    activeTab === 'incoming'
      ? incomingRequests
      : activeTab === 'outgoing'
      ? outgoingRequests
      : pastRequests;

  return (
    <MobileShell
      currentUser={currentUser}
      unreadNotificationsCount={unreadCount}
      onOpenNotifications={openNotifications}
      headerTitle="Ride Requests"
    >
      <div className="p-margin flex flex-col gap-3.5">
        {/* Segmented Control */}
        <div className="bg-surface-container-highest p-1 rounded-2xl flex items-center">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'incoming'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Incoming</span>
            {incomingRequests.filter((r) => r.status === 'contacted').length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-primary text-on-primary text-[10px]">
                {incomingRequests.filter((r) => r.status === 'contacted').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('outgoing')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'outgoing'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Outgoing</span>
            {outgoingRequests.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-surface-container-high text-on-surface text-[10px]">
                {outgoingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'past'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Past / History
          </button>
        </div>

        {/* Informative Contact Model Header */}
        <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex items-center gap-2.5 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-primary text-[18px] shrink-0">call</span>
          <div>
            <strong className="text-on-surface block">Direct Phone Contact Model</strong>
            <span>
              Phone numbers unmask with a direct Call button once a ride is accepted by both parties.
            </span>
          </div>
        </div>

        {/* Requests List */}
        {displayedList.length > 0 ? (
          <div className="flex flex-col gap-3">
            {displayedList.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                currentUserId={currentUser.id}
                onAccept={handleAccept}
                onDecline={handleDecline}
                onViewRideStatus={handleViewRideStatus}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center flex flex-col items-center gap-2.5">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline">
              <span className="material-symbols-outlined text-[24px]">swap_horiz</span>
            </div>
            <h4 className="font-title-md text-sm font-bold text-on-surface">
              No {activeTab} requests
            </h4>
            <p className="text-xs text-on-surface-variant max-w-xs">
              {activeTab === 'incoming'
                ? "You don't have any incoming ride requests from batchmates right now."
                : activeTab === 'outgoing'
                ? "You haven't requested any rides yet. Search for matching drivers on the Home screen!"
                : 'No past ride history recorded yet.'}
            </p>
            {activeTab === 'outgoing' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/')}
                className="mt-2"
                icon="search"
              >
                Find College Rides
              </Button>
            )}
          </div>
        )}
      </div>
    </MobileShell>
  );
};
