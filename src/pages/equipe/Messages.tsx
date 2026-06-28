import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Message } from '../../types';
import * as messageApi from '../../api/messages';
import { Contact } from '../../api/messages';
import { onEvent, offEvent } from '../../socket';
import { formatDate, getInitials } from '../../utils/helpers';

export default function EquipeMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ID du technicien de l'équipe connecté (normalisé en String)
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

  const fetchContacts = async () => {
    if (!myUserId) return;
    try {
      const data = await messageApi.getContacts(myUserId);
      const liste = Array.isArray(data) ? data : [];
      setContacts(liste);
      if (liste.length > 0 && !selectedContact) {
        const admin = liste.find((c) => (c.role || '').toLowerCase() === 'admin');
        setSelectedContact(String((admin || liste[0]).id));
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des contacts :", err);
    }
  };

  useEffect(() => {
    if (myUserId) {
      fetchContacts();
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
  }, [messages, selectedContact]);

  const getExpId = (m: any) => String(m.expediteur_id ?? m.expediteur?.id ?? m.expediteur?._id ?? m.expediteur ?? '');
  const getDestId = (m: any) => String(m.destinataire_id ?? m.destinataire?.id ?? m.destinataire?._id ?? m.destinataire ?? '');
  const getTime = (m: any) => new Date(m.createdAt || m.created_at).getTime();

  // 🌟 NOUVEAU : marque les messages de cette conversation comme lus dès qu'on l'ouvre.
  // Mise à jour locale immédiate (en plus de l'appel API) pour que le badge par
  // contact disparaisse instantanément, sans attendre le prochain fetchMessages.
  useEffect(() => {
    if (selectedContact && myUserId) {
      messageApi.markAsRead(myUserId, selectedContact).catch((err) => {
        console.error('Erreur lors du marquage comme lu :', err);
      });
      setMessages((prev) =>
        prev.map((m: any) =>
          getExpId(m) === selectedContact && getDestId(m) === myUserId
            ? { ...m, lu: true }
            : m
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContact, myUserId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !myUserId || !selectedContact) return;

    try {
      await messageApi.create({
        contenu: input.trim(),
        expediteur_id: parseInt(myUserId),
        destinataire_id: parseInt(selectedContact)
      });

      setInput('');
      await fetchMessages();
    } catch (err) {
      console.error("Erreur lors de l'envoi du message :", err);
    }
  };

  const filteredMessages = useMemo(() => {
    if (!selectedContact) return [];
    return messages.filter((m: any) => {
      const expId = getExpId(m);
      const destId = getDestId(m);
      return (
        (expId === myUserId && destId === selectedContact) ||
        (expId === selectedContact && destId === myUserId)
      );
    });
  }, [messages, selectedContact, myUserId]);

  // 🌟 NOUVEAU : pour chaque contact (admin ou équipe), on calcule le dernier
  // message et le nombre de non-lus, puis on trie par date du dernier message
  // (le plus récent en haut).
  const contactsAvecMeta = useMemo(() => {
    return contacts
      .map((contact) => {
        const contactId = String(contact.id);
        const conv = messages.filter((m: any) => {
          const expId = getExpId(m);
          const destId = getDestId(m);
          return (expId === myUserId && destId === contactId) || (expId === contactId && destId === myUserId);
        });

        const lastMsg = conv.slice().sort((a, b) => getTime(b) - getTime(a))[0];
        const unreadCount = conv.filter((m: any) => getExpId(m) === contactId && getDestId(m) === myUserId && !m.lu).length;

        return { contact, contactId, lastMsg, unreadCount, isAdmin: (contact.role || '').toLowerCase() === 'admin' };
      })
      .sort((a, b) => {
        if (!a.lastMsg && !b.lastMsg) return 0;
        if (!a.lastMsg) return 1;
        if (!b.lastMsg) return -1;
        return getTime(b.lastMsg) - getTime(a.lastMsg);
      });
  }, [contacts, messages, myUserId]);

  const selectedContactObj = contacts.find((c) => String(c.id) === selectedContact);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-dark-200 dark:border-dark-600 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Messages</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Communiquez avec l'administrateur et les autres équipes</p>
      </div>

      <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        <div className="flex h-full">

          {/* Liste gauche : Admin + autres équipes, triés par dernier message */}
          <div className="w-72 border-r border-dark-200 dark:border-dark-700 flex flex-col">
            <div className="p-4 border-b border-dark-200 dark:border-dark-700">
              <h3 className="section-title">Conversations</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {contactsAvecMeta.map(({ contact, contactId, lastMsg, unreadCount, isAdmin }) => (
                <button
                  key={`contact-${contactId}`}
                  onClick={() => setSelectedContact(contactId)}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${selectedContact === contactId ? 'bg-amber-50 dark:bg-amber-900/20 border-l-2 border-amber-500' : 'hover:bg-dark-50 dark:hover:bg-dark-800/50'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isAdmin ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
                    <span className={`text-sm font-bold ${isAdmin ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      {getInitials(contact.nom)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-900 dark:text-white truncate">
                      {contact.nom}{isAdmin ? ' (Admin)' : ''}
                    </p>
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
              {contacts.length === 0 && (
                <p className="text-sm text-dark-400 p-4">Aucun contact disponible.</p>
              )}
            </div>
          </div>

          {/* Zone droite : Discussion active */}
          <div className="flex-1 flex flex-col bg-white/50 dark:bg-dark-900/10">
            {selectedContact ? (
              <>
                <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex items-center gap-3 bg-white dark:bg-dark-900">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {getInitials(selectedContactObj?.nom || '?')}
                    </span>
                  </div>
                  <span className="font-semibold text-dark-900 dark:text-white">
                    {selectedContactObj?.nom}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
                  {filteredMessages.map((msg: any, i) => {
                    const isMe = getExpId(msg) === myUserId;

                    return (
                      <motion.div
                        key={msg.id || msg._id || `msg-${i}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                          isMe
                            ? 'bg-amber-500 text-white rounded-br-md'
                            : 'bg-dark-100 dark:bg-dark-800 text-dark-800 dark:text-dark-200 rounded-bl-md'
                        }`}>
                          <p className="text-sm whitespace-pre-line">{msg.contenu}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-amber-100' : 'text-dark-400'}`}>
                            {formatDate(msg.createdAt || msg.created_at)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}

                  {filteredMessages.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center text-dark-400">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-60" />
                        <p className="text-sm">Aucun message. Ouvrez le dialogue.</p>
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-dark-200 dark:border-dark-700 flex gap-3 bg-white dark:bg-dark-900">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Écrire à ${selectedContactObj?.nom || ''}...`}
                    className="input-field flex-1"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-3 rounded-xl transition-all flex items-center justify-center shrink-0 active:scale-95 disabled:opacity-40"
                    disabled={!input.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-dark-400">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3" />
                  <p>Sélectionnez une conversation</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}