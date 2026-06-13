import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Info, Wrench, CheckCircle, MessageSquare } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext'; // 🌟 Ajout de l'authentification
import { formatDate } from '../../utils/helpers';

const typeIcons: Record<string, typeof Bell> = {
  alerte: AlertTriangle,
  info: Info,
  panne: AlertTriangle,
  intervention: Wrench,
  message: MessageSquare,
};

const typeColors: Record<string, string> = {
  alerte: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  panne: 'bg-dark-100 text-dark-600 dark:bg-dark-700 dark:text-dark-300',
  intervention: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  message: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function EquipeNotifications() {
  const { user } = useAuth(); // 🌟 Récupère l'utilisateur connecté
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const listeNotifications = Array.isArray(notifications) ? notifications : [];

  // 🌟 DOUBLE VERROU CRUCIAL : Filtrer pour masquer ses propres messages envoyés
  const mesNotificationsCiblees = useMemo(() => {
    const currentUserId = String(user?.id || (user as any)?._id || '');

    return listeNotifications.filter((notif: any) => {
      // 1. Si la notification n'a pas de user_id, c'est une alerte de poubelle globale (on l'affiche)
      if (!notif.user_id && !notif.userId) return true;

      // 2. Si c'est un message, on ne l'affiche QUE si l'ID du destinataire correspond à mon ID
      return String(notif.user_id || notif.userId) === currentUserId;
    });
  }, [listeNotifications, user]);

  const handleMarkAllAsRead = () => {
    mesNotificationsCiblees
      .filter((notif) => !notif.lu)
      .forEach((notif) => {
        const notifId = notif.id || notif._id;
        if (notifId) markAsRead(notifId);
      });
  };

  // 🌟 Calcul dynamique du compteur basé uniquement sur les vraies notifications de l'utilisateur
  const vraisNonLus = mesNotificationsCiblees.filter((n) => !n.lu).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications & Messages</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">
            {vraisNonLus} non lue{vraisNonLus > 1 ? 's' : ''}
          </p>
        </div>
        {vraisNonLus > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4" /> Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* 🌟 On boucle sur 'mesNotificationsCiblees' au lieu de la liste brute */}
        {mesNotificationsCiblees.map((notif: any, i) => {
          const currentType = notif.type || (notif.titre?.toLowerCase().includes('message') ? 'message' : 'info');
          const Icon = typeIcons[currentType] || Bell;
          const colorClass = typeColors[currentType] || 'bg-dark-100 text-dark-600';
          const currentNotifId = notif.id || notif._id;

          return (
            <motion.div
              key={currentNotifId || `notif-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => !notif.lu && currentNotifId && markAsRead(currentNotifId)}
              className={`glass-card p-4 cursor-pointer transition-all hover:shadow-md ${
                !notif.lu ? 'border-l-4 border-l-amber-500 bg-amber-50/5 dark:bg-amber-500/5' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-xl shrink-0 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-dark-900 dark:text-white text-sm">
                        {notif.titre}
                      </h4>
                      {!notif.lu && <span className="w-2 h-2 bg-amber-500 rounded-full" />}
                    </div>
                    <span className="text-xs text-dark-400">
                      {formatDate(notif.createdAt || notif.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-dark-600 dark:text-dark-400 mt-1 whitespace-pre-line">
                    {notif.message}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {mesNotificationsCiblees.length === 0 && (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-dark-300 mx-auto mb-4" />
            <p className="text-dark-500 dark:text-dark-400">Aucune notification ni message.</p>
          </div>
        )}
      </div>
    </div>
  );
}