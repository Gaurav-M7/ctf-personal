import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

export const NotificationModal: React.FC = () => {
  const { notifications, isOpen, closeNotifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (id: string, type: string) => {
    markAsRead(id);
    closeNotifications();

    if (type.includes('request')) {
      navigate('/requests');
    } else if (type.includes('match')) {
      navigate('/matches');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeNotifications} title="Notifications">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs text-on-surface-variant font-medium">
            {notifications.length} recent updates
          </span>
          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary font-bold hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline">
              <span className="material-symbols-outlined text-[24px]">notifications_off</span>
            </div>
            <p className="text-sm font-semibold text-on-surface">No notifications yet</p>
            <p className="text-xs text-on-surface-variant">
              You will be notified when someone on your route sends a request or matches your commute.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item.id, item.type)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  item.is_read
                    ? 'bg-surface-container-low/40 border-surface-container text-on-surface-variant'
                    : 'bg-primary/5 border-primary/20 text-on-surface font-medium'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    item.is_read ? 'bg-surface-container text-outline' : 'bg-primary-container text-on-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {item.type === 'match_found'
                      ? 'route'
                      : item.type === 'request_accepted'
                      ? 'check_circle'
                      : item.type === 'verification_status'
                      ? 'verified_user'
                      : 'notifications'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="text-xs font-bold truncate">{item.title}</h5>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-outline mt-1 block">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" size="sm" onClick={closeNotifications} fullWidth className="mt-2">
          Close
        </Button>
      </div>
    </Modal>
  );
};
