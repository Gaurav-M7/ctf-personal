import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { demoStore } from '../services/demoStore';
import { RideRequest } from '../types';
import { MobileShell } from '../components/layout/MobileShell';
import { Button } from '../components/common/Button';
import confetti from 'canvas-confetti';

export const PostRideRating: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const request = location.state?.request as RideRequest | undefined;
  const driver = request?.driver || demoStore.getStudents()[0];
  const distanceKm = request?.route?.distance_km || 7.8;
  const co2Saved = +(distanceKm * 0.12).toFixed(2);

  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Trigger festive eco confetti
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#005c55', '#0f766e', '#fea619', '#0047bf'],
      });
    } catch {}
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    demoStore.addRating({
      ride_id: request?.id || `ride-${Date.now()}`,
      rater_id: currentUser.id,
      rated_student_id: driver.id,
      rating: rating,
      review: review,
      co2_saved_kg: co2Saved,
    });

    setSubmitted(true);
    setTimeout(() => {
      navigate('/my-rides');
    }, 1200);
  };

  return (
    <MobileShell currentUser={currentUser} headerTitle="Ride Completed" showNav={false} showBack={false}>
      <div className="p-margin flex flex-col justify-between min-h-[80vh]">
        <div className="flex flex-col gap-4">
          {/* Eco-Impact Celebration Card (Repurposing Amber) */}
          <div className="bg-secondary-fixed/30 border border-secondary/20 rounded-2xl p-5 text-center flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[32px]">eco</span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              Campus Climate Achievement
            </span>
            <h3 className="font-headline-sm text-xl font-bold text-on-surface">
              {co2Saved} kg CO2 Saved!
            </h3>
            <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
              By pooling this trip, you avoided <strong>{distanceKm} km</strong> of solo travel to DYPCOE Akurdi and reduced campus parking congestion!
            </p>
          </div>

          {/* Rating Form Card */}
          <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-5 shadow-sm flex flex-col items-center gap-3">
            <div className="text-center">
              <img
                src={driver.avatar_url}
                alt={driver.full_name}
                className="w-14 h-14 rounded-full object-cover mx-auto ring-2 ring-primary/20"
              />
              <h4 className="font-title-md text-base font-bold text-on-surface mt-2">
                Rate your ride with {driver.full_name}
              </h4>
              <p className="text-xs text-on-surface-variant">
                {driver.department}
              </p>
            </div>

            {/* Interactive 5 Star Selector */}
            <div className="flex items-center gap-1.5 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-secondary transition-transform active:scale-110"
                  aria-label={`${star} Stars`}
                >
                  <span
                    className="material-symbols-outlined text-[36px]"
                    style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>

            {/* Optional Short Review */}
            <div className="w-full">
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share a quick note (e.g. On-time pickup, polite batchmate, smooth ride)..."
                rows={3}
                className="w-full p-3 bg-surface-container-low rounded-xl text-xs font-sans text-on-surface border border-transparent focus:border-primary-container outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 flex flex-col gap-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSubmit}
            disabled={submitted}
            icon={submitted ? 'check' : 'send'}
          >
            {submitted ? 'Rating Submitted!' : 'Submit Rating & View Eco Stats'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => navigate('/my-rides')}
          >
            Skip for now
          </Button>
        </div>
      </div>
    </MobileShell>
  );
};
