import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconRight?: string;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  size = 'md',
  icon,
  iconRight,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Enforce minimum 48px touch target
  let sizeClasses = 'min-h-[48px] px-4 text-sm font-semibold';
  if (size === 'lg') {
    sizeClasses = 'min-h-[52px] px-6 text-base font-bold';
  } else if (size === 'sm') {
    sizeClasses = 'min-h-[40px] px-3 text-xs font-semibold';
  }

  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses =
        'bg-primary-container hover:bg-primary text-on-primary shadow-sm hover:shadow-md active:bg-[#115e59] active:scale-[0.99]';
      break;
    case 'secondary':
      variantClasses =
        'bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 active:scale-[0.99]';
      break;
    case 'outline':
      variantClasses =
        'bg-surface-container-lowest border border-outline-variant/60 text-on-surface hover:bg-surface-container-low active:scale-[0.99]';
      break;
    case 'danger':
      variantClasses =
        'bg-error hover:bg-error/90 text-on-error shadow-sm active:scale-[0.99]';
      break;
    case 'ghost':
      variantClasses =
        'bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50';
      break;
  }

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`rounded-xl inline-flex items-center justify-center gap-2 transition-all select-none ${sizeClasses} ${variantClasses} ${widthClasses} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : icon ? (
        <span className="material-symbols-outlined text-[20px] leading-none shrink-0">{icon}</span>
      ) : null}

      {children && <span className="truncate">{children}</span>}

      {!loading && iconRight && (
        <span className="material-symbols-outlined text-[20px] leading-none shrink-0">{iconRight}</span>
      )}
    </button>
  );
};
