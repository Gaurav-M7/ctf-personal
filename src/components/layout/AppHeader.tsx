import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Student } from '../../types';

interface AppHeaderProps {
  currentUser?: Student | null;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  title?: string;
  showBack?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentUser,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  title,
  showBack = false,
}) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container">
      <div className="max-w-md mx-auto h-16 px-margin flex items-center justify-between gap-space-sm">
        {showBack ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="min-w-[48px] min-h-[48px] -ml-2 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-low transition-colors"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <h1 className="font-title-md text-title-md text-on-surface font-bold truncate">
              {title || 'CampusRide'}
            </h1>
          </div>
        ) : (
          <div className="flex items-center gap-space-sm min-w-0 cursor-pointer" onClick={() => navigate('/')}>
            {/* Campus Ride Icon / Logo */}
            <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-on-primary shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[22px]">directions_car</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-title-md text-title-md text-primary-container font-bold truncate leading-none">
                  CampusRide
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-[10px] leading-tight shrink-0 font-medium">
                  <span className="material-symbols-outlined text-[12px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  DYPCOE Verified
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 shrink-0">
          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="min-w-[48px] min-h-[48px] flex items-center justify-center relative text-on-surface-variant hover:text-on-surface transition-colors rounded-full"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2.5 right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-on-error font-bold text-[10px] flex items-center justify-center ring-2 ring-surface">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar / Quick Nav */}
          <button
            onClick={() => navigate('/profile')}
            aria-label="User Profile"
            className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full"
          >
            {currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-surface-container-highest text-primary flex items-center justify-center font-bold text-xs">
                {currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
