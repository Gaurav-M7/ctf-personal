import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { demoStore } from '../services/demoStore';
import { MobileShell } from '../components/layout/MobileShell';
import { NotificationModal } from '../components/common/NotificationModal';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StudentRole, VehicleType, Route } from '../types';
import { DYPCOE_COORDINATES } from '../data/puneSeedData';
import { searchLocation, fetchRouteGeometry } from '../services/routingService';

export const Home: React.FC = () => {
  const { currentUser, updateRole } = useAuth();
  const { unreadCount, openNotifications } = useNotifications();
  const navigate = useNavigate();

  // Mode: 'search_post' (Plan / Post your ride) vs 'community_feed' (Browse rides posted by others)
  const [viewMode, setViewMode] = useState<'search_post' | 'community_feed'>('search_post');

  // Search & Post Parameters
  const [roleMode, setRoleMode] = useState<StudentRole>(currentUser?.role || 'need');
  const [originText, setOriginText] = useState('Datta Mandir Road, Wakad');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>({
    lat: 18.5987,
    lng: 73.7634,
  });
  const [arrivalTime, setArrivalTime] = useState('08:50');
  const [selectedDays, setSelectedDays] = useState<string[]>(['M', 'T', 'W', 'T', 'F']);
  const [vehicleFilter, setVehicleFilter] = useState<'any' | VehicleType>('any');
  const [seatsAvailable, setSeatsAvailable] = useState<number>(
    currentUser?.vehicle?.available_seats || 2
  );

  // Autocomplete & GPS
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [suggestions, setSuggestions] = useState<{ name: string; lat: number; lng: number }[]>([]);
  const [locatingGps, setLocatingGps] = useState(false);

  // Status / Feedback
  const [postFeedback, setPostFeedback] = useState<string | null>(null);
  const [postingLoading, setPostingLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Community Feed Filters
  const [feedCategoryFilter, setFeedCategoryFilter] = useState<'all' | 'offer' | 'need'>('all');
  const [feedSearchArea, setFeedSearchArea] = useState('');

  // Fetch all active routes
  const allRoutes = useMemo(() => {
    return demoStore.getRoutes();
  }, [refreshTrigger]);

  // Feed routes: posted by OTHER students (or all routes)
  const communityRoutes = useMemo(() => {
    return allRoutes.filter((r) => {
      // Category filter
      if (feedCategoryFilter === 'offer' && r.role !== 'offer' && r.role !== 'both') return false;
      if (feedCategoryFilter === 'need' && r.role !== 'need' && r.role !== 'both') return false;
      // Area search
      if (feedSearchArea.trim() && !r.origin_name.toLowerCase().includes(feedSearchArea.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [allRoutes, feedCategoryFilter, feedSearchArea]);

  const handleUseGpsOnce = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOriginCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setOriginText('Current GPS Location (Wakad/PCMC Corridor)');
        setLocatingGps(false);
      },
      (_err) => {
        setOriginCoords({ lat: 18.5987, lng: 73.7634 });
        setOriginText('Near Hinjawadi Bridge, Wakad');
        setLocatingGps(false);
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  };

  const handleOriginChange = async (val: string) => {
    setOriginText(val);
    if (val.length > 2) {
      setIsSearchingOrigin(true);
      const results = await searchLocation(val);
      setSuggestions(results);
    } else {
      setSuggestions([]);
      setIsSearchingOrigin(false);
    }
  };

  const handleSelectSuggestion = (item: { name: string; lat: number; lng: number }) => {
    setOriginText(item.name);
    setOriginCoords({ lat: item.lat, lng: item.lng });
    setSuggestions([]);
    setIsSearchingOrigin(false);
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // 1. Find Matches Action
  const handleFindMatches = () => {
    navigate('/matches', {
      state: {
        role: roleMode,
        originName: originText,
        originLat: originCoords.lat,
        originLng: originCoords.lng,
        arrivalTime,
        selectedDays,
        vehicleFilter,
      },
    });
  };

  // 2. Post Route to Campus Feed Action
  const handlePostRoute = async () => {
    if (!currentUser) return;
    setPostingLoading(true);

    try {
      const geometry = await fetchRouteGeometry(
        originCoords.lat,
        originCoords.lng,
        DYPCOE_COORDINATES.latitude,
        DYPCOE_COORDINATES.longitude
      );

      const newRoute: Omit<Route, 'id'> = {
        student_id: currentUser.id,
        student_name: currentUser.full_name,
        student_department: currentUser.department,
        student_year: currentUser.year,
        student_is_verified: currentUser.is_verified,
        student_avatar: currentUser.avatar_url,
        role: roleMode,
        origin_name: originText,
        origin_lat: originCoords.lat,
        origin_lng: originCoords.lng,
        destination_name: DYPCOE_COORDINATES.name,
        destination_lat: DYPCOE_COORDINATES.latitude,
        destination_lng: DYPCOE_COORDINATES.longitude,
        polyline_coords: geometry.coordinates,
        distance_km: geometry.distanceKm,
        duration_min: geometry.durationMin,
        arrival_time: arrivalTime,
        arrival_window_min: 15,
        days_of_week: selectedDays,
        vehicle_type: currentUser.vehicle?.vehicle_type || 'two_wheeler',
        vehicle_model: currentUser.vehicle?.model_name,
        seats_available: roleMode !== 'need' ? seatsAvailable : undefined,
        is_active: true,
      };

      demoStore.addRoute(newRoute);
      setRefreshTrigger((prev) => prev + 1);

      setPostFeedback('Your commute route has been posted to the Campus Board!');
      setTimeout(() => setPostFeedback(null), 4000);
      setViewMode('community_feed');
    } catch (e) {
      alert('Could not post route. Please try again.');
    } finally {
      setPostingLoading(false);
    }
  };

  const handleRequestPostedRide = (route: Route) => {
    if (!currentUser) return;

    const studentOwner = demoStore.getStudentById(route.student_id);
    const driver = route.role === 'offer' || route.role === 'both' ? (studentOwner || currentUser) : currentUser;
    const rider = route.role === 'offer' || route.role === 'both' ? currentUser : (studentOwner || currentUser);

    demoStore.createRideRequest({
      match_id: `direct-${route.id}`,
      rider_id: rider.id,
      driver_id: driver.id,
      rider: rider,
      driver: driver,
      route: route,
      scheduled_date: 'Tomorrow',
      scheduled_time: route.arrival_time,
      approx_pickup_area: route.origin_name.split(',')[0],
      status: 'contacted',
    });

    setPostFeedback(`Request sent to ${route.student_name || 'student'}! Check your Requests tab.`);
    setTimeout(() => setPostFeedback(null), 4000);
  };

  const handleDeleteMyRoute = (routeId: string) => {
    demoStore.deleteRoute(routeId);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <MobileShell
      currentUser={currentUser}
      unreadNotificationsCount={unreadCount}
      onOpenNotifications={openNotifications}
      headerTitle="CampusRide"
    >
      <NotificationModal />

      <div className="flex flex-col w-full">
        {/* Security Banner */}
        <div className="px-margin pt-space-xs pb-space-sm">
          <div className="flex items-center justify-between gap-space-sm bg-surface-container-high px-space-md py-2.5 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="material-symbols-outlined text-[18px] text-primary shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
              <span className="font-label-md text-label-md text-primary truncate font-semibold">
                DYPCOE Exclusive • 100% ID Verified
              </span>
            </div>
            <div className="flex items-center gap-1 bg-surface-container-lowest px-2 py-0.5 rounded-full shrink-0">
              <span className="material-symbols-outlined text-[13px] text-primary">lock</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Safe Zone</span>
            </div>
          </div>
        </div>

        {/* Top View Mode Switcher: Plan Route vs Browse Posted Rides */}
        <div className="px-margin mb-3">
          <div className="bg-surface-container-highest p-1 rounded-2xl flex items-center shadow-inner">
            <button
              onClick={() => setViewMode('search_post')}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                viewMode === 'search_post'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
              <span>My Route / Post</span>
            </button>
            <button
              onClick={() => setViewMode('community_feed')}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                viewMode === 'community_feed'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">forum</span>
              <span>Browse Campus Rides ({allRoutes.length})</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {postFeedback && (
          <div className="mx-margin mb-3 p-3 bg-primary/10 border border-primary/30 rounded-xl text-xs text-primary font-bold flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span className="flex-1">{postFeedback}</span>
          </div>
        )}

        {/* VIEW 1: PLAN, ENTER ORIGIN & POST MY RIDE */}
        {viewMode === 'search_post' ? (
          <>
            {/* Role Toggle Segmented Control (Need vs Offer) */}
            <div className="px-margin mb-space-sm">
              <div className="bg-surface-container-high p-1 rounded-2xl flex items-center shadow-inner relative">
                <button
                  onClick={() => {
                    setRoleMode('need');
                    updateRole('need');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl font-label-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    roleMode === 'need'
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">hail</span>
                  <span>I Need a Ride</span>
                </button>
                <button
                  onClick={() => {
                    setRoleMode('offer');
                    updateRole('offer');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl font-label-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    roleMode === 'offer'
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">directions_car</span>
                  <span>I Can Offer a Ride</span>
                </button>
              </div>
            </div>

            {/* Commute Booking & Posting Input Sheet */}
            <div className="px-margin mb-space-md">
              <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-md border border-surface-container">
                {/* Stepper block: Origin -> Destination */}
                <div className="flex flex-col gap-space-sm relative">
                  <div className="absolute left-[19px] top-[34px] bottom-[34px] w-[2px] bg-outline-variant flex flex-col justify-between py-1">
                    <span className="w-[2px] h-[3px] bg-primary"></span>
                    <span className="w-[2px] h-[3px] bg-primary"></span>
                    <span className="w-[2px] h-[3px] bg-secondary"></span>
                  </div>

                  {/* Origin Pickup Input ("where is he coming from") */}
                  <div className="relative">
                    <div className="flex items-start gap-3 bg-surface-container-low p-2.5 rounded-xl border border-surface-container">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                        <span className="material-symbols-outlined text-[16px] text-primary">trip_origin</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <label className="font-label-sm text-xs font-bold text-on-surface">
                            Where are you coming from?
                          </label>
                          <button
                            type="button"
                            onClick={handleUseGpsOnce}
                            disabled={locatingGps}
                            className="font-label-sm text-[11px] text-primary font-semibold flex items-center gap-0.5 hover:underline"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {locatingGps ? 'sync' : 'my_location'}
                            </span>
                            <span>{locatingGps ? 'Locating...' : 'Use Current GPS'}</span>
                          </button>
                        </div>
                        <input
                          className="w-full bg-transparent font-title-md text-sm md:text-base text-on-surface font-semibold focus:outline-none truncate pt-1"
                          type="text"
                          value={originText}
                          onChange={(e) => handleOriginChange(e.target.value)}
                          placeholder="e.g. Wakad, Ravet, Hinjawadi, Pimple Saudagar..."
                        />
                        <span className="font-label-sm text-[10px] text-outline truncate block mt-0.5">
                          Approximate neighborhood only (exact house address stays private)
                        </span>
                      </div>
                    </div>

                    {/* Suggestions dropdown */}
                    {isSearchingOrigin && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-30 bg-surface-container-lowest border border-surface-container rounded-xl shadow-lg mt-1 overflow-hidden">
                        {suggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectSuggestion(item)}
                            className="p-2.5 text-xs text-on-surface hover:bg-surface-container-low cursor-pointer flex items-center gap-2 border-b border-surface-container/40 last:border-0"
                          >
                            <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                            <span className="truncate">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Destination Input (Default Campus) */}
                  <div className="flex items-start gap-3 bg-surface-container-low p-2.5 rounded-xl border border-surface-container">
                    <div className="w-7 h-7 rounded-full bg-secondary/15 flex items-center justify-center shrink-0 mt-1">
                      <span className="material-symbols-outlined text-[18px] text-secondary">location_on</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <label className="font-label-sm text-xs font-bold text-on-surface">
                          Campus Destination
                        </label>
                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                          Default
                        </span>
                      </div>
                      <input
                        className="w-full bg-transparent font-title-md text-sm md:text-base text-on-surface font-semibold focus:outline-none truncate pt-1 cursor-default"
                        readOnly
                        type="text"
                        value={DYPCOE_COORDINATES.name}
                      />
                      <span className="font-label-sm text-[11px] text-on-surface-variant truncate block">
                        {DYPCOE_COORDINATES.address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target Arrival Time Window */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
                      Target Arrival at DYPCOE
                    </span>
                    <span className="font-label-sm text-[10px] text-secondary font-bold bg-secondary-fixed/50 px-2 py-0.5 rounded-full">
                      Lectures 9:15 AM
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setArrivalTime('08:50')}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left border ${
                        arrivalTime === '08:50'
                          ? 'bg-surface-container-high border-primary/30'
                          : 'bg-surface-container-low border-transparent'
                      }`}
                    >
                      <div>
                        <span className="block text-[10px] text-on-surface-variant">Recommended</span>
                        <span className="font-title-md text-xs font-bold text-primary">08:45 - 09:00 AM</span>
                      </div>
                      {arrivalTime === '08:50' && (
                        <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setArrivalTime('10:00')}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left border ${
                        arrivalTime === '10:00'
                          ? 'bg-surface-container-high border-primary/30'
                          : 'bg-surface-container-low border-transparent'
                      }`}
                    >
                      <div>
                        <span className="block text-[10px] text-outline">Late Shift</span>
                        <span className="text-xs text-on-surface font-semibold">10:00 - 10:15 AM</span>
                      </div>
                      {arrivalTime === '10:00' && (
                        <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Commute Days */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-xs font-bold text-on-surface">Commute Schedule</span>
                    <span className="font-label-sm text-[11px] text-outline">Repeat Weekly</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    {['M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                      const dayKey = `${day}-${i}`;
                      const isSelected = selectedDays.includes(day);
                      return (
                        <button
                          key={dayKey}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`w-9 h-9 rounded-xl font-label-md text-xs font-bold flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-primary text-on-primary shadow-sm'
                              : 'bg-surface-container text-on-surface-variant font-medium'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* If Offering: Available Seats Selector */}
                {roleMode !== 'need' && (
                  <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-xl border border-surface-container text-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">event_seat</span>
                      <span className="font-semibold text-on-surface">Available Seats to Offer</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setSeatsAvailable(num)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            seatsAvailable === num
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container-highest text-on-surface-variant'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Two Main Actions: Find Matches OR Post to Campus Feed */}
                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleFindMatches}
                    icon="search"
                    iconRight="arrow_forward"
                  >
                    Find Matching Students
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    fullWidth
                    loading={postingLoading}
                    onClick={handlePostRoute}
                    icon="add_circle"
                  >
                    {roleMode === 'need' ? 'Post My Need to Campus Feed' : 'Post My Ride to Campus Feed'}
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-center px-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                  <span className="font-label-sm text-xs text-on-surface-variant">
                    Only verified DYPCOE batchmates can view your commute requests
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* VIEW 2: BROWSE RIDES POSTED BY OTHER STUDENTS */
          <div className="px-margin flex flex-col gap-3">
            {/* Feed Category Tabs & Search Bar */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-full text-xs border border-surface-container">
                <button
                  onClick={() => setFeedCategoryFilter('all')}
                  className={`flex-1 py-1.5 px-3 rounded-full font-bold transition-all ${
                    feedCategoryFilter === 'all'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  All Rides ({allRoutes.length})
                </button>
                <button
                  onClick={() => setFeedCategoryFilter('offer')}
                  className={`flex-1 py-1.5 px-3 rounded-full font-bold transition-all ${
                    feedCategoryFilter === 'offer'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Offered by Drivers
                </button>
                <button
                  onClick={() => setFeedCategoryFilter('need')}
                  className={`flex-1 py-1.5 px-3 rounded-full font-bold transition-all ${
                    feedCategoryFilter === 'need'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Requested by Peers
                </button>
              </div>

              {/* Area search filter */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter by origin area (e.g. Wakad, Ravet, Nigdi)..."
                  value={feedSearchArea}
                  onChange={(e) => setFeedSearchArea(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-3 bg-surface-container-lowest rounded-xl text-xs text-on-surface border border-surface-container outline-none"
                />
                <span className="material-symbols-outlined text-[18px] text-outline absolute left-2.5 top-3">
                  search
                </span>
                {feedSearchArea && (
                  <button
                    onClick={() => setFeedSearchArea('')}
                    className="absolute right-2.5 top-3 text-outline text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* List of Community Rides */}
            {communityRoutes.length > 0 ? (
              <div className="flex flex-col gap-3">
                {communityRoutes.map((route) => {
                  const isOwn = currentUser && route.student_id === currentUser.id;

                  return (
                    <div
                      key={route.id}
                      className="bg-surface-container-lowest border border-surface-container rounded-2xl p-4 shadow-sm flex flex-col gap-2.5"
                    >
                      {/* Posted by Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {route.student_avatar ? (
                            <img
                              src={route.student_avatar}
                              alt="Avatar"
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                              {route.student_name ? route.student_name.charAt(0) : 'S'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-label-lg text-xs font-bold text-on-surface truncate">
                                {route.student_name || 'DYPCOE Student'}
                              </span>
                              {route.student_is_verified && (
                                <span className="text-[#0047bf] flex items-center" title="Verified">
                                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    verified
                                  </span>
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-on-surface-variant truncate block">
                              {route.student_department ? `${route.student_department.split('&')[0]} • ${route.student_year || ''}` : 'AI & Data Science'}
                            </span>
                          </div>
                        </div>

                        {route.role === 'offer' || route.role === 'both' ? (
                          <Badge variant="seats" icon="directions_car" size="sm">
                            Offering Ride
                          </Badge>
                        ) : (
                          <Badge variant="neutral" icon="hail" size="sm">
                            Seeking Ride
                          </Badge>
                        )}
                      </div>

                      {/* Corridor summary */}
                      <div className="bg-surface-container-low p-2.5 rounded-xl text-xs flex flex-col gap-1 border border-surface-container/60">
                        <div className="flex items-center gap-1.5 text-on-surface font-semibold truncate">
                          <span className="material-symbols-outlined text-[16px] text-primary">trip_origin</span>
                          <span className="truncate">{route.origin_name}</span>
                          <span className="text-outline">→</span>
                          <span className="truncate text-secondary">DYPCOE Campus</span>
                        </div>
                        <div className="flex items-center gap-2 text-on-surface-variant text-[11px] mt-0.5">
                          <span>Target Arrival: <strong>{route.arrival_time} AM</strong></span>
                          <span>•</span>
                          <span>Days: {route.days_of_week.join(', ')}</span>
                        </div>
                      </div>

                      {/* Footer Info & Actions */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 text-xs">
                          {route.seats_available ? (
                            <span className="text-primary font-bold">
                              {route.seats_available} {route.seats_available === 1 ? 'seat' : 'seats'} open
                            </span>
                          ) : (
                            <span className="text-outline text-[11px]">1 passenger</span>
                          )}
                          {route.vehicle_model && (
                            <span className="text-[11px] text-outline">
                              • {route.vehicle_model}
                            </span>
                          )}
                        </div>

                        {isOwn ? (
                          <button
                            onClick={() => handleDeleteMyRoute(route.id)}
                            className="text-xs text-error font-bold hover:underline flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                            <span>Remove Post</span>
                          </button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleRequestPostedRide(route)}
                            icon="hail"
                          >
                            Request Ride
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty state for Community Rides Feed */
              <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-8 text-center flex flex-col items-center gap-3 my-2 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined text-[28px]">directions_car</span>
                </div>
                <h4 className="font-title-md text-sm font-bold text-on-surface">
                  No Rides Posted Yet
                </h4>
                <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
                  No students have posted active commute routes on this filter yet. Be the first to enter where you are coming from and post your route!
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setViewMode('search_post')}
                  icon="add_circle"
                  className="mt-1"
                >
                  Post Where I Am Coming From
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </MobileShell>
  );
};
