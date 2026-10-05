import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { StudentRole, VehicleType } from '../types';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup, loginAsDemoStudent, loginAsDemoAdmin, switchDemoUser } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Artificial Intelligence & Data Science');
  const [year, setYear] = useState('TE');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [role, setRole] = useState<StudentRole>('need');

  // Vehicle info
  const [vehicleType, setVehicleType] = useState<VehicleType>('two_wheeler');
  const [modelName, setModelName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [seats, setSeats] = useState(1);

  // Status
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(email);
        if (res.success) {
          navigate('/');
        } else {
          setError(res.error || 'Login failed.');
        }
      } else {
        const res = await signup({
          fullName,
          collegeEmail: email,
          phoneNumber: phone,
          department,
          year,
          enrollmentNo,
          role,
          vehicle:
            role !== 'need' && modelName
              ? {
                  vehicle_type: vehicleType,
                  model_name: modelName,
                  plate_number: plateNumber,
                  total_seats: seats,
                  available_seats: seats,
                }
              : undefined,
        });

        if (res.success) {
          navigate('/verification');
        } else {
          setError(res.error || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col justify-center p-6 max-w-md mx-auto">
      <div className="mb-6 text-center">
        {/* Brand Icon */}
        <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary mx-auto flex items-center justify-center shadow-sm mb-3">
          <span className="material-symbols-outlined text-[26px]">directions_car</span>
        </div>
        <h1 className="font-headline-sm text-xl font-bold text-on-surface">
          CampusRide
        </h1>
        <p className="font-label-sm text-xs text-on-surface-variant mt-1">
          DYPCOE Akurdi • Dept. of AI & Data Science
        </p>
      </div>

      {/* Segmented Auth Mode Switch */}
      <div className="bg-surface-container-highest p-1 rounded-2xl flex items-center mb-6">
        <button
          type="button"
          onClick={() => {
            setIsLogin(true);
            setError(null);
          }}
          className={`flex-1 py-2 rounded-xl font-label-md text-xs font-bold transition-all ${
            isLogin ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsLogin(false);
            setError(null);
          }}
          className={`flex-1 py-2 rounded-xl font-label-md text-xs font-bold transition-all ${
            !isLogin ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'
          }`}
        >
          Register Student
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs flex items-start gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[16px] text-error mt-0.5">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm">
        {!isLogin && (
          <Input
            label="Full Name"
            placeholder="e.g. Sneha Patil"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            icon="badge"
          />
        )}

        <Input
          label="College Email ID"
          type="email"
          placeholder="your.name@dypcoeakurdi.ac.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          icon="school"
          helperText="Must end in @dypcoeakurdi.ac.in"
        />

        {!isLogin && (
          <>
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 98220 12345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              icon="call"
              helperText="Kept masked until ride is accepted"
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-label-sm text-label-sm text-outline font-medium block mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full min-h-[52px] px-3 bg-surface-container-low rounded-xl text-on-surface text-xs font-semibold border border-transparent focus:border-primary-container outline-none"
                >
                  <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                  <option value="Computer Engineering">Computer Engg</option>
                  <option value="Information Technology">Information Tech</option>
                  <option value="Mechanical Engineering">Mechanical Engg</option>
                  <option value="Civil Engineering">Civil Engg</option>
                  <option value="Electronics & Telecommunication">E&TC</option>
                  <option value="Robotics & Automation">Robotics</option>
                </select>
              </div>

              <div>
                <label className="font-label-sm text-label-sm text-outline font-medium block mb-1">
                  Academic Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full min-h-[52px] px-3 bg-surface-container-low rounded-xl text-on-surface text-xs font-semibold border border-transparent focus:border-primary-container outline-none"
                >
                  <option value="FE">First Year (FE)</option>
                  <option value="SE">Second Year (SE)</option>
                  <option value="TE">Third Year (TE)</option>
                  <option value="BE">Final Year (BE)</option>
                </select>
              </div>
            </div>

            <Input
              label="Enrollment / PRN Number"
              placeholder="e.g. DYP22AIDS042"
              value={enrollmentNo}
              onChange={(e) => setEnrollmentNo(e.target.value)}
              required
              icon="pin"
            />

            {/* Commute Preference Selector */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-outline font-medium">
                Commute Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['need', 'offer', 'both'] as StudentRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold capitalize transition-all border ${
                      role === r
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant border-transparent'
                    }`}
                  >
                    {r === 'need' ? 'Need Rides' : r === 'offer' ? 'Offer Rides' : 'Both'}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional Vehicle Section if Offering */}
            {role !== 'need' && (
              <div className="p-3 bg-surface-container-high/40 rounded-xl flex flex-col gap-2.5 border border-surface-container-highest">
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">directions_car</span>
                  Vehicle Information
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVehicleType('two_wheeler')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border ${
                      vehicleType === 'two_wheeler'
                        ? 'bg-primary-container text-on-primary border-primary-container'
                        : 'bg-surface-container-low text-on-surface-variant border-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">two_wheeler</span>
                    Two-Wheeler
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleType('car')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border ${
                      vehicleType === 'car'
                        ? 'bg-primary-container text-on-primary border-primary-container'
                        : 'bg-surface-container-low text-on-surface-variant border-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">directions_car</span>
                    Car Pool
                  </button>
                </div>

                <Input
                  placeholder={vehicleType === 'two_wheeler' ? 'e.g. Ather 450X' : 'e.g. Tata Nexon EV'}
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="min-h-[44px] text-xs"
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="MH 14 XX 1234"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    className="min-h-[44px] text-xs font-mono"
                  />
                  <div>
                    <select
                      value={seats}
                      onChange={(e) => setSeats(Number(e.target.value))}
                      className="w-full min-h-[44px] px-2 bg-surface-container-low rounded-xl text-on-surface text-xs font-semibold border border-transparent outline-none"
                    >
                      <option value={1}>1 Seat available</option>
                      <option value={2}>2 Seats available</option>
                      <option value={3}>3 Seats available</option>
                      <option value={4}>4 Seats available</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <Button type="submit" variant="primary" size="lg" loading={loading} fullWidth className="mt-2">
          {isLogin ? 'Sign In with College Email' : 'Complete Registration'}
        </Button>
      </form>

      {/* College Domain & Security Notice */}
      <div className="mt-6 p-3.5 rounded-2xl bg-surface-container-low border border-surface-container text-center flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <span className="material-symbols-outlined text-[16px]">domain_verification</span>
          <span>DYPCOE Institutional Authentication Only</span>
        </div>
        <p className="text-[11px] text-on-surface-variant max-w-xs leading-normal">
          External social logins (Google, Facebook) are disabled for campus safety. Only official college email IDs are permitted.
        </p>
      </div>
    </div>
  );
};
