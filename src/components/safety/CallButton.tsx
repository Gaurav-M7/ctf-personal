import React from 'react';
import { RequestStatus } from '../../types';

interface CallButtonProps {
  phoneNumber: string;
  studentName: string;
  status: RequestStatus;
  className?: string;
}

export const CallButton: React.FC<CallButtonProps> = ({
  phoneNumber,
  studentName,
  status,
  className = '',
}) => {
  const isAccepted = status === 'accepted' || status === 'completed';

  // Format phone number masking (e.g., +91 98••••••21)
  const getMaskedPhone = (phone: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length < 6) return '••••••••••';
    const start = cleaned.slice(0, 2);
    const end = cleaned.slice(-2);
    return `+91 ${start}••••••${end}`;
  };

  if (!isAccepted) {
    return (
      <div
        className={`flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface-variant ${className}`}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-outline">lock</span>
          <div>
            <span className="font-semibold text-on-surface block">
              Contact Masked
            </span>
            <span className="font-mono text-outline">
              {getMaskedPhone(phoneNumber)}
            </span>
          </div>
        </div>
        <span className="text-[11px] font-medium text-outline bg-surface-container px-2 py-1 rounded-md">
          Revealed when accepted
        </span>
      </div>
    );
  }

  // Accepted: Reveal unmasked phone and active Call button
  return (
    <div
      className={`flex items-center justify-between p-2.5 rounded-xl bg-primary/10 border border-primary/25 ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[18px]">call</span>
        </div>
        <div className="min-w-0">
          <span className="font-label-sm text-label-sm text-primary font-bold block truncate">
            Direct Contact ({studentName})
          </span>
          <a
            href={`tel:${phoneNumber}`}
            className="font-mono text-xs font-semibold text-on-surface hover:underline block"
          >
            {phoneNumber}
          </a>
        </div>
      </div>

      <a
        href={`tel:${phoneNumber}`}
        className="min-h-[44px] px-3.5 bg-primary-container hover:bg-primary text-on-primary rounded-xl font-label-md text-xs font-bold inline-flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
      >
        <span className="material-symbols-outlined text-[18px]">call</span>
        <span>Call</span>
      </a>
    </div>
  );
};
