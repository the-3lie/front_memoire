import api from './axios';
import { Poubelle } from '../types';

// 1. Récupérer toutes les poubelles actives (pour la carte de l'Admin)
export const getAll = async (): Promise<Poubelle[]> => {
  const res = await api.get('/poubelles');
  return res.data;
};

// 2. 🌟 NOUVEAU : Récupérer les badges RFID en attente de configuration (pour ton formulaire Équipe)
export const getEnAttente = async (): Promise<Poubelle[]> => {
  const res = await api.get('/poubelles/en-attente');
  return res.data;
};

// 3. Activer / Enregistrer une poubelle via son ID (Soumission du formulaire)
export const update = async (id: string, data: Partial<Poubelle>): Promise<Poubelle> => {
  // Aligné sur ton : router.put('/:id', poubelleController.updatePoubelleById)
  const res = await api.put(`/poubelles/${id}`, data);
  return res.data;
};

// 4. Supprimer une poubelle
export const remove = async (id: string): Promise<void> => {
  await api.delete(`/poubelles/${id}`);
};

// =========================================================================
// 💡 ROUTES ARDUINO / ESP32 (Optionnelles dans le Front, mais doivent être propres)
// =========================================================================

// Envoi du scan initial (POST)
export const registerRFID = async (data: { rfid_uid: string }): Promise<any> => {
  const res = await api.post('/poubelles/scan-initial', data);
  return res.data;
};

// Mise à jour du niveau toutes les 15 minutes (PUT)
export const updateNiveau = async (data: { rfid_uid: string; niveau: number }): Promise<any> => {
  const res = await api.put('/poubelles/update-niveau', data);
  return res.data;
};