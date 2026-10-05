import React, { useState } from 'react';

export const PrivacyExplainer: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-surface-container-high/60 border border-surface-container-highest rounded-2xl p-3.5 transition-all">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
          </div>
          <div>
            <h4 className="font-label-md text-label-md text-on-surface font-bold">
              Campus Privacy & Safety Guarantee
            </h4>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Zero continuous tracking • Masked contacts
            </p>
          </div>
        </div>
        <button
          className="text-on-surface-variant min-w-[32px] min-h-[32px] flex items-center justify-center"
          aria-label="Toggle details"
        >
          <span className="material-symbols-outlined text-[20px] transition-transform duration-200">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-surface-container space-y-2 text-xs text-on-surface-variant">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">location_off</span>
            <p>
              <strong className="text-on-surface">No Continuous GPS:</strong> Your GPS location is only queried once when selecting your pickup spot. CampusRide does not track your location in the background.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">visibility_off</span>
            <p>
              <strong className="text-on-surface">Approximate Pickup Area:</strong> Your exact home address is never shown. Only an approximate meeting point is shared.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">phonelink_lock</span>
            <p>
              <strong className="text-on-surface">Masked Phone Numbers:</strong> Phone numbers remain hidden (+91 98••••••21) until both parties accept a ride request.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">badge</span>
            <p>
              <strong className="text-on-surface">100% DYPCOE ID Verified:</strong> Only students with verified college credentials and active enrollment are eligible to share rides.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
