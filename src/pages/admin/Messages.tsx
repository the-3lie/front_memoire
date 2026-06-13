import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Message, Equipe } from '../../types';
import * as messageApi from '../../api/messages';
import * as equipeApi from '../../api/equipes';
import { onEvent, offEvent } from '../../socket';
import { formatDate, getInitials } from '../../utils/helpers';

export default function AdminMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [selectedEquipe, setSelectedEquipe] = useState<string>('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ID de l'administrateur connecté (Toi)
  const myUserId = String(user?.id || (user as any)?._id || '');

  const fetchMessages = async () => {
    try {
      const data = await messageApi.getAll();
      console.log("📥 [Admin Chat] Tous les messages reçus de la BDD :", data);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur lors de la récupération des messages :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchEquipes = async () => {
      try {
        const data = await equipeApi.getAll();
        const listeEquipes = Array.isArray(data) ? data : [];
        setEquipes(listeEquipes);
        
        if (listeEquipes.length > 0) {
          const firstId = listeEquipes[0].id || (listeEquipes[0] as any)?._id;
          setSelectedEquipe(String(firstId));
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des équipes :", err);
      }
    };
    fetchEquipes();
    fetchMessages();
  }, []);

  useEffect(() => {
    const handler = () => { fetchMessages(); };
    onEvent('new_message', handler);
    return () => { offEvent('new_message', handler); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedEquipe]);

  // 🌟 ROBUSTE : Filtrage des messages calé sur les types bruts et objets imbriqués de MySQL
  const filteredMessages = messages.filter((m: any) => {
    const expediteurId = String(m.expediteur_id || m.expediteur?.id || m.expediteur?._id || m.expediteur || '');
    const destinataireId = String(m.destinataire_id || m.destinataire?.id || m.destinataire?._id || m.destinataire || '');
    
    const currentSelected = String(selectedEquipe);
    const currentMe = String(myUserId);

    return (
      (expediteurId === currentMe && destinataireId === currentSelected) || 
      (expediteurId === currentSelected && destinataireId === currentMe)
    );
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedEquipe || !myUserId) return;

    try {
      await messageApi.create({
        contenu: input.trim(),
        expediteur_id: parseInt(myUserId),
        destinataire_id: parseInt(selectedEquipe)
      } as any);

      setInput('');
      await fetchMessages(); // Recharger les messages pour mise à jour immédiate
    } catch (err) {
      console.error("Erreur d'envoi du message :", err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Messagerie Administrateur</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Canal de communication direct avec le terrain</p>
      </div>

      <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        <div className="flex h-full">
          
          {/* Liste gauche : Équipes */}
          <div className="w-72 border-r border-dark-200 dark:border-dark-700 flex flex-col">
            <div className="p-4 border-b border-dark-200 dark:border-dark-700">
              <h3 className="section-title">Conversations</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {equipes.map((eq) => {
                const eqId = String(eq.id || (eq as any)?._id);
                
                // Aperçu du dernier message sous le nom de l'équipe
                const lastMsg = messages
                  .filter((m: any) => {
                    const expId = String(m.expediteur_id || m.expediteur?.id || m.expediteur?._id || m.expediteur);
                    const destId = String(m.destinataire_id || m.destinataire?.id || m.destinataire?._id || m.destinataire);
                    return (expId === myUserId && destId === eqId) || (expId === eqId && destId === myUserId);
                  })
                  .sort((a, b) => new Date(b.createdAt || (b as any).created_at).getTime() - new Date(a.createdAt || (a as any).created_at).getTime())[0];

                return (
                  <button
                    key={`eq-card-${eqId}`}
                    onClick={() => setSelectedEquipe(eqId)}
                    className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${String(selectedEquipe) === eqId ? 'bg-smart-50 dark:bg-smart-900/20 border-l-2 border-smart-500' : 'hover:bg-dark-50 dark:hover:bg-dark-800/50'}`}
                  >
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{getInitials(eq.nom)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{eq.nom}</p>
                      {lastMsg && <p className="text-xs text-dark-500 dark:text-dark-400 truncate mt-0.5">{lastMsg.contenu}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Zone droite : Discussion active */}
          <div className="flex-1 flex flex-col bg-white/50 dark:bg-dark-900/10">
            {selectedEquipe ? (
              <>
                <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex items-center gap-3 bg-white dark:bg-dark-900">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {getInitials(equipes.find((e) => String(e.id || (e as any)?._id) === String(selectedEquipe))?.nom || 'E')}
                    </span>
                  </div>
                  <span className="font-semibold text-dark-900 dark:text-white">
                    {equipes.find((e) => String(e.id || (e as any)?._id) === String(selectedEquipe))?.nom}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {filteredMessages.map((msg: any) => {
                    const msgId = msg.id || msg._id || Math.random().toString();
                    
                    // 🌟 CONFIGURÉ CORRECTEMENT : Plus de fonction fléchée perdue dans le String()
                    const expId = String(msg.expediteur_id || msg.expediteur?.id || msg.expediteur?._id || msg.expediteur || '');
                    const isMe = expId === myUserId;

                    return (
                      <motion.div
                        key={`msg-bubble-${msgId}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${isMe ? 'bg-smart-500 text-white rounded-br-md' : 'bg-dark-100 dark:bg-dark-800 text-dark-800 dark:text-dark-200 rounded-bl-md'}`}>
                          <p className="text-sm">{msg.contenu}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-smart-100' : 'text-dark-400'}`}>
                            {formatDate(msg.createdAt || msg.created_at)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
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