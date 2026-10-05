import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

interface Slide {
  title: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
}

const slides: Slide[] = [
  {
    title: 'Find Students on Your Route',
    tagline: 'Common Transportation Finder',
    description:
      'Discover DYPCOE batchmates traveling your exact corridor at matching lecture timings. Share a ride, beat traffic, and split nothing—pure community commute.',
    icon: 'route',
    color: '#005c55',
  },
  {
    title: 'Safe, Verified, College-Only',
    tagline: '100% Institutional Trust',
    description:
      'Only students with verified college credentials can participate. Phone numbers and exact addresses remain securely hidden until you mutually accept a ride.',
    icon: 'verified_user',
    color: '#0047bf',
  },
  {
    title: 'Save Fuel, Reduce Emissions',
    tagline: 'Campus Climate Impact',
    description:
      'Cut solo vehicle trips to Akurdi campus. Track kilograms of CO2 saved with every shared journey and earn campus green contributor honors.',
    icon: 'eco',
    color: '#855300',
  },
];

export const Onboarding: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      localStorage.setItem('campusride_onboarded', 'true');
      navigate('/auth');
    }
  };

  const handleSkip = () => {
    localStorage.setItem('campusride_onboarded', 'true');
    navigate('/auth');
  };

  const slide = slides[currentSlide];

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pt-safe">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[18px]">directions_car</span>
          </div>
          <span className="font-title-md font-bold text-primary-container">CampusRide</span>
        </div>
        <button
          onClick={handleSkip}
          className="text-xs font-semibold text-outline hover:text-on-surface transition-colors py-2 px-3"
        >
          Skip
        </button>
      </div>

      {/* Main Slide Content */}
      <div className="my-auto flex flex-col items-center text-center px-4 py-8">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-sm transition-transform duration-300"
          style={{ backgroundColor: `${slide.color}15`, color: slide.color }}
        >
          <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {slide.icon}
          </span>
        </div>

        <span className="font-label-md text-xs font-bold uppercase tracking-wider text-primary mb-2">
          {slide.tagline}
        </span>
        <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-3">
          {slide.title}
        </h2>
        <p className="font-body-md text-sm text-on-surface-variant max-w-xs leading-relaxed">
          {slide.description}
        </p>

        {/* Slide Indicators */}
        <div className="flex items-center gap-2 mt-8">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-7 bg-primary' : 'w-2 bg-outline-variant/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pb-safe flex flex-col gap-3">
        <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
        </Button>
        <button
          onClick={() => navigate('/auth')}
          className="text-xs text-on-surface-variant hover:text-primary transition-colors py-2 text-center"
        >
          Already registered? <strong className="text-primary font-bold">Log In</strong>
        </button>
      </div>
    </div>
  );
};
