import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { demoStore } from '../services/demoStore';
import { MobileShell } from '../components/layout/MobileShell';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const Verification: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [idPhotoUrl, setIdPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
  );
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!currentUser) {
    return (
      <div className="p-6 text-center">
        <p>Please log in first.</p>
        <Button onClick={() => navigate('/auth')} className="mt-4">
          Go to Login
        </Button>
      </div>
    );
  }

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdPhotoUrl(reader.result as string);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitVerification = () => {
    if (!currentUser) return;
    demoStore.submitVerification({
      student_id: currentUser.id,
      id_card_image_url: idPhotoUrl,
      enrollment_no: currentUser.enrollment_no,
      department: currentUser.department,
      year: currentUser.year,
    });
    setSubmitted(true);
  };

  const handleInstantDemoApprove = () => {
    if (!currentUser) return;
    updateProfile({ is_verified: true });
    setSubmitted(true);
  };

  return (
    <MobileShell currentUser={currentUser} headerTitle="Student Verification" showBack={true}>
      <div className="p-margin flex flex-col gap-4">
        {/* Verification Status Banner */}
        <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-outline font-medium block">Verification Status</span>
            <h3 className="font-title-md text-base font-bold text-on-surface">
              {currentUser.is_verified ? 'Verified DYPCOE Student' : submitted ? 'Under Review' : 'Action Required'}
            </h3>
          </div>
          {currentUser.is_verified ? (
            <Badge variant="verified" icon="verified_user">
              Verified
            </Badge>
          ) : submitted ? (
            <Badge variant="pending" icon="schedule">
              Pending
            </Badge>
          ) : (
            <Badge variant="neutral" icon="upload_file">
              Not Uploaded
            </Badge>
          )}
        </div>

        {/* Informative Security Guarantee */}
        <div className="bg-surface-container-low p-3.5 rounded-2xl border border-surface-container flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[18px]">security</span>
          </div>
          <div className="text-xs text-on-surface-variant">
            <p className="font-semibold text-on-surface">Why Verification is Mandatory</p>
            <p className="mt-0.5 leading-relaxed">
              CampusRide is 100% exclusive to DYPCOE students and faculty. Verifying your student ID guarantees safe carpooling with genuine peers and unlocks direct telephone contact upon accepted rides.
            </p>
          </div>
        </div>

        {/* Student Credential Review Card */}
        <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <h4 className="font-label-lg text-sm font-bold text-on-surface">
            Institutional Details
          </h4>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-surface-container-low">
              <span className="text-outline block text-[10px]">Student Name</span>
              <span className="font-bold text-on-surface">{currentUser.full_name}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container-low">
              <span className="text-outline block text-[10px]">Enrollment / PRN</span>
              <span className="font-bold text-on-surface font-mono">{currentUser.enrollment_no}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container-low">
              <span className="text-outline block text-[10px]">Department</span>
              <span className="font-bold text-on-surface truncate block">{currentUser.department}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container-low">
              <span className="text-outline block text-[10px]">Academic Year</span>
              <span className="font-bold text-on-surface">{currentUser.year}</span>
            </div>
          </div>

          {/* ID Card Photo Preview */}
          <div className="mt-2 flex flex-col gap-2">
            <span className="font-label-sm text-xs font-semibold text-outline">
              College ID Card Photo
            </span>

            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-outline-variant/60 bg-surface-container-low aspect-[16/10] flex items-center justify-center">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-outline">Uploading ID...</span>
                </div>
              ) : (
                <img
                  src={idPhotoUrl}
                  alt="Student College ID"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <label className="min-h-[44px] cursor-pointer rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-xs font-bold text-on-surface flex items-center justify-center gap-1.5 border border-outline-variant/30 mt-1">
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              <span>Upload New ID Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadPhoto}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        {!currentUser.is_verified ? (
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSubmitVerification}
              icon="send"
            >
              Submit for Verification
            </Button>

            {/* Evaluator Fast-Track */}
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={handleInstantDemoApprove}
              icon="bolt"
            >
              Quick Demo: Instant Self-Approve ID
            </Button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#eff6ff] border border-[#dbe1ff] text-center flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[#0047bf] text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <h4 className="font-title-md text-sm font-bold text-[#0047bf]">
              You are a Verified Student!
            </h4>
            <p className="text-xs text-on-surface-variant max-w-xs">
              Your profile displays the official DYPCOE verification badge to fellow riders and drivers.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/')}
              className="mt-2"
            >
              Find Matching Rides
            </Button>
          </div>
        )}
      </div>
    </MobileShell>
  );
};
