import api from './axios';
import { Intervention } from '../types';

export const getAll = async (): Promise<Intervention[]> => {
  const res = await api.get('/interventions');
  return res.data;
};

export const create = async (data: Partial<Intervention>): Promise<Intervention> => {
  const res = await api.post('/interventions', data);
  return res.data;
};

// 🌟 CORRECTION : 'id' accepte maintenant string ou number pour coller à MySQL
export const update = async (id: string | number, data: Partial<Intervention>): Promise<Intervention> => {
  const res = await api.put(`/interventions/${id}`, data);
  return res.data;
};

// 🌟 CORRECTION : Même chose pour la suppression au cas où
export const remove = async (id: string | number): Promise<void> => {
  await api.delete(`/interventions/${id}`);
};