import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MobileShell } from '../components/layout/MobileShell';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { StudentRole, VehicleType } from '../types';
import { SEED_STUDENTS } from '../data/puneSeedData';

export const Profile: React.FC = () => {
  const { currentUser, updateRole, updateProfile, switchDemoUser, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone_number || '');
  const [role, setRole] = useState<StudentRole>(currentUser?.role || 'need');

  // Vehicle state
  const [vehicleType, setVehicleType] = useState<VehicleType>(
    currentUser?.vehicle?.vehicle_type || 'two_wheeler'
  );
  const [modelName, setModelName] = useState(currentUser?.vehicle?.model_name || '');
  const [plateNumber, setPlateNumber] = useState(currentUser?.vehicle?.plate_number || '');
  const [seats, setSeats] = useState(currentUser?.vehicle?.available_seats || 1);

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

  const handleSaveProfile = () => {
    updateProfile({
      full_name: fullName,
      phone_number: phone,
      role: role,
      vehicle:
        role !== 'need' && modelName
          ? {
              id: currentUser.vehicle?.id || `veh-${Date.now()}`,
              student_id: currentUser.id,
              vehicle_type: vehicleType,
              model_name: modelName,
              plate_number: plateNumber,
              total_seats: seats,
              available_seats: seats,
            }
          : undefined,
    });
    setIsEditing(false);
  };

  const handleRoleToggle = (newRole: StudentRole) => {
    setRole(newRole);
    updateRole(newRole);
  };

  return (
    <MobileShell currentUser={currentUser} headerTitle="Student Profile">
      <div className="p-margin flex flex-col gap-4">
        {/* Profile Header Card */}
        <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="relative shrink-0">
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
                {currentUser.full_name.charAt(0)}
              </div>
            )}
            {currentUser.is_verified && (
              <span
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0047bf] text-white flex items-center justify-center ring-2 ring-white"
                title="DYPCOE Verified Student"
              >
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-title-md text-base font-bold text-on-surface truncate">
                {currentUser.full_name}
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant truncate font-mono">
              {currentUser.college_email}
            </p>
            <p className="text-xs text-outline truncate mt-0.5">
              {currentUser.department} • {currentUser.year}
            </p>

            <div className="flex items-center gap-2 mt-2">
              {currentUser.is_verified ? (
                <Badge variant="verified" icon="verified_user" size="sm">
                  Verified Student
                </Badge>
              ) : (
                <button
                  onClick={() => navigate('/verification')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded-full"
                >
                  <span className="material-symbols-outlined text-[12px]">upload_file</span>
                  Verify ID Now
                </button>
              )}
              {currentUser.is_admin && (
                <Badge variant="seats" icon="admin_panel_settings" size="sm">
                  College Admin
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Commute Role Switcher (Never locked into one category) */}
        <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-4 shadow-sm flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs font-bold text-on-surface">
              My Active Commute Mode
            </span>
            <span className="text-[11px] text-outline">Switch anytime</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleRoleToggle('need')}
              className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all border ${
                currentUser.role === 'need'
                  ? 'bg-primary text-on-primary border-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">hail</span>
              <span>Need Rides</span>
            </button>

            <button
              onClick={() => handleRoleToggle('offer')}
              className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all border ${
                currentUser.role === 'offer'
                  ? 'bg-primary text-on-primary border-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">directions_car</span>
              <span>Offer Rides</span>
            </button>

            <button
              onClick={() => handleRoleToggle('both')}
              className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all border ${
                currentUser.role === 'both'
                  ? 'bg-primary text-on-primary border-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">sync_alt</span>
              <span>Both (Flex)</span>
            </button>
          </div>
        </div>

        {/* Vehicle Card (shown only when offering) */}
        {currentUser.role !== 'need' && (
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  {currentUser.vehicle?.vehicle_type === 'two_wheeler' ? 'two_wheeler' : 'directions_car'}
                </span>
                Registered Vehicle
              </span>
              <span className="text-[11px] font-semibold text-primary">
                {currentUser.vehicle?.available_seats || 1} seats open
              </span>
            </div>

            {currentUser.vehicle ? (
              <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-on-surface block">
                    {currentUser.vehicle.model_name}
                  </span>
                  <span className="font-mono text-xs text-outline">
                    {currentUser.vehicle.plate_number}
                  </span>
                </div>
                <Badge variant="seats" icon="event_seat">
                  {currentUser.vehicle.available_seats} Available
                </Badge>
              </div>
            ) : (
              <p className="text-xs text-outline italic">No vehicle details added yet.</p>
            )}
          </div>
        )}

        {/* Edit Profile Form / Toggle */}
        <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-label-lg text-sm font-bold text-on-surface">
              Account Credentials
            </h4>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-primary font-bold hover:underline"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-3 pt-1">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                helperText="Fellow peers see this only after mutual acceptance"
              />

              {role !== 'need' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setVehicleType('two_wheeler')}
                      className={`p-2 rounded-xl text-xs font-semibold ${
                        vehicleType === 'two_wheeler'
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-low text-on-surface'
                      }`}
                    >
                      Two-Wheeler
                    </button>
                    <button
                      type="button"
                      onClick={() => setVehicleType('car')}
                      className={`p-2 rounded-xl text-xs font-semibold ${
                        vehicleType === 'car'
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-low text-on-surface'
                      }`}
                    >
                      Car Pool
                    </button>
                  </div>
                  <Input
                    label="Vehicle Model"
                    placeholder="e.g. Ather 450X / Tata Nexon"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                  />
                  <Input
                    label="License Plate"
                    placeholder="MH 14 XX 0000"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                  />
                </>
              )}

              <Button variant="primary" size="md" onClick={handleSaveProfile} fullWidth>
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 text-xs text-on-surface-variant">
              <div className="flex justify-between py-1 border-b border-surface-container/60">
                <span className="text-outline">Enrollment PRN</span>
                <span className="font-mono font-bold text-on-surface">{currentUser.enrollment_no}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-container/60">
                <span className="text-outline">Phone Number</span>
                <span className="font-mono font-bold text-on-surface">{currentUser.phone_number}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-outline">Public Masked Preview</span>
                <span className="font-mono text-outline">
                  {currentUser.phone_number.slice(0, 4)}••••••{currentUser.phone_number.slice(-2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Menu Links */}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={() => navigate('/privacy-settings')}
            icon="security"
            iconRight="chevron_right"
            className="justify-between"
          >
            Privacy & Safety Settings
          </Button>

          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={() => navigate('/verification')}
            icon="badge"
            iconRight="chevron_right"
            className="justify-between"
          >
            Student ID Verification
          </Button>

          {currentUser.is_admin && (
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => navigate('/admin')}
              icon="admin_panel_settings"
              iconRight="chevron_right"
              className="justify-between"
            >
              Open Admin Dashboard
            </Button>
          )}
        </div>

        {/* Demo Switcher Select Box */}
        <div className="p-3 bg-surface-container-low rounded-2xl border border-surface-container">
          <label className="text-xs font-bold text-outline block mb-1.5 uppercase tracking-wider">
            Switch Demo Account
          </label>
          <select
            value={currentUser.id}
            onChange={(e) => switchDemoUser(e.target.value)}
            className="w-full min-h-[44px] px-3 bg-surface-container-lowest rounded-xl text-xs font-semibold text-on-surface border border-surface-container outline-none"
          >
            {SEED_STUDENTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.role.toUpperCase()}) — {s.department.split('&')[0]}
              </option>
            ))}
          </select>
        </div>

        {/* Sign Out */}
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          onClick={() => {
            logout();
            navigate('/auth');
          }}
          icon="logout"
          className="text-error hover:bg-error-container/20 mt-1"
        >
          Sign Out
        </Button>
      </div>
    </MobileShell>
  );
};
