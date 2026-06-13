import api from './axios';
import { Equipe } from '../types';

export const getAll = async (): Promise<Equipe[]> => {
  const res = await api.get('/equipes');
  return res.data;
};

export const create = async (data: Partial<Equipe>): Promise<Equipe> => {
  const res = await api.post('/equipes', data);
  return res.data;
};

export const update = async (id: string, data: Partial<Equipe>): Promise<Equipe> => {
  const res = await api.put(`/equipes/${id}`, data);
  return res.data;
};

export const remove = async (id: string): Promise<void> => {
  await api.delete(`/equipes/${id}`);
};
