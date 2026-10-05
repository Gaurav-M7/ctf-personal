import React, { useState, useEffect } from 'react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 px-margin py-2 bg-secondary-container text-on-secondary-container flex items-center justify-center gap-2 shadow-sm text-xs font-semibold">
      <span className="material-symbols-outlined text-[16px]">wifi_off</span>
      <span>You are currently offline. Running on cached DYPCOE corridor data.</span>
    </div>
  );
};
