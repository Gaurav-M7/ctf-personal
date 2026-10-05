import React from 'react';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { OfflineBanner } from '../common/OfflineBanner';
import { Student } from '../../types';

interface MobileShellProps {
  children: React.ReactNode;
  currentUser?: Student | null;
  unreadNotificationsCount?: number;
  requestsCount?: number;
  onOpenNotifications?: () => void;
  showNav?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
  showBack?: boolean;
}

export const MobileShell: React.FC<MobileShellProps> = ({
  children,
  currentUser,
  unreadNotificationsCount = 0,
  requestsCount = 0,
  onOpenNotifications,
  showNav = true,
  showHeader = true,
  headerTitle,
  showBack = false,
}) => {
  return (
    <div className="w-full min-h-screen bg-surface-dim/30 sm:py-0 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-surface flex flex-col relative shadow-xl overflow-x-hidden border-x border-surface-container/60">
        <OfflineBanner />

        {showHeader && (
          <AppHeader
            currentUser={currentUser}
            unreadNotificationsCount={unreadNotificationsCount}
            onOpenNotifications={onOpenNotifications}
            title={headerTitle}
            showBack={showBack}
          />
        )}

        <main
          className={`flex-1 flex flex-col w-full ${
            showHeader ? 'pt-16' : ''
          } ${showNav ? 'pb-20' : ''}`}
        >
          {children}
        </main>

        {showNav && <BottomNav requestsCount={requestsCount} />}
      </div>
    </div>
  );
};
