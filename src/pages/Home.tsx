import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { MobileShell } from '../components/layout/MobileShell';
import { NotificationModal } from '../components/common/NotificationModal';
import { Button } from '../components/common/Button';
import { StudentRole, VehicleType } from '../types';
import { DYPCOE_COORDINATES } from '../data/puneSeedData';
import { searchLocation } from '../services/routingService';

export const Home: React.FC = () => {
  const { currentUser, updateRole } = useAuth();
  const { unreadCount, openNotifications } = useNotifications();
  const navigate = useNavigate();

  // Search Parameters
  const [roleMode, setRoleMode] = useState<StudentRole>(currentUser?.role || 'need');
  const [originText, setOriginText] = useState('Datta Mandir Road, Wakad');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>({
    lat: 18.5987,
    lng: 73.7634,
  });
  const [arrivalTime, setArrivalTime] = useState('08:50');
  const [selectedDays, setSelectedDays] = useState<string[]>(['M', 'T', 'W', 'T', 'F']);
  const [vehicleFilter, setVehicleFilter] = useState<'any' | VehicleType>('any');

  // Search Autocomplete
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [suggestions, setSuggestions] = useState<{ name: string; lat: number; lng: number }[]>([]);

  // Geolocation once (TC-08: single shot, no continuous tracking)
  const [locatingGps, setLocatingGps] = useState(false);

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
        setOriginText('Current GPS Location (Wakad Corridor)');
        setLocatingGps(false);
      },
      (_err) => {
        // Fallback for demo in sandbox/laptop
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

  const handleSelectFrequentRoute = (name: string, lat: number, lng: number, time: string) => {
    setOriginText(name);
    setOriginCoords({ lat, lng });
    setArrivalTime(time);
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
        {/* Campus Security Banner */}
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

        {/* Role Toggle Segmented Control (Need vs Offer) */}
        <div className="px-margin mb-space-sm">
          <div className="bg-surface-container-highest p-1 rounded-2xl flex items-center shadow-inner relative">
            <button
              onClick={() => {
                setRoleMode('need');
                updateRole('need');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-1.5 transition-all ${
                roleMode === 'need'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">hail</span>
              <span>Need a Ride</span>
            </button>
            <button
              onClick={() => {
                setRoleMode('offer');
                updateRole('offer');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-1.5 transition-all ${
                roleMode === 'offer'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">directions_car</span>
              <span>Offer a Ride</span>
            </button>
          </div>

          <div className="flex justify-between items-center px-1 mt-1">
            <span className="font-label-sm text-label-sm text-outline">
              Swap anytime for afternoon returns
            </span>
            <span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
              20 Active Peers
            </span>
          </div>
        </div>

        {/* Route Preview Graphic Card */}
        <div className="px-margin mb-space-md">
          <div className="relative bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm">
            <div className="relative w-full h-36 bg-surface-container-low overflow-hidden">
              <svg
                className="absolute inset-0 w-full h-full opacity-60"
                fill="none"
                viewBox="0 0 400 150"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M-20 30 C 80 40, 140 20, 220 35 C 300 50, 360 30, 420 40" stroke="#CBD5E1" strokeLinecap="round" strokeWidth="8" />
                <path d="M-10 110 C 70 90, 160 120, 240 100 C 310 85, 370 120, 420 110" stroke="#CBD5E1" strokeLinecap="round" strokeWidth="6" />
                <path d="M80 -10 L 100 160" stroke="#E2E8F0" strokeWidth="5" />
                <path d="M260 -10 L 250 160" stroke="#E2E8F0" strokeWidth="5" />
                <path d="M340 -10 L 330 160" stroke="#E2E8F0" strokeWidth="4" />
                <path d="M 60 105 C 110 100, 160 70, 220 62 C 280 55, 310 48, 335 45" stroke="#005c55" strokeLinecap="round" strokeWidth="4" />
                <path d="M 60 105 C 110 100, 160 70, 220 62 C 280 55, 310 48, 335 45" stroke="#9cf2e8" strokeDasharray="6 6" strokeLinecap="round" strokeWidth="2" />
                <circle cx="60" cy="105" fill="#005c55" fillOpacity="0.15" r="14" />
                <circle cx="60" cy="105" fill="#005c55" r="6" />
                <circle cx="60" cy="105" fill="#ffffff" r="2.5" />
                <circle cx="335" cy="45" fill="#fea619" fillOpacity="0.25" r="16" />
                <circle cx="335" cy="45" fill="#fea619" r="8" />
              </svg>

              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                <div className="inline-flex items-center gap-1.5 bg-surface-container-lowest/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                    18 students matching on this corridor
                  </span>
                </div>
                <span className="bg-primary/90 backdrop-blur-md text-on-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold">
                  7.8 km • ~18 min
                </span>
              </div>

              <div className="absolute bottom-2 left-3 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="font-label-sm text-label-sm font-semibold text-on-surface truncate max-w-[130px]">
                  {originText.split(',')[0]}
                </span>
              </div>
              <div className="absolute bottom-2 right-3 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[13px] text-secondary">school</span>
                <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                  DYPCOE Campus
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Commute Booking Input Sheet Container */}
        <div className="px-margin mb-space-md">
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-md border border-surface-container">
            {/* Pickup & Drop Stepper Block */}
            <div className="flex flex-col gap-space-sm relative">
              <div className="absolute left-[19px] top-[34px] bottom-[34px] w-[2px] bg-outline-variant flex flex-col justify-between py-1">
                <span className="w-[2px] h-[3px] bg-primary"></span>
                <span className="w-[2px] h-[3px] bg-primary"></span>
                <span className="w-[2px] h-[3px] bg-secondary"></span>
              </div>

              {/* Origin Pickup Input */}
              <div className="relative">
                <div className="flex items-start gap-3 bg-surface-container-low p-2.5 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">trip_origin</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <label className="font-label-sm text-label-sm text-outline font-medium">Pickup Spot</label>
                      <button
                        type="button"
                        onClick={handleUseGpsOnce}
                        disabled={locatingGps}
                        className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-0.5 hover:underline"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {locatingGps ? 'sync' : 'my_location'}
                        </span>
                        <span>{locatingGps ? 'Locating...' : 'Current GPS'}</span>
                      </button>
                    </div>
                    <input
                      className="w-full bg-transparent font-title-md text-sm md:text-base text-on-surface font-semibold focus:outline-none truncate pt-0.5"
                      type="text"
                      value={originText}
                      onChange={(e) => handleOriginChange(e.target.value)}
                      placeholder="Enter pickup neighborhood..."
                    />
                    <span className="font-label-sm text-[11px] text-on-surface-variant truncate block">
                      Approximate neighborhood only (exact house address hidden)
                    </span>
                  </div>
                </div>

                {/* Suggestions drop */}
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

              {/* Destination Input (Preset Campus) */}
              <div className="flex items-start gap-3 bg-surface-container-low p-2.5 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-secondary/15 flex items-center justify-center shrink-0 mt-1">
                  <span className="material-symbols-outlined text-[18px] text-secondary">location_on</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <label className="font-label-sm text-label-sm text-outline font-medium">College Destination</label>
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      Default
                    </span>
                  </div>
                  <input
                    className="w-full bg-transparent font-title-md text-sm md:text-base text-on-surface font-semibold focus:outline-none truncate pt-0.5 cursor-default"
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

            {/* Target Arrival Window */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
                  Arrival Window at Campus
                </span>
                <span className="font-label-sm text-label-sm text-secondary font-bold bg-secondary-fixed/50 px-2 py-0.5 rounded-full">
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
                    <span className="block font-label-sm text-[11px] text-on-surface-variant">Recommended</span>
                    <span className="font-title-md text-sm font-bold text-primary">08:45 - 09:00 AM</span>
                  </div>
                  {arrivalTime === '08:50' && (
                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
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
                    <span className="block font-label-sm text-[11px] text-outline">Late Shift</span>
                    <span className="font-body-lg text-sm text-on-surface font-semibold">10:00 - 10:15 AM</span>
                  </div>
                  {arrivalTime === '10:00' && (
                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  )}
                </button>
              </div>
            </div>

            {/* Recurring Commute Days */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Commute Schedule</span>
                <span className="font-label-sm text-label-sm text-outline">Repeat Weekly</span>
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
                      className={`w-10 h-10 rounded-xl font-label-md text-xs font-bold flex items-center justify-center transition-all ${
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

            {/* Vehicle Mode Filter Segment (NO COST SPLIT / NO PRICES!) */}
            <div className="flex flex-col gap-1.5">
              <span className="font-label-md text-label-md text-on-surface font-semibold">Vehicle Mode Preference</span>
              <div className="grid grid-cols-3 gap-2 mt-0.5">
                <button
                  type="button"
                  onClick={() => setVehicleFilter('any')}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                    vehicleFilter === 'any'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] mb-0.5">commute</span>
                  <span className="font-label-md text-xs font-bold">Any Pool</span>
                  <span className="font-label-sm text-[10px] opacity-90">All available</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVehicleFilter('two_wheeler')}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                    vehicleFilter === 'two_wheeler'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-primary mb-0.5">two_wheeler</span>
                  <span className="font-label-md text-xs font-semibold">Bike / EV</span>
                  <span className="font-label-sm text-[10px] text-secondary font-bold">Quick transit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVehicleFilter('car')}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                    vehicleFilter === 'car'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-primary mb-0.5">directions_car</span>
                  <span className="font-label-md text-xs font-semibold">Car Pool</span>
                  <span className="font-label-sm text-[10px] text-secondary font-bold">Spacious</span>
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleFindMatches}
              icon="search"
              iconRight="arrow_forward"
            >
              Find College Matches
            </Button>

            {/* Reassurance Microcopy */}
            <div className="flex items-center justify-center gap-1.5 text-center px-2">
              <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
              <span className="font-label-sm text-xs text-on-surface-variant">
                Only verified DYPCOE batchmates can view your commute requests
              </span>
            </div>
          </div>
        </div>

        {/* Frequent Batchmate Corridors Quick Tap */}
        <div className="px-margin mb-space-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-headline-sm text-base text-on-surface font-semibold">
              Frequent Corridors
            </span>
            <span className="text-xs text-primary font-semibold">Quick Select</span>
          </div>

          <div className="flex flex-col gap-2">
            {[
              {
                title: 'Hinjawadi Ph 1 → DYPCOE',
                name: 'Shivaji Chowk, Hinjawadi Phase 1',
                lat: 18.5913,
                lng: 73.7389,
                time: '08:40',
                drivers: '4 Drivers',
              },
              {
                title: 'Wakad Flyover → DYPCOE',
                name: 'Datta Mandir Road, Wakad',
                lat: 18.5987,
                lng: 73.7634,
                time: '08:50',
                drivers: '7 Drivers',
              },
              {
                title: 'Ravet Basket Bridge → DYPCOE',
                name: 'Basket Bridge Corner, Ravet',
                lat: 18.6534,
                lng: 73.7370,
                time: '09:05',
                drivers: '5 Drivers',
              },
            ].map((routeItem, idx) => (
              <div
                key={idx}
                onClick={() =>
                  handleSelectFrequentRoute(
                    routeItem.name,
                    routeItem.lat,
                    routeItem.lng,
                    routeItem.time
                  )
                }
                className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container flex items-center justify-between gap-space-sm hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[22px]">history</span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-label-lg text-sm font-bold text-on-surface truncate block">
                      {routeItem.title}
                    </span>
                    <span className="text-xs text-on-surface-variant block mt-0.5">
                      Morning {routeItem.time} AM • Direct Route
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-label-sm text-xs bg-surface-container-high text-primary px-2.5 py-1 rounded-full font-semibold">
                    {routeItem.drivers}
                  </span>
                  <span className="material-symbols-outlined text-outline text-[20px]">chevron_right</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Batchmates Social Proof */}
        <div className="px-margin mb-space-lg">
          <div className="bg-surface-container-low rounded-2xl p-space-md flex items-center gap-space-md border border-surface-container">
            <div className="flex -space-x-2 shrink-0">
              <img
                className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-white"
                alt="Student Rohan"
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80"
              />
              <img
                className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-white"
                alt="Student Sneha"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
              />
              <img
                className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-white"
                alt="Student Aditya"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-label-sm text-xs text-on-surface leading-tight font-medium">
                <strong className="font-bold text-primary">Rohan, Sneha & 18 batchmates</strong> are
                departing from Wakad & Ravet between 8:40 and 9:05 AM.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MobileShell>
  );
};
