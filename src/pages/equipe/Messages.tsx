import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Message } from '../../types';
import * as messageApi from '../../api/messages';
import { onEvent, offEvent } from '../../socket';
import { formatDate } from '../../utils/helpers';

export default function EquipeMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ID du technicien de l'équipe connecté (normalisé en String)
  const myUserId = useMemo(() => {
    return String(user?.id || (user as any)?._id || '');
  }, [user]);

  const fetchMessages = async () => {
    try {
      const data = await messageApi.getAll();
      console.log("📥 [Équipe Chat] Messages bruts reçus du serveur :", data);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur lors de la récupération des messages :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (myUserId) {
      fetchMessages(); 
    }
  }, [myUserId]);

  useEffect(() => {
    const handler = () => { fetchMessages(); };
    onEvent('new_message', handler);
    return () => { offEvent('new_message', handler); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !myUserId) return;

    try {
      const donneesMessage = {
        contenu: input.trim(),
        expediteur_id: parseInt(myUserId),
        destinataire_id: null // Le backend intercepte le null et injecte l'ID de l'admin automatiquement
      };

      await messageApi.create(donneesMessage as any);
      setInput(''); 
      await fetchMessages(); 
    } catch (err) {
      console.error("Erreur lors de l'envoi du message :", err);
    }
  };

  // Filtrage réactif : isole tous les messages impliquant ce technicien
  const adminMessages = useMemo(() => {
    const currentMe = String(myUserId);

    return messages.filter((m: any) => {
      const expId = String(m.expediteur_id || m.expediteur?.id || m.expediteur?._id || m.expediteur || '');
      const destId = String(m.destinataire_id || m.destinataire?.id || m.destinataire?._id || m.destinataire || '');

      return expId === currentMe || destId === currentMe;
    });
  }, [messages, myUserId]);

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
        <p className="text-dark-500 dark:text-dark-400 mt-1">Communiquez en temps réel avec l'administrateur</p>
      </div>

      <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        <div className="flex flex-col h-full">
          
          {/* En-tête de la discussion */}
          <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex items-center gap-3 bg-white dark:bg-dark-900">
            <div className="w-8 h-8 bg-smart-500/10 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-smart-600 dark:text-smart-400">A</span>
            </div>
            <span className="font-semibold text-dark-900 dark:text-white">Administrateur</span>
          </div>
          
          {/* Zone d'affichage des messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 relative bg-white/50 dark:bg-dark-900/10">
            {adminMessages.map((msg: any, i) => {
              const expId = String(msg.expediteur_id || msg.expediteur?.id || msg.expediteur?._id || msg.expediteur || '');
              const isMe = expId === String(myUserId);

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
            
            {/* Écran de secours si aucun historique n'existe */}
            {adminMessages.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-dark-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-60" />
                  <p className="text-sm">Aucun message. Ouvrez le dialogue avec l'administration.</p>
                </div>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>
          
          {/* Formulaire d'envoi */}
          <form onSubmit={handleSend} className="p-4 border-t border-dark-200 dark:border-dark-700 flex gap-3 bg-white dark:bg-dark-900">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrire un message à l'attention de l'admin..."
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

        </div>
      </div>
    </div>
  );
}