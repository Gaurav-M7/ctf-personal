import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { demoStore } from '../services/demoStore';
import { VerificationRequest, UserReport } from '../types';
import { MobileShell } from '../components/layout/MobileShell';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const AdminDashboard: React.FC = () => {
  const { currentUser, loginAsDemoStudent, logout } = useAuth();
  const navigate = useNavigate();

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [rejectModalReq, setRejectModalReq] = useState<VerificationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('ID card photo is blurry or illegible.');

  const verifications = useMemo(() => {
    return demoStore.getVerificationRequests();
  }, [refreshTrigger]);

  const reports = useMemo(() => {
    return demoStore.getReports();
  }, [refreshTrigger]);

  const students = useMemo(() => {
    return demoStore.getStudents();
  }, [refreshTrigger]);

  const pendingVerifications = verifications.filter((v) => v.status === 'pending');
  const verifiedCount = students.filter((s) => s.is_verified).length;
  const totalRidesCount = students.reduce((acc, s) => acc + (s.total_rides || 0), 0);
  const totalCampusCo2 = +students.reduce((acc, s) => acc + (s.co2_saved_kg || 0), 0).toFixed(1);

  const handleApprove = (reqId: string) => {
    demoStore.reviewVerification(reqId, 'verified');
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleConfirmReject = () => {
    if (!rejectModalReq) return;
    demoStore.reviewVerification(rejectModalReq.id, 'rejected', rejectReason);
    setRejectModalReq(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <MobileShell
      currentUser={currentUser}
      headerTitle="Campus Admin Portal"
      showBack={true}
    >
      <div className="p-margin flex flex-col gap-4">
        {/* Admin Header Chip */}
        <div className="bg-tertiary-container/10 border border-tertiary/20 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            </div>
            <div>
              <span className="font-label-lg text-xs font-bold text-on-surface block">
                DYPCOE Coordination Desk
              </span>
              <span className="text-[11px] text-on-surface-variant font-mono">
                Dept. of AI & Data Science
              </span>
            </div>
          </div>
          <Badge variant="verified" icon="verified">
            Admin Active
          </Badge>
        </div>

        {/* Live Campus Analytics Bar */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-surface-container shadow-sm">
            <span className="text-[10px] text-outline uppercase tracking-wider font-bold block">
              Verified Students
            </span>
            <span className="font-headline-sm text-xl font-bold text-primary mt-0.5 block">
              {verifiedCount} / {students.length}
            </span>
            <span className="text-[10px] text-on-surface-variant">100% Institutional Domain</span>
          </div>

          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-surface-container shadow-sm">
            <span className="text-[10px] text-outline uppercase tracking-wider font-bold block">
              Campus CO2 Saved
            </span>
            <span className="font-headline-sm text-xl font-bold text-secondary mt-0.5 block">
              {totalCampusCo2} kg
            </span>
            <span className="text-[10px] text-on-surface-variant">{totalRidesCount} pooled commutes</span>
          </div>
        </div>

        {/* Pending ID Verification Queue */}
        <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
              <h3 className="font-label-lg text-sm font-bold text-on-surface">
                Pending Student ID Approvals
              </h3>
            </div>
            <span className="px-2 py-0.5 bg-secondary-fixed/50 text-secondary text-xs font-bold rounded-full">
              {pendingVerifications.length} Pending
            </span>
          </div>

          {pendingVerifications.length > 0 ? (
            <div className="flex flex-col gap-3">
              {pendingVerifications.map((req) => (
                <div
                  key={req.id}
                  className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex flex-col gap-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-on-surface block">
                        {req.student?.full_name || 'Enrolled Student'}
                      </span>
                      <span className="text-on-surface-variant text-[11px]">
                        {req.department} • {req.year}
                      </span>
                      <span className="font-mono text-outline text-[11px] block">
                        PRN: {req.enrollment_no}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedPhoto(req.id_card_image_url)}
                      className="w-16 h-12 rounded-lg overflow-hidden border border-surface-container shadow-xs shrink-0 cursor-pointer relative group"
                    >
                      <img
                        src={req.id_card_image_url}
                        alt="ID Card"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute inset-0 bg-black/20 flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[14px]">zoom_in</span>
                      </span>
                    </button>
                  </div>

                  {/* Approve / Reject Controls */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRejectModalReq(req)}
                      icon="close"
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(req.id)}
                      icon="verified"
                    >
                      Approve ID
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-on-surface-variant flex flex-col items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[24px]">task_alt</span>
              <span>All student verification requests are reviewed!</span>
            </div>
          )}
        </div>

        {/* Reported Users & Moderation */}
        <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-label-lg text-sm font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-error text-[18px]">gavel</span>
              Reported User Grievances
            </h3>
            <span className="text-xs text-outline">{reports.length} Reports</span>
          </div>

          {reports.length > 0 ? (
            <div className="flex flex-col gap-2">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-3 bg-surface-container-low rounded-xl text-xs flex flex-col gap-1 border border-surface-container"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-on-surface">Target: {rep.reported_student_name}</strong>
                    <Badge variant="rejected" size="sm">
                      {rep.status}
                    </Badge>
                  </div>
                  <p className="text-on-surface-variant">{rep.reason}</p>
                  <span className="text-[10px] text-outline">
                    Filed by {rep.reporter_name} • {new Date(rep.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-outline">
              No unresolved behavioral reports from campus students.
            </div>
          )}
        </div>

        {/* Demo Fast Navigation Switcher */}
        <div className="pt-2 flex flex-col gap-2">
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={() => {
              loginAsDemoStudent();
              navigate('/');
            }}
            icon="directions_car"
          >
            Switch Back to Student Demo (Rohan)
          </Button>

          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => {
              logout();
              navigate('/auth');
            }}
            icon="logout"
            className="text-error"
          >
            Log Out Admin
          </Button>
        </div>
      </div>

      {/* ID Card Zoom Modal */}
      <Modal isOpen={Boolean(selectedPhoto)} onClose={() => setSelectedPhoto(null)} title="Student ID Card Preview">
        {selectedPhoto && (
          <div className="flex flex-col items-center gap-3">
            <img src={selectedPhoto} alt="Student ID" className="w-full rounded-xl object-contain max-h-[60vh]" />
            <Button variant="outline" size="sm" onClick={() => setSelectedPhoto(null)} fullWidth>
              Close Preview
            </Button>
          </div>
        )}
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal isOpen={Boolean(rejectModalReq)} onClose={() => setRejectModalReq(null)} title="Reject Verification">
        <div className="flex flex-col gap-3">
          <p className="text-xs text-on-surface-variant">
            Specify why the ID was rejected so the student can re-upload:
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="w-full p-2.5 bg-surface-container-low rounded-xl text-xs font-sans text-on-surface outline-none"
          />
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setRejectModalReq(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmReject}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </MobileShell>
  );
};
