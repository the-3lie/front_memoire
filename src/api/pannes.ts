import api from './axios';
import { Panne } from '../types';

export const getAll = async (): Promise<Panne[]> => {
  const res = await api.get('/pannes');
  return res.data;
};

export const create = async (data: Partial<Panne>): Promise<Panne> => {
  const res = await api.post('/pannes', data);
  return res.data;
};
