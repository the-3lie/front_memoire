import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Info, Wrench, CheckCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/helpers';
import { Notification } from '../../types';

const typeIcons = {
  alerte: AlertTriangle,
  info: Info,
  panne: AlertTriangle,
  intervention: Wrench,
};

const typeColors = {
  alerte: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  panne: 'bg-dark-100 text-dark-600 dark:bg-dark-700 dark:text-dark-300',
  intervention: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function AdminNotifications() {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const handleMarkRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllRead = () => {
    notifications.filter((n) => !n.lu).forEach((n) => markAsRead(n._id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4" /> Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((notif, i) => {
          const Icon = typeIcons[notif.type] || Bell;
          const colorClass = typeColors[notif.type] || 'bg-dark-100 text-dark-600';
          return (
            <motion.div
              key={notif._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => !notif.lu && handleMarkRead(notif._id)}
              className={`glass-card p-4 cursor-pointer transition-all hover:shadow-md ${!notif.lu ? 'border-l-4 border-l-smart-500' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-xl shrink-0 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-dark-900 dark:text-white text-sm">{notif.titre}</h4>
                    {!notif.lu && <span className="w-2 h-2 bg-smart-500 rounded-full" />}
                  </div>
                  <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">{notif.message}</p>
                  <p className="text-xs text-dark-400 mt-2">{formatDate(notif.createdAt)}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
        {notifications.length === 0 && (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-dark-300 mx-auto mb-4" />
            <p className="text-dark-500 dark:text-dark-400">Aucune notification</p>
          </div>
        )}
      </div>
    </div>
  );
}
