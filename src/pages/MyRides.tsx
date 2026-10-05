import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { demoStore } from '../services/demoStore';
import { MobileShell } from '../components/layout/MobileShell';
import { RequestCard } from '../components/rides/RequestCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const MyRides: React.FC = () => {
  const { currentUser } = useAuth();
  const { unreadCount, openNotifications } = useNotifications();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  const allRequests = useMemo(() => {
    return demoStore.getRideRequests();
  }, []);

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

  // Upcoming: status is accepted
  const upcomingRides = allRequests.filter(
    (r) =>
      (r.driver_id === currentUser.id || r.rider_id === currentUser.id) &&
      r.status === 'accepted'
  );

  // Completed: status is completed
  const completedRides = allRequests.filter(
    (r) =>
      (r.driver_id === currentUser.id || r.rider_id === currentUser.id) &&
      r.status === 'completed'
  );

  const totalShared = currentUser.total_rides || 18;
  const totalCo2 = currentUser.co2_saved_kg || 24.5;
  const totalKm = +(totalCo2 / 0.12).toFixed(1);

  return (
    <MobileShell
      currentUser={currentUser}
      unreadNotificationsCount={unreadCount}
      onOpenNotifications={openNotifications}
      headerTitle="My Rides"
    >
      <div className="p-margin flex flex-col gap-4">
        {/* Cumulative Eco Impact & Rides Stats */}
        <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-outline">
              My Campus Impact
            </span>
            <Badge variant="eco" icon="eco" size="sm">
              Eco Commuter
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-surface-container-low rounded-xl">
              <span className="text-[10px] text-outline block">Total Rides</span>
              <span className="font-title-md text-base font-bold text-primary">
                {totalShared}
              </span>
            </div>
            <div className="p-2.5 bg-surface-container-low rounded-xl">
              <span className="text-[10px] text-outline block">Distance Pooled</span>
              <span className="font-title-md text-base font-bold text-on-surface">
                {totalKm} km
              </span>
            </div>
            <div className="p-2.5 bg-secondary-fixed/40 rounded-xl">
              <span className="text-[10px] text-secondary font-semibold block">CO2 Saved</span>
              <span className="font-title-md text-base font-bold text-secondary">
                {totalCo2} kg
              </span>
            </div>
          </div>
        </div>

        {/* Segmented Upcoming vs Completed Tabs */}
        <div className="bg-surface-container-highest p-1 rounded-2xl flex items-center">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'upcoming'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Upcoming Rides</span>
            {upcomingRides.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-primary text-on-primary text-[10px]">
                {upcomingRides.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'completed'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Completed History</span>
            {completedRides.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-surface-container-high text-on-surface text-[10px]">
                {completedRides.length}
              </span>
            )}
          </button>
        </div>

        {/* List Content */}
        {activeTab === 'upcoming' ? (
          upcomingRides.length > 0 ? (
            <div className="flex flex-col gap-3">
              {upcomingRides.map((req) => (
                <RequestCard
                  key={req.id}
                  request={req}
                  currentUserId={currentUser.id}
                  onViewRideStatus={(r) =>
                    navigate(`/active-ride/${r.id}`, { state: { request: r } })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline">
                <span className="material-symbols-outlined text-[24px]">event_upcoming</span>
              </div>
              <h4 className="font-title-md text-sm font-bold text-on-surface">No Upcoming Rides</h4>
              <p className="text-xs text-on-surface-variant max-w-xs">
                You don't have any confirmed shared rides scheduled right now.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/')}
                className="mt-2"
                icon="search"
              >
                Find College Rides
              </Button>
            </div>
          )
        ) : completedRides.length > 0 ? (
          <div className="flex flex-col gap-3">
            {completedRides.map((req) => (
              <RequestCard key={req.id} request={req} currentUserId={currentUser.id} />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline">
              <span className="material-symbols-outlined text-[24px]">history</span>
            </div>
            <h4 className="font-title-md text-sm font-bold text-on-surface">No Completed Rides Yet</h4>
            <p className="text-xs text-on-surface-variant max-w-xs">
              When you finish trips to DYPCOE, your shared rides and CO2 savings history will appear here.
            </p>
          </div>
        )}
      </div>
    </MobileShell>
  );
};
