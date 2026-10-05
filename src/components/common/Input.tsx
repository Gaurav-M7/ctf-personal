import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: string;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, iconRight, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="font-label-sm text-label-sm text-outline font-medium">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-primary">
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </div>
          )}
          <input
            ref={ref}
            className={`w-full min-h-[52px] px-3.5 ${
              icon ? 'pl-11' : ''
            } ${
              iconRight ? 'pr-11' : ''
            } bg-surface-container-low rounded-xl text-on-surface font-sans text-sm md:text-base border ${
              error ? 'border-error ring-1 ring-error/20' : 'border-transparent focus:border-primary-container focus:ring-2 focus:ring-primary-container/20'
            } transition-all outline-none placeholder:text-outline-variant disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3.5 flex items-center text-on-surface-variant">
              {iconRight}
            </div>
          )}
        </div>
        {error ? (
          <span className="font-label-sm text-label-sm text-error flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {error}
          </span>
        ) : helperText ? (
          <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
