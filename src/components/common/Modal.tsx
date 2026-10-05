import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxContentWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxContentWidth = 'max-w-md',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-on-surface/40 backdrop-blur-sm transition-opacity">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${maxContentWidth} bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl p-5 shadow-xl max-h-[90vh] flex flex-col z-10 animate-in slide-in-from-bottom-6 duration-200`}
      >
        {/* Drag handle pill on mobile */}
        <div className="sm:hidden flex justify-center pb-2">
          <div className="w-10 h-1 bg-outline-variant rounded-full" />
        </div>

        {title && (
          <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-3">
            <h3 className="font-title-md text-title-md font-bold text-on-surface">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}

        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
