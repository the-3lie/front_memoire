import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as messageApi from '../api/messages';
import { onEvent, offEvent } from '../socket';

// 🌟 Hook à utiliser dans n'importe quel composant (sidebar, navbar...)
// pour afficher le badge "nombre de messages non lus".
//
// Usage :
//   const unreadCount = useUnreadMessages();
//   {unreadCount > 0 && <span className="badge">{unreadCount}</span>}

export function useUnreadMessages() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const myUserId = String(user?.id || (user as any)?._id || '');

  const fetchCount = useCallback(async () => {
    if (!myUserId) return;
    try {
      const total = await messageApi.getUnreadCount(myUserId);
      setCount(total);
    } catch (err) {
      console.error('Erreur lors de la récupération du nombre de messages non lus :', err);
    }
  }, [myUserId]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // 🌟 Mise à jour en temps réel : dès qu'un message arrive via socket,
  // on recalcule le badge (utilise le même évènement que la messagerie).
  useEffect(() => {
    const handler = () => { fetchCount(); };
    onEvent('new_message', handler);
    return () => { offEvent('new_message', handler); };
  }, [fetchCount]);

  return count;
}