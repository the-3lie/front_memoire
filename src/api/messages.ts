// 🌟 EXTRAIT À AJOUTER / FUSIONNER dans ton fichier existant src/api/messages.ts
// Je ne connais pas le client HTTP exact que tu utilises (axios ? fetch personnalisé ?),
// donc j'utilise le même pattern qu'on devine de messageApi.getAll() / messageApi.create().
// Adapte l'import "api" ci-dessous à ton instance axios existante si besoin.

import api from './axios'; // 🌟 À ADAPTER : remplace par l'import réel utilisé dans getAll/create
import { Message } from '../types';

export interface Contact {
  id: number;
  nom: string;
  email: string;
  role: string;
}

export const getAll = async (): Promise<Message[]> => {
  const { data } = await api.get('/messages');
  return data;
};

export const create = async (payload: {
  contenu: string;
  expediteur_id: number;
  destinataire_id: number | null;
}) => {
  const { data } = await api.post('/messages', payload);
  return data;
};

// 🌟 NOUVEAU : récupère la liste des contacts disponibles (admin + autres équipes,
// ou toutes les équipes si on est l'admin) pour construire la colonne de gauche.
export const getContacts = async (userId: string | number): Promise<Contact[]> => {
  const { data } = await api.get('/messages/contacts', { params: { userId } });
  return data;
};

// 🌟 NOUVEAU : compte de messages non lus (pour le badge global du menu)
export const getUnreadCount = async (userId: string | number): Promise<number> => {
  const { data } = await api.get('/messages/unread-count', { params: { userId } });
  return data.count;
};

// 🌟 NOUVEAU : marque tous les messages d'une conversation comme lus
export const markAsRead = async (userId: string | number, contactId: string | number) => {
  const { data } = await api.post('/messages/mark-as-read', { userId, contactId });
  return data;
};