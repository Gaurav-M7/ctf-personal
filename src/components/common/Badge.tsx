import React from 'react';

export type BadgeVariant = 'verified' | 'seats' | 'eco' | 'match' | 'pending' | 'rejected' | 'role' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  icon,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  let variantClasses = 'bg-surface-container-high text-on-surface-variant';

  switch (variant) {
    case 'verified':
      // Blue tertiary token reserved exclusively for student verification
      variantClasses = 'bg-[#eff6ff] text-[#0047bf] font-semibold border border-[#dbe1ff]';
      break;
    case 'seats':
      // Repurposed teal/amber accent for seats
      variantClasses = 'bg-primary/10 text-primary font-semibold';
      break;
    case 'eco':
      // Repurposed amber secondary for eco-impact & CO2
      variantClasses = 'bg-secondary-fixed/50 text-secondary font-bold';
      break;
    case 'match':
      // Route match pill
      variantClasses = 'bg-surface-container-high text-primary font-bold';
      break;
    case 'pending':
      variantClasses = 'bg-secondary-fixed/60 text-secondary font-semibold';
      break;
    case 'rejected':
      variantClasses = 'bg-error-container text-error font-semibold';
      break;
    case 'role':
      variantClasses = 'bg-surface-container-highest text-primary-container font-semibold';
      break;
    default:
      variantClasses = 'bg-surface-container text-on-surface-variant font-medium';
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${sizeClasses} ${variantClasses} shrink-0 transition-colors ${className}`}
    >
      {icon && (
        <span className="material-symbols-outlined text-[14px] leading-none shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
    </span>
  );
};
