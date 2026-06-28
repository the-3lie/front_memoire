import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Message } from '../../types';
import * as messageApi from '../../api/messages';
import { Contact } from '../../api/messages';
import { onEvent, offEvent } from '../../socket';
import { formatDate, getInitials } from '../../utils/helpers';

export default function AdminMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [equipes, setEquipes] = useState<Contact[]>([]);
  const [selectedEquipe, setSelectedEquipe] = useState<string>('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ID de l'administrateur connecté (Toi)
  const myUserId = useMemo(() => String(user?.id || (user as any)?._id || ''), [user]);

  const fetchMessages = async () => {
    try {
      const data = await messageApi.getAll();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur lors de la récupération des messages :", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipes = async () => {
    if (!myUserId) return;
    try {
      const data = await messageApi.getContacts(myUserId);
      const liste = Array.isArray(data) ? data : [];
      setEquipes(liste);
      if (liste.length > 0 && !selectedEquipe) {
        setSelectedEquipe(String(liste[0].id));
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des équipes :", err);
    }
  };

  useEffect(() => {
    if (myUserId) {
      fetchEquipes();
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUserId]);

  useEffect(() => {
    const handler = () => { fetchMessages(); };
    onEvent('new_message', handler);
    return () => { offEvent('new_message', handler); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedEquipe]);

  // 🌟 Helpers de lecture d'ID, tolérants aux deux formats (id brut ou objet imbriqué)
  const getExpId = (m: any) => String(m.expediteur_id ?? m.expediteur?.id ?? m.expediteur?._id ?? m.expediteur ?? '');
  const getDestId = (m: any) => String(m.destinataire_id ?? m.destinataire?.id ?? m.destinataire?._id ?? m.destinataire ?? '');
  const getTime = (m: any) => new Date(m.createdAt || m.created_at).getTime();

  // 🌟 NOUVEAU : marque les messages de cette conversation comme lus dès qu'on l'ouvre.
  // On met aussi à jour l'état local immédiatement (sans attendre un refetch) pour que
  // le badge par contact disparaisse instantanément, sans latence réseau visible.
  useEffect(() => {
    if (selectedEquipe && myUserId) {
      messageApi.markAsRead(myUserId, selectedEquipe).catch((err) => {
        console.error('Erreur lors du marquage comme lu :', err);
      });
      setMessages((prev) =>
        prev.map((m: any) =>
          getExpId(m) === selectedEquipe && getDestId(m) === myUserId
            ? { ...m, lu: true }
            : m
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEquipe, myUserId]);

  const filteredMessages = useMemo(() => {
    if (!selectedEquipe) return [];
    return messages.filter((m: any) => {
      const expediteurId = getExpId(m);
      const destinataireId = getDestId(m);
      return (
        (expediteurId === myUserId && destinataireId === selectedEquipe) ||
        (expediteurId === selectedEquipe && destinataireId === myUserId)
      );
    });
  }, [messages, selectedEquipe, myUserId]);

  // 🌟 NOUVEAU : pour chaque équipe, on calcule son dernier message et son nombre
  // de messages non lus (reçus, pas envoyés par moi). On trie ensuite la liste des
  // contacts par date du dernier message — le plus récent en haut, comme WhatsApp.
  const equipesAvecMeta = useMemo(() => {
    return equipes
      .map((eq) => {
        const eqId = String(eq.id);
        const conv = messages.filter((m: any) => {
          const expId = getExpId(m);
          const destId = getDestId(m);
          return (expId === myUserId && destId === eqId) || (expId === eqId && destId === myUserId);
        });

        const lastMsg = conv.slice().sort((a, b) => getTime(b) - getTime(a))[0];
        const unreadCount = conv.filter((m: any) => getExpId(m) === eqId && getDestId(m) === myUserId && !m.lu).length;

        return { contact: eq, eqId, lastMsg, unreadCount };
      })
      .sort((a, b) => {
        // Les conversations sans aucun message restent en bas, dans l'ordre d'origine
        if (!a.lastMsg && !b.lastMsg) return 0;
        if (!a.lastMsg) return 1;
        if (!b.lastMsg) return -1;
        return getTime(b.lastMsg) - getTime(a.lastMsg);
      });
  }, [equipes, messages, myUserId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedEquipe || !myUserId) return;

    try {
      await messageApi.create({
        contenu: input.trim(),
        expediteur_id: parseInt(myUserId),
        destinataire_id: parseInt(selectedEquipe)
      });

      setInput('');
      await fetchMessages();
    } catch (err) {
      console.error("Erreur d'envoi du message :", err);
    }
  };

  const selectedContactObj = equipes.find((e) => String(e.id) === selectedEquipe);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Messagerie Administrateur</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Canal de communication direct avec le terrain</p>
      </div>

      <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        <div className="flex h-full">

          {/* Liste gauche : Équipes, triées par dernier message reçu/envoyé */}
          <div className="w-72 border-r border-dark-200 dark:border-dark-700 flex flex-col">
            <div className="p-4 border-b border-dark-200 dark:border-dark-700">
              <h3 className="section-title">Conversations</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {equipesAvecMeta.map(({ contact: eq, eqId, lastMsg, unreadCount }) => (
                <button
                  key={`eq-card-${eqId}`}
                  onClick={() => setSelectedEquipe(eqId)}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${selectedEquipe === eqId ? 'bg-smart-50 dark:bg-smart-900/20 border-l-2 border-smart-500' : 'hover:bg-dark-50 dark:hover:bg-dark-800/50'}`}
                >
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{getInitials(eq.nom)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{eq.nom}</p>
                    {lastMsg && <p className="text-xs text-dark-500 dark:text-dark-400 truncate mt-0.5">{lastMsg.contenu}</p>}
                  </div>
                  {/* 🌟 NOUVEAU : badge bleu avec le nombre de messages non lus pour ce contact */}
                  {unreadCount > 0 && (
                    <span className="shrink-0 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              ))}
              {equipes.length === 0 && !loading && (
                <p className="text-sm text-dark-400 p-4">Aucune équipe disponible.</p>
              )}
            </div>
          </div>

          {/* Zone droite : Discussion active */}
          <div className="flex-1 flex flex-col bg-white/50 dark:bg-dark-900/10">
            {selectedEquipe ? (
              <>
                <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex items-center gap-3 bg-white dark:bg-dark-900">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {getInitials(selectedContactObj?.nom || 'E')}
                    </span>
                  </div>
                  <span className="font-semibold text-dark-900 dark:text-white">
                    {selectedContactObj?.nom}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {filteredMessages.map((msg: any) => {
                    const msgId = msg.id || msg._id;
                    const isMe = getExpId(msg) === myUserId;

                    return (
                      <motion.div
                        key={`msg-bubble-${msgId}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${isMe ? 'bg-smart-500 text-white rounded-br-md' : 'bg-dark-100 dark:bg-dark-800 text-dark-800 dark:text-dark-200 rounded-bl-md'}`}>
                          <p className="text-sm whitespace-pre-line">{msg.contenu}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-smart-100' : 'text-dark-400'}`}>
                            {formatDate(msg.createdAt || msg.created_at)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  {filteredMessages.length === 0 && (
                    <div className="h-full flex items-center justify-center text-dark-400">
                      <p className="text-sm">Aucun message avec cette équipe pour le moment.</p>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-dark-200 dark:border-dark-700 flex gap-3 bg-white dark:bg-dark-900">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Écrire une réponse à l'équipe..."
                    className="input-field flex-1"
                  />
                  <button type="submit" className="btn-primary px-4 py-3" disabled={!input.trim()}>
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-dark-400">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3" />
                  <p>Sélectionnez une équipe pour afficher la discussion</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}