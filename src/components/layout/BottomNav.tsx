import React from 'react';
import { NavLink } from 'react-router-dom';

interface BottomNavProps {
  requestsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ requestsCount = 0 }) => {
  const navItems = [
    {
      to: '/',
      label: 'Home',
      icon: 'directions_car',
    },
    {
      to: '/my-rides',
      label: 'My Rides',
      icon: 'commute',
    },
    {
      to: '/requests',
      label: 'Requests',
      icon: 'swap_horiz',
      badgeCount: requestsCount,
    },
    {
      to: '/profile',
      label: 'Profile',
      icon: 'account_circle',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-surface/90 backdrop-blur-xl border-t border-surface-container shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto h-16 flex items-center justify-around px-space-xs">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center min-h-[48px] min-w-[48px] py-1 transition-colors relative ${
                isActive
                  ? 'text-primary-container font-bold'
                  : 'text-on-surface-variant hover:text-on-surface font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <span
                    className="material-symbols-outlined text-[24px]"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  {item.badgeCount && item.badgeCount > 0 ? (
                    <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-secondary-container text-on-secondary-container font-bold text-[10px] flex items-center justify-center">
                      {item.badgeCount}
                    </span>
                  ) : null}
                </div>
                <span className="font-label-sm text-label-sm mt-0.5">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
