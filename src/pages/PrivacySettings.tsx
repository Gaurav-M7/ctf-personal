import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { demoStore } from '../services/demoStore';
import { MobileShell } from '../components/layout/MobileShell';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { PrivacyExplainer } from '../components/safety/PrivacyExplainer';

export const PrivacySettings: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Settings Toggles
  const [liveLocationAcceptedOnly, setLiveLocationAcceptedOnly] = useState(true);
  const [showApproxPickupOnly, setShowApproxPickupOnly] = useState(true);
  const [maskPhoneUntilAccepted, setMaskPhoneUntilAccepted] = useState(true);

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState('Parent / Guardian');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98220 54321');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportedStudentName, setReportedStudentName] = useState('');
  const [reportReason, setReportReason] = useState('Inappropriate behavior / No-show');
  const [reportSuccess, setReportSuccess] = useState(false);

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

  const handleSaveSettings = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    demoStore.createReport({
      reporter_id: currentUser.id,
      reporter_name: currentUser.full_name,
      reported_student_id: 'unknown-reported-peer',
      reported_student_name: reportedStudentName,
      reason: reportReason,
    });
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportModalOpen(false);
      setReportedStudentName('');
    }, 1500);
  };

  return (
    <MobileShell currentUser={currentUser} headerTitle="Privacy & Safety" showBack={true}>
      <div className="p-margin flex flex-col gap-4">
        {/* Comprehensive Privacy Explainer (72% worry about location tracking) */}
        <PrivacyExplainer />

        {savedSuccess && (
          <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl text-xs text-primary font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Privacy preferences updated successfully.</span>
          </div>
        )}

        {/* Location & Contact Privacy Toggles */}
        <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-4 shadow-sm flex flex-col gap-4">
          <h4 className="font-label-lg text-xs font-bold text-outline uppercase tracking-wider">
            Location & Contact Safeguards
          </h4>

          {/* Toggle 1: Live location only during accepted ride */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container/60">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">location_on</span>
              <div>
                <strong className="text-xs font-bold text-on-surface block">
                  Share Live Location Only During Accepted Ride
                </strong>
                <span className="text-[11px] text-on-surface-variant leading-tight block mt-0.5">
                  GPS coordinates cease automatically the moment the driver or rider marks the ride completed.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLiveLocationAcceptedOnly(!liveLocationAcceptedOnly)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 relative shrink-0 ${
                liveLocationAcceptedOnly ? 'bg-primary' : 'bg-outline-variant'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  liveLocationAcceptedOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Show approximate pickup area */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container/60">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">visibility_off</span>
              <div>
                <strong className="text-xs font-bold text-on-surface block">
                  Show Approximate Pickup Zone Only
                </strong>
                <span className="text-[11px] text-on-surface-variant leading-tight block mt-0.5">
                  Protects your exact home building address; displays a ~350m neighborhood circle instead.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowApproxPickupOnly(!showApproxPickupOnly)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 relative shrink-0 ${
                showApproxPickupOnly ? 'bg-primary' : 'bg-outline-variant'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  showApproxPickupOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: Mask phone number until accepted */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">phonelink_lock</span>
              <div>
                <strong className="text-xs font-bold text-on-surface block">
                  Mask Phone Number Until Accepted
                </strong>
                <span className="text-[11px] text-on-surface-variant leading-tight block mt-0.5">
                  Displays (+91 98••••••21) to searchers. Unmasks only when both students accept.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMaskPhoneUntilAccepted(!maskPhoneUntilAccepted)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 relative shrink-0 ${
                maskPhoneUntilAccepted ? 'bg-primary' : 'bg-outline-variant'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  maskPhoneUntilAccepted ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Emergency Contact Setup */}
        <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[20px]">e911_emergency</span>
            <h4 className="font-label-lg text-xs font-bold text-on-surface uppercase tracking-wider">
              Emergency Contact (Campus SOS)
            </h4>
          </div>

          <Input
            label="Contact Name / Relation"
            value={emergencyName}
            onChange={(e) => setEmergencyName(e.target.value)}
          />

          <Input
            label="Emergency Phone Number"
            type="tel"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
          />

          <Button variant="primary" size="sm" onClick={handleSaveSettings} fullWidth className="mt-1">
            Save Emergency Contact
          </Button>
        </div>

        {/* User Protection & Community Moderation */}
        <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-4 shadow-sm flex flex-col gap-2.5">
          <h4 className="font-label-lg text-xs font-bold text-outline uppercase tracking-wider">
            Safety & Moderation
          </h4>

          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={() => setReportModalOpen(true)}
            icon="report_problem"
            className="text-error border-error/20 hover:bg-error/5"
          >
            Report or Block a User
          </Button>
        </div>
      </div>

      {/* Report Modal */}
      <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title="Report a Student">
        <form onSubmit={handleSendReport} className="flex flex-col gap-3">
          {reportSuccess ? (
            <div className="p-4 rounded-xl bg-primary/10 text-primary text-xs font-bold text-center">
              Report submitted to DYPCOE Student Grievance Committee.
            </div>
          ) : (
            <>
              <p className="text-xs text-on-surface-variant">
                Reports are treated confidentially and reviewed directly by the Department Coordinator.
              </p>

              <Input
                label="Student Name / PRN to Report"
                placeholder="e.g. Full name or PRN"
                value={reportedStudentName}
                onChange={(e) => setReportedStudentName(e.target.value)}
                required
              />

              <div>
                <label className="font-label-sm text-label-sm text-outline font-medium block mb-1">
                  Reason for Report
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full min-h-[52px] px-3 bg-surface-container-low rounded-xl text-on-surface text-xs font-semibold outline-none"
                >
                  <option value="Inappropriate behavior / No-show">Inappropriate behavior or no-show</option>
                  <option value="Unsafe driving or traffic violation">Unsafe vehicle operation</option>
                  <option value="Fake credentials or non-DYPCOE user">Fake credentials / outsider</option>
                  <option value="Unsolicited payment demand">Attempted fee or payment charging</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setReportModalOpen(false)} fullWidth>
                  Cancel
                </Button>
                <Button type="submit" variant="danger" size="sm" fullWidth>
                  Submit Report
                </Button>
              </div>
            </>
          )}
        </form>
      </Modal>
    </MobileShell>
  );
};
